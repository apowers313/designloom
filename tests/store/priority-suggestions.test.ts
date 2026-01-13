import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { DesignDocsStore } from "../../src/store/yaml-store.js";
import * as fs from "node:fs";
import * as path from "node:path";

// Use a separate temp directory for priority suggestion tests
const TEMP_PATH = path.join(__dirname, "../temp-priority-tests");
const FIXTURES_PATH = path.join(__dirname, "../fixtures/design");

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

describe("Priority Suggestions", () => {
    let store: DesignDocsStore;

    beforeEach(() => {
        setupTempDir();
        store = new DesignDocsStore(TEMP_PATH);
    });

    afterEach(() => {
        cleanupTempDir();
    });

    describe("suggestPriority", () => {
        it("prioritizes capabilities that unblock most workflows", () => {
            // Create capabilities with different usage patterns
            store.createCapability({
                id: "high-impact",
                name: "High Impact Capability",
                category: "data",
                description: "Used by many workflows",
                status: "planned",
            });
            store.createCapability({
                id: "low-impact",
                name: "Low Impact Capability",
                category: "visualization",
                description: "Used by few workflows",
                status: "planned",
            });

            // Create workflows that depend on high-impact
            store.createWorkflow({
                id: "W20",
                name: "Workflow 1",
                category: "analysis",
                goal: "Test 1",
                requires_capabilities: ["high-impact"],
            });
            store.createWorkflow({
                id: "W21",
                name: "Workflow 2",
                category: "exploration",
                goal: "Test 2",
                requires_capabilities: ["high-impact"],
            });
            store.createWorkflow({
                id: "W22",
                name: "Workflow 3",
                category: "reporting",
                goal: "Test 3",
                requires_capabilities: ["high-impact"],
            });

            // Only one workflow uses low-impact
            store.createWorkflow({
                id: "W23",
                name: "Workflow 4",
                category: "onboarding",
                goal: "Test 4",
                requires_capabilities: ["low-impact"],
            });

            const suggestions = store.suggestPriority({ focus: "capability" });

            // high-impact should be recommended first
            expect(suggestions.recommendations[0].id).toBe("high-impact");
            expect(suggestions.recommendations[0].workflows_unblocked.length).toBe(3);
        });

        it("only suggests unimplemented capabilities", () => {
            store.createCapability({
                id: "already-done",
                name: "Already Done",
                category: "data",
                description: "Already implemented",
                status: "implemented",
            });
            store.createCapability({
                id: "needs-work",
                name: "Needs Work",
                category: "visualization",
                description: "Still planned",
                status: "planned",
            });

            store.createWorkflow({
                id: "W24",
                name: "Workflow Using Both",
                category: "analysis",
                goal: "Uses both",
                requires_capabilities: ["already-done", "needs-work"],
            });

            const suggestions = store.suggestPriority({ focus: "capability" });

            // Should not include already-done
            expect(suggestions.recommendations.some(r => r.id === "already-done")).toBe(false);
            // Should include needs-work
            expect(suggestions.recommendations.some(r => r.id === "needs-work")).toBe(true);
        });

        it("provides reasoning for each recommendation", () => {
            store.createCapability({
                id: "suggest-cap",
                name: "Suggested Capability",
                category: "analysis",
                description: "Suggested",
                status: "planned",
            });

            store.createWorkflow({
                id: "W25",
                name: "Suggestion Workflow",
                category: "analysis",
                goal: "For suggestion test",
                requires_capabilities: ["suggest-cap"],
            });

            const suggestions = store.suggestPriority({ focus: "capability" });

            const suggestion = suggestions.recommendations.find(r => r.id === "suggest-cap");
            expect(suggestion?.reasoning).toBeDefined();
            expect(typeof suggestion?.reasoning).toBe("string");
            expect(suggestion?.reasoning.length).toBeGreaterThan(0);
        });

        it("suggests workflows to implement next based on readiness", () => {
            // Create a fully ready workflow (all capabilities implemented)
            store.createCapability({
                id: "ready-cap",
                name: "Ready Cap",
                category: "data",
                description: "Ready",
                status: "implemented",
            });

            store.createWorkflow({
                id: "W26",
                name: "Ready Workflow",
                category: "analysis",
                goal: "All requirements met",
                requires_capabilities: ["ready-cap"],
            });

            // Create a blocked workflow
            store.createCapability({
                id: "blocked-cap",
                name: "Blocked Cap",
                category: "visualization",
                description: "Blocked",
                status: "planned",
            });

            store.createWorkflow({
                id: "W27",
                name: "Blocked Workflow",
                category: "exploration",
                goal: "Missing requirements",
                requires_capabilities: ["blocked-cap"],
            });

            const suggestions = store.suggestPriority({ focus: "workflow" });

            // Ready workflow should be suggested first
            const readyInRecommendations = suggestions.recommendations.findIndex(r => r.id === "W26");
            const blockedInRecommendations = suggestions.recommendations.findIndex(r => r.id === "W27");

            // Ready should come before blocked (or blocked might not be included)
            if (blockedInRecommendations >= 0) {
                expect(readyInRecommendations).toBeLessThan(blockedInRecommendations);
            }
        });

        it("returns limited number of recommendations", () => {
            // Create many capabilities
            for (let i = 0; i < 20; i++) {
                store.createCapability({
                    id: `bulk-cap-${i}`,
                    name: `Bulk Cap ${i}`,
                    category: "data",
                    description: `Bulk capability ${i}`,
                    status: "planned",
                });
            }

            const suggestions = store.suggestPriority({ focus: "capability", limit: 5 });

            expect(suggestions.recommendations.length).toBeLessThanOrEqual(5);
        });

        it("includes summary of overall status", () => {
            const suggestions = store.suggestPriority({ focus: "capability" });

            expect(suggestions.summary).toBeDefined();
            expect(typeof suggestions.summary.total_unimplemented).toBe("number");
            expect(typeof suggestions.summary.total_blocked_workflows).toBe("number");
        });

        it("considers capability dependencies in priority", () => {
            // Create a capability that's a dependency of others
            store.createCapability({
                id: "foundation-cap",
                name: "Foundation Capability",
                category: "data",
                description: "Foundation for others",
                status: "planned",
            });

            store.createCapability({
                id: "dependent-cap",
                name: "Dependent Capability",
                category: "visualization",
                description: "Depends on foundation",
                status: "planned",
            });

            // Foundation is used by more workflows
            store.createWorkflow({
                id: "W28",
                name: "Foundation Workflow 1",
                category: "analysis",
                goal: "Uses foundation",
                requires_capabilities: ["foundation-cap"],
            });

            store.createWorkflow({
                id: "W29",
                name: "Foundation Workflow 2",
                category: "exploration",
                goal: "Also uses foundation",
                requires_capabilities: ["foundation-cap", "dependent-cap"],
            });

            const suggestions = store.suggestPriority({ focus: "capability" });

            // Foundation should have high priority due to being used by more workflows
            const foundationIdx = suggestions.recommendations.findIndex(r => r.id === "foundation-cap");
            expect(foundationIdx).toBeGreaterThanOrEqual(0);
        });
    });
});
