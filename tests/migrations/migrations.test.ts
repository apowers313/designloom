import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
    clearMigrations,
    getMigrations,
    getMigrationsForUpgrade,
    migrateEntity,
    migrateEntityWithResult,
    type Migration,
    registerMigration,
} from "../../src/migrations/index.js";
import { migration as v1Migration } from "../../src/migrations/v1-add-schema-version.js";

describe("migration registry", () => {
    beforeEach(() => {
        clearMigrations();
    });

    afterEach(() => {
        clearMigrations();
    });

    it("starts with empty migrations list", () => {
        expect(getMigrations()).toHaveLength(0);
    });

    it("registers a migration", () => {
        const migration: Migration = {
            id: "001-test",
            fromVersion: "1.0.0",
            toVersion: "1.1.0",
            entityTypes: "all",
            description: "Test migration",
            migrate: (data) => data,
        };

        registerMigration(migration);
        expect(getMigrations()).toHaveLength(1);
        expect(getMigrations()[0].id).toBe("001-test");
    });

    it("sorts migrations by version order", () => {
        const migration2: Migration = {
            id: "002-second",
            fromVersion: "1.1.0",
            toVersion: "1.2.0",
            entityTypes: "all",
            description: "Second migration",
            migrate: (data) => data,
        };

        const migration1: Migration = {
            id: "001-first",
            fromVersion: "1.0.0",
            toVersion: "1.1.0",
            entityTypes: "all",
            description: "First migration",
            migrate: (data) => data,
        };

        // Register in reverse order
        registerMigration(migration2);
        registerMigration(migration1);

        const migrations = getMigrations();
        expect(migrations[0].id).toBe("001-first");
        expect(migrations[1].id).toBe("002-second");
    });

    it("clears all migrations", () => {
        registerMigration({
            id: "test",
            fromVersion: "1.0.0",
            toVersion: "1.1.0",
            entityTypes: "all",
            description: "Test",
            migrate: (data) => data,
        });

        expect(getMigrations()).toHaveLength(1);
        clearMigrations();
        expect(getMigrations()).toHaveLength(0);
    });
});

describe("getMigrationsForUpgrade", () => {
    beforeEach(() => {
        clearMigrations();

        registerMigration({
            id: "001-add-field",
            fromVersion: "1.0.0",
            toVersion: "1.1.0",
            entityTypes: "all",
            description: "Add new field",
            migrate: (data) => ({ ...data, newField: true }),
        });

        registerMigration({
            id: "002-workflow-only",
            fromVersion: "1.1.0",
            toVersion: "1.2.0",
            entityTypes: ["workflow"],
            description: "Workflow-only migration",
            migrate: (data) => ({ ...data, workflowField: true }),
        });

        registerMigration({
            id: "003-another",
            fromVersion: "1.2.0",
            toVersion: "1.3.0",
            entityTypes: "all",
            description: "Another migration",
            migrate: (data) => ({ ...data, anotherField: true }),
        });
    });

    afterEach(() => {
        clearMigrations();
    });

    it("returns empty array when already at target version", () => {
        const migrations = getMigrationsForUpgrade("1.3.0", "1.3.0", "workflow");
        expect(migrations).toHaveLength(0);
    });

    it("returns empty array when version is newer than target", () => {
        const migrations = getMigrationsForUpgrade("1.3.0", "1.2.0", "workflow");
        expect(migrations).toHaveLength(0);
    });

    it("returns applicable migrations for version range", () => {
        const migrations = getMigrationsForUpgrade("1.0.0", "1.3.0", "workflow");
        expect(migrations).toHaveLength(3);
    });

    it("filters by entity type", () => {
        const workflowMigrations = getMigrationsForUpgrade("1.0.0", "1.3.0", "workflow");
        const capabilityMigrations = getMigrationsForUpgrade("1.0.0", "1.3.0", "capability");

        // Workflow should get all 3 (002 is workflow-only)
        expect(workflowMigrations).toHaveLength(3);
        // Capability should get 2 (002 doesn't apply)
        expect(capabilityMigrations).toHaveLength(2);
    });

    it("returns migrations in order", () => {
        const migrations = getMigrationsForUpgrade("1.0.0", "1.3.0", "workflow");
        expect(migrations[0].id).toBe("001-add-field");
        expect(migrations[1].id).toBe("002-workflow-only");
        expect(migrations[2].id).toBe("003-another");
    });
});

