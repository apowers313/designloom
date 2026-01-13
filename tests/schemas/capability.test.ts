import { describe, it, expect } from "vitest";
import { CapabilitySchema } from "../../src/schemas/capability.js";

describe("CapabilitySchema", () => {
    it("validates a correct capability", () => {
        const valid = {
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
        };
        expect(() => CapabilitySchema.parse(valid)).not.toThrow();
    });

    it("validates a minimal capability", () => {
        const minimal = {
            id: "node-filter",
            name: "Node Filtering",
            category: "visualization",
            description: "Filter nodes by attributes",
        };
        expect(() => CapabilitySchema.parse(minimal)).not.toThrow();
    });

    it("rejects invalid capability ID format", () => {
        const invalid = {
            id: "DataImport", // Should be kebab-case
            name: "Data Import",
            category: "data",
            description: "Test",
        };
        expect(() => CapabilitySchema.parse(invalid)).toThrow(/ID must match pattern/);
    });

    it("rejects missing required fields", () => {
        const incomplete = { id: "data-import" };
        expect(() => CapabilitySchema.parse(incomplete)).toThrow();
    });

    it("validates all status values", () => {
        const statuses = ["planned", "in-progress", "implemented", "deprecated"];
        for (const status of statuses) {
            const cap = {
                id: "test-cap",
                name: "Test",
                category: "data",
                description: "Test capability",
                status,
            };
            expect(() => CapabilitySchema.parse(cap)).not.toThrow();
        }
    });

    it("rejects invalid status", () => {
        const invalid = {
            id: "test-cap",
            name: "Test",
            category: "data",
            description: "Test",
            status: "unknown",
        };
        expect(() => CapabilitySchema.parse(invalid)).toThrow();
    });

    it("validates capability with empty arrays", () => {
        const cap = {
            id: "orphan-cap",
            name: "Orphan Capability",
            category: "analysis",
            description: "Not used by anything",
            algorithms: [],
            used_by_workflows: [],
            implemented_by_components: [],
            requirements: [],
        };
        expect(() => CapabilitySchema.parse(cap)).not.toThrow();
    });
});
