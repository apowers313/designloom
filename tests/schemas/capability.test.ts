import { describe, it, expect } from "vitest";
import { CapabilitySchema } from "../../src/schemas/capability.js";
import { withVersionMetadata } from "../test-helpers.js";

describe("CapabilitySchema", () => {
    it("validates a correct capability", () => {
        const valid = withVersionMetadata({
            id: "data-import",
            name: "Data Import",
            category: "data",
            description: "Import graph data from various file formats",
            status: "implemented",
            algorithms: ["csv-parser", "json-parser"],
            used_by_workflows: ["W01", "W02"],
            implemented_by_components: ["data-import-dialog"],
            requirements: [
                "Support CSV, JSON, GraphML formats",
                "Validate file structure before import",
            ],
        });
        expect(() => CapabilitySchema.parse(valid)).not.toThrow();
    });

    it("validates a minimal capability", () => {
        const minimal = withVersionMetadata({
            id: "node-filter",
            name: "Node Filtering",
            category: "visualization",
            description: "Filter nodes by attributes",
        });
        expect(() => CapabilitySchema.parse(minimal)).not.toThrow();
    });

    it("rejects invalid capability ID format", () => {
        const invalid = withVersionMetadata({
            id: "DataImport", // Should be kebab-case
            name: "Data Import",
            category: "data",
            description: "Test",
        });
        expect(() => CapabilitySchema.parse(invalid)).toThrow(/ID must match pattern/);
    });

    it("rejects missing required fields", () => {
        const incomplete = { id: "data-import" };
        expect(() => CapabilitySchema.parse(incomplete)).toThrow();
    });

    it("validates all status values", () => {
        const statuses = ["planned", "in-progress", "implemented", "deprecated"];
        for (const status of statuses) {
            const cap = withVersionMetadata({
                id: "test-cap",
                name: "Test",
                category: "data",
                description: "Test capability",
                status,
            });
            expect(() => CapabilitySchema.parse(cap)).not.toThrow();
        }
    });

    it("rejects invalid status", () => {
        const invalid = withVersionMetadata({
            id: "test-cap",
            name: "Test",
            category: "data",
            description: "Test",
            status: "unknown",
        });
        expect(() => CapabilitySchema.parse(invalid)).toThrow();
    });

    it("validates capability with empty arrays", () => {
        const cap = withVersionMetadata({
            id: "orphan-cap",
            name: "Orphan Capability",
            category: "analysis",
            description: "Not used by anything",
            algorithms: [],
            used_by_workflows: [],
            implemented_by_components: [],
            requirements: [],
        });
        expect(() => CapabilitySchema.parse(cap)).not.toThrow();
    });

    it("validates capability with sources", () => {
        const withSources = withVersionMetadata({
            id: "documented-cap",
            name: "Documented Capability",
            category: "visualization",
            description: "Capability with source references",
            sources: [
                {
                    title: "Graph Visualization Best Practices",
                    url: "https://example.com/graph-viz",
                    bibliography: {
                        author: "Dr. Viz Expert",
                        date: "2023-06-01",
                        publisher: "Academic Press",
                    },
                },
            ],
        });
        expect(() => CapabilitySchema.parse(withSources)).not.toThrow();
    });

    it("validates capability with empty sources array", () => {
        const emptySources = withVersionMetadata({
            id: "no-sources-cap",
            name: "Capability without Sources",
            category: "data",
            description: "Has no source references",
            sources: [],
        });
        expect(() => CapabilitySchema.parse(emptySources)).not.toThrow();
    });
});
