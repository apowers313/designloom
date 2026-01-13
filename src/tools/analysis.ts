import type { DesignDocsStore, DiagramOptions, EntityType, TestGenOptions } from "../store/yaml-store.js";
import type { ToolDefinition, ToolResult } from "./query.js";

/**
 * Get all analysis tool definitions.
 * @returns Array of tool definitions for MCP registration
 */
export function getAnalysisTools(): ToolDefinition[] {
    return [
        {
            name: "design_validate",
            description: "Validate all design documents for consistency. Checks for broken references, orphaned entities, and bidirectional relationship inconsistencies.",
            inputSchema: {
                type: "object",
                properties: {},
            },
        },
        {
            name: "design_coverage_report",
            description: "Generate a coverage report showing capability usage, implementation status breakdown, persona coverage, and workflow readiness.",
            inputSchema: {
                type: "object",
                properties: {},
            },
        },
        {
            name: "design_find_orphans",
            description: "Find entities that are not referenced by any workflow (capabilities, personas, or components).",
            inputSchema: {
                type: "object",
                properties: {
                    entityType: {
                        type: "string",
                        enum: ["capability", "persona", "component"],
                        description: "Type of entity to find orphans for. If not specified, finds orphans of all types.",
                    },
                },
            },
        },
        {
            name: "design_find_gaps",
            description: "Find gaps in the design documentation, such as workflows without capabilities, capabilities without components, or categories with few workflows.",
            inputSchema: {
                type: "object",
                properties: {},
            },
        },
        {
            name: "design_suggest_priority",
            description: "Suggest priorities for implementation. For capabilities, prioritizes those that unblock the most workflows. For workflows, prioritizes those closest to being ready.",
            inputSchema: {
                type: "object",
                properties: {
                    focus: {
                        type: "string",
                        enum: ["capability", "workflow"],
                        description: "What to prioritize: 'capability' to find high-impact capabilities to implement, or 'workflow' to find workflows ready to implement",
                    },
                    limit: {
                        type: "number",
                        description: "Maximum number of recommendations to return (default: 10)",
                    },
                },
                required: ["focus"],
            },
        },
        {
            name: "design_generate_tests",
            description: "Generate test scaffolding from a workflow's success criteria. Supports vitest (default) and playwright formats.",
            inputSchema: {
                type: "object",
                properties: {
                    workflowId: {
                        type: "string",
                        description: "ID of the workflow to generate tests for (e.g., 'W01')",
                    },
                    format: {
                        type: "string",
                        enum: ["vitest", "playwright"],
                        description: "Test framework format: 'vitest' for unit tests or 'playwright' for E2E tests (default: vitest)",
                    },
                },
                required: ["workflowId"],
            },
        },
        {
            name: "design_export_diagram",
            description: "Export a Mermaid diagram showing entity relationships. Use focus='all' for full graph or specify an entity ID for focused view.",
            inputSchema: {
                type: "object",
                properties: {
                    focus: {
                        type: "string",
                        description: "Entity ID to focus on, or 'all' for full relationship graph",
                    },
                    depth: {
                        type: "number",
                        description: "How many levels of relationships to include (default: 1)",
                    },
                },
                required: ["focus"],
            },
        },
    ];
}

/**
 * Handle an analysis tool call.
 * @param store - The design docs store instance
 * @param name - Tool name to execute
 * @param args - Arguments for the tool
 * @returns Tool result with content and optional error flag, or null if tool not found
 */
export function handleAnalysisTool(
    store: DesignDocsStore,
    name: string,
    args: Record<string, unknown>
): ToolResult | null {
    switch (name) {
        case "design_validate": {
            const result = store.validate();
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }

        case "design_coverage_report": {
            const report = store.coverageReport();
            return { content: [{ type: "text", text: JSON.stringify(report, null, 2) }] };
        }

        case "design_find_orphans": {
            const entityType = args.entityType as EntityType | undefined;
            const orphans = store.findOrphans(entityType);
            return { content: [{ type: "text", text: JSON.stringify(orphans, null, 2) }] };
        }

        case "design_find_gaps": {
            const gaps = store.findGaps();
            return { content: [{ type: "text", text: JSON.stringify(gaps, null, 2) }] };
        }

        case "design_suggest_priority": {
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

        case "design_generate_tests": {
            const workflowId = args.workflowId as string;
            const format = args.format as TestGenOptions["format"];

            if (!workflowId) {
                return {
                    content: [{ type: "text", text: "Error: 'workflowId' parameter is required" }],
                    isError: true,
                };
            }

            const tests = store.generateTests(workflowId, { format });
            return { content: [{ type: "text", text: tests }] };
        }

        case "design_export_diagram": {
            const focus = args.focus as string;
            const depth = args.depth as number | undefined;

            if (!focus) {
                return {
                    content: [{ type: "text", text: "Error: 'focus' parameter is required" }],
                    isError: true,
                };
            }

            const diagramOptions: DiagramOptions = { focus, depth };
            const diagram = store.exportDiagram(diagramOptions);
            return { content: [{ type: "text", text: diagram }] };
        }

        default:
            return null;
    }
}
