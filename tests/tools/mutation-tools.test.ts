import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { DesignloomServer } from "../../src/index.js";
import * as fs from "node:fs";
import * as path from "node:path";

// Use a separate temp directory for mutation tool tests
const TEMP_PATH = path.join(__dirname, "../temp-mutation-tests");
const FIXTURES_PATH = path.join(__dirname, "../fixtures/design");

/**
 * Copy fixtures to temp directory for isolated testing
 */
function setupTempDir(): void {
    if (fs.existsSync(TEMP_PATH)) {
        fs.rmSync(TEMP_PATH, { recursive: true });
    }

    fs.mkdirSync(path.join(TEMP_PATH, "workflows"), { recursive: true });
    fs.mkdirSync(path.join(TEMP_PATH, "capabilities"), { recursive: true });
    fs.mkdirSync(path.join(TEMP_PATH, "personas"), { recursive: true });
    fs.mkdirSync(path.join(TEMP_PATH, "components"), { recursive: true });

    copyDir(path.join(FIXTURES_PATH, "workflows"), path.join(TEMP_PATH, "workflows"));
    copyDir(path.join(FIXTURES_PATH, "capabilities"), path.join(TEMP_PATH, "capabilities"));
    copyDir(path.join(FIXTURES_PATH, "personas"), path.join(TEMP_PATH, "personas"));
    copyDir(path.join(FIXTURES_PATH, "components"), path.join(TEMP_PATH, "components"));
}

function copyDir(src: string, dest: string): void {
    if (!fs.existsSync(src)) {
        return;
    }
    const files = fs.readdirSync(src);
    for (const file of files) {
        const srcPath = path.join(src, file);
        const destPath = path.join(dest, file);
        fs.copyFileSync(srcPath, destPath);
    }
}

function cleanupTempDir(): void {
    if (fs.existsSync(TEMP_PATH)) {
        fs.rmSync(TEMP_PATH, { recursive: true });
    }
}

