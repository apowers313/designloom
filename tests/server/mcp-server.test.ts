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
        it("lists all available tools", () => {
            const tools = server.listTools();
            expect(tools.length).toBeGreaterThanOrEqual(10);

            const toolNames = tools.map(t => t.name);
            expect(toolNames).toContain("design_list_workflows");
            expect(toolNames).toContain("design_list_capabilities");
            expect(toolNames).toContain("design_list_personas");
            expect(toolNames).toContain("design_list_components");
            expect(toolNames).toContain("design_get_workflow");
            expect(toolNames).toContain("design_get_capability");
            expect(toolNames).toContain("design_get_persona");
            expect(toolNames).toContain("design_get_component");
            expect(toolNames).toContain("design_get_dependencies");
            expect(toolNames).toContain("design_get_dependents");
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
        it("handles design_list_workflows tool call", async () => {
            const result = await server.callTool("design_list_workflows", {});
            expect(result.content).toBeDefined();
            expect(result.content[0].type).toBe("text");
            expect(result.content[0].text).toContain("W01");
        });

        it("handles design_list_workflows with category filter", async () => {
            const result = await server.callTool("design_list_workflows", { category: "onboarding" });
            const data = JSON.parse(result.content[0].text);
            expect(data.every((w: { category: string }) => w.category === "onboarding")).toBe(true);
        });

        it("handles design_list_capabilities tool call", async () => {
            const result = await server.callTool("design_list_capabilities", {});
            expect(result.content[0].text).toContain("data-import");
        });

        it("handles design_list_capabilities with status filter", async () => {
            const result = await server.callTool("design_list_capabilities", { status: "implemented" });
            const data = JSON.parse(result.content[0].text);
            expect(data.every((c: { status: string }) => c.status === "implemented")).toBe(true);
        });

        it("handles design_list_personas tool call", async () => {
            const result = await server.callTool("design_list_personas", {});
            expect(result.content[0].text).toContain("analyst-alex");
        });

        it("handles design_list_components tool call", async () => {
            const result = await server.callTool("design_list_components", {});
            expect(result.content[0].text).toContain("data-import-dialog");
        });

        it("handles design_list_components with status filter", async () => {
            const result = await server.callTool("design_list_components", { status: "implemented" });
            const data = JSON.parse(result.content[0].text);
            expect(data.every((c: { status: string }) => c.status === "implemented")).toBe(true);
        });
    });

    describe("callTool - get operations", () => {
        it("handles design_get_workflow tool call", async () => {
            const result = await server.callTool("design_get_workflow", { id: "W01" });
            const data = JSON.parse(result.content[0].text);
            expect(data.id).toBe("W01");
            expect(data.name).toBe("First Load Experience");
            expect(data._resolved).toBeDefined();
        });

        it("returns error for non-existent workflow", async () => {
            const result = await server.callTool("design_get_workflow", { id: "W999" });
            expect(result.isError).toBe(true);
            expect(result.content[0].text).toContain("not found");
        });

        it("handles design_get_capability tool call", async () => {
            const result = await server.callTool("design_get_capability", { id: "data-import" });
            const data = JSON.parse(result.content[0].text);
            expect(data.id).toBe("data-import");
            expect(data.name).toBe("Data Import");
            expect(data._resolved).toBeDefined();
        });

        it("returns error for non-existent capability", async () => {
            const result = await server.callTool("design_get_capability", { id: "non-existent" });
            expect(result.isError).toBe(true);
            expect(result.content[0].text).toContain("not found");
        });

        it("handles design_get_persona tool call", async () => {
            const result = await server.callTool("design_get_persona", { id: "analyst-alex" });
            const data = JSON.parse(result.content[0].text);
            expect(data.id).toBe("analyst-alex");
            expect(data.name).toBe("Analyst Alex");
            expect(data._resolved).toBeDefined();
        });

        it("returns error for non-existent persona", async () => {
            const result = await server.callTool("design_get_persona", { id: "non-existent" });
            expect(result.isError).toBe(true);
            expect(result.content[0].text).toContain("not found");
        });

        it("handles design_get_component tool call", async () => {
            const result = await server.callTool("design_get_component", { id: "data-import-dialog" });
            const data = JSON.parse(result.content[0].text);
            expect(data.id).toBe("data-import-dialog");
            expect(data.name).toBe("Data Import Dialog");
            expect(data._resolved).toBeDefined();
        });

        it("returns error for non-existent component", async () => {
            const result = await server.callTool("design_get_component", { id: "non-existent" });
            expect(result.isError).toBe(true);
            expect(result.content[0].text).toContain("not found");
        });
    });

    describe("callTool - dependency operations", () => {
        it("handles design_get_dependencies for workflow", async () => {
            const result = await server.callTool("design_get_dependencies", {
                entityType: "workflow",
                id: "W01",
            });
            const data = JSON.parse(result.content[0].text);
            expect(data).toHaveProperty("capabilities");
            expect(data).toHaveProperty("personas");
            expect(data).toHaveProperty("components");
        });

        it("handles design_get_dependencies for capability", async () => {
            const result = await server.callTool("design_get_dependencies", {
                entityType: "capability",
                id: "data-import",
            });
            const data = JSON.parse(result.content[0].text);
            expect(data).toHaveProperty("components");
        });

        it("returns error for non-existent entity in dependencies", async () => {
            const result = await server.callTool("design_get_dependencies", {
                entityType: "workflow",
                id: "W999",
            });
            expect(result.isError).toBe(true);
            expect(result.content[0].text).toContain("not found");
        });

        it("handles design_get_dependents for capability", async () => {
            const result = await server.callTool("design_get_dependents", {
                entityType: "capability",
                id: "data-import",
            });
            const data = JSON.parse(result.content[0].text);
            expect(data).toHaveProperty("workflows");
        });

        it("handles design_get_dependents for persona", async () => {
            const result = await server.callTool("design_get_dependents", {
                entityType: "persona",
                id: "analyst-alex",
            });
            const data = JSON.parse(result.content[0].text);
            expect(data).toHaveProperty("workflows");
        });

        it("handles design_get_dependents for component", async () => {
            const result = await server.callTool("design_get_dependents", {
                entityType: "component",
                id: "data-import-dialog",
            });
            const data = JSON.parse(result.content[0].text);
            expect(data).toHaveProperty("workflows");
            expect(data).toHaveProperty("capabilities");
        });

        it("returns error for non-existent entity in dependents", async () => {
            const result = await server.callTool("design_get_dependents", {
                entityType: "capability",
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
