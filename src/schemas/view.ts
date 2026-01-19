/* eslint-disable camelcase -- snake_case matches YAML field names for serialization */
import { z } from "zod";

import {
    DeprecationSchema,
    ImplementationTrackingSchema,
    PrioritySchema,
    SourceSchema,
    VersionMetadataSchema,
} from "./source.js";
import { BreakpointKeySchema,ResponsiveValueSchema } from "./tokens.js";

/**
 * View ID pattern: V followed by 2 digits (e.g., V01, V99)
 */
const ViewIdSchema = z
    .string()
    .regex(/^V\d{2,3}$/, "ID must match pattern V01, V99, etc.");

/**
 * View status - tracks the lifecycle from design to implementation
 */
const ViewStatusSchema = z.enum([
    "draft",        // Still designing layout
    "designed",     // Layout finalized
    "implementing", // Currently being implemented
    "implemented",  // Code complete
    "deprecated",   // No longer used
]);

/**
 * =============================================================================
 * LAYOUT TYPE SCHEMAS
 * =============================================================================
 * Predefined layout patterns that Claude Code can implement.
 * These map to common UI patterns with known responsive behaviors.
 */

/**
 * Layout type - predefined patterns Claude Code knows how to implement
 * Each has established responsive behavior:
 *
 * - single-column: Content centered, max-width constrained
 * - sidebar-left: Fixed sidebar on left, main content flexible
 * - sidebar-right: Fixed sidebar on right, main content flexible
 * - dual-sidebar: Sidebars on both sides (rare, complex)
 * - holy-grail: Header + sidebar + main + footer (classic layout)
 * - dashboard: Header + sidebar + main content area with grid
 * - split: Two equal columns (marketing, comparison)
 * - stacked: Full-width sections stacked vertically
 * - custom: Define zones manually
 */
const LayoutTypeSchema = z.enum([
    "single-column",
    "sidebar-left",
    "sidebar-right",
    "dual-sidebar",
    "holy-grail",
    "dashboard",
    "split",
    "stacked",
    "custom",
]);

/**
 * =============================================================================
 * ZONE SCHEMAS
 * =============================================================================
 * Zones define regions of the layout where components are placed.
 * Claude Code uses zones to generate the layout structure.
 */

/**
 * Zone position - semantic positions in the layout
 */
const ZonePositionSchema = z.enum([
    "header",
    "footer",
    "sidebar",
    "sidebar-left",
    "sidebar-right",
    "main",
    "aside",
    "nav",
    "content",
    "overlay",
]);

/**
 * Zone visibility at different breakpoints
 */
const ZoneVisibilitySchema = z.enum([
    "visible",
    "hidden",
    "collapsed",   // Takes no space
    "drawer",      // Slides in on trigger (mobile nav pattern)
]);

/**
 * Responsive visibility - visibility at each breakpoint
 */
const ResponsiveVisibilitySchema = z.union([
    ZoneVisibilitySchema,
    z.record(BreakpointKeySchema, ZoneVisibilitySchema),
]);

/**
 * Zone overflow behavior
 */
const OverflowSchema = z.enum([
    "visible",
    "hidden",
    "scroll",
    "auto",
]);

/**
 * Zone definition
 *
 * Claude Code uses this to:
 * - Generate the layout grid/flexbox structure
 * - Place components in the correct positions
 * - Apply responsive behavior (show/hide at breakpoints)
 * - Set up scroll areas
 */
const ZoneSchema = z.object({
    id: z.string().min(1).describe("Unique zone identifier"),
    position: ZonePositionSchema.describe("Semantic position in layout"),

    // Components placed in this zone (default state)
    components: z.array(z.string()).default([]).describe(
        "Component IDs placed in this zone (default state)"
    ),

    // Sizing - responsive-aware
    width: ResponsiveValueSchema.optional().describe(
        "Zone width - can be fixed, percentage, or flex"
    ),
    min_width: ResponsiveValueSchema.optional(),
    max_width: ResponsiveValueSchema.optional(),

    height: ResponsiveValueSchema.optional().describe(
        "Zone height - often 'auto' for content-driven"
    ),
    min_height: ResponsiveValueSchema.optional(),
    max_height: ResponsiveValueSchema.optional(),

    // Spacing
    padding: ResponsiveValueSchema.optional(),
    gap: ResponsiveValueSchema.optional().describe("Gap between child components"),

    // Visibility and behavior
    visibility: ResponsiveVisibilitySchema.optional().default("visible"),
    overflow_x: OverflowSchema.optional(),
    overflow_y: OverflowSchema.optional(),

    // Sticky behavior (for headers, sidebars)
    sticky: z.boolean().optional().describe("Whether zone sticks on scroll"),
    sticky_offset: z.string().optional().describe("Offset from edge when sticky"),

    // Background (token reference or direct value)
    background: z.string().optional().describe(
        "Background color token or value"
    ),

    // Order for flex layouts (mobile reordering)
    order: z.record(BreakpointKeySchema, z.number()).optional(),
});

