import { describe, it, expect } from "vitest";
import { PersonaSchema } from "../../src/schemas/persona.js";
import { withVersionMetadata } from "../test-helpers.js";

describe("PersonaSchema", () => {
    it("validates a correct persona", () => {
        const valid = withVersionMetadata({
            id: "analyst-alex",
            name: "Analyst Alex",
            role: "Financial Analyst",
            characteristics: {
                expertise: "intermediate",
                time_pressure: "high",
                graph_literacy: "basic",
                domain_knowledge: "advanced",
            },
            goals: [
                "Identify anomalies in transaction data",
                "Generate reports for compliance team",
            ],
            frustrations: [
                "Tools that require programming knowledge",
                "Slow response times on large datasets",
            ],
            workflows: ["W01", "W07"],
        });
        expect(() => PersonaSchema.parse(valid)).not.toThrow();
    });

    it("validates a minimal persona", () => {
        const minimal = withVersionMetadata({
            id: "test-user",
            name: "Test User",
            role: "Tester",
            characteristics: {
                expertise: "novice",
            },
            goals: ["Test the system"],
        });
        expect(() => PersonaSchema.parse(minimal)).not.toThrow();
    });

    it("rejects invalid persona ID format", () => {
        const invalid = withVersionMetadata({
            id: "AnalystAlex", // Should be kebab-case
            name: "Analyst Alex",
            role: "Analyst",
            characteristics: { expertise: "intermediate" },
            goals: ["Test"],
        });
        expect(() => PersonaSchema.parse(invalid)).toThrow(/ID must match pattern/);
    });

    it("rejects missing required fields", () => {
        const incomplete = { id: "test-user" };
        expect(() => PersonaSchema.parse(incomplete)).toThrow();
    });

    it("validates all expertise levels", () => {
        const levels = ["novice", "intermediate", "expert"];
        for (const expertise of levels) {
            const persona = withVersionMetadata({
                id: "test-user",
                name: "Test",
                role: "Tester",
                characteristics: { expertise },
                goals: ["Test"],
            });
            expect(() => PersonaSchema.parse(persona)).not.toThrow();
        }
    });

    it("rejects invalid expertise level", () => {
        const invalid = withVersionMetadata({
            id: "test-user",
            name: "Test",
            role: "Tester",
            characteristics: { expertise: "god-tier" },
            goals: ["Test"],
        });
        expect(() => PersonaSchema.parse(invalid)).toThrow();
    });

    it("validates persona with all optional fields", () => {
        const full = withVersionMetadata({
            id: "power-user",
            name: "Power User",
            role: "Data Scientist",
            characteristics: {
                expertise: "expert",
                time_pressure: "low",
                graph_literacy: "advanced",
                domain_knowledge: "expert",
            },
            goals: ["Analyze complex networks", "Train ML models"],
            frustrations: ["Limited API access", "No batch processing"],
            workflows: ["W01", "W02", "W03"],
        });
        expect(() => PersonaSchema.parse(full)).not.toThrow();
    });

    it("validates persona with sources", () => {
        const withSources = withVersionMetadata({
            id: "researched-persona",
            name: "Researched Persona",
            role: "Product Manager",
            characteristics: {
                expertise: "intermediate",
            },
            goals: ["Understand user needs"],
            sources: [
                {
                    title: "User Interview Transcript #1",
                    url: "https://drive.example.com/interview-1",
                    summary: "Interview with enterprise PM about workflow needs",
                },
                {
                    title: "Industry Survey Results",
                    url: "https://example.com/survey-2024",
                    bibliography: {
                        author: "Market Research Inc",
                        date: "2024-03-15",
                    },
                },
            ],
        });
        expect(() => PersonaSchema.parse(withSources)).not.toThrow();
    });

    it("validates persona with empty sources array", () => {
        const emptySources = withVersionMetadata({
            id: "no-sources-persona",
            name: "Persona without Sources",
            role: "Generic User",
            characteristics: {
                expertise: "novice",
            },
            goals: ["Use the product"],
            sources: [],
        });
        expect(() => PersonaSchema.parse(emptySources)).not.toThrow();
    });

    it("validates persona with quote field", () => {
        const withQuote = withVersionMetadata({
            id: "analyst-alex",
            name: "Analyst Alex",
            role: "Fraud Analyst",
            quote: "I need to see the connections, not just the data points.",
            characteristics: {
                expertise: "expert",
            },
            goals: ["Identify fraud patterns quickly"],
        });
        const result = PersonaSchema.parse(withQuote);
        expect(result.quote).toBe("I need to see the connections, not just the data points.");
    });

    it("validates persona with bio field", () => {
        const withBio = withVersionMetadata({
            id: "analyst-alex",
            name: "Analyst Alex",
            role: "Fraud Analyst",
            bio: "Sarah has been a fraud analyst for 5 years. She started in rule-based detection but now focuses on graph-based investigation.",
            characteristics: {
                expertise: "expert",
            },
            goals: ["Identify fraud patterns quickly"],
        });
        const result = PersonaSchema.parse(withBio);
        expect(result.bio).toContain("fraud analyst for 5 years");
    });

    it("validates persona with motivations array", () => {
        const withMotivations = withVersionMetadata({
            id: "analyst-alex",
            name: "Analyst Alex",
            role: "Fraud Analyst",
            characteristics: {
                expertise: "expert",
            },
            goals: ["Identify fraud patterns quickly"],
            motivations: [
                "Protect the company from financial loss",
                "Advance career through successful investigations",
            ],
        });
        const result = PersonaSchema.parse(withMotivations);
        expect(result.motivations).toHaveLength(2);
        expect(result.motivations).toContain("Protect the company from financial loss");
    });

    it("validates persona with behaviors array", () => {
        const withBehaviors = withVersionMetadata({
            id: "analyst-alex",
            name: "Analyst Alex",
            role: "Fraud Analyst",
            characteristics: {
                expertise: "expert",
            },
            goals: ["Identify fraud patterns quickly"],
            behaviors: [
                "Uses Neo4j and Palantir daily",
                "Prefers keyboard shortcuts over mouse",
                "Works with 50+ alerts per day",
            ],
        });
        const result = PersonaSchema.parse(withBehaviors);
        expect(result.behaviors).toHaveLength(3);
        expect(result.behaviors).toContain("Prefers keyboard shortcuts over mouse");
    });

    it("validates persona with full context object", () => {
        const withContext = withVersionMetadata({
            id: "analyst-alex",
            name: "Analyst Alex",
            role: "Fraud Analyst",
            characteristics: {
                expertise: "expert",
            },
            goals: ["Identify fraud patterns quickly"],
            context: {
                frequency: "daily",
                devices: ["desktop", "laptop"],
                voluntary: false,
            },
        });
        const result = PersonaSchema.parse(withContext);
        expect(result.context?.frequency).toBe("daily");
        expect(result.context?.devices).toEqual(["desktop", "laptop"]);
        expect(result.context?.voluntary).toBe(false);
    });

    it("validates persona with partial context object", () => {
        const withPartialContext = withVersionMetadata({
            id: "casual-user",
            name: "Casual User",
            role: "Occasional User",
            characteristics: {
                expertise: "novice",
            },
            goals: ["Browse reports occasionally"],
            context: {
                frequency: "as-needed",
            },
        });
        const result = PersonaSchema.parse(withPartialContext);
        expect(result.context?.frequency).toBe("as-needed");
        expect(result.context?.devices).toBeUndefined();
        expect(result.context?.voluntary).toBeUndefined();
    });

    it("validates all frequency options", () => {
        const frequencies = ["daily", "weekly", "monthly", "as-needed"];
        for (const frequency of frequencies) {
            const persona = withVersionMetadata({
                id: "test-user",
                name: "Test",
                role: "Tester",
                characteristics: { expertise: "novice" },
                goals: ["Test"],
                context: { frequency },
            });
            expect(() => PersonaSchema.parse(persona)).not.toThrow();
        }
    });

    it("validates all device options", () => {
        const devices = ["desktop", "laptop", "tablet", "mobile"];
        for (const device of devices) {
            const persona = withVersionMetadata({
                id: "test-user",
                name: "Test",
                role: "Tester",
                characteristics: { expertise: "novice" },
                goals: ["Test"],
                context: { devices: [device] },
            });
            expect(() => PersonaSchema.parse(persona)).not.toThrow();
        }
    });

    it("rejects invalid frequency value", () => {
        const invalid = withVersionMetadata({
            id: "test-user",
            name: "Test",
            role: "Tester",
            characteristics: { expertise: "novice" },
            goals: ["Test"],
            context: { frequency: "hourly" },
        });
        expect(() => PersonaSchema.parse(invalid)).toThrow();
    });

    it("rejects invalid device value", () => {
        const invalid = withVersionMetadata({
            id: "test-user",
            name: "Test",
            role: "Tester",
            characteristics: { expertise: "novice" },
            goals: ["Test"],
            context: { devices: ["smartwatch"] },
        });
        expect(() => PersonaSchema.parse(invalid)).toThrow();
    });

    it("validates comprehensive persona with all UX fields", () => {
        const comprehensive = withVersionMetadata({
            id: "fraud-analyst-sarah",
            name: "Sarah Chen",
            role: "Senior Fraud Analyst",
            quote: "I need to see the connections, not just the data points.",
            bio: "Sarah has been a fraud analyst for 5 years. She started in rule-based detection but now focuses on graph-based investigation. She's frustrated by tools that can't keep up with her expertise.",
            characteristics: {
                expertise: "expert",
                time_pressure: "high",
                graph_literacy: "advanced",
                domain_knowledge: "expert",
            },
            motivations: [
                "Protect the company from financial loss",
                "Advance career through successful investigations",
                "Stay ahead of evolving fraud tactics",
            ],
            behaviors: [
                "Uses Neo4j and Palantir daily",
                "Prefers keyboard shortcuts over mouse",
                "Works with 50+ alerts per day",
                "Documents investigation patterns for team",
            ],
            goals: [
                "Identify fraud patterns quickly",
                "Reduce false positives",
                "Train junior analysts",
            ],
            frustrations: [
                "Tools that require constant context switching",
                "Slow query response times on large datasets",
                "Lack of collaboration features",
            ],
            context: {
                frequency: "daily",
                devices: ["desktop", "laptop"],
                voluntary: false,
            },
            workflows: ["W01", "W02", "W07"],
            sources: [
                {
                    title: "User Interview - Sarah Chen",
                    url: "https://drive.example.com/interview-sarah",
                    summary: "45-minute interview covering daily workflow and pain points",
                },
            ],
        });
        const result = PersonaSchema.parse(comprehensive);
        expect(result.id).toBe("fraud-analyst-sarah");
        expect(result.quote).toBeDefined();
        expect(result.bio).toBeDefined();
        expect(result.motivations).toHaveLength(3);
        expect(result.behaviors).toHaveLength(4);
        expect(result.context?.frequency).toBe("daily");
    });

    it("defaults motivations and behaviors to empty arrays", () => {
        const minimal = withVersionMetadata({
            id: "test-user",
            name: "Test",
            role: "Tester",
            characteristics: { expertise: "novice" },
            goals: ["Test"],
        });
        const result = PersonaSchema.parse(minimal);
        expect(result.motivations).toEqual([]);
        expect(result.behaviors).toEqual([]);
    });
});
