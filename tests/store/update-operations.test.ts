import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { DesignDocsStore } from "../../src/store/yaml-store.js";
import * as fs from "node:fs";
import * as path from "node:path";

// Use a separate temp directory for update tests
const TEMP_PATH = path.join(__dirname, "../temp-update-tests");
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

describe("Update Operations", () => {
    let store: DesignDocsStore;

    beforeEach(() => {
        setupTempDir();
        store = new DesignDocsStore(TEMP_PATH);
    });

    afterEach(() => {
        cleanupTempDir();
    });

    describe("updateWorkflow", () => {
        it("updates workflow fields", () => {
            store.createWorkflow({
                id: "W20",
                name: "Original Workflow",
                category: "analysis",
                goal: "Original goal",
            });

            const result = store.updateWorkflow("W20", { name: "Updated Workflow" });

            expect(result.success).toBe(true);
            expect(store.getWorkflow("W20")?.name).toBe("Updated Workflow");
        });

        it("updates workflow goal", () => {
            store.createWorkflow({
                id: "W21",
                name: "Goal Test",
                category: "analysis",
                goal: "Original goal",
            });

            const result = store.updateWorkflow("W21", { goal: "Updated goal" });

            expect(result.success).toBe(true);
            expect(store.getWorkflow("W21")?.goal).toBe("Updated goal");
        });

        it("validates references on update", () => {
            store.createWorkflow({
                id: "W22",
                name: "Ref Validation Test",
                category: "analysis",
                goal: "Test references",
                requires_capabilities: [],
            });

            const result = store.updateWorkflow("W22", {
                requires_capabilities: ["non-existent"],
            });

            expect(result.success).toBe(false);
            expect(result.error).toContain("Capability 'non-existent' does not exist");
        });

        it("validates persona references on update", () => {
            store.createWorkflow({
                id: "W23",
                name: "Persona Ref Test",
                category: "analysis",
                goal: "Test persona references",
                personas: [],
            });

            const result = store.updateWorkflow("W23", {
                personas: ["non-existent-persona"],
            });

            expect(result.success).toBe(false);
            expect(result.error).toContain("Persona 'non-existent-persona' does not exist");
        });

        it("validates component references on update", () => {
            store.createWorkflow({
                id: "W24",
                name: "Component Ref Test",
                category: "analysis",
                goal: "Test component references",
                suggested_components: [],
            });

            const result = store.updateWorkflow("W24", {
                suggested_components: ["non-existent-component"],
            });

            expect(result.success).toBe(false);
            expect(result.error).toContain("Component 'non-existent-component' does not exist");
        });

        it("returns error for non-existent workflow", () => {
            const result = store.updateWorkflow("W999", { name: "Should Fail" });

            expect(result.success).toBe(false);
            expect(result.error).toContain("Workflow 'W999' not found");
        });

        it("persists update to YAML file", () => {
            store.createWorkflow({
                id: "W25",
                name: "Persist Test",
                category: "analysis",
                goal: "Test persistence",
            });

            store.updateWorkflow("W25", { name: "Persisted Name" });

            // Refresh store to reload from files
            store.refresh();
            expect(store.getWorkflow("W25")?.name).toBe("Persisted Name");
        });

        it("updates reverse relationships when adding capabilities", () => {
            store.createCapability({
                id: "new-cap-for-update",
                name: "New Cap For Update",
                category: "data",
                description: "For update test",
            });

            store.createWorkflow({
                id: "W26",
                name: "Update Rel Test",
                category: "analysis",
                goal: "Test relationship update",
                requires_capabilities: [],
            });

            store.updateWorkflow("W26", {
                requires_capabilities: ["new-cap-for-update"],
            });

            store.refresh();
            const cap = store.getCapability("new-cap-for-update");
            expect(cap?.used_by_workflows).toContain("W26");
        });
    });

    describe("updateCapability", () => {
        it("updates capability fields", () => {
            store.createCapability({
                id: "update-test-cap",
                name: "Original Name",
                category: "data",
                description: "Original description",
            });

            const result = store.updateCapability("update-test-cap", {
                name: "Updated Name",
                description: "Updated description",
            });

            expect(result.success).toBe(true);
            const cap = store.getCapability("update-test-cap");
            expect(cap?.name).toBe("Updated Name");
            expect(cap?.description).toBe("Updated description");
        });

        it("updates capability status", () => {
            store.createCapability({
                id: "status-test-cap",
                name: "Status Test",
                category: "data",
                description: "Test status update",
                status: "planned",
            });

            const result = store.updateCapability("status-test-cap", {
                status: "implemented",
            });

            expect(result.success).toBe(true);
            expect(store.getCapability("status-test-cap")?.status).toBe("implemented");
        });

        it("returns error for non-existent capability", () => {
            const result = store.updateCapability("non-existent", { name: "Should Fail" });

            expect(result.success).toBe(false);
            expect(result.error).toContain("Capability 'non-existent' not found");
        });
    });

    describe("updatePersona", () => {
        it("updates persona fields", () => {
            store.createPersona({
                id: "update-test-persona",
                name: "Original Name",
                role: "Original Role",
                characteristics: { expertise: "novice" },
                goals: ["Original goal"],
            });

            const result = store.updatePersona("update-test-persona", {
                name: "Updated Name",
                role: "Updated Role",
            });

            expect(result.success).toBe(true);
            const persona = store.getPersona("update-test-persona");
            expect(persona?.name).toBe("Updated Name");
            expect(persona?.role).toBe("Updated Role");
        });

        it("updates persona characteristics", () => {
            store.createPersona({
                id: "char-test-persona",
                name: "Char Test",
                role: "Tester",
                characteristics: { expertise: "novice" },
                goals: ["Test"],
            });

            const result = store.updatePersona("char-test-persona", {
                characteristics: { expertise: "expert", time_pressure: "high" },
            });

            expect(result.success).toBe(true);
            const persona = store.getPersona("char-test-persona");
            expect(persona?.characteristics.expertise).toBe("expert");
            expect(persona?.characteristics.time_pressure).toBe("high");
        });

        it("returns error for non-existent persona", () => {
            const result = store.updatePersona("non-existent", { name: "Should Fail" });

            expect(result.success).toBe(false);
            expect(result.error).toContain("Persona 'non-existent' not found");
        });
    });

    describe("updateComponent", () => {
        it("updates component fields", () => {
            store.createComponent({
                id: "update-test-comp",
                name: "Original Name",
                category: "dialog",
                description: "Original description",
            });

            const result = store.updateComponent("update-test-comp", {
                name: "Updated Name",
                description: "Updated description",
            });

            expect(result.success).toBe(true);
            const comp = store.getComponent("update-test-comp");
            expect(comp?.name).toBe("Updated Name");
            expect(comp?.description).toBe("Updated description");
        });

        it("validates capability references on update", () => {
            store.createComponent({
                id: "cap-ref-test-comp",
                name: "Cap Ref Test",
                category: "dialog",
                description: "Test cap refs",
            });

            const result = store.updateComponent("cap-ref-test-comp", {
                implements_capabilities: ["non-existent-cap"],
            });

            expect(result.success).toBe(false);
            expect(result.error).toContain("Capability 'non-existent-cap' does not exist");
        });

        it("validates component dependency references on update", () => {
            store.createComponent({
                id: "dep-ref-test-comp",
                name: "Dep Ref Test",
                category: "dialog",
                description: "Test dep refs",
            });

            const result = store.updateComponent("dep-ref-test-comp", {
                dependencies: ["non-existent-dep"],
            });

            expect(result.success).toBe(false);
            expect(result.error).toContain("Component 'non-existent-dep' does not exist");
        });

        it("returns error for non-existent component", () => {
            const result = store.updateComponent("non-existent", { name: "Should Fail" });

            expect(result.success).toBe(false);
            expect(result.error).toContain("Component 'non-existent' not found");
        });
    });
});
