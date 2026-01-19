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
    EntityType,
    RelationshipType,
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
                    sources: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                title: { type: "string", description: "Source title" },
                                url: { type: "string", description: "Source URL" },
                                summary: { type: "string", description: "Optional summary of the source" },
                                bibliography: {
                                    type: "object",
                                    properties: {
                                        author: { type: "string" },
                                        date: { type: "string" },
                                        publisher: { type: "string" },
                                        version: { type: "string" },
                                    },
                                    description: "Optional bibliographic information",
                                },
                            },
                            required: ["title", "url"],
                        },
                        description: "References to source materials for this capability",
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
                    quote: {
                        type: "string",
                        description: "A humanizing tagline that captures the persona's attitude/perspective",
                    },
                    bio: {
                        type: "string",
                        description: "Brief narrative description bringing the persona to life",
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
                    motivations: {
                        type: "array",
                        items: { type: "string" },
                        description: "List of underlying drivers - why they care about their goals",
                    },
                    behaviors: {
                        type: "array",
                        items: { type: "string" },
                        description: "List of behaviors - how they currently work, tools they use, patterns",
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
                    context: {
                        type: "object",
                        properties: {
                            frequency: {
                                type: "string",
                                enum: ["daily", "weekly", "monthly", "as-needed"],
                                description: "How often they use the product",
                            },
                            devices: {
                                type: "array",
                                items: {
                                    type: "string",
                                    enum: ["desktop", "laptop", "tablet", "mobile"],
                                },
                                description: "Devices they use to access the product",
                            },
                            voluntary: {
                                type: "boolean",
                                description: "Whether usage is by choice (true) or required by job (false)",
                            },
                        },
                        description: "Usage context for how they interact with the product",
                    },
                    workflows: {
                        type: "array",
                        items: { type: "string" },
                        description: "List of workflow IDs this persona participates in",
                    },
                    sources: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                title: { type: "string", description: "Source title" },
                                url: { type: "string", description: "Source URL" },
                                summary: { type: "string", description: "Optional summary of the source" },
                                bibliography: {
                                    type: "object",
                                    properties: {
                                        author: { type: "string" },
                                        date: { type: "string" },
                                        publisher: { type: "string" },
                                        version: { type: "string" },
                                    },
                                    description: "Optional bibliographic information",
                                },
                            },
                            required: ["title", "url"],
                        },
                        description: "References to source materials for this persona",
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
                    sources: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                title: { type: "string", description: "Source title" },
                                url: { type: "string", description: "Source URL" },
                                summary: { type: "string", description: "Optional summary of the source" },
                                bibliography: {
                                    type: "object",
                                    properties: {
                                        author: { type: "string" },
                                        date: { type: "string" },
                                        publisher: { type: "string" },
                                        version: { type: "string" },
                                    },
                                    description: "Optional bibliographic information",
                                },
                            },
                            required: ["title", "url"],
                        },
                        description: "References to source materials for this component",
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
                    sources: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                title: { type: "string", description: "Source title" },
                                url: { type: "string", description: "Source URL" },
                                summary: { type: "string", description: "Optional summary of the source" },
                                bibliography: {
                                    type: "object",
                                    properties: {
                                        author: { type: "string" },
                                        date: { type: "string" },
                                        publisher: { type: "string" },
                                        version: { type: "string" },
                                    },
                                    description: "Optional bibliographic information",
                                },
                            },
                            required: ["title", "url"],
                        },
                        description: "References to source materials for this workflow",
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
                    sources: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                title: { type: "string", description: "Source title" },
                                url: { type: "string", description: "Source URL" },
                                summary: { type: "string", description: "Optional summary of the source" },
                                bibliography: {
                                    type: "object",
                                    properties: {
                                        author: { type: "string" },
                                        date: { type: "string" },
                                        publisher: { type: "string" },
                                        version: { type: "string" },
                                    },
                                    description: "Optional bibliographic information",
                                },
                            },
                            required: ["title", "url"],
                        },
                        description: "New list of source references",
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
                    sources: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                title: { type: "string", description: "Source title" },
                                url: { type: "string", description: "Source URL" },
                                summary: { type: "string", description: "Optional summary of the source" },
                                bibliography: {
                                    type: "object",
                                    properties: {
                                        author: { type: "string" },
                                        date: { type: "string" },
                                        publisher: { type: "string" },
                                        version: { type: "string" },
                                    },
                                    description: "Optional bibliographic information",
                                },
                            },
                            required: ["title", "url"],
                        },
                        description: "New list of source references",
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
                    quote: {
                        type: "string",
                        description: "New humanizing tagline that captures the persona's attitude/perspective",
                    },
                    bio: {
                        type: "string",
                        description: "New brief narrative description bringing the persona to life",
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
                    motivations: {
                        type: "array",
                        items: { type: "string" },
                        description: "New list of underlying drivers - why they care about their goals",
                    },
                    behaviors: {
                        type: "array",
                        items: { type: "string" },
                        description: "New list of behaviors - how they currently work, tools they use, patterns",
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
                    context: {
                        type: "object",
                        properties: {
                            frequency: {
                                type: "string",
                                enum: ["daily", "weekly", "monthly", "as-needed"],
                                description: "How often they use the product",
                            },
                            devices: {
                                type: "array",
                                items: {
                                    type: "string",
                                    enum: ["desktop", "laptop", "tablet", "mobile"],
                                },
                                description: "Devices they use to access the product",
                            },
                            voluntary: {
                                type: "boolean",
                                description: "Whether usage is by choice (true) or required by job (false)",
                            },
                        },
                        description: "New usage context for how they interact with the product",
                    },
                    sources: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                title: { type: "string", description: "Source title" },
                                url: { type: "string", description: "Source URL" },
                                summary: { type: "string", description: "Optional summary of the source" },
                                bibliography: {
                                    type: "object",
                                    properties: {
                                        author: { type: "string" },
                                        date: { type: "string" },
                                        publisher: { type: "string" },
                                        version: { type: "string" },
                                    },
                                    description: "Optional bibliographic information",
                                },
                            },
                            required: ["title", "url"],
                        },
                        description: "New list of source references",
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
                    sources: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                title: { type: "string", description: "Source title" },
                                url: { type: "string", description: "Source URL" },
                                summary: { type: "string", description: "Optional summary of the source" },
                                bibliography: {
                                    type: "object",
                                    properties: {
                                        author: { type: "string" },
                                        date: { type: "string" },
                                        publisher: { type: "string" },
                                        version: { type: "string" },
                                    },
                                    description: "Optional bibliographic information",
                                },
                            },
                            required: ["title", "url"],
                        },
                        description: "New list of source references",
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
        // ============= TOKENS TOOLS =============
        {
            name: "design_create_tokens",
            description: "Create a new design token set with colors, typography, spacing, and effects",
            inputSchema: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        description: "Unique token set ID (kebab-case, e.g., 'default-theme', 'dark-mode')",
                    },
                    name: {
                        type: "string",
                        description: "Human-readable name (e.g., 'Default Light Theme')",
                    },
                    description: {
                        type: "string",
                        description: "Description of this token set",
                    },
                    extends: {
                        type: "string",
                        description: "ID of parent token set to extend",
                    },
                    colors: {
                        type: "object",
                        description: "Color scales and semantic colors (required: neutral)",
                    },
                    typography: {
                        type: "object",
                        description: "Typography system (fonts, sizes, weights, styles)",
                    },
                    spacing: {
                        type: "object",
                        description: "Spacing scale and semantic spacing",
                    },
                    radii: {
                        type: "object",
                        description: "Border radius values",
                    },
                    shadows: {
                        type: "object",
                        description: "Shadow definitions for elevation",
                    },
                    motion: {
                        type: "object",
                        description: "Animation durations and easings",
                    },
                    breakpoints: {
                        type: "object",
                        description: "Responsive breakpoint values",
                    },
                },
                required: ["id", "name", "colors", "typography", "spacing"],
            },
        },
        {
            name: "design_update_tokens",
            description: "Update an existing token set",
            inputSchema: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        description: "Token set ID to update",
                    },
                    name: { type: "string" },
                    description: { type: "string" },
                    extends: { type: "string" },
                    colors: { type: "object" },
                    typography: { type: "object" },
                    spacing: { type: "object" },
                    radii: { type: "object" },
                    shadows: { type: "object" },
                    motion: { type: "object" },
                    breakpoints: { type: "object" },
                },
                required: ["id"],
            },
        },
        {
            name: "design_delete_tokens",
            description: "Delete a token set. Warns if other token sets extend it.",
            inputSchema: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        description: "Token set ID to delete",
                    },
                    force: {
                        type: "boolean",
                        description: "Force delete even if extended by other tokens (default: false)",
                    },
                },
                required: ["id"],
            },
        },
        // ============= VIEW TOOLS =============
        {
            name: "design_create_view",
            description: "Create a new view (screen layout) with zones, states, and routes",
            inputSchema: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        description: "Unique view ID (pattern: V01, V02, etc.)",
                    },
                    name: {
                        type: "string",
                        description: "Human-readable name (e.g., 'Analytics Dashboard')",
                    },
                    description: {
                        type: "string",
                        description: "Description of the view's purpose",
                    },
                    workflows: {
                        type: "array",
                        items: { type: "string" },
                        description: "Workflow IDs that use this view",
                    },
                    layout: {
                        type: "object",
                        description: "Layout definition with type and zones",
                    },
                    states: {
                        type: "array",
                        description: "View states (empty, loading, error, etc.)",
                    },
                    routes: {
                        type: "array",
                        description: "Route definitions for navigation",
                    },
                    data_requirements: {
                        type: "array",
                        description: "Data sources required by this view",
                    },
                },
                required: ["id", "name", "layout"],
            },
        },
        {
            name: "design_update_view",
            description: "Update an existing view",
            inputSchema: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        description: "View ID to update",
                    },
                    name: { type: "string" },
                    description: { type: "string" },
                    workflows: { type: "array", items: { type: "string" } },
                    layout: { type: "object" },
                    states: { type: "array" },
                    routes: { type: "array" },
                    data_requirements: { type: "array" },
                },
                required: ["id"],
            },
        },
        {
            name: "design_delete_view",
            description: "Delete a view",
            inputSchema: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        description: "View ID to delete",
                    },
                },
                required: ["id"],
            },
        },
        // ============= INTERACTION TOOLS =============
        {
            name: "design_create_interaction",
            description: "Create a new reusable interaction pattern with states, transitions, and accessibility",
            inputSchema: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        description: "Unique pattern ID (kebab-case, e.g., 'button-interaction')",
                    },
                    name: {
                        type: "string",
                        description: "Human-readable name",
                    },
                    description: {
                        type: "string",
                        description: "Description of this interaction pattern",
                    },
                    interaction: {
                        type: "object",
                        description: "Interaction definition (states, transitions, microinteractions, accessibility)",
                    },
                    applies_to: {
                        type: "array",
                        items: { type: "string" },
                        description: "Component categories this pattern applies to",
                    },
                },
                required: ["id", "name", "interaction"],
            },
        },
        {
            name: "design_update_interaction",
            description: "Update an existing interaction pattern",
            inputSchema: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        description: "Interaction pattern ID to update",
                    },
                    name: { type: "string" },
                    description: { type: "string" },
                    interaction: { type: "object" },
                    applies_to: { type: "array", items: { type: "string" } },
                },
                required: ["id"],
            },
        },
        {
            name: "design_delete_interaction",
            description: "Delete an interaction pattern. Warns if components reference it.",
            inputSchema: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        description: "Interaction pattern ID to delete",
                    },
                    force: {
                        type: "boolean",
                        description: "Force delete even if used by components (default: false)",
                    },
                },
                required: ["id"],
            },
        },
        // ============= TEST RESULT TOOLS =============
        {
            name: "design_create_test_result",
            description: "Create a new test result for a workflow-persona combination. Use for simulated (AI-driven) or real user testing.",
            inputSchema: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        description: "Test result ID (format: TR-{WorkflowID}-{PersonaID}-{sequence}, e.g., TR-W01-analyst-alex-001)",
                    },
                    workflow_id: {
                        type: "string",
                        description: "Workflow ID being tested (e.g., W01)",
                    },
                    persona_id: {
                        type: "string",
                        description: "Persona ID used for testing (e.g., analyst-alex)",
                    },
                    test_type: {
                        type: "string",
                        enum: ["simulated", "real"],
                        description: "Type of test: simulated (AI-driven cognitive walkthrough) or real (actual user testing)",
                    },
                    date: {
                        type: "string",
                        description: "Test date in ISO 8601 format (e.g., 2024-01-15)",
                    },
                    status: {
                        type: "string",
                        enum: ["passed", "failed", "partial"],
                        description: "Overall test result status",
                    },
                    confidence: {
                        type: "string",
                        enum: ["high", "medium", "low"],
                        description: "Confidence level in findings (default: medium)",
                    },
                    success_criteria_results: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                criterion: { type: "string" },
                                target: { type: "string" },
                                actual: { type: "string" },
                                passed: { type: "boolean" },
                                notes: { type: "string" },
                            },
                            required: ["criterion", "target", "passed"],
                        },
                        description: "Results for each success criterion",
                    },
                    issues: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                severity: { type: "string", enum: ["critical", "major", "minor"] },
                                description: { type: "string" },
                                workflow_step: { type: "string" },
                                persona_factor: { type: "string" },
                                affected_components: { type: "array", items: { type: "string" } },
                                affected_capabilities: { type: "array", items: { type: "string" } },
                                recommendation: { type: "string" },
                                evidence: { type: "string" },
                            },
                            required: ["severity", "description"],
                        },
                        description: "Issues found during testing",
                    },
                    summary: {
                        type: "string",
                        description: "Brief narrative summary of the test",
                    },
                    participants: {
                        type: "number",
                        description: "Number of participants (for real tests)",
                    },
                    quotes: {
                        type: "array",
                        items: { type: "string" },
                        description: "User quotes (for real tests)",
                    },
                    recommendations: {
                        type: "array",
                        items: { type: "string" },
                        description: "Recommendations based on findings",
                    },
                    sources: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                title: { type: "string" },
                                url: { type: "string" },
                                summary: { type: "string" },
                            },
                            required: ["title", "url"],
                        },
                        description: "Sources for test documentation",
                    },
                },
                required: ["id", "workflow_id", "persona_id", "test_type", "date", "status"],
            },
        },
        {
            name: "design_update_test_result",
            description: "Update an existing test result",
            inputSchema: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        description: "Test result ID to update",
                    },
                    status: { type: "string", enum: ["passed", "failed", "partial"] },
                    confidence: { type: "string", enum: ["high", "medium", "low"] },
                    success_criteria_results: { type: "array" },
                    issues: { type: "array" },
                    summary: { type: "string" },
                    participants: { type: "number" },
                    quotes: { type: "array", items: { type: "string" } },
                    recommendations: { type: "array", items: { type: "string" } },
                    sources: { type: "array" },
                },
                required: ["id"],
            },
        },
        {
            name: "design_delete_test_result",
            description: "Delete a test result",
            inputSchema: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        description: "Test result ID to delete",
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
                sources: args.sources as CreateCapabilityInput["sources"],
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
                sources: args.sources as CreateComponentInput["sources"],
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
                sources: args.sources as CreateWorkflowInput["sources"],
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
            if (args.sources !== undefined) {
                updates.sources = args.sources as UpdateWorkflowInput["sources"];
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
            if (args.sources !== undefined) {
                updates.sources = args.sources as UpdateCapabilityInput["sources"];
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
            if (args.quote !== undefined) {
                updates.quote = toStringOrDefault(args.quote);
            }
            if (args.bio !== undefined) {
                updates.bio = toStringOrDefault(args.bio);
            }
            if (args.characteristics !== undefined) {
                updates.characteristics = args.characteristics as UpdatePersonaInput["characteristics"];
            }
            if (args.motivations !== undefined) {
                updates.motivations = args.motivations as string[];
            }
            if (args.behaviors !== undefined) {
                updates.behaviors = args.behaviors as string[];
            }
            if (args.goals !== undefined) {
                updates.goals = args.goals as string[];
            }
            if (args.frustrations !== undefined) {
                updates.frustrations = args.frustrations as string[];
            }
            if (args.context !== undefined) {
                updates.context = args.context as UpdatePersonaInput["context"];
            }
            if (args.sources !== undefined) {
                updates.sources = args.sources as UpdatePersonaInput["sources"];
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
            if (args.sources !== undefined) {
                updates.sources = args.sources as UpdateComponentInput["sources"];
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

        // ============= TOKENS HANDLERS =============

        case "design_create_tokens": {
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
            return {
                content: [{ type: "text", text: result.error ?? "Failed to create tokens" }],
                isError: true,
            };
        }

        case "design_update_tokens": {
            const id = toStringOrDefault(args.id);
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
            return {
                content: [{ type: "text", text: result.error ?? "Failed to update tokens" }],
                isError: true,
            };
        }

        case "design_delete_tokens": {
            const id = toStringOrDefault(args.id);
            const force = args.force as boolean | undefined;
            const result = store.deleteTokens(id, { force });
            if (result.success) {
                return { content: [{ type: "text", text: JSON.stringify({ success: true, id, deleted: true }, null, 2) }] };
            }
            return {
                content: [{ type: "text", text: result.error ?? "Failed to delete tokens" }],
                isError: true,
            };
        }

        // ============= VIEW HANDLERS =============

        case "design_create_view": {
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
            return {
                content: [{ type: "text", text: result.error ?? "Failed to create view" }],
                isError: true,
            };
        }

        case "design_update_view": {
            const id = toStringOrDefault(args.id);
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
            return {
                content: [{ type: "text", text: result.error ?? "Failed to update view" }],
                isError: true,
            };
        }

        case "design_delete_view": {
            const id = toStringOrDefault(args.id);
            const result = store.deleteView(id);
            if (result.success) {
                return { content: [{ type: "text", text: JSON.stringify({ success: true, id, deleted: true }, null, 2) }] };
            }
            return {
                content: [{ type: "text", text: result.error ?? "Failed to delete view" }],
                isError: true,
            };
        }

        // ============= INTERACTION HANDLERS =============

        case "design_create_interaction": {
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
            return {
                content: [{ type: "text", text: result.error ?? "Failed to create interaction pattern" }],
                isError: true,
            };
        }

        case "design_update_interaction": {
            const id = toStringOrDefault(args.id);
            const updates: UpdateInteractionInput = {};
            if (args.name !== undefined) {updates.name = toStringOrDefault(args.name);}
            if (args.description !== undefined) {updates.description = args.description as string;}
            if (args.interaction !== undefined) {updates.interaction = args.interaction as CreateInteractionInput["interaction"];}
            if (args.applies_to !== undefined) {updates.applies_to = args.applies_to as string[];}

            const result = store.updateInteraction(id, updates);
            if (result.success) {
                return { content: [{ type: "text", text: JSON.stringify({ success: true, id, updated: true }, null, 2) }] };
            }
            return {
                content: [{ type: "text", text: result.error ?? "Failed to update interaction pattern" }],
                isError: true,
            };
        }

        case "design_delete_interaction": {
            const id = toStringOrDefault(args.id);
            const force = args.force as boolean | undefined;
            const result = store.deleteInteraction(id, { force });
            if (result.success) {
                return { content: [{ type: "text", text: JSON.stringify({ success: true, id, deleted: true }, null, 2) }] };
            }
            return {
                content: [{ type: "text", text: result.error ?? "Failed to delete interaction pattern" }],
                isError: true,
            };
        }

        // ============= TEST RESULT HANDLERS =============

        case "design_create_test_result": {
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
            return {
                content: [{ type: "text", text: result.error ?? "Failed to create test result" }],
                isError: true,
            };
        }

        case "design_update_test_result": {
            const id = toStringOrDefault(args.id);
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
            return {
                content: [{ type: "text", text: result.error ?? "Failed to update test result" }],
                isError: true,
            };
        }

        case "design_delete_test_result": {
            const id = toStringOrDefault(args.id);
            const result = store.deleteTestResult(id);
            if (result.success) {
                return { content: [{ type: "text", text: JSON.stringify({ success: true, id, deleted: true }, null, 2) }] };
            }
            return {
                content: [{ type: "text", text: result.error ?? "Failed to delete test result" }],
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
