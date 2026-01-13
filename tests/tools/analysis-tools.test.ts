import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { DesignloomServer } from "../../src/index.js";
import * as fs from "node:fs";
import * as path from "node:path";

// Use a separate temp directory for analysis tools tests
const TEMP_PATH = path.join(__dirname, "../temp-analysis-tools-tests");
const FIXTURES_PATH = path.join(__dirname, "../fixtures/design");

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

describe("Analysis Tools", () => {
    let server: DesignloomServer;

    beforeEach(() => {
        setupTempDir();
        server = new DesignloomServer(TEMP_PATH);
    });

    afterEach(() => {
        cleanupTempDir();
    });

    describe("listTools includes analysis tools", () => {
        it("lists all analysis tools", () => {
            const tools = server.listTools();
            const analysisTools = tools.filter(t => t.name.startsWith("design_validate") ||
                t.name.startsWith("design_coverage") ||
                t.name.startsWith("design_find") ||
                t.name.startsWith("design_suggest"));

            expect(analysisTools.length).toBe(5);
            expect(tools.some(t => t.name === "design_validate")).toBe(true);
            expect(tools.some(t => t.name === "design_coverage_report")).toBe(true);
            expect(tools.some(t => t.name === "design_find_orphans")).toBe(true);
            expect(tools.some(t => t.name === "design_find_gaps")).toBe(true);
            expect(tools.some(t => t.name === "design_suggest_priority")).toBe(true);
        });
    });

    describe("design_validate", () => {
        it("returns validation result via tool call", () => {
            const result = server.callTool("design_validate", {});

            expect(result.isError).toBeFalsy();
            const parsed = JSON.parse(result.content[0].text);
            expect(parsed).toHaveProperty("valid");
            expect(parsed).toHaveProperty("errors");
            expect(parsed).toHaveProperty("warnings");
        });
    });

    describe("design_coverage_report", () => {
        it("returns coverage report via tool call", () => {
            const result = server.callTool("design_coverage_report", {});

            expect(result.isError).toBeFalsy();
            const parsed = JSON.parse(result.content[0].text);
            expect(parsed).toHaveProperty("summary");
            expect(parsed).toHaveProperty("capability_coverage");
            expect(parsed).toHaveProperty("persona_coverage");
            expect(parsed).toHaveProperty("component_coverage");
            expect(parsed).toHaveProperty("workflow_coverage");
        });
    });

    describe("design_find_orphans", () => {
        it("returns orphans for all entity types", () => {
            const result = server.callTool("design_find_orphans", {});

            expect(result.isError).toBeFalsy();
            const parsed = JSON.parse(result.content[0].text);
            expect(parsed).toHaveProperty("capabilities");
            expect(parsed).toHaveProperty("personas");
            expect(parsed).toHaveProperty("components");
        });

        it("returns orphans filtered by entity type", () => {
            const result = server.callTool("design_find_orphans", { entityType: "capability" });

            expect(result.isError).toBeFalsy();
            const parsed = JSON.parse(result.content[0].text);
            expect(parsed).toHaveProperty("capabilities");
        });
    });

    describe("design_find_gaps", () => {
        it("returns gap analysis via tool call", () => {
            const result = server.callTool("design_find_gaps", {});

            expect(result.isError).toBeFalsy();
            const parsed = JSON.parse(result.content[0].text);
            expect(parsed).toHaveProperty("workflows_without_capabilities");
            expect(parsed).toHaveProperty("workflows_without_personas");
            expect(parsed).toHaveProperty("capabilities_without_components");
            expect(parsed).toHaveProperty("categories_with_few_workflows");
        });
    });

    describe("design_suggest_priority", () => {
        it("returns priority suggestions for capabilities", () => {
            const result = server.callTool("design_suggest_priority", { focus: "capability" });

            expect(result.isError).toBeFalsy();
            const parsed = JSON.parse(result.content[0].text);
            expect(parsed).toHaveProperty("recommendations");
            expect(parsed).toHaveProperty("summary");
        });

        it("returns priority suggestions for workflows", () => {
            const result = server.callTool("design_suggest_priority", { focus: "workflow" });

            expect(result.isError).toBeFalsy();
            const parsed = JSON.parse(result.content[0].text);
            expect(parsed).toHaveProperty("recommendations");
            expect(parsed).toHaveProperty("summary");
        });

        it("respects limit parameter", () => {
            const result = server.callTool("design_suggest_priority", { focus: "capability", limit: 2 });

            expect(result.isError).toBeFalsy();
            const parsed = JSON.parse(result.content[0].text);
            expect(parsed.recommendations.length).toBeLessThanOrEqual(2);
        });

        it("returns error for missing focus parameter", () => {
            const result = server.callTool("design_suggest_priority", {});

            expect(result.isError).toBe(true);
            expect(result.content[0].text).toContain("focus");
        });

        it("returns error for invalid focus parameter", () => {
            const result = server.callTool("design_suggest_priority", { focus: "invalid" });

            expect(result.isError).toBe(true);
            expect(result.content[0].text).toContain("focus");
        });
    });
});
