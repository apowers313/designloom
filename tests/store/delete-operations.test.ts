import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { DesignDocsStore } from "../../src/store/yaml-store.js";
import * as fs from "node:fs";
import * as path from "node:path";

// Use a separate temp directory for delete tests
const TEMP_PATH = path.join(__dirname, "../temp-delete-tests");
const FIXTURES_PATH = path.join(__dirname, "../fixtures/design");

/**
 * Copy fixtures to temp directory for isolated testing
 */
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

describe("Delete Operations", () => {
    let store: DesignDocsStore;

    beforeEach(() => {
        setupTempDir();
        store = new DesignDocsStore(TEMP_PATH);
    });

    afterEach(() => {
        cleanupTempDir();
    });

    describe("deleteWorkflow", () => {
        it("deletes workflow without dependents", () => {
            store.createWorkflow({
                id: "W30",
                name: "Delete Test Workflow",
                category: "analysis",
                goal: "Test deletion",
            });

            const result = store.deleteWorkflow("W30");

            expect(result.success).toBe(true);
            expect(store.workflowExists("W30")).toBe(false);
        });

        it("removes YAML file on delete", () => {
            store.createWorkflow({
                id: "W31",
                name: "File Delete Test",
                category: "analysis",
                goal: "Test file deletion",
            });

            const filePath = path.join(TEMP_PATH, "workflows", "W31.yaml");
            expect(fs.existsSync(filePath)).toBe(true);

            store.deleteWorkflow("W31");

            expect(fs.existsSync(filePath)).toBe(false);
        });

        it("returns error for non-existent workflow", () => {
            const result = store.deleteWorkflow("W999");

            expect(result.success).toBe(false);
            expect(result.error).toContain("Workflow 'W999' not found");
        });

        it("cleans up reverse relationships on delete", () => {
            // Create capability and workflow that uses it
            store.createCapability({
                id: "cleanup-test-cap",
                name: "Cleanup Test Cap",
                category: "data",
                description: "Test cleanup",
            });

            store.createWorkflow({
                id: "W32",
                name: "Cleanup Workflow",
                category: "analysis",
                goal: "Test cleanup",
                requires_capabilities: ["cleanup-test-cap"],
            });

            // Verify relationship exists
            store.refresh();
            expect(store.getCapability("cleanup-test-cap")?.used_by_workflows).toContain("W32");

            // Delete workflow
            store.deleteWorkflow("W32");

            // Verify cleanup
            store.refresh();
            expect(store.getCapability("cleanup-test-cap")?.used_by_workflows).not.toContain("W32");
        });
    });

    describe("deleteCapability", () => {
        it("deletes capability without dependents", () => {
            store.createCapability({
                id: "delete-test-cap",
                name: "Delete Test Cap",
                category: "data",
                description: "Test deletion",
            });

            const result = store.deleteCapability("delete-test-cap");

            expect(result.success).toBe(true);
            expect(store.capabilityExists("delete-test-cap")).toBe(false);
        });

        it("warns when deleting capability with dependent workflows", () => {
            store.createCapability({
                id: "dependent-cap",
                name: "Dependent Cap",
                category: "data",
                description: "Has dependents",
            });

            store.createWorkflow({
                id: "W33",
                name: "Dependent Workflow",
                category: "analysis",
                goal: "Depends on capability",
                requires_capabilities: ["dependent-cap"],
            });

            const result = store.deleteCapability("dependent-cap", { force: false });

            expect(result.success).toBe(false);
            expect(result.warnings).toBeDefined();
            expect(result.warnings).toContain("W33");
        });

        it("force deletes and cleans up references", () => {
            store.createCapability({
                id: "force-delete-cap",
                name: "Force Delete Cap",
                category: "data",
                description: "Force delete test",
            });

            store.createWorkflow({
                id: "W34",
                name: "Force Delete Workflow",
                category: "analysis",
                goal: "Test force delete",
                requires_capabilities: ["force-delete-cap"],
            });

            const result = store.deleteCapability("force-delete-cap", { force: true });

            expect(result.success).toBe(true);
            expect(store.capabilityExists("force-delete-cap")).toBe(false);

            // Verify the workflow's reference was cleaned up
            store.refresh();
            const workflow = store.getWorkflow("W34");
            expect(workflow?.requires_capabilities).not.toContain("force-delete-cap");
        });

        it("returns error for non-existent capability", () => {
            const result = store.deleteCapability("non-existent");

            expect(result.success).toBe(false);
            expect(result.error).toContain("Capability 'non-existent' not found");
        });
    });

    describe("deletePersona", () => {
        it("deletes persona without dependents", () => {
            store.createPersona({
                id: "delete-test-persona",
                name: "Delete Test Persona",
                role: "Tester",
                characteristics: { expertise: "novice" },
                goals: ["Test deletion"],
            });

            const result = store.deletePersona("delete-test-persona");

            expect(result.success).toBe(true);
            expect(store.personaExists("delete-test-persona")).toBe(false);
        });

        it("warns when deleting persona with dependent workflows", () => {
            store.createPersona({
                id: "dependent-persona",
                name: "Dependent Persona",
                role: "Tester",
                characteristics: { expertise: "novice" },
                goals: ["Test"],
            });

            store.createWorkflow({
                id: "W35",
                name: "Persona Dependent Workflow",
                category: "analysis",
                goal: "Uses persona",
                personas: ["dependent-persona"],
            });

            const result = store.deletePersona("dependent-persona", { force: false });

            expect(result.success).toBe(false);
            expect(result.warnings).toBeDefined();
            expect(result.warnings).toContain("W35");
        });

        it("force deletes and cleans up workflow references", () => {
            store.createPersona({
                id: "force-delete-persona",
                name: "Force Delete Persona",
                role: "Tester",
                characteristics: { expertise: "novice" },
                goals: ["Test"],
            });

            store.createWorkflow({
                id: "W36",
                name: "Force Persona Workflow",
                category: "analysis",
                goal: "Test force delete",
                personas: ["force-delete-persona"],
            });

            const result = store.deletePersona("force-delete-persona", { force: true });

            expect(result.success).toBe(true);
            expect(store.personaExists("force-delete-persona")).toBe(false);

            store.refresh();
            const workflow = store.getWorkflow("W36");
            expect(workflow?.personas).not.toContain("force-delete-persona");
        });

        it("returns error for non-existent persona", () => {
            const result = store.deletePersona("non-existent");

            expect(result.success).toBe(false);
            expect(result.error).toContain("Persona 'non-existent' not found");
        });
    });

    describe("deleteComponent", () => {
        it("deletes component without dependents", () => {
            store.createComponent({
                id: "delete-test-comp",
                name: "Delete Test Component",
                category: "dialog",
                description: "Test deletion",
            });

            const result = store.deleteComponent("delete-test-comp");

            expect(result.success).toBe(true);
            expect(store.componentExists("delete-test-comp")).toBe(false);
        });

        it("warns when deleting component used by workflows", () => {
            store.createComponent({
                id: "workflow-used-comp",
                name: "Workflow Used Component",
                category: "dialog",
                description: "Used by workflow",
            });

            store.createWorkflow({
                id: "W37",
                name: "Component Workflow",
                category: "analysis",
                goal: "Uses component",
                suggested_components: ["workflow-used-comp"],
            });

            const result = store.deleteComponent("workflow-used-comp", { force: false });

            expect(result.success).toBe(false);
            expect(result.warnings).toBeDefined();
            expect(result.warnings).toContain("W37");
        });

        it("warns when deleting component that implements capabilities", () => {
            store.createCapability({
                id: "impl-test-cap",
                name: "Impl Test Cap",
                category: "data",
                description: "Implemented by component",
            });

            store.createComponent({
                id: "impl-comp",
                name: "Implementing Component",
                category: "dialog",
                description: "Implements capability",
                implements_capabilities: ["impl-test-cap"],
            });

            const result = store.deleteComponent("impl-comp", { force: false });

            expect(result.success).toBe(false);
            expect(result.warnings).toBeDefined();
            expect(result.warnings).toContain("impl-test-cap");
        });

        it("warns when deleting component with dependent components", () => {
            store.createComponent({
                id: "base-comp",
                name: "Base Component",
                category: "utility",
                description: "Base component",
            });

            store.createComponent({
                id: "dependent-comp",
                name: "Dependent Component",
                category: "dialog",
                description: "Depends on base",
                dependencies: ["base-comp"],
            });

            const result = store.deleteComponent("base-comp", { force: false });

            expect(result.success).toBe(false);
            expect(result.warnings).toBeDefined();
            expect(result.warnings).toContain("dependent-comp");
        });

        it("force deletes and cleans up all references", () => {
            store.createCapability({
                id: "force-impl-cap",
                name: "Force Impl Cap",
                category: "data",
                description: "Force test",
            });

            store.createComponent({
                id: "force-comp",
                name: "Force Delete Component",
                category: "dialog",
                description: "Force delete test",
                implements_capabilities: ["force-impl-cap"],
            });

            store.createWorkflow({
                id: "W38",
                name: "Force Comp Workflow",
                category: "analysis",
                goal: "Test force delete",
                suggested_components: ["force-comp"],
            });

            const result = store.deleteComponent("force-comp", { force: true });

            expect(result.success).toBe(true);
            expect(store.componentExists("force-comp")).toBe(false);

            store.refresh();
            const workflow = store.getWorkflow("W38");
            expect(workflow?.suggested_components).not.toContain("force-comp");
            const cap = store.getCapability("force-impl-cap");
            expect(cap?.implemented_by_components).not.toContain("force-comp");
        });

        it("returns error for non-existent component", () => {
            const result = store.deleteComponent("non-existent");

            expect(result.success).toBe(false);
            expect(result.error).toContain("Component 'non-existent' not found");
        });
    });

    describe("DeleteOptions defaults", () => {
        it("defaults to force: false", () => {
            store.createCapability({
                id: "default-force-cap",
                name: "Default Force Cap",
                category: "data",
                description: "Test default",
            });

            store.createWorkflow({
                id: "W39",
                name: "Default Force Workflow",
                category: "analysis",
                goal: "Test default force",
                requires_capabilities: ["default-force-cap"],
            });

            // Call without options - should default to force: false and warn
            const result = store.deleteCapability("default-force-cap");

            expect(result.success).toBe(false);
            expect(result.warnings).toBeDefined();
        });
    });
});
