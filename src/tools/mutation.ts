/* eslint-disable camelcase -- snake_case matches YAML field names for tool inputs */
import type {
    CreateCapabilityInput,
    CreateComponentInput,
    CreatePersonaInput,
    CreateWorkflowInput,
    DesignDocsStore,
    EntityType,
    RelationshipType,
    UpdateCapabilityInput,
    UpdateComponentInput,
    UpdatePersonaInput,
    UpdateWorkflowInput,
} from "../store/yaml-store.js";
import type { ToolDefinition, ToolResult } from "./query.js";

/**
 * Safely convert a value to string if it's a string or number, otherwise return default.
 * @param value - Value to convert
 * @param defaultValue - Default value if conversion fails
 * @returns String value or default
 */
function toStringOrDefault(value: unknown, defaultValue: string = ""): string {
    if (typeof value === "string") {
        return value;
    }
    if (typeof value === "number") {
        return value.toString();
    }
    return defaultValue;
}

/**
 * Get all mutation tool definitions.
 * @returns Array of tool definitions for MCP registration
 */
export function getMutationTools(): ToolDefinition[] {
    return [
        {
            name: "design_create_capability",
            description: "Create a new capability. ID must be kebab-case (e.g., data-import).",
            inputSchema: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        description: "Capability ID in kebab-case (e.g., data-import)",
                    },
                    name: {
                        type: "string",
                        description: "Human-readable name",
                    },
                    category: {
                        type: "string",
                        enum: ["data", "visualization", "analysis", "interaction", "export", "collaboration", "performance"],
                        description: "Capability category",
                    },
                    description: {
                        type: "string",
                        description: "Description of the capability",
                    },
                    status: {
                        type: "string",
                        enum: ["planned", "in-progress", "implemented", "deprecated"],
                        description: "Implementation status (default: planned)",
                    },
                    algorithms: {
                        type: "array",
                        items: { type: "string" },
                        description: "List of algorithm names used by this capability",
                    },
                    requirements: {
                        type: "array",
                        items: { type: "string" },
                        description: "List of requirements for this capability",
                    },
                },
                required: ["id", "name", "category", "description"],
            },
        },
        {
            name: "design_create_persona",
            description: "Create a new persona. ID must be kebab-case (e.g., analyst-alex).",
            inputSchema: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        description: "Persona ID in kebab-case (e.g., analyst-alex)",
                    },
                    name: {
                        type: "string",
                        description: "Human-readable name",
                    },
                    role: {
                        type: "string",
                        description: "Job role or title",
                    },
                    characteristics: {
                        type: "object",
                        properties: {
                            expertise: {
                                type: "string",
                                enum: ["novice", "intermediate", "expert"],
                                description: "Expertise level",
                            },
                            time_pressure: {
                                type: "string",
                                description: "Time pressure level (e.g., high, medium, low)",
                            },
                            graph_literacy: {
                                type: "string",
                                description: "Graph literacy level",
                            },
                            domain_knowledge: {
                                type: "string",
                                description: "Domain knowledge level",
                            },
                        },
                        required: ["expertise"],
                        description: "Persona characteristics",
                    },
                    goals: {
                        type: "array",
                        items: { type: "string" },
                        description: "List of goals for this persona",
                    },
                    frustrations: {
                        type: "array",
                        items: { type: "string" },
                        description: "List of frustrations for this persona",
                    },
                    workflows: {
                        type: "array",
                        items: { type: "string" },
                        description: "List of workflow IDs this persona participates in",
                    },
                },
                required: ["id", "name", "role", "characteristics", "goals"],
            },
        },
        {
            name: "design_create_component",
            description: "Create a new component. ID must be kebab-case (e.g., data-import-dialog). Referenced entities must exist.",
            inputSchema: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        description: "Component ID in kebab-case (e.g., data-import-dialog)",
                    },
                    name: {
                        type: "string",
                        description: "Human-readable name",
                    },
                    category: {
                        type: "string",
                        enum: ["dialog", "control", "display", "layout", "utility", "navigation"],
                        description: "Component category",
                    },
                    description: {
                        type: "string",
                        description: "Description of the component",
                    },
                    status: {
                        type: "string",
                        enum: ["planned", "in-progress", "implemented", "deprecated"],
                        description: "Implementation status (default: planned)",
                    },
                    implements_capabilities: {
                        type: "array",
                        items: { type: "string" },
                        description: "List of capability IDs this component implements",
                    },
                    used_in_workflows: {
                        type: "array",
                        items: { type: "string" },
                        description: "List of workflow IDs this component is used in",
                    },
                    dependencies: {
                        type: "array",
                        items: { type: "string" },
                        description: "List of component IDs this component depends on",
                    },
                    props: {
                        type: "object",
                        additionalProperties: { type: "string" },
                        description: "Component props as key-value pairs",
                    },
                },
                required: ["id", "name", "category", "description"],
            },
        },
        {
            name: "design_create_workflow",
            description: "Create a new workflow. ID must match pattern W01, W99, W123. All referenced entities must exist.",
            inputSchema: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        description: "Workflow ID (e.g., W01, W99, W123)",
                    },
                    name: {
                        type: "string",
                        description: "Human-readable name",
                    },
                    category: {
                        type: "string",
                        enum: ["onboarding", "analysis", "exploration", "reporting", "collaboration", "administration"],
                        description: "Workflow category",
                    },
                    goal: {
                        type: "string",
                        description: "The goal of this workflow",
                    },
                    validated: {
                        type: "boolean",
                        description: "Whether the workflow has been validated",
                    },
                    personas: {
                        type: "array",
                        items: { type: "string" },
                        description: "List of persona IDs for this workflow",
                    },
                    requires_capabilities: {
                        type: "array",
                        items: { type: "string" },
                        description: "List of capability IDs required for this workflow",
                    },
                    suggested_components: {
                        type: "array",
                        items: { type: "string" },
                        description: "List of component IDs suggested for this workflow",
                    },
                    starting_state: {
                        type: "object",
                        properties: {
                            data_type: { type: "string" },
                            node_count: { type: "string" },
                            edge_density: { type: "string" },
                            user_expertise: { type: "string" },
                        },
                        description: "Initial state conditions for this workflow",
                    },
                    success_criteria: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                metric: { type: "string" },
                                target: { type: "string" },
                            },
                            required: ["metric", "target"],
                        },
                        description: "Success criteria for this workflow",
                    },
                },
                required: ["id", "name", "category", "goal"],
            },
        },
        // ============= UPDATE TOOLS =============
        {
            name: "design_update_workflow",
            description: "Update an existing workflow. Only specify fields you want to change. All referenced entities must exist.",
            inputSchema: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        description: "Workflow ID to update (e.g., W01, W99, W123)",
                    },
                    name: {
                        type: "string",
                        description: "New human-readable name",
                    },
                    category: {
                        type: "string",
                        enum: ["onboarding", "analysis", "exploration", "reporting", "collaboration", "administration"],
                        description: "New workflow category",
                    },
                    goal: {
                        type: "string",
                        description: "New goal of this workflow",
                    },
                    validated: {
                        type: "boolean",
                        description: "Whether the workflow has been validated",
                    },
                    personas: {
                        type: "array",
                        items: { type: "string" },
                        description: "New list of persona IDs for this workflow",
                    },
                    requires_capabilities: {
                        type: "array",
                        items: { type: "string" },
                        description: "New list of capability IDs required for this workflow",
                    },
                    suggested_components: {
                        type: "array",
                        items: { type: "string" },
                        description: "New list of component IDs suggested for this workflow",
                    },
                },
                required: ["id"],
            },
        },
        {
            name: "design_update_capability",
            description: "Update an existing capability. Only specify fields you want to change.",
            inputSchema: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        description: "Capability ID to update",
                    },
                    name: {
                        type: "string",
                        description: "New human-readable name",
                    },
                    category: {
                        type: "string",
                        enum: ["data", "visualization", "analysis", "interaction", "export", "collaboration", "performance"],
                        description: "New capability category",
                    },
                    description: {
                        type: "string",
                        description: "New description of the capability",
                    },
                    status: {
                        type: "string",
                        enum: ["planned", "in-progress", "implemented", "deprecated"],
                        description: "New implementation status",
                    },
                    algorithms: {
                        type: "array",
                        items: { type: "string" },
                        description: "New list of algorithm names",
                    },
                    requirements: {
                        type: "array",
                        items: { type: "string" },
                        description: "New list of requirements",
                    },
                },
                required: ["id"],
            },
        },
        {
            name: "design_update_persona",
            description: "Update an existing persona. Only specify fields you want to change.",
            inputSchema: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        description: "Persona ID to update",
                    },
                    name: {
                        type: "string",
                        description: "New human-readable name",
                    },
                    role: {
                        type: "string",
                        description: "New job role or title",
                    },
                    characteristics: {
                        type: "object",
                        properties: {
                            expertise: {
                                type: "string",
                                enum: ["novice", "intermediate", "expert"],
                                description: "New expertise level",
                            },
                            time_pressure: {
                                type: "string",
                                description: "New time pressure level",
                            },
                            graph_literacy: {
                                type: "string",
                                description: "New graph literacy level",
                            },
                            domain_knowledge: {
                                type: "string",
                                description: "New domain knowledge level",
                            },
                        },
                        description: "New persona characteristics",
                    },
                    goals: {
                        type: "array",
                        items: { type: "string" },
                        description: "New list of goals",
                    },
                    frustrations: {
                        type: "array",
                        items: { type: "string" },
                        description: "New list of frustrations",
                    },
                },
                required: ["id"],
            },
        },
        {
            name: "design_update_component",
            description: "Update an existing component. Only specify fields you want to change. All referenced entities must exist.",
            inputSchema: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        description: "Component ID to update",
                    },
                    name: {
                        type: "string",
                        description: "New human-readable name",
                    },
                    category: {
                        type: "string",
                        enum: ["dialog", "control", "display", "layout", "utility", "navigation"],
                        description: "New component category",
                    },
                    description: {
                        type: "string",
                        description: "New description of the component",
                    },
                    status: {
                        type: "string",
                        enum: ["planned", "in-progress", "implemented", "deprecated"],
                        description: "New implementation status",
                    },
                    implements_capabilities: {
                        type: "array",
                        items: { type: "string" },
                        description: "New list of capability IDs this component implements",
                    },
                    dependencies: {
                        type: "array",
                        items: { type: "string" },
                        description: "New list of component IDs this component depends on",
                    },
                },
                required: ["id"],
            },
        },
        // ============= DELETE TOOLS =============
        {
            name: "design_delete_workflow",
            description: "Delete a workflow. Cleans up references from related entities.",
            inputSchema: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        description: "Workflow ID to delete",
                    },
                },
                required: ["id"],
            },
        },
        {
            name: "design_delete_capability",
            description: "Delete a capability. By default, warns if workflows depend on it. Use force=true to delete anyway and clean up references.",
            inputSchema: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        description: "Capability ID to delete",
                    },
                    force: {
                        type: "boolean",
                        description: "Force delete even if there are dependents (default: false)",
                    },
                },
                required: ["id"],
            },
        },
        {
            name: "design_delete_persona",
            description: "Delete a persona. By default, warns if workflows use this persona. Use force=true to delete anyway and clean up references.",
            inputSchema: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        description: "Persona ID to delete",
                    },
                    force: {
                        type: "boolean",
                        description: "Force delete even if there are dependents (default: false)",
                    },
                },
                required: ["id"],
            },
        },
        {
            name: "design_delete_component",
            description: "Delete a component. By default, warns if other entities depend on it. Use force=true to delete anyway and clean up references.",
            inputSchema: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        description: "Component ID to delete",
                    },
                    force: {
                        type: "boolean",
                        description: "Force delete even if there are dependents (default: false)",
                    },
                },
                required: ["id"],
            },
        },
        // ============= LINK TOOLS =============
        {
            name: "design_link",
            description: "Link two entities together. Creates bidirectional references. Valid relationships: workflow->capability (requires), workflow->persona (uses), workflow->component (suggests), component->capability (implements), component->component (depends).",
            inputSchema: {
                type: "object",
                properties: {
                    from_type: {
                        type: "string",
                        enum: ["workflow", "capability", "persona", "component"],
                        description: "Source entity type",
                    },
                    from_id: {
                        type: "string",
                        description: "Source entity ID",
                    },
                    to_type: {
                        type: "string",
                        enum: ["workflow", "capability", "persona", "component"],
                        description: "Target entity type",
                    },
                    to_id: {
                        type: "string",
                        description: "Target entity ID",
                    },
                    relationship: {
                        type: "string",
                        enum: ["requires", "uses", "suggests", "implements", "depends"],
                        description: "Type of relationship",
                    },
                },
                required: ["from_type", "from_id", "to_type", "to_id", "relationship"],
            },
        },
        {
            name: "design_unlink",
            description: "Remove a link between two entities. Removes bidirectional references.",
            inputSchema: {
                type: "object",
                properties: {
                    from_type: {
                        type: "string",
                        enum: ["workflow", "capability", "persona", "component"],
                        description: "Source entity type",
                    },
                    from_id: {
                        type: "string",
                        description: "Source entity ID",
                    },
                    to_type: {
                        type: "string",
                        enum: ["workflow", "capability", "persona", "component"],
                        description: "Target entity type",
                    },
                    to_id: {
                        type: "string",
                        description: "Target entity ID",
                    },
                    relationship: {
                        type: "string",
                        enum: ["requires", "uses", "suggests", "implements", "depends"],
                        description: "Type of relationship",
                    },
                },
                required: ["from_type", "from_id", "to_type", "to_id", "relationship"],
            },
        },
    ];
}

