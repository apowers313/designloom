/* eslint-disable @typescript-eslint/no-deprecated -- Server is needed until McpServer supports stdio transport */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    type CallToolResult,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { DesignDocsStore } from "./store/yaml-store.js";
import { getConsolidatedTools, handleConsolidatedTool } from "./tools/consolidated.js";
import type { ToolDefinition, ToolResult } from "./tools/query.js";

// Re-export schemas and types
export * from "./path-resolver.js";
export * from "./schemas/index.js";
export * from "./store/index.js";
export * from "./tools/index.js";

/**
 * Designloom server class for MCP integration.
 * Provides query and mutation tools for design document management.
 */
export class DesignloomServer {
    private store: DesignDocsStore;
    private tools: ToolDefinition[];

    /**
     * Creates a new Designloom server instance.
     * @param dataPath - Path to the design documents directory
     */
    constructor(dataPath: string) {
        this.store = new DesignDocsStore(dataPath);
        this.tools = getConsolidatedTools();
    }

    /**
     * List all available MCP tools.
     * @returns Array of tool definitions
     */
    listTools(): ToolDefinition[] {
        return this.tools;
    }

    /**
     * Call a tool by name with arguments.
     * @param name - The tool name to call
     * @param args - Arguments to pass to the tool
     * @returns Tool result with content and optional error flag
     */
    callTool(name: string, args: Record<string, unknown>): ToolResult {
        return handleConsolidatedTool(this.store, name, args);
    }
}

/**
 * Create and start the MCP server on stdio transport.
 * @param dataPath - Path to the design documents directory
 */
export async function startMcpServer(dataPath: string): Promise<void> {
    const designloomServer = new DesignloomServer(dataPath);

    const server = new Server(
        {
            name: "designloom",
            version: "0.1.0",
        },
        {
            capabilities: {
                tools: {},
            },
        }
    );

    // Handle list tools request
    server.setRequestHandler(ListToolsRequestSchema, () => {
        return {
            tools: designloomServer.listTools(),
        };
    });

    // Handle call tool request
    server.setRequestHandler(CallToolRequestSchema, (request): CallToolResult => {
        const { name, arguments: args } = request.params;
        const result = designloomServer.callTool(name, args ?? {});
        return {
            content: result.content,
            isError: result.isError,
        };
    });

    // Connect to stdio transport
    const transport = new StdioServerTransport();
    await server.connect(transport);
}
