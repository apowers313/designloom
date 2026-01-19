/* eslint-disable camelcase -- snake_case matches YAML field names for tool inputs */
import type {
    CreateCapabilityInput,
    CreateComponentInput,
    CreateInteractionInput,
    CreatePersonaInput,
    CreateTestResultInput,
    CreateTokensInput,
    CreateViewInput,
    CreateWorkflowInput,
    DesignDocsStore,
    DiagramOptions,
    EntityType,
    RelationshipType,
    TestGenOptions,
    UpdateCapabilityInput,
    UpdateComponentInput,
    UpdateInteractionInput,
    UpdatePersonaInput,
    UpdateTestResultInput,
    UpdateTokensInput,
    UpdateViewInput,
    UpdateWorkflowInput,
} from "../store/yaml-store.js";
import type { ToolDefinition, ToolResult } from "./query.js";

/**
 * Entity types supported by consolidated tools.
 */
export type ConsolidatedEntityType =
    | "workflow"
    | "capability"
    | "persona"
    | "component"
    | "tokens"
    | "view"
    | "interaction"
    | "test-result";

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
 * Get all consolidated tool definitions (10 tools total).
 * @returns Array of tool definitions for MCP registration
 */
export function getConsolidatedTools(): ToolDefinition[] {
    return [
        // 1. design_list - List entities with filters
        {
            name: "design_list",
            description: "List design entities with optional filtering. Supports all entity types: workflow, capability, persona, component, tokens, view, interaction, test-result.",
            inputSchema: {
                type: "object",
                properties: {
                    entity_type: {
                        type: "string",
                        enum: ["workflow", "capability", "persona", "component", "tokens", "view", "interaction", "test-result"],
                        description: "Type of entity to list",
                    },
                    // Common filters
                    category: { type: "string", description: "Filter by category" },
                    status: { type: "string", description: "Filter by status" },
                    priority: { type: "string", enum: ["P0", "P1", "P2"], description: "Filter by priority" },
                    // Workflow-specific filters
                    validated: { type: "boolean", description: "Filter workflows by validated status" },
                    persona: { type: "string", description: "Filter workflows by persona ID" },
                    capability: { type: "string", description: "Filter workflows/components by capability ID" },
                    // Test result filters
                    workflow_id: { type: "string", description: "Filter test results by workflow ID" },
                    persona_id: { type: "string", description: "Filter test results by persona ID" },
                    test_type: { type: "string", enum: ["simulated", "real"], description: "Filter test results by test type" },
                    has_issues: { type: "boolean", description: "Filter test results by whether they have issues" },
                    // Tokens filters
                    extends: { type: "string", description: "Filter tokens by parent token set ID" },
                    // View filters
                    layout_type: { type: "string", description: "Filter views by layout type" },
                    workflow: { type: "string", description: "Filter views/capabilities by workflow ID" },
                    has_route: { type: "boolean", description: "Filter views by whether they have routes" },
                    // Interaction filters
                    applies_to: { type: "string", description: "Filter interactions by component category they apply to" },
                },
                required: ["entity_type"],
            },
        },
        // 2. design_get - Get single entity with resolved relations
        {
            name: "design_get",
            description: "Get a single design entity by ID with resolved relationships. Returns detailed entity data including related entities.",
            inputSchema: {
                type: "object",
                properties: {
                    entity_type: {
                        type: "string",
                        enum: ["workflow", "capability", "persona", "component", "tokens", "view", "interaction", "test-result"],
                        description: "Type of entity to get",
                    },
                    id: {
                        type: "string",
                        description: "Entity ID (e.g., W01 for workflow, data-import for capability)",
                    },
                },
                required: ["entity_type", "id"],
            },
        },
        // 3. design_create - Create entity (discriminated by type)
        {
            name: "design_create",
            description: "Create a new design entity. The required fields depend on the entity_type. Workflow IDs must match pattern W01/W99/W123. Other IDs must be kebab-case.",
            inputSchema: {
                type: "object",
                properties: {
                    entity_type: {
                        type: "string",
                        enum: ["workflow", "capability", "persona", "component", "tokens", "view", "interaction", "test-result"],
                        description: "Type of entity to create",
                    },
                    // Common fields
                    id: { type: "string", description: "Unique entity ID" },
                    name: { type: "string", description: "Human-readable name" },
                    description: { type: "string", description: "Description of the entity" },
                    // Workflow fields
                    category: { type: "string", description: "Category (varies by entity type)" },
                    goal: { type: "string", description: "Workflow goal" },
                    validated: { type: "boolean", description: "Workflow validated status" },
                    personas: { type: "array", items: { type: "string" }, description: "Workflow persona IDs" },
                    requires_capabilities: { type: "array", items: { type: "string" }, description: "Workflow required capability IDs" },
                    suggested_components: { type: "array", items: { type: "string" }, description: "Workflow suggested component IDs" },
                    starting_state: { type: "object", description: "Workflow starting state conditions" },
                    success_criteria: { type: "array", description: "Workflow success criteria" },
                    // Capability fields
                    status: { type: "string", description: "Status (planned, in-progress, implemented, deprecated)" },
                    algorithms: { type: "array", items: { type: "string" }, description: "Capability algorithms" },
                    requirements: { type: "array", items: { type: "string" }, description: "Capability requirements" },
                    // Persona fields
                    role: { type: "string", description: "Persona role/title" },
                    quote: { type: "string", description: "Persona quote" },
                    bio: { type: "string", description: "Persona bio" },
                    characteristics: { type: "object", description: "Persona characteristics" },
                    motivations: { type: "array", items: { type: "string" }, description: "Persona motivations" },
                    behaviors: { type: "array", items: { type: "string" }, description: "Persona behaviors" },
                    goals: { type: "array", items: { type: "string" }, description: "Persona goals" },
                    frustrations: { type: "array", items: { type: "string" }, description: "Persona frustrations" },
                    context: { type: "object", description: "Persona usage context" },
                    workflows: { type: "array", items: { type: "string" }, description: "Persona/View workflow IDs" },
                    // Component fields
                    implements_capabilities: { type: "array", items: { type: "string" }, description: "Component capability IDs" },
                    used_in_workflows: { type: "array", items: { type: "string" }, description: "Component workflow IDs" },
                    dependencies: { type: "array", items: { type: "string" }, description: "Component dependency IDs" },
                    props: { type: "object", description: "Component props" },
                    // Tokens fields
                    extends: { type: "string", description: "Tokens parent ID" },
                    colors: { type: "object", description: "Tokens colors" },
                    typography: { type: "object", description: "Tokens typography" },
                    spacing: { type: "object", description: "Tokens spacing" },
                    radii: { type: "object", description: "Tokens border radii" },
                    shadows: { type: "object", description: "Tokens shadows" },
                    motion: { type: "object", description: "Tokens motion/animation" },
                    breakpoints: { type: "object", description: "Tokens breakpoints" },
                    // View fields
                    layout: { type: "object", description: "View layout definition" },
                    states: { type: "array", description: "View states" },
                    routes: { type: "array", description: "View routes" },
                    data_requirements: { type: "array", description: "View data requirements" },
                    // Interaction fields
                    interaction: { type: "object", description: "Interaction pattern definition" },
                    applies_to: { type: "array", items: { type: "string" }, description: "Interaction component categories" },
                    // Test result fields
                    workflow_id: { type: "string", description: "Test result workflow ID" },
                    persona_id: { type: "string", description: "Test result persona ID" },
                    test_type: { type: "string", enum: ["simulated", "real"], description: "Test type" },
                    date: { type: "string", description: "Test date (ISO 8601)" },
                    confidence: { type: "string", enum: ["high", "medium", "low"], description: "Test confidence level" },
                    success_criteria_results: { type: "array", description: "Test success criteria results" },
                    issues: { type: "array", description: "Test issues found" },
                    summary: { type: "string", description: "Test summary" },
                    participants: { type: "number", description: "Test participant count" },
                    quotes: { type: "array", items: { type: "string" }, description: "Test user quotes" },
                    recommendations: { type: "array", items: { type: "string" }, description: "Test recommendations" },
                    // Common
                    sources: { type: "array", description: "Source references" },
                },
                required: ["entity_type", "id"],
            },
        },
        // 4. design_update - Update entity (discriminated by type)
        {
            name: "design_update",
            description: "Update an existing design entity. Only specify fields you want to change. The entity must exist.",
            inputSchema: {
                type: "object",
                properties: {
                    entity_type: {
                        type: "string",
                        enum: ["workflow", "capability", "persona", "component", "tokens", "view", "interaction", "test-result"],
                        description: "Type of entity to update",
                    },
                    id: { type: "string", description: "Entity ID to update" },
                    // All fields from create (except id) are optional for update
                    name: { type: "string" },
                    description: { type: "string" },
                    category: { type: "string" },
                    goal: { type: "string" },
                    validated: { type: "boolean" },
                    personas: { type: "array", items: { type: "string" } },
                    requires_capabilities: { type: "array", items: { type: "string" } },
                    suggested_components: { type: "array", items: { type: "string" } },
                    starting_state: { type: "object" },
                    success_criteria: { type: "array" },
                    status: { type: "string" },
                    algorithms: { type: "array", items: { type: "string" } },
                    requirements: { type: "array", items: { type: "string" } },
                    role: { type: "string" },
                    quote: { type: "string" },
                    bio: { type: "string" },
                    characteristics: { type: "object" },
                    motivations: { type: "array", items: { type: "string" } },
                    behaviors: { type: "array", items: { type: "string" } },
                    goals: { type: "array", items: { type: "string" } },
                    frustrations: { type: "array", items: { type: "string" } },
                    context: { type: "object" },
                    workflows: { type: "array", items: { type: "string" } },
                    implements_capabilities: { type: "array", items: { type: "string" } },
                    used_in_workflows: { type: "array", items: { type: "string" } },
                    dependencies: { type: "array", items: { type: "string" } },
                    props: { type: "object" },
                    extends: { type: "string" },
                    colors: { type: "object" },
                    typography: { type: "object" },
                    spacing: { type: "object" },
                    radii: { type: "object" },
                    shadows: { type: "object" },
                    motion: { type: "object" },
                    breakpoints: { type: "object" },
                    layout: { type: "object" },
                    states: { type: "array" },
                    routes: { type: "array" },
                    data_requirements: { type: "array" },
                    interaction: { type: "object" },
                    applies_to: { type: "array", items: { type: "string" } },
                    confidence: { type: "string", enum: ["high", "medium", "low"] },
                    success_criteria_results: { type: "array" },
                    issues: { type: "array" },
                    summary: { type: "string" },
                    participants: { type: "number" },
                    quotes: { type: "array", items: { type: "string" } },
                    recommendations: { type: "array", items: { type: "string" } },
                    sources: { type: "array" },
                },
                required: ["entity_type", "id"],
            },
        },
        // 5. design_delete - Delete entity with force option
        {
            name: "design_delete",
            description: "Delete a design entity. By default warns if other entities depend on it. Use force=true to delete anyway and clean up references.",
            inputSchema: {
                type: "object",
                properties: {
                    entity_type: {
                        type: "string",
                        enum: ["workflow", "capability", "persona", "component", "tokens", "view", "interaction", "test-result"],
                        description: "Type of entity to delete",
                    },
                    id: { type: "string", description: "Entity ID to delete" },
                    force: { type: "boolean", description: "Force delete even if dependents exist (default: false)" },
                },
                required: ["entity_type", "id"],
            },
        },
        // 6. design_link - Link/unlink entities
        {
            name: "design_link",
            description: "Link or unlink two entities with bidirectional references. Valid relationships: workflow->capability (requires), workflow->persona (uses), workflow->component (suggests), component->capability (implements), component->component (depends).",
            inputSchema: {
                type: "object",
                properties: {
                    action: {
                        type: "string",
                        enum: ["link", "unlink"],
                        description: "Whether to create or remove the link",
                    },
                    from_type: {
                        type: "string",
                        enum: ["workflow", "capability", "persona", "component"],
                        description: "Source entity type",
                    },
                    from_id: { type: "string", description: "Source entity ID" },
                    to_type: {
                        type: "string",
                        enum: ["workflow", "capability", "persona", "component"],
                        description: "Target entity type",
                    },
                    to_id: { type: "string", description: "Target entity ID" },
                    relationship: {
                        type: "string",
                        enum: ["requires", "uses", "suggests", "implements", "depends"],
                        description: "Type of relationship",
                    },
                },
                required: ["action", "from_type", "from_id", "to_type", "to_id", "relationship"],
            },
        },
        // 7. design_validate - Validation suite
        {
            name: "design_validate",
            description: "Validate design documents. Modes: 'all' validates references and consistency, 'orphans' finds unreferenced entities, 'gaps' finds missing coverage, 'schema' checks schema versions.",
            inputSchema: {
                type: "object",
                properties: {
                    check: {
                        type: "string",
                        enum: ["all", "orphans", "gaps", "schema"],
                        description: "Validation check to perform",
                    },
                    entity_type: {
                        type: "string",
                        enum: ["capability", "persona", "component"],
                        description: "For orphans check: filter by entity type",
                    },
                },
                required: ["check"],
            },
        },
        // 8. design_analyze - Analysis reports
        {
            name: "design_analyze",
            description: "Generate analysis reports. 'coverage' shows capability/persona/component usage, 'priority' suggests implementation priorities, 'test-coverage' shows workflow-persona test coverage.",
            inputSchema: {
                type: "object",
                properties: {
                    report: {
                        type: "string",
                        enum: ["coverage", "priority", "test-coverage"],
                        description: "Type of report to generate",
                    },
                    focus: {
                        type: "string",
                        enum: ["capability", "workflow"],
                        description: "For priority report: what to prioritize",
                    },
                    limit: {
                        type: "number",
                        description: "For priority report: max recommendations (default: 10)",
                    },
                },
                required: ["report"],
            },
        },
        // 9. design_export - Export artifacts
        {
            name: "design_export",
            description: "Export design artifacts. 'diagram' exports Mermaid diagrams showing entity relationships. 'tests' generates test scaffolding from workflow success criteria.",
            inputSchema: {
                type: "object",
                properties: {
                    format: {
                        type: "string",
                        enum: ["diagram", "tests"],
                        description: "Export format",
                    },
                    // Diagram options
                    focus: {
                        type: "string",
                        description: "For diagram: entity ID to focus on, or 'all' for full graph",
                    },
                    depth: {
                        type: "number",
                        description: "For diagram: relationship depth (default: 1)",
                    },
                    // Test options
                    workflow_id: {
                        type: "string",
                        description: "For tests: workflow ID to generate tests for",
                    },
                    test_format: {
                        type: "string",
                        enum: ["vitest", "playwright"],
                        description: "For tests: test framework format (default: vitest)",
                    },
                },
                required: ["format"],
            },
        },
        // 10. design_relations - Relationship queries
        {
            name: "design_relations",
            description: "Get dependency or dependent relationships for an entity. 'dependencies' returns what the entity depends on. 'dependents' returns what depends on the entity.",
            inputSchema: {
                type: "object",
                properties: {
                    direction: {
                        type: "string",
                        enum: ["dependencies", "dependents"],
                        description: "Relationship direction to query",
                    },
                    entity_type: {
                        type: "string",
                        enum: ["workflow", "capability", "persona", "component", "tokens", "view", "interaction"],
                        description: "Type of entity",
                    },
                    id: { type: "string", description: "Entity ID" },
                },
                required: ["direction", "entity_type", "id"],
            },
        },
    ];
}