/**
 * =============================================================================
 * LAYOUT SCHEMA
 * =============================================================================
 * Complete layout definition including type, zones, and responsive behavior.
 */

/**
 * Layout responsive overrides
 * Allows changing layout behavior at different breakpoints
 */
const LayoutResponsiveSchema = z.object({
    // Layout type can change at breakpoints (e.g., sidebar-left -> stacked on mobile)
    type: z.record(BreakpointKeySchema, LayoutTypeSchema).optional(),

    // Global layout properties per breakpoint
    max_width: z.record(BreakpointKeySchema, z.string()).optional(),
    padding: z.record(BreakpointKeySchema, z.string()).optional(),
    gap: z.record(BreakpointKeySchema, z.string()).optional(),
});

const LayoutSchema = z.object({
    type: LayoutTypeSchema.default("single-column"),

    // Zones define the layout regions
    zones: z.array(ZoneSchema).min(1).describe(
        "Layout zones where components are placed"
    ),

    // Global layout constraints
    max_width: ResponsiveValueSchema.optional().describe(
        "Maximum width of the layout container"
    ),
    centered: z.boolean().optional().default(true).describe(
        "Whether to center the layout horizontally"
    ),

    // Grid/flex configuration
    grid_columns: z.number().optional().describe(
        "Number of grid columns (for grid-based layouts)"
    ),
    grid_gap: ResponsiveValueSchema.optional(),

    // Responsive overrides
    responsive: LayoutResponsiveSchema.optional(),
});

/**
 * =============================================================================
 * VIEW STATE SCHEMAS
 * =============================================================================
 * Views can have multiple states (empty, loading, error, populated).
 * Each state can override zone content and styling.
 *
 * This replaces the need for separate "pages" - states are variations
 * of the same view with different content.
 */

/**
 * Standard view states that Claude Code recognizes
 */
const ViewStateTypeSchema = z.enum([
    "default",
    "empty",
    "loading",
    "error",
    "success",
    "partial",    // Partially loaded
    "offline",    // No network
    "forbidden",  // Access denied
    "not-found",  // Resource not found
]);

/**
 * Component override in a state
 * Replaces or modifies a component's presence in a zone
 */
const ComponentOverrideSchema = z.object({
    component: z.string().describe("Component ID to use"),
    props: z.record(z.unknown()).optional().describe(
        "Props to pass to the component"
    ),
    condition: z.string().optional().describe(
        "Optional condition for showing this component"
    ),
});

/**
 * Zone override in a state
 * Allows replacing zone content for specific states
 */
const ZoneOverrideSchema = z.object({
    zone_id: z.string().describe("ID of zone to override"),

    // Replace all components in zone
    components: z.array(
        z.union([z.string(), ComponentOverrideSchema])
    ).optional(),

    // Or add/remove specific components
    add_components: z.array(
        z.union([z.string(), ComponentOverrideSchema])
    ).optional(),
    remove_components: z.array(z.string()).optional(),

    // Style overrides for this zone in this state
    visibility: ZoneVisibilitySchema.optional(),
    background: z.string().optional(),
});

/**
 * View state definition
 *
 * Claude Code uses states to:
 * - Generate loading skeletons
 * - Handle empty states with CTAs
 * - Show error messages with retry options
 * - Manage partial/progressive loading
 */
