/* eslint-disable camelcase -- snake_case matches YAML field names for serialization */
import { z } from "zod";

import {
    DeprecationSchema,
    ImplementationTrackingSchema,
    VersionMetadataSchema,
} from "./source.js";

/**
 * =============================================================================
 * INTERACTION SCHEMA
 * =============================================================================
 * Interactions define how components behave in response to user actions.
 * This schema captures:
 * - Component states (default, hover, active, disabled, etc.)
 * - State transitions with animations
 * - Microinteractions (trigger → rules → feedback → loops)
 * - Accessibility requirements
 *
 * Claude Code uses this to:
 * - Generate CSS for different states (:hover, :active, :focus, :disabled)
 * - Implement state machines for complex interactions
 * - Add appropriate ARIA attributes
 * - Create smooth animations/transitions
 */

/**
 * =============================================================================
 * COMPONENT STATE SCHEMAS
 * =============================================================================
 * States represent the visual/behavioral modes a component can be in.
 * Based on Material Design 3 state system.
 */

/**
 * Standard component states that Claude Code recognizes
 * These map to CSS pseudo-classes and ARIA states
 */
const ComponentStateTypeSchema = z.enum([
    // Interactive states
    "default",      // Normal/enabled state
    "hover",        // Mouse over (desktop)
    "focus",        // Keyboard focus
    "focus-visible", // Keyboard focus only (not mouse)
    "active",       // Being pressed/clicked
    "pressed",      // Toggle is pressed (like a button)

    // Availability states
    "disabled",     // Not interactive
    "readonly",     // Viewable but not editable
    "loading",      // Action in progress
    "busy",         // System is busy

    // Validation states
    "valid",        // Input is valid
    "invalid",      // Input is invalid/error
    "warning",      // Input has warning

    // Selection states
    "selected",     // Item is selected
    "checked",      // Checkbox/radio is checked
    "indeterminate", // Checkbox is partially checked

    // Expansion states
    "expanded",     // Accordion/dropdown is open
    "collapsed",    // Accordion/dropdown is closed

    // Drag states
    "dragging",     // Being dragged
    "drop-target",  // Valid drop target

    // Custom state (for component-specific states)
    "custom",
]);

/**
 * Visual treatment for a state
 * Defines how the component looks in this state
 *
 * Claude Code uses this to generate:
 * - CSS custom properties overrides
 * - Pseudo-class styles
 * - State-specific classes
 */
const StateStyleSchema = z.object({
    // Color overrides (token references or values)
    background: z.string().optional(),
    border_color: z.string().optional(),
    text_color: z.string().optional(),
    icon_color: z.string().optional(),

    // Opacity (Material Design uses state layers)
    opacity: z.number().min(0).max(1).optional(),
    state_layer_opacity: z.number().min(0).max(1).optional().describe(
        "Material Design state layer opacity (overlay on interaction)"
    ),

    // Transform
    scale: z.number().optional(),
    translate_x: z.string().optional(),
    translate_y: z.string().optional(),
    rotate: z.string().optional(),

    // Shadow/elevation change
    shadow: z.string().optional(),
    elevation: z.number().optional().describe(
        "Elevation level (maps to shadow tokens)"
    ),

    // Border
    border_width: z.string().optional(),
    outline: z.string().optional(),
    outline_offset: z.string().optional(),

    // Cursor
    cursor: z.enum([
        "default", "pointer", "not-allowed", "wait", "grab", "grabbing",
        "text", "crosshair", "move", "help", "progress",
    ]).optional(),
});

/**
 * Complete state definition
 */
const ComponentStateSchema = z.object({
    type: ComponentStateTypeSchema,
    name: z.string().optional().describe(
        "Custom name for this state (required if type is 'custom')"
    ),
    description: z.string().optional(),

    // Visual treatment
    style: StateStyleSchema,

    // CSS pseudo-class this maps to (if any)
    css_pseudo: z.string().optional().describe(
        "CSS pseudo-class, e.g., ':hover', ':focus-visible'"
    ),

    // ARIA attribute this maps to (if any)
    aria_attribute: z.string().optional().describe(
        "ARIA attribute, e.g., 'aria-disabled', 'aria-pressed'"
    ),

    // Whether this state can be combined with others
    combinable: z.boolean().optional().default(true).describe(
        "Can this state combine with others? (e.g., hover + focus)"
    ),
});

