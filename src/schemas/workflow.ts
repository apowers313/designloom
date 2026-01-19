/* eslint-disable camelcase -- snake_case matches YAML field names for serialization */
import { z } from "zod";

import {
    DeprecationSchema,
    ImplementationTrackingSchema,
    PrioritySchema,
    SourceSchema,
    VersionMetadataSchema,
} from "./source.js";

/**
 * Workflow ID pattern: W followed by 1-3 digits (e.g., W01, W99, W123)
 */
const WorkflowIdSchema = z
    .string()
    .regex(/^W\d{1,3}$/, "ID must match pattern W01, W99, etc.");

/**
 * Workflow categories
 */
const WorkflowCategorySchema = z.enum([
    "onboarding",
    "analysis",
    "exploration",
    "reporting",
    "collaboration",
    "administration",
]);

/**
 * Workflow status - tracks the lifecycle from design to implementation
 */
const WorkflowStatusSchema = z.enum([
    "draft",        // Still defining the workflow
    "designed",     // Design complete, ready for validation
    "validated",    // Tested with users, design approved
    "implementing", // Currently being implemented
    "implemented",  // Code complete
    "deprecated",   // No longer used
]);

/**
 * Success criterion with metric and target
 */
const SuccessCriterionSchema = z.object({
    metric: z.string(),
    target: z.string(),
});

/**
 * Starting state for a workflow
 */
const StartingStateSchema = z.object({
    data_type: z.string().optional(),
    node_count: z.string().optional(),
    edge_density: z.string().optional(),
    user_expertise: z.string().optional(),
});

/**
 * Workflow schema for workflow-driven design
 */
export const WorkflowSchema = z.object({
    id: WorkflowIdSchema,
    name: z.string().min(1),
    category: WorkflowCategorySchema,
    status: WorkflowStatusSchema.optional().default("draft"),
    priority: PrioritySchema.optional(),
    validated: z.boolean().optional().default(false), // Kept for backward compatibility
    personas: z.array(z.string()).optional().default([]),
    requires_capabilities: z.array(z.string()).optional().default([]),
    suggested_components: z.array(z.string()).optional().default([]),
    starting_state: StartingStateSchema.optional(),
    goal: z.string().min(1),
    success_criteria: z.array(SuccessCriterionSchema).optional().default([]),
    sources: z.array(SourceSchema).optional().default([]),
    deprecation: DeprecationSchema.optional(),
}).merge(ImplementationTrackingSchema).merge(VersionMetadataSchema);

/**
 * Workflow type derived from schema
 */
export type Workflow = z.infer<typeof WorkflowSchema>;

/**
 * Workflow summary for list operations (lighter weight)
 */
export interface WorkflowSummary {
    id: string;
    name: string;
    category: string;
    status: string;
    priority?: string;
    validated: boolean;
}

/**
 * Resolved references for a workflow
 */
export interface WorkflowResolved {
    capabilities: Array<{ id: string; name: string; status?: string }>;
    personas: Array<{ id: string; name: string }>;
    components: Array<{ id: string; name: string }>;
}

/**
 * Workflow with resolved references
 */
export type WorkflowWithResolved = Workflow & { _resolved: WorkflowResolved };

/**
 * Workflow filters for list operations
 */
export interface WorkflowFilters {
    category?: string;
    status?: string;
    priority?: string;
    validated?: boolean;
    persona?: string;
    capability?: string;
}
