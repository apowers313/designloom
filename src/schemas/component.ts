/* eslint-disable camelcase -- snake_case matches YAML field names for serialization */
import { z } from "zod";

import { InteractionSchema } from "./interaction.js";
import { SourceSchema, VersionMetadataSchema } from "./source.js";

/**
 * Component ID pattern: kebab-case (e.g., data-import-dialog, progress-bar)
 */
const ComponentIdSchema = z
    .string()
    .regex(/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/, "ID must match pattern kebab-case (e.g., data-import-dialog)");

/**
 * Component categories - expanded to match Atomic Design hierarchy
 */
const ComponentCategorySchema = z.enum([
    // Atoms - basic building blocks
    "atom",
    // Molecules - simple component combinations
    "molecule",
    // Organisms - complex component combinations
    "organism",
    // Original categories (mapped to above internally)
    "dialog",
    "control",
    "display",
    "layout",
    "utility",
    "navigation",
    "feedback",
    "form",
    "data-display",
]);

/**
 * Component status
 */
const ComponentStatusSchema = z.enum([
    "planned",
    "in-progress",
    "implemented",
    "deprecated",
]);

/**
 * =============================================================================
 * PROP SCHEMAS
 * =============================================================================
 * Detailed prop definitions for Claude Code to generate TypeScript interfaces.
 */

/**
 * TypeScript-like type definitions
 */
const PropTypeSchema = z.enum([
    // Primitives
    "string",
    "number",
    "boolean",
    "null",
    "undefined",
    // Objects
    "object",
    "array",
    "function",
    // React-specific
    "ReactNode",
    "ReactElement",
    "ComponentType",
    // Events
    "MouseEvent",
    "KeyboardEvent",
    "ChangeEvent",
    "FocusEvent",
    "FormEvent",
    // Custom (defined in type_definition)
    "custom",
]);

/**
 * Detailed prop definition
 *
 * Claude Code uses this to:
 * - Generate TypeScript interfaces
 * - Create prop documentation
 * - Implement default values
 * - Add validation
 */
const PropDefinitionSchema = z.object({
    // Type information
    type: PropTypeSchema,
    type_definition: z.string().optional().describe(
        "Full TypeScript type, e.g., '(event: MouseEvent) => void' or 'Array<string>'"
    ),

    // Requirements
    required: z.boolean().optional().default(false),
    default_value: z.unknown().optional(),

    // Documentation
    description: z.string().optional(),

    // Validation
    enum_values: z.array(z.unknown()).optional().describe(
        "Allowed values for enum types"
    ),
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional().describe("Regex pattern for string validation"),

    // Deprecation
    deprecated: z.boolean().optional(),
    deprecated_message: z.string().optional(),
});

/**
 * =============================================================================
 * SLOT SCHEMAS
 * =============================================================================
 * Slots define where child content can be placed (Vue/Web Components style).
 * In React, these map to children or render props.
 */

const SlotSchema = z.object({
    name: z.string().describe("Slot name, 'default' for main children"),
    description: z.string().optional(),
    // What types of components are allowed in this slot
    allowed_components: z.array(z.string()).optional(),
    // Render prop signature (for React)
    render_prop: z.string().optional().describe(
        "Render prop signature, e.g., '(item: T) => ReactNode'"
    ),
});

/**
 * =============================================================================
 * ANATOMY SCHEMA
 * =============================================================================
 * Component anatomy defines the internal structure/parts of a component.
 * Useful for styling individual parts (like Radix UI's data-* attributes).
 */

const AnatomyPartSchema = z.object({
    name: z.string().describe("Part name, e.g., 'trigger', 'content', 'item'"),
    element: z.string().optional().describe("HTML element type, e.g., 'button', 'div'"),
    description: z.string().optional(),
    // CSS selector or data attribute for styling
    selector: z.string().optional().describe(
        "CSS selector for this part, e.g., '[data-part=\"trigger\"]'"
    ),
    // Can this part be customized/replaced?
    customizable: z.boolean().optional().default(true),
});

