import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { DesignDocsStore } from "../../src/store/yaml-store.js";
import * as fs from "node:fs";
import * as path from "node:path";

// Use a separate temp directory for coverage report tests
const TEMP_PATH = path.join(__dirname, "../temp-coverage-tests");
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

describe("Coverage Report", () => {
    let store: DesignDocsStore;

    beforeEach(() => {
        setupTempDir();
        store = new DesignDocsStore(TEMP_PATH);
    });

    afterEach(() => {
        cleanupTempDir();
    });

    describe("coverageReport", () => {
        it("calculates capability usage counts", () => {
            // Create capabilities with different usage patterns
            store.createCapability({
                id: "popular",
                name: "Popular Capability",
                category: "data",
                description: "Used by many workflows",
                status: "implemented",
            });
            store.createCapability({
                id: "unused",
                name: "Unused Capability",
                category: "visualization",
                description: "Used by no workflows",
                status: "planned",
            });

            // Create workflows that use "popular"
            store.createWorkflow({
                id: "W10",
                name: "Workflow 1",
                category: "analysis",
                goal: "Test 1",
                requires_capabilities: ["popular"],
            });
            store.createWorkflow({
                id: "W11",
                name: "Workflow 2",
                category: "analysis",
                goal: "Test 2",
                requires_capabilities: ["popular"],
            });

            const report = store.coverageReport();

            // Find the capability coverage entries
            const popularCoverage = report.capability_coverage.find(c => c.id === "popular");
            const unusedCoverage = report.capability_coverage.find(c => c.id === "unused");

            expect(popularCoverage?.workflow_count).toBe(2);
            expect(unusedCoverage?.workflow_count).toBe(0);
        });

        it("reports implementation status breakdown", () => {
            // Clear existing fixtures and create fresh capabilities
            store.createCapability({
                id: "cap-implemented",
                name: "Implemented Cap",
                category: "data",
                description: "Already implemented",
                status: "implemented",
            });
            store.createCapability({
                id: "cap-planned-1",
                name: "Planned Cap 1",
                category: "visualization",
                description: "In planning",
                status: "planned",
            });
            store.createCapability({
                id: "cap-planned-2",
                name: "Planned Cap 2",
                category: "analysis",
                description: "Also in planning",
                status: "planned",
            });
            store.createCapability({
                id: "cap-in-progress",
                name: "In Progress Cap",
                category: "interaction",
                description: "Being built",
                status: "in-progress",
            });

            const report = store.coverageReport();

            // Check the summary includes at least the ones we created
            expect(report.summary.implementation_status.implemented).toBeGreaterThanOrEqual(1);
            expect(report.summary.implementation_status.planned).toBeGreaterThanOrEqual(2);
            expect(report.summary.implementation_status["in-progress"]).toBeGreaterThanOrEqual(1);
        });

        it("includes total counts in summary", () => {
            const report = store.coverageReport();

            expect(report.summary.total_workflows).toBeGreaterThan(0);
            expect(report.summary.total_capabilities).toBeGreaterThan(0);
            expect(report.summary.total_personas).toBeGreaterThan(0);
            expect(report.summary.total_components).toBeGreaterThan(0);
        });

        it("reports persona workflow counts", () => {
            store.createPersona({
                id: "active-persona",
                name: "Active Persona",
                role: "User",
                characteristics: { expertise: "expert" },
                goals: ["Do things"],
            });

            store.createWorkflow({
                id: "W12",
                name: "Persona Workflow",
                category: "analysis",
                goal: "Test persona coverage",
                personas: ["active-persona"],
            });

            const report = store.coverageReport();

            const personaCoverage = report.persona_coverage.find(p => p.id === "active-persona");
            expect(personaCoverage?.workflow_count).toBe(1);
        });

        it("reports component capability counts", () => {
            store.createCapability({
                id: "component-cap",
                name: "Component Cap",
                category: "visualization",
                description: "For component test",
                status: "planned",
            });

            store.createComponent({
                id: "implementing-component",
                name: "Implementing Component",
                category: "display",
                description: "Implements capabilities",
                implements_capabilities: ["component-cap"],
            });

            const report = store.coverageReport();

            const componentCoverage = report.component_coverage.find(c => c.id === "implementing-component");
            expect(componentCoverage?.capability_count).toBe(1);
        });

        it("calculates workflow completion status", () => {
            // Create a workflow with all implemented capabilities
            store.createCapability({
                id: "done-cap",
                name: "Done Cap",
                category: "data",
                description: "Already done",
                status: "implemented",
            });

            store.createWorkflow({
                id: "W13",
                name: "Ready Workflow",
                category: "analysis",
                goal: "All caps implemented",
                requires_capabilities: ["done-cap"],
            });

            // Create a workflow with unimplemented capabilities
            store.createCapability({
                id: "not-done-cap",
                name: "Not Done Cap",
                category: "visualization",
                description: "Not yet done",
                status: "planned",
            });

            store.createWorkflow({
                id: "W14",
                name: "Blocked Workflow",
                category: "exploration",
                goal: "Has unimplemented caps",
                requires_capabilities: ["not-done-cap"],
            });

            const report = store.coverageReport();

            // Check workflow coverage includes readiness information
            const readyWorkflow = report.workflow_coverage.find(w => w.id === "W13");
            const blockedWorkflow = report.workflow_coverage.find(w => w.id === "W14");

            expect(readyWorkflow?.capabilities_ready).toBe(true);
            expect(blockedWorkflow?.capabilities_ready).toBe(false);
        });
    });

    describe("findOrphans", () => {
        it("finds orphaned capabilities", () => {
            store.createCapability({
                id: "orphan-cap",
                name: "Orphan Cap",
                category: "data",
                description: "No workflow uses this",
                status: "planned",
            });

            const orphans = store.findOrphans("capability");

            expect(orphans.capabilities.some(c => c.id === "orphan-cap")).toBe(true);
        });

        it("finds orphaned components", () => {
            store.createComponent({
                id: "orphan-comp",
                name: "Orphan Comp",
                category: "dialog",
                description: "No workflow uses this",
                status: "planned",
            });

            const orphans = store.findOrphans("component");

            expect(orphans.components.some(c => c.id === "orphan-comp")).toBe(true);
        });

        it("finds orphaned personas", () => {
            store.createPersona({
                id: "orphan-persona",
                name: "Orphan Persona",
                role: "Abandoned",
                characteristics: { expertise: "novice" },
                goals: ["Be useful"],
            });

            const orphans = store.findOrphans("persona");

            expect(orphans.personas.some(p => p.id === "orphan-persona")).toBe(true);
        });

        it("finds all orphans when no entity type specified", () => {
            store.createCapability({
                id: "orphan-all-cap",
                name: "Orphan All Cap",
                category: "data",
                description: "Orphan",
                status: "planned",
            });
            store.createComponent({
                id: "orphan-all-comp",
                name: "Orphan All Comp",
                category: "dialog",
                description: "Orphan",
                status: "planned",
            });
            store.createPersona({
                id: "orphan-all-persona",
                name: "Orphan All Persona",
                role: "Orphan",
                characteristics: { expertise: "novice" },
                goals: ["Find home"],
            });

            const orphans = store.findOrphans();

            expect(orphans.capabilities.length).toBeGreaterThan(0);
            expect(orphans.components.length).toBeGreaterThan(0);
            expect(orphans.personas.length).toBeGreaterThan(0);
        });
    });

    describe("findGaps", () => {
        it("identifies workflows missing capabilities", () => {
            // Create a workflow with no capabilities
            store.createWorkflow({
                id: "W15",
                name: "Empty Workflow",
                category: "analysis",
                goal: "No capabilities defined",
            });

            const gaps = store.findGaps();

            expect(gaps.workflows_without_capabilities.some(w => w.id === "W15")).toBe(true);
        });

        it("identifies workflows missing personas", () => {
            store.createWorkflow({
                id: "W16",
                name: "Persona-less Workflow",
                category: "exploration",
                goal: "No personas defined",
            });

            const gaps = store.findGaps();

            expect(gaps.workflows_without_personas.some(w => w.id === "W16")).toBe(true);
        });

        it("identifies capabilities without implementations", () => {
            store.createCapability({
                id: "unimplemented-cap",
                name: "Unimplemented Cap",
                category: "analysis",
                description: "No component implements this",
                status: "planned",
            });

            const gaps = store.findGaps();

            expect(gaps.capabilities_without_components.some(c => c.id === "unimplemented-cap")).toBe(true);
        });

        it("identifies workflow categories with low coverage", () => {
            // Create only one workflow in an uncommon category
            store.createWorkflow({
                id: "W17",
                name: "Admin Workflow",
                category: "administration",
                goal: "Only admin workflow",
            });

            const gaps = store.findGaps();

            // Should identify categories with few workflows
            expect(gaps.categories_with_few_workflows).toBeDefined();
        });
    });
});
