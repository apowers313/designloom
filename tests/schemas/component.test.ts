import { describe, it, expect } from "vitest";
import { ComponentSchema } from "../../src/schemas/component.js";

describe("ComponentSchema", () => {
    it("validates a correct component", () => {
        const valid = {
            id: "data-import-dialog",
            name: "Data Import Dialog",
            category: "dialog",
            description: "Modal dialog for importing graph data files",
            status: "implemented",
            implements_capabilities: ["data-import"],
            used_in_workflows: ["W01", "W02"],
            dependencies: ["file-picker", "progress-bar"],
            props: {
                onImport: "Function called when import completes",
                allowedFormats: "Array of allowed file extensions",
            },
        };
        expect(() => ComponentSchema.parse(valid)).not.toThrow();
    });

    it("validates a minimal component", () => {
        const minimal = {
            id: "simple-button",
            name: "Simple Button",
            category: "control",
            description: "A basic button component",
        };
        expect(() => ComponentSchema.parse(minimal)).not.toThrow();
    });

    it("rejects invalid component ID format", () => {
        const invalid = {
            id: "DataImportDialog", // Should be kebab-case
            name: "Data Import Dialog",
            category: "dialog",
            description: "Test",
        };
        expect(() => ComponentSchema.parse(invalid)).toThrow(/ID must match pattern/);
    });

    it("rejects missing required fields", () => {
        const incomplete = { id: "data-import-dialog" };
        expect(() => ComponentSchema.parse(incomplete)).toThrow();
    });

    it("validates all status values", () => {
        const statuses = ["planned", "in-progress", "implemented", "deprecated"];
        for (const status of statuses) {
            const comp = {
                id: "test-comp",
                name: "Test",
                category: "control",
                description: "Test component",
                status,
            };
            expect(() => ComponentSchema.parse(comp)).not.toThrow();
        }
    });

    it("rejects invalid status", () => {
        const invalid = {
            id: "test-comp",
            name: "Test",
            category: "control",
            description: "Test",
            status: "broken",
        };
        expect(() => ComponentSchema.parse(invalid)).toThrow();
    });

    it("validates component with empty arrays", () => {
        const comp = {
            id: "standalone-comp",
            name: "Standalone Component",
            category: "utility",
            description: "Has no connections",
            implements_capabilities: [],
            used_in_workflows: [],
            dependencies: [],
        };
        expect(() => ComponentSchema.parse(comp)).not.toThrow();
    });

    it("validates component with props object", () => {
        const comp = {
            id: "configurable-comp",
            name: "Configurable Component",
            category: "display",
            description: "Has many props",
            props: {
                theme: "Light or dark theme",
                size: "Component size (sm, md, lg)",
                disabled: "Whether the component is disabled",
            },
        };
        expect(() => ComponentSchema.parse(comp)).not.toThrow();
    });
});