/**
 * =============================================================================
 * STATE TRANSITION SCHEMAS
 * =============================================================================
 * Transitions define how the component moves between states.
 * Includes animation/motion specifications.
 */

/**
 * Animation definition for transitions
 */
const TransitionAnimationSchema = z.object({
    // Duration (token reference or value)
    duration: z.string().default("{motion.durations.normal}"),

    // Easing (token reference or value)
    easing: z.string().default("{motion.easings.ease_out}"),

    // Delay before animation starts
    delay: z.string().optional(),

    // CSS properties to animate
    properties: z.array(z.string()).optional().describe(
        "CSS properties to transition, e.g., ['opacity', 'transform']"
    ),

    // Named animation (for keyframe animations)
    keyframes: z.string().optional().describe(
        "CSS keyframes animation name"
    ),
});

/**
 * State transition definition
 *
 * Claude Code uses this to:
 * - Generate CSS transitions
 * - Implement state machine logic
 * - Create smooth animations between states
 */
const StateTransitionSchema = z.object({
    from: z.union([
        ComponentStateTypeSchema,
        z.array(ComponentStateTypeSchema),
        z.literal("*"), // Any state
    ]).describe("Starting state(s)"),

    to: ComponentStateTypeSchema.describe("Target state"),

    // What triggers this transition
    trigger: z.string().describe(
        "Event or condition that triggers transition, e.g., 'click', 'mouseenter', 'focus'"
    ),

    // Animation for this transition
    animation: TransitionAnimationSchema.optional(),

    // Whether transition is reversible
    reversible: z.boolean().optional().default(true),

    // Reverse animation (if different from forward)
    reverse_animation: TransitionAnimationSchema.optional(),

    // Guard condition (transition only if condition is true)
    condition: z.string().optional().describe(
        "Condition that must be true for transition, e.g., '!disabled'"
    ),
});

/**
 * =============================================================================
 * MICROINTERACTION SCHEMAS
 * =============================================================================
 * Microinteractions are small, focused interactions that provide feedback.
 * Based on Dan Saffer's framework: Trigger → Rules → Feedback → Loops/Modes
 */

/**
 * Trigger types - what initiates the microinteraction
 */
const TriggerTypeSchema = z.enum([
    // User-initiated
    "click",
    "double-click",
    "long-press",
    "hover",
    "focus",
    "blur",
    "swipe",
    "pinch",
    "scroll",
    "drag",
    "drop",
    "keypress",

    // System-initiated
    "load",
    "data-change",
    "timer",
    "geolocation",
    "network-status",

    // Custom
    "custom",
]);

/**
 * Trigger definition
 */
const TriggerSchema = z.object({
    type: TriggerTypeSchema,
    target: z.string().optional().describe(
        "Element that receives the trigger (if not the component itself)"
    ),
    key: z.string().optional().describe(
        "Specific key for keypress triggers, e.g., 'Enter', 'Escape'"
    ),
    custom_event: z.string().optional().describe(
        "Custom event name for 'custom' trigger type"
    ),
});

/**
 * Feedback types - how we communicate the result
 */
const FeedbackTypeSchema = z.enum([
    "visual",       // Color, shape, position change
    "motion",       // Animation
    "audio",        // Sound effect
    "haptic",       // Vibration (mobile)
    "text",         // Text change/message
    "icon",         // Icon change
]);

/**
 * Feedback definition
 */
