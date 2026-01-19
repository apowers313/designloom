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
