import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { DesignloomServer } from "../../src/index.js";
import * as fs from "node:fs";
import * as path from "node:path";

// Use a separate temp directory for test-result tool tests
const TEMP_PATH = path.join(__dirname, "../temp-test-result-tools-tests");
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
    fs.mkdirSync(path.join(TEMP_PATH, "test-results"), { recursive: true });

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

describe("TestResult Tools", () => {
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

            expect(tools.length).toBe(10);
            expect(toolNames).toContain("design_list");
            expect(toolNames).toContain("design_get");
            expect(toolNames).toContain("design_create");
            expect(toolNames).toContain("design_update");
            expect(toolNames).toContain("design_delete");
            expect(toolNames).toContain("design_analyze");
        });
    });

    describe("design_create test-result", () => {
        it("creates test result with valid data", () => {
            const result = server.callTool("design_create", {
                entity_type: "test-result",
                id: "TR-W01-analyst-alex-001",
                workflow_id: "W01",
                persona_id: "analyst-alex",
                test_type: "simulated",
                date: "2025-01-15",
                status: "passed",
            });

            expect(result.isError).toBeFalsy();
            const data = JSON.parse(result.content[0].text);
            expect(data.success).toBe(true);
        });

        it("creates test result with all fields", () => {
            const result = server.callTool("design_create", {
                entity_type: "test-result",
                id: "TR-W01-analyst-alex-002",
                workflow_id: "W01",
                persona_id: "analyst-alex",
                test_type: "real",
                date: "2025-01-15",
                status: "partial",
                confidence: "high",
                success_criteria_results: [
                    {
                        criterion: "Completion rate",
                        target: "> 90%",
                        actual: "85%",
                        passed: false,
                    },
                ],
                issues: [
                    {
                        severity: "major",
                        description: "Progress unclear",
                        workflow_step: "Step 3",
                        affected_components: ["data-import-dialog"],
                    },
                ],
                participants: 5,
                quotes: ["Great tool!"],
                summary: "Mostly successful",
                recommendations: ["Add progress bar"],
            });

            expect(result.isError).toBeFalsy();
            const data = JSON.parse(result.content[0].text);
            expect(data.success).toBe(true);
        });

        it("returns error for invalid ID format", () => {
            const result = server.callTool("design_create", {
                entity_type: "test-result",
                id: "invalid-id",
                workflow_id: "W01",
                persona_id: "analyst-alex",
                test_type: "simulated",
                date: "2025-01-15",
                status: "passed",
            });

            expect(result.isError).toBe(true);
            expect(result.content[0].text).toContain("ID must match pattern");
        });

        it("returns error for non-existent workflow", () => {
            const result = server.callTool("design_create", {
                entity_type: "test-result",
                id: "TR-W99-analyst-alex-001",
                workflow_id: "W99",
                persona_id: "analyst-alex",
                test_type: "simulated",
                date: "2025-01-15",
                status: "passed",
            });

            expect(result.isError).toBe(true);
            expect(result.content[0].text).toContain("Workflow 'W99' does not exist");
        });

        it("returns error for non-existent persona", () => {
            const result = server.callTool("design_create", {
                entity_type: "test-result",
                id: "TR-W01-nonexistent-001",
                workflow_id: "W01",
                persona_id: "nonexistent",
                test_type: "simulated",
                date: "2025-01-15",
                status: "passed",
            });

            expect(result.isError).toBe(true);
            expect(result.content[0].text).toContain("Persona 'nonexistent' does not exist");
        });

        it("returns error for duplicate ID", () => {
            // Create first
            server.callTool("design_create", {
                entity_type: "test-result",
                id: "TR-W01-analyst-alex-003",
                workflow_id: "W01",
                persona_id: "analyst-alex",
                test_type: "simulated",
                date: "2025-01-15",
                status: "passed",
            });

            // Try duplicate
            const result = server.callTool("design_create", {
                entity_type: "test-result",
                id: "TR-W01-analyst-alex-003",
                workflow_id: "W01",
                persona_id: "analyst-alex",
                test_type: "simulated",
                date: "2025-01-16",
                status: "passed",
            });

            expect(result.isError).toBe(true);
            expect(result.content[0].text).toContain("already exists");
        });
    });

    describe("design_update test-result", () => {
        beforeEach(() => {
            server.callTool("design_create", {
                entity_type: "test-result",
                id: "TR-W01-analyst-alex-010",
                workflow_id: "W01",
                persona_id: "analyst-alex",
                test_type: "simulated",
                date: "2025-01-15",
                status: "passed",
            });
        });

        it("updates test result status", () => {
            const result = server.callTool("design_update", {
                entity_type: "test-result",
                id: "TR-W01-analyst-alex-010",
                status: "partial",
            });

            expect(result.isError).toBeFalsy();
            const data = JSON.parse(result.content[0].text);
            expect(data.success).toBe(true);
        });

        it("updates test result with issues", () => {
            const result = server.callTool("design_update", {
                entity_type: "test-result",
                id: "TR-W01-analyst-alex-010",
                status: "failed",
                issues: [
                    {
                        severity: "critical",
                        description: "Cannot complete task",
                    },
                ],
            });

            expect(result.isError).toBeFalsy();

            // Verify the update
            const getResult = server.callTool("design_get", {
                entity_type: "test-result",
                id: "TR-W01-analyst-alex-010",
            });
            const testResult = JSON.parse(getResult.content[0].text);
            expect(testResult.status).toBe("failed");
            expect(testResult.issues).toHaveLength(1);
        });

        it("returns error for non-existent test result", () => {
            const result = server.callTool("design_update", {
                entity_type: "test-result",
                id: "TR-W99-nonexistent-001",
                status: "failed",
            });

            expect(result.isError).toBe(true);
            expect(result.content[0].text).toContain("not found");
        });
    });

    describe("design_delete test-result", () => {
        beforeEach(() => {
            server.callTool("design_create", {
                entity_type: "test-result",
                id: "TR-W01-analyst-alex-020",
                workflow_id: "W01",
                persona_id: "analyst-alex",
                test_type: "simulated",
                date: "2025-01-15",
                status: "passed",
            });
        });

        it("deletes test result", () => {
            const result = server.callTool("design_delete", {
                entity_type: "test-result",
                id: "TR-W01-analyst-alex-020",
            });

            expect(result.isError).toBeFalsy();
            const data = JSON.parse(result.content[0].text);
            expect(data.success).toBe(true);

            // Verify deleted
            const getResult = server.callTool("design_get", {
                entity_type: "test-result",
                id: "TR-W01-analyst-alex-020",
            });
            expect(getResult.isError).toBe(true);
        });

        it("returns error for non-existent test result", () => {
            const result = server.callTool("design_delete", {
                entity_type: "test-result",
                id: "TR-W99-nonexistent-001",
            });

            expect(result.isError).toBe(true);
            expect(result.content[0].text).toContain("not found");
        });
    });

    describe("design_list test-result", () => {
        beforeEach(() => {
            // Create executive-eve persona for testing
            server.callTool("design_create", {
                entity_type: "persona",
                id: "executive-eve",
                name: "Executive Eve",
                role: "Executive",
                characteristics: { expertise: "novice" },
                goals: ["View high-level reports"],
            });

            // Create multiple test results
            server.callTool("design_create", {
                entity_type: "test-result",
                id: "TR-W01-analyst-alex-030",
                workflow_id: "W01",
                persona_id: "analyst-alex",
                test_type: "simulated",
                date: "2025-01-15",
                status: "passed",
            });

            server.callTool("design_create", {
                entity_type: "test-result",
                id: "TR-W01-analyst-alex-031",
                workflow_id: "W01",
                persona_id: "analyst-alex",
                test_type: "real",
                date: "2025-01-16",
                status: "failed",
                issues: [{ severity: "critical", description: "Blocked" }],
            });

            server.callTool("design_create", {
                entity_type: "test-result",
                id: "TR-W02-executive-eve-001",
                workflow_id: "W02",
                persona_id: "executive-eve",
                test_type: "simulated",
                date: "2025-01-15",
                status: "partial",
            });
        });

        it("lists all test results", () => {
            const result = server.callTool("design_list", { entity_type: "test-result" });

            expect(result.isError).toBeFalsy();
            const data = JSON.parse(result.content[0].text);
            expect(data.length).toBe(3);
        });

        it("filters by workflow_id", () => {
            const result = server.callTool("design_list", {
                entity_type: "test-result",
                workflow_id: "W01",
            });

            expect(result.isError).toBeFalsy();
            const data = JSON.parse(result.content[0].text);
            expect(data.length).toBe(2);
            expect(data.every((r: { workflow_id: string }) => r.workflow_id === "W01")).toBe(true);
        });

        it("filters by persona_id", () => {
            const result = server.callTool("design_list", {
                entity_type: "test-result",
                persona_id: "analyst-alex",
            });

            expect(result.isError).toBeFalsy();
            const data = JSON.parse(result.content[0].text);
            expect(data.length).toBe(2);
        });

        it("filters by test_type", () => {
            const result = server.callTool("design_list", {
                entity_type: "test-result",
                test_type: "real",
            });

            expect(result.isError).toBeFalsy();
            const data = JSON.parse(result.content[0].text);
            expect(data.length).toBe(1);
        });

        it("filters by status", () => {
            const result = server.callTool("design_list", {
                entity_type: "test-result",
                status: "passed",
            });

            expect(result.isError).toBeFalsy();
            const data = JSON.parse(result.content[0].text);
            expect(data.length).toBe(1);
        });

        it("filters by has_issues", () => {
            const result = server.callTool("design_list", {
                entity_type: "test-result",
                has_issues: true,
            });

            expect(result.isError).toBeFalsy();
            const data = JSON.parse(result.content[0].text);
            expect(data.length).toBe(1);
            expect(data[0].issue_count).toBeGreaterThan(0);
        });
    });

    describe("design_get test-result", () => {
        beforeEach(() => {
            server.callTool("design_create", {
                entity_type: "test-result",
                id: "TR-W01-analyst-alex-040",
                workflow_id: "W01",
                persona_id: "analyst-alex",
                test_type: "simulated",
                date: "2025-01-15",
                status: "passed",
                summary: "All tasks completed successfully",
            });
        });

        it("gets test result by ID", () => {
            const result = server.callTool("design_get", {
                entity_type: "test-result",
                id: "TR-W01-analyst-alex-040",
            });

            expect(result.isError).toBeFalsy();
            const data = JSON.parse(result.content[0].text);
            expect(data.id).toBe("TR-W01-analyst-alex-040");
            expect(data.summary).toBe("All tasks completed successfully");
        });

        it("returns test result with resolved references", () => {
            const result = server.callTool("design_get", {
                entity_type: "test-result",
                id: "TR-W01-analyst-alex-040",
            });

            expect(result.isError).toBeFalsy();
            const data = JSON.parse(result.content[0].text);
            expect(data._resolved).toBeDefined();
            expect(data._resolved.workflow.id).toBe("W01");
            expect(data._resolved.persona.id).toBe("analyst-alex");
        });

        it("returns error for non-existent test result", () => {
            const result = server.callTool("design_get", {
                entity_type: "test-result",
                id: "TR-W99-nonexistent-001",
            });

            expect(result.isError).toBe(true);
            expect(result.content[0].text).toContain("not found");
        });
    });

    describe("design_analyze --report test-coverage", () => {
        it("returns coverage report", () => {
            const result = server.callTool("design_analyze", { report: "test-coverage" });

            expect(result.isError).toBeFalsy();
            const data = JSON.parse(result.content[0].text);
            expect(data.total_workflows).toBeDefined();
            expect(data.total_personas).toBeDefined();
            expect(data.possible_combinations).toBeDefined();
            expect(data.tested_combinations).toBeDefined();
            expect(data.coverage_percentage).toBeDefined();
        });

        it("updates coverage after adding test results", () => {
            const beforeResult = server.callTool("design_analyze", { report: "test-coverage" });
            const beforeData = JSON.parse(beforeResult.content[0].text);

            // Add a test result
            server.callTool("design_create", {
                entity_type: "test-result",
                id: "TR-W01-analyst-alex-050",
                workflow_id: "W01",
                persona_id: "analyst-alex",
                test_type: "simulated",
                date: "2025-01-15",
                status: "passed",
            });

            const afterResult = server.callTool("design_analyze", { report: "test-coverage" });
            const afterData = JSON.parse(afterResult.content[0].text);

            expect(afterData.tested_combinations).toBe(beforeData.tested_combinations + 1);
            expect(afterData.coverage_percentage).toBeGreaterThan(beforeData.coverage_percentage);
        });

        it("tracks real and simulated test counts", () => {
            server.callTool("design_create", {
                entity_type: "test-result",
                id: "TR-W01-analyst-alex-051",
                workflow_id: "W01",
                persona_id: "analyst-alex",
                test_type: "simulated",
                date: "2025-01-15",
                status: "passed",
            });

            server.callTool("design_create", {
                entity_type: "test-result",
                id: "TR-W01-analyst-alex-052",
                workflow_id: "W01",
                persona_id: "analyst-alex",
                test_type: "real",
                date: "2025-01-16",
                status: "passed",
            });

            const result = server.callTool("design_analyze", { report: "test-coverage" });
            const data = JSON.parse(result.content[0].text);

            expect(data.simulated_test_count).toBe(1);
            expect(data.real_test_count).toBe(1);
        });
    });

    describe("error handling", () => {
        it("handles missing required fields for create", () => {
            const result = server.callTool("design_create", {
                entity_type: "test-result",
                id: "TR-W01-analyst-alex-060",
                // Missing workflow_id, persona_id, test_type, date, status
            });

            expect(result.isError).toBe(true);
        });

        it("handles empty input for update", () => {
            server.callTool("design_create", {
                entity_type: "test-result",
                id: "TR-W01-analyst-alex-061",
                workflow_id: "W01",
                persona_id: "analyst-alex",
                test_type: "simulated",
                date: "2025-01-15",
                status: "passed",
            });

            // Update with just id should not fail (no changes)
            const result = server.callTool("design_update", {
                entity_type: "test-result",
                id: "TR-W01-analyst-alex-061",
            });

            expect(result.isError).toBeFalsy();
        });
    });
});
