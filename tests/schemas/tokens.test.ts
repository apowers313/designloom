import { describe, it, expect } from "vitest";
import { TokensSchema } from "../../src/schemas/tokens.js";
import { withVersionMetadata } from "../test-helpers.js";

describe("TokensSchema", () => {
    it("validates a complete token set", () => {
        const valid = withVersionMetadata({
            id: "default-theme",
            name: "Default Light Theme",
            colors: {
                primary: {
                    500: "#0066FF",
                    600: "#0052CC",
                },
                neutral: {
                    50: "#F9FAFB",
                    100: "#F3F4F6",
                    500: "#6B7280",
                    700: "#374151",
                    900: "#111827",
                },
                semantic: {
                    text_primary: "{colors.neutral.900}",
                    background: "{colors.neutral.50}",
                },
            },
            typography: {
                fonts: {
                    sans: "Inter, system-ui, sans-serif",
                },
                sizes: {
                    base: "16px",
                    lg: "18px",
                },
                weights: {
                    normal: 400,
                    bold: 700,
                },
                line_heights: {
                    normal: 1.5,
                },
                styles: {
                    body: {
                        font_size: "16px",
                        line_height: 1.5,
                    },
                },
            },
            spacing: {
                scale: {
                    4: "16px",
                    8: "32px",
                },
            },
        });
        expect(() => TokensSchema.parse(valid)).not.toThrow();
    });

    it("validates a minimal token set", () => {
        const minimal = withVersionMetadata({
            id: "minimal-theme",
            name: "Minimal",
            colors: {
                neutral: {
                    500: "#666666",
                },
            },
            typography: {
                fonts: {},
                sizes: {
                    base: "16px",
                },
                weights: {},
                line_heights: {},
                styles: {},
            },
            spacing: {
                scale: {},
            },
        });
        expect(() => TokensSchema.parse(minimal)).not.toThrow();
    });

    it("rejects invalid token ID format", () => {
        const invalid = withVersionMetadata({
            id: "DefaultTheme", // Should be kebab-case
            name: "Default Theme",
            colors: { neutral: { 500: "#666" } },
            typography: { fonts: {}, sizes: { base: "16px" }, weights: {}, line_heights: {}, styles: {} },
            spacing: { scale: {} },
        });
        expect(() => TokensSchema.parse(invalid)).toThrow(/ID must match pattern/);
    });

    it("rejects missing required fields", () => {
        const incomplete = { id: "theme" };
        expect(() => TokensSchema.parse(incomplete)).toThrow();
    });

    it("validates color values in various formats", () => {
        const formats = withVersionMetadata({
            id: "color-formats",
            name: "Color Formats Test",
            colors: {
                neutral: {
                    500: "#666666", // hex
                },
                primary: {
                    500: "rgb(0, 102, 255)",
                },
                secondary: {
                    500: "hsl(220, 100%, 50%)",
                },
                accent: {
                    500: "oklch(0.7 0.15 250)",
                },
            },
            typography: { fonts: {}, sizes: { base: "16px" }, weights: {}, line_heights: {}, styles: {} },
            spacing: { scale: {} },
        });
        expect(() => TokensSchema.parse(formats)).not.toThrow();
    });

    it("validates token references in colors", () => {
        const withRefs = withVersionMetadata({
            id: "ref-theme",
            name: "Reference Theme",
            colors: {
                neutral: { 500: "#666" },
                semantic: {
                    text_primary: "{colors.neutral.900}",
                    interactive: "{colors.primary.500}",
                },
            },
            typography: { fonts: {}, sizes: { base: "16px" }, weights: {}, line_heights: {}, styles: {} },
            spacing: { scale: {} },
        });
        expect(() => TokensSchema.parse(withRefs)).not.toThrow();
    });

    it("validates responsive typography values", () => {
        const responsive = withVersionMetadata({
            id: "responsive-theme",
            name: "Responsive Theme",
            colors: { neutral: { 500: "#666" } },
            typography: {
                fonts: { sans: "Inter, sans-serif" },
                sizes: {
                    base: { base: "14px", md: "16px", lg: "18px" },
                    lg: { min: "18px", max: "24px" },
                },
                weights: { normal: 400 },
                line_heights: { normal: 1.5 },
                styles: {
                    h1: {
                        font_size: { base: "28px", lg: "36px" },
                        font_weight: 700,
                    },
                },
            },
            spacing: { scale: {} },
        });
        expect(() => TokensSchema.parse(responsive)).not.toThrow();
    });

    it("validates motion tokens", () => {
        const withMotion = withVersionMetadata({
            id: "motion-theme",
            name: "Motion Theme",
            colors: { neutral: { 500: "#666" } },
            typography: { fonts: {}, sizes: { base: "16px" }, weights: {}, line_heights: {}, styles: {} },
            spacing: { scale: {} },
            motion: {
                durations: {
                    fast: "150ms",
                    normal: "300ms",
                },
                easings: {
                    ease_out: "cubic-bezier(0, 0, 0.2, 1)",
                },
            },
        });
        expect(() => TokensSchema.parse(withMotion)).not.toThrow();
    });

    it("validates breakpoints", () => {
        const withBreakpoints = withVersionMetadata({
            id: "breakpoint-theme",
            name: "Breakpoint Theme",
            colors: { neutral: { 500: "#666" } },
            typography: { fonts: {}, sizes: { base: "16px" }, weights: {}, line_heights: {}, styles: {} },
            spacing: { scale: {} },
            breakpoints: {
                sm: "640px",
                md: "768px",
                lg: "1024px",
            },
        });
        expect(() => TokensSchema.parse(withBreakpoints)).not.toThrow();
    });

    it("validates z-index scale", () => {
        const withZIndex = withVersionMetadata({
            id: "zindex-theme",
            name: "Z-Index Theme",
            colors: { neutral: { 500: "#666" } },
            typography: { fonts: {}, sizes: { base: "16px" }, weights: {}, line_heights: {}, styles: {} },
            spacing: { scale: {} },
            z_index: {
                dropdown: 1000,
                modal: 1400,
                tooltip: 1600,
            },
        });
        expect(() => TokensSchema.parse(withZIndex)).not.toThrow();
    });

    it("validates extends field", () => {
        const extending = withVersionMetadata({
            id: "dark-theme",
            name: "Dark Theme",
            extends: "default-theme",
            colors: { neutral: { 500: "#999" } },
            typography: { fonts: {}, sizes: { base: "16px" }, weights: {}, line_heights: {}, styles: {} },
            spacing: { scale: {} },
        });
        expect(() => TokensSchema.parse(extending)).not.toThrow();
    });

    it("validates shadows", () => {
        const withShadows = withVersionMetadata({
            id: "shadow-theme",
            name: "Shadow Theme",
            colors: { neutral: { 500: "#666" } },
            typography: { fonts: {}, sizes: { base: "16px" }, weights: {}, line_heights: {}, styles: {} },
            spacing: { scale: {} },
            shadows: {
                sm: "0 1px 2px rgba(0,0,0,0.05)",
                md: "0 4px 6px rgba(0,0,0,0.1)",
            },
        });
        expect(() => TokensSchema.parse(withShadows)).not.toThrow();
    });

    it("validates radii", () => {
        const withRadii = withVersionMetadata({
            id: "radii-theme",
            name: "Radii Theme",
            colors: { neutral: { 500: "#666" } },
            typography: { fonts: {}, sizes: { base: "16px" }, weights: {}, line_heights: {}, styles: {} },
            spacing: { scale: {} },
            radii: {
                sm: "4px",
                md: "8px",
                full: "9999px",
            },
        });
        expect(() => TokensSchema.parse(withRadii)).not.toThrow();
    });

    it("validates feedback colors", () => {
        const withFeedback = withVersionMetadata({
            id: "feedback-theme",
            name: "Feedback Theme",
            colors: {
                neutral: { 500: "#666" },
                success: {
                    base: "#22C55E",
                    light: "#DCFCE7",
                    contrast: "#FFFFFF",
                },
                error: {
                    base: "#EF4444",
                    light: "#FEE2E2",
                },
            },
            typography: { fonts: {}, sizes: { base: "16px" }, weights: {}, line_heights: {}, styles: {} },
            spacing: { scale: {} },
        });
        expect(() => TokensSchema.parse(withFeedback)).not.toThrow();
    });

    it("validates sources array", () => {
        const withSources = withVersionMetadata({
            id: "documented-theme",
            name: "Documented Theme",
            colors: { neutral: { 500: "#666" } },
            typography: { fonts: {}, sizes: { base: "16px" }, weights: {}, line_heights: {}, styles: {} },
            spacing: { scale: {} },
            sources: [
                {
                    title: "Brand Guidelines",
                    url: "https://brand.example.com",
                    summary: "Official brand colors",
                },
            ],
        });
        expect(() => TokensSchema.parse(withSources)).not.toThrow();
    });

    it("rejects invalid color format", () => {
        const invalidColor = withVersionMetadata({
            id: "invalid-color",
            name: "Invalid Color",
            colors: {
                neutral: {
                    500: "not-a-color", // Invalid
                },
            },
            typography: { fonts: {}, sizes: { base: "16px" }, weights: {}, line_heights: {}, styles: {} },
            spacing: { scale: {} },
        });
        expect(() => TokensSchema.parse(invalidColor)).toThrow();
    });
});
