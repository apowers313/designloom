import { describe, it, expect, beforeAll } from "vitest";
import { DesignloomServer } from "../../src/index.js";
import * as path from "node:path";

const FIXTURES_PATH = path.join(__dirname, "../fixtures/design");

describe("MCP Server", () => {
    let server: DesignloomServer;

    beforeAll(() => {
        server = new DesignloomServer(FIXTURES_PATH);
    });

    describe("listTools", () => {
        it("lists all 10 consolidated tools", () => {
            const tools = server.listTools();
            expect(tools.length).toBe(10);

            const toolNames = tools.map(t => t.name);
            expect(toolNames).toContain("design_list");
            expect(toolNames).toContain("design_get");
            expect(toolNames).toContain("design_create");
            expect(toolNames).toContain("design_update");
            expect(toolNames).toContain("design_delete");
            expect(toolNames).toContain("design_link");
            expect(toolNames).toContain("design_validate");
            expect(toolNames).toContain("design_analyze");
            expect(toolNames).toContain("design_export");
            expect(toolNames).toContain("design_relations");
        });

        it("each tool has required properties", () => {
            const tools = server.listTools();
            for (const tool of tools) {
                expect(tool).toHaveProperty("name");
                expect(tool).toHaveProperty("description");
                expect(tool).toHaveProperty("inputSchema");
                expect(typeof tool.name).toBe("string");
                expect(typeof tool.description).toBe("string");
                expect(typeof tool.inputSchema).toBe("object");
            }
        });
    });

    describe("callTool - list operations", () => {
        it("handles design_list workflow tool call", async () => {
            const result = await server.callTool("design_list", { entity_type: "workflow" });
            expect(result.content).toBeDefined();
            expect(result.content[0].type).toBe("text");
            expect(result.content[0].text).toContain("W01");
        });

        it("handles design_list workflow with category filter", async () => {
            const result = await server.callTool("design_list", { entity_type: "workflow", category: "onboarding" });
            const data = JSON.parse(result.content[0].text);
            expect(data.every((w: { category: string }) => w.category === "onboarding")).toBe(true);
        });

        it("handles design_list workflow with priority filter", async () => {
            // Fixtures don't have priority set, so this should return empty array
            const result = await server.callTool("design_list", { entity_type: "workflow", priority: "P0" });
            expect(result.isError).toBeFalsy();
            const data = JSON.parse(result.content[0].text);
            // All results should have P0 priority (empty array is valid)
            expect(data.every((w: { priority?: string }) => w.priority === "P0")).toBe(true);
        });

        it("handles design_list capability tool call", async () => {
            const result = await server.callTool("design_list", { entity_type: "capability" });
            expect(result.content[0].text).toContain("data-import");
        });

        it("handles design_list capability with status filter", async () => {
            const result = await server.callTool("design_list", { entity_type: "capability", status: "implemented" });
            const data = JSON.parse(result.content[0].text);
            expect(data.every((c: { status: string }) => c.status === "implemented")).toBe(true);
        });

        it("handles design_list capability with priority filter", async () => {
            const result = await server.callTool("design_list", { entity_type: "capability", priority: "P1" });
            expect(result.isError).toBeFalsy();
            const data = JSON.parse(result.content[0].text);
            expect(data.every((c: { priority?: string }) => c.priority === "P1")).toBe(true);
        });

        it("handles design_list persona tool call", async () => {
            const result = await server.callTool("design_list", { entity_type: "persona" });
            expect(result.content[0].text).toContain("analyst-alex");
        });

        it("handles design_list component tool call", async () => {
            const result = await server.callTool("design_list", { entity_type: "component" });
            expect(result.content[0].text).toContain("data-import-dialog");
        });

        it("handles design_list component with status filter", async () => {
            const result = await server.callTool("design_list", { entity_type: "component", status: "implemented" });
            const data = JSON.parse(result.content[0].text);
            expect(data.every((c: { status: string }) => c.status === "implemented")).toBe(true);
        });

        it("handles design_list component with priority filter", async () => {
            const result = await server.callTool("design_list", { entity_type: "component", priority: "P2" });
            expect(result.isError).toBeFalsy();
            const data = JSON.parse(result.content[0].text);
            expect(data.every((c: { priority?: string }) => c.priority === "P2")).toBe(true);
        });
    });

    describe("callTool - get operations", () => {
        it("handles design_get workflow tool call", async () => {
            const result = await server.callTool("design_get", { entity_type: "workflow", id: "W01" });
            const data = JSON.parse(result.content[0].text);
            expect(data.id).toBe("W01");
            expect(data.name).toBe("First Load Experience");
            expect(data._resolved).toBeDefined();
        });

        it("returns error for non-existent workflow", async () => {
            const result = await server.callTool("design_get", { entity_type: "workflow", id: "W999" });
            expect(result.isError).toBe(true);
            expect(result.content[0].text).toContain("not found");
        });

        it("handles design_get capability tool call", async () => {
            const result = await server.callTool("design_get", { entity_type: "capability", id: "data-import" });
            const data = JSON.parse(result.content[0].text);
            expect(data.id).toBe("data-import");
            expect(data.name).toBe("Data Import");
            expect(data._resolved).toBeDefined();
        });

        it("returns error for non-existent capability", async () => {
            const result = await server.callTool("design_get", { entity_type: "capability", id: "non-existent" });
            expect(result.isError).toBe(true);
            expect(result.content[0].text).toContain("not found");
        });

        it("handles design_get persona tool call", async () => {
            const result = await server.callTool("design_get", { entity_type: "persona", id: "analyst-alex" });
            const data = JSON.parse(result.content[0].text);
            expect(data.id).toBe("analyst-alex");
            expect(data.name).toBe("Analyst Alex");
            expect(data._resolved).toBeDefined();
        });

        it("returns error for non-existent persona", async () => {
            const result = await server.callTool("design_get", { entity_type: "persona", id: "non-existent" });
            expect(result.isError).toBe(true);
            expect(result.content[0].text).toContain("not found");
        });

        it("handles design_get component tool call", async () => {
            const result = await server.callTool("design_get", { entity_type: "component", id: "data-import-dialog" });
            const data = JSON.parse(result.content[0].text);
            expect(data.id).toBe("data-import-dialog");
            expect(data.name).toBe("Data Import Dialog");
            expect(data._resolved).toBeDefined();
        });

        it("returns error for non-existent component", async () => {
            const result = await server.callTool("design_get", { entity_type: "component", id: "non-existent" });
            expect(result.isError).toBe(true);
            expect(result.content[0].text).toContain("not found");
        });
    });

    describe("callTool - dependency operations", () => {
        it("handles design_relations dependencies for workflow", async () => {
            const result = await server.callTool("design_relations", {
                direction: "dependencies",
                entity_type: "workflow",
                id: "W01",
            });
            const data = JSON.parse(result.content[0].text);
            expect(data).toHaveProperty("capabilities");
            expect(data).toHaveProperty("personas");
            expect(data).toHaveProperty("components");
        });

        it("handles design_relations dependencies for capability", async () => {
            const result = await server.callTool("design_relations", {
                direction: "dependencies",
                entity_type: "capability",
                id: "data-import",
            });
            const data = JSON.parse(result.content[0].text);
            expect(data).toHaveProperty("components");
        });

        it("returns error for non-existent entity in dependencies", async () => {
            const result = await server.callTool("design_relations", {
                direction: "dependencies",
                entity_type: "workflow",
                id: "W999",
            });
            expect(result.isError).toBe(true);
            expect(result.content[0].text).toContain("not found");
        });

        it("handles design_relations dependents for capability", async () => {
            const result = await server.callTool("design_relations", {
                direction: "dependents",
                entity_type: "capability",
                id: "data-import",
            });
            const data = JSON.parse(result.content[0].text);
            expect(data).toHaveProperty("workflows");
        });

        it("handles design_relations dependents for persona", async () => {
            const result = await server.callTool("design_relations", {
                direction: "dependents",
                entity_type: "persona",
                id: "analyst-alex",
            });
            const data = JSON.parse(result.content[0].text);
            expect(data).toHaveProperty("workflows");
        });

        it("handles design_relations dependents for component", async () => {
            const result = await server.callTool("design_relations", {
                direction: "dependents",
                entity_type: "component",
                id: "data-import-dialog",
            });
            const data = JSON.parse(result.content[0].text);
            expect(data).toHaveProperty("workflows");
            expect(data).toHaveProperty("capabilities");
        });

        it("returns error for non-existent entity in dependents", async () => {
            const result = await server.callTool("design_relations", {
                direction: "dependents",
                entity_type: "capability",
                id: "non-existent",
            });
            expect(result.isError).toBe(true);
            expect(result.content[0].text).toContain("not found");
        });
    });

    describe("callTool - error handling", () => {
        it("returns error for unknown tool", async () => {
            const result = await server.callTool("unknown_tool", {});
            expect(result.isError).toBe(true);
            expect(result.content[0].text).toContain("Unknown tool");
        });
    });
});
