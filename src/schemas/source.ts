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
    created_at: IsoDateSchema.describe(
        "ISO 8601 timestamp when entity was created. Auto-managed by store."
    ).optional(),
    updated_at: IsoDateSchema.describe(
        "ISO 8601 timestamp when entity was last updated. Auto-managed by store."
    ).optional(),
});

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
