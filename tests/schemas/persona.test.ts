import { describe, it, expect } from "vitest";
import { PersonaSchema } from "../../src/schemas/persona.js";

describe("PersonaSchema", () => {
    it("validates a correct persona", () => {
        const valid = {
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
        };
        expect(() => PersonaSchema.parse(valid)).not.toThrow();
    });

    it("validates a minimal persona", () => {
        const minimal = {
            id: "test-user",
            name: "Test User",
            role: "Tester",
            characteristics: {
                expertise: "novice",
            },
            goals: ["Test the system"],
        };
        expect(() => PersonaSchema.parse(minimal)).not.toThrow();
    });

    it("rejects invalid persona ID format", () => {
        const invalid = {
            id: "AnalystAlex", // Should be kebab-case
            name: "Analyst Alex",
            role: "Analyst",
            characteristics: { expertise: "intermediate" },
            goals: ["Test"],
        };
        expect(() => PersonaSchema.parse(invalid)).toThrow(/ID must match pattern/);
    });

    it("rejects missing required fields", () => {
        const incomplete = { id: "test-user" };
        expect(() => PersonaSchema.parse(incomplete)).toThrow();
    });

    it("validates all expertise levels", () => {
        const levels = ["novice", "intermediate", "expert"];
        for (const expertise of levels) {
            const persona = {
                id: "test-user",
                name: "Test",
                role: "Tester",
                characteristics: { expertise },
                goals: ["Test"],
            };
            expect(() => PersonaSchema.parse(persona)).not.toThrow();
        }
    });

    it("rejects invalid expertise level", () => {
        const invalid = {
            id: "test-user",
            name: "Test",
            role: "Tester",
            characteristics: { expertise: "god-tier" },
            goals: ["Test"],
        };
        expect(() => PersonaSchema.parse(invalid)).toThrow();
    });

    it("validates persona with all optional fields", () => {
        const full = {
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
        };
        expect(() => PersonaSchema.parse(full)).not.toThrow();
    });
});
