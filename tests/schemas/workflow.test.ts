import { describe, it, expect } from "vitest";
import { WorkflowSchema } from "../../src/schemas/workflow.js";
import { withVersionMetadata } from "../test-helpers.js";

describe("WorkflowSchema", () => {
    it("validates a correct workflow", () => {
        const valid = withVersionMetadata({
            id: "W01",
            name: "Test Workflow",
            category: "analysis",
            validated: true,
            personas: ["analyst-alex"],
            requires_capabilities: ["data-import"],
            suggested_components: ["import-dialog"],
            starting_state: {
                data_type: "graph",
                node_count: "100",
                edge_density: "medium",
                user_expertise: "intermediate",
            },
            goal: "Test the workflow functionality",
            success_criteria: [
                { metric: "time_to_complete", target: "< 30 seconds" },
            ],
        });
        expect(() => WorkflowSchema.parse(valid)).not.toThrow();
    });

    it("validates a minimal workflow", () => {
        const minimal = withVersionMetadata({
            id: "W01",
            name: "Minimal Workflow",
            category: "onboarding",
            goal: "Test minimal workflow",
        });
        expect(() => WorkflowSchema.parse(minimal)).not.toThrow();
    });

    it("rejects invalid workflow ID format", () => {
        const invalid = withVersionMetadata({
            id: "workflow-1", // Should be W01 format
            name: "Test Workflow",
            category: "analysis",
            goal: "Test goal",
        });
        expect(() => WorkflowSchema.parse(invalid)).toThrow(/ID must match pattern/);
    });

    it("rejects missing required fields", () => {
        const incomplete = { id: "W01" };
        expect(() => WorkflowSchema.parse(incomplete)).toThrow();
    });

    it("validates workflow with all optional fields", () => {
        const full = withVersionMetadata({
            id: "W99",
            name: "Full Workflow",
            category: "exploration",
            validated: false,
            personas: ["analyst-alex", "developer-dave"],
            requires_capabilities: ["cap-1", "cap-2"],
            suggested_components: ["comp-1", "comp-2"],
            starting_state: {
                data_type: "tree",
                node_count: "1000",
                edge_density: "low",
                user_expertise: "expert",
            },
            goal: "Complete workflow test",
            success_criteria: [
                { metric: "accuracy", target: "> 95%" },
                { metric: "time", target: "< 1 minute" },
            ],
        });
        expect(() => WorkflowSchema.parse(full)).not.toThrow();
    });

    it("rejects invalid category", () => {
        const invalid = withVersionMetadata({
            id: "W01",
            name: "Test",
            category: "invalid-category",
            goal: "Test",
        });
        expect(() => WorkflowSchema.parse(invalid)).toThrow();
    });

    it("validates workflow with sources", () => {
        const withSources = withVersionMetadata({
            id: "W01",
            name: "Workflow with Sources",
            category: "analysis",
            goal: "Test workflow with source references",
            sources: [
                {
                    title: "User Research Report",
                    url: "https://example.com/research",
                    summary: "Key findings from user interviews",
                    bibliography: {
                        author: "Research Team",
                        date: "2024-01-15",
                    },
                },
                {
                    title: "Design Guidelines",
                    url: "https://example.com/guidelines",
                },
            ],
        });
        expect(() => WorkflowSchema.parse(withSources)).not.toThrow();
    });

    it("validates workflow with empty sources array", () => {
        const emptySources = withVersionMetadata({
            id: "W01",
            name: "Workflow without Sources",
            category: "analysis",
            goal: "Test workflow",
            sources: [],
        });
        expect(() => WorkflowSchema.parse(emptySources)).not.toThrow();
    });

    it("rejects workflow with invalid source (missing url)", () => {
        const invalidSource = withVersionMetadata({
            id: "W01",
            name: "Invalid Source Workflow",
            category: "analysis",
            goal: "Test workflow",
            sources: [
                {
                    title: "Missing URL",
                },
            ],
        });
        expect(() => WorkflowSchema.parse(invalidSource)).toThrow();
    });
});