/**
 * Handle a consolidated tool call.
 * @param store - The design docs store instance
 * @param name - Tool name to execute
 * @param args - Arguments for the tool
 * @returns Tool result with content and optional error flag
 */
export function handleConsolidatedTool(
    store: DesignDocsStore,
    name: string,
    args: Record<string, unknown>
): ToolResult {
    switch (name) {
        case "design_list":
            return handleListTool(store, args);
        case "design_get":
            return handleGetTool(store, args);
        case "design_create":
            return handleCreateTool(store, args);
        case "design_update":
            return handleUpdateTool(store, args);
        case "design_delete":
            return handleDeleteTool(store, args);
        case "design_link":
            return handleLinkTool(store, args);
        case "design_validate":
            return handleValidateTool(store, args);
        case "design_analyze":
            return handleAnalyzeTool(store, args);
        case "design_export":
            return handleExportTool(store, args);
        case "design_relations":
            return handleRelationsTool(store, args);
        default: {
            return {
                content: [{ type: "text", text: `Unknown tool: ${name}` }],
                isError: true,
            };
        }
    }
}

// ============= HANDLER IMPLEMENTATIONS =============

function handleListTool(store: DesignDocsStore, args: Record<string, unknown>): ToolResult {
    const entityType = args.entity_type as ConsolidatedEntityType;

    if (!entityType) {
        return {
            content: [{ type: "text", text: "Error: 'entity_type' parameter is required" }],
            isError: true,
        };
    }

    switch (entityType) {
        case "workflow": {
            const workflows = store.listWorkflows({
                category: args.category as string | undefined,
                priority: args.priority as string | undefined,
                validated: args.validated as boolean | undefined,
                persona: args.persona as string | undefined,
                capability: args.capability as string | undefined,
            });
            return { content: [{ type: "text", text: JSON.stringify(workflows, null, 2) }] };
        }
        case "capability": {
            const capabilities = store.listCapabilities({
                category: args.category as string | undefined,
                status: args.status as string | undefined,
                priority: args.priority as string | undefined,
                workflow: args.workflow as string | undefined,
            });
            return { content: [{ type: "text", text: JSON.stringify(capabilities, null, 2) }] };
        }
        case "persona": {
            const personas = store.listPersonas();
            return { content: [{ type: "text", text: JSON.stringify(personas, null, 2) }] };
        }
        case "component": {
            const components = store.listComponents({
                category: args.category as string | undefined,
                status: args.status as string | undefined,
                priority: args.priority as string | undefined,
                capability: args.capability as string | undefined,
            });
            return { content: [{ type: "text", text: JSON.stringify(components, null, 2) }] };
        }
        case "tokens": {
            const tokens = store.listTokens({
                extends: args.extends as string | undefined,
            });
            return { content: [{ type: "text", text: JSON.stringify(tokens, null, 2) }] };
        }
        case "view": {
            const views = store.listViews({
                layout_type: args.layout_type as string | undefined,
                priority: args.priority as string | undefined,
                workflow: args.workflow as string | undefined,
                has_route: args.has_route as boolean | undefined,
            });
            return { content: [{ type: "text", text: JSON.stringify(views, null, 2) }] };
        }
        case "interaction": {
            const interactions = store.listInteractions({
                applies_to: args.applies_to as string | undefined,
            });
            return { content: [{ type: "text", text: JSON.stringify(interactions, null, 2) }] };
        }
        case "test-result": {
            const testResults = store.listTestResults({
                workflow_id: args.workflow_id as string | undefined,
                persona_id: args.persona_id as string | undefined,
                test_type: args.test_type as "simulated" | "real" | undefined,
                status: args.status as "passed" | "failed" | "partial" | undefined,
                has_issues: args.has_issues as boolean | undefined,
            });
            return { content: [{ type: "text", text: JSON.stringify(testResults, null, 2) }] };
        }
        default: {
            const badType: string = entityType;
            return {
                content: [{ type: "text", text: `Unknown entity type: ${badType}` }],
                isError: true,
            };
        }
    }
}