describe("Mutation Tools", () => {
    let server: DesignloomServer;

    beforeEach(() => {
        setupTempDir();
        server = new DesignloomServer(TEMP_PATH);
    });

    afterEach(() => {
        cleanupTempDir();
    });

    describe("listTools includes consolidated tools", () => {
        it("lists all 10 consolidated tools", () => {
            const tools = server.listTools();
            const toolNames = tools.map(t => t.name);

            expect(toolNames).toContain("design_create");
            expect(toolNames).toContain("design_update");
            expect(toolNames).toContain("design_delete");
            expect(toolNames).toContain("design_list");
            expect(toolNames).toContain("design_get");
            expect(toolNames).toContain("design_link");
            expect(toolNames).toContain("design_validate");
            expect(toolNames).toContain("design_analyze");
            expect(toolNames).toContain("design_export");
            expect(toolNames).toContain("design_relations");
            expect(tools.length).toBe(10);
        });
    });

    describe("design_create capability", () => {
        it("creates capability with valid data", async () => {
            const result = await server.callTool("design_create", {
                entity_type: "capability",
                id: "new-cap",
                name: "New Capability",
                category: "data",
                description: "A new capability created via tool",
            });

            expect(result.isError).toBeFalsy();
            const data = JSON.parse(result.content[0].text);
            expect(data.success).toBe(true);
        });

        it("returns error for invalid ID", async () => {
            const result = await server.callTool("design_create", {
                entity_type: "capability",
                id: "InvalidID",
                name: "Invalid Capability",
                category: "data",
                description: "Has invalid ID format",
            });

            expect(result.isError).toBe(true);
            expect(result.content[0].text).toContain("ID must match pattern kebab-case");
        });

        it("returns error for duplicate ID", async () => {
            const result = await server.callTool("design_create", {
                entity_type: "capability",
                id: "data-import", // Already exists in fixtures
                name: "Duplicate",
                category: "data",
                description: "Duplicate ID",
            });

            expect(result.isError).toBe(true);
            expect(result.content[0].text).toContain("already exists");
        });
    });

    describe("design_create persona", () => {
        it("creates persona with valid data", async () => {
            const result = await server.callTool("design_create", {
                entity_type: "persona",
                id: "new-persona",
                name: "New Persona",
                role: "Tester",
                characteristics: {
                    expertise: "intermediate",
                },
                goals: ["Test the system"],
            });

            expect(result.isError).toBeFalsy();
            const data = JSON.parse(result.content[0].text);
            expect(data.success).toBe(true);
        });

        it("returns error for invalid ID", async () => {
            const result = await server.callTool("design_create", {
                entity_type: "persona",
                id: "Invalid Persona",
                name: "Invalid",
                role: "Test",
                characteristics: { expertise: "novice" },
                goals: ["Test"],
            });

            expect(result.isError).toBe(true);
            expect(result.content[0].text).toContain("ID must match pattern kebab-case");
        });

        it("returns error for duplicate ID", async () => {
            const result = await server.callTool("design_create", {
                entity_type: "persona",
                id: "analyst-alex", // Already exists in fixtures
                name: "Duplicate",
                role: "Test",
                characteristics: { expertise: "novice" },
                goals: ["Test"],
            });

            expect(result.isError).toBe(true);
            expect(result.content[0].text).toContain("already exists");
        });

        it("creates persona with all UX fields", async () => {
            const result = await server.callTool("design_create", {
                entity_type: "persona",
                id: "ux-complete-persona",
                name: "Sarah Chen",
                role: "Senior Fraud Analyst",
                quote: "I need to see the connections, not just the data points.",
                bio: "Sarah has been a fraud analyst for 5 years. She started in rule-based detection but now focuses on graph-based investigation.",
                characteristics: {
                    expertise: "expert",
                    time_pressure: "high",
                    graph_literacy: "advanced",
                    domain_knowledge: "expert",
                },
                motivations: [
                    "Protect the company from financial loss",
                    "Advance career through successful investigations",
                ],
                behaviors: [
                    "Uses Neo4j and Palantir daily",
                    "Prefers keyboard shortcuts over mouse",
                ],
                goals: ["Identify fraud patterns quickly", "Reduce false positives"],
                frustrations: ["Slow query response times", "Limited collaboration features"],
                context: {
                    frequency: "daily",
                    devices: ["desktop", "laptop"],
                    voluntary: false,
                },
            });

            expect(result.isError).toBeFalsy();
            const data = JSON.parse(result.content[0].text);
            expect(data.success).toBe(true);

            // Verify the created persona by fetching it
            const getResult = await server.callTool("design_get", { entity_type: "persona", id: "ux-complete-persona" });
            expect(getResult.isError).toBeFalsy();
            const persona = JSON.parse(getResult.content[0].text);
            expect(persona.quote).toBe("I need to see the connections, not just the data points.");
            expect(persona.bio).toContain("fraud analyst for 5 years");
            expect(persona.motivations).toHaveLength(2);
            expect(persona.behaviors).toHaveLength(2);
            expect(persona.context.frequency).toBe("daily");
            expect(persona.context.devices).toEqual(["desktop", "laptop"]);
            expect(persona.context.voluntary).toBe(false);
        });
    });

    describe("design_create component", () => {
        it("creates component with valid data", async () => {
            const result = await server.callTool("design_create", {
                entity_type: "component",
                id: "new-component",
                name: "New Component",
                category: "dialog",
                description: "A new component",
            });

            expect(result.isError).toBeFalsy();
            const data = JSON.parse(result.content[0].text);
            expect(data.success).toBe(true);
        });

        it("creates component with valid capability reference", async () => {
            const result = await server.callTool("design_create", {
                entity_type: "component",
                id: "cap-linked-comp",
                name: "Capability Linked Component",
                category: "control",
                description: "Links to existing capability",
                implements_capabilities: ["data-import"], // Exists in fixtures
            });

            expect(result.isError).toBeFalsy();
            const data = JSON.parse(result.content[0].text);
            expect(data.success).toBe(true);
        });

        it("returns error for non-existent capability reference", async () => {
            const result = await server.callTool("design_create", {
                entity_type: "component",
                id: "bad-cap-comp",
                name: "Bad Cap Component",
                category: "dialog",
                description: "References non-existent capability",
                implements_capabilities: ["non-existent-cap"],
            });

            expect(result.isError).toBe(true);
            expect(result.content[0].text).toContain("Capability 'non-existent-cap' does not exist");
        });

        it("returns error for invalid ID", async () => {
            const result = await server.callTool("design_create", {
                entity_type: "component",
                id: "InvalidComponent",
                name: "Invalid",
                category: "dialog",
                description: "Invalid ID",
            });

            expect(result.isError).toBe(true);
            expect(result.content[0].text).toContain("ID must match pattern kebab-case");
        });
    });

    describe("design_create workflow", () => {
        it("creates workflow with valid data", async () => {
            const result = await server.callTool("design_create", {
                entity_type: "workflow",
                id: "W50",
                name: "Test Workflow",
                category: "analysis",
                goal: "Test the creation flow",
            });

            expect(result.isError).toBeFalsy();
            const data = JSON.parse(result.content[0].text);
            expect(data.success).toBe(true);
        });

        it("creates workflow with valid references", async () => {
            const result = await server.callTool("design_create", {
                entity_type: "workflow",
                id: "W51",
                name: "Full Ref Workflow",
                category: "onboarding",
                goal: "Test all references",
                requires_capabilities: ["data-import"], // Exists in fixtures
                personas: ["analyst-alex"], // Exists in fixtures
                suggested_components: ["data-import-dialog"], // Exists in fixtures
            });

            expect(result.isError).toBeFalsy();
            const data = JSON.parse(result.content[0].text);
            expect(data.success).toBe(true);
        });

        it("returns error for non-existent capability reference", async () => {
            const result = await server.callTool("design_create", {
                entity_type: "workflow",
                id: "W52",
                name: "Bad Cap Workflow",
                category: "analysis",
                goal: "Test validation",
                requires_capabilities: ["non-existent"],
            });

            expect(result.isError).toBe(true);
            expect(result.content[0].text).toContain("Capability 'non-existent' does not exist");
        });

        it("returns error for non-existent persona reference", async () => {
            const result = await server.callTool("design_create", {
                entity_type: "workflow",
                id: "W53",
                name: "Bad Persona Workflow",
                category: "analysis",
                goal: "Test validation",
                personas: ["non-existent-persona"],
            });

            expect(result.isError).toBe(true);
            expect(result.content[0].text).toContain("Persona 'non-existent-persona' does not exist");
        });

        it("returns error for invalid ID format", async () => {
            const result = await server.callTool("design_create", {
                entity_type: "workflow",
                id: "workflow-1",
                name: "Invalid ID Workflow",
                category: "analysis",
                goal: "Test validation",
            });

            expect(result.isError).toBe(true);
            expect(result.content[0].text).toContain("ID must match pattern W01");
        });

        it("returns error for duplicate ID", async () => {
            const result = await server.callTool("design_create", {
                entity_type: "workflow",
                id: "W01", // Already exists in fixtures
                name: "Duplicate Workflow",
                category: "analysis",
                goal: "Duplicate",
            });

            expect(result.isError).toBe(true);
            expect(result.content[0].text).toContain("already exists");
        });
    });

    describe("error handling", () => {
        it("handles missing required fields gracefully", async () => {
            const result = await server.callTool("design_create", {
                entity_type: "workflow",
                id: "W60",
                // Missing name, category, goal
            });

            expect(result.isError).toBe(true);
        });

        it("handles empty input", async () => {
            const result = await server.callTool("design_create", {
                entity_type: "capability",
            });

            expect(result.isError).toBe(true);
        });

        it("handles missing entity_type", async () => {
            const result = await server.callTool("design_create", {
                id: "test-id",
                name: "Test",
            });

            expect(result.isError).toBe(true);
            expect(result.content[0].text).toContain("entity_type");
        });
    });
});
