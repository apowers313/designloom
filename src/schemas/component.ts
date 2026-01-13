/* eslint-disable camelcase -- snake_case matches YAML field names for serialization */
import { z } from "zod";

/**
 * Component ID pattern: kebab-case (e.g., data-import-dialog, progress-bar)
 */
const ComponentIdSchema = z
    .string()
    .regex(/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/, "ID must match pattern kebab-case (e.g., data-import-dialog)");

/**
 * Component categories
 */
const ComponentCategorySchema = z.enum([
    "dialog",
    "control",
    "display",
    "layout",
    "utility",
    "navigation",
]);

/**
 * Component status
 */
const ComponentStatusSchema = z.enum([
    "planned",
    "in-progress",
    "implemented",
    "deprecated",
]);

/**
 * Component schema for design management
 */
export const ComponentSchema = z.object({
    id: ComponentIdSchema,
    name: z.string().min(1),
    category: ComponentCategorySchema,
    description: z.string().min(1),
    status: ComponentStatusSchema.optional().default("planned"),
    implements_capabilities: z.array(z.string()).optional().default([]),
    used_in_workflows: z.array(z.string()).optional().default([]),
    dependencies: z.array(z.string()).optional().default([]),
    props: z.record(z.string()).optional().default({}),
});

/**
 * Component type derived from schema
 */
export type Component = z.infer<typeof ComponentSchema>;

/**
 * Component summary for list operations
 */
export interface ComponentSummary {
    id: string;
    name: string;
    category: string;
    status: string;
}

/**
 * Resolved references for a component
 */
export interface ComponentResolved {
    capabilities: Array<{ id: string; name: string }>;
    workflows: Array<{ id: string; name: string }>;
    dependents: Array<{ id: string; name: string }>;
}

/**
 * Component with resolved references
 */
export type ComponentWithResolved = Component & { _resolved: ComponentResolved };

/**
 * Component filters for list operations
 */
export interface ComponentFilters {
    category?: string;
    status?: string;
    capability?: string;
}