function handleGetTool(store: DesignDocsStore, args: Record<string, unknown>): ToolResult {
    const entityType = args.entity_type as ConsolidatedEntityType;
    const id = String(args.id);

    if (!entityType) {
        return {
            content: [{ type: "text", text: "Error: 'entity_type' parameter is required" }],
            isError: true,
        };
    }
    if (!id) {
        return {
            content: [{ type: "text", text: "Error: 'id' parameter is required" }],
            isError: true,
        };
    }

    switch (entityType) {
        case "workflow": {
            const workflow = store.getWorkflow(id);
            if (!workflow) {
                return { content: [{ type: "text", text: `Workflow '${id}' not found` }], isError: true };
            }
            return { content: [{ type: "text", text: JSON.stringify(workflow, null, 2) }] };
        }
        case "capability": {
            const capability = store.getCapability(id);
            if (!capability) {
                return { content: [{ type: "text", text: `Capability '${id}' not found` }], isError: true };
            }
            return { content: [{ type: "text", text: JSON.stringify(capability, null, 2) }] };
        }
        case "persona": {
            const persona = store.getPersona(id);
            if (!persona) {
                return { content: [{ type: "text", text: `Persona '${id}' not found` }], isError: true };
            }
            return { content: [{ type: "text", text: JSON.stringify(persona, null, 2) }] };
        }
        case "component": {
            const component = store.getComponent(id);
            if (!component) {
                return { content: [{ type: "text", text: `Component '${id}' not found` }], isError: true };
            }
            return { content: [{ type: "text", text: JSON.stringify(component, null, 2) }] };
        }
        case "tokens": {
            const tokens = store.getTokens(id);
            if (!tokens) {
                return { content: [{ type: "text", text: `Tokens '${id}' not found` }], isError: true };
            }
            return { content: [{ type: "text", text: JSON.stringify(tokens, null, 2) }] };
        }
        case "view": {
            const view = store.getView(id);
            if (!view) {
                return { content: [{ type: "text", text: `View '${id}' not found` }], isError: true };
            }
            return { content: [{ type: "text", text: JSON.stringify(view, null, 2) }] };
        }
        case "interaction": {
            const interaction = store.getInteraction(id);
            if (!interaction) {
                return { content: [{ type: "text", text: `Interaction pattern '${id}' not found` }], isError: true };
            }
            return { content: [{ type: "text", text: JSON.stringify(interaction, null, 2) }] };
        }
        case "test-result": {
            const testResult = store.getTestResult(id);
            if (!testResult) {
                return { content: [{ type: "text", text: `Test result '${id}' not found` }], isError: true };
            }
            return { content: [{ type: "text", text: JSON.stringify(testResult, null, 2) }] };
        }
        default: {
            const badType: string = entityType;
            return {
                content: [{ type: "text", text: `Unknown entity type: ${badType}` }],
                isError: true,
            };
        }
    }
}

