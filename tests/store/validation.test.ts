import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { DesignDocsStore } from "../../src/store/yaml-store.js";
import * as fs from "node:fs";
import * as path from "node:path";
import { stringify as yamlStringify } from "yaml";

// Use a separate temp directory for validation tests
const TEMP_PATH = path.join(__dirname, "../temp-validation-tests");
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

/**
 * Write a YAML file directly (bypassing validation for testing broken references)
 */
function writeYamlFile(subdir: string, filename: string, content: unknown): void {
    const filePath = path.join(TEMP_PATH, subdir, `${filename}.yaml`);
    fs.writeFileSync(filePath, yamlStringify(content), "utf-8");
}

describe("Validation", () => {
    let store: DesignDocsStore;

    beforeEach(() => {
        setupTempDir();
        store = new DesignDocsStore(TEMP_PATH);
    });

    afterEach(() => {
        cleanupTempDir();
    });

    describe("validate", () => {
        it("passes validation for consistent data", () => {
            // Create a completely consistent set of entities
            store.createCapability({
                id: "test-cap",
                name: "Test Cap",
                category: "data",
                description: "A test capability",
                status: "implemented",
            });
            store.createPersona({
                id: "test-persona",
                name: "Test Persona",
                role: "Tester",
                characteristics: { expertise: "novice" },
                goals: ["Test things"],
            });
            store.createComponent({
                id: "test-component",
                name: "Test Component",
                category: "dialog",
                description: "A test component",
                implements_capabilities: ["test-cap"],
            });
            store.createWorkflow({
                id: "W50",
                name: "Test Workflow",
                category: "analysis",
                goal: "Test everything",
                requires_capabilities: ["test-cap"],
                personas: ["test-persona"],
                suggested_components: ["test-component"],
            });

            // Re-validate with our consistent entities (ignore fixture issues)
            store.refresh();
            const result = store.validate();

            // Should have no new errors for our consistent entities
            // Note: fixtures may have issues, but our newly created entities should be valid
            const ourErrors = result.errors.filter(e =>
                e.includes("W50") || e.includes("test-cap") ||
                e.includes("test-persona") || e.includes("test-component")
            );
            expect(ourErrors).toHaveLength(0);
        });

        it("detects broken capability references", () => {
            // Create workflow referencing non-existent capability
            writeYamlFile("workflows", "W99", {
                id: "W99",
                name: "Broken Reference Workflow",
                category: "analysis",
                validated: false,
                goal: "Test broken references",
                personas: [],
                requires_capabilities: ["does-not-exist"],
                suggested_components: [],
            });

            store.refresh();
            const result = store.validate();

            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.includes("W99") && e.includes("does-not-exist"))).toBe(true);
        });

        it("detects broken persona references", () => {
            writeYamlFile("workflows", "W98", {
                id: "W98",
                name: "Broken Persona Workflow",
                category: "analysis",
                validated: false,
                goal: "Test broken persona references",
                personas: ["non-existent-persona"],
                requires_capabilities: [],
                suggested_components: [],
            });

            store.refresh();
            const result = store.validate();

            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.includes("W98") && e.includes("non-existent-persona"))).toBe(true);
        });

        it("detects broken component references in workflows", () => {
            writeYamlFile("workflows", "W97", {
                id: "W97",
                name: "Broken Component Workflow",
                category: "analysis",
                validated: false,
                goal: "Test broken component references",
                personas: [],
                requires_capabilities: [],
                suggested_components: ["ghost-component"],
            });

            store.refresh();
            const result = store.validate();

            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.includes("W97") && e.includes("ghost-component"))).toBe(true);
        });

        it("detects broken capability references in components", () => {
            writeYamlFile("components", "broken-component", {
                id: "broken-component",
                name: "Broken Component",
                category: "dialog",
                description: "Component with broken capability reference",
                status: "planned",
                implements_capabilities: ["missing-capability"],
                used_in_workflows: [],
                dependencies: [],
            });

            store.refresh();
            const result = store.validate();

            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.includes("broken-component") && e.includes("missing-capability"))).toBe(true);
        });

        it("detects broken component dependency references", () => {
            writeYamlFile("components", "orphan-dep", {
                id: "orphan-dep",
                name: "Orphan Dependency Component",
                category: "dialog",
                description: "Component with broken dependency",
                status: "planned",
                implements_capabilities: [],
                used_in_workflows: [],
                dependencies: ["phantom-component"],
            });

            store.refresh();
            const result = store.validate();

            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.includes("orphan-dep") && e.includes("phantom-component"))).toBe(true);
        });

        it("warns about orphaned capabilities", () => {
            // Create a capability that is not used by any workflow
            store.createCapability({
                id: "orphan-cap",
                name: "Orphan Capability",
                category: "data",
                description: "Not used by any workflow",
                status: "planned",
            });

            store.refresh();
            const result = store.validate();

            expect(result.warnings.some(w => w.includes("orphan-cap") && w.includes("not used by any workflow"))).toBe(true);
        });

        it("warns about orphaned components", () => {
            store.createComponent({
                id: "lonely-component",
                name: "Lonely Component",
                category: "dialog",
                description: "Not used by any workflow",
                status: "planned",
            });

            store.refresh();
            const result = store.validate();

            expect(result.warnings.some(w => w.includes("lonely-component"))).toBe(true);
        });

        it("warns about orphaned personas", () => {
            store.createPersona({
                id: "lonely-persona",
                name: "Lonely Persona",
                role: "Nobody",
                characteristics: { expertise: "novice" },
                goals: ["Find a purpose"],
            });

            store.refresh();
            const result = store.validate();

            expect(result.warnings.some(w => w.includes("lonely-persona"))).toBe(true);
        });

        it("detects bidirectional relationship inconsistencies", () => {
            // Create a capability that claims to be used by a workflow, but the workflow doesn't reference it
            writeYamlFile("capabilities", "phantom-ref", {
                id: "phantom-ref",
                name: "Phantom Reference Capability",
                category: "data",
                description: "Claims to be used by W01 but W01 does not reference it",
                status: "planned",
                algorithms: [],
                used_by_workflows: ["W01"],
                implemented_by_components: [],
                requirements: [],
            });

            store.refresh();
            const result = store.validate();

            // Should warn about the inconsistency
            expect(result.warnings.some(w => w.includes("phantom-ref") || w.includes("W01"))).toBe(true);
        });
    });
});
