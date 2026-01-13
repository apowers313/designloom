import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { DesignDocsStore } from "../../src/store/yaml-store.js";
import * as fs from "node:fs";
import * as path from "node:path";

// Use a separate temp directory for link tests
const TEMP_PATH = path.join(__dirname, "../temp-link-tests");
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

describe("Link Operations", () => {
    let store: DesignDocsStore;

    beforeEach(() => {
        setupTempDir();
        store = new DesignDocsStore(TEMP_PATH);
    });

    afterEach(() => {
        cleanupTempDir();
    });

    describe("link workflow to capability", () => {
        it("links workflow to capability with bidirectional update", () => {
            store.createCapability({
                id: "link-test-cap",
                name: "Link Test Cap",
                category: "data",
                description: "For link testing",
            });

            store.createWorkflow({
                id: "W40",
                name: "Link Test Workflow",
                category: "analysis",
                goal: "Test linking",
                requires_capabilities: [],
            });

            const result = store.link("workflow", "W40", "capability", "link-test-cap", "requires");

            expect(result.success).toBe(true);

            const workflow = store.getWorkflow("W40");
            expect(workflow?.requires_capabilities).toContain("link-test-cap");

            const capability = store.getCapability("link-test-cap");
            expect(capability?.used_by_workflows).toContain("W40");
        });

        it("persists link to YAML files", () => {
            store.createCapability({
                id: "persist-link-cap",
                name: "Persist Link Cap",
                category: "data",
                description: "For persistence testing",
            });

            store.createWorkflow({
                id: "W41",
                name: "Persist Link Workflow",
                category: "analysis",
                goal: "Test persistence",
                requires_capabilities: [],
            });

            store.link("workflow", "W41", "capability", "persist-link-cap", "requires");

            // Refresh store to reload from files
            store.refresh();

            const workflow = store.getWorkflow("W41");
            expect(workflow?.requires_capabilities).toContain("persist-link-cap");

            const capability = store.getCapability("persist-link-cap");
            expect(capability?.used_by_workflows).toContain("W41");
        });

        it("does not duplicate existing link", () => {
            store.createCapability({
                id: "no-dup-cap",
                name: "No Dup Cap",
                category: "data",
                description: "For no-dup testing",
            });

            store.createWorkflow({
                id: "W42",
                name: "No Dup Workflow",
                category: "analysis",
                goal: "Test no duplicate",
                requires_capabilities: ["no-dup-cap"],
            });

            // Link again - should not duplicate
            const result = store.link("workflow", "W42", "capability", "no-dup-cap", "requires");

            expect(result.success).toBe(true);
            const workflow = store.getWorkflow("W42");
            const capCount = workflow?.requires_capabilities.filter(c => c === "no-dup-cap").length;
            expect(capCount).toBe(1);
        });
    });

    describe("link workflow to persona", () => {
        it("links workflow to persona with bidirectional update", () => {
            store.createPersona({
                id: "link-test-persona",
                name: "Link Test Persona",
                role: "Tester",
                characteristics: { expertise: "novice" },
                goals: ["Test"],
            });

            store.createWorkflow({
                id: "W43",
                name: "Persona Link Workflow",
                category: "analysis",
                goal: "Test persona linking",
                personas: [],
            });

            const result = store.link("workflow", "W43", "persona", "link-test-persona", "uses");

            expect(result.success).toBe(true);

            const workflow = store.getWorkflow("W43");
            expect(workflow?.personas).toContain("link-test-persona");

            const persona = store.getPersona("link-test-persona");
            expect(persona?.workflows).toContain("W43");
        });
    });

    describe("link workflow to component", () => {
        it("links workflow to component with bidirectional update", () => {
            store.createComponent({
                id: "link-test-comp",
                name: "Link Test Component",
                category: "dialog",
                description: "For link testing",
            });

            store.createWorkflow({
                id: "W44",
                name: "Component Link Workflow",
                category: "analysis",
                goal: "Test component linking",
                suggested_components: [],
            });

            const result = store.link("workflow", "W44", "component", "link-test-comp", "suggests");

            expect(result.success).toBe(true);

            const workflow = store.getWorkflow("W44");
            expect(workflow?.suggested_components).toContain("link-test-comp");

            const component = store.getComponent("link-test-comp");
            expect(component?.used_in_workflows).toContain("W44");
        });
    });

    describe("link component to capability", () => {
        it("links component to capability with bidirectional update", () => {
            store.createCapability({
                id: "comp-link-cap",
                name: "Comp Link Cap",
                category: "data",
                description: "For component linking",
            });

            store.createComponent({
                id: "cap-link-comp",
                name: "Cap Link Component",
                category: "dialog",
                description: "For capability linking",
            });

            const result = store.link("component", "cap-link-comp", "capability", "comp-link-cap", "implements");

            expect(result.success).toBe(true);

            const component = store.getComponent("cap-link-comp");
            expect(component?.implements_capabilities).toContain("comp-link-cap");

            const capability = store.getCapability("comp-link-cap");
            expect(capability?.implemented_by_components).toContain("cap-link-comp");
        });
    });

    describe("link component to component (dependency)", () => {
        it("links component to component dependency", () => {
            store.createComponent({
                id: "base-link-comp",
                name: "Base Link Component",
                category: "utility",
                description: "Base component",
            });

            store.createComponent({
                id: "derived-comp",
                name: "Derived Component",
                category: "dialog",
                description: "Depends on base",
            });

            const result = store.link("component", "derived-comp", "component", "base-link-comp", "depends");

            expect(result.success).toBe(true);

            const derived = store.getComponent("derived-comp");
            expect(derived?.dependencies).toContain("base-link-comp");
        });
    });

    describe("unlink workflow from capability", () => {
        it("unlinks workflow from capability with bidirectional update", () => {
            store.createCapability({
                id: "unlink-test-cap",
                name: "Unlink Test Cap",
                category: "data",
                description: "For unlink testing",
            });

            store.createWorkflow({
                id: "W45",
                name: "Unlink Test Workflow",
                category: "analysis",
                goal: "Test unlinking",
                requires_capabilities: ["unlink-test-cap"],
            });

            // Verify initial state
            expect(store.getWorkflow("W45")?.requires_capabilities).toContain("unlink-test-cap");

            const result = store.unlink("workflow", "W45", "capability", "unlink-test-cap", "requires");

            expect(result.success).toBe(true);

            const workflow = store.getWorkflow("W45");
            expect(workflow?.requires_capabilities).not.toContain("unlink-test-cap");

            store.refresh();
            const capability = store.getCapability("unlink-test-cap");
            expect(capability?.used_by_workflows).not.toContain("W45");
        });
    });

    describe("unlink workflow from persona", () => {
        it("unlinks workflow from persona with bidirectional update", () => {
            store.createPersona({
                id: "unlink-test-persona",
                name: "Unlink Test Persona",
                role: "Tester",
                characteristics: { expertise: "novice" },
                goals: ["Test"],
            });

            store.createWorkflow({
                id: "W46",
                name: "Unlink Persona Workflow",
                category: "analysis",
                goal: "Test persona unlinking",
                personas: ["unlink-test-persona"],
            });

            const result = store.unlink("workflow", "W46", "persona", "unlink-test-persona", "uses");

            expect(result.success).toBe(true);

            const workflow = store.getWorkflow("W46");
            expect(workflow?.personas).not.toContain("unlink-test-persona");

            store.refresh();
            const persona = store.getPersona("unlink-test-persona");
            expect(persona?.workflows).not.toContain("W46");
        });
    });

    describe("unlink component from capability", () => {
        it("unlinks component from capability with bidirectional update", () => {
            store.createCapability({
                id: "comp-unlink-cap",
                name: "Comp Unlink Cap",
                category: "data",
                description: "For component unlinking",
            });

            store.createComponent({
                id: "cap-unlink-comp",
                name: "Cap Unlink Component",
                category: "dialog",
                description: "For capability unlinking",
                implements_capabilities: ["comp-unlink-cap"],
            });

            const result = store.unlink("component", "cap-unlink-comp", "capability", "comp-unlink-cap", "implements");

            expect(result.success).toBe(true);

            const component = store.getComponent("cap-unlink-comp");
            expect(component?.implements_capabilities).not.toContain("comp-unlink-cap");

            store.refresh();
            const capability = store.getCapability("comp-unlink-cap");
            expect(capability?.implemented_by_components).not.toContain("cap-unlink-comp");
        });
    });

    describe("error handling", () => {
        it("returns error for non-existent source entity", () => {
            store.createCapability({
                id: "error-test-cap",
                name: "Error Test Cap",
                category: "data",
                description: "For error testing",
            });

            const result = store.link("workflow", "W999", "capability", "error-test-cap", "requires");

            expect(result.success).toBe(false);
            expect(result.error).toContain("Workflow 'W999' not found");
        });

        it("returns error for non-existent target entity", () => {
            store.createWorkflow({
                id: "W47",
                name: "Error Target Workflow",
                category: "analysis",
                goal: "Test error target",
            });

            const result = store.link("workflow", "W47", "capability", "non-existent", "requires");

            expect(result.success).toBe(false);
            expect(result.error).toContain("Capability 'non-existent' not found");
        });

        it("returns error for invalid relationship type", () => {
            store.createCapability({
                id: "invalid-rel-cap",
                name: "Invalid Rel Cap",
                category: "data",
                description: "For invalid rel testing",
            });

            store.createWorkflow({
                id: "W48",
                name: "Invalid Rel Workflow",
                category: "analysis",
                goal: "Test invalid rel",
            });

            const result = store.link(
                "workflow",
                "W48",
                "capability",
                "invalid-rel-cap",
                "invalid-relationship" as "requires"
            );

            expect(result.success).toBe(false);
            expect(result.error).toContain("Invalid relationship");
        });
    });
});
