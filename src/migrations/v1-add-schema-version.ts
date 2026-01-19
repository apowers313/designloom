/* eslint-disable camelcase -- snake_case matches YAML field names for serialization */
/**
 * Migration: 0.0.0 → 1.0.0
 *
 * Adds schema_version field to legacy entities that don't have it.
 * This is a no-op migration since schema_version is automatically added
 * when entities are saved, but it documents the schema change.
 */

import type { Migration } from "./index.js";

export const migration: Migration = {
    id: "001-add-schema-version",
    fromVersion: "0.0.0",
    toVersion: "1.0.0",
    entityTypes: "all",
    description: "Add schema_version field to track schema definition version",
    migrate: (data) => {
        // schema_version is automatically added by the store when saving,
        // so this migration just ensures the field exists
        if (!data.schema_version) {
            return {
                ...data,
                schema_version: "1.0.0",
            };
        }
        return data;
    },
};