/**
 * Handle a mutation tool call.
 * @param store - The design docs store instance
 * @param name - Tool name to execute
 * @param args - Arguments for the tool
 * @returns Tool result with content and optional error flag
 */
export function handleMutationTool(
    store: DesignDocsStore,
    name: string,
    args: Record<string, unknown>
): ToolResult | null {
    switch (name) {
        case "design_create_capability": {
            const input: CreateCapabilityInput = {
                id: toStringOrDefault(args.id),
                name: toStringOrDefault(args.name),
                category: args.category as CreateCapabilityInput["category"],
                description: toStringOrDefault(args.description),
                status: args.status as CreateCapabilityInput["status"],
                algorithms: args.algorithms as string[] | undefined,
                used_by_workflows: args.used_by_workflows as string[] | undefined,
                implemented_by_components: args.implemented_by_components as string[] | undefined,
                requirements: args.requirements as string[] | undefined,
            };
            const result = store.createCapability(input);
            if (result.success) {
                return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
            }
            return {
                content: [{ type: "text", text: result.error ?? "Failed to create capability" }],
                isError: true,
            };
        }

        case "design_create_persona": {
            const characteristics = args.characteristics as CreatePersonaInput["characteristics"] | undefined;
            const input: CreatePersonaInput = {
                id: toStringOrDefault(args.id),
                name: toStringOrDefault(args.name),
                role: toStringOrDefault(args.role),
                characteristics: characteristics ?? { expertise: "novice" },
                goals: (args.goals as string[]) ?? [],
                frustrations: args.frustrations as string[] | undefined,
                workflows: args.workflows as string[] | undefined,
            };
            const result = store.createPersona(input);
            if (result.success) {
                return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
            }
            return {
                content: [{ type: "text", text: result.error ?? "Failed to create persona" }],
                isError: true,
            };
        }

        case "design_create_component": {
            const input: CreateComponentInput = {
                id: toStringOrDefault(args.id),
                name: toStringOrDefault(args.name),
                category: args.category as CreateComponentInput["category"],
                description: toStringOrDefault(args.description),
                status: args.status as CreateComponentInput["status"],
                implements_capabilities: args.implements_capabilities as string[] | undefined,
                used_in_workflows: args.used_in_workflows as string[] | undefined,
                dependencies: args.dependencies as string[] | undefined,
                props: args.props as Record<string, string> | undefined,
            };
            const result = store.createComponent(input);
            if (result.success) {
                return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
            }
            return {
                content: [{ type: "text", text: result.error ?? "Failed to create component" }],
                isError: true,
            };
        }

        case "design_create_workflow": {
            const input: CreateWorkflowInput = {
                id: toStringOrDefault(args.id),
                name: toStringOrDefault(args.name),
                category: args.category as CreateWorkflowInput["category"],
                goal: toStringOrDefault(args.goal),
                validated: args.validated as boolean | undefined,
                personas: args.personas as string[] | undefined,
                requires_capabilities: args.requires_capabilities as string[] | undefined,
                suggested_components: args.suggested_components as string[] | undefined,
                starting_state: args.starting_state as CreateWorkflowInput["starting_state"],
                success_criteria: args.success_criteria as CreateWorkflowInput["success_criteria"],
            };
            const result = store.createWorkflow(input);
            if (result.success) {
                return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
            }
            return {
                content: [{ type: "text", text: result.error ?? "Failed to create workflow" }],
                isError: true,
            };
        }

        // ============= UPDATE HANDLERS =============

        case "design_update_workflow": {
            const id = toStringOrDefault(args.id);
            const updates: UpdateWorkflowInput = {};
            if (args.name !== undefined) {
                updates.name = toStringOrDefault(args.name);
            }
            if (args.category !== undefined) {
                updates.category = args.category as UpdateWorkflowInput["category"];
            }
            if (args.goal !== undefined) {
                updates.goal = toStringOrDefault(args.goal);
            }
            if (args.validated !== undefined) {
                updates.validated = args.validated as boolean;
            }
            if (args.personas !== undefined) {
                updates.personas = args.personas as string[];
            }
            if (args.requires_capabilities !== undefined) {
                updates.requires_capabilities = args.requires_capabilities as string[];
            }
            if (args.suggested_components !== undefined) {
                updates.suggested_components = args.suggested_components as string[];
            }

            const result = store.updateWorkflow(id, updates);
            if (result.success) {
                return { content: [{ type: "text", text: JSON.stringify({ success: true, id }, null, 2) }] };
            }
            return {
                content: [{ type: "text", text: result.error ?? "Failed to update workflow" }],
                isError: true,
            };
        }

        case "design_update_capability": {
            const id = toStringOrDefault(args.id);
            const updates: UpdateCapabilityInput = {};
            if (args.name !== undefined) {
                updates.name = toStringOrDefault(args.name);
            }
            if (args.category !== undefined) {
                updates.category = args.category as UpdateCapabilityInput["category"];
            }
            if (args.description !== undefined) {
                updates.description = toStringOrDefault(args.description);
            }
            if (args.status !== undefined) {
                updates.status = args.status as UpdateCapabilityInput["status"];
            }
            if (args.algorithms !== undefined) {
                updates.algorithms = args.algorithms as string[];
            }
            if (args.requirements !== undefined) {
                updates.requirements = args.requirements as string[];
            }

            const result = store.updateCapability(id, updates);
            if (result.success) {
                return { content: [{ type: "text", text: JSON.stringify({ success: true, id }, null, 2) }] };
            }
            return {
                content: [{ type: "text", text: result.error ?? "Failed to update capability" }],
                isError: true,
            };
        }

        case "design_update_persona": {
            const id = toStringOrDefault(args.id);
            const updates: UpdatePersonaInput = {};
            if (args.name !== undefined) {
                updates.name = toStringOrDefault(args.name);
            }
            if (args.role !== undefined) {
                updates.role = toStringOrDefault(args.role);
            }
            if (args.characteristics !== undefined) {
                updates.characteristics = args.characteristics as UpdatePersonaInput["characteristics"];
            }
            if (args.goals !== undefined) {
                updates.goals = args.goals as string[];
            }
            if (args.frustrations !== undefined) {
                updates.frustrations = args.frustrations as string[];
            }

            const result = store.updatePersona(id, updates);
            if (result.success) {
                return { content: [{ type: "text", text: JSON.stringify({ success: true, id }, null, 2) }] };
            }
            return {
                content: [{ type: "text", text: result.error ?? "Failed to update persona" }],
                isError: true,
            };
        }

        case "design_update_component": {
            const id = toStringOrDefault(args.id);
            const updates: UpdateComponentInput = {};
            if (args.name !== undefined) {
                updates.name = toStringOrDefault(args.name);
            }
            if (args.category !== undefined) {
                updates.category = args.category as UpdateComponentInput["category"];
            }
            if (args.description !== undefined) {
                updates.description = toStringOrDefault(args.description);
            }
            if (args.status !== undefined) {
                updates.status = args.status as UpdateComponentInput["status"];
            }
            if (args.implements_capabilities !== undefined) {
                updates.implements_capabilities = args.implements_capabilities as string[];
            }
            if (args.dependencies !== undefined) {
                updates.dependencies = args.dependencies as string[];
            }

            const result = store.updateComponent(id, updates);
            if (result.success) {
                return { content: [{ type: "text", text: JSON.stringify({ success: true, id }, null, 2) }] };
            }
            return {
                content: [{ type: "text", text: result.error ?? "Failed to update component" }],
                isError: true,
            };
        }

        // ============= DELETE HANDLERS =============

        case "design_delete_workflow": {
            const id = toStringOrDefault(args.id);
            const result = store.deleteWorkflow(id);
            if (result.success) {
                return { content: [{ type: "text", text: JSON.stringify({ success: true, id, deleted: true }, null, 2) }] };
            }
            return {
                content: [{ type: "text", text: result.error ?? "Failed to delete workflow" }],
                isError: true,
            };
        }

        case "design_delete_capability": {
            const id = toStringOrDefault(args.id);
            const force = args.force as boolean | undefined;
            const result = store.deleteCapability(id, { force });
            if (result.success) {
                return { content: [{ type: "text", text: JSON.stringify({ success: true, id, deleted: true }, null, 2) }] };
            }
            if (result.warnings && result.warnings.length > 0) {
                return {
                    content: [{
                        type: "text",
                        text: `Cannot delete capability '${id}': ${result.warnings.length} dependent workflow(s): ${result.warnings.join(", ")}. Use force=true to delete anyway.`,
                    }],
                    isError: true,
                };
            }
            return {
                content: [{ type: "text", text: result.error ?? "Failed to delete capability" }],
                isError: true,
            };
        }

        case "design_delete_persona": {
            const id = toStringOrDefault(args.id);
            const force = args.force as boolean | undefined;
            const result = store.deletePersona(id, { force });
            if (result.success) {
                return { content: [{ type: "text", text: JSON.stringify({ success: true, id, deleted: true }, null, 2) }] };
            }
            if (result.warnings && result.warnings.length > 0) {
                return {
                    content: [{
                        type: "text",
                        text: `Cannot delete persona '${id}': ${result.warnings.length} dependent workflow(s): ${result.warnings.join(", ")}. Use force=true to delete anyway.`,
                    }],
                    isError: true,
                };
            }
            return {
                content: [{ type: "text", text: result.error ?? "Failed to delete persona" }],
                isError: true,
            };
        }

        case "design_delete_component": {
            const id = toStringOrDefault(args.id);
            const force = args.force as boolean | undefined;
            const result = store.deleteComponent(id, { force });
            if (result.success) {
                return { content: [{ type: "text", text: JSON.stringify({ success: true, id, deleted: true }, null, 2) }] };
            }
            if (result.warnings && result.warnings.length > 0) {
                return {
                    content: [{
                        type: "text",
                        text: `Cannot delete component '${id}': ${result.warnings.length} dependent(s): ${result.warnings.join(", ")}. Use force=true to delete anyway.`,
                    }],
                    isError: true,
                };
            }
            return {
                content: [{ type: "text", text: result.error ?? "Failed to delete component" }],
                isError: true,
            };
        }

        // ============= LINK HANDLERS =============

        case "design_link": {
            const fromType = toStringOrDefault(args.from_type) as EntityType;
            const fromId = toStringOrDefault(args.from_id);
            const toType = toStringOrDefault(args.to_type) as EntityType;
            const toId = toStringOrDefault(args.to_id);
            const relationship = toStringOrDefault(args.relationship) as RelationshipType;

            const result = store.link(fromType, fromId, toType, toId, relationship);
            if (result.success) {
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify({
                            success: true,
                            linked: { from: { type: fromType, id: fromId }, to: { type: toType, id: toId }, relationship },
                        }, null, 2),
                    }],
                };
            }
            return {
                content: [{ type: "text", text: result.error ?? "Failed to link entities" }],
                isError: true,
            };
        }

        case "design_unlink": {
            const fromType = toStringOrDefault(args.from_type) as EntityType;
            const fromId = toStringOrDefault(args.from_id);
            const toType = toStringOrDefault(args.to_type) as EntityType;
            const toId = toStringOrDefault(args.to_id);
            const relationship = toStringOrDefault(args.relationship) as RelationshipType;

            const result = store.unlink(fromType, fromId, toType, toId, relationship);
            if (result.success) {
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify({
                            success: true,
                            unlinked: { from: { type: fromType, id: fromId }, to: { type: toType, id: toId }, relationship },
                        }, null, 2),
                    }],
                };
            }
            return {
                content: [{ type: "text", text: result.error ?? "Failed to unlink entities" }],
                isError: true,
            };
        }

        default:
            return null;
    }
}
