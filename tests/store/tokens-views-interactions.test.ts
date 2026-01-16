import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { DesignDocsStore } from "../../src/store/yaml-store.js";
import * as fs from "node:fs";
import * as path from "node:path";

// Use a separate temp directory for these tests
const TEMP_PATH = path.join(__dirname, "../temp-tvi-tests");
const FIXTURES_PATH = path.join(__dirname, "../fixtures/design");

// Helper to create valid tokens data
function createValidTokensData(id: string, name: string, options: { extends?: string } = {}) {
    return {
        id,
        name,
        description: `${name} tokens`,
        extends: options.extends,
        colors: {
            neutral: {
                500: "#666666",
            },
        },
        typography: {
            fonts: { sans: "Inter, system-ui, sans-serif" },
            sizes: { base: "16px" },
            weights: { normal: 400 },
            line_heights: { normal: 1.5 },
            styles: {},
        },
        spacing: {
            scale: { 4: "1rem" },
        },
    };
}

// Helper to create valid view data
function createValidViewData(id: string, name: string, options: { workflows?: string[]; routes?: Array<{ path: string }>; components?: string[] } = {}) {
    return {
        id,
        name,
        description: `${name} view`,
        workflows: options.workflows,
        routes: options.routes,
        layout: {
            type: "single-column" as const,
            zones: [
                {
                    id: "main",
                    position: "main" as const,
                    components: options.components ?? [],
                },
            ],
        },
    };
}

// Helper to create valid interaction data
function createValidInteractionData(id: string, name: string, options: { applies_to?: string[] } = {}) {
    return {
        id,
        name,
        description: `${name} interaction`,
        applies_to: options.applies_to ?? [],
        interaction: {
            states: [
                {
                    type: "default" as const,
                    style: { background: "#ffffff" },
                },
                {
                    type: "hover" as const,
                    style: { background: "#f0f0f0" },
                },
            ],
        },
    };
}

/**
 * Copy fixtures to temp directory for isolated testing
 */
