/* eslint-disable camelcase -- snake_case matches YAML field names for serialization */
import { z } from "zod";

/**
 * Capability ID pattern: kebab-case (e.g., data-import, node-filtering)
 */
const CapabilityIdSchema = z
    .string()
    .regex(/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/, "ID must match pattern kebab-case (e.g., data-import)");

/**
 * Capability categories
 */
const CapabilityCategorySchema = z.enum([
    "data",
    "visualization",
    "analysis",
    "interaction",
    "export",
    "collaboration",
    "performance",
]);

/**
 * Capability status
 */
const CapabilityStatusSchema = z.enum([
    "planned",
    "in-progress",
    "implemented",
    "deprecated",
]);

/**
 * Capability schema for design management
 */
export const CapabilitySchema = z.object({
    id: CapabilityIdSchema,
    name: z.string().min(1),
    category: CapabilityCategorySchema,
    description: z.string().min(1),
    status: CapabilityStatusSchema.optional().default("planned"),
    algorithms: z.array(z.string()).optional().default([]),
    used_by_workflows: z.array(z.string()).optional().default([]),
    implemented_by_components: z.array(z.string()).optional().default([]),
    requirements: z.array(z.string()).optional().default([]),
});

/**
 * Capability type derived from schema
 */
export type Capability = z.infer<typeof CapabilitySchema>;

/**
 * Capability summary for list operations
 */
export interface CapabilitySummary {
    id: string;
    name: string;
    category: string;
    status: string;
}

/**
 * Resolved references for a capability
 */
export interface CapabilityResolved {
    workflows: Array<{ id: string; name: string }>;
    components: Array<{ id: string; name: string }>;
}

/**
 * Capability with resolved references
 */
export type CapabilityWithResolved = Capability & { _resolved: CapabilityResolved };

/**
 * Capability filters for list operations
 */
export interface CapabilityFilters {
    category?: string;
    status?: string;
    workflow?: string;
}
