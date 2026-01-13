import type { DesignDocsStore, EntityType } from "../store/yaml-store.js";

/**
 * Tool definition interface matching MCP SDK
 */
export interface ToolDefinition {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: Record<string, unknown>;
        required?: string[];
    };
}

/**
 * Tool result interface matching MCP SDK
 */
export interface ToolResult {
    content: Array<{ type: "text"; text: string }>;
    isError?: boolean;
}

/**
 * Get all query tool definitions.
 * @returns Array of tool definitions for MCP registration
 */
export function getQueryTools(): ToolDefinition[] {
    return [
        {
            name: "design_list_workflows",
            description: "List all workflows with optional filtering by category, validated status, persona, or capability",
            inputSchema: {
                type: "object",
                properties: {
                    category: {
                        type: "string",
                        description: "Filter by category (onboarding, analysis, exploration, reporting, collaboration, administration)",
                    },
                    validated: {
                        type: "boolean",
                        description: "Filter by validated status",
                    },
                    persona: {
                        type: "string",
                        description: "Filter by persona ID",
                    },
                    capability: {
                        type: "string",
                        description: "Filter by required capability ID",
                    },
                },
            },
        },
        {
            name: "design_list_capabilities",
            description: "List all capabilities with optional filtering by category, status, or workflow",
            inputSchema: {
                type: "object",
                properties: {
                    category: {
                        type: "string",
                        description: "Filter by category (data, visualization, analysis, interaction, export, collaboration, performance)",
                    },
                    status: {
                        type: "string",
                        description: "Filter by status (planned, in-progress, implemented, deprecated)",
                    },
                    workflow: {
                        type: "string",
                        description: "Filter by workflow ID that uses this capability",
                    },
                },
            },
        },
        {
            name: "design_list_personas",
            description: "List all personas",
            inputSchema: {
                type: "object",
                properties: {},
            },
        },
        {
            name: "design_list_components",
            description: "List all components with optional filtering by category, status, or capability",
            inputSchema: {
                type: "object",
                properties: {
                    category: {
                        type: "string",
                        description: "Filter by category (dialog, control, display, layout, utility, navigation)",
                    },
                    status: {
                        type: "string",
                        description: "Filter by status (planned, in-progress, implemented, deprecated)",
                    },
                    capability: {
                        type: "string",
                        description: "Filter by capability ID that this component implements",
                    },
                },
            },
        },
        {
            name: "design_get_workflow",
            description: "Get a workflow by ID with all resolved relationships (capabilities, personas, components)",
            inputSchema: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        description: "Workflow ID (e.g., W01)",
                    },
                },
                required: ["id"],
            },
        },
        {
            name: "design_get_capability",
            description: "Get a capability by ID with all resolved relationships (workflows, components)",
            inputSchema: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        description: "Capability ID (e.g., data-import)",
                    },
                },
                required: ["id"],
            },
        },
        {
            name: "design_get_persona",
            description: "Get a persona by ID with all resolved relationships (workflows)",
            inputSchema: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        description: "Persona ID (e.g., analyst-alex)",
                    },
                },
                required: ["id"],
            },
        },
        {
            name: "design_get_component",
            description: "Get a component by ID with all resolved relationships (capabilities, workflows, dependents)",
            inputSchema: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        description: "Component ID (e.g., data-import-dialog)",
                    },
                },
                required: ["id"],
            },
        },
        {
            name: "design_get_dependencies",
            description: "Get all entities that the specified entity depends on",
            inputSchema: {
                type: "object",
                properties: {
                    entityType: {
                        type: "string",
                        enum: ["workflow", "capability", "persona", "component"],
                        description: "Type of entity",
                    },
                    id: {
                        type: "string",
                        description: "Entity ID",
                    },
                },
                required: ["entityType", "id"],
            },
        },
        {
            name: "design_get_dependents",
            description: "Get all entities that depend on the specified entity",
            inputSchema: {
                type: "object",
                properties: {
                    entityType: {
                        type: "string",
                        enum: ["workflow", "capability", "persona", "component"],
                        description: "Type of entity",
                    },
                    id: {
                        type: "string",
                        description: "Entity ID",
                    },
                },
                required: ["entityType", "id"],
            },
        },
    ];
}

