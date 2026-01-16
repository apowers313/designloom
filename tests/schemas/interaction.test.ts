import { describe, it, expect } from "vitest";
import { InteractionSchema, InteractionPatternSchema } from "../../src/schemas/interaction.js";
import { withVersionMetadata } from "../test-helpers.js";

describe("InteractionSchema", () => {
    it("validates a complete interaction", () => {
        const valid = {
            states: [
                {
                    type: "default",
                    style: {
                        background: "{colors.primary.500}",
                        text_color: "{colors.semantic.text_inverse}",
                    },
                },
                {
                    type: "hover",
                    style: {
                        background: "{colors.primary.600}",
                        cursor: "pointer",
                    },
                    css_pseudo: ":hover",
                },
                {
                    type: "focus",
                    style: {
                        outline: "2px solid {colors.semantic.focus_ring}",
                        outline_offset: "2px",
                    },
                    css_pseudo: ":focus-visible",
                },
                {
                    type: "disabled",
                    style: {
                        opacity: 0.38,
                        cursor: "not-allowed",
                    },
                    aria_attribute: "aria-disabled",
                },
            ],
            transitions: [
                {
                    from: "default",
                    to: "hover",
                    trigger: "mouseenter",
                    animation: {
                        duration: "{motion.durations.fast}",
                        easing: "{motion.easings.ease_out}",
                        properties: ["background", "box-shadow"],
                    },
                },
            ],
            accessibility: {
                keyboard: {
                    focusable: true,
                    shortcuts: [
                        { key: "Enter", action: "activate" },
                        { key: "Space", action: "activate" },
                    ],
                },
                aria: {
                    role: "button",
                },
            },
        };
        expect(() => InteractionSchema.parse(valid)).not.toThrow();
    });

    it("validates a minimal interaction", () => {
        const minimal = {
            states: [
                {
                    type: "default",
                    style: {
                        background: "#fff",
                    },
                },
            ],
        };
        expect(() => InteractionSchema.parse(minimal)).not.toThrow();
    });

    it("validates empty interaction", () => {
        const empty = {};
        expect(() => InteractionSchema.parse(empty)).not.toThrow();
    });

    it("validates all component state types", () => {
        const stateTypes = [
            "default",
            "hover",
            "focus",
            "focus-visible",
            "active",
            "pressed",
            "disabled",
            "readonly",
            "loading",
            "busy",
            "valid",
            "invalid",
            "warning",
            "selected",
            "checked",
            "indeterminate",
            "expanded",
            "collapsed",
            "dragging",
            "drop-target",
            "custom",
        ];
        for (const type of stateTypes) {
            const interaction = {
                states: [
                    {
                        type,
                        style: { background: "#fff" },
                    },
                ],
            };
            expect(() => InteractionSchema.parse(interaction)).not.toThrow();
        }
    });

    it("validates state with custom name", () => {
        const custom = {
            states: [
                {
                    type: "custom",
                    name: "highlighted",
                    description: "Item is highlighted for attention",
                    style: {
                        background: "#FFFBEB",
                        border_color: "#F59E0B",
                    },
                },
            ],
        };
        expect(() => InteractionSchema.parse(custom)).not.toThrow();
    });

    it("validates state layer opacity (Material Design pattern)", () => {
        const materialDesign = {
            states: [
                {
                    type: "hover",
                    style: {
                        state_layer_opacity: 0.08,
                    },
                },
                {
                    type: "focus",
                    style: {
                        state_layer_opacity: 0.12,
                    },
                },
            ],
        };
        expect(() => InteractionSchema.parse(materialDesign)).not.toThrow();
    });

    it("validates transitions with wildcard from state", () => {
        const wildcard = {
            transitions: [
                {
                    from: "*",
                    to: "disabled",
                    trigger: "disabled-attribute",
                },
            ],
        };
        expect(() => InteractionSchema.parse(wildcard)).not.toThrow();
    });

    it("validates transitions with multiple from states", () => {
        const multiFrom = {
            transitions: [
                {
                    from: ["default", "hover"],
                    to: "active",
                    trigger: "mousedown",
                },
            ],
        };
        expect(() => InteractionSchema.parse(multiFrom)).not.toThrow();
    });

    it("validates default transition", () => {
        const withDefault = {
            default_transition: {
                duration: "150ms",
                easing: "ease-out",
            },
        };
        expect(() => InteractionSchema.parse(withDefault)).not.toThrow();
    });

    it("validates microinteractions", () => {
        const withMicro = {
            microinteractions: [
                {
                    id: "submit-feedback",
                    name: "Submit Button Feedback",
                    trigger: {
                        type: "click",
                    },
                    rules: [
                        "Validate form fields",
                        "Submit to API",
                    ],
                    feedback: [
                        {
                            type: "visual",
                            description: "Button shows loading state",
                            visual: {
                                property: "background",
                                to: "{colors.primary.400}",
                            },
                        },
                        {
                            type: "motion",
                            description: "Spinner animation",
                            motion: {
                                animation: "spinner-rotate",
                                duration: "1s",
                                iterations: -1,
                            },
                        },
                    ],
                },
            ],
        };
        expect(() => InteractionSchema.parse(withMicro)).not.toThrow();
    });

    it("validates all trigger types", () => {
        const triggerTypes = [
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
            "load",
            "data-change",
            "timer",
            "geolocation",
            "network-status",
            "custom",
        ];
        for (const type of triggerTypes) {
            const interaction = {
                microinteractions: [
                    {
                        id: `trigger-${type}`,
                        trigger: { type },
                        rules: ["Do something"],
                        feedback: [{ type: "visual", description: "Change color" }],
                    },
                ],
            };
            expect(() => InteractionSchema.parse(interaction)).not.toThrow();
        }
    });

    it("validates all feedback types", () => {
        const feedbackTypes = ["visual", "motion", "audio", "haptic", "text", "icon"];
        for (const type of feedbackTypes) {
            const interaction = {
                microinteractions: [
                    {
                        id: `feedback-${type}`,
                        trigger: { type: "click" },
                        rules: ["Process action"],
                        feedback: [{ type, description: `${type} feedback` }],
                    },
                ],
            };
            expect(() => InteractionSchema.parse(interaction)).not.toThrow();
        }
    });

    it("validates keyboard navigation", () => {
        const keyboard = {
            accessibility: {
                keyboard: {
                    focusable: true,
                    tab_index: 0,
                    shortcuts: [
                        { key: "Enter", action: "activate", description: "Activate button" },
                        { key: "Escape", action: "cancel", description: "Cancel action" },
                    ],
                    arrow_navigation: "horizontal",
                    focus_trap: false,
                },
            },
        };
        expect(() => InteractionSchema.parse(keyboard)).not.toThrow();
    });

    it("validates arrow navigation types", () => {
        const navTypes = ["none", "horizontal", "vertical", "both", "roving"];
        for (const nav of navTypes) {
            const interaction = {
                accessibility: {
                    keyboard: {
                        focusable: true,
                        arrow_navigation: nav,
                    },
                },
            };
            expect(() => InteractionSchema.parse(interaction)).not.toThrow();
        }
    });

    it("validates ARIA attributes", () => {
        const aria = {
            accessibility: {
                aria: {
                    role: "button",
                    attributes: {
                        "aria-label": "Submit form",
                        "aria-describedby": "submit-help",
                    },
                },
            },
        };
        expect(() => InteractionSchema.parse(aria)).not.toThrow();
    });

    it("validates reduced motion support", () => {
        const reducedMotion = {
            accessibility: {
                reduced_motion: {
                    alternative: "Instant state changes without animation",
                    disable_animations: true,
                },
            },
        };
        expect(() => InteractionSchema.parse(reducedMotion)).not.toThrow();
    });

    it("validates high contrast support", () => {
        const highContrast = {
            accessibility: {
                high_contrast: {
                    border_style: "2px solid currentColor",
                    forced_colors: {
                        background: "ButtonFace",
                        text: "ButtonText",
                    },
                },
            },
        };
        expect(() => InteractionSchema.parse(highContrast)).not.toThrow();
    });

    it("validates loop and mode for microinteractions", () => {
        const withLoops = {
            microinteractions: [
                {
                    id: "pulse-attention",
                    trigger: { type: "timer" },
                    rules: ["Draw attention to element"],
                    feedback: [
                        {
                            type: "motion",
                            description: "Pulse animation",
                            motion: {
                                animation: "pulse",
                                duration: "1s",
                            },
                        },
                    ],
                    loops_and_modes: {
                        type: "loop",
                        iterations: 3,
                        interval: "2s",
                    },
                },
            ],
        };
        expect(() => InteractionSchema.parse(withLoops)).not.toThrow();
    });

    it("validates microinteraction accessibility announcements", () => {
        const withAnnounce = {
            microinteractions: [
                {
                    id: "form-submit",
                    trigger: { type: "click" },
                    rules: ["Submit form"],
                    feedback: [{ type: "text", description: "Show success message" }],
                    accessibility: {
                        announce: "Form submitted successfully",
                        aria_live: "polite",
                    },
                },
            ],
        };
        expect(() => InteractionSchema.parse(withAnnounce)).not.toThrow();
    });

    it("rejects invalid opacity value", () => {
        const invalidOpacity = {
            states: [
                {
                    type: "disabled",
                    style: {
                        opacity: 1.5, // Should be 0-1
                    },
                },
            ],
        };
        expect(() => InteractionSchema.parse(invalidOpacity)).toThrow();
    });

    it("rejects invalid cursor value", () => {
        const invalidCursor = {
            states: [
                {
                    type: "hover",
                    style: {
                        cursor: "invalid-cursor",
                    },
                },
            ],
        };
        expect(() => InteractionSchema.parse(invalidCursor)).toThrow();
    });
});