const ViewStateSchema = z.object({
    id: z.string().min(1).describe("State identifier"),
    type: ViewStateTypeSchema.describe("Standard state type"),
    description: z.string().optional().describe(
        "Human description of when this state occurs"
    ),

    // Zone content overrides for this state
    zones: z.array(ZoneOverrideSchema).optional(),

    // Conditions that trigger this state
    conditions: z.array(z.string()).optional().describe(
        "Conditions that activate this state, e.g., 'data.length === 0'"
    ),

    // Transition from this state
    transitions_to: z.array(z.object({
        state: z.string(),
        trigger: z.string(),
        animation: z.string().optional(),
    })).optional(),
});

/**
 * =============================================================================
 * NAVIGATION / ROUTING SCHEMA
 * =============================================================================
 * Views are accessible via routes. Claude Code uses this to generate routing.
 */

/**
 * Route parameter definition
 */
const RouteParamSchema = z.object({
    name: z.string().describe("Parameter name (appears in URL)"),
    type: z.enum(["string", "number", "uuid"]).default("string"),
    required: z.boolean().default(true),
    description: z.string().optional(),
});

/**
 * Route definition
 *
 * Claude Code uses this to:
 * - Generate route configurations (React Router, etc.)
 * - Create navigation links
 * - Handle URL parameters
 */
const RouteSchema = z.object({
    path: z.string().describe("URL path pattern, e.g., '/dashboard/:id'"),
    params: z.array(RouteParamSchema).optional(),

    // Navigation metadata
    title: z.string().optional().describe("Page title (for browser tab)"),
    breadcrumb: z.string().optional().describe("Breadcrumb label"),

    // Access control hints
    requires_auth: z.boolean().optional(),
    permissions: z.array(z.string()).optional(),

    // SEO (if applicable)
    meta_description: z.string().optional(),
});

/**
 * =============================================================================
 * MAIN VIEW SCHEMA
 * =============================================================================
 * A View is a complete screen/page definition combining:
 * - Layout structure (template)
 * - Content states (pages)
 * - Navigation/routing
 * - Responsive behavior
 *
 * This merges the Atomic Design concepts of "Template" and "Page" into
 * a single, more practical entity.
 */
export const ViewSchema = z.object({
    id: ViewIdSchema,
    name: z.string().min(1).describe("Human-readable view name"),
    description: z.string().optional(),
    status: ViewStatusSchema.optional().default("draft"),
    priority: PrioritySchema.optional(),

    // Which workflows use this view
    workflows: z.array(z.string()).optional().default([]).describe(
        "Workflow IDs that use this view"
    ),

    // Layout definition (the "template" part)
    layout: LayoutSchema,

    // State variations (the "pages" part)
    states: z.array(ViewStateSchema).optional().describe(
        "Different states this view can be in (empty, loading, error, etc.)"
    ),
    default_state: z.string().optional().describe(
        "ID of the default state to show"
    ),

    // Routing information
    routes: z.array(RouteSchema).optional().describe(
        "Routes that lead to this view"
    ),

    // Data requirements
    data_requirements: z.array(z.object({
        id: z.string(),
        source: z.string().describe("API endpoint, store selector, etc."),
        required: z.boolean().default(true),
        loading_state: z.string().optional().describe("State to show while loading"),
        error_state: z.string().optional().describe("State to show on error"),
    })).optional().describe(
        "Data that must be fetched/available for this view"
    ),

    // Metadata
    sources: z.array(SourceSchema).optional().default([]),
    deprecation: DeprecationSchema.optional(),
}).merge(ImplementationTrackingSchema).merge(VersionMetadataSchema);

/**
 * View type derived from schema
 */
export type View = z.infer<typeof ViewSchema>;

/**
 * View summary for list operations
 */
export interface ViewSummary {
    id: string;
    name: string;
    status: string;
    priority?: string;
    layout_type: string;
    route_count: number;
    state_count: number;
}

/**
 * Resolved references for a view
 */
export interface ViewResolved {
    workflows: Array<{ id: string; name: string }>;
    components: Array<{ id: string; name: string }>;
}

/**
 * View with resolved references
 */
export type ViewWithResolved = View & { _resolved: ViewResolved };

/**
 * View filters for list operations
 */
export interface ViewFilters {
    layout_type?: string;
    status?: string;
    priority?: string;
    workflow?: string;
    has_route?: boolean;
}

/**
 * Export sub-schemas for use in other schemas
 */
export {
    LayoutTypeSchema,
    RouteSchema,
    ViewStateSchema,
    ViewStateTypeSchema,
    ZoneSchema,
};