/**
 * Handle a query tool call.
 * @param store - The design docs store instance
 * @param name - Tool name to execute
 * @param args - Arguments for the tool
 * @returns Tool result with content and optional error flag
 */
export function handleQueryTool(
    store: DesignDocsStore,
    name: string,
    args: Record<string, unknown>
): ToolResult {
    switch (name) {
        case "design_list_workflows": {
            const workflows = store.listWorkflows({
                category: args.category as string | undefined,
                validated: args.validated as boolean | undefined,
                persona: args.persona as string | undefined,
                capability: args.capability as string | undefined,
            });
            return { content: [{ type: "text", text: JSON.stringify(workflows, null, 2) }] };
        }

        case "design_list_capabilities": {
            const capabilities = store.listCapabilities({
                category: args.category as string | undefined,
                status: args.status as string | undefined,
                workflow: args.workflow as string | undefined,
            });
            return { content: [{ type: "text", text: JSON.stringify(capabilities, null, 2) }] };
        }

        case "design_list_personas": {
            const personas = store.listPersonas();
            return { content: [{ type: "text", text: JSON.stringify(personas, null, 2) }] };
        }

        case "design_list_components": {
            const components = store.listComponents({
                category: args.category as string | undefined,
                status: args.status as string | undefined,
                capability: args.capability as string | undefined,
            });
            return { content: [{ type: "text", text: JSON.stringify(components, null, 2) }] };
        }

        case "design_get_workflow": {
            const id = String(args.id);
            const workflow = store.getWorkflow(id);
            if (!workflow) {
                return {
                    content: [{ type: "text", text: `Workflow '${id}' not found` }],
                    isError: true,
                };
            }
            return { content: [{ type: "text", text: JSON.stringify(workflow, null, 2) }] };
        }

        case "design_get_capability": {
            const id = String(args.id);
            const capability = store.getCapability(id);
            if (!capability) {
                return {
                    content: [{ type: "text", text: `Capability '${id}' not found` }],
                    isError: true,
                };
            }
            return { content: [{ type: "text", text: JSON.stringify(capability, null, 2) }] };
        }

        case "design_get_persona": {
            const id = String(args.id);
            const persona = store.getPersona(id);
            if (!persona) {
                return {
                    content: [{ type: "text", text: `Persona '${id}' not found` }],
                    isError: true,
                };
            }
            return { content: [{ type: "text", text: JSON.stringify(persona, null, 2) }] };
        }

        case "design_get_component": {
            const id = String(args.id);
            const component = store.getComponent(id);
            if (!component) {
                return {
                    content: [{ type: "text", text: `Component '${id}' not found` }],
                    isError: true,
                };
            }
            return { content: [{ type: "text", text: JSON.stringify(component, null, 2) }] };
        }

        case "design_get_dependencies": {
            const entityType = String(args.entityType) as EntityType;
            const id = String(args.id);
            const deps = store.getDependencies(entityType, id);
            if (!deps) {
                return {
                    content: [{ type: "text", text: `${entityType} '${id}' not found` }],
                    isError: true,
                };
            }
            return { content: [{ type: "text", text: JSON.stringify(deps, null, 2) }] };
        }

        case "design_get_dependents": {
            const entityType = String(args.entityType) as EntityType;
            const id = String(args.id);
            const deps = store.getDependents(entityType, id);
            if (!deps) {
                return {
                    content: [{ type: "text", text: `${entityType} '${id}' not found` }],
                    isError: true,
                };
            }
            return { content: [{ type: "text", text: JSON.stringify(deps, null, 2) }] };
        }

        default:
            return {
                content: [{ type: "text", text: `Unknown tool: ${name}` }],
                isError: true,
            };
    }
}
