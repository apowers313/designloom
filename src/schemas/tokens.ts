/* eslint-disable camelcase -- snake_case matches YAML field names for serialization */
import { z } from "zod";

import { SourceSchema, VersionMetadataSchema } from "./source.js";

/**
 * Tokens ID pattern: kebab-case (e.g., default-theme, dark-mode)
 */
const TokensIdSchema = z
    .string()
    .regex(/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/, "ID must match pattern kebab-case (e.g., default-theme)");

/**
 * =============================================================================
 * RESPONSIVE VALUE SCHEMA
 * =============================================================================
 * Values can be simple strings OR responsive objects with breakpoint overrides.
 * This enables fluid, responsive design without hardcoded pixel assumptions.
 *
 * Claude Code uses this to generate:
 * - CSS custom properties with media queries
 * - Tailwind responsive utilities
 * - CSS clamp() for fluid values
 */

/**
 * Breakpoint names - follows common convention
 * Claude Code maps these to media queries:
 *   sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px
 */
const BreakpointKeySchema = z.enum(["base", "sm", "md", "lg", "xl", "2xl"]);

/**
 * A responsive value can be:
 * 1. A simple string: "16px"
 * 2. An object with breakpoint overrides: { base: "14px", md: "16px", lg: "18px" }
 * 3. A fluid clamp value: { min: "14px", max: "18px", preferred: "4vw" }
 */
const FluidValueSchema = z.object({
    min: z.string(),
    max: z.string(),
    preferred: z.string().optional(), // If omitted, calculated from min/max
});

const BreakpointValueSchema = z.record(BreakpointKeySchema, z.string());

const ResponsiveValueSchema = z.union([
    z.string(),
    BreakpointValueSchema,
    FluidValueSchema,
]);

/**
 * =============================================================================
 * COLOR SCHEMAS
 * =============================================================================
 * Colors are the foundation of visual identity. Claude Code needs:
 * - Exact color values (hex, rgb, hsl, oklch)
 * - Semantic meaning (what is this color FOR?)
 * - Scale relationships (50-950 for generating hover/active states)
 */

/**
 * Color value - supports modern color spaces per DTCG spec
 * Claude Code uses this to generate CSS custom properties
 */