function handleCreateTool(store: DesignDocsStore, args: Record<string, unknown>): ToolResult {
    const entityType = args.entity_type as ConsolidatedEntityType;

    if (!entityType) {
        return {
            content: [{ type: "text", text: "Error: 'entity_type' parameter is required" }],
            isError: true,
        };
    }

    switch (entityType) {
        case "workflow": {
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
                sources: args.sources as CreateWorkflowInput["sources"],
            };
            const result = store.createWorkflow(input);
            if (result.success) {
                return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
            }
            return { content: [{ type: "text", text: result.error ?? "Failed to create workflow" }], isError: true };
        }
        case "capability": {
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
                sources: args.sources as CreateCapabilityInput["sources"],
            };
            const result = store.createCapability(input);
            if (result.success) {
                return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
            }
            return { content: [{ type: "text", text: result.error ?? "Failed to create capability" }], isError: true };
        }
        case "persona": {
            const characteristics = args.characteristics as CreatePersonaInput["characteristics"] | undefined;
            const input: CreatePersonaInput = {
                id: toStringOrDefault(args.id),
                name: toStringOrDefault(args.name),
                role: toStringOrDefault(args.role),
                quote: args.quote as string | undefined,
                bio: args.bio as string | undefined,
                characteristics: characteristics ?? { expertise: "novice" },
                motivations: args.motivations as string[] | undefined,
                behaviors: args.behaviors as string[] | undefined,
                goals: (args.goals as string[]) ?? [],
                frustrations: args.frustrations as string[] | undefined,
                context: args.context as CreatePersonaInput["context"],
                workflows: args.workflows as string[] | undefined,
                sources: args.sources as CreatePersonaInput["sources"],
            };
            const result = store.createPersona(input);
            if (result.success) {
                return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
            }
            return { content: [{ type: "text", text: result.error ?? "Failed to create persona" }], isError: true };
        }
        case "component": {
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
                sources: args.sources as CreateComponentInput["sources"],
            };
            const result = store.createComponent(input);
            if (result.success) {
                return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
            }
            return { content: [{ type: "text", text: result.error ?? "Failed to create component" }], isError: true };
        }
        case "tokens": {
            const data = {
                id: toStringOrDefault(args.id),
                name: toStringOrDefault(args.name),
                description: args.description as string | undefined,
                extends: args.extends as string | undefined,
                colors: args.colors as CreateTokensInput["colors"],
                typography: args.typography as CreateTokensInput["typography"],
                spacing: args.spacing as CreateTokensInput["spacing"],
                radii: args.radii as Record<string, string> | undefined,
                shadows: args.shadows as Record<string, string> | undefined,
                motion: args.motion as CreateTokensInput["motion"],
                breakpoints: args.breakpoints as Record<string, string> | undefined,
            };
            const result = store.createTokens(data);
            if (result.success) {
                return { content: [{ type: "text", text: JSON.stringify({ success: true, id: data.id, created: true }, null, 2) }] };
            }
            return { content: [{ type: "text", text: result.error ?? "Failed to create tokens" }], isError: true };
        }
        case "view": {
            const data = {
                id: toStringOrDefault(args.id),
                name: toStringOrDefault(args.name),
                description: args.description as string | undefined,
                workflows: args.workflows as string[] | undefined,
                layout: args.layout as CreateViewInput["layout"],
                states: args.states as CreateViewInput["states"],
                routes: args.routes as CreateViewInput["routes"],
                data_requirements: args.data_requirements as CreateViewInput["data_requirements"],
            };
            const result = store.createView(data);
            if (result.success) {
                return { content: [{ type: "text", text: JSON.stringify({ success: true, id: data.id, created: true }, null, 2) }] };
            }
            return { content: [{ type: "text", text: result.error ?? "Failed to create view" }], isError: true };
        }
        case "interaction": {
            const data = {
                id: toStringOrDefault(args.id),
                name: toStringOrDefault(args.name),
                description: args.description as string | undefined,
                interaction: args.interaction as CreateInteractionInput["interaction"],
                applies_to: args.applies_to as string[] | undefined,
            };
            const result = store.createInteraction(data);
            if (result.success) {
                return { content: [{ type: "text", text: JSON.stringify({ success: true, id: data.id, created: true }, null, 2) }] };
            }
            return { content: [{ type: "text", text: result.error ?? "Failed to create interaction pattern" }], isError: true };
        }
        case "test-result": {
            const data = {
                id: toStringOrDefault(args.id),
                workflow_id: toStringOrDefault(args.workflow_id),
                persona_id: toStringOrDefault(args.persona_id),
                test_type: args.test_type as "simulated" | "real",
                date: toStringOrDefault(args.date),
                status: args.status as "passed" | "failed" | "partial",
                confidence: args.confidence as "high" | "medium" | "low" | undefined,
                success_criteria_results: args.success_criteria_results as CreateTestResultInput["success_criteria_results"],
                issues: args.issues as CreateTestResultInput["issues"],
                summary: args.summary as string | undefined,
                participants: args.participants as number | undefined,
                quotes: args.quotes as string[] | undefined,
                recommendations: args.recommendations as string[] | undefined,
                sources: args.sources as CreateTestResultInput["sources"],
            };
            const result = store.createTestResult(data);
            if (result.success) {
                return { content: [{ type: "text", text: JSON.stringify({ success: true, id: data.id, created: true }, null, 2) }] };
            }
            return { content: [{ type: "text", text: result.error ?? "Failed to create test result" }], isError: true };
        }
        default: {
            const badType: string = entityType;
            return {
                content: [{ type: "text", text: `Unknown entity type: ${badType}` }],
                isError: true,
            };
        }
    }
}

