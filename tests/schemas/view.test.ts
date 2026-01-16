import { describe, it, expect } from "vitest";
import { ViewSchema } from "../../src/schemas/view.js";
import { withVersionMetadata } from "../test-helpers.js";

describe("ViewSchema", () => {
    it("validates a complete view", () => {
        const valid = withVersionMetadata({
            id: "V01",
            name: "Analytics Dashboard",
            description: "Main dashboard showing key metrics",
            workflows: ["W01", "W03"],
            layout: {
                type: "dashboard",
                zones: [
                    {
                        id: "header",
                        position: "header",
                        components: ["main-nav", "user-menu"],
                        sticky: true,
                    },
                    {
                        id: "sidebar",
                        position: "sidebar-left",
                        width: "280px",
                        components: ["filter-panel"],
                        visibility: {
                            base: "hidden",
                            lg: "visible",
                        },
                    },
                    {
                        id: "main",
                        position: "main",
                        components: ["metrics-grid", "activity-feed"],
                    },
                ],
            },
            states: [
                {
                    id: "empty",
                    type: "empty",
                    description: "No data loaded",
                    zones: [
                        {
                            zone_id: "main",
                            components: ["empty-state-card"],
                        },
                    ],
                },
                {
                    id: "loading",
                    type: "loading",
                    zones: [
                        {
                            zone_id: "main",
                            components: ["metrics-skeleton"],
                        },
                    ],
                },
            ],
            routes: [
                {
                    path: "/dashboard",
                    title: "Dashboard",
                },
            ],
        });
        expect(() => ViewSchema.parse(valid)).not.toThrow();
    });

    it("validates a minimal view", () => {
        const minimal = withVersionMetadata({
            id: "V01",
            name: "Simple Page",
            layout: {
                type: "single-column",
                zones: [
                    {
                        id: "main",
                        position: "main",
                    },
                ],
            },
        });
        expect(() => ViewSchema.parse(minimal)).not.toThrow();
    });

    it("rejects invalid view ID format", () => {
        const invalid = withVersionMetadata({
            id: "view-01", // Should be V01 format
            name: "Invalid View",
            layout: {
                type: "single-column",
                zones: [{ id: "main", position: "main" }],
            },
        });
        expect(() => ViewSchema.parse(invalid)).toThrow(/ID must match pattern/);
    });

    it("rejects missing required fields", () => {
        const incomplete = { id: "V01" };
        expect(() => ViewSchema.parse(incomplete)).toThrow();
    });

    it("validates all layout types", () => {
        const layoutTypes = [
            "single-column",
            "sidebar-left",
            "sidebar-right",
            "dual-sidebar",
            "holy-grail",
            "dashboard",
            "split",
            "stacked",
            "custom",
        ];
        for (const type of layoutTypes) {
            const view = withVersionMetadata({
                id: "V01",
                name: "Layout Test",
                layout: {
                    type,
                    zones: [{ id: "main", position: "main" }],
                },
            });
            expect(() => ViewSchema.parse(view)).not.toThrow();
        }
    });

    it("rejects invalid layout type", () => {
        const invalid = withVersionMetadata({
            id: "V01",
            name: "Invalid Layout",
            layout: {
                type: "invalid-layout",
                zones: [{ id: "main", position: "main" }],
            },
        });
        expect(() => ViewSchema.parse(invalid)).toThrow();
    });

    it("validates all zone positions", () => {
        const positions = [
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
        ];
        for (const position of positions) {
            const view = withVersionMetadata({
                id: "V01",
                name: "Position Test",
                layout: {
                    type: "custom",
                    zones: [{ id: "zone-1", position }],
                },
            });
            expect(() => ViewSchema.parse(view)).not.toThrow();
        }
    });

    it("validates all view state types", () => {
        const stateTypes = [
            "default",
            "empty",
            "loading",
            "error",
            "success",
            "partial",
            "offline",
            "forbidden",
            "not-found",
        ];
        for (const type of stateTypes) {
            const view = withVersionMetadata({
                id: "V01",
                name: "State Test",
                layout: {
                    type: "single-column",
                    zones: [{ id: "main", position: "main" }],
                },
                states: [{ id: `state-${type}`, type }],
            });
            expect(() => ViewSchema.parse(view)).not.toThrow();
        }
    });

    it("validates responsive zone visibility", () => {
        const view = withVersionMetadata({
            id: "V01",
            name: "Responsive Test",
            layout: {
                type: "sidebar-left",
                zones: [
                    {
                        id: "sidebar",
                        position: "sidebar-left",
                        visibility: {
                            base: "hidden",
                            md: "drawer",
                            lg: "visible",
                        },
                    },
                    {
                        id: "main",
                        position: "main",
                    },
                ],
            },
        });
        expect(() => ViewSchema.parse(view)).not.toThrow();
    });

    it("validates zone with responsive width", () => {
        const view = withVersionMetadata({
            id: "V01",
            name: "Responsive Width",
            layout: {
                type: "sidebar-left",
                zones: [
                    {
                        id: "sidebar",
                        position: "sidebar-left",
                        width: {
                            base: "100%",
                            md: "280px",
                            lg: "320px",
                        },
                    },
                    {
                        id: "main",
                        position: "main",
                    },
                ],
            },
        });
        expect(() => ViewSchema.parse(view)).not.toThrow();
    });

    it("validates routes with parameters", () => {
        const view = withVersionMetadata({
            id: "V01",
            name: "Routed View",
            layout: {
                type: "single-column",
                zones: [{ id: "main", position: "main" }],
            },
            routes: [
                {
                    path: "/projects/:projectId",
                    params: [
                        {
                            name: "projectId",
                            type: "uuid",
                            required: true,
                            description: "Project identifier",
                        },
                    ],
                    title: "Project Details",
                    requires_auth: true,
                },
            ],
        });
        expect(() => ViewSchema.parse(view)).not.toThrow();
    });

    it("validates data requirements", () => {
        const view = withVersionMetadata({
            id: "V01",
            name: "Data View",
            layout: {
                type: "single-column",
                zones: [{ id: "main", position: "main" }],
            },
            data_requirements: [
                {
                    id: "metrics",
                    source: "/api/metrics",
                    required: true,
                    loading_state: "loading",
                    error_state: "error",
                },
                {
                    id: "activity",
                    source: "/api/activity",
                    required: false,
                },
            ],
        });
        expect(() => ViewSchema.parse(view)).not.toThrow();
    });

    it("validates zone overrides in states", () => {
        const view = withVersionMetadata({
            id: "V01",
            name: "Override Test",
            layout: {
                type: "single-column",
                zones: [{ id: "main", position: "main", components: ["content"] }],
            },
            states: [
                {
                    id: "error",
                    type: "error",
                    zones: [
                        {
                            zone_id: "main",
                            components: [
                                {
                                    component: "error-card",
                                    props: {
                                        message: "Failed to load",
                                        retry: true,
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        });
        expect(() => ViewSchema.parse(view)).not.toThrow();
    });

    it("validates sticky zones", () => {
        const view = withVersionMetadata({
            id: "V01",
            name: "Sticky Test",
            layout: {
                type: "holy-grail",
                zones: [
                    {
                        id: "header",
                        position: "header",
                        sticky: true,
                        sticky_offset: "0px",
                    },
                    { id: "main", position: "main" },
                ],
            },
        });
        expect(() => ViewSchema.parse(view)).not.toThrow();
    });

    it("validates zone overflow settings", () => {
        const view = withVersionMetadata({
            id: "V01",
            name: "Overflow Test",
            layout: {
                type: "sidebar-left",
                zones: [
                    {
                        id: "sidebar",
                        position: "sidebar-left",
                        overflow_y: "auto",
                        overflow_x: "hidden",
                    },
                    { id: "main", position: "main" },
                ],
            },
        });
        expect(() => ViewSchema.parse(view)).not.toThrow();
    });

    it("validates layout grid configuration", () => {
        const view = withVersionMetadata({
            id: "V01",
            name: "Grid Layout",
            layout: {
                type: "dashboard",
                zones: [{ id: "main", position: "main" }],
                grid_columns: 12,
                grid_gap: { base: "16px", lg: "24px" },
                max_width: "1440px",
                centered: true,
            },
        });
        expect(() => ViewSchema.parse(view)).not.toThrow();
    });

    it("validates sources array", () => {
        const withSources = withVersionMetadata({
            id: "V01",
            name: "Documented View",
            layout: {
                type: "single-column",
                zones: [{ id: "main", position: "main" }],
            },
            sources: [
                {
                    title: "Dashboard Wireframes",
                    url: "https://figma.com/file/dashboard",
                    summary: "Approved layout designs",
                },
            ],
        });
        expect(() => ViewSchema.parse(withSources)).not.toThrow();
    });

    it("rejects layout with no zones", () => {
        const noZones = withVersionMetadata({
            id: "V01",
            name: "No Zones",
            layout: {
                type: "single-column",
                zones: [],
            },
        });
        expect(() => ViewSchema.parse(noZones)).toThrow();
    });

    it("validates state transitions", () => {
        const view = withVersionMetadata({
            id: "V01",
            name: "Transitions Test",
            layout: {
                type: "single-column",
                zones: [{ id: "main", position: "main" }],
            },
            states: [
                {
                    id: "loading",
                    type: "loading",
                    transitions_to: [
                        {
                            state: "default",
                            trigger: "data-loaded",
                            animation: "fade-in",
                        },
                        {
                            state: "error",
                            trigger: "data-error",
                        },
                    ],
                },
            ],
        });
        expect(() => ViewSchema.parse(view)).not.toThrow();
    });
});
