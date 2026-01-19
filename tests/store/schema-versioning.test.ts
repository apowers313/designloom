import * as fs from "node:fs";
import * as path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { CURRENT_SCHEMA_VERSION } from "../../src/schemas/version.js";
import { DesignDocsStore } from "../../src/store/yaml-store.js";

const TEMP_PATH = path.join(__dirname, "../temp-schema-versioning-tests");

function setupTempDir(): void {
    if (fs.existsSync(TEMP_PATH)) {
        fs.rmSync(TEMP_PATH, { recursive: true });
    }
    fs.mkdirSync(path.join(TEMP_PATH, "workflows"), { recursive: true });
    fs.mkdirSync(path.join(TEMP_PATH, "capabilities"), { recursive: true });
    fs.mkdirSync(path.join(TEMP_PATH, "personas"), { recursive: true });
    fs.mkdirSync(path.join(TEMP_PATH, "components"), { recursive: true });
}

function cleanupTempDir(): void {
    if (fs.existsSync(TEMP_PATH)) {
        fs.rmSync(TEMP_PATH, { recursive: true });
    }
}

describe("Schema Versioning", () => {
    let store: DesignDocsStore;

    beforeEach(() => {
        setupTempDir();
        store = new DesignDocsStore(TEMP_PATH);
    });

    afterEach(() => {
        cleanupTempDir();
    });

    describe("new entities get schema_version", () => {
        it("sets schema_version on new workflow", () => {
            store.createWorkflow({
                id: "W01",
                name: "Test Workflow",
                goal: "Test goal",
                category: "analysis",
                personas: [],
                success_criteria: [],
            });

            const workflow = store.getWorkflow("W01");
            expect(workflow?.schema_version).toBe(CURRENT_SCHEMA_VERSION);
        });

        it("sets schema_version on new capability", () => {
            store.createCapability({
                id: "test-cap",
                name: "Test Capability",
                category: "data",
                description: "Test description",
            });

            const capability = store.getCapability("test-cap");
            expect(capability?.schema_version).toBe(CURRENT_SCHEMA_VERSION);
        });

        it("sets schema_version on new persona", () => {
            store.createPersona({
                id: "test-persona",
                name: "Test Persona",
                role: "Tester",
                characteristics: {
                    expertise: "intermediate",
                },
                goals: ["Test things"],
            });

            const persona = store.getPersona("test-persona");
            expect(persona?.schema_version).toBe(CURRENT_SCHEMA_VERSION);
        });

        it("sets schema_version on new component", () => {
            store.createComponent({
                id: "test-component",
                name: "Test Component",
                category: "display",
                description: "Test description",
            });

            const component = store.getComponent("test-component");
            expect(component?.schema_version).toBe(CURRENT_SCHEMA_VERSION);
        });
    });

    describe("updated entities get schema_version", () => {
        it("adds schema_version when updating legacy entity", () => {
            // Create a legacy file without schema_version
            const legacyYaml = `id: W01
name: Legacy Workflow
goal: Test goal
category: analysis
version: "1.0.0"
created_at: "2024-01-01T00:00:00.000Z"
updated_at: "2024-01-01T00:00:00.000Z"
personas: []
success_criteria: []
requires_capabilities: []
suggested_components: []
`;
            fs.writeFileSync(path.join(TEMP_PATH, "workflows", "W01.yaml"), legacyYaml);

            // Create fresh store to load legacy file
            const freshStore = new DesignDocsStore(TEMP_PATH);

            // Update the workflow
            freshStore.updateWorkflow("W01", { name: "Updated Workflow" });

            // Verify schema_version was added
            const updated = freshStore.getWorkflow("W01");
            expect(updated?.schema_version).toBe(CURRENT_SCHEMA_VERSION);
        });
    });

    describe("getSchemaWarnings", () => {
        it("returns empty array for new entities", () => {
            store.createWorkflow({
                id: "W01",
                name: "Test Workflow",
                goal: "Test goal",
                category: "data-management",
                personas: [],
                steps: [],
                success_criteria: [],
            });

            const warnings = store.getSchemaWarnings();
            expect(warnings).toHaveLength(0);
        });

        it("returns warning for legacy entity without schema_version", () => {
            // Create a legacy file without schema_version
            const legacyYaml = `id: W01
name: Legacy Workflow
goal: Test goal
category: analysis
version: "1.0.0"
created_at: "2024-01-01T00:00:00.000Z"
updated_at: "2024-01-01T00:00:00.000Z"
personas: []
success_criteria: []
requires_capabilities: []
suggested_components: []
`;
            fs.writeFileSync(path.join(TEMP_PATH, "workflows", "W01.yaml"), legacyYaml);

            // Create fresh store to load legacy file
            const freshStore = new DesignDocsStore(TEMP_PATH);
            const warnings = freshStore.getSchemaWarnings();

            expect(warnings).toHaveLength(1);
            expect(warnings[0].entityType).toBe("workflow");
            expect(warnings[0].entityId).toBe("W01");
            expect(warnings[0].storedVersion).toBe("0.0.0");
            expect(warnings[0].severity).toBe("warning");
        });

        it("includes warnings in validate() result", () => {
            // Create a legacy file without schema_version
            const legacyYaml = `id: test-cap
name: Legacy Capability
category: data
description: Test
status: planned
version: "1.0.0"
created_at: "2024-01-01T00:00:00.000Z"
updated_at: "2024-01-01T00:00:00.000Z"
used_by_workflows: []
implemented_by_components: []
`;
            fs.writeFileSync(path.join(TEMP_PATH, "capabilities", "test-cap.yaml"), legacyYaml);

            // Create a workflow that uses it to avoid orphan warning
            const workflowYaml = `id: W01
name: Test Workflow
goal: Test goal
category: analysis
schema_version: "${CURRENT_SCHEMA_VERSION}"
version: "1.0.0"
created_at: "2024-01-01T00:00:00.000Z"
updated_at: "2024-01-01T00:00:00.000Z"
personas: []
success_criteria: []
requires_capabilities:
  - test-cap
suggested_components: []
`;
            fs.writeFileSync(path.join(TEMP_PATH, "workflows", "W01.yaml"), workflowYaml);

            const freshStore = new DesignDocsStore(TEMP_PATH);
            const result = freshStore.validate();

            // Should have schema warning in warnings array
            expect(result.warnings.some(w => w.includes("[Schema]"))).toBe(true);
            expect(result.warnings.some(w => w.includes("test-cap"))).toBe(true);
        });
    });

    describe("schema_version persistence", () => {
        it("persists schema_version in YAML file", () => {
            store.createCapability({
                id: "persist-test",
                name: "Persistence Test",
                category: "data",
                description: "Test",
            });

            // Read the YAML file directly
            const filePath = path.join(TEMP_PATH, "capabilities", "persist-test.yaml");
            const content = fs.readFileSync(filePath, "utf-8");

            expect(content).toContain("schema_version:");
            expect(content).toContain(CURRENT_SCHEMA_VERSION);
        });

        it("preserves schema_version on reload", () => {
            store.createWorkflow({
                id: "W01",
                name: "Reload Test",
                goal: "Test goal",
                category: "analysis",
                personas: [],
                success_criteria: [],
            });

            // Create a new store instance to reload from disk
            const freshStore = new DesignDocsStore(TEMP_PATH);
            const workflow = freshStore.getWorkflow("W01");

            expect(workflow?.schema_version).toBe(CURRENT_SCHEMA_VERSION);
        });
    });
});