function handleUpdateTool(store: DesignDocsStore, args: Record<string, unknown>): ToolResult {
    const entityType = args.entity_type as ConsolidatedEntityType;
    const id = toStringOrDefault(args.id);

    if (!entityType) {
        return {
            content: [{ type: "text", text: "Error: 'entity_type' parameter is required" }],
            isError: true,
        };
    }
    if (!id) {
        return {
            content: [{ type: "text", text: "Error: 'id' parameter is required" }],
            isError: true,
        };
    }

    switch (entityType) {
        case "workflow": {
            const updates: UpdateWorkflowInput = {};
            if (args.name !== undefined) {updates.name = toStringOrDefault(args.name);}
            if (args.category !== undefined) {updates.category = args.category as UpdateWorkflowInput["category"];}
            if (args.goal !== undefined) {updates.goal = toStringOrDefault(args.goal);}
            if (args.validated !== undefined) {updates.validated = args.validated as boolean;}
            if (args.personas !== undefined) {updates.personas = args.personas as string[];}
            if (args.requires_capabilities !== undefined) {updates.requires_capabilities = args.requires_capabilities as string[];}
            if (args.suggested_components !== undefined) {updates.suggested_components = args.suggested_components as string[];}
            if (args.sources !== undefined) {updates.sources = args.sources as UpdateWorkflowInput["sources"];}

            const result = store.updateWorkflow(id, updates);
            if (result.success) {
                return { content: [{ type: "text", text: JSON.stringify({ success: true, id }, null, 2) }] };
            }
            return { content: [{ type: "text", text: result.error ?? "Failed to update workflow" }], isError: true };
        }
        case "capability": {
            const updates: UpdateCapabilityInput = {};
            if (args.name !== undefined) {updates.name = toStringOrDefault(args.name);}
            if (args.category !== undefined) {updates.category = args.category as UpdateCapabilityInput["category"];}
            if (args.description !== undefined) {updates.description = toStringOrDefault(args.description);}
            if (args.status !== undefined) {updates.status = args.status as UpdateCapabilityInput["status"];}
            if (args.algorithms !== undefined) {updates.algorithms = args.algorithms as string[];}
            if (args.requirements !== undefined) {updates.requirements = args.requirements as string[];}
            if (args.sources !== undefined) {updates.sources = args.sources as UpdateCapabilityInput["sources"];}

            const result = store.updateCapability(id, updates);
            if (result.success) {
                return { content: [{ type: "text", text: JSON.stringify({ success: true, id }, null, 2) }] };
            }
            return { content: [{ type: "text", text: result.error ?? "Failed to update capability" }], isError: true };
        }
        case "persona": {
            const updates: UpdatePersonaInput = {};
            if (args.name !== undefined) {updates.name = toStringOrDefault(args.name);}
            if (args.role !== undefined) {updates.role = toStringOrDefault(args.role);}
            if (args.quote !== undefined) {updates.quote = toStringOrDefault(args.quote);}
            if (args.bio !== undefined) {updates.bio = toStringOrDefault(args.bio);}
            if (args.characteristics !== undefined) {updates.characteristics = args.characteristics as UpdatePersonaInput["characteristics"];}
            if (args.motivations !== undefined) {updates.motivations = args.motivations as string[];}
            if (args.behaviors !== undefined) {updates.behaviors = args.behaviors as string[];}
            if (args.goals !== undefined) {updates.goals = args.goals as string[];}
            if (args.frustrations !== undefined) {updates.frustrations = args.frustrations as string[];}
            if (args.context !== undefined) {updates.context = args.context as UpdatePersonaInput["context"];}
            if (args.sources !== undefined) {updates.sources = args.sources as UpdatePersonaInput["sources"];}

            const result = store.updatePersona(id, updates);
            if (result.success) {
                return { content: [{ type: "text", text: JSON.stringify({ success: true, id }, null, 2) }] };
            }
            return { content: [{ type: "text", text: result.error ?? "Failed to update persona" }], isError: true };
        }
        case "component": {
            const updates: UpdateComponentInput = {};
            if (args.name !== undefined) {updates.name = toStringOrDefault(args.name);}
            if (args.category !== undefined) {updates.category = args.category as UpdateComponentInput["category"];}
            if (args.description !== undefined) {updates.description = toStringOrDefault(args.description);}
            if (args.status !== undefined) {updates.status = args.status as UpdateComponentInput["status"];}
            if (args.implements_capabilities !== undefined) {updates.implements_capabilities = args.implements_capabilities as string[];}
            if (args.dependencies !== undefined) {updates.dependencies = args.dependencies as string[];}
            if (args.sources !== undefined) {updates.sources = args.sources as UpdateComponentInput["sources"];}

            const result = store.updateComponent(id, updates);
            if (result.success) {
                return { content: [{ type: "text", text: JSON.stringify({ success: true, id }, null, 2) }] };
            }
            return { content: [{ type: "text", text: result.error ?? "Failed to update component" }], isError: true };
        }
        case "tokens": {
            const updates: UpdateTokensInput = {};
            if (args.name !== undefined) {updates.name = toStringOrDefault(args.name);}
            if (args.description !== undefined) {updates.description = args.description as string;}
            if (args.extends !== undefined) {updates.extends = args.extends as string;}
            if (args.colors !== undefined) {updates.colors = args.colors as CreateTokensInput["colors"];}
            if (args.typography !== undefined) {updates.typography = args.typography as CreateTokensInput["typography"];}
            if (args.spacing !== undefined) {updates.spacing = args.spacing as CreateTokensInput["spacing"];}
            if (args.radii !== undefined) {updates.radii = args.radii as Record<string, string>;}
            if (args.shadows !== undefined) {updates.shadows = args.shadows as Record<string, string>;}
            if (args.motion !== undefined) {updates.motion = args.motion as CreateTokensInput["motion"];}
            if (args.breakpoints !== undefined) {updates.breakpoints = args.breakpoints as Record<string, string>;}

            const result = store.updateTokens(id, updates);
            if (result.success) {
                return { content: [{ type: "text", text: JSON.stringify({ success: true, id, updated: true }, null, 2) }] };
            }
            return { content: [{ type: "text", text: result.error ?? "Failed to update tokens" }], isError: true };
        }
        case "view": {
            const updates: UpdateViewInput = {};
            if (args.name !== undefined) {updates.name = toStringOrDefault(args.name);}
            if (args.description !== undefined) {updates.description = args.description as string;}
            if (args.workflows !== undefined) {updates.workflows = args.workflows as string[];}
            if (args.layout !== undefined) {updates.layout = args.layout as CreateViewInput["layout"];}
            if (args.states !== undefined) {updates.states = args.states as CreateViewInput["states"];}
            if (args.routes !== undefined) {updates.routes = args.routes as CreateViewInput["routes"];}
            if (args.data_requirements !== undefined) {updates.data_requirements = args.data_requirements as CreateViewInput["data_requirements"];}

            const result = store.updateView(id, updates);
            if (result.success) {
                return { content: [{ type: "text", text: JSON.stringify({ success: true, id, updated: true }, null, 2) }] };
            }
            return { content: [{ type: "text", text: result.error ?? "Failed to update view" }], isError: true };
        }
        case "interaction": {
            const updates: UpdateInteractionInput = {};
            if (args.name !== undefined) {updates.name = toStringOrDefault(args.name);}
            if (args.description !== undefined) {updates.description = args.description as string;}
            if (args.interaction !== undefined) {updates.interaction = args.interaction as CreateInteractionInput["interaction"];}
            if (args.applies_to !== undefined) {updates.applies_to = args.applies_to as string[];}

            const result = store.updateInteraction(id, updates);
            if (result.success) {
                return { content: [{ type: "text", text: JSON.stringify({ success: true, id, updated: true }, null, 2) }] };
            }
            return { content: [{ type: "text", text: result.error ?? "Failed to update interaction pattern" }], isError: true };
        }
        case "test-result": {
            const updates: UpdateTestResultInput = {};
            if (args.status !== undefined) {updates.status = args.status as "passed" | "failed" | "partial";}
            if (args.confidence !== undefined) {updates.confidence = args.confidence as "high" | "medium" | "low";}
            if (args.success_criteria_results !== undefined) {updates.success_criteria_results = args.success_criteria_results as UpdateTestResultInput["success_criteria_results"];}
            if (args.issues !== undefined) {updates.issues = args.issues as UpdateTestResultInput["issues"];}
            if (args.summary !== undefined) {updates.summary = args.summary as string;}
            if (args.participants !== undefined) {updates.participants = args.participants as number;}
            if (args.quotes !== undefined) {updates.quotes = args.quotes as string[];}
            if (args.recommendations !== undefined) {updates.recommendations = args.recommendations as string[];}
            if (args.sources !== undefined) {updates.sources = args.sources as UpdateTestResultInput["sources"];}

            const result = store.updateTestResult(id, updates);
            if (result.success) {
                return { content: [{ type: "text", text: JSON.stringify({ success: true, id, updated: true }, null, 2) }] };
            }
            return { content: [{ type: "text", text: result.error ?? "Failed to update test result" }], isError: true };
        }
        default: {
            const badType: string = entityType;
            return {
                content: [{ type: "text", text: `Unknown entity type: ${badType}` }],
                isError: true,
            };
        }
    }
}

