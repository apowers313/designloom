# Design-to-Implementation Research

A comprehensive document capturing design research, decisions, and implementation details for the Designloom design system management tool. This document serves as institutional knowledge for future development sessions.

---

## Table of Contents

1. [Session Overview](#session-overview)
2. [The Core Problem](#the-core-problem)
3. [Entity Type Design Decisions](#entity-type-design-decisions)
4. [Tokens Schema Design](#tokens-schema-design)
5. [Views Schema Design](#views-schema-design)
6. [Interactions Schema Design](#interactions-schema-design)
7. [MCP Architecture Decisions](#mcp-architecture-decisions)
8. [Quality Framework Summary](#quality-framework-summary)
9. [Implementation Details](#implementation-details)
10. [Key Research Sources](#key-research-sources)
11. [Open Questions & Future Work](#open-questions--future-work)

---

## Session Overview

### What Was Accomplished

This session extended Designloom from 4 entity types (Workflow, Capability, Persona, Component) to 7 entity types by adding:

1. **Tokens** - Design tokens for colors, typography, spacing, effects, motion
2. **Views** - Screen layouts with zones, states, and responsive behavior
3. **Interactions** - Component states, transitions, microinteractions, accessibility

### Files Created/Modified

**New Schema Files:**
- `src/schemas/tokens.ts` - 565 lines of DTCG-inspired design tokens schema
- `src/schemas/view.ts` - 438 lines of layout and view state schema
- `src/schemas/interaction.ts` - 570 lines of interaction pattern schema
- `src/schemas/source.ts` - Source/bibliography schema for traceability

**New Test Files:**
- `tests/schemas/tokens.test.ts` - ~240 lines of token validation tests
- `tests/schemas/view.test.ts` - ~280 lines of view validation tests
- `tests/schemas/interaction.test.ts` - ~320 lines of interaction validation tests

**Modified Files:**
- `src/store/yaml-store.ts` - Extended with CRUD operations for all 3 new types
- `src/tools/query.ts` - Added 6 new query tools (list/get for each type)
- `src/tools/mutation.ts` - Added 9 new mutation tools (create/update/delete)
- `src/schemas/index.ts` - Updated exports
- `CLAUDE.md` - Updated architecture documentation
- `design/framework.md` - Added quality guidance for Tokens, Views, Interactions

---

## The Core Problem

### Why Extend Beyond Components?

The original 4 entity types (Workflow, Capability, Persona, Component) capture the *what* of design:
- **What** users want to accomplish (Workflows)
- **What** features support them (Capabilities)
- **Who** are the users (Personas)
- **What** UI pieces exist (Components)

But they don't capture the *how*:
- **How** does the visual system work? (Tokens)
- **How** are screens organized? (Views)
- **How** do components behave? (Interactions)

### The Traceability Chain

The extended model maintains complete traceability:

```
PERSONA (who?)
  → WORKFLOW (what need?)
    → CAPABILITY (what feature?)
      → COMPONENT (how built?)
        → INTERACTION (how behaves?)
           → TOKENS (how looks?)
              → VIEW (where placed?)
```

Every design decision should trace back to user needs.

---

## Entity Type Design Decisions

### Entity ID Patterns

| Entity | Pattern | Rationale |
|--------|---------|-----------|
| Workflow | W01, W02... | Sequential, sortable, referenced frequently |
| Capability | kebab-case | Descriptive, stable identifiers |
| Persona | kebab-case | Memorable, human-readable |
| Component | kebab-case | Matches code conventions |
| Tokens | kebab-case | Theme names (default-theme, dark-mode) |
| View | V01, V02... | Sequential like workflows, screen-level |
| Interaction | kebab-case | Pattern names (button-interaction) |

### Why These Seven Types?

The seven entity types map to established UX/design practices:

1. **Personas** - Nielsen Norman Group's research-based archetypes
2. **Workflows** - User journey mapping best practices
3. **Capabilities** - INVEST framework for requirements
4. **Components** - Atomic Design methodology (Brad Frost)
5. **Tokens** - Design Tokens Community Group (DTCG) specification
6. **Views** - Responsive layout patterns
7. **Interactions** - Dan Saffer's microinteraction framework + Material Design 3

---

## Tokens Schema Design

### Design Philosophy

The tokens schema was designed to be:
1. **DTCG-compatible** where possible
2. **Comprehensive** enough for Claude Code to generate full implementations
3. **Flexible** enough to accommodate different design philosophies

### The Three-Tier Token Architecture

| Tier | Purpose | Example |
|------|---------|---------|
| **Primitive** | Raw values without meaning | `blue-500: #0066FF` |
| **Semantic** | Purpose-driven aliases | `color-interactive: {blue-500}` |
| **Component** | Component-specific overrides | `button-primary-bg: {color-interactive}` |

**Key principle:** Start with two tiers (primitive + semantic). Add component tokens only when needed.

### Responsive Values

Tokens support three responsive formats:

```yaml
# 1. Simple string
spacing: "16px"

# 2. Breakpoint overrides
spacing:
  base: "14px"
  md: "16px"
  lg: "18px"

# 3. Fluid clamp values
spacing:
  min: "14px"
  max: "18px"
  preferred: "4vw"
```

### Color System Design

Based on Material Design 3 and Tailwind conventions:

- **Color scales**: 50 (lightest) to 950 (darkest), 500 is base
- **Semantic colors**: background, surface, text-primary, etc.
- **Feedback colors**: success, warning, error, info with base/light/dark/contrast variants
- **Color formats**: hex, rgb, hsl, oklch, or token references

### What We Included vs. Excluded

**Included:**
- Colors (scales, semantic, feedback)
- Typography (fonts, sizes, weights, line heights, composite styles)
- Spacing (numeric scale, semantic spacing)
- Radii (border radius scale)
- Shadows (elevation system)
- Motion (durations, easings, transitions)
- Breakpoints (responsive thresholds)
- Z-index (stacking order)

**Excluded:**
- One-off values (hardcode those)
- Component tokens for everything (creates bloat)
- Platform-specific values (let tooling transform)

---

## Views Schema Design

### Design Philosophy

Views merge two Atomic Design concepts into one practical entity:
- **Template**: The structural layout
- **Page**: The content in that layout

A View = Layout + Zones + States

### Layout Types

Semantic layout patterns Claude Code knows how to implement:

| Layout Type | Structure | Best For |
|-------------|-----------|----------|
| `single-column` | Centered content, max-width constrained | Articles, forms |
| `sidebar-left` | Fixed sidebar + flexible main | Dashboards |
| `sidebar-right` | Main + contextual sidebar | Detail views |
| `holy-grail` | Header + sidebar + main + footer | Traditional apps |
| `dashboard` | Header + sidebar + grid content | Analytics |
| `split` | Two equal columns | Comparisons |
| `stacked` | Full-width sections | Landing pages |

### Zone System

Zones are named regions where components are placed:

```yaml
zones:
  - id: sidebar
    position: sidebar-left
    width: "280px"
    components: [filter-panel, quick-actions]
    visibility:
      base: hidden      # Hidden on mobile
      md: drawer        # Slide-out on tablet
      lg: visible       # Always visible on desktop
```

**Key principle:** Describe *what happens* at breakpoints, not *how to implement it*.

### View States

Views can have multiple states (not separate pages):

| State | When to Use | What to Show |
|-------|-------------|--------------|
| `default` | Normal operation | Standard content |
| `empty` | No data available | Empty state with CTA |
| `loading` | Fetching data | Skeleton/spinner |
| `error` | Operation failed | Error message + retry |
| `success` | Action completed | Confirmation |

States override zone content without changing layout structure.

### Data Requirements

Views can declare their data needs:

```yaml
data_requirements:
  - id: metrics
    source: "/api/metrics"
    required: true
    loading_state: loading
    error_state: error
```

This enables Claude Code to generate appropriate loading/error handling.

---

## Interactions Schema Design

### Design Philosophy

Interactions capture how components behave, built on:
1. **Material Design 3** state system
2. **Dan Saffer's microinteraction framework**
3. **WCAG accessibility requirements**

### The Four Concepts

| Concept | Purpose | Example |
|---------|---------|---------|
| **States** | Visual modes a component can be in | default, hover, focus, disabled |
| **Transitions** | How to move between states | fade 150ms ease-out |
| **Microinteractions** | Small feedback moments | Button press animation |
| **Accessibility** | Keyboard and screen reader support | Focus visible, ARIA labels |

### Component States (Material Design 3)

Based on Material Design 3, define these states:

| State | CSS Pseudo | Opacity Overlay | When |
|-------|------------|-----------------|------|
| **Default** | — | 0% | Normal state |
| **Hover** | `:hover` | 8% | Mouse over |
| **Focus** | `:focus-visible` | 12% | Keyboard focus |
| **Pressed** | `:active` | 12% | Being clicked |
| **Disabled** | `:disabled` | 38% content | Not interactive |

### Dan Saffer's Microinteraction Model

Every microinteraction has four parts:

| Part | Description | Example |
|------|-------------|---------|
| **Trigger** | What initiates it | Click, hover, keystroke |
| **Rules** | What happens during | Validate input, update count |
| **Feedback** | How system communicates | Animation, color change |
| **Loops/Modes** | How it changes over time | Repeat, escalate, timeout |

### Trigger Types

User-initiated:
- click, double-click, long-press
- hover, focus, blur
- swipe, pinch, scroll
- drag, drop, keypress

System-initiated:
- load, data-change, timer
- geolocation, network-status

### Feedback Types

- **visual**: Color, shape, position change
- **motion**: Animation
- **audio**: Sound effect
- **haptic**: Vibration (mobile)
- **text**: Text change/message
- **icon**: Icon change

### Accessibility Requirements

Every interactive component needs:

| Requirement | Implementation |
|-------------|----------------|
| **Focusable** | Can reach via Tab key |
| **Focus visible** | Clear focus indicator |
| **Keyboard operable** | Enter/Space activate buttons |
| **Role announced** | ARIA role for screen readers |
| **State announced** | aria-pressed, aria-expanded, etc. |
| **Reduced motion** | Respects prefers-reduced-motion |

### Interaction Pattern vs. Component Interaction

Two ways to define interactions:

1. **Embedded in Component**: Interaction specific to one component
2. **InteractionPattern**: Reusable pattern referenced by multiple components

InteractionPattern is the entity type stored in YAML files. Components reference patterns via `interaction_pattern` field.

---

## MCP Architecture Decisions

### Tools vs. Resources Decision

**Decision:** Stick with tools-only approach for now.

**Why tools work for Designloom:**
- 100% client compatibility (vs. 39% for resources)
- AI can autonomously decide when to fetch data
- Query tools with filters are flexible enough
- No ecosystem fragmentation risk

**Future consideration:** Resources could be cleaner for:
- User-controlled context loading
- Token budget efficiency (fewer tool schemas)
- Caching and subscriptions

### Tool Design Patterns Applied

1. **"Less is More"** - Minimize tool count; bundle related operations
2. **Workflow-Based Design** - Tools serve user tasks, not API mirrors
3. **"Smart Database"** - Return structured data; let LLM analyze
4. **Design for Agent** - Error messages help agents decide next steps

### Current Tool Inventory

**Query Tools (14 total):**
- 7 list tools: list_workflows, list_capabilities, list_personas, list_components, list_tokens, list_views, list_interactions
- 7 get tools: get_workflow, get_capability, get_persona, get_component, get_tokens, get_view, get_interaction

**Mutation Tools (21 total):**
- 7 create tools
- 7 update tools
- 7 delete tools

**Analysis Tools (7 total):**
- validate, coverage_report, find_gaps, find_orphans, suggest_priority, export_diagram, generate_tests

**Relationship Tools (2 total):**
- link, unlink

---

## Quality Framework Summary

### The Quality Principle

Designloom is only as good as the data you put into it. Each entity type has specific quality criteria documented in `design/framework.md`.

### Quality Levels Pattern

Each entity type has three quality levels:

| Level | Description |
|-------|-------------|
| **Level 1** | Starting point (assumptions, basic) |
| **Level 2** | Standard (validated, specified) |
| **Level 3** | Target (production-ready, comprehensive) |

### Key Quality Questions by Entity

**Personas:**
- Is it research-based? Can you cite the interviews?
- Are goals specific? "Quickly identify anomalies" not "do their job"
- Would the team use this? Is it memorable?

**Workflows:**
- Is the goal user-focused? Written from user's perspective?
- Are success criteria measurable? Quantifiable targets?
- Is it validated? Only set `validated: true` after user testing

**Capabilities:**
- Is it implementation-agnostic? Describes "what" not "how"?
- Does it follow INVEST? Independent, Negotiable, Valuable, Estimable, Small, Testable
- Are requirements testable? "Files up to 100MB" not "large files"

**Components:**
- Does it implement a capability? Connected to at least one?
- Is the scope appropriate? Not too large (page) or small (CSS property)?
- Are dependencies explicit? Lists all required components?

**Tokens:**
- Are semantic tokens meaningful? Names describe purpose, not appearance?
- Is there token bloat? Each token used 3+ times?
- Are colors accessible? All text/background combos meet WCAG AA (4.5:1)?

**Views:**
- Is the layout semantic? Uses type like `dashboard` not pixel specs?
- Are all states covered? Empty, loading, error states defined?
- Is responsive behavior specified? Visibility/sizing at breakpoints?

**Interactions:**
- Are all states defined? Default, hover, focus, active, disabled?
- Is it keyboard accessible? Can navigate and activate with keyboard?
- Is reduced motion supported? Alternative for prefers-reduced-motion?

---

## Implementation Details

### Store Architecture

The `DesignDocsStore` class manages YAML files:

```typescript
export type EntityType =
  | "workflow"
  | "capability"
  | "persona"
  | "component"
  | "tokens"
  | "view"
  | "interaction";
```

Each entity type has:
- A cache (Map from ID to entity)
- A directory path for YAML files
- CRUD operations (list, get, create, update, delete)
- Reference validation on create/update

### Reference Validation

When creating/updating entities:
- **Workflows** validate: personas, capabilities, components exist
- **Capabilities** validate: (none required)
- **Components** validate: capabilities, workflows, component dependencies exist
- **Tokens** validate: parent token set (extends) exists
- **Views** validate: workflows, zone components exist
- **Interactions** validate: (none required, but tracks components_using)

### Input Types Pattern

Each entity has input types for create/update:

```typescript
// Create input - all required fields
interface CreateTokensInput {
    id: string;
    name: string;
    colors: { neutral: {...} };
    typography: { sizes: { base: string } };
    spacing: { scale: {...} };
    // ... optional fields
}

// Update input - all fields optional
interface UpdateTokensInput {
    name?: string;
    description?: string;
    extends?: string;
    colors?: {...};
    // ... all fields optional
}
```

---

## Web Research Sources

This section contains all URLs researched during the design of the Designloom schemas. These sources informed the quality criteria, schema structures, and implementation decisions.

### Persona Research

| URL | Key Insight |
|-----|-------------|
| https://www.nngroup.com/articles/persona/ | Personas make users memorable; must be research-based, goal-focused |
| https://www.nngroup.com/articles/persona-types/ | Three progression levels: Proto → Qualitative → Statistical |
| https://medium.com/salesforce-ux/best-practices-on-creating-effective-personas-620a5076bdd2 | Best practices on creating effective, actionable personas |
| https://maze.co/guides/user-personas/ | Comprehensive guide to UX personas |
| https://www.interaction-design.org/literature/article/user-persona-guide | How to create research-backed user personas |

### Workflow & Journey Mapping

| URL | Key Insight |
|-----|-------------|
| https://www.nngroup.com/articles/user-journeys-vs-user-flows/ | Journeys are emotional, flows are functional - need both |
| https://www.appcues.com/blog/user-journey-map | User journey map ultimate guide |
| https://userpilot.com/blog/critical-user-journey/ | Critical user journey mapping for UX designers |
| https://www.figma.com/resource-library/user-journey-map/ | User journey mapping methodology |

### Requirements & Capabilities

| URL | Key Insight |
|-----|-------------|
| https://www.altexsoft.com/blog/functional-and-non-functional-requirements-specification-and-types/ | Functional vs non-functional requirements |
| https://framework.scaledagile.com/features-and-capabilities | SAFe features and capabilities framework |
| https://www.nuclino.com/articles/functional-requirements | Guide to functional requirements |
| https://www.computer.org/resources/software-requirements-specifications | IEEE software requirements specification guide |

### Design Systems & Components (Atomic Design)

| URL | Key Insight |
|-----|-------------|
| https://atomicdesign.bradfrost.com/chapter-2/ | Atomic Design methodology: atoms → molecules → organisms → templates → pages |
| https://www.uxpin.com/studio/blog/atomic-design-system/ | Atomic design systems component checklist |
| https://www.justinmind.com/ui-design/atomic-design | Building better UIs with atomic design principles |
| https://kajoo.ai/blog/building-design-systems-with-atomic-principles | Building design systems with atomic principles |

### Design Tokens (DTCG)

| URL | Key Insight |
|-----|-------------|
| https://tr.designtokens.org/format/ | W3C Design Tokens Community Group format specification |
| https://docs.tokens.studio/ | Tokens Studio documentation and best practices |
| https://www.supernova.io/blog/design-tokens-101 | Design tokens 101 introduction |
| https://uxdesign.cc/design-tokens-the-atomic-units-of-design-systems-3e0d7b73bdd5 | Design tokens as atomic units of design systems |
| https://medium.com/eightshapes-llc/naming-tokens-in-design-systems-9e86c7444676 | Nathan Curtis on naming design tokens |
| https://css-tricks.com/what-are-design-tokens/ | Responsive design tokens overview |

### Views & Layouts

| URL | Key Insight |
|-----|-------------|
| https://alistapart.com/article/responsive-web-design/ | Ethan Marcotte's original responsive web design article |
| https://web.dev/patterns/layout/ | Google's layout patterns reference |
| https://css-tricks.com/the-holy-grail-layout-with-css-grid/ | Holy grail layout implementation |
| https://www.nngroup.com/articles/empty-state/ | Empty state UI design patterns |
| https://uxdesign.cc/what-you-should-know-about-skeleton-screens-a820c45a571a | Skeleton screens for loading states |
| https://www.smashingmagazine.com/2016/12/best-practices-for-animated-progress-indicators/ | Loading state best practices |

### Interactions & Microinteractions

| URL | Key Insight |
|-----|-------------|
| https://www.microinteractionsbook.com/ | Dan Saffer's microinteractions framework: Trigger → Rules → Feedback → Loops/Modes |
| https://m3.material.io/foundations/interaction/states/state-layers | Material Design 3 state layers (hover 8%, focus 12%, pressed 12%) |
| https://uxplanet.org/microinteractions-the-secret-of-great-app-design-4cfe70fbaccf | The 4 parts of every microinteraction |
| https://www.w3.org/WAI/WCAG21/Understanding/focus-visible.html | WCAG 2.1 focus visible requirements |
| https://www.a11yproject.com/posts/understanding-vestibular-disorders/ | Accessible animations and vestibular disorders |
| https://css-tricks.com/introduction-reduced-motion-media-query/ | prefers-reduced-motion media query |
| https://m3.material.io/styles/motion/easing-and-duration/tokens-specs | Material Design animation timing guidelines |
| https://webaim.org/techniques/keyboard/ | Keyboard accessibility techniques |

### MCP (Model Context Protocol) Design

| URL | Key Insight |
|-----|-------------|
| https://modelcontextprotocol.io/specification/2025-06-18/server/tools | MCP Tools specification |
| https://modelcontextprotocol.io/specification/2025-06-18/server/resources | MCP Resources specification |
| https://code.claude.com/docs/en/mcp | Claude Code MCP documentation |
| https://mcp-availability.com | MCP client feature support matrix |
| https://github.com/apify/mcp-client-capabilities | Apify MCP client capabilities registry |
| https://workos.com/blog/mcp-features-guide | WorkOS MCP features guide - tools vs resources distinction |
| https://www.docker.com/blog/mcp-server-best-practices/ | Docker MCP best practices - "agent is end user, not human" |
| https://www.matt-adams.co.uk/2025/08/30/mcp-design-principles.html | MCP design principles - "smart database, not smart analyst" |
| https://www.klavis.ai/blog/less-is-more-mcp-design-patterns-for-ai-agents | "Less is more" - more tools = worse performance |
| https://zuplo.com/blog/mcp-resources | MCP resources deep dive |
| https://www.pulsemcp.com/posts/mcp-client-capabilities-gap | MCP client capability gap analysis |
| https://hackteam.io/blog/your-llm-does-not-care-about-mcp/ | "LLM doesn't care about MCP" - just sees tool definitions |
| https://www.anthropic.com/engineering/writing-tools-for-agents | Anthropic's guide to writing tools for agents - token budget considerations |

### Key Research Insights

#### From Nielsen Norman Group
- Personas must be research-based, not demographic-focused
- Goals drive design decisions; demographics rarely do
- Three persona quality levels provide upgrade path

#### From Material Design 3
- State layer opacity system (0%, 8%, 12%, 38%)
- Consistent elevation/shadow tokens
- Duration and easing token patterns

#### From Dan Saffer
- Every microinteraction has four parts
- Feedback is how system communicates, not just animation
- Loops/modes allow interactions to evolve over time

#### From DTCG
- Three-tier token architecture (primitive → semantic → component)
- Token references with `{curly.brace.syntax}`
- Platform-agnostic token definitions

#### From Anthropic
- 15 tools with schemas = ~5-7% of context before any user input
- Tools should be workflow-based, not API mirrors
- Error messages should help agents decide next steps

---

## Open Questions & Future Work

### Schema Questions

1. **Token inheritance**: Should dark mode tokens inherit and override, or be fully independent?
2. **View composition**: Should views be able to include/extend other views?
3. **Interaction inheritance**: Should interaction patterns support extension?

### Implementation Questions

1. **Bi-directional sync**: When a component references an interaction pattern, should the pattern track `components_using` automatically?
2. **Cascade deletes**: When deleting a token set, what happens to tokens that extend it?
3. **Validation depth**: How deep should reference validation go? (e.g., validate component's interaction pattern's accessibility?)

### Future Entity Types to Consider

1. **Animations** - Keyframe definitions separate from interactions
2. **Icons** - Icon library management
3. **Copy/Content** - Microcopy, labels, error messages
4. **Layouts** - Shared layout definitions (header, footer) across views

### MCP Enhancements

1. **Resources**: If client support improves, expose entities as resources
2. **Subscriptions**: Real-time updates when entities change
3. **Prompts**: Pre-built prompt templates for common tasks

### Quality Tool Enhancements

1. **Accessibility audit**: Check all interactions for WCAG compliance
2. **Token coverage**: Report which token values are unused
3. **Interaction coverage**: Report components without interaction patterns

---

## Appendix: Schema Field Reference

### Tokens Required Fields

| Field | Required | Notes |
|-------|----------|-------|
| `id` | Yes | kebab-case theme identifier |
| `name` | Yes | Human-readable name |
| `colors.neutral` | Yes | Every UI needs grays |
| `typography.sizes.base` | Yes | Foundation for type scale |
| `spacing.scale` | Yes | Consistent spacing |

### View Required Fields

| Field | Required | Notes |
|-------|----------|-------|
| `id` | Yes | V01, V02 pattern |
| `name` | Yes | Descriptive screen name |
| `layout.type` | Yes | Semantic layout pattern |
| `layout.zones` | Yes | At least one zone |

### Interaction Required Fields

| Field | Required | Notes |
|-------|----------|-------|
| `id` | Yes | kebab-case pattern name |
| `name` | Yes | Human-readable name |
| `interaction` | Yes | The interaction definition |

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2025-01-15 | 1.0 | Initial research document |

---

*This document was created to preserve institutional knowledge across Claude Code sessions. It captures design decisions, research sources, and implementation details that would otherwise be lost to context limits.*
