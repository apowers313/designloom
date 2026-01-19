/* eslint-disable camelcase -- snake_case matches YAML field names for serialization */
import { z } from "zod";

import {
    SourceSchema,
    VersionMetadataSchema,
} from "./source.js";

/**
 * TestResult ID pattern: TR-{WorkflowID}-{PersonaID}-{sequence}
 * e.g., TR-W01-analyst-alex-001
 */
const TestResultIdSchema = z
    .string()
    .regex(/^TR-W\d{1,3}-[a-z][a-z0-9-]*-\d{3}$/, "ID must match pattern TR-W01-persona-id-001");

/**
 * Test type - simulated (AI-driven) or real (actual user testing)
 */
const TestTypeSchema = z.enum([
    "simulated",  // AI-driven persona-based cognitive walkthrough
    "real",       // Actual user testing with real participants
]);

/**
 * Issue severity levels
 */
const IssueSeveritySchema = z.enum([
    "critical",  // Blocks task completion
    "major",     // Significantly impairs experience
    "minor",     // Small friction, workaround exists
]);

/**
 * Test result status
 */
const TestResultStatusSchema = z.enum([
    "passed",    // All success criteria met
    "failed",    // One or more critical issues
    "partial",   // Some criteria met, some issues found
]);

/**
 * Confidence level for findings
 */
const ConfidenceLevelSchema = z.enum([
    "high",      // Strong evidence, multiple data points
    "medium",    // Reasonable evidence, some uncertainty
    "low",       // Preliminary, needs validation
]);

/**
 * Success criterion result
 */
const SuccessCriterionResultSchema = z.object({
    criterion: z.string().min(1),
    target: z.string().min(1),
    actual: z.string().optional(),
    passed: z.boolean(),
    notes: z.string().optional(),
});

/**
 * Issue found during testing
 */
const TestIssueSchema = z.object({
    severity: IssueSeveritySchema,
    description: z.string().min(1),
    workflow_step: z.string().optional(),
    persona_factor: z.string().optional(),  // What persona characteristic caused/exposed this
    affected_components: z.array(z.string()).optional().default([]),
    affected_capabilities: z.array(z.string()).optional().default([]),
    recommendation: z.string().optional(),
    evidence: z.string().optional(),  // Quote, observation, or data point
});

/**
 * TestResult schema for tracking testing outcomes
 */
export const TestResultSchema = z.object({
    id: TestResultIdSchema,
    workflow_id: z.string().regex(/^W\d{1,3}$/, "Must be a valid workflow ID"),
    persona_id: z.string().min(1),
    test_type: TestTypeSchema,
    date: z.string().min(1),  // ISO 8601 date

    // Overall result
    status: TestResultStatusSchema,
    confidence: ConfidenceLevelSchema.optional().default("medium"),

    // Success criteria evaluation
    success_criteria_results: z.array(SuccessCriterionResultSchema).optional().default([]),

    // Issues found
    issues: z.array(TestIssueSchema).optional().default([]),

    // Summary
    summary: z.string().optional(),  // Brief narrative of the test

    // For real tests only
    participants: z.number().int().positive().optional(),
    quotes: z.array(z.string()).optional().default([]),

    // Recommendations
    recommendations: z.array(z.string()).optional().default([]),

    // Sources (for real tests: test documentation; for simulated: methodology notes)
    sources: z.array(SourceSchema).optional().default([]),
}).merge(VersionMetadataSchema);

/**
 * TestResult type derived from schema
 */
export type TestResult = z.infer<typeof TestResultSchema>;

/**
 * TestResult summary for list operations
 */
export interface TestResultSummary {
    id: string;
    workflow_id: string;
    persona_id: string;
    test_type: "simulated" | "real";
    date: string;
    status: "passed" | "failed" | "partial";
    issue_count: number;
    confidence: "high" | "medium" | "low";
}

/**
 * TestResult with resolved references
 */
export interface TestResultResolved {
    workflow: { id: string; name: string } | null;
    persona: { id: string; name: string } | null;
    affected_components: Array<{ id: string; name: string }>;
    affected_capabilities: Array<{ id: string; name: string }>;
}

/**
 * TestResult with resolved references
 */
export type TestResultWithResolved = TestResult & { _resolved: TestResultResolved };

/**
 * TestResult filters for list operations
 */
export interface TestResultFilters {
    workflow_id?: string;
    persona_id?: string;
    test_type?: "simulated" | "real";
    status?: "passed" | "failed" | "partial";
    confidence?: "high" | "medium" | "low";
    has_issues?: boolean;
}

/**
 * Test coverage entry for a workflow-persona combination
 */
export interface TestCoverageEntry {
    workflow_id: string;
    workflow_name: string;
    persona_id: string;
    persona_name: string;
    test_count: number;
    latest_test: {
        id: string;
        date: string;
        status: "passed" | "failed" | "partial";
        test_type: "simulated" | "real";
    } | null;
    has_real_test: boolean;
    has_simulated_test: boolean;
}

/**
 * Test coverage report
 */
export interface TestCoverageReport {
    total_workflows: number;
    total_personas: number;
    possible_combinations: number;
    tested_combinations: number;
    coverage_percentage: number;
    real_test_count: number;
    simulated_test_count: number;
    entries: TestCoverageEntry[];
    untested: Array<{ workflow_id: string; workflow_name: string; persona_id: string; persona_name: string }>;
}
