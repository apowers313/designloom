import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { DesignDocsStore } from "../../src/store/yaml-store.js";
import * as fs from "node:fs";
import * as path from "node:path";

// Use a separate temp directory for create tests to avoid polluting fixtures
const TEMP_PATH = path.join(__dirname, "../temp-create-tests");
const FIXTURES_PATH = path.join(__dirname, "../fixtures/design");

/**
 * Copy fixtures to temp directory for isolated testing
 */
function setupTempDir(): void {
    // Clean up any existing temp directory
    if (fs.existsSync(TEMP_PATH)) {
        fs.rmSync(TEMP_PATH, { recursive: true });
    }

    // Create fresh temp directory structure
    fs.mkdirSync(path.join(TEMP_PATH, "workflows"), { recursive: true });
    fs.mkdirSync(path.join(TEMP_PATH, "capabilities"), { recursive: true });
    fs.mkdirSync(path.join(TEMP_PATH, "personas"), { recursive: true });
    fs.mkdirSync(path.join(TEMP_PATH, "components"), { recursive: true });

    // Copy fixture files
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

describe("Create Operations", () => {
    let store: DesignDocsStore;

    beforeEach(() => {
        setupTempDir();
        store = new DesignDocsStore(TEMP_PATH);
    });

    afterEach(() => {
        cleanupTempDir();
    });

    describe("createCapability", () => {
        it("creates capability with valid data", () => {
            const result = store.createCapability({
                id: "new-capability",
                name: "New Capability",
                category: "data",
                description: "A brand new capability",
                status: "planned",
            });

            expect(result.success).toBe(true);
            expect(store.capabilityExists("new-capability")).toBe(true);
        });

        it("creates capability and writes YAML file", () => {
            store.createCapability({
                id: "file-test-cap",
                name: "File Test Capability",
                category: "visualization",
                description: "Testing file creation",
            });

            const filePath = path.join(TEMP_PATH, "capabilities", "file-test-cap.yaml");
            expect(fs.existsSync(filePath)).toBe(true);

            // Verify the store can read it back
            store.refresh();
            expect(store.capabilityExists("file-test-cap")).toBe(true);
        });

        it("rejects capability with invalid ID format", () => {
            const result = store.createCapability({
                id: "InvalidCapability", // Should be kebab-case
                name: "Invalid Capability",
                category: "data",
                description: "Has invalid ID",
            });

            expect(result.success).toBe(false);
            expect(result.error).toContain("ID must match pattern kebab-case");
        });

        it("rejects duplicate capability ID", () => {
            store.createCapability({
                id: "duplicate-cap",
                name: "First Capability",
                category: "data",
                description: "First one",
            });

            const result = store.createCapability({
                id: "duplicate-cap",
                name: "Second Capability",
                category: "data",
                description: "Duplicate ID",
            });

            expect(result.success).toBe(false);
            expect(result.error).toContain("already exists");
        });

        it("rejects capability with missing required fields", () => {
            const result = store.createCapability({
                id: "missing-fields",
                name: "Missing Fields Cap",
                // Missing category and description
            } as Parameters<typeof store.createCapability>[0]);

            expect(result.success).toBe(false);
        });
    });

    describe("createPersona", () => {
        it("creates persona with valid data", () => {
            const result = store.createPersona({
                id: "developer-dave",
                name: "Developer Dave",
                role: "Software Developer",
                characteristics: {
                    expertise: "expert",
                    time_pressure: "medium",
                    graph_literacy: "high",
                    domain_knowledge: "expert",
                },
                goals: ["Build efficient code", "Understand complex systems"],
            });

            expect(result.success).toBe(true);
            expect(store.personaExists("developer-dave")).toBe(true);
        });

        it("creates persona with workflows reference", () => {
            const result = store.createPersona({
                id: "workflow-persona",
                name: "Workflow Persona",
                role: "Tester",
                characteristics: {
                    expertise: "intermediate",
                },
                goals: ["Test workflows"],
                workflows: ["W01"], // Reference existing workflow
            });

            expect(result.success).toBe(true);
            const persona = store.getPersona("workflow-persona");
            expect(persona?.workflows).toContain("W01");
        });

        it("rejects persona with invalid ID format", () => {
            const result = store.createPersona({
                id: "Invalid Persona", // Should be kebab-case
                name: "Invalid Persona",
                role: "Test",
                characteristics: { expertise: "novice" },
                goals: ["Test"],
            });

            expect(result.success).toBe(false);
            expect(result.error).toContain("ID must match pattern kebab-case");
        });

        it("rejects duplicate persona ID", () => {
            store.createPersona({
                id: "duplicate-persona",
                name: "First Persona",
                role: "Test",
                characteristics: { expertise: "novice" },
                goals: ["Test"],
            });

            const result = store.createPersona({
                id: "duplicate-persona",
                name: "Second Persona",
                role: "Test",
                characteristics: { expertise: "novice" },
                goals: ["Test"],
            });

            expect(result.success).toBe(false);
            expect(result.error).toContain("already exists");
        });

        it("rejects persona with missing required fields", () => {
            const result = store.createPersona({
                id: "missing-fields",
                name: "Missing",
                // Missing role, characteristics, goals
            } as Parameters<typeof store.createPersona>[0]);

            expect(result.success).toBe(false);
        });

        it("rejects persona with invalid expertise level", () => {
            const result = store.createPersona({
                id: "bad-expertise",
                name: "Bad Expertise",
                role: "Test",
                characteristics: {
                    expertise: "super-expert" as "expert", // Invalid expertise
                },
                goals: ["Test"],
            });

            expect(result.success).toBe(false);
        });
    });

    describe("createComponent", () => {
        it("creates component with valid data", () => {
            const result = store.createComponent({
                id: "new-component",
                name: "New Component",
                category: "dialog",
                description: "A brand new component",
                status: "planned",
            });

            expect(result.success).toBe(true);
            expect(store.componentExists("new-component")).toBe(true);
        });

        it("creates component with capability reference", () => {
            const result = store.createComponent({
                id: "cap-linked-component",
                name: "Capability Linked Component",
                category: "control",
                description: "Links to a capability",
                implements_capabilities: ["data-import"], // Existing capability
            });

            expect(result.success).toBe(true);
            const component = store.getComponent("cap-linked-component");
            expect(component?.implements_capabilities).toContain("data-import");
        });

        it("rejects component with non-existent capability reference", () => {
            const result = store.createComponent({
                id: "bad-ref-component",
                name: "Bad Reference Component",
                category: "control",
                description: "References non-existent capability",
                implements_capabilities: ["non-existent-capability"],
            });

            expect(result.success).toBe(false);
            expect(result.error).toContain("Capability 'non-existent-capability' does not exist");
        });

        it("rejects component with non-existent workflow reference", () => {
            const result = store.createComponent({
                id: "bad-workflow-ref",
                name: "Bad Workflow Ref Component",
                category: "display",
                description: "References non-existent workflow",
                used_in_workflows: ["W999"],
            });

            expect(result.success).toBe(false);
            expect(result.error).toContain("Workflow 'W999' does not exist");
        });

        it("rejects component with non-existent component dependency", () => {
            const result = store.createComponent({
                id: "bad-dep-component",
                name: "Bad Dependency Component",
                category: "layout",
                description: "Depends on non-existent component",
                dependencies: ["non-existent-component"],
            });

            expect(result.success).toBe(false);
            expect(result.error).toContain("Component 'non-existent-component' does not exist");
        });

        it("rejects duplicate component ID", () => {
            store.createComponent({
                id: "duplicate-comp",
                name: "First Component",
                category: "dialog",
                description: "First one",
            });

            const result = store.createComponent({
                id: "duplicate-comp",
                name: "Second Component",
                category: "dialog",
                description: "Duplicate",
            });

            expect(result.success).toBe(false);
            expect(result.error).toContain("already exists");
        });
    });

    describe("createWorkflow", () => {
        it("creates workflow with valid references", () => {
            // First create dependencies
            store.createCapability({
                id: "test-cap-1",
                name: "Test Cap 1",
                category: "data",
                description: "Test capability",
            });
            store.createPersona({
                id: "test-persona-1",
                name: "Test Persona",
                role: "Tester",
                characteristics: { expertise: "novice" },
                goals: ["Test things"],
            });

            const result = store.createWorkflow({
                id: "W10",
                name: "Test Workflow",
                category: "analysis",
                goal: "Test the creation flow",
                requires_capabilities: ["test-cap-1"],
                personas: ["test-persona-1"],
            });

            expect(result.success).toBe(true);
            expect(store.workflowExists("W10")).toBe(true);
        });

        it("rejects workflow with non-existent capability reference", () => {
            const result = store.createWorkflow({
                id: "W11",
                name: "Bad Cap Ref Workflow",
                category: "analysis",
                goal: "Test validation",
                requires_capabilities: ["non-existent-cap"],
            });

            expect(result.success).toBe(false);
            expect(result.error).toContain("Capability 'non-existent-cap' does not exist");
        });

        it("rejects workflow with non-existent persona reference", () => {
            const result = store.createWorkflow({
                id: "W12",
                name: "Bad Persona Ref Workflow",
                category: "analysis",
                goal: "Test validation",
                personas: ["non-existent-persona"],
            });

            expect(result.success).toBe(false);
            expect(result.error).toContain("Persona 'non-existent-persona' does not exist");
        });

        it("rejects workflow with non-existent component reference", () => {
            const result = store.createWorkflow({
                id: "W13",
                name: "Bad Component Ref Workflow",
                category: "analysis",
                goal: "Test validation",
                suggested_components: ["non-existent-component"],
            });

            expect(result.success).toBe(false);
            expect(result.error).toContain("Component 'non-existent-component' does not exist");
        });

        it("rejects duplicate workflow ID", () => {
            store.createWorkflow({
                id: "W14",
                name: "First Workflow",
                category: "onboarding",
                goal: "First workflow",
            });

            const result = store.createWorkflow({
                id: "W14",
                name: "Second Workflow",
                category: "onboarding",
                goal: "Duplicate",
            });

            expect(result.success).toBe(false);
            expect(result.error).toContain("already exists");
        });

        it("rejects workflow with invalid ID format", () => {
            const result = store.createWorkflow({
                id: "workflow-1", // Should be W01 format
                name: "Invalid ID Workflow",
                category: "analysis",
                goal: "Test validation",
            });

            expect(result.success).toBe(false);
            expect(result.error).toContain("ID must match pattern W01");
        });

        it("updates reverse relationships on create", () => {
            // Create a capability with empty used_by_workflows
            store.createCapability({
                id: "reverse-rel-cap",
                name: "Reverse Rel Cap",
                category: "data",
                description: "Test reverse relationship",
                used_by_workflows: [],
            });

            // Create a workflow that requires this capability
            store.createWorkflow({
                id: "W15",
                name: "Reverse Rel Workflow",
                category: "analysis",
                goal: "Test reverse relationship",
                requires_capabilities: ["reverse-rel-cap"],
            });

            // Refresh and check that the capability's used_by_workflows was updated
            store.refresh();
            const cap = store.getCapability("reverse-rel-cap");
            expect(cap?.used_by_workflows).toContain("W15");
        });

        it("updates persona workflows on create", () => {
            // Create a persona
            store.createPersona({
                id: "persona-for-rel",
                name: "Persona For Rel",
                role: "Tester",
                characteristics: { expertise: "novice" },
                goals: ["Test"],
                workflows: [],
            });

            // Create a workflow with this persona
            store.createWorkflow({
                id: "W16",
                name: "Persona Workflow",
                category: "analysis",
                goal: "Test persona relationship",
                personas: ["persona-for-rel"],
            });

            // Refresh and check
            store.refresh();
            const persona = store.getPersona("persona-for-rel");
            expect(persona?.workflows).toContain("W16");
        });

        it("updates component used_in_workflows on create", () => {
            // Create a component
            store.createComponent({
                id: "component-for-rel",
                name: "Component For Rel",
                category: "dialog",
                description: "Test relationship",
                used_in_workflows: [],
            });

            // Create a workflow with this component
            store.createWorkflow({
                id: "W17",
                name: "Component Workflow",
                category: "analysis",
                goal: "Test component relationship",
                suggested_components: ["component-for-rel"],
            });

            // Refresh and check
            store.refresh();
            const component = store.getComponent("component-for-rel");
            expect(component?.used_in_workflows).toContain("W17");
        });
    });

    describe("CreateResult type", () => {
        it("returns success with created entity", () => {
            const result = store.createCapability({
                id: "result-test-cap",
                name: "Result Test Cap",
                category: "data",
                description: "Testing result type",
            });

            expect(result.success).toBe(true);
            expect(result.error).toBeUndefined();
        });

        it("returns error message on failure", () => {
            const result = store.createCapability({
                id: "data-import", // Already exists in fixtures
                name: "Duplicate Cap",
                category: "data",
                description: "Should fail",
            });

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
            expect(typeof result.error).toBe("string");
        });
    });
});
