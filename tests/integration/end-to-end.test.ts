import * as fs from "node:fs";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { DesignloomServer } from "../../src/index.js";

/**
 * End-to-End Integration Tests for Designloom
 *
 * These tests verify the complete design-to-implementation cycle,
 * ensuring all MCP tools work together correctly.
 */
describe("End-to-End Workflow", () => {
    const testDir = path.join(process.cwd(), "tests", "fixtures", "e2e-temp");
    let server: DesignloomServer;

    beforeEach(() => {
        // Create temporary directories for test
        fs.mkdirSync(path.join(testDir, "workflows"), { recursive: true });
        fs.mkdirSync(path.join(testDir, "capabilities"), { recursive: true });
        fs.mkdirSync(path.join(testDir, "personas"), { recursive: true });
        fs.mkdirSync(path.join(testDir, "components"), { recursive: true });

        server = new DesignloomServer(testDir);
    });

    afterEach(() => {
        // Clean up temporary directory
        fs.rmSync(testDir, { recursive: true, force: true });
    });

    it("completes full design-to-implementation cycle", () => {
        // 1. Create a persona
        const personaResult = server.callTool("design_create", {
            entity_type: "persona",
            id: "test-user",
            name: "Test User",
            role: "Software Developer",
            characteristics: {
                expertise: "intermediate",
                time_pressure: "medium",
                graph_literacy: "basic",
            },
            goals: ["Understand graph structures", "Find patterns in data"],
            frustrations: ["Complex interfaces", "Slow loading times"],
        });
        expect(personaResult.isError).toBe(undefined);
        expect(JSON.parse(personaResult.content[0].text).success).toBe(true);

        // 2. Create capabilities
        const capabilityResult1 = server.callTool("design_create", {
            entity_type: "capability",
            id: "graph-import",
            name: "Graph Import",
            category: "data",
            description: "Import graph data from various file formats",
            status: "implemented",
            requirements: ["Support JSON format", "Validate data structure"],
        });
        expect(capabilityResult1.isError).toBe(undefined);
        expect(JSON.parse(capabilityResult1.content[0].text).success).toBe(true);

        const capabilityResult2 = server.callTool("design_create", {
            entity_type: "capability",
            id: "graph-visualization",
            name: "Graph Visualization",
            category: "visualization",
            description: "Display graph in 2D or 3D",
            status: "planned",
            requirements: ["Support 2D layout", "Support 3D layout"],
        });
        expect(capabilityResult2.isError).toBe(undefined);
        expect(JSON.parse(capabilityResult2.content[0].text).success).toBe(true);

        // 3. Create a component that implements a capability
        const componentResult = server.callTool("design_create", {
            entity_type: "component",
            id: "import-dialog",
            name: "Import Dialog",
            category: "dialog",
            description: "Dialog for importing graph data",
            status: "implemented",
            implements_capabilities: ["graph-import"],
        });
        expect(componentResult.isError).toBe(undefined);
        expect(JSON.parse(componentResult.content[0].text).success).toBe(true);

        // 4. Create a workflow referencing all entities
        const workflowResult = server.callTool("design_create", {
            entity_type: "workflow",
            id: "W01",
            name: "First Graph Load",
            category: "onboarding",
            goal: "Load and visualize first graph",
            personas: ["test-user"],
            requires_capabilities: ["graph-import", "graph-visualization"],
            suggested_components: ["import-dialog"],
            starting_state: {
                data_type: "unknown",
                node_count: "0",
                user_expertise: "novice",
            },
            success_criteria: [
                { metric: "time_to_visualization", target: "< 30 seconds" },
                { metric: "user_satisfaction", target: "> 4.0 stars" },
            ],
        });
        expect(workflowResult.isError).toBe(undefined);
        expect(JSON.parse(workflowResult.content[0].text).success).toBe(true);

        // 5. Validate the design
        const validation = server.callTool("design_validate", { check: "all" });
        expect(validation.isError).toBe(undefined);
        const validationData = JSON.parse(validation.content[0].text);
        expect(validationData.valid).toBe(true);
        expect(validationData.errors).toHaveLength(0);

        // 6. Generate tests from workflow
        const tests = server.callTool("design_export", {
            format: "tests",
            workflow_id: "W01",
            test_format: "vitest",
        });
        expect(tests.isError).toBe(undefined);
        expect(tests.content[0].text).toContain("describe");
        expect(tests.content[0].text).toContain("W01: First Graph Load");
        expect(tests.content[0].text).toContain("time_to_visualization");

        // 7. Update capability status to implemented
        const updateResult = server.callTool("design_update", {
            entity_type: "capability",
            id: "graph-visualization",
            status: "implemented",
        });
        expect(updateResult.isError).toBe(undefined);
        expect(JSON.parse(updateResult.content[0].text).success).toBe(true);

        // 8. Coverage report shows progress
        const coverage = server.callTool("design_analyze", { report: "coverage" });
        expect(coverage.isError).toBe(undefined);
        const coverageData = JSON.parse(coverage.content[0].text);
        // After updating graph-visualization to implemented, we should have 2 implemented capabilities
        // (graph-import was created as implemented, graph-visualization was updated to implemented)
        expect(coverageData.summary.total_workflows).toBe(1);
        expect(coverageData.summary.total_capabilities).toBe(2);
        expect(coverageData.summary.total_personas).toBe(1);
        expect(coverageData.summary.total_components).toBe(1);
        expect(coverageData.summary.implementation_status.implemented).toBe(2);

        // 9. Export diagram
        const diagram = server.callTool("design_export", {
            format: "diagram",
            focus: "W01",
            depth: 1,
        });
        expect(diagram.isError).toBe(undefined);
        expect(diagram.content[0].text).toContain("graph");
        expect(diagram.content[0].text).toContain("W01");

        // 10. Get workflow with resolved references
        const workflow = server.callTool("design_get", { entity_type: "workflow", id: "W01" });
        expect(workflow.isError).toBe(undefined);
        const workflowData = JSON.parse(workflow.content[0].text);
        expect(workflowData.id).toBe("W01");
        expect(workflowData._resolved).toBeDefined();
        expect(workflowData._resolved.capabilities).toHaveLength(2);
        expect(workflowData._resolved.personas).toHaveLength(1);
    });

    it("handles validation errors for broken references", () => {
        // Create a workflow with non-existent references
        const workflowResult = server.callTool("design_create", {
            entity_type: "workflow",
            id: "W02",
            name: "Broken Workflow",
            category: "analysis",
            goal: "Test validation",
            requires_capabilities: ["non-existent-cap"],
        });

        expect(workflowResult.isError).toBe(true);
        expect(workflowResult.content[0].text).toContain("non-existent-cap");
    });

    it("handles complete workflow with link operations", () => {
        // Create capability first
        server.callTool("design_create", {
            entity_type: "capability",
            id: "new-cap",
            name: "New Capability",
            category: "analysis",
            description: "A new capability",
            status: "planned",
        });

        // Create workflow without the capability
        server.callTool("design_create", {
            entity_type: "workflow",
            id: "W03",
            name: "Linkable Workflow",
            category: "exploration",
            goal: "Test linking",
        });

        // Link the capability to the workflow
        const linkResult = server.callTool("design_link", {
            action: "link",
            from_type: "workflow",
            from_id: "W03",
            to_type: "capability",
            to_id: "new-cap",
            relationship: "requires",
        });
        expect(linkResult.isError).toBe(undefined);
        expect(JSON.parse(linkResult.content[0].text).success).toBe(true);

        // Verify the link was created
        const workflow = server.callTool("design_get", { entity_type: "workflow", id: "W03" });
        const workflowData = JSON.parse(workflow.content[0].text);
        expect(workflowData.requires_capabilities).toContain("new-cap");

        // Unlink the capability
        const unlinkResult = server.callTool("design_link", {
            action: "unlink",
            from_type: "workflow",
            from_id: "W03",
            to_type: "capability",
            to_id: "new-cap",
            relationship: "requires",
        });
        expect(unlinkResult.isError).toBe(undefined);
        expect(JSON.parse(unlinkResult.content[0].text).success).toBe(true);

        // Verify the link was removed
        const workflowAfter = server.callTool("design_get", { entity_type: "workflow", id: "W03" });
        const workflowDataAfter = JSON.parse(workflowAfter.content[0].text);
        expect(workflowDataAfter.requires_capabilities).not.toContain("new-cap");
    });

    it("handles priority suggestions", () => {
        // Create multiple capabilities with different usage patterns
        server.callTool("design_create", {
            entity_type: "capability",
            id: "high-demand",
            name: "High Demand",
            category: "data",
            description: "Used by many workflows",
            status: "planned",
        });

        server.callTool("design_create", {
            entity_type: "capability",
            id: "low-demand",
            name: "Low Demand",
            category: "visualization",
            description: "Used by few workflows",
            status: "planned",
        });

        // Create workflows that use high-demand capability
        server.callTool("design_create", {
            entity_type: "workflow",
            id: "W04",
            name: "Workflow 1",
            category: "analysis",
            goal: "Uses high demand",
            requires_capabilities: ["high-demand"],
        });

        server.callTool("design_create", {
            entity_type: "workflow",
            id: "W05",
            name: "Workflow 2",
            category: "exploration",
            goal: "Also uses high demand",
            requires_capabilities: ["high-demand"],
        });

        server.callTool("design_create", {
            entity_type: "workflow",
            id: "W06",
            name: "Workflow 3",
            category: "reporting",
            goal: "Uses low demand",
            requires_capabilities: ["low-demand"],
        });

        // Get priority suggestions
        const suggestions = server.callTool("design_analyze", {
            report: "priority",
            focus: "capability",
        });
        expect(suggestions.isError).toBe(undefined);
        const suggestionsData = JSON.parse(suggestions.content[0].text);

        // High demand should be prioritized over low demand
        expect(suggestionsData.recommendations.length).toBeGreaterThan(0);
        const highDemandIndex = suggestionsData.recommendations.findIndex(
            (r: { id: string }) => r.id === "high-demand"
        );
        const lowDemandIndex = suggestionsData.recommendations.findIndex(
            (r: { id: string }) => r.id === "low-demand"
        );
        expect(highDemandIndex).toBeLessThan(lowDemandIndex);
    });

    it("handles delete operations with dependencies", () => {
        // Create a capability
        server.callTool("design_create", {
            entity_type: "capability",
            id: "deletable-cap",
            name: "Deletable Capability",
            category: "data",
            description: "Can be deleted",
            status: "planned",
        });

        // Create a workflow that uses it
        server.callTool("design_create", {
            entity_type: "workflow",
            id: "W07",
            name: "Dependent Workflow",
            category: "analysis",
            goal: "Uses deletable capability",
            requires_capabilities: ["deletable-cap"],
        });

        // Try to delete without force - should warn with an error
        const deleteResult = server.callTool("design_delete", {
            entity_type: "capability",
            id: "deletable-cap",
            force: false,
        });
        // When there are dependent workflows, the delete returns isError: true with a warning message
        expect(deleteResult.isError).toBe(true);
        expect(deleteResult.content[0].text).toContain("Cannot delete capability");
        expect(deleteResult.content[0].text).toContain("W07");

        // Force delete - should clean up references
        const forceDeleteResult = server.callTool("design_delete", {
            entity_type: "capability",
            id: "deletable-cap",
            force: true,
        });
        expect(forceDeleteResult.isError).toBe(undefined);
        expect(JSON.parse(forceDeleteResult.content[0].text).success).toBe(true);

        // Verify the workflow no longer references the deleted capability
        const workflow = server.callTool("design_get", { entity_type: "workflow", id: "W07" });
        const workflowData = JSON.parse(workflow.content[0].text);
        expect(workflowData.requires_capabilities).not.toContain("deletable-cap");
    });

    it("handles orphan detection", () => {
        // Create an orphaned capability (not used by any workflow)
        server.callTool("design_create", {
            entity_type: "capability",
            id: "orphan-cap",
            name: "Orphan Capability",
            category: "analysis",
            description: "Not used by anyone",
            status: "planned",
        });

        // Find orphans
        const orphans = server.callTool("design_validate", {
            check: "orphans",
            entity_type: "capability",
        });
        expect(orphans.isError).toBe(undefined);
        const orphansData = JSON.parse(orphans.content[0].text);
        expect(orphansData.capabilities.some((c: { id: string }) => c.id === "orphan-cap")).toBe(true);
    });

    it("handles gap analysis", () => {
        // Create a workflow without capabilities
        server.callTool("design_create", {
            entity_type: "workflow",
            id: "W08",
            name: "Empty Workflow",
            category: "administration",
            goal: "Has no capabilities",
        });

        // Find gaps
        const gaps = server.callTool("design_validate", { check: "gaps" });
        expect(gaps.isError).toBe(undefined);
        const gapsData = JSON.parse(gaps.content[0].text);
        expect(gapsData.workflows_without_capabilities.some((w: { id: string }) => w.id === "W08")).toBe(true);
        expect(gapsData.workflows_without_personas.some((w: { id: string }) => w.id === "W08")).toBe(true);
    });
});