function handleDeleteTool(store: DesignDocsStore, args: Record<string, unknown>): ToolResult {
    const entityType = args.entity_type as ConsolidatedEntityType;
    const id = toStringOrDefault(args.id);
    const force = args.force as boolean | undefined;

    if (!entityType) {
        return {
            content: [{ type: "text", text: "Error: 'entity_type' parameter is required" }],
            isError: true,
        };
    }
    if (!id) {
        return {
            content: [{ type: "text", text: "Error: 'id' parameter is required" }],
            isError: true,
        };
    }

    switch (entityType) {
        case "workflow": {
            const result = store.deleteWorkflow(id);
            if (result.success) {
                return { content: [{ type: "text", text: JSON.stringify({ success: true, id, deleted: true }, null, 2) }] };
            }
            return { content: [{ type: "text", text: result.error ?? "Failed to delete workflow" }], isError: true };
        }
        case "capability": {
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
            return { content: [{ type: "text", text: result.error ?? "Failed to delete capability" }], isError: true };
        }
        case "persona": {
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
            return { content: [{ type: "text", text: result.error ?? "Failed to delete persona" }], isError: true };
        }
        case "component": {
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
            return { content: [{ type: "text", text: result.error ?? "Failed to delete component" }], isError: true };
        }
        case "tokens": {
            const result = store.deleteTokens(id, { force });
            if (result.success) {
                return { content: [{ type: "text", text: JSON.stringify({ success: true, id, deleted: true }, null, 2) }] };
            }
            return { content: [{ type: "text", text: result.error ?? "Failed to delete tokens" }], isError: true };
        }
        case "view": {
            const result = store.deleteView(id);
            if (result.success) {
                return { content: [{ type: "text", text: JSON.stringify({ success: true, id, deleted: true }, null, 2) }] };
            }
            return { content: [{ type: "text", text: result.error ?? "Failed to delete view" }], isError: true };
        }
        case "interaction": {
            const result = store.deleteInteraction(id, { force });
            if (result.success) {
                return { content: [{ type: "text", text: JSON.stringify({ success: true, id, deleted: true }, null, 2) }] };
            }
            return { content: [{ type: "text", text: result.error ?? "Failed to delete interaction pattern" }], isError: true };
        }
        case "test-result": {
            const result = store.deleteTestResult(id);
            if (result.success) {
                return { content: [{ type: "text", text: JSON.stringify({ success: true, id, deleted: true }, null, 2) }] };
            }
            return { content: [{ type: "text", text: result.error ?? "Failed to delete test result" }], isError: true };
        }
        default: {
            const badType: string = entityType;
            return {
                content: [{ type: "text", text: `Unknown entity type: ${badType}` }],
                isError: true,
            };
        }
    }
}

