/* eslint-disable camelcase -- snake_case matches YAML field names for serialization */
import { z } from "zod";

/**
 * =============================================================================
 * VERSION METADATA SCHEMA
 * =============================================================================
 * All entities have version tracking metadata that is automatically managed
 * by the store. These fields are required on all entities.
 */

/**
 * ISO 8601 date string pattern (YYYY-MM-DD or full datetime)
 */
const IsoDateSchema = z.string().regex(
    /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})?)?$/,
    "Date must be ISO 8601 format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ)"
);

/**
 * Semantic version pattern (major.minor.patch)
 */
const SemanticVersionSchema = z.string().regex(
    /^\d+\.\d+\.\d+$/,
    "Version must be semantic version format (e.g., 1.0.0)"
);

/**
 * Version metadata schema - added to all entities
 * These fields are automatically managed by the store:
 * - created_at: Set once when entity is created
 * - updated_at: Updated on every save
 * - version: Incremented on every update (patch version)
 *
 * Fields are optional for backward compatibility with existing files that
 * don't have version metadata. The store will auto-populate these on write.
 */
export const VersionMetadataSchema = z.object({
    version: SemanticVersionSchema.describe(
        "Semantic version (major.minor.patch). Auto-managed by store."
    ).optional(),
    schema_version: SemanticVersionSchema.describe(
        "Schema definition version used when creating/updating this entity. Auto-managed by store."
    ).optional(),
    created_at: IsoDateSchema.describe(
        "ISO 8601 timestamp when entity was created. Auto-managed by store."
    ).optional(),
    updated_at: IsoDateSchema.describe(
        "ISO 8601 timestamp when entity was last updated. Auto-managed by store."
    ).optional(),
});

/**
 * =============================================================================
 * PRIORITY SCHEMA
 * =============================================================================
 * Priority levels for implementation ordering.
 * - P0: Critical / Golden Path - must-have for MVP
 * - P1: Important - should-have, implement after P0
 * - P2: Nice-to-have - could defer if needed
 */
export const PrioritySchema = z.enum(["P0", "P1", "P2"]).describe(
    "Implementation priority: P0 (critical), P1 (important), P2 (nice-to-have)"
);

/**
 * Priority type
 */
export type Priority = z.infer<typeof PrioritySchema>;

/**
 * =============================================================================
 * IMPLEMENTATION TRACKING SCHEMA
 * =============================================================================
 * Fields for tracking when design artifacts are implemented in code.
 * Separate from updated_at (which tracks design doc changes).
 */
export const ImplementationTrackingSchema = z.object({
    implemented_at: IsoDateSchema.describe(
        "ISO 8601 timestamp when this was implemented in code (set manually)"
    ).optional(),
    notes: z.string().describe(
        "Implementation notes, design rationale, or other context"
    ).optional(),
});

/**
 * Implementation tracking type
 */
export type ImplementationTracking = z.infer<typeof ImplementationTrackingSchema>;

/**
 * =============================================================================
 * DEPRECATION SCHEMA
 * =============================================================================
 * Detailed deprecation information for change management.
 */
export const DeprecationSchema = z.object({
    deprecated_at: IsoDateSchema.describe(
        "ISO 8601 timestamp when this was deprecated"
    ),
    replaced_by: z.string().optional().describe(
        "ID of the entity that replaces this one"
    ),
    reason: z.string().optional().describe(
        "Why this was deprecated"
    ),
    migration_guide: z.string().optional().describe(
        "Instructions for migrating to the replacement"
    ),
});

/**
 * Deprecation type
 */
export type Deprecation = z.infer<typeof DeprecationSchema>;

/**
 * Version metadata type
 */
export type VersionMetadata = z.infer<typeof VersionMetadataSchema>;

/**
 * =============================================================================
 * SOURCE SCHEMA
 * =============================================================================
 */

/**
 * Bibliographic information for a source
 */
const BibliographySchema = z.object({
    author: z.string().optional(),
    date: z.string().optional(),
    publisher: z.string().optional(),
    version: z.string().optional(),
});

/**
 * Source reference schema for tracking where information was found
 * Allows LLMs to go back to source material for more details or clarifications
 */
export const SourceSchema = z.object({
    title: z.string().min(1),
    url: z.string().url(),
    summary: z.string().optional(),
    bibliography: BibliographySchema.optional(),
});

/**
 * Source type derived from schema
 */
export type Source = z.infer<typeof SourceSchema>;

/**
 * Bibliography type derived from schema
 */
export type Bibliography = z.infer<typeof BibliographySchema>;
