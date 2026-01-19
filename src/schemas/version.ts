 

/**
 * =============================================================================
 * SCHEMA VERSIONING
 * =============================================================================
 * Track which schema version was used to create entity data, detect mismatches,
 * and warn users when entities may need migration.
 *
 * Key distinction:
 * - `version` field: Tracks entity content changes (1.0.0 → 1.0.1 on each update)
 * - `schema_version` field: Tracks the schema definition version used to validate the entity
 */

/**
 * Current schema version for all entity types.
 * All 7 entity types evolve together for a simpler mental model.
 *
 * Semantic versioning:
 * - Major: Breaking changes (removed fields, type changes)
 * - Minor: New optional fields, non-breaking additions
 * - Patch: Documentation only, no schema changes
 */
export const CURRENT_SCHEMA_VERSION = "1.0.0";

/**
 * Minimum schema version that is fully compatible with current code.
 * Entities with schema_version >= this value don't need migration.
 */
export const MINIMUM_COMPATIBLE_VERSION = "1.0.0";

/**
 * Severity levels for schema version warnings.
 */
export type VersionWarningSeverity = "info" | "warning" | "error";

/**
 * Warning generated when an entity's schema version doesn't match current.
 */
export interface SchemaVersionWarning {
    /** Entity type (workflow, capability, etc.) */
    entityType: string;
    /** Entity ID */
    entityId: string;
    /** Schema version stored in the entity (or "0.0.0" if missing) */
    storedVersion: string;
    /** Current schema version */
    currentVersion: string;
    /** Severity of the mismatch */
    severity: VersionWarningSeverity;
    /** Human-readable message */
    message: string;
}

/**
 * Result of comparing a stored schema version to the current version.
 */
export interface VersionCompareResult {
    /** Whether the stored version is compatible with current */
    isCompatible: boolean;
    /** Whether migration is needed */
    needsMigration: boolean;
    /** Whether the stored version is newer than current (shouldn't happen normally) */
    isNewer: boolean;
    /** Suggested severity for warnings */
    severity: VersionWarningSeverity;
    /** Human-readable description of the comparison */
    message: string;
}

/**
 * Compare two semantic version strings.
 * @param a - First version string (e.g., "1.2.3")
 * @param b - Second version string (e.g., "1.2.4")
 * @returns Negative if a < b, zero if a === b, positive if a > b
 */
export function compareVersions(a: string, b: string): number {
    const partsA = parseVersion(a);
    const partsB = parseVersion(b);

    // Compare major
    if (partsA.major !== partsB.major) {
        return partsA.major - partsB.major;
    }
    // Compare minor
    if (partsA.minor !== partsB.minor) {
        return partsA.minor - partsB.minor;
    }
    // Compare patch
    return partsA.patch - partsB.patch;
}

/**
 * Parse a semantic version string into components.
 * Returns {0, 0, 0} for invalid versions.
 * @param version - Semantic version string to parse (e.g., "1.2.3")
 * @returns Object with major, minor, and patch version numbers
 */
function parseVersion(version: string): { major: number; minor: number; patch: number } {
    if (!version || typeof version !== "string") {
        return { major: 0, minor: 0, patch: 0 };
    }

    const parts = version.split(".").map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) {
        return { major: 0, minor: 0, patch: 0 };
    }

    return { major: parts[0], minor: parts[1], patch: parts[2] };
}

/**
 * Check a stored schema version against the current version.
 * @param storedVersion - The schema_version from the entity, or undefined if missing
 * @returns Comparison result with compatibility info and suggested severity
 */
export function checkSchemaVersion(storedVersion: string | undefined): VersionCompareResult {
    // Treat missing schema_version as "0.0.0" (legacy file)
    const version = storedVersion ?? "0.0.0";

    const comparison = compareVersions(version, CURRENT_SCHEMA_VERSION);
    const minComparison = compareVersions(version, MINIMUM_COMPATIBLE_VERSION);

    // Entity is newer than current (shouldn't happen in normal usage)
    if (comparison > 0) {
        return {
            isCompatible: false,
            needsMigration: false,
            isNewer: true,
            severity: "error",
            message: `Schema version ${version} is newer than current ${CURRENT_SCHEMA_VERSION}. ` +
                     `This entity may have been created with a newer version of designloom.`,
        };
    }

    // Entity matches current version exactly
    if (comparison === 0) {
        return {
            isCompatible: true,
            needsMigration: false,
            isNewer: false,
            severity: "info",
            message: `Schema version ${version} matches current version.`,
        };
    }

    // Entity is older - check if it's compatible
    if (minComparison >= 0) {
        // Older but still compatible (only patch/minor differences within compatible range)
        return {
            isCompatible: true,
            needsMigration: false,
            isNewer: false,
            severity: "info",
            message: `Schema version ${version} is older than current ${CURRENT_SCHEMA_VERSION} ` +
                     `but is still compatible.`,
        };
    }

    // Special case: Missing schema_version (legacy file treated as 0.0.0)
    // This is common for pre-existing files and should be a warning, not an error
    if (version === "0.0.0") {
        return {
            isCompatible: true,
            needsMigration: true,
            isNewer: false,
            severity: "warning",
            message: `Entity has no schema_version (legacy file). Consider re-saving to add version tracking.`,
        };
    }

    // Older and incompatible - may need migration
    const storedParts = parseVersion(version);
    const currentParts = parseVersion(CURRENT_SCHEMA_VERSION);

    if (storedParts.major < currentParts.major) {
        // Major version difference - likely breaking changes
        return {
            isCompatible: false,
            needsMigration: true,
            isNewer: false,
            severity: "error",
            message: `Schema version ${version} has a major version difference from current ` +
                     `${CURRENT_SCHEMA_VERSION}. Migration may be required.`,
        };
    }

    // Minor version difference
    return {
        isCompatible: true,
        needsMigration: true,
        isNewer: false,
        severity: "warning",
        message: `Schema version ${version} is older than current ${CURRENT_SCHEMA_VERSION}. ` +
              `Entity may benefit from migration.`,
    };
}

/**
 * Create a schema version warning for an entity.
 * @param entityType - Type of entity (workflow, capability, etc.)
 * @param entityId - Entity ID
 * @param storedVersion - Schema version from the entity, or undefined if missing
 * @returns Warning object, or null if no warning needed
 */
export function createSchemaWarning(
    entityType: string,
    entityId: string,
    storedVersion: string | undefined
): SchemaVersionWarning | null {
    const result = checkSchemaVersion(storedVersion);

    // No warning needed if compatible and not needing migration
    if (result.isCompatible && !result.needsMigration) {
        return null;
    }

    return {
        entityType,
        entityId,
        storedVersion: storedVersion ?? "0.0.0",
        currentVersion: CURRENT_SCHEMA_VERSION,
        severity: result.severity,
        message: result.message,
    };
}