function handleLinkTool(store: DesignDocsStore, args: Record<string, unknown>): ToolResult {
    const action = args.action as "link" | "unlink";
    const fromType = toStringOrDefault(args.from_type) as EntityType;
    const fromId = toStringOrDefault(args.from_id);
    const toType = toStringOrDefault(args.to_type) as EntityType;
    const toId = toStringOrDefault(args.to_id);
    const relationship = toStringOrDefault(args.relationship) as RelationshipType;

    if (!action || !["link", "unlink"].includes(action)) {
        return {
            content: [{ type: "text", text: "Error: 'action' parameter is required and must be 'link' or 'unlink'" }],
            isError: true,
        };
    }

    if (action === "link") {
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
        return { content: [{ type: "text", text: result.error ?? "Failed to link entities" }], isError: true };
    }
    // action === "unlink"
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
    return { content: [{ type: "text", text: result.error ?? "Failed to unlink entities" }], isError: true };
}

function handleValidateTool(store: DesignDocsStore, args: Record<string, unknown>): ToolResult {
    const check = args.check as "all" | "orphans" | "gaps" | "schema";

    if (!check) {
        return {
            content: [{ type: "text", text: "Error: 'check' parameter is required" }],
            isError: true,
        };
    }

    switch (check) {
        case "all": {
            const result = store.validate();
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
        case "orphans": {
            const entityType = args.entity_type as EntityType | undefined;
            const orphans = store.findOrphans(entityType);
            return { content: [{ type: "text", text: JSON.stringify(orphans, null, 2) }] };
        }
        case "gaps": {
            const gaps = store.findGaps();
            return { content: [{ type: "text", text: JSON.stringify(gaps, null, 2) }] };
        }
        case "schema": {
            const warnings = store.getSchemaWarnings();
            const summary = {
                totalWarnings: warnings.length,
                byEntityType: {} as Record<string, number>,
                bySeverity: {} as Record<string, number>,
                warnings: warnings,
            };
            for (const warning of warnings) {
                summary.byEntityType[warning.entityType] = (summary.byEntityType[warning.entityType] ?? 0) + 1;
                summary.bySeverity[warning.severity] = (summary.bySeverity[warning.severity] ?? 0) + 1;
            }
            return { content: [{ type: "text", text: JSON.stringify(summary, null, 2) }] };
        }
        default: {
            const badCheck: string = check;
            return {
                content: [{ type: "text", text: `Unknown check type: ${badCheck}` }],
                isError: true,
            };
        }
    }
}

function handleAnalyzeTool(store: DesignDocsStore, args: Record<string, unknown>): ToolResult {
    const report = args.report as "coverage" | "priority" | "test-coverage";

    if (!report) {
        return {
            content: [{ type: "text", text: "Error: 'report' parameter is required" }],
            isError: true,
        };
    }

    switch (report) {
        case "coverage": {
            const coverageReport = store.coverageReport();
            return { content: [{ type: "text", text: JSON.stringify(coverageReport, null, 2) }] };
        }
        case "priority": {
            const focus = args.focus as "capability" | "workflow";
            const limit = args.limit as number | undefined;

            if (!focus || !["capability", "workflow"].includes(focus)) {
                return {
                    content: [{ type: "text", text: "Error: 'focus' parameter is required and must be 'capability' or 'workflow'" }],
                    isError: true,
                };
            }

            const suggestions = store.suggestPriority({ focus, limit });
            return { content: [{ type: "text", text: JSON.stringify(suggestions, null, 2) }] };
        }
        case "test-coverage": {
            const coverage = store.getTestCoverage();
            return { content: [{ type: "text", text: JSON.stringify(coverage, null, 2) }] };
        }
        default: {
            const badReport: string = report;
            return {
                content: [{ type: "text", text: `Unknown report type: ${badReport}` }],
                isError: true,
            };
        }
    }
}

function handleExportTool(store: DesignDocsStore, args: Record<string, unknown>): ToolResult {
    const format = args.format as "diagram" | "tests";

    if (!format) {
        return {
            content: [{ type: "text", text: "Error: 'format' parameter is required" }],
            isError: true,
        };
    }

    switch (format) {
        case "diagram": {
            const focus = args.focus as string;
            const depth = args.depth as number | undefined;

            if (!focus) {
                return {
                    content: [{ type: "text", text: "Error: 'focus' parameter is required for diagram export" }],
                    isError: true,
                };
            }

            const diagramOptions: DiagramOptions = { focus, depth };
            const diagram = store.exportDiagram(diagramOptions);
            return { content: [{ type: "text", text: diagram }] };
        }
        case "tests": {
            const workflowId = args.workflow_id as string;
            const testFormat = args.test_format as TestGenOptions["format"];

            if (!workflowId) {
                return {
                    content: [{ type: "text", text: "Error: 'workflow_id' parameter is required for test export" }],
                    isError: true,
                };
            }

            const tests = store.generateTests(workflowId, { format: testFormat });
            return { content: [{ type: "text", text: tests }] };
        }
        default: {
            const badFormat: string = format;
            return {
                content: [{ type: "text", text: `Unknown export format: ${badFormat}` }],
                isError: true,
            };
        }
    }
}

function handleRelationsTool(store: DesignDocsStore, args: Record<string, unknown>): ToolResult {
    const direction = args.direction as "dependencies" | "dependents";
    const entityType = String(args.entity_type) as EntityType;
    const id = String(args.id);

    if (!direction || !["dependencies", "dependents"].includes(direction)) {
        return {
            content: [{ type: "text", text: "Error: 'direction' parameter is required and must be 'dependencies' or 'dependents'" }],
            isError: true,
        };
    }
    if (!entityType) {
        return {
            content: [{ type: "text", text: "Error: 'entity_type' parameter is required" }],
            isError: true,
        };
    }
    if (!id) {
        return {
            content: [{ type: "text", text: "Error: 'id' parameter is required" }],
            isError: true,
        };
    }

    if (direction === "dependencies") {
        const deps = store.getDependencies(entityType, id);
        if (!deps) {
            return { content: [{ type: "text", text: `${entityType} '${id}' not found` }], isError: true };
        }
        return { content: [{ type: "text", text: JSON.stringify(deps, null, 2) }] };
    }
    // direction === "dependents"
    const deps = store.getDependents(entityType, id);
    if (!deps) {
        return { content: [{ type: "text", text: `${entityType} '${id}' not found` }], isError: true };
    }
    return { content: [{ type: "text", text: JSON.stringify(deps, null, 2) }] };
}