const ColorValueSchema = z.string().refine(
    (val) => {
        // Accept hex, rgb, hsl, oklch, or token reference
        return /^(#[0-9A-Fa-f]{3,8}|rgba?\(|hsla?\(|oklch\(|lab\(|lch\(|\{.*\})/.test(val) || val.startsWith("{");
    },
    { message: "Color must be hex (#fff), rgb(), hsl(), oklch(), or token reference ({color.x})" }
);

/**
 * Color scale - a range of shades from light to dark
 * Standard scale: 50 (lightest) to 950 (darkest), 500 is base
 *
 * Claude Code uses scales to:
 * - Generate hover states (e.g., primary-500 -> primary-600 on hover)
 * - Create accessible text/background combinations
 * - Build dark mode variants
 */
const ColorScaleSchema = z.object({
    50: ColorValueSchema.optional(),
    100: ColorValueSchema.optional(),
    200: ColorValueSchema.optional(),
    300: ColorValueSchema.optional(),
    400: ColorValueSchema.optional(),
    500: ColorValueSchema, // Base color - required
    600: ColorValueSchema.optional(),
    700: ColorValueSchema.optional(),
    800: ColorValueSchema.optional(),
    900: ColorValueSchema.optional(),
    950: ColorValueSchema.optional(),
});

/**
 * Semantic color assignment - maps purpose to color
 * This is critical for Claude Code to understand WHEN to use each color
 */
const SemanticColorsSchema = z.object({
    // Backgrounds
    background: ColorValueSchema.optional().describe("Page/app background"),
    surface: ColorValueSchema.optional().describe("Card/panel background"),
    surface_elevated: ColorValueSchema.optional().describe("Modal/popover background"),

    // Text
    text_primary: ColorValueSchema.optional().describe("Main body text"),
    text_secondary: ColorValueSchema.optional().describe("Secondary/muted text"),
    text_disabled: ColorValueSchema.optional().describe("Disabled text"),
    text_inverse: ColorValueSchema.optional().describe("Text on dark backgrounds"),

    // Borders
    border_default: ColorValueSchema.optional().describe("Default border color"),
    border_subtle: ColorValueSchema.optional().describe("Subtle dividers"),
    border_strong: ColorValueSchema.optional().describe("Emphasized borders"),

    // Interactive
    interactive: ColorValueSchema.optional().describe("Links, clickable elements"),
    interactive_hover: ColorValueSchema.optional().describe("Hover state"),
    interactive_active: ColorValueSchema.optional().describe("Active/pressed state"),

    // Focus (accessibility)
    focus_ring: ColorValueSchema.optional().describe("Focus indicator color"),
});

/**
 * Feedback/status colors with full state support
 */
const FeedbackColorSchema = z.object({
    base: ColorValueSchema.describe("Primary feedback color"),
    light: ColorValueSchema.optional().describe("Light variant for backgrounds"),
    dark: ColorValueSchema.optional().describe("Dark variant for text/icons"),
    contrast: ColorValueSchema.optional().describe("Text color on base background"),
});

/**
 * Complete color system
 */
const ColorsSchema = z.object({
    // Brand colors (scales)
    primary: ColorScaleSchema.optional(),
    secondary: ColorScaleSchema.optional(),
    accent: ColorScaleSchema.optional(),

    // Neutral grays (required for any UI)
    neutral: ColorScaleSchema,

    // Semantic/feedback colors
    success: FeedbackColorSchema.optional(),
    warning: FeedbackColorSchema.optional(),
    error: FeedbackColorSchema.optional(),
    info: FeedbackColorSchema.optional(),

    // Semantic assignments
    semantic: SemanticColorsSchema.optional(),

    // Allow additional custom color scales
}).catchall(ColorScaleSchema);

/**
 * =============================================================================
 * TYPOGRAPHY SCHEMAS
 * =============================================================================
 * Typography defines the voice of the UI. Claude Code needs:
 * - Font families with fallbacks
 * - Size scale (preferably relative/fluid)
 * - Weight variations
 * - Line heights for readability
 * - Composite text styles (heading, body, caption)
 */

/**
 * Font family with system fallbacks
 * Claude Code uses this to generate font-family CSS
 */
const FontFamilySchema = z.string().describe(
    "Font family stack, e.g., 'Inter, system-ui, sans-serif'"
);

/**
 * Font weight - numeric values
 */
const FontWeightSchema = z.union([
    z.literal(100),
    z.literal(200),
    z.literal(300),
    z.literal(400),
    z.literal(500),
    z.literal(600),
    z.literal(700),
    z.literal(800),
    z.literal(900),
    z.string(), // Allow "normal", "bold", or token reference
]);

/**
 * Complete text style definition
 * Claude Code uses these to generate utility classes or component styles
 */
const TextStyleSchema = z.object({
    font_family: z.string().optional().describe("Font family reference or value"),
    font_size: ResponsiveValueSchema.describe("Font size, can be responsive"),
    font_weight: FontWeightSchema.optional(),
    line_height: z.union([z.string(), z.number()]).optional(),
    letter_spacing: z.string().optional(),
    text_transform: z.enum(["none", "uppercase", "lowercase", "capitalize"]).optional(),
});

/**
 * Typography system
 */
const TypographySchema = z.object({
    // Font families
    fonts: z.object({
        sans: FontFamilySchema.optional(),
        serif: FontFamilySchema.optional(),
        mono: FontFamilySchema.optional(),
    }).catchall(FontFamilySchema),

    // Size scale - use semantic names
    sizes: z.object({
        xs: ResponsiveValueSchema.optional(),
        sm: ResponsiveValueSchema.optional(),
        base: ResponsiveValueSchema, // Required - base font size
        lg: ResponsiveValueSchema.optional(),
        xl: ResponsiveValueSchema.optional(),
        "2xl": ResponsiveValueSchema.optional(),
        "3xl": ResponsiveValueSchema.optional(),
        "4xl": ResponsiveValueSchema.optional(),
        "5xl": ResponsiveValueSchema.optional(),
        "6xl": ResponsiveValueSchema.optional(),
    }).catchall(ResponsiveValueSchema),

    // Weight scale
    weights: z.object({
        thin: FontWeightSchema.optional(),
        light: FontWeightSchema.optional(),
        normal: FontWeightSchema.optional(),
        medium: FontWeightSchema.optional(),
        semibold: FontWeightSchema.optional(),
        bold: FontWeightSchema.optional(),
        extrabold: FontWeightSchema.optional(),
        black: FontWeightSchema.optional(),
    }).catchall(FontWeightSchema),

    // Line height scale
    line_heights: z.object({
        none: z.union([z.string(), z.number()]).optional(),
        tight: z.union([z.string(), z.number()]).optional(),
        snug: z.union([z.string(), z.number()]).optional(),
        normal: z.union([z.string(), z.number()]).optional(),
        relaxed: z.union([z.string(), z.number()]).optional(),
        loose: z.union([z.string(), z.number()]).optional(),
    }).catchall(z.union([z.string(), z.number()])),

    // Composite text styles - what Claude Code uses most often
    styles: z.object({
        h1: TextStyleSchema.optional(),
        h2: TextStyleSchema.optional(),
        h3: TextStyleSchema.optional(),
        h4: TextStyleSchema.optional(),
        h5: TextStyleSchema.optional(),
        h6: TextStyleSchema.optional(),
        body: TextStyleSchema.optional(),
        body_large: TextStyleSchema.optional(),
        body_small: TextStyleSchema.optional(),
        caption: TextStyleSchema.optional(),
        label: TextStyleSchema.optional(),
        code: TextStyleSchema.optional(),
    }).catchall(TextStyleSchema),
});

/**
 * =============================================================================
 * SPACING SCHEMA
 * =============================================================================
 * Consistent spacing creates visual rhythm. Claude Code needs:
 * - A scale of spacing values
 * - Semantic spacing for common use cases
 */

const SpacingScaleSchema = z.object({
    0: z.string().optional(),
    px: z.string().optional(), // 1px
    0.5: z.string().optional(),
    1: z.string().optional(),
    1.5: z.string().optional(),
    2: z.string().optional(),
    2.5: z.string().optional(),
    3: z.string().optional(),
    3.5: z.string().optional(),
    4: z.string().optional(),
    5: z.string().optional(),
    6: z.string().optional(),
    7: z.string().optional(),
    8: z.string().optional(),
    9: z.string().optional(),
    10: z.string().optional(),
    11: z.string().optional(),
    12: z.string().optional(),
    14: z.string().optional(),
    16: z.string().optional(),
    20: z.string().optional(),
    24: z.string().optional(),
    28: z.string().optional(),
    32: z.string().optional(),
    36: z.string().optional(),
    40: z.string().optional(),
    44: z.string().optional(),
    48: z.string().optional(),
    52: z.string().optional(),
    56: z.string().optional(),
    60: z.string().optional(),
    64: z.string().optional(),
    72: z.string().optional(),
    80: z.string().optional(),
    96: z.string().optional(),
}).catchall(z.string());

const SemanticSpacingSchema = z.object({
    // Component internal spacing
    component_padding_xs: ResponsiveValueSchema.optional(),
    component_padding_sm: ResponsiveValueSchema.optional(),
    component_padding_md: ResponsiveValueSchema.optional(),
    component_padding_lg: ResponsiveValueSchema.optional(),

    // Gaps between elements
    gap_xs: ResponsiveValueSchema.optional(),
    gap_sm: ResponsiveValueSchema.optional(),
    gap_md: ResponsiveValueSchema.optional(),
    gap_lg: ResponsiveValueSchema.optional(),
    gap_xl: ResponsiveValueSchema.optional(),

    // Section/layout spacing
    section_gap: ResponsiveValueSchema.optional(),
    page_margin: ResponsiveValueSchema.optional(),
    page_padding: ResponsiveValueSchema.optional(),

    // Specific component spacing
    header_height: ResponsiveValueSchema.optional(),
    sidebar_width: ResponsiveValueSchema.optional(),
    footer_height: ResponsiveValueSchema.optional(),
}).catchall(ResponsiveValueSchema);

const SpacingSchema = z.object({
    scale: SpacingScaleSchema,
    semantic: SemanticSpacingSchema.optional(),
});

/**
 * =============================================================================
 * EFFECTS SCHEMAS
 * =============================================================================
 * Visual effects add depth and polish. Claude Code needs:
 * - Border radii for consistent roundness
 * - Shadows for elevation/depth
 * - Border styles
 */

const RadiiSchema = z.object({
    none: z.string().optional(),
    sm: z.string().optional(),
    md: z.string().optional(),
    lg: z.string().optional(),
    xl: z.string().optional(),
    "2xl": z.string().optional(),
    "3xl": z.string().optional(),
    full: z.string().optional(), // 9999px for pills
}).catchall(z.string());

/**
 * Shadow definition
 * Claude Code uses these for elevation systems (Material-style)
 */
const ShadowSchema = z.string().describe(
    "CSS box-shadow value, e.g., '0 4px 6px rgba(0,0,0,0.1)'"
);

const ShadowsSchema = z.object({
    none: ShadowSchema.optional(),
    sm: ShadowSchema.optional(),
    md: ShadowSchema.optional(),
    lg: ShadowSchema.optional(),
    xl: ShadowSchema.optional(),
    "2xl": ShadowSchema.optional(),
    inner: ShadowSchema.optional(),
}).catchall(ShadowSchema);

const BordersSchema = z.object({
    widths: z.object({
        none: z.string().optional(),
        thin: z.string().optional(),
        default: z.string().optional(),
        thick: z.string().optional(),
    }).catchall(z.string()),

    styles: z.object({
        solid: z.literal("solid").optional(),
        dashed: z.literal("dashed").optional(),
        dotted: z.literal("dotted").optional(),
    }).optional(),
});

/**
 * =============================================================================
 * MOTION/ANIMATION SCHEMA
 * =============================================================================
 * Motion brings interfaces to life. Claude Code needs:
 * - Duration values for consistency
 * - Easing curves for natural feel
 * - Named animations for common patterns
 */

const MotionSchema = z.object({
    // Durations
    durations: z.object({
        instant: z.string().optional(), // 0ms
        fast: z.string().optional(),    // 100-150ms
        normal: z.string().optional(),  // 200-300ms
        slow: z.string().optional(),    // 400-500ms
        slower: z.string().optional(),  // 600-800ms
    }).catchall(z.string()),

    // Easing curves
    easings: z.object({
        linear: z.string().optional(),
        ease_in: z.string().optional(),
        ease_out: z.string().optional(),
        ease_in_out: z.string().optional(),
        // Spring-like
        bounce: z.string().optional(),
        elastic: z.string().optional(),
    }).catchall(z.string()),

    // Named transitions (composite duration + easing)
    transitions: z.object({
        default: z.string().optional(),     // Standard transition
        colors: z.string().optional(),      // Color changes
        opacity: z.string().optional(),     // Fade in/out
        transform: z.string().optional(),   // Scale, rotate, translate
        dimensions: z.string().optional(),  // Width, height changes
    }).catchall(z.string()).optional(),
});

/**
 * =============================================================================
 * BREAKPOINTS SCHEMA
 * =============================================================================
 * Responsive design requires consistent breakpoints.
 * Claude Code uses these to generate media queries.
 */

const BreakpointsSchema = z.object({
    sm: z.string().optional(),   // Mobile landscape / large phones
    md: z.string().optional(),   // Tablets
    lg: z.string().optional(),   // Desktop
    xl: z.string().optional(),   // Large desktop
    "2xl": z.string().optional(), // Extra large
}).catchall(z.string());

/**
 * =============================================================================
 * Z-INDEX SCHEMA
 * =============================================================================
 * Stacking order for layered UI. Prevents z-index wars.
 */

const ZIndexSchema = z.object({
    hide: z.number().optional(),      // -1
    base: z.number().optional(),      // 0
    dropdown: z.number().optional(),  // 1000
    sticky: z.number().optional(),    // 1100
    fixed: z.number().optional(),     // 1200
    modal_backdrop: z.number().optional(), // 1300
    modal: z.number().optional(),     // 1400
    popover: z.number().optional(),   // 1500
    tooltip: z.number().optional(),   // 1600
    toast: z.number().optional(),     // 1700
}).catchall(z.number());

/**
 * =============================================================================
 * MAIN TOKENS SCHEMA
 * =============================================================================
 * Complete design tokens definition.
 *
 * This schema is designed to be:
 * 1. DTCG-compatible where possible
 * 2. Comprehensive enough for Claude Code to generate full implementations
 * 3. Flexible enough to accommodate different design philosophies
 */
export const TokensSchema = z.object({
    id: TokensIdSchema,
    name: z.string().min(1).describe("Human-readable theme name"),
    description: z.string().optional(),

    // Inheritance - extend another token set (e.g., dark mode extends default)
    extends: TokensIdSchema.optional().describe("ID of parent token set to extend"),

    // Core token categories
    colors: ColorsSchema,
    typography: TypographySchema,
    spacing: SpacingSchema,

    // Effects
    radii: RadiiSchema.optional(),
    shadows: ShadowsSchema.optional(),
    borders: BordersSchema.optional(),

    // Motion
    motion: MotionSchema.optional(),

    // Layout
    breakpoints: BreakpointsSchema.optional(),
    z_index: ZIndexSchema.optional(),

    // Metadata
    sources: z.array(SourceSchema).optional().default([]),
}).merge(VersionMetadataSchema);

/**
 * Tokens type derived from schema
 */
export type Tokens = z.infer<typeof TokensSchema>;

/**
 * Tokens summary for list operations
 */
export interface TokensSummary {
    id: string;
    name: string;
    extends?: string;
}

/**
 * Tokens filters for list operations
 */
export interface TokensFilters {
    extends?: string;
}

/**
 * Resolved references for tokens (currently none, but kept for consistency)
 */
export interface TokensResolved {
    extends_theme?: { id: string; name: string } | null;
}

/**
 * Tokens with resolved references
 */
export type TokensWithResolved = Tokens & { _resolved: TokensResolved };

/**
 * Export sub-schemas for use in other schemas
 */
export {
    BreakpointKeySchema,
    ColorValueSchema,
    ResponsiveValueSchema,
    TextStyleSchema,
};