/**
 * =============================================================================
 * VARIANT SCHEMAS
 * =============================================================================
 * Variants define the different visual/behavioral versions of a component.
 */

const VariantSchema = z.object({
    name: z.string().describe("Variant name, e.g., 'primary', 'secondary', 'outline'"),
    description: z.string().optional(),
    // Token overrides for this variant
    tokens: z.record(z.string()).optional().describe(
        "Design token overrides, e.g., { background: '{colors.primary.500}' }"
    ),
    // Is this the default variant?
    default: z.boolean().optional(),
});

/**
 * Size presets
 */
const SizeVariantSchema = z.object({
    name: z.enum(["xs", "sm", "md", "lg", "xl"]),
    description: z.string().optional(),
    // Token overrides for this size
    tokens: z.record(z.string()).optional(),
    default: z.boolean().optional(),
});

/**
 * =============================================================================
 * MAIN COMPONENT SCHEMA
 * =============================================================================
 */
export const ComponentSchema = z.object({
    id: ComponentIdSchema,
    name: z.string().min(1),
    category: ComponentCategorySchema,
    description: z.string().min(1),
    status: ComponentStatusSchema.optional().default("planned"),

    // Relationships (existing)
    implements_capabilities: z.array(z.string()).optional().default([]),
    used_in_workflows: z.array(z.string()).optional().default([]),
    dependencies: z.array(z.string()).optional().default([]),

    // Props - now with detailed definitions
    props: z.union([
        // Simple format (backward compatible): { propName: "type description" }
        z.record(z.string()),
        // Detailed format: { propName: PropDefinition }
        z.record(PropDefinitionSchema),
    ]).optional().default({}),

    // Slots for child content
    slots: z.array(SlotSchema).optional(),

    // Component anatomy (internal parts)
    anatomy: z.array(AnatomyPartSchema).optional(),

    // Visual variants
    variants: z.array(VariantSchema).optional(),
    sizes: z.array(SizeVariantSchema).optional(),

    // Interaction specification (NEW)
    interactions: InteractionSchema.optional().describe(
        "Component states, transitions, and microinteractions"
    ),

    // Or reference a reusable interaction pattern
    interaction_pattern: z.string().optional().describe(
        "ID of a reusable interaction pattern to apply"
    ),

    // Accessibility requirements
    accessibility: z.object({
        role: z.string().optional().describe("ARIA role"),
        label_required: z.boolean().optional().describe("Requires aria-label or visible label"),
        keyboard_support: z.array(z.string()).optional().describe(
            "Required keyboard interactions, e.g., ['Enter to activate', 'Escape to close']"
        ),
    }).optional(),

    // Code generation hints
    implementation_hints: z.object({
        // Suggested base component to extend
        extends: z.string().optional().describe(
            "Component to extend, e.g., 'radix-ui/dialog'"
        ),
        // Forward ref requirement
        forward_ref: z.boolean().optional().default(false),
        // Compound component pattern
        compound: z.boolean().optional().default(false).describe(
            "Uses compound component pattern (Component.Part)"
        ),
        // Controlled/uncontrolled
        controlled: z.enum([
            "controlled",      // Always controlled
            "uncontrolled",    // Always uncontrolled
            "both",            // Supports both patterns
        ]).optional(),
    }).optional(),

    // Metadata
    sources: z.array(SourceSchema).optional().default([]),
}).merge(VersionMetadataSchema);

/**
 * Component type derived from schema
 */
export type Component = z.infer<typeof ComponentSchema>;

/**
 * Component summary for list operations
 */
export interface ComponentSummary {
    id: string;
    name: string;
    category: string;
    status: string;
}

/**
 * Resolved references for a component
 */
export interface ComponentResolved {
    capabilities: Array<{ id: string; name: string }>;
    workflows: Array<{ id: string; name: string }>;
    dependents: Array<{ id: string; name: string }>;
}

/**
 * Component with resolved references
 */
export type ComponentWithResolved = Component & { _resolved: ComponentResolved };

/**
 * Component filters for list operations
 */
export interface ComponentFilters {
    category?: string;
    status?: string;
    capability?: string;
}