function setupTempDir(): void {
    if (fs.existsSync(TEMP_PATH)) {
        fs.rmSync(TEMP_PATH, { recursive: true });
    }

    // Create fresh temp directory structure with all entity types
    fs.mkdirSync(path.join(TEMP_PATH, "workflows"), { recursive: true });
    fs.mkdirSync(path.join(TEMP_PATH, "capabilities"), { recursive: true });
    fs.mkdirSync(path.join(TEMP_PATH, "personas"), { recursive: true });
    fs.mkdirSync(path.join(TEMP_PATH, "components"), { recursive: true });
    fs.mkdirSync(path.join(TEMP_PATH, "tokens"), { recursive: true });
    fs.mkdirSync(path.join(TEMP_PATH, "views"), { recursive: true });
    fs.mkdirSync(path.join(TEMP_PATH, "interactions"), { recursive: true });

    // Copy existing fixture files
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

describe("Tokens, Views, and Interactions", () => {
    let store: DesignDocsStore;

    beforeEach(() => {
        setupTempDir();
        store = new DesignDocsStore(TEMP_PATH);
    });

    afterEach(() => {
        cleanupTempDir();
    });

    // =============== TOKENS TESTS ===============

    describe("createTokens", () => {
        it("creates tokens with valid data", () => {
            const result = store.createTokens(createValidTokensData("light-theme", "Light Theme"));

            expect(result.success).toBe(true);
            expect(store.tokensExists("light-theme")).toBe(true);
        });

        it("creates tokens with extends reference", () => {
            // First create base tokens
            store.createTokens(createValidTokensData("base-theme", "Base Theme"));

            // Create extended tokens
            const result = store.createTokens(createValidTokensData("dark-theme", "Dark Theme", { extends: "base-theme" }));

            expect(result.success).toBe(true);
            expect(store.tokensExists("dark-theme")).toBe(true);
        });

        it("rejects duplicate tokens ID", () => {
            store.createTokens(createValidTokensData("dup-theme", "Theme"));

            const result = store.createTokens(createValidTokensData("dup-theme", "Theme 2"));

            expect(result.success).toBe(false);
            expect(result.error).toContain("already exists");
        });

        it("rejects tokens with non-existent extends reference", () => {
            const data = createValidTokensData("orphan-theme", "Orphan Theme", { extends: "non-existent-theme" });
            const result = store.createTokens(data);

            expect(result.success).toBe(false);
            expect(result.error).toContain("does not exist");
        });

        it("rejects tokens with invalid ID format", () => {
            const data = createValidTokensData("light-theme", "Invalid");
            data.id = "InvalidTokens"; // Invalid - not kebab-case
            const result = store.createTokens(data);

            expect(result.success).toBe(false);
        });
    });

    describe("listTokens", () => {
        beforeEach(() => {
            store.createTokens(createValidTokensData("base-tokens", "Base"));
            store.createTokens(createValidTokensData("extended-tokens", "Extended", { extends: "base-tokens" }));
        });

        it("lists all tokens", () => {
            const tokens = store.listTokens();
            expect(tokens.length).toBe(2);
            expect(tokens[0]).toHaveProperty("id");
            expect(tokens[0]).toHaveProperty("name");
        });

        it("filters tokens by extends", () => {
            const filtered = store.listTokens({ extends: "base-tokens" });
            expect(filtered.length).toBe(1);
            expect(filtered[0].id).toBe("extended-tokens");
        });

        it("returns empty array for missing directory", () => {
            const emptyStore = new DesignDocsStore("./non-existent-path");
            expect(emptyStore.listTokens()).toEqual([]);
        });
    });

    describe("getTokens", () => {
        beforeEach(() => {
            store.createTokens(createValidTokensData("test-tokens", "Test Tokens"));
        });

        it("gets tokens by ID with resolved relationships", () => {
            const tokens = store.getTokens("test-tokens");
            expect(tokens).not.toBeNull();
            expect(tokens!.id).toBe("test-tokens");
            expect(tokens!._resolved).toBeDefined();
        });

        it("returns null for non-existent tokens", () => {
            const tokens = store.getTokens("non-existent-tokens");
            expect(tokens).toBeNull();
        });

        it("resolves parent reference", () => {
            store.createTokens(createValidTokensData("child-tokens", "Child", { extends: "test-tokens" }));

            const tokens = store.getTokens("child-tokens");
            expect(tokens).not.toBeNull();
            expect(tokens!._resolved.extends_theme).not.toBeNull();
            expect(tokens!._resolved.extends_theme!.id).toBe("test-tokens");
        });
    });

    describe("tokensExists", () => {
        it("returns true for existing tokens", () => {
            store.createTokens(createValidTokensData("existing-tokens", "Existing"));
            expect(store.tokensExists("existing-tokens")).toBe(true);
        });

        it("returns false for non-existent tokens", () => {
            expect(store.tokensExists("non-existent")).toBe(false);
        });
    });

    // =============== VIEWS TESTS ===============

    describe("createView", () => {
        it("creates view with valid data", () => {
            const result = store.createView(createValidViewData("V01", "Dashboard View"));

            expect(result.success).toBe(true);
            expect(store.viewExists("V01")).toBe(true);
        });

        it("creates view with workflow reference", () => {
            const result = store.createView(createValidViewData("V02", "Workflow View", { workflows: ["W01"] }));

            expect(result.success).toBe(true);
        });

        it("creates view with component in zone", () => {
            const result = store.createView(createValidViewData("V03", "Component View", { components: ["data-import-dialog"] }));

            expect(result.success).toBe(true);
        });

        it("creates view with routes", () => {
            const result = store.createView(createValidViewData("V04", "Routed View", { routes: [{ path: "/dashboard" }] }));

            expect(result.success).toBe(true);
        });

        it("rejects duplicate view ID", () => {
            store.createView(createValidViewData("V05", "View"));

            const result = store.createView(createValidViewData("V05", "View 2"));

            expect(result.success).toBe(false);
            expect(result.error).toContain("already exists");
        });

        it("rejects view with non-existent workflow reference", () => {
            const result = store.createView(createValidViewData("V06", "Bad View", { workflows: ["W999"] }));

            expect(result.success).toBe(false);
            expect(result.error).toContain("does not exist");
        });

        it("rejects view with non-existent component in zone", () => {
            const result = store.createView(createValidViewData("V07", "Bad View", { components: ["non-existent-component"] }));

            expect(result.success).toBe(false);
            expect(result.error).toContain("does not exist");
        });
    });

    describe("listViews", () => {
        beforeEach(() => {
            // Create view with "dashboard" type and routes
            const dashboardView = createValidViewData("V10", "Dashboard View", { workflows: ["W01"], routes: [{ path: "/dashboard" }] });
            dashboardView.layout.type = "dashboard";
            store.createView(dashboardView);

            // Create view with "split" type and no route
            const splitView = createValidViewData("V11", "Split View");
            splitView.layout.type = "split";
            store.createView(splitView);
        });

        it("lists all views", () => {
            const views = store.listViews();
            expect(views.length).toBe(2);
            expect(views[0]).toHaveProperty("id");
            expect(views[0]).toHaveProperty("name");
        });

        it("filters views by layout_type", () => {
            const dashboardViews = store.listViews({ layout_type: "dashboard" });
            expect(dashboardViews.length).toBe(1);
            expect(dashboardViews[0].layout_type).toBe("dashboard");
        });

        it("filters views by workflow", () => {
            const wfViews = store.listViews({ workflow: "W01" });
            expect(wfViews.length).toBe(1);
            expect(wfViews[0].id).toBe("V10");
        });

        it("filters views by has_route", () => {
            const routedViews = store.listViews({ has_route: true });
            expect(routedViews.length).toBe(1);
            expect(routedViews[0].id).toBe("V10");

            const unroutedViews = store.listViews({ has_route: false });
            expect(unroutedViews.length).toBe(1);
            expect(unroutedViews[0].id).toBe("V11");
        });

        it("returns empty array for missing directory", () => {
            const emptyStore = new DesignDocsStore("./non-existent-path");
            expect(emptyStore.listViews()).toEqual([]);
        });
    });

    describe("getView", () => {
        beforeEach(() => {
            store.createView(createValidViewData("V20", "Test View", { workflows: ["W01"], components: ["data-import-dialog"] }));
        });

        it("gets view by ID with resolved relationships", () => {
            const view = store.getView("V20");
            expect(view).not.toBeNull();
            expect(view!.id).toBe("V20");
            expect(view!._resolved).toBeDefined();
            expect(view!._resolved.workflows).toBeInstanceOf(Array);
            expect(view!._resolved.components).toBeInstanceOf(Array);
        });

        it("returns null for non-existent view", () => {
            const view = store.getView("V999");
            expect(view).toBeNull();
        });

        it("resolves workflow references", () => {
            const view = store.getView("V20");
            expect(view!._resolved.workflows.length).toBe(1);
            expect(view!._resolved.workflows[0].id).toBe("W01");
        });

        it("resolves component references from zones", () => {
            const view = store.getView("V20");
            expect(view!._resolved.components.length).toBe(1);
            expect(view!._resolved.components[0].id).toBe("data-import-dialog");
        });
    });

    describe("viewExists", () => {
        it("returns true for existing view", () => {
            store.createView(createValidViewData("V30", "Test"));
            expect(store.viewExists("V30")).toBe(true);
        });

        it("returns false for non-existent view", () => {
            expect(store.viewExists("V999")).toBe(false);
        });
    });

    // =============== INTERACTIONS TESTS ===============

    describe("createInteraction", () => {
        it("creates interaction with valid data", () => {
            const result = store.createInteraction(createValidInteractionData("drag-drop", "Drag and Drop", { applies_to: ["canvas", "list"] }));

            expect(result.success).toBe(true);
            expect(store.interactionExists("drag-drop")).toBe(true);
        });

        it("rejects duplicate interaction ID", () => {
            store.createInteraction(createValidInteractionData("dup-interaction", "Interaction"));

            const result = store.createInteraction(createValidInteractionData("dup-interaction", "Interaction 2"));

            expect(result.success).toBe(false);
            expect(result.error).toContain("already exists");
        });

        it("rejects interaction with invalid ID format", () => {
            const data = createValidInteractionData("test", "Invalid");
            data.id = "InvalidInteraction"; // Invalid - not kebab-case
            const result = store.createInteraction(data);

            expect(result.success).toBe(false);
        });
    });

    describe("listInteractions", () => {
        beforeEach(() => {
            store.createInteraction(createValidInteractionData("click-select", "Click Select", { applies_to: ["node", "edge"] }));
            store.createInteraction(createValidInteractionData("hover-highlight", "Hover Highlight", { applies_to: ["node"] }));
        });

        it("lists all interactions", () => {
            const interactions = store.listInteractions();
            expect(interactions.length).toBe(2);
            expect(interactions[0]).toHaveProperty("id");
            expect(interactions[0]).toHaveProperty("name");
        });

        it("filters interactions by applies_to", () => {
            const edgeInteractions = store.listInteractions({ applies_to: "edge" });
            expect(edgeInteractions.length).toBe(1);
            expect(edgeInteractions[0].id).toBe("click-select");
        });

        it("returns empty array for missing directory", () => {
            const emptyStore = new DesignDocsStore("./non-existent-path");
            expect(emptyStore.listInteractions()).toEqual([]);
        });
    });

    describe("getInteraction", () => {
        beforeEach(() => {
            store.createInteraction(createValidInteractionData("test-interaction", "Test Interaction", { applies_to: ["canvas"] }));
        });

        it("gets interaction by ID with resolved relationships", () => {
            const interaction = store.getInteraction("test-interaction");
            expect(interaction).not.toBeNull();
            expect(interaction!.id).toBe("test-interaction");
            expect(interaction!._resolved).toBeDefined();
            expect(interaction!._resolved.components_using).toBeInstanceOf(Array);
        });

        it("returns null for non-existent interaction", () => {
            const interaction = store.getInteraction("non-existent");
            expect(interaction).toBeNull();
        });
    });

    describe("interactionExists", () => {
        it("returns true for existing interaction", () => {
            store.createInteraction(createValidInteractionData("existing-interaction", "Existing"));
            expect(store.interactionExists("existing-interaction")).toBe(true);
        });

        it("returns false for non-existent interaction", () => {
            expect(store.interactionExists("non-existent")).toBe(false);
        });
    });

    // Note: getDependencies and getDependents only support workflow, capability, persona, and component.
    // Tokens, views, and interactions are not supported by these methods and return null.
});
