import * as fs from "node:fs";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { DesignDocsStore } from "../../src/store/yaml-store.js";

describe("Test Generation", () => {
    const testDir = path.join(process.cwd(), "tests", "fixtures", "test-gen-temp");
    let store: DesignDocsStore;

    beforeEach(() => {
        // Create temporary directories for test
        fs.mkdirSync(path.join(testDir, "workflows"), { recursive: true });
        fs.mkdirSync(path.join(testDir, "capabilities"), { recursive: true });
        fs.mkdirSync(path.join(testDir, "personas"), { recursive: true });
        fs.mkdirSync(path.join(testDir, "components"), { recursive: true });

        store = new DesignDocsStore(testDir);
    });

    afterEach(() => {
        // Clean up temporary directory
        fs.rmSync(testDir, { recursive: true, force: true });
    });

    describe("generateTests with vitest format", () => {
        it("generates vitest scaffolding from workflow with success criteria", () => {
            store.createWorkflow({
                id: "W07",
                name: "Anomaly Detection",
                category: "analysis",
                goal: "Identify anomalies in transaction data",
                success_criteria: [
                    { metric: "time_to_identify", target: "< 2 minutes" },
                    { metric: "drill_down", target: "can inspect any node" },
                ],
            });

            const tests = store.generateTests("W07", { format: "vitest" });

            expect(tests).toContain("describe('W07: Anomaly Detection'");
            expect(tests).toContain("time_to_identify");
            expect(tests).toContain("< 2 minutes");
            expect(tests).toContain("drill_down");
            expect(tests).toContain("can inspect any node");
            expect(tests).toContain("import { describe, expect, it } from 'vitest'");
        });

        it("generates tests for workflow without success criteria", () => {
            store.createWorkflow({
                id: "W08",
                name: "Basic Workflow",
                category: "exploration",
                goal: "Explore the graph",
            });

            const tests = store.generateTests("W08", { format: "vitest" });

            expect(tests).toContain("describe('W08: Basic Workflow'");
            expect(tests).toContain("// No success criteria defined");
        });

        it("returns error message for non-existent workflow", () => {
            const tests = store.generateTests("W99", { format: "vitest" });

            expect(tests).toContain("Error: Workflow 'W99' not found");
        });

        it("includes workflow goal in test description", () => {
            store.createWorkflow({
                id: "W09",
                name: "Data Export",
                category: "reporting",
                goal: "Export graph data to various formats",
                success_criteria: [
                    { metric: "export_formats", target: "supports CSV, JSON, PNG" },
                ],
            });

            const tests = store.generateTests("W09", { format: "vitest" });

            expect(tests).toContain("Export graph data to various formats");
        });
    });

    describe("generateTests with playwright format", () => {
        it("generates playwright scaffolding with page interactions", () => {
            store.createWorkflow({
                id: "W10",
                name: "User Onboarding",
                category: "onboarding",
                goal: "Guide new users through first-time setup",
                success_criteria: [
                    { metric: "completion_rate", target: "> 90%" },
                    { metric: "user_satisfaction", target: "> 4.5 stars" },
                ],
            });

            const tests = store.generateTests("W10", { format: "playwright" });

            expect(tests).toContain("test.describe");
            expect(tests).toContain("page.");
            expect(tests).toContain("W10: User Onboarding");
            expect(tests).toContain("completion_rate");
            expect(tests).toContain("> 90%");
            expect(tests).toContain("import { expect, test } from '@playwright/test'");
        });

        it("generates tests for workflow with starting state", () => {
            store.createWorkflow({
                id: "W11",
                name: "Complex Analysis",
                category: "analysis",
                goal: "Analyze complex graph structures",
                starting_state: {
                    data_type: "financial",
                    node_count: "10000",
                    edge_density: "high",
                    user_expertise: "expert",
                },
                success_criteria: [
                    { metric: "load_time", target: "< 5 seconds" },
                ],
            });

            const tests = store.generateTests("W11", { format: "playwright" });

            expect(tests).toContain("data_type: financial");
            expect(tests).toContain("node_count: 10000");
        });
    });

    describe("generateTests defaults", () => {
        it("defaults to vitest format when no format specified", () => {
            store.createWorkflow({
                id: "W12",
                name: "Default Format Test",
                category: "exploration",
                goal: "Test default format",
                success_criteria: [
                    { metric: "test_metric", target: "passes" },
                ],
            });

            const tests = store.generateTests("W12");

            expect(tests).toContain("import { describe, expect, it } from 'vitest'");
        });
    });
});