describe("migrateEntity", () => {
    beforeEach(() => {
        clearMigrations();

        registerMigration({
            id: "001-add-field",
            fromVersion: "1.0.0",
            toVersion: "1.1.0",
            entityTypes: "all",
            description: "Add new field",
            migrate: (data) => ({ ...data, newField: "added" }),
        });

        registerMigration({
            id: "002-transform",
            fromVersion: "1.1.0",
            toVersion: "1.2.0",
            entityTypes: "all",
            description: "Transform field",
            migrate: (data) => ({ ...data, transformedField: `transformed-${data.id}` }),
        });
    });

    afterEach(() => {
        clearMigrations();
    });

    it("returns original data when no migration needed", () => {
        const data = { id: "test", name: "Test Entity" };
        const result = migrateEntity(data, "1.2.0", "1.2.0", "workflow");
        expect(result).toEqual(data);
    });

    it("applies single migration", () => {
        const data = { id: "test", name: "Test Entity" };
        const result = migrateEntity(data, "1.0.0", "1.1.0", "workflow");
        expect(result).toEqual({
            id: "test",
            name: "Test Entity",
            newField: "added",
        });
    });

    it("applies multiple migrations in order", () => {
        const data = { id: "W01", name: "Test Workflow" };
        const result = migrateEntity(data, "1.0.0", "1.2.0", "workflow");
        expect(result).toEqual({
            id: "W01",
            name: "Test Workflow",
            newField: "added",
            transformedField: "transformed-W01",
        });
    });

    it("does not mutate original data", () => {
        const data = { id: "test", name: "Test Entity" };
        const originalData = { ...data };
        migrateEntity(data, "1.0.0", "1.2.0", "workflow");
        expect(data).toEqual(originalData);
    });
});

describe("migrateEntityWithResult", () => {
    beforeEach(() => {
        clearMigrations();

        registerMigration({
            id: "001-add-field",
            fromVersion: "1.0.0",
            toVersion: "1.1.0",
            entityTypes: "all",
            description: "Add new field",
            migrate: (data) => ({ ...data, newField: "added" }),
        });
    });

    afterEach(() => {
        clearMigrations();
    });

    it("returns success with migration count", () => {
        const data = { id: "test" };
        const { data: migrated, result } = migrateEntityWithResult(data, "1.0.0", "1.1.0", "workflow");

        expect(result.success).toBe(true);
        expect(result.migrationsApplied).toBe(1);
        expect(result.migrationIds).toEqual(["001-add-field"]);
        expect(migrated.newField).toBe("added");
    });

    it("returns success with zero migrations when none needed", () => {
        const data = { id: "test" };
        const { result } = migrateEntityWithResult(data, "1.1.0", "1.1.0", "workflow");

        expect(result.success).toBe(true);
        expect(result.migrationsApplied).toBe(0);
        expect(result.migrationIds).toEqual([]);
    });

    it("handles migration errors gracefully", () => {
        registerMigration({
            id: "failing-migration",
            fromVersion: "1.1.0",
            toVersion: "1.2.0",
            entityTypes: "all",
            description: "This migration throws",
            migrate: () => {
                throw new Error("Migration failed!");
            },
        });

        const data = { id: "test" };
        const { data: migrated, result } = migrateEntityWithResult(data, "1.0.0", "1.2.0", "workflow");

        expect(result.success).toBe(false);
        expect(result.error).toBe("Migration failed!");
        expect(migrated).toEqual(data); // Original data returned on error
    });
});

describe("v1 migration (0.0.0 → 1.0.0)", () => {
    it("has correct metadata", () => {
        expect(v1Migration.id).toBe("001-add-schema-version");
        expect(v1Migration.fromVersion).toBe("0.0.0");
        expect(v1Migration.toVersion).toBe("1.0.0");
        expect(v1Migration.entityTypes).toBe("all");
    });

    it("adds schema_version to entity without it", () => {
        const data = { id: "test", name: "Test Entity" };
        const result = v1Migration.migrate(data, "workflow");

        expect(result.schema_version).toBe("1.0.0");
        expect(result.id).toBe("test");
        expect(result.name).toBe("Test Entity");
    });

    it("preserves existing schema_version", () => {
        const data = { id: "test", name: "Test Entity", schema_version: "0.5.0" };
        const result = v1Migration.migrate(data, "workflow");

        expect(result.schema_version).toBe("0.5.0");
    });

    it("does not mutate original data", () => {
        const data = { id: "test", name: "Test Entity" };
        const originalData = { ...data };
        v1Migration.migrate(data, "workflow");

        expect(data).toEqual(originalData);
    });
});
