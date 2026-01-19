import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { DesignDocsStore } from "../../src/store/yaml-store.js";
import * as fs from "node:fs";
import * as path from "node:path";

// Use a separate temp directory for test-result tests
const TEMP_PATH = path.join(__dirname, "../temp-test-result-tests");
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

describe("TestResult Operations", () => {
    let store: DesignDocsStore;

    beforeEach(() => {
        setupTempDir();
        store = new DesignDocsStore(TEMP_PATH);
    });

    afterEach(() => {
        cleanupTempDir();
    });

    describe("createTestResult", () => {
        it("creates test result with valid data", () => {
            const result = store.createTestResult({
                id: "TR-W01-analyst-alex-001",
                workflow_id: "W01",
                persona_id: "analyst-alex",
                test_type: "simulated",
                date: "2025-01-15",
                status: "passed",
            });

            expect(result.success).toBe(true);
            expect(store.testResultExists("TR-W01-analyst-alex-001")).toBe(true);
        });

        it("creates test result and writes YAML file", () => {
            store.createTestResult({
                id: "TR-W01-analyst-alex-002",
                workflow_id: "W01",
                persona_id: "analyst-alex",
                test_type: "simulated",
                date: "2025-01-15",
                status: "passed",
            });

            const filePath = path.join(TEMP_PATH, "test-results", "TR-W01-analyst-alex-002.yaml");
            expect(fs.existsSync(filePath)).toBe(true);

            // Verify the store can read it back
            store.refresh();
            expect(store.testResultExists("TR-W01-analyst-alex-002")).toBe(true);
        });

        it("creates test result with all fields", () => {
            const result = store.createTestResult({
                id: "TR-W01-analyst-alex-003",
                workflow_id: "W01",
                persona_id: "analyst-alex",
                test_type: "real",
                date: "2025-01-15",
                status: "partial",
                confidence: "high",
                success_criteria_results: [
                    {
                        criterion: "Task completion",
                        target: "> 90%",
                        actual: "85%",
                        passed: false,
                        notes: "Some users struggled",
                    },
                ],
                issues: [
                    {
                        severity: "major",
                        description: "Progress unclear",
                        workflow_step: "Step 3",
                        persona_factor: "High time pressure",
                        affected_components: ["data-import-dialog"],
                        affected_capabilities: ["data-import"],
                        recommendation: "Add progress indicator",
                    },
                ],
                summary: "Most tasks completed but feedback needed",
                participants: 5,
                quotes: ["Very intuitive!"],
                recommendations: ["Improve progress indicator"],
            });

            expect(result.success).toBe(true);
            const testResult = store.getTestResult("TR-W01-analyst-alex-003");
            expect(testResult?.participants).toBe(5);
            expect(testResult?.issues).toHaveLength(1);
            expect(testResult?.success_criteria_results).toHaveLength(1);
        });

        it("rejects test result with invalid ID format", () => {
            const result = store.createTestResult({
                id: "invalid-id",
                workflow_id: "W01",
                persona_id: "analyst-alex",
                test_type: "simulated",
                date: "2025-01-15",
                status: "passed",
            });

            expect(result.success).toBe(false);
            expect(result.error).toContain("ID must match pattern");
        });

        it("rejects duplicate test result ID", () => {
            store.createTestResult({
                id: "TR-W01-analyst-alex-004",
                workflow_id: "W01",
                persona_id: "analyst-alex",
                test_type: "simulated",
                date: "2025-01-15",
                status: "passed",
            });

            const result = store.createTestResult({
                id: "TR-W01-analyst-alex-004",
                workflow_id: "W01",
                persona_id: "analyst-alex",
                test_type: "simulated",
                date: "2025-01-16",
                status: "passed",
            });

            expect(result.success).toBe(false);
            expect(result.error).toContain("already exists");
        });

        it("rejects test result with non-existent workflow", () => {
            const result = store.createTestResult({
                id: "TR-W99-analyst-alex-001",
                workflow_id: "W99",
                persona_id: "analyst-alex",
                test_type: "simulated",
                date: "2025-01-15",
                status: "passed",
            });

            expect(result.success).toBe(false);
            expect(result.error).toContain("Workflow 'W99' does not exist");
        });

        it("rejects test result with non-existent persona", () => {
            const result = store.createTestResult({
                id: "TR-W01-non-existent-001",
                workflow_id: "W01",
                persona_id: "non-existent",
                test_type: "simulated",
                date: "2025-01-15",
                status: "passed",
            });

            expect(result.success).toBe(false);
            expect(result.error).toContain("Persona 'non-existent' does not exist");
        });

        it("rejects test result with non-existent affected component", () => {
            const result = store.createTestResult({
                id: "TR-W01-analyst-alex-005",
                workflow_id: "W01",
                persona_id: "analyst-alex",
                test_type: "simulated",
                date: "2025-01-15",
                status: "failed",
                issues: [
                    {
                        severity: "major",
                        description: "Test issue",
                        affected_components: ["non-existent-component"],
                    },
                ],
            });

            expect(result.success).toBe(false);
            expect(result.error).toContain("Component 'non-existent-component' does not exist");
        });

        it("rejects test result with non-existent affected capability", () => {
            const result = store.createTestResult({
                id: "TR-W01-analyst-alex-006",
                workflow_id: "W01",
                persona_id: "analyst-alex",
                test_type: "simulated",
                date: "2025-01-15",
                status: "failed",
                issues: [
                    {
                        severity: "major",
                        description: "Test issue",
                        affected_capabilities: ["non-existent-capability"],
                    },
                ],
            });

            expect(result.success).toBe(false);
            expect(result.error).toContain("Capability 'non-existent-capability' does not exist");
        });
    });

    describe("updateTestResult", () => {
        beforeEach(() => {
            store.createTestResult({
                id: "TR-W01-analyst-alex-010",
                workflow_id: "W01",
                persona_id: "analyst-alex",
                test_type: "simulated",
                date: "2025-01-15",
                status: "passed",
            });
        });

        it("updates test result status", () => {
            const result = store.updateTestResult("TR-W01-analyst-alex-010", {
                status: "partial",
            });

            expect(result.success).toBe(true);
            expect(store.getTestResult("TR-W01-analyst-alex-010")?.status).toBe("partial");
        });

        it("updates test result confidence", () => {
            const result = store.updateTestResult("TR-W01-analyst-alex-010", {
                confidence: "high",
            });

            expect(result.success).toBe(true);
            expect(store.getTestResult("TR-W01-analyst-alex-010")?.confidence).toBe("high");
        });

        it("updates test result summary", () => {
            const result = store.updateTestResult("TR-W01-analyst-alex-010", {
                summary: "Updated summary after review",
            });

            expect(result.success).toBe(true);
            expect(store.getTestResult("TR-W01-analyst-alex-010")?.summary).toBe("Updated summary after review");
        });

        it("adds issues to test result", () => {
            const result = store.updateTestResult("TR-W01-analyst-alex-010", {
                status: "failed",
                issues: [
                    {
                        severity: "critical",
                        description: "New critical issue discovered",
                    },
                ],
            });

            expect(result.success).toBe(true);
            const testResult = store.getTestResult("TR-W01-analyst-alex-010");
            expect(testResult?.issues).toHaveLength(1);
            expect(testResult?.issues?.[0].severity).toBe("critical");
        });

        it("returns error for non-existent test result", () => {
            const result = store.updateTestResult("TR-W99-non-existent-001", {
                status: "failed",
            });

            expect(result.success).toBe(false);
            expect(result.error).toContain("Test result 'TR-W99-non-existent-001' not found");
        });

        it("validates references on update", () => {
            const result = store.updateTestResult("TR-W01-analyst-alex-010", {
                issues: [
                    {
                        severity: "major",
                        description: "Issue",
                        affected_components: ["non-existent"],
                    },
                ],
            });

            expect(result.success).toBe(false);
            expect(result.error).toContain("Component 'non-existent' does not exist");
        });
    });

    describe("deleteTestResult", () => {
        beforeEach(() => {
            store.createTestResult({
                id: "TR-W01-analyst-alex-020",
                workflow_id: "W01",
                persona_id: "analyst-alex",
                test_type: "simulated",
                date: "2025-01-15",
                status: "passed",
            });
        });

        it("deletes test result", () => {
            const result = store.deleteTestResult("TR-W01-analyst-alex-020");

            expect(result.success).toBe(true);
            expect(store.testResultExists("TR-W01-analyst-alex-020")).toBe(false);
        });

        it("removes YAML file on delete", () => {
            const filePath = path.join(TEMP_PATH, "test-results", "TR-W01-analyst-alex-020.yaml");
            expect(fs.existsSync(filePath)).toBe(true);

            store.deleteTestResult("TR-W01-analyst-alex-020");

            expect(fs.existsSync(filePath)).toBe(false);
        });

        it("returns error for non-existent test result", () => {
            const result = store.deleteTestResult("TR-W99-non-existent-001");

            expect(result.success).toBe(false);
            expect(result.error).toContain("Test result 'TR-W99-non-existent-001' not found");
        });
    });

    describe("listTestResults", () => {
        beforeEach(() => {
            // Create executive-eve persona for testing
            store.createPersona({
                id: "executive-eve",
                name: "Executive Eve",
                role: "Executive",
                characteristics: { expertise: "novice" },
                goals: ["View high-level reports"],
            });

            // Create multiple test results for filtering
            store.createTestResult({
                id: "TR-W01-analyst-alex-030",
                workflow_id: "W01",
                persona_id: "analyst-alex",
                test_type: "simulated",
                date: "2025-01-15",
                status: "passed",
                confidence: "medium",
            });

            store.createTestResult({
                id: "TR-W01-analyst-alex-031",
                workflow_id: "W01",
                persona_id: "analyst-alex",
                test_type: "real",
                date: "2025-01-16",
                status: "failed",
                confidence: "high",
                issues: [
                    { severity: "critical", description: "Blocked" },
                ],
            });

            store.createTestResult({
                id: "TR-W02-executive-eve-001",
                workflow_id: "W02",
                persona_id: "executive-eve",
                test_type: "simulated",
                date: "2025-01-15",
                status: "partial",
                confidence: "low",
            });
        });

        it("lists all test results", () => {
            const results = store.listTestResults();

            expect(results.length).toBe(3);
        });

        it("filters by workflow_id", () => {
            const results = store.listTestResults({ workflow_id: "W01" });

            expect(results.length).toBe(2);
            expect(results.every(r => r.workflow_id === "W01")).toBe(true);
        });

        it("filters by persona_id", () => {
            const results = store.listTestResults({ persona_id: "analyst-alex" });

            expect(results.length).toBe(2);
            expect(results.every(r => r.persona_id === "analyst-alex")).toBe(true);
        });

        it("filters by test_type", () => {
            const results = store.listTestResults({ test_type: "real" });

            expect(results.length).toBe(1);
            expect(results[0].test_type).toBe("real");
        });

        it("filters by status", () => {
            const results = store.listTestResults({ status: "passed" });

            expect(results.length).toBe(1);
            expect(results[0].status).toBe("passed");
        });

        it("filters by has_issues", () => {
            const results = store.listTestResults({ has_issues: true });

            expect(results.length).toBe(1);
            expect(results[0].issue_count).toBeGreaterThan(0);
        });

        it("combines multiple filters", () => {
            const results = store.listTestResults({
                workflow_id: "W01",
                test_type: "simulated",
            });

            expect(results.length).toBe(1);
            expect(results[0].workflow_id).toBe("W01");
            expect(results[0].test_type).toBe("simulated");
        });

        it("returns summary with issue count", () => {
            const results = store.listTestResults({ workflow_id: "W01", status: "failed" });

            expect(results[0].issue_count).toBe(1);
        });
    });

    describe("getTestResult", () => {
        beforeEach(() => {
            store.createTestResult({
                id: "TR-W01-analyst-alex-040",
                workflow_id: "W01",
                persona_id: "analyst-alex",
                test_type: "simulated",
                date: "2025-01-15",
                status: "passed",
            });
        });

        it("returns test result by ID", () => {
            const result = store.getTestResult("TR-W01-analyst-alex-040");

            expect(result).toBeDefined();
            expect(result?.id).toBe("TR-W01-analyst-alex-040");
        });

        it("returns test result with resolved references", () => {
            const result = store.getTestResult("TR-W01-analyst-alex-040");

            expect(result?._resolved).toBeDefined();
            expect(result?._resolved.workflow?.id).toBe("W01");
            expect(result?._resolved.persona?.id).toBe("analyst-alex");
        });

        it("returns null for non-existent test result", () => {
            const result = store.getTestResult("TR-W99-non-existent-001");

            expect(result).toBeNull();
        });
    });

    describe("getTestCoverage", () => {
        it("returns coverage report with empty test results", () => {
            const coverage = store.getTestCoverage();

            expect(coverage.total_workflows).toBeGreaterThan(0);
            expect(coverage.total_personas).toBeGreaterThan(0);
            expect(coverage.tested_combinations).toBe(0);
            expect(coverage.coverage_percentage).toBe(0);
            expect(coverage.untested.length).toBeGreaterThan(0);
        });

        it("calculates coverage percentage correctly", () => {
            // Create test result for one combination
            store.createTestResult({
                id: "TR-W01-analyst-alex-050",
                workflow_id: "W01",
                persona_id: "analyst-alex",
                test_type: "simulated",
                date: "2025-01-15",
                status: "passed",
            });

            const coverage = store.getTestCoverage();

            expect(coverage.tested_combinations).toBe(1);
            expect(coverage.simulated_test_count).toBe(1);
            expect(coverage.real_test_count).toBe(0);
            expect(coverage.coverage_percentage).toBeGreaterThan(0);
        });

        it("tracks real vs simulated test counts", () => {
            store.createTestResult({
                id: "TR-W01-analyst-alex-051",
                workflow_id: "W01",
                persona_id: "analyst-alex",
                test_type: "simulated",
                date: "2025-01-15",
                status: "passed",
            });

            store.createTestResult({
                id: "TR-W01-analyst-alex-052",
                workflow_id: "W01",
                persona_id: "analyst-alex",
                test_type: "real",
                date: "2025-01-16",
                status: "passed",
            });

            const coverage = store.getTestCoverage();

            expect(coverage.simulated_test_count).toBe(1);
            expect(coverage.real_test_count).toBe(1);
        });

        it("reports untested combinations", () => {
            const coverageBefore = store.getTestCoverage();
            const untestedBefore = coverageBefore.untested.length;

            // Test one combination
            store.createTestResult({
                id: "TR-W01-analyst-alex-053",
                workflow_id: "W01",
                persona_id: "analyst-alex",
                test_type: "simulated",
                date: "2025-01-15",
                status: "passed",
            });

            const coverageAfter = store.getTestCoverage();

            expect(coverageAfter.untested.length).toBe(untestedBefore - 1);
        });

        it("includes coverage entries for tested combinations", () => {
            store.createTestResult({
                id: "TR-W01-analyst-alex-054",
                workflow_id: "W01",
                persona_id: "analyst-alex",
                test_type: "simulated",
                date: "2025-01-15",
                status: "passed",
            });

            const coverage = store.getTestCoverage();
            const entry = coverage.entries.find(
                e => e.workflow_id === "W01" && e.persona_id === "analyst-alex"
            );

            expect(entry).toBeDefined();
            expect(entry?.test_count).toBe(1);
            expect(entry?.has_simulated_test).toBe(true);
            expect(entry?.has_real_test).toBe(false);
            expect(entry?.latest_test?.id).toBe("TR-W01-analyst-alex-054");
        });
    });

    describe("testResultExists", () => {
        it("returns true for existing test result", () => {
            store.createTestResult({
                id: "TR-W01-analyst-alex-060",
                workflow_id: "W01",
                persona_id: "analyst-alex",
                test_type: "simulated",
                date: "2025-01-15",
                status: "passed",
            });

            expect(store.testResultExists("TR-W01-analyst-alex-060")).toBe(true);
        });

        it("returns false for non-existent test result", () => {
            expect(store.testResultExists("TR-W99-non-existent-001")).toBe(false);
        });
    });
});
