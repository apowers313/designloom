import { describe, expect, it } from "vitest";

import {
    checkSchemaVersion,
    compareVersions,
    createSchemaWarning,
    CURRENT_SCHEMA_VERSION,
    MINIMUM_COMPATIBLE_VERSION,
} from "../../src/schemas/version.js";

describe("compareVersions", () => {
    it("returns 0 for equal versions", () => {
        expect(compareVersions("1.0.0", "1.0.0")).toBe(0);
        expect(compareVersions("2.3.4", "2.3.4")).toBe(0);
        expect(compareVersions("0.0.0", "0.0.0")).toBe(0);
    });

    it("returns negative when first version is older", () => {
        expect(compareVersions("1.0.0", "1.0.1")).toBeLessThan(0);
        expect(compareVersions("1.0.0", "1.1.0")).toBeLessThan(0);
        expect(compareVersions("1.0.0", "2.0.0")).toBeLessThan(0);
        expect(compareVersions("0.9.9", "1.0.0")).toBeLessThan(0);
    });

    it("returns positive when first version is newer", () => {
        expect(compareVersions("1.0.1", "1.0.0")).toBeGreaterThan(0);
        expect(compareVersions("1.1.0", "1.0.0")).toBeGreaterThan(0);
        expect(compareVersions("2.0.0", "1.0.0")).toBeGreaterThan(0);
        expect(compareVersions("1.0.0", "0.9.9")).toBeGreaterThan(0);
    });

    it("compares major versions first", () => {
        expect(compareVersions("2.0.0", "1.9.9")).toBeGreaterThan(0);
        expect(compareVersions("1.9.9", "2.0.0")).toBeLessThan(0);
    });

    it("compares minor versions when major is equal", () => {
        expect(compareVersions("1.5.0", "1.4.9")).toBeGreaterThan(0);
        expect(compareVersions("1.4.9", "1.5.0")).toBeLessThan(0);
    });

    it("compares patch versions when major and minor are equal", () => {
        expect(compareVersions("1.2.5", "1.2.4")).toBeGreaterThan(0);
        expect(compareVersions("1.2.4", "1.2.5")).toBeLessThan(0);
    });

    it("handles invalid versions by treating as 0.0.0", () => {
        expect(compareVersions("invalid", "1.0.0")).toBeLessThan(0);
        expect(compareVersions("1.0.0", "invalid")).toBeGreaterThan(0);
        expect(compareVersions("invalid", "invalid")).toBe(0);
        expect(compareVersions("", "1.0.0")).toBeLessThan(0);
        expect(compareVersions("1.0", "1.0.0")).toBeLessThan(0); // Missing patch
    });
});

describe("checkSchemaVersion", () => {
    it("returns compatible for current version", () => {
        const result = checkSchemaVersion(CURRENT_SCHEMA_VERSION);
        expect(result.isCompatible).toBe(true);
        expect(result.needsMigration).toBe(false);
        expect(result.isNewer).toBe(false);
        expect(result.severity).toBe("info");
    });

    it("treats undefined as 0.0.0 (legacy file)", () => {
        const result = checkSchemaVersion(undefined);
        expect(result.isCompatible).toBe(true);
        expect(result.needsMigration).toBe(true);
        expect(result.isNewer).toBe(false);
        expect(result.severity).toBe("warning");
        expect(result.message).toContain("legacy file");
    });

    it("treats missing schema_version as needing migration", () => {
        const result = checkSchemaVersion(undefined);
        expect(result.needsMigration).toBe(true);
    });

    it("detects newer version than current (shouldn't normally happen)", () => {
        const result = checkSchemaVersion("99.99.99");
        expect(result.isCompatible).toBe(false);
        expect(result.needsMigration).toBe(false);
        expect(result.isNewer).toBe(true);
        expect(result.severity).toBe("error");
    });

    it("returns compatible for minimum compatible version", () => {
        const result = checkSchemaVersion(MINIMUM_COMPATIBLE_VERSION);
        expect(result.isCompatible).toBe(true);
    });
});

describe("createSchemaWarning", () => {
    it("returns null for current version (no warning needed)", () => {
        const warning = createSchemaWarning("workflow", "W01", CURRENT_SCHEMA_VERSION);
        expect(warning).toBeNull();
    });

    it("returns warning for missing schema_version", () => {
        const warning = createSchemaWarning("workflow", "W01", undefined);
        expect(warning).not.toBeNull();
        expect(warning?.entityType).toBe("workflow");
        expect(warning?.entityId).toBe("W01");
        expect(warning?.storedVersion).toBe("0.0.0");
        expect(warning?.currentVersion).toBe(CURRENT_SCHEMA_VERSION);
        expect(warning?.severity).toBe("warning");
    });

    it("returns error for newer than current version", () => {
        const warning = createSchemaWarning("capability", "data-export", "99.0.0");
        expect(warning).not.toBeNull();
        expect(warning?.entityType).toBe("capability");
        expect(warning?.entityId).toBe("data-export");
        expect(warning?.severity).toBe("error");
    });

    it("includes entity type and ID in warning", () => {
        const warning = createSchemaWarning("component", "button-primary", undefined);
        expect(warning?.entityType).toBe("component");
        expect(warning?.entityId).toBe("button-primary");
    });
});

describe("schema version constants", () => {
    it("CURRENT_SCHEMA_VERSION is a valid semver", () => {
        expect(CURRENT_SCHEMA_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it("MINIMUM_COMPATIBLE_VERSION is a valid semver", () => {
        expect(MINIMUM_COMPATIBLE_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it("MINIMUM_COMPATIBLE_VERSION is <= CURRENT_SCHEMA_VERSION", () => {
        expect(compareVersions(MINIMUM_COMPATIBLE_VERSION, CURRENT_SCHEMA_VERSION)).toBeLessThanOrEqual(0);
    });
});
