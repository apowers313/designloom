/**
 * Regression tests for legacy file handling.
 *
 * These tests verify the fix for a bug where the store silently skipped
 * YAML files that were missing the required version metadata fields
 * (version, created_at, updated_at). Files created before the version
 * metadata feature was added would fail schema validation and be silently
 * ignored, causing the store to return empty arrays.
 *
 * The fix makes version metadata fields optional for backward compatibility,
 * and auto-populates them when entities are updated.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

import { DesignDocsStore } from "../../src/store/yaml-store.js";

describe("Legacy file handling (regression test for silent schema validation failures)", () => {
    const testDir = path.join(process.cwd(), "tests", "fixtures", "temp-legacy-test");

    beforeEach(() => {
        // Create test directories
        fs.mkdirSync(path.join(testDir, "capabilities"), { recursive: true });
        fs.mkdirSync(path.join(testDir, "workflows"), { recursive: true });
        fs.mkdirSync(path.join(testDir, "personas"), { recursive: true });
        fs.mkdirSync(path.join(testDir, "components"), { recursive: true });
    });

    afterEach(() => {
        fs.rmSync(testDir, { recursive: true, force: true });
    });

    describe("reading legacy files without version metadata", () => {
        it("reads capability files without version, created_at, updated_at fields", () => {
            // Create a legacy capability file (no version metadata)
            const legacyCapability = `
id: legacy-capability
name: Legacy Capability
category: data
description: A capability without version metadata
status: implemented
`;
            fs.writeFileSync(
                path.join(testDir, "capabilities", "legacy-capability.yaml"),
                legacyCapability
            );

            const store = new DesignDocsStore(testDir);
            const capabilities = store.listCapabilities();

            // Should NOT silently skip the file
            expect(capabilities).toHaveLength(1);
            expect(capabilities[0].id).toBe("legacy-capability");
            expect(capabilities[0].name).toBe("Legacy Capability");
        });

        it("reads workflow files without version metadata", () => {
            // Create a legacy workflow file (no version metadata)
            const legacyWorkflow = `
id: W99
name: Legacy Workflow
category: exploration
description: A workflow without version metadata
goal: Test legacy file reading
`;
            fs.writeFileSync(
                path.join(testDir, "workflows", "W99.yaml"),
                legacyWorkflow
            );

            const store = new DesignDocsStore(testDir);
            const workflows = store.listWorkflows();

            expect(workflows).toHaveLength(1);
            expect(workflows[0].id).toBe("W99");
            expect(workflows[0].name).toBe("Legacy Workflow");
        });

        it("reads persona files without version metadata", () => {
            // Create a legacy persona file (no version metadata)
            const legacyPersona = `
id: legacy-persona
name: Legacy Persona
role: Test User
characteristics:
  expertise: intermediate
goals:
  - Test legacy file reading
frustrations:
  - None
`;
            fs.writeFileSync(
                path.join(testDir, "personas", "legacy-persona.yaml"),
                legacyPersona
            );

            const store = new DesignDocsStore(testDir);
            const personas = store.listPersonas();

            expect(personas).toHaveLength(1);
            expect(personas[0].id).toBe("legacy-persona");
            expect(personas[0].name).toBe("Legacy Persona");
        });

        it("reads component files without version metadata", () => {
            // Create a legacy component file (no version metadata)
            const legacyComponent = `
id: legacy-component
name: Legacy Component
category: atom
description: A component without version metadata
status: implemented
`;
            fs.writeFileSync(
                path.join(testDir, "components", "legacy-component.yaml"),
                legacyComponent
            );

            const store = new DesignDocsStore(testDir);
            const components = store.listComponents();

            expect(components).toHaveLength(1);
            expect(components[0].id).toBe("legacy-component");
            expect(components[0].name).toBe("Legacy Component");
        });
    });

    describe("updating legacy files adds version metadata", () => {
        it("auto-populates version metadata when updating a legacy capability", () => {
            // Create a legacy capability file (no version metadata)
            const legacyCapability = `
id: legacy-update-test
name: Legacy Capability
category: data
description: A capability without version metadata
status: planned
`;
            fs.writeFileSync(
                path.join(testDir, "capabilities", "legacy-update-test.yaml"),
                legacyCapability
            );

            const store = new DesignDocsStore(testDir);

            // Update the capability
            const result = store.updateCapability("legacy-update-test", {
                status: "implemented",
            });

            expect(result.success).toBe(true);

            // Read the updated file and verify version metadata was added
            const updatedContent = fs.readFileSync(
                path.join(testDir, "capabilities", "legacy-update-test.yaml"),
                "utf-8"
            );

            expect(updatedContent).toContain("version:");
            expect(updatedContent).toContain("created_at:");
            expect(updatedContent).toContain("updated_at:");
            expect(updatedContent).toContain("status: implemented");
        });

        it("auto-populates version metadata when updating a legacy workflow", () => {
            // Create a legacy workflow file (no version metadata)
            const legacyWorkflow = `
id: W98
name: Legacy Workflow
category: exploration
description: A workflow without version metadata
goal: Test legacy file updating
`;
            fs.writeFileSync(
                path.join(testDir, "workflows", "W98.yaml"),
                legacyWorkflow
            );

            const store = new DesignDocsStore(testDir);

            // Update the workflow
            const result = store.updateWorkflow("W98", {
                validated: true,
            });

            expect(result.success).toBe(true);

            // Read the updated file and verify version metadata was added
            const updatedContent = fs.readFileSync(
                path.join(testDir, "workflows", "W98.yaml"),
                "utf-8"
            );

            expect(updatedContent).toContain("version:");
            expect(updatedContent).toContain("created_at:");
            expect(updatedContent).toContain("updated_at:");
            expect(updatedContent).toContain("validated: true");
        });
    });

    describe("mixed legacy and modern files", () => {
        it("reads both legacy files and files with version metadata", () => {
            // Create a legacy capability file
            const legacyCapability = `
id: legacy-cap
name: Legacy Capability
category: data
description: No version metadata
`;
            fs.writeFileSync(
                path.join(testDir, "capabilities", "legacy-cap.yaml"),
                legacyCapability
            );

            // Create a modern capability file with version metadata
            const modernCapability = `
id: modern-cap
name: Modern Capability
category: visualization
description: Has version metadata
version: "1.0.0"
created_at: "2024-01-01T00:00:00.000Z"
updated_at: "2024-01-01T00:00:00.000Z"
`;
            fs.writeFileSync(
                path.join(testDir, "capabilities", "modern-cap.yaml"),
                modernCapability
            );

            const store = new DesignDocsStore(testDir);
            const capabilities = store.listCapabilities();

            // Both files should be read
            expect(capabilities).toHaveLength(2);

            const ids = capabilities.map(c => c.id).sort();
            expect(ids).toEqual(["legacy-cap", "modern-cap"]);
        });
    });
});