const FeedbackSchema = z.object({
    type: FeedbackTypeSchema,
    description: z.string().describe("What feedback is provided"),

    // Visual feedback details
    visual: z.object({
        property: z.string().describe("CSS property to change"),
        from: z.string().optional(),
        to: z.string(),
        duration: z.string().optional(),
    }).optional(),

    // Motion feedback details
    motion: z.object({
        animation: z.string().describe("Animation name or keyframes"),
        duration: z.string(),
        easing: z.string().optional(),
        iterations: z.number().optional().default(1),
    }).optional(),

    // Text feedback details
    text: z.object({
        message: z.string(),
        position: z.enum(["inline", "tooltip", "toast", "label"]).optional(),
        duration: z.string().optional().describe("How long to show (if temporary)"),
    }).optional(),

    // Icon feedback details
    icon: z.object({
        from: z.string().optional(),
        to: z.string(),
        animation: z.string().optional(),
    }).optional(),
});

/**
 * Loop/mode definition - how the microinteraction repeats or changes
 */
const LoopModeSchema = z.object({
    type: z.enum([
        "none",         // One-time interaction
        "loop",         // Repeats continuously
        "long-press",   // Changes behavior on long press
        "count",        // Changes after N interactions
        "time",         // Changes after time period
    ]),

    // For loop type
    iterations: z.number().optional(),
    interval: z.string().optional(),

    // For count type
    count_threshold: z.number().optional(),

    // For time type
    time_threshold: z.string().optional(),

    // What changes in the alternate mode
    alternate_feedback: FeedbackSchema.optional(),
});

/**
 * Complete microinteraction definition (Dan Saffer's framework)
 *
 * Claude Code uses this to:
 * - Generate event handlers
 * - Implement animation sequences
 * - Create accessible feedback patterns
 */
const MicrointeractionSchema = z.object({
    id: z.string().min(1).describe("Unique identifier for this microinteraction"),
    name: z.string().optional(),
    description: z.string().optional(),

    // The four parts of a microinteraction
    trigger: TriggerSchema,
    rules: z.array(z.string()).describe(
        "What happens during the interaction (business logic)"
    ),
    feedback: z.array(FeedbackSchema).min(1).describe(
        "How the system communicates what's happening"
    ),
    loops_and_modes: LoopModeSchema.optional(),

    // Accessibility considerations
    accessibility: z.object({
        announce: z.string().optional().describe(
            "Screen reader announcement"
        ),
        aria_live: z.enum(["off", "polite", "assertive"]).optional(),
    }).optional(),
});

/**
 * =============================================================================
 * ACCESSIBILITY SCHEMA
 * =============================================================================
 * Accessibility requirements that affect interaction behavior.
 */

/**
 * Keyboard navigation definition
 */
const KeyboardNavigationSchema = z.object({
    // Is this component focusable?
    focusable: z.boolean().default(true),
    tab_index: z.number().optional(),

    // Keyboard shortcuts
    shortcuts: z.array(z.object({
        key: z.string().describe("Key or key combination, e.g., 'Enter', 'Ctrl+S'"),
        action: z.string().describe("Action to perform"),
        description: z.string().optional(),
    })).optional(),

    // Arrow key navigation (for composite widgets)
    arrow_navigation: z.enum([
        "none",
        "horizontal",   // Left/right arrows
        "vertical",     // Up/down arrows
        "both",         // Grid navigation
        "roving",       // Roving tabindex pattern
    ]).optional(),

    // Focus trap (for modals)
    focus_trap: z.boolean().optional(),
});

/**
 * ARIA role and attributes
 */
const AriaSchema = z.object({
    role: z.string().optional().describe(
        "ARIA role, e.g., 'button', 'dialog', 'menu'"
    ),
    attributes: z.record(z.string()).optional().describe(
        "Additional ARIA attributes, e.g., { 'aria-label': 'Close dialog' }"
    ),
});

/**
 * Complete accessibility specification
 */
