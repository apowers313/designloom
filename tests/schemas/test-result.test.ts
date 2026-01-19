import { describe, it, expect } from "vitest";
import { TestResultSchema } from "../../src/schemas/test-result.js";
import { withVersionMetadata } from "../test-helpers.js";

describe("TestResultSchema", () => {
    describe("valid test results", () => {
        it("validates a minimal test result", () => {
            const minimal = withVersionMetadata({
                id: "TR-W01-analyst-alex-001",
                workflow_id: "W01",
                persona_id: "analyst-alex",
                test_type: "simulated",
                date: "2025-01-15",
                status: "passed",
            });
            expect(() => TestResultSchema.parse(minimal)).not.toThrow();
        });

        it("validates a complete simulated test result", () => {
            const complete = withVersionMetadata({
                id: "TR-W01-analyst-alex-001",
                workflow_id: "W01",
                persona_id: "analyst-alex",
                test_type: "simulated",
                date: "2025-01-15T10:30:00Z",
                status: "partial",
                confidence: "medium",
                success_criteria_results: [
                    {
                        criterion: "Task completion rate",
                        target: "> 90%",
                        actual: "85%",
                        passed: false,
                        notes: "Some users struggled with step 3",
                    },
                    {
                        criterion: "Time to completion",
                        target: "< 2 minutes",
                        passed: true,
                    },
                ],
                issues: [
                    {
                        severity: "major",
                        description: "Progress indicator unclear during import",
                        workflow_step: "Step 3: Wait for import",
                        persona_factor: "Low patience due to high time pressure",
                        affected_components: ["data-import-dialog"],
                        affected_capabilities: ["data-import"],
                        recommendation: "Add estimated time remaining",
                        evidence: "Simulated user clicked away during 5-second wait",
                    },
                ],
                summary: "Most criteria met but progress feedback needs improvement",
                recommendations: [
                    "Add progress indicator with time estimate",
                    "Consider async import with notification",
                ],
            });
            expect(() => TestResultSchema.parse(complete)).not.toThrow();
        });

        it("validates a real test result with participants", () => {
            const realTest = withVersionMetadata({
                id: "TR-W01-analyst-alex-002",
                workflow_id: "W01",
                persona_id: "analyst-alex",
                test_type: "real",
                date: "2025-01-16",
                status: "passed",
                confidence: "high",
                participants: 8,
                quotes: [
                    "This was really intuitive!",
                    "I wish I could see the progress better",
                ],
                success_criteria_results: [
                    {
                        criterion: "Task completion rate",
                        target: "> 90%",
                        actual: "100%",
                        passed: true,
                    },
                ],
                sources: [
                    {
                        title: "Usability Test Session Recording",
                        url: "https://drive.example.com/test-session-1",
                        summary: "45-minute test session with enterprise analyst",
                    },
                ],
            });
            expect(() => TestResultSchema.parse(realTest)).not.toThrow();
        });

        it("validates a failed test result with critical issues", () => {
            const failed = withVersionMetadata({
                id: "TR-W02-data-scientist-001",
                workflow_id: "W02",
                persona_id: "data-scientist-dave",
                test_type: "simulated",
                date: "2025-01-15",
                status: "failed",
                confidence: "medium",
                issues: [
                    {
                        severity: "critical",
                        description: "Cannot proceed without API key",
                        workflow_step: "Step 1: Connect to data source",
                        persona_factor: "Expert user expects seamless integration",
                        recommendation: "Provide clear onboarding for API key setup",
                    },
                ],
                summary: "Blocked at first step due to missing API key guidance",
            });
            expect(() => TestResultSchema.parse(failed)).not.toThrow();
        });
    });

    describe("ID validation", () => {
        it("validates correct ID format", () => {
            const validIds = [
                "TR-W01-analyst-alex-001",
                "TR-W99-data-scientist-dave-999",
                "TR-W1-simple-user-001",
                "TR-W123-complex-persona-name-123",
            ];
            for (const id of validIds) {
                const testResult = withVersionMetadata({
                    id,
                    workflow_id: "W01",
                    persona_id: "analyst-alex",
                    test_type: "simulated",
                    date: "2025-01-15",
                    status: "passed",
                });
                expect(() => TestResultSchema.parse(testResult)).not.toThrow();
            }
        });

        it("rejects invalid ID format", () => {
            const invalidIds = [
                "W01-analyst-alex-001",       // Missing TR- prefix
                "TR-analyst-alex-001",         // Missing workflow ID
                "TR-W01-AnalystAlex-001",      // Not kebab-case persona
                "TR-W01-analyst-alex-1",       // Sequence not 3 digits
                "TR-W01-analyst-alex-0001",    // Sequence too many digits
                "test-result-01",              // Wrong format entirely
                "TR-workflow-persona-001",     // Invalid workflow format
            ];
            for (const id of invalidIds) {
                const testResult = withVersionMetadata({
                    id,
                    workflow_id: "W01",
                    persona_id: "analyst-alex",
                    test_type: "simulated",
                    date: "2025-01-15",
                    status: "passed",
                });
                expect(() => TestResultSchema.parse(testResult)).toThrow(/ID must match pattern/);
            }
        });
    });

    describe("test type validation", () => {
        it("accepts valid test types", () => {
            for (const test_type of ["simulated", "real"]) {
                const testResult = withVersionMetadata({
                    id: "TR-W01-analyst-alex-001",
                    workflow_id: "W01",
                    persona_id: "analyst-alex",
                    test_type,
                    date: "2025-01-15",
                    status: "passed",
                });
                expect(() => TestResultSchema.parse(testResult)).not.toThrow();
            }
        });

        it("rejects invalid test type", () => {
            const testResult = withVersionMetadata({
                id: "TR-W01-analyst-alex-001",
                workflow_id: "W01",
                persona_id: "analyst-alex",
                test_type: "automated",
                date: "2025-01-15",
                status: "passed",
            });
            expect(() => TestResultSchema.parse(testResult)).toThrow();
        });
    });

    describe("status validation", () => {
        it("accepts valid statuses", () => {
            for (const status of ["passed", "failed", "partial"]) {
                const testResult = withVersionMetadata({
                    id: "TR-W01-analyst-alex-001",
                    workflow_id: "W01",
                    persona_id: "analyst-alex",
                    test_type: "simulated",
                    date: "2025-01-15",
                    status,
                });
                expect(() => TestResultSchema.parse(testResult)).not.toThrow();
            }
        });

        it("rejects invalid status", () => {
            const testResult = withVersionMetadata({
                id: "TR-W01-analyst-alex-001",
                workflow_id: "W01",
                persona_id: "analyst-alex",
                test_type: "simulated",
                date: "2025-01-15",
                status: "skipped",
            });
            expect(() => TestResultSchema.parse(testResult)).toThrow();
        });
    });

    describe("confidence validation", () => {
        it("accepts valid confidence levels", () => {
            for (const confidence of ["high", "medium", "low"]) {
                const testResult = withVersionMetadata({
                    id: "TR-W01-analyst-alex-001",
                    workflow_id: "W01",
                    persona_id: "analyst-alex",
                    test_type: "simulated",
                    date: "2025-01-15",
                    status: "passed",
                    confidence,
                });
                expect(() => TestResultSchema.parse(testResult)).not.toThrow();
            }
        });

        it("defaults confidence to medium", () => {
            const testResult = withVersionMetadata({
                id: "TR-W01-analyst-alex-001",
                workflow_id: "W01",
                persona_id: "analyst-alex",
                test_type: "simulated",
                date: "2025-01-15",
                status: "passed",
            });
            const parsed = TestResultSchema.parse(testResult);
            expect(parsed.confidence).toBe("medium");
        });

        it("rejects invalid confidence level", () => {
            const testResult = withVersionMetadata({
                id: "TR-W01-analyst-alex-001",
                workflow_id: "W01",
                persona_id: "analyst-alex",
                test_type: "simulated",
                date: "2025-01-15",
                status: "passed",
                confidence: "very-high",
            });
            expect(() => TestResultSchema.parse(testResult)).toThrow();
        });
    });

    describe("issue severity validation", () => {
        it("accepts valid severity levels", () => {
            for (const severity of ["critical", "major", "minor"]) {
                const testResult = withVersionMetadata({
                    id: "TR-W01-analyst-alex-001",
                    workflow_id: "W01",
                    persona_id: "analyst-alex",
                    test_type: "simulated",
                    date: "2025-01-15",
                    status: "failed",
                    issues: [
                        {
                            severity,
                            description: "Test issue",
                        },
                    ],
                });
                expect(() => TestResultSchema.parse(testResult)).not.toThrow();
            }
        });

        it("rejects invalid severity level", () => {
            const testResult = withVersionMetadata({
                id: "TR-W01-analyst-alex-001",
                workflow_id: "W01",
                persona_id: "analyst-alex",
                test_type: "simulated",
                date: "2025-01-15",
                status: "failed",
                issues: [
                    {
                        severity: "blocker",
                        description: "Test issue",
                    },
                ],
            });
            expect(() => TestResultSchema.parse(testResult)).toThrow();
        });
    });

    describe("success criteria results", () => {
        it("validates success criteria with all fields", () => {
            const testResult = withVersionMetadata({
                id: "TR-W01-analyst-alex-001",
                workflow_id: "W01",
                persona_id: "analyst-alex",
                test_type: "simulated",
                date: "2025-01-15",
                status: "partial",
                success_criteria_results: [
                    {
                        criterion: "Completion rate",
                        target: "> 90%",
                        actual: "85%",
                        passed: false,
                        notes: "Some users struggled",
                    },
                ],
            });
            expect(() => TestResultSchema.parse(testResult)).not.toThrow();
        });

        it("validates success criteria with minimal fields", () => {
            const testResult = withVersionMetadata({
                id: "TR-W01-analyst-alex-001",
                workflow_id: "W01",
                persona_id: "analyst-alex",
                test_type: "simulated",
                date: "2025-01-15",
                status: "passed",
                success_criteria_results: [
                    {
                        criterion: "Task completed",
                        target: "Yes",
                        passed: true,
                    },
                ],
            });
            expect(() => TestResultSchema.parse(testResult)).not.toThrow();
        });

        it("rejects success criteria missing required fields", () => {
            const testResult = withVersionMetadata({
                id: "TR-W01-analyst-alex-001",
                workflow_id: "W01",
                persona_id: "analyst-alex",
                test_type: "simulated",
                date: "2025-01-15",
                status: "passed",
                success_criteria_results: [
                    {
                        criterion: "Task completed",
                        // Missing target and passed
                    },
                ],
            });
            expect(() => TestResultSchema.parse(testResult)).toThrow();
        });
    });

    describe("workflow_id validation", () => {
        it("validates correct workflow_id format", () => {
            const validWorkflowIds = ["W01", "W1", "W99", "W123"];
            for (const workflow_id of validWorkflowIds) {
                const testResult = withVersionMetadata({
                    id: "TR-W01-analyst-alex-001",
                    workflow_id,
                    persona_id: "analyst-alex",
                    test_type: "simulated",
                    date: "2025-01-15",
                    status: "passed",
                });
                expect(() => TestResultSchema.parse(testResult)).not.toThrow();
            }
        });

        it("rejects invalid workflow_id format", () => {
            const invalidWorkflowIds = ["workflow-1", "w01", "W", "01", "WF01"];
            for (const workflow_id of invalidWorkflowIds) {
                const testResult = withVersionMetadata({
                    id: "TR-W01-analyst-alex-001",
                    workflow_id,
                    persona_id: "analyst-alex",
                    test_type: "simulated",
                    date: "2025-01-15",
                    status: "passed",
                });
                expect(() => TestResultSchema.parse(testResult)).toThrow();
            }
        });
    });

    describe("defaults", () => {
        it("defaults arrays to empty", () => {
            const testResult = withVersionMetadata({
                id: "TR-W01-analyst-alex-001",
                workflow_id: "W01",
                persona_id: "analyst-alex",
                test_type: "simulated",
                date: "2025-01-15",
                status: "passed",
            });
            const parsed = TestResultSchema.parse(testResult);
            expect(parsed.success_criteria_results).toEqual([]);
            expect(parsed.issues).toEqual([]);
            expect(parsed.quotes).toEqual([]);
            expect(parsed.recommendations).toEqual([]);
            expect(parsed.sources).toEqual([]);
        });

        it("defaults issue arrays to empty", () => {
            const testResult = withVersionMetadata({
                id: "TR-W01-analyst-alex-001",
                workflow_id: "W01",
                persona_id: "analyst-alex",
                test_type: "simulated",
                date: "2025-01-15",
                status: "failed",
                issues: [
                    {
                        severity: "major",
                        description: "Test issue",
                    },
                ],
            });
            const parsed = TestResultSchema.parse(testResult);
            expect(parsed.issues[0].affected_components).toEqual([]);
            expect(parsed.issues[0].affected_capabilities).toEqual([]);
        });
    });

    describe("missing required fields", () => {
        it("rejects missing id", () => {
            const testResult = withVersionMetadata({
                workflow_id: "W01",
                persona_id: "analyst-alex",
                test_type: "simulated",
                date: "2025-01-15",
                status: "passed",
            });
            expect(() => TestResultSchema.parse(testResult)).toThrow();
        });

        it("rejects missing workflow_id", () => {
            const testResult = withVersionMetadata({
                id: "TR-W01-analyst-alex-001",
                persona_id: "analyst-alex",
                test_type: "simulated",
                date: "2025-01-15",
                status: "passed",
            });
            expect(() => TestResultSchema.parse(testResult)).toThrow();
        });

        it("rejects missing persona_id", () => {
            const testResult = withVersionMetadata({
                id: "TR-W01-analyst-alex-001",
                workflow_id: "W01",
                test_type: "simulated",
                date: "2025-01-15",
                status: "passed",
            });
            expect(() => TestResultSchema.parse(testResult)).toThrow();
        });

        it("rejects missing test_type", () => {
            const testResult = withVersionMetadata({
                id: "TR-W01-analyst-alex-001",
                workflow_id: "W01",
                persona_id: "analyst-alex",
                date: "2025-01-15",
                status: "passed",
            });
            expect(() => TestResultSchema.parse(testResult)).toThrow();
        });

        it("rejects missing date", () => {
            const testResult = withVersionMetadata({
                id: "TR-W01-analyst-alex-001",
                workflow_id: "W01",
                persona_id: "analyst-alex",
                test_type: "simulated",
                status: "passed",
            });
            expect(() => TestResultSchema.parse(testResult)).toThrow();
        });

        it("rejects missing status", () => {
            const testResult = withVersionMetadata({
                id: "TR-W01-analyst-alex-001",
                workflow_id: "W01",
                persona_id: "analyst-alex",
                test_type: "simulated",
                date: "2025-01-15",
            });
            expect(() => TestResultSchema.parse(testResult)).toThrow();
        });
    });
});
