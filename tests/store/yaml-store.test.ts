import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { DesignDocsStore } from "../../src/store/yaml-store.js";
import * as fs from "node:fs";
import * as path from "node:path";

const FIXTURES_PATH = path.join(__dirname, "../fixtures/design");

describe("DesignDocsStore", () => {
    describe("constructor", () => {
        it("creates store with valid path", () => {
            const store = new DesignDocsStore(FIXTURES_PATH);
            expect(store).toBeInstanceOf(DesignDocsStore);
        });

        it("handles non-existent path gracefully", () => {
            const store = new DesignDocsStore("./non-existent-path");
            expect(store).toBeInstanceOf(DesignDocsStore);
        });
    });

    describe("listWorkflows", () => {
        it("lists all workflows from directory", () => {
            const store = new DesignDocsStore(FIXTURES_PATH);
            const workflows = store.listWorkflows();
            expect(workflows.length).toBeGreaterThanOrEqual(1);
            expect(workflows[0]).toHaveProperty("id");
            expect(workflows[0]).toHaveProperty("name");
            expect(workflows[0]).toHaveProperty("category");
            expect(workflows[0]).toHaveProperty("validated");
        });

        it("returns empty array for missing directory", () => {
            const store = new DesignDocsStore("./non-existent-path");
            expect(store.listWorkflows()).toEqual([]);
        });

        it("filters by category", () => {
            const store = new DesignDocsStore(FIXTURES_PATH);
            const workflows = store.listWorkflows({ category: "onboarding" });
            for (const w of workflows) {
                expect(w.category).toBe("onboarding");
            }
        });

        it("filters by validated status", () => {
            const store = new DesignDocsStore(FIXTURES_PATH);
            const validated = store.listWorkflows({ validated: true });
            for (const w of validated) {
                expect(w.validated).toBe(true);
            }
        });
    });

    describe("listCapabilities", () => {
        it("lists all capabilities from directory", () => {
            const store = new DesignDocsStore(FIXTURES_PATH);
            const capabilities = store.listCapabilities();
            expect(capabilities.length).toBeGreaterThanOrEqual(1);
            expect(capabilities[0]).toHaveProperty("id");
            expect(capabilities[0]).toHaveProperty("name");
            expect(capabilities[0]).toHaveProperty("category");
            expect(capabilities[0]).toHaveProperty("status");
        });

        it("returns empty array for missing directory", () => {
            const store = new DesignDocsStore("./non-existent-path");
            expect(store.listCapabilities()).toEqual([]);
        });

        it("filters by status", () => {
            const store = new DesignDocsStore(FIXTURES_PATH);
            const implemented = store.listCapabilities({ status: "implemented" });
            for (const c of implemented) {
                expect(c.status).toBe("implemented");
            }
        });
    });

    describe("listPersonas", () => {
        it("lists all personas from directory", () => {
            const store = new DesignDocsStore(FIXTURES_PATH);
            const personas = store.listPersonas();
            expect(personas.length).toBeGreaterThanOrEqual(1);
            expect(personas[0]).toHaveProperty("id");
            expect(personas[0]).toHaveProperty("name");
            expect(personas[0]).toHaveProperty("role");
            expect(personas[0]).toHaveProperty("expertise");
        });

        it("returns empty array for missing directory", () => {
            const store = new DesignDocsStore("./non-existent-path");
            expect(store.listPersonas()).toEqual([]);
        });
    });

    describe("listComponents", () => {
        it("lists all components from directory", () => {
            const store = new DesignDocsStore(FIXTURES_PATH);
            const components = store.listComponents();
            expect(components.length).toBeGreaterThanOrEqual(1);
            expect(components[0]).toHaveProperty("id");
            expect(components[0]).toHaveProperty("name");
            expect(components[0]).toHaveProperty("category");
            expect(components[0]).toHaveProperty("status");
        });

        it("returns empty array for missing directory", () => {
            const store = new DesignDocsStore("./non-existent-path");
            expect(store.listComponents()).toEqual([]);
        });

        it("filters by status", () => {
            const store = new DesignDocsStore(FIXTURES_PATH);
            const implemented = store.listComponents({ status: "implemented" });
            for (const c of implemented) {
                expect(c.status).toBe("implemented");
            }
        });
    });

    describe("getWorkflow", () => {
        it("gets a workflow by ID with resolved relationships", () => {
            const store = new DesignDocsStore(FIXTURES_PATH);
            const workflow = store.getWorkflow("W01");
            expect(workflow).not.toBeNull();
            expect(workflow!.id).toBe("W01");
            expect(workflow!._resolved).toBeDefined();
            expect(workflow!._resolved.capabilities).toBeInstanceOf(Array);
            expect(workflow!._resolved.personas).toBeInstanceOf(Array);
            expect(workflow!._resolved.components).toBeInstanceOf(Array);
        });

        it("returns null for non-existent workflow", () => {
            const store = new DesignDocsStore(FIXTURES_PATH);
            const workflow = store.getWorkflow("W999");
            expect(workflow).toBeNull();
        });

        it("resolves capability references", () => {
            const store = new DesignDocsStore(FIXTURES_PATH);
            const workflow = store.getWorkflow("W01");
            expect(workflow).not.toBeNull();
            // Should have resolved capabilities if workflow references them
            if (workflow!.requires_capabilities.length > 0) {
                expect(workflow!._resolved.capabilities.length).toBeGreaterThan(0);
                expect(workflow!._resolved.capabilities[0]).toHaveProperty("id");
                expect(workflow!._resolved.capabilities[0]).toHaveProperty("name");
            }
        });
    });

    describe("getCapability", () => {
        it("gets a capability by ID with resolved relationships", () => {
            const store = new DesignDocsStore(FIXTURES_PATH);
            const capability = store.getCapability("data-import");
            expect(capability).not.toBeNull();
            expect(capability!.id).toBe("data-import");
            expect(capability!._resolved).toBeDefined();
            expect(capability!._resolved.workflows).toBeInstanceOf(Array);
            expect(capability!._resolved.components).toBeInstanceOf(Array);
        });

        it("returns null for non-existent capability", () => {
            const store = new DesignDocsStore(FIXTURES_PATH);
            const capability = store.getCapability("non-existent-cap");
            expect(capability).toBeNull();
        });
    });

    describe("getPersona", () => {
        it("gets a persona by ID with resolved relationships", () => {
            const store = new DesignDocsStore(FIXTURES_PATH);
            const persona = store.getPersona("analyst-alex");
            expect(persona).not.toBeNull();
            expect(persona!.id).toBe("analyst-alex");
            expect(persona!._resolved).toBeDefined();
            expect(persona!._resolved.workflows).toBeInstanceOf(Array);
        });

        it("returns null for non-existent persona", () => {
            const store = new DesignDocsStore(FIXTURES_PATH);
            const persona = store.getPersona("non-existent-persona");
            expect(persona).toBeNull();
        });
    });

    describe("getComponent", () => {
        it("gets a component by ID with resolved relationships", () => {
            const store = new DesignDocsStore(FIXTURES_PATH);
            const component = store.getComponent("data-import-dialog");
            expect(component).not.toBeNull();
            expect(component!.id).toBe("data-import-dialog");
            expect(component!._resolved).toBeDefined();
            expect(component!._resolved.capabilities).toBeInstanceOf(Array);
            expect(component!._resolved.workflows).toBeInstanceOf(Array);
            expect(component!._resolved.dependents).toBeInstanceOf(Array);
        });

        it("returns null for non-existent component", () => {
            const store = new DesignDocsStore(FIXTURES_PATH);
            const component = store.getComponent("non-existent-component");
            expect(component).toBeNull();
        });
    });

    describe("existence checks", () => {
        it("workflowExists returns true for existing workflow", () => {
            const store = new DesignDocsStore(FIXTURES_PATH);
            expect(store.workflowExists("W01")).toBe(true);
        });

        it("workflowExists returns false for non-existent workflow", () => {
            const store = new DesignDocsStore(FIXTURES_PATH);
            expect(store.workflowExists("W999")).toBe(false);
        });

        it("capabilityExists returns true for existing capability", () => {
            const store = new DesignDocsStore(FIXTURES_PATH);
            expect(store.capabilityExists("data-import")).toBe(true);
        });

        it("capabilityExists returns false for non-existent capability", () => {
            const store = new DesignDocsStore(FIXTURES_PATH);
            expect(store.capabilityExists("non-existent")).toBe(false);
        });

        it("personaExists returns true for existing persona", () => {
            const store = new DesignDocsStore(FIXTURES_PATH);
            expect(store.personaExists("analyst-alex")).toBe(true);
        });

        it("personaExists returns false for non-existent persona", () => {
            const store = new DesignDocsStore(FIXTURES_PATH);
            expect(store.personaExists("non-existent")).toBe(false);
        });

        it("componentExists returns true for existing component", () => {
            const store = new DesignDocsStore(FIXTURES_PATH);
            expect(store.componentExists("data-import-dialog")).toBe(true);
        });

        it("componentExists returns false for non-existent component", () => {
            const store = new DesignDocsStore(FIXTURES_PATH);
            expect(store.componentExists("non-existent")).toBe(false);
        });
    });

    describe("getDependencies", () => {
        it("returns dependencies for a workflow", () => {
            const store = new DesignDocsStore(FIXTURES_PATH);
            const deps = store.getDependencies("workflow", "W01");
            expect(deps).toHaveProperty("capabilities");
            expect(deps).toHaveProperty("personas");
            expect(deps).toHaveProperty("components");
        });

        it("returns dependencies for a capability", () => {
            const store = new DesignDocsStore(FIXTURES_PATH);
            const deps = store.getDependencies("capability", "data-import");
            expect(deps).toHaveProperty("components");
        });

        it("returns null for non-existent entity", () => {
            const store = new DesignDocsStore(FIXTURES_PATH);
            const deps = store.getDependencies("workflow", "W999");
            expect(deps).toBeNull();
        });
    });

    describe("getDependents", () => {
        it("returns dependents for a capability", () => {
            const store = new DesignDocsStore(FIXTURES_PATH);
            const deps = store.getDependents("capability", "data-import");
            expect(deps).toHaveProperty("workflows");
        });

        it("returns dependents for a persona", () => {
            const store = new DesignDocsStore(FIXTURES_PATH);
            const deps = store.getDependents("persona", "analyst-alex");
            expect(deps).toHaveProperty("workflows");
        });

        it("returns dependents for a component", () => {
            const store = new DesignDocsStore(FIXTURES_PATH);
            const deps = store.getDependents("component", "data-import-dialog");
            expect(deps).toHaveProperty("workflows");
            expect(deps).toHaveProperty("capabilities");
        });

        it("returns null for non-existent entity", () => {
            const store = new DesignDocsStore(FIXTURES_PATH);
            const deps = store.getDependents("capability", "non-existent");
            expect(deps).toBeNull();
        });
    });
});