describe("InteractionPatternSchema", () => {
    it("validates a complete interaction pattern", () => {
        const pattern = withVersionMetadata({
            id: "button-interaction",
            name: "Button Interaction Pattern",
            description: "Standard interaction pattern for buttons",
            interaction: {
                states: [
                    { type: "default", style: { background: "{colors.primary.500}" } },
                    { type: "hover", style: { background: "{colors.primary.600}" } },
                ],
            },
            applies_to: ["button", "link"],
        });
        expect(() => InteractionPatternSchema.parse(pattern)).not.toThrow();
    });

    it("validates a minimal interaction pattern", () => {
        const minimal = withVersionMetadata({
            id: "basic-pattern",
            name: "Basic Pattern",
            interaction: {},
        });
        expect(() => InteractionPatternSchema.parse(minimal)).not.toThrow();
    });

    it("rejects invalid pattern ID format", () => {
        const invalid = withVersionMetadata({
            id: "ButtonPattern", // Should be kebab-case
            name: "Button Pattern",
            interaction: {},
        });
        expect(() => InteractionPatternSchema.parse(invalid)).toThrow(/ID must match pattern/);
    });

    it("rejects missing required fields", () => {
        const incomplete = { id: "pattern" };
        expect(() => InteractionPatternSchema.parse(incomplete)).toThrow();
    });
});
