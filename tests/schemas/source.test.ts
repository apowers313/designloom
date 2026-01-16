import { describe, expect, it } from "vitest";

import { SourceSchema } from "../../src/schemas/source.js";

describe("SourceSchema", () => {
    it("validates a complete source with all fields", () => {
        const valid = {
            title: "Design System Guidelines",
            url: "https://example.com/design-guidelines",
            summary: "Comprehensive design guidelines for component development",
            bibliography: {
                author: "Jane Doe",
                date: "2024-01-15",
                publisher: "Design Co",
                version: "2.0",
            },
        };
        expect(() => SourceSchema.parse(valid)).not.toThrow();
    });

    it("validates a minimal source with only required fields", () => {
        const minimal = {
            title: "API Documentation",
            url: "https://api.example.com/docs",
        };
        expect(() => SourceSchema.parse(minimal)).not.toThrow();
    });

    it("validates a source with optional summary but no bibliography", () => {
        const withSummary = {
            title: "Research Paper",
            url: "https://arxiv.org/paper/12345",
            summary: "This paper discusses graph visualization techniques",
        };
        expect(() => SourceSchema.parse(withSummary)).not.toThrow();
    });

    it("validates a source with partial bibliography", () => {
        const partialBiblio = {
            title: "User Research Report",
            url: "https://research.example.com/report",
            bibliography: {
                author: "Research Team",
                date: "2024-06-01",
            },
        };
        expect(() => SourceSchema.parse(partialBiblio)).not.toThrow();
    });

    it("rejects source missing title", () => {
        const noTitle = {
            url: "https://example.com/page",
        };
        expect(() => SourceSchema.parse(noTitle)).toThrow();
    });

    it("rejects source missing url", () => {
        const noUrl = {
            title: "Some Title",
        };
        expect(() => SourceSchema.parse(noUrl)).toThrow();
    });

    it("rejects source with empty title", () => {
        const emptyTitle = {
            title: "",
            url: "https://example.com/page",
        };
        expect(() => SourceSchema.parse(emptyTitle)).toThrow();
    });

    it("rejects source with invalid url", () => {
        const invalidUrl = {
            title: "Some Title",
            url: "not-a-valid-url",
        };
        expect(() => SourceSchema.parse(invalidUrl)).toThrow();
    });

    it("validates various valid URL formats", () => {
        const urls = [
            "https://example.com",
            "https://example.com/path/to/page",
            "https://example.com/page?query=value",
            "https://sub.domain.example.com/path",
            "http://localhost:3000/docs",
        ];

        for (const url of urls) {
            const source = { title: "Test", url };
            expect(() => SourceSchema.parse(source)).not.toThrow();
        }
    });

    it("validates bibliography with only version", () => {
        const versionOnly = {
            title: "Software Documentation",
            url: "https://docs.example.com",
            bibliography: {
                version: "1.0.0",
            },
        };
        expect(() => SourceSchema.parse(versionOnly)).not.toThrow();
    });
});
