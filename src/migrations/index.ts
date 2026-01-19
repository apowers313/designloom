/**
 * =============================================================================
 * MIGRATION INFRASTRUCTURE
 * =============================================================================
 * Framework for migrating entities between schema versions.
 * Migrations are registered and applied in order when upgrading entities.
 */

import { compareVersions } from "../schemas/version.js";
import { migration as v1AddSchemaVersion } from "./v1-add-schema-version.js";

/**
 * Entity types that can be migrated.
 */
export type MigratableEntityType = "workflow" | "capability" | "persona" | "component" | "tokens" | "view" | "interaction";

/**
 * A migration that transforms entity data from one schema version to another.
 */
export interface Migration {
    /** Unique identifier for this migration (e.g., "001-add-schema-version") */
    id: string;
    /** Schema version this migration upgrades from */
    fromVersion: string;
    /** Schema version this migration upgrades to */
    toVersion: string;
    /** Entity types this migration applies to, or "all" for all types */
    entityTypes: MigratableEntityType[] | "all";
    /** Human-readable description of what this migration does */
    description: string;
    /** Transform function that modifies entity data */
    migrate: (data: Record<string, unknown>, entityType: MigratableEntityType) => Record<string, unknown>;
}

/**
 * Registry of all migrations, sorted by version order.
 */
const migrations: Migration[] = [];

/**
 * Register a migration to be applied during upgrades.
 * Migrations are automatically sorted by version order.
 * @param migration - Migration to register
 */
export function registerMigration(migration: Migration): void {
    migrations.push(migration);
    // Sort by fromVersion to ensure migrations run in order
    migrations.sort((a, b) => compareVersions(a.fromVersion, b.fromVersion));
}

/**
 * Get all registered migrations.
 * @returns Array of registered migrations
 */
export function getMigrations(): Migration[] {
    return [...migrations];
}

/**
 * Clear all registered migrations.
 * Primarily for testing purposes.
 */
export function clearMigrations(): void {
    migrations.length = 0;
}

/**
 * Get migrations needed to upgrade from one version to another.
 * @param fromVersion - Starting schema version
 * @param toVersion - Target schema version
 * @param entityType - Type of entity being migrated
 * @returns Array of migrations to apply in order
 */
export function getMigrationsForUpgrade(
    fromVersion: string,
    toVersion: string,
    entityType: MigratableEntityType
): Migration[] {
    // No upgrade needed if already at target version or newer
    if (compareVersions(fromVersion, toVersion) >= 0) {
        return [];
    }

    return migrations.filter(m => {
        // Check version range: fromVersion < migration.fromVersion <= migration.toVersion <= toVersion
        const startsAfterFrom = compareVersions(m.fromVersion, fromVersion) >= 0;
        const endsAtOrBeforeTarget = compareVersions(m.toVersion, toVersion) <= 0;

        // Check entity type applicability
        const appliesToType = m.entityTypes === "all" || m.entityTypes.includes(entityType);

        return startsAfterFrom && endsAtOrBeforeTarget && appliesToType;
    });
}

/**
 * Apply all necessary migrations to upgrade an entity's data.
 * @param data - Entity data to migrate
 * @param fromVersion - Current schema version of the entity
 * @param toVersion - Target schema version
 * @param entityType - Type of entity being migrated
 * @returns Migrated entity data
 */
export function migrateEntity(
    data: Record<string, unknown>,
    fromVersion: string,
    toVersion: string,
    entityType: MigratableEntityType
): Record<string, unknown> {
    const applicableMigrations = getMigrationsForUpgrade(fromVersion, toVersion, entityType);

    let result = { ...data };
    for (const migration of applicableMigrations) {
        result = migration.migrate(result, entityType);
    }

    return result;
}

/**
 * Result of a migration operation.
 */
export interface MigrationResult {
    /** Whether migration was successful */
    success: boolean;
    /** Number of migrations applied */
    migrationsApplied: number;
    /** IDs of migrations that were applied */
    migrationIds: string[];
    /** Error message if migration failed */
    error?: string;
}

/**
 * Migrate an entity and return detailed result.
 * @param data - Entity data to migrate
 * @param fromVersion - Current schema version of the entity
 * @param toVersion - Target schema version
 * @param entityType - Type of entity being migrated
 * @returns Migration result with details
 */
export function migrateEntityWithResult(
    data: Record<string, unknown>,
    fromVersion: string,
    toVersion: string,
    entityType: MigratableEntityType
): { data: Record<string, unknown>; result: MigrationResult } {
    const applicableMigrations = getMigrationsForUpgrade(fromVersion, toVersion, entityType);

    if (applicableMigrations.length === 0) {
        return {
            data,
            result: {
                success: true,
                migrationsApplied: 0,
                migrationIds: [],
            },
        };
    }

    try {
        let result = { ...data };
        const appliedIds: string[] = [];

        for (const migration of applicableMigrations) {
            result = migration.migrate(result, entityType);
            appliedIds.push(migration.id);
        }

        return {
            data: result,
            result: {
                success: true,
                migrationsApplied: appliedIds.length,
                migrationIds: appliedIds,
            },
        };
    } catch (err) {
        return {
            data,
            result: {
                success: false,
                migrationsApplied: 0,
                migrationIds: [],
                error: err instanceof Error ? err.message : String(err),
            },
        };
    }
}

// =============================================================================
// REGISTER MIGRATIONS
// =============================================================================
// Migrations are registered in order. Each migration file exports a `migration`
// object that is imported and registered here.

registerMigration(v1AddSchemaVersion);
