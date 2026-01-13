import * as fs from "node:fs";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { DesignDocsStore } from "../../src/store/yaml-store.js";

describe("Diagram Export", () => {
    const testDir = path.join(process.cwd(), "tests", "fixtures", "diagram-export-temp");
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

    describe("exportDiagram for single entity", () => {
        it("exports mermaid diagram for a workflow with capabilities", () => {
            store.createCapability({
                id: "cap-1",
                name: "Data Import",
                category: "data",
                description: "Import data",
            });

            store.createWorkflow({
                id: "W01",
                name: "First Load",
                category: "onboarding",
                goal: "Load data",
                requires_capabilities: ["cap-1"],
            });

            const diagram = store.exportDiagram({ focus: "W01", depth: 1 });

            expect(diagram).toContain("graph TD");
            expect(diagram).toContain("W01");
            expect(diagram).toContain("cap-1");
            expect(diagram).toContain("-->");
        });

        it("exports mermaid diagram for a workflow with personas", () => {
            store.createPersona({
                id: "analyst-alex",
                name: "Analyst Alex",
                role: "Financial Analyst",
                characteristics: { expertise: "intermediate" },
                goals: ["Analyze data"],
            });

            store.createWorkflow({
                id: "W02",
                name: "Analysis Flow",
                category: "analysis",
                goal: "Analyze graphs",
                personas: ["analyst-alex"],
            });

            const diagram = store.exportDiagram({ focus: "W02", depth: 1 });

            expect(diagram).toContain("W02");
            expect(diagram).toContain("analyst-alex");
            expect(diagram).toContain("-->");
        });

        it("exports mermaid diagram for a workflow with components", () => {
            store.createComponent({
                id: "data-dialog",
                name: "Data Dialog",
                category: "dialog",
                description: "Import dialog",
            });

            store.createWorkflow({
                id: "W03",
                name: "Import Flow",
                category: "onboarding",
                goal: "Import data",
                suggested_components: ["data-dialog"],
            });

            const diagram = store.exportDiagram({ focus: "W03", depth: 1 });

            expect(diagram).toContain("W03");
            expect(diagram).toContain("data-dialog");
            expect(diagram).toContain("-->");
        });

        it("exports diagram with depth 2 showing capability components", () => {
            store.createCapability({
                id: "cap-2",
                name: "Visualization",
                category: "visualization",
                description: "Visualize data",
            });

            store.createComponent({
                id: "viz-panel",
                name: "Visualization Panel",
                category: "display",
                description: "Display visualizations",
                implements_capabilities: ["cap-2"],
            });

            store.createWorkflow({
                id: "W04",
                name: "View Flow",
                category: "exploration",
                goal: "View data",
                requires_capabilities: ["cap-2"],
            });

            const diagram = store.exportDiagram({ focus: "W04", depth: 2 });

            expect(diagram).toContain("W04");
            expect(diagram).toContain("cap-2");
            expect(diagram).toContain("viz-panel");
        });

        it("returns error for non-existent entity", () => {
            const diagram = store.exportDiagram({ focus: "W99", depth: 1 });

            expect(diagram).toContain("Error: Entity 'W99' not found");
        });
    });

    describe("exportDiagram for full graph", () => {
        it("exports full relationship graph with subgraphs", () => {
            store.createCapability({
                id: "cap-a",
                name: "Capability A",
                category: "data",
                description: "Capability A description",
            });

            store.createCapability({
                id: "cap-b",
                name: "Capability B",
                category: "visualization",
                description: "Capability B description",
            });

            store.createPersona({
                id: "user-1",
                name: "User One",
                role: "Developer",
                characteristics: { expertise: "expert" },
                goals: ["Build apps"],
            });

            store.createComponent({
                id: "comp-1",
                name: "Component One",
                category: "control",
                description: "Control component",
                implements_capabilities: ["cap-a"],
            });

            store.createWorkflow({
                id: "W05",
                name: "Full Workflow",
                category: "analysis",
                goal: "Do everything",
                requires_capabilities: ["cap-a", "cap-b"],
                personas: ["user-1"],
                suggested_components: ["comp-1"],
            });

            const diagram = store.exportDiagram({ focus: "all", depth: 2 });

            expect(diagram).toContain("graph TD");
            expect(diagram).toContain("subgraph Workflows");
            expect(diagram).toContain("subgraph Capabilities");
            expect(diagram).toContain("subgraph Personas");
            expect(diagram).toContain("subgraph Components");
            expect(diagram).toContain("W05");
            expect(diagram).toContain("cap-a");
            expect(diagram).toContain("cap-b");
            expect(diagram).toContain("user-1");
            expect(diagram).toContain("comp-1");
        });

        it("exports empty diagram for empty store", () => {
            const diagram = store.exportDiagram({ focus: "all", depth: 1 });

            expect(diagram).toContain("graph TD");
            // Should still have subgraph structure even if empty
            expect(diagram).toContain("subgraph Workflows");
        });
    });

    describe("exportDiagram defaults", () => {
        it("defaults to depth 1 when not specified", () => {
            store.createCapability({
                id: "cap-default",
                name: "Default Cap",
                category: "data",
                description: "Default capability",
            });

            store.createComponent({
                id: "comp-default",
                name: "Default Comp",
                category: "control",
                description: "Default component",
                implements_capabilities: ["cap-default"],
            });

            store.createWorkflow({
                id: "W06",
                name: "Default Workflow",
                category: "exploration",
                goal: "Test defaults",
                requires_capabilities: ["cap-default"],
            });

            // Without depth, should default to 1 (only direct relationships)
            const diagram = store.exportDiagram({ focus: "W06" });

            expect(diagram).toContain("W06");
            expect(diagram).toContain("cap-default");
            // Component should NOT be included at depth 1 (it's related through capability)
            expect(diagram).not.toContain("comp-default");
        });
    });

    describe("exportDiagram edge styling", () => {
        it("uses different arrow styles for different relationship types", () => {
            store.createCapability({
                id: "cap-styled",
                name: "Styled Cap",
                category: "data",
                description: "Styled capability",
            });

            store.createPersona({
                id: "persona-styled",
                name: "Styled Persona",
                role: "Tester",
                characteristics: { expertise: "novice" },
                goals: ["Test things"],
            });

            store.createWorkflow({
                id: "W07",
                name: "Styled Workflow",
                category: "analysis",
                goal: "Test styling",
                requires_capabilities: ["cap-styled"],
                personas: ["persona-styled"],
            });

            const diagram = store.exportDiagram({ focus: "W07", depth: 1 });

            // Should show relationship labels or different arrow styles
            expect(diagram).toContain("requires");
            expect(diagram).toContain("uses");
        });
    });
});