const AccessibilitySchema = z.object({
    keyboard: KeyboardNavigationSchema.optional(),
    aria: AriaSchema.optional(),

    // Screen reader label (if different from visible text)
    label: z.string().optional(),

    // Screen reader description
    description: z.string().optional(),

    // Announce changes to screen readers
    live_region: z.enum(["off", "polite", "assertive"]).optional(),

    // Reduced motion support
    reduced_motion: z.object({
        alternative: z.string().optional().describe(
            "Alternative behavior when prefers-reduced-motion is enabled"
        ),
        disable_animations: z.boolean().optional().default(true),
    }).optional(),

    // High contrast support
    high_contrast: z.object({
        border_style: z.string().optional(),
        forced_colors: z.record(z.string()).optional(),
    }).optional(),
});

/**
 * =============================================================================
 * MAIN INTERACTION SCHEMA
 * =============================================================================
 * Complete interaction specification for a component.
 *
 * This can be:
 * 1. Embedded directly in a Component definition
 * 2. Defined as a reusable interaction pattern and referenced
 */
export const InteractionSchema = z.object({
    // States this component can be in
    states: z.array(ComponentStateSchema).optional().describe(
        "Visual/behavioral states for this component"
    ),

    // Transitions between states
    transitions: z.array(StateTransitionSchema).optional().describe(
        "How the component moves between states"
    ),

    // Microinteractions (small feedback moments)
    microinteractions: z.array(MicrointeractionSchema).optional().describe(
        "Detailed interaction patterns (trigger → feedback)"
    ),

    // Accessibility requirements
    accessibility: AccessibilitySchema.optional(),

    // Default transition animation (applied to all transitions without explicit animation)
    default_transition: TransitionAnimationSchema.optional(),
});

/**
 * Interaction type derived from schema
 */
export type Interaction = z.infer<typeof InteractionSchema>;

/**
 * =============================================================================
 * REUSABLE INTERACTION PATTERN SCHEMA
 * =============================================================================
 * Common interaction patterns that can be referenced by multiple components.
 * e.g., "button-interaction", "input-interaction", "toggle-interaction"
 */

const InteractionPatternIdSchema = z
    .string()
    .regex(/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/, "ID must match pattern kebab-case");

/**
 * Interaction pattern status - tracks documentation and implementation
 */
const InteractionPatternStatusSchema = z.enum([
    "draft",        // Still defining the pattern
    "documented",   // Pattern documented, ready to use
    "implemented",  // Code exists for this pattern
    "deprecated",   // No longer recommended
]);

export const InteractionPatternSchema = z.object({
    id: InteractionPatternIdSchema,
    name: z.string().min(1),
    description: z.string().optional(),
    status: InteractionPatternStatusSchema.optional().default("draft"),

    // The interaction definition
    interaction: InteractionSchema,

    // What component types this pattern applies to
    applies_to: z.array(z.string()).optional().describe(
        "Component categories this pattern applies to, e.g., ['button', 'link']"
    ),

    // Metadata
    sources: z.array(z.object({
        title: z.string(),
        url: z.string().url().optional(),
        summary: z.string().optional(),
    })).optional().default([]),
    deprecation: DeprecationSchema.optional(),
}).merge(ImplementationTrackingSchema).merge(VersionMetadataSchema);

/**
 * Interaction pattern type derived from schema
 */
export type InteractionPattern = z.infer<typeof InteractionPatternSchema>;

/**
 * Interaction pattern summary for list operations
 */
export interface InteractionPatternSummary {
    id: string;
    name: string;
    status: string;
    applies_to: string[];
}

/**
 * Interaction pattern filters for list operations
 */
export interface InteractionPatternFilters {
    applies_to?: string;
    status?: string;
}

/**
 * Resolved references for interaction patterns
 */
export interface InteractionPatternResolved {
    components_using: Array<{ id: string; name: string }>;
}

/**
 * Interaction pattern with resolved references
 */
export type InteractionPatternWithResolved = InteractionPattern & { _resolved: InteractionPatternResolved };

/**
 * Export sub-schemas for use in Component schema
 */
export {
    AccessibilitySchema,
    ComponentStateSchema,
    ComponentStateTypeSchema,
    FeedbackTypeSchema,
    MicrointeractionSchema,
    StateTransitionSchema,
    TriggerTypeSchema,
};
