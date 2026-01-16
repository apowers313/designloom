/**
 * Test helper utilities for designloom tests.
 */

/**
 * Version metadata fields required by all entity schemas.
 * These are automatically managed by the store in production,
 * but need to be provided in schema tests.
 */
export const testVersionMetadata = {
    version: "1.0.0",
    created_at: "2025-01-15T00:00:00.000Z",
    updated_at: "2025-01-15T00:00:00.000Z",
};

/**
 * Add version metadata to test data.
 * Use this when testing schemas that require version metadata.
 * @param data - Test data object
 * @returns Test data with version metadata added
 */
export function withVersionMetadata<T extends Record<string, unknown>>(data: T): T & typeof testVersionMetadata {
    return {
        ...data,
        ...testVersionMetadata,
    };
}
