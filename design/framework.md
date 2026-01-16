# Designloom Quality Framework

A research-based guide for creating high-quality design artifacts in Designloom. This framework synthesizes industry best practices from UX research, product management, and design systems methodology.

---

## Table of Contents

1. [Overview](#overview)
2. [Personas](#personas)
3. [Workflows](#workflows)
4. [Capabilities](#capabilities)
5. [Components](#components)
6. [Tokens](#tokens)
7. [Views](#views)
8. [Interactions](#interactions)
9. [Sources](#sources)
10. [Quality Validation Checklist](#quality-validation-checklist)
11. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)
12. [References](#references)

---

## Overview

### The Quality Principle

Designloom is only as good as the data you put into it. Each entity type serves a specific purpose in the design system, and quality criteria differ for each. This framework provides:

- **Quality criteria** for evaluating each entity type
- **Checklists** to validate completeness
- **Anti-patterns** to avoid common mistakes
- **Examples** of good vs. poor implementations

### The Traceability Chain

Every design decision should trace back to user needs:

```
PERSONA (who?) → WORKFLOW (what need?) → CAPABILITY (what feature?) → COMPONENT (how built?)
```

A well-designed system has complete traceability: every component implements a capability, every capability serves a workflow, and every workflow serves a persona.

---

## Personas

### Purpose

Personas are fictional representations of user archetypes based on research. They help teams maintain empathy with users and make design decisions that serve real needs.

### Quality Criteria

A high-quality persona:

| Criterion | Description | Why It Matters |
|-----------|-------------|----------------|
| **Research-based** | Grounded in actual user interviews, surveys, or observational data | Prevents echo chambers of team assumptions |
| **Goal-focused** | Emphasizes what users want to achieve, not demographics | Goals drive design decisions; demographics rarely do |
| **Context-specific** | Reflects how users interact with *this* product specifically | Generic personas don't inform specific design choices |
| **Actionable** | Every detail could influence a design decision | Irrelevant details waste attention and dilute focus |
| **Memorable** | Has a name, role, and quote that stick in memory | Teams refer to personas by name during discussions |

### Required Fields Assessment

| Field | Quality Standard |
|-------|-----------------|
| `id` | Kebab-case, memorable (e.g., `analyst-alex`, not `user-1`) |
| `name` | Full human name that aids recall |
| `role` | Specific job title or function, not vague ("Financial Analyst" not "User") |
| `characteristics.expertise` | Honest assessment of skill level (novice/intermediate/expert) |
| `goals` | **Minimum 2-3 goals** that are specific and actionable |
| `frustrations` | Real pain points discovered in research, not assumptions |

### Optional Fields That Add Value

| Field | When to Include |
|-------|-----------------|
| `quote` | When you have a memorable verbatim from research |
| `bio` | When background context affects product usage |
| `motivations` | When underlying drivers differ from surface goals |
| `behaviors` | When current workarounds reveal unmet needs |
| `context.frequency` | When usage patterns affect feature prioritization |
| `context.devices` | When cross-device experience matters |

### Persona Quality Checklist

- [ ] **Is it research-based?** Can you cite the interviews, surveys, or studies that informed this persona?
- [ ] **Does every detail serve a purpose?** Would removing any field change design decisions?
- [ ] **Are goals specific?** "Quickly identify anomalies" is better than "do their job"
- [ ] **Are frustrations real?** Derived from research, not team speculation?
- [ ] **Is expertise accurate?** Based on observed behavior, not assumptions?
- [ ] **Would the team use this?** Is it memorable enough to reference in discussions?
- [ ] **Is it distinct?** Does this persona differ meaningfully from others?

### Persona Quality Levels

**Level 1 - Proto Persona (Starting Point)**
- Based on team assumptions
- Useful for early alignment
- Must be validated with research

**Level 2 - Qualitative Persona (Standard)**
- Based on 5-15 user interviews
- Includes real quotes and observed behaviors
- Sufficient for most design decisions

**Level 3 - Statistical Persona (Advanced)**
- Combines qualitative + quantitative data
- Validated with survey data
- Includes confidence levels for characteristics

### Example: Good vs. Poor Persona

**Poor Persona:**
```yaml
id: user-1
name: John
role: User
characteristics:
  expertise: intermediate
goals:
  - Use the product
  - Be productive
```
*Problems: Generic name, vague role, meaningless goals*

**Good Persona:**
```yaml
id: analyst-alex
name: Alex Chen
role: Financial Analyst at mid-size investment firm
quote: "I need insights fast, not a learning curve"
characteristics:
  expertise: intermediate
  time_pressure: high
  graph_literacy: basic
  domain_knowledge: financial networks
goals:
  - Quickly identify anomalies in transaction networks
  - Generate compliance reports for quarterly audits
  - Explain findings to non-technical stakeholders
frustrations:
  - Tools that require extensive training before productive use
  - Slow data loading with large datasets (>10k nodes)
  - Inability to export visualizations for presentations
context:
  frequency: weekly
  devices: [desktop, laptop]
sources:
  - title: "User Interview - Financial Analyst Segment"
    url: "https://research.internal/interviews/fa-segment"
    summary: "Key pain points around performance and onboarding"
```
*Strengths: Specific role, measurable characteristics, actionable goals, research-backed*

---

## Workflows

### Purpose

Workflows describe user journeys—the sequences of actions users take to accomplish goals. They capture not just *what* users do, but the context, emotions, and success criteria for their tasks.

### Quality Criteria

A high-quality workflow:

| Criterion | Description | Why It Matters |
|-----------|-------------|----------------|
| **User-centered** | Describes what *users* accomplish, not system features | Keeps focus on outcomes, not implementation |
| **Goal-oriented** | Has a clear, measurable outcome | Enables validation of completion |
| **Contextual** | Includes starting state and preconditions | Helps identify edge cases and variations |
| **Measurable** | Has quantifiable success criteria | Enables objective assessment of success |
| **Persona-linked** | Connected to specific user archetypes | Ensures features serve real users |

### Required Fields Assessment

| Field | Quality Standard |
|-------|-----------------|
| `id` | Sequential pattern W01, W02, etc. |
| `name` | Action-oriented name ("First Load Experience" not "Loading") |
| `category` | Accurate categorization (onboarding/analysis/exploration/reporting/collaboration/administration) |
| `goal` | **Single, clear statement** of what user accomplishes |
| `personas` | At least one persona who performs this workflow |

### Optional Fields That Add Value

| Field | When to Include |
|-------|-----------------|
| `success_criteria` | **Highly recommended** - measurable outcomes |
| `starting_state` | When preconditions affect the workflow |
| `requires_capabilities` | After capability planning phase |
| `suggested_components` | After component design phase |
| `validated` | Set to true only after user testing confirms the workflow |

### Success Criteria Quality

Success criteria transform vague goals into measurable outcomes. Use the SMART framework:

| Attribute | Meaning | Example |
|-----------|---------|---------|
| **Specific** | Clearly defined metric | "time_to_first_visualization" |
| **Measurable** | Quantifiable value | "< 60 seconds" |
| **Achievable** | Realistic target | Based on benchmarks or research |
| **Relevant** | Connected to user goal | Matters to the persona |
| **Time-bound** | Has temporal context | Per session, daily, etc. |

### Workflow Quality Checklist

- [ ] **Is the goal user-focused?** Written from user's perspective, not system's?
- [ ] **Is the goal specific?** "Successfully load first dataset and see meaningful visualization" not "use the product"
- [ ] **Is it linked to personas?** At least one persona performs this workflow?
- [ ] **Are success criteria measurable?** Can you objectively determine if the target was met?
- [ ] **Is the category accurate?** Does it reflect the workflow's primary purpose?
- [ ] **Is starting_state defined?** When preconditions matter to the workflow?
- [ ] **Is it validated?** Only set `validated: true` after user testing confirms it works?

### Workflow Quality Levels

**Level 1 - Assumed Workflow (Starting Point)**
- Based on team's understanding of user needs
- Not yet validated with users
- `validated: false`

**Level 2 - Observed Workflow (Standard)**
- Based on user research or analytics
- Has measurable success criteria
- Linked to research sources

**Level 3 - Validated Workflow (Target)**
- Confirmed through usability testing
- Success criteria met in testing
- `validated: true`

### Example: Good vs. Poor Workflow

**Poor Workflow:**
```yaml
id: W01
name: Data Loading
category: data
goal: Load data
```
*Problems: Vague name, wrong category, no success criteria, no personas*

**Good Workflow:**
```yaml
id: W01
name: First Load Experience
category: onboarding
goal: Successfully load first dataset and see meaningful visualization within 60 seconds
personas:
  - analyst-alex
  - researcher-riley
starting_state:
  data_type: none
  user_expertise: novice
success_criteria:
  - metric: time_to_first_visualization
    target: "< 60 seconds"
  - metric: user_success_rate
    target: "> 90%"
  - metric: help_documentation_accessed
    target: "< 20% of users"
validated: false
sources:
  - title: "Onboarding Research Study"
    url: "https://research.internal/onboarding-2024"
    summary: "Users abandon tools that take >2 min to show value"
```
*Strengths: Clear outcome, measurable criteria, linked to personas and research*

---

## Capabilities

### Purpose

Capabilities describe *what* the system can do, independent of *how* it's implemented. They bridge user needs (workflows) and technical implementation (components), keeping the focus on functionality rather than UI specifics.

### Quality Criteria

A high-quality capability:

| Criterion | Description | Why It Matters |
|-----------|-------------|----------------|
| **Implementation-agnostic** | Describes "what" not "how" | Allows flexibility in implementation |
| **Workflow-connected** | Serves at least one user workflow | Ensures every feature has a purpose |
| **Clearly scoped** | Has defined boundaries | Prevents scope creep and overlap |
| **Testable** | Can verify if it's working | Enables quality assurance |
| **Independent** | Minimal dependencies on other capabilities | Allows parallel development |

### The INVEST Framework for Capabilities

Apply the INVEST framework (adapted from user stories):

| Letter | Criterion | Application |
|--------|-----------|-------------|
| **I** | Independent | Can be implemented without other capabilities |
| **N** | Negotiable | Details can be discussed; not over-specified |
| **V** | Valuable | Clearly serves a user workflow |
| **E** | Estimable | Scope is clear enough to estimate effort |
| **S** | Small | Appropriately sized (not a multi-month epic) |
| **T** | Testable | Clear criteria for "done" |

### Required Fields Assessment

| Field | Quality Standard |
|-------|-----------------|
| `id` | Kebab-case, descriptive (e.g., `data-import`, `node-filtering`) |
| `name` | Clear, concise name |
| `category` | Accurate (data/visualization/analysis/interaction/export/collaboration/performance) |
| `description` | **What it does, not how** - 1-2 sentences |

### Optional Fields That Add Value

| Field | When to Include |
|-------|-----------------|
| `requirements` | **Highly recommended** - specific functional requirements |
| `status` | Track implementation progress (planned/in-progress/implemented/deprecated) |
| `algorithms` | When specific algorithms or approaches are required |
| `used_by_workflows` | Auto-maintained, but verify accuracy |
| `implemented_by_components` | Auto-maintained after linking |

### Requirements Quality

Good requirements follow IEEE standards:

| Quality | Description | Example |
|---------|-------------|---------|
| **Clear** | Unambiguous, one interpretation | "Support CSV files with headers" |
| **Complete** | Covers all scenarios | Includes error cases |
| **Consistent** | No contradictions | All formats use same approach |
| **Testable** | Verifiable | "Files up to 100MB" (testable) vs "large files" (not testable) |
| **Traceable** | Links to source | References research or standards |

### Capability Quality Checklist

- [ ] **Is it implementation-agnostic?** Describes "what" not "how"?
- [ ] **Does it serve a workflow?** Connected to at least one user need?
- [ ] **Is the description clear?** Someone unfamiliar could understand it?
- [ ] **Are requirements specific?** Testable, measurable criteria?
- [ ] **Is scope appropriate?** Not too large (epic) or too small (task)?
- [ ] **Is it independent?** Can be implemented without waiting for others?
- [ ] **Is the category accurate?** Reflects the capability's domain?
- [ ] **Is status current?** Reflects actual implementation state?

### Capability Quality Levels

**Level 1 - Identified Capability (Starting Point)**
- Exists because a workflow needs it
- Basic description only
- `status: planned`

**Level 2 - Specified Capability (Standard)**
- Has detailed requirements
- Linked to workflows and components
- Ready for implementation

**Level 3 - Validated Capability (Target)**
- Implementation complete
- Tested against requirements
- `status: implemented`

### Example: Good vs. Poor Capability

**Poor Capability:**
```yaml
id: import
name: Import
category: data
description: Allows importing data
```
*Problems: Vague ID, no requirements, not testable*

**Good Capability:**
```yaml
id: data-import
name: Data Import
category: data
description: Import graph data from various file formats into the visualization system
status: planned
requirements:
  - Support CSV format with header row for node/edge definitions
  - Support JSON format following vis.js data structure
  - Support GraphML format (version 1.0+)
  - Handle files up to 100MB without browser memory issues
  - Provide progress feedback for files >5MB
  - Validate file structure before full parse
  - Report clear error messages for malformed files
algorithms:
  - streaming-parser
sources:
  - title: "Data Format Analysis"
    url: "https://research.internal/data-formats"
    summary: "CSV most common (68%), JSON second (24%), GraphML for interop"
```
*Strengths: Clear scope, testable requirements, research-backed priorities*

---

## Components

### Purpose

Components are the UI building blocks that implement capabilities. They follow atomic design principles: small, reusable pieces that compose into larger experiences.

### Quality Criteria

A high-quality component:

| Criterion | Description | Why It Matters |
|-----------|-------------|----------------|
| **Single responsibility** | Does one thing well | Promotes reusability |
| **Capability-linked** | Implements specific capabilities | Ensures traceability |
| **Well-documented** | Clear props and behavior | Enables team collaboration |
| **Appropriately scoped** | Right size (atom/molecule/organism) | Fits design system hierarchy |
| **Dependency-aware** | Explicit dependencies | Enables proper build order |

### Atomic Design Hierarchy

Components should fit into the atomic design hierarchy:

| Level | Description | Examples |
|-------|-------------|----------|
| **Atoms** | Basic building blocks | Button, Input, Icon, Label |
| **Molecules** | Simple combinations | Search field, Form group |
| **Organisms** | Complex combinations | Header, Dialog, Data table |
| **Templates** | Page structures | Dashboard layout, Settings page |

### Required Fields Assessment

| Field | Quality Standard |
|-------|-----------------|
| `id` | Kebab-case, descriptive (e.g., `data-import-dialog`) |
| `name` | Clear human-readable name |
| `category` | Accurate (dialog/control/display/layout/utility/navigation) |
| `description` | What it is and what it does |

### Optional Fields That Add Value

| Field | When to Include |
|-------|-----------------|
| `implements_capabilities` | **Required for meaningful components** |
| `used_in_workflows` | Links to user journeys |
| `dependencies` | Other components this requires |
| `props` | Component interface documentation |
| `status` | Implementation progress |

### Props Documentation Quality

Props should be documented with TypeScript-style signatures:

```yaml
props:
  onImport: "(data: GraphData) => void"
  allowedFormats: "string[]"
  maxFileSize: "number (bytes)"
  showProgress: "boolean"
```

### Component Quality Checklist

- [ ] **Does it implement a capability?** Connected to at least one capability?
- [ ] **Is the scope appropriate?** Not too large (page) or too small (CSS property)?
- [ ] **Is the category accurate?** Reflects the component's role in UI?
- [ ] **Are dependencies explicit?** Lists all required components?
- [ ] **Are props documented?** Clear interface for developers?
- [ ] **Is it reusable?** Could be used in multiple contexts?
- [ ] **Does the name describe its function?** "data-import-dialog" not "modal-1"?

### Component Quality Levels

**Level 1 - Identified Component (Starting Point)**
- Exists because a capability needs implementation
- Basic description
- `status: planned`

**Level 2 - Designed Component (Standard)**
- Props documented
- Dependencies identified
- Ready for development

**Level 3 - Implemented Component (Target)**
- Code complete
- Tested
- `status: implemented`

### Example: Good vs. Poor Component

**Poor Component:**
```yaml
id: dialog
name: Dialog
category: dialog
description: A dialog box
```
*Problems: Generic, no capability link, no props, no dependencies*

**Good Component:**
```yaml
id: data-import-dialog
name: Data Import Dialog
category: dialog
description: Modal dialog for selecting, validating, and importing graph data files with progress feedback
status: planned
implements_capabilities:
  - data-import
used_in_workflows:
  - W01
  - W02
dependencies:
  - file-picker
  - progress-bar
  - format-selector
  - error-display
props:
  onImport: "(data: GraphData) => void"
  onCancel: "() => void"
  allowedFormats: "['csv', 'json', 'graphml']"
  maxFileSize: "104857600 (100MB)"
  validateBeforeImport: "boolean (default: true)"
sources:
  - title: "Import UX Research"
    url: "https://research.internal/import-ux"
    summary: "Users expect drag-drop and clear progress indication"
```
*Strengths: Clear purpose, capability-linked, documented interface, explicit dependencies*

---

## Tokens

### Purpose

Tokens are the atomic visual properties that define your design language. They capture colors, typography, spacing, and effects as named, reusable values that can be transformed into any platform (CSS, iOS, Android). Tokens bridge design and code, creating a single source of truth for visual consistency.

### The Token Hierarchy

Tokens follow a three-tier architecture from raw values to semantic meaning:

| Tier | Purpose | Example |
|------|---------|---------|
| **Primitive (Option)** | Raw values without meaning | `blue-500: #0066FF` |
| **Semantic (Decision)** | Purpose-driven aliases | `color-interactive: {blue-500}` |
| **Component** | Component-specific overrides | `button-primary-bg: {color-interactive}` |

**Key principle:** Start with two tiers (primitive + semantic). Add component tokens only when needed—the "Rule of Three" applies: if a value is used in 3+ places with the same meaning, consider a token.

### Quality Criteria

A high-quality token system:

| Criterion | Description | Why It Matters |
|-----------|-------------|----------------|
| **Semantic naming** | Names describe purpose, not value | `text-primary` not `gray-900` |
| **Complete coverage** | All visual properties tokenized | Prevents hardcoded values |
| **Appropriately scoped** | Not over-engineered | Avoids token bloat |
| **Responsive-aware** | Values adapt to breakpoints | Supports fluid design |
| **Accessible** | Color contrasts meet WCAG | Legal and ethical requirement |

### What to Include

| Category | Essential Tokens | Why Needed |
|----------|------------------|------------|
| **Colors** | Primary, neutral, semantic (error/success/warning) | Brand consistency, feedback |
| **Typography** | Font families, size scale, weights, line heights | Readable, consistent text |
| **Spacing** | Scale (4, 8, 12, 16...), semantic (gap, padding) | Visual rhythm, alignment |
| **Radii** | Border radius scale | Consistent roundness |
| **Shadows** | Elevation levels | Depth, hierarchy |
| **Motion** | Durations, easings | Consistent animations |
| **Breakpoints** | Responsive thresholds | Adaptive layouts |

### What to Omit

| Omit | Why |
|------|-----|
| **One-off values** | If used once, hardcode it |
| **Component-specific tokens for everything** | Creates bloat; use semantic tokens |
| **Tokens without semantic meaning** | `color-7` tells you nothing |
| **Tokens duplicating existing values** | Reference existing tokens instead |
| **Platform-specific values** | Let tooling transform tokens per platform |

### Required Fields Assessment

| Field | Quality Standard |
|-------|-----------------|
| `id` | Kebab-case theme identifier (e.g., `default-theme`, `dark-mode`) |
| `name` | Human-readable name |
| `colors.neutral` | **Required** - every UI needs grays |
| `typography.sizes.base` | **Required** - foundation for type scale |
| `spacing.scale` | **Required** - consistent spacing |

### Naming Conventions

Follow this pattern: `[category].[element].[variant].[state]`

| Pattern | Example | Meaning |
|---------|---------|---------|
| `color.text.primary` | `#1F2937` | Primary text color |
| `color.text.secondary` | `#6B7280` | Secondary/muted text |
| `color.bg.surface` | `#FFFFFF` | Surface background |
| `color.border.default` | `#E5E7EB` | Default border |
| `color.interactive.hover` | `#0052CC` | Interactive element hover |

### Responsive Values

Tokens can be responsive using breakpoint variants:

```yaml
spacing:
  page_margin:
    base: "16px"    # Mobile
    md: "24px"      # Tablet
    lg: "48px"      # Desktop
```

Or fluid values:

```yaml
typography:
  sizes:
    h1:
      min: "28px"      # At 320px viewport
      max: "48px"      # At 1280px viewport
      # Generates: clamp(28px, 5vw, 48px)
```

### Token Quality Checklist

- [ ] **Are primitives complete?** Full color scales, type scale, spacing scale?
- [ ] **Are semantic tokens meaningful?** Names describe purpose, not appearance?
- [ ] **Is the hierarchy flat enough?** Maximum 3 tiers; 2 preferred?
- [ ] **Is there token bloat?** Each token used 3+ times?
- [ ] **Are colors accessible?** All text/background combos meet WCAG AA (4.5:1)?
- [ ] **Are breakpoints defined?** Consistent responsive behavior?
- [ ] **Is dark mode supported?** Semantic tokens can be re-themed?

### Token Quality Levels

**Level 1 - Foundation Tokens (Starting Point)**
- Basic color palette and type scale
- Enough to build initial components
- May have gaps

**Level 2 - Complete Tokens (Standard)**
- Full semantic token coverage
- All components can be styled
- Responsive values defined

**Level 3 - Themeable Tokens (Advanced)**
- Supports multiple themes (light/dark)
- Component tokens where needed
- DTCG-compliant format

### Example: Good vs. Poor Tokens

**Poor Tokens:**
```yaml
id: theme
colors:
  blue: "#0066FF"
  gray: "#666666"
  red: "#FF0000"
typography:
  size1: "12px"
  size2: "14px"
  size3: "16px"
```
*Problems: Non-semantic names, no hierarchy, incomplete coverage, no responsive values*

**Good Tokens:**
```yaml
id: default-theme
name: Default Light Theme
colors:
  primary:
    500: "#0066FF"
    600: "#0052CC"
  neutral:
    50: "#F9FAFB"
    100: "#F3F4F6"
    500: "#6B7280"
    700: "#374151"
    900: "#111827"
  semantic:
    text_primary: "{colors.neutral.900}"
    text_secondary: "{colors.neutral.500}"
    background: "{colors.neutral.50}"
    surface: "#FFFFFF"
    interactive: "{colors.primary.500}"
    interactive_hover: "{colors.primary.600}"
  error:
    base: "#EF4444"
    light: "#FEE2E2"
    contrast: "#FFFFFF"
typography:
  fonts:
    sans: "Inter, system-ui, sans-serif"
  sizes:
    xs: "12px"
    sm: "14px"
    base: "16px"
    lg: "18px"
    xl: "20px"
    2xl: "24px"
  styles:
    h1:
      font_size: { base: "30px", lg: "36px" }
      font_weight: 700
      line_height: 1.2
    body:
      font_size: "16px"
      font_weight: 400
      line_height: 1.5
spacing:
  scale:
    1: "4px"
    2: "8px"
    3: "12px"
    4: "16px"
    6: "24px"
    8: "32px"
  semantic:
    page_margin: { base: "16px", lg: "48px" }
    component_padding: "16px"
    gap_md: "16px"
radii:
  sm: "4px"
  md: "8px"
  lg: "12px"
  full: "9999px"
shadows:
  sm: "0 1px 2px rgba(0,0,0,0.05)"
  md: "0 4px 6px rgba(0,0,0,0.1)"
breakpoints:
  sm: "640px"
  md: "768px"
  lg: "1024px"
  xl: "1280px"
sources:
  - title: "Brand Guidelines v2.0"
    url: "https://brand.internal/guidelines"
    summary: "Primary blue #0066FF, Inter font family"
```
*Strengths: Semantic naming, complete coverage, responsive values, WCAG-ready contrasts*

---

## Views

### Purpose

Views define screen layouts—where components are placed and how they respond to different screen sizes. A View merges the concepts of "template" (structure) and "page" (content) into a single entity with multiple states.

### The View Model

Views consist of three parts:

| Part | Purpose | Example |
|------|---------|---------|
| **Layout** | Structural arrangement | Sidebar-left, dashboard, single-column |
| **Zones** | Named regions | header, sidebar, main, footer |
| **States** | Content variations | empty, loading, populated, error |

### Quality Criteria

A high-quality view:

| Criterion | Description | Why It Matters |
|-----------|-------------|----------------|
| **Workflow-connected** | Serves specific user workflows | Ensures screens have purpose |
| **Responsively designed** | Adapts to all screen sizes | Works on mobile to desktop |
| **State-complete** | Handles empty, loading, error states | No broken experiences |
| **Zone-organized** | Clear component placement | Enables consistent layouts |
| **Route-defined** | Has clear navigation paths | Users can find it |

### Layout Types

Define layout using semantic patterns, not pixel values:

| Layout Type | Structure | Best For |
|-------------|-----------|----------|
| `single-column` | Centered content, constrained width | Articles, forms, settings |
| `sidebar-left` | Fixed sidebar + flexible main | Dashboards, admin panels |
| `sidebar-right` | Main content + contextual sidebar | Detail views with metadata |
| `holy-grail` | Header + sidebar + main + footer | Traditional app layouts |
| `dashboard` | Header + sidebar + grid content | Analytics, monitoring |
| `split` | Two equal columns | Comparison, onboarding |
| `stacked` | Full-width sections | Landing pages, marketing |

### Zone Specification

Zones should describe **what** goes where, not **exact pixels**:

| Include | Omit |
|---------|------|
| Zone purpose (header, main, sidebar) | Fixed pixel dimensions |
| Responsive visibility (hidden on mobile) | Exact coordinates |
| Component placement | CSS implementation details |
| Scroll behavior | Browser-specific hacks |
| Semantic sizing (flex-1, 280px sidebar) | Magic numbers |

### Required Fields Assessment

| Field | Quality Standard |
|-------|-----------------|
| `id` | Pattern V01, V02, etc. |
| `name` | Descriptive screen name |
| `layout.type` | Semantic layout pattern |
| `layout.zones` | At least one zone defined |
| `workflows` | Connected to user workflows |

### Responsive Design in Views

Specify responsive behavior at the zone level:

```yaml
layout:
  type: sidebar-left
  zones:
    - id: sidebar
      position: sidebar-left
      width: "280px"
      visibility:
        base: hidden      # Hidden on mobile
        md: drawer        # Slide-out on tablet
        lg: visible       # Always visible on desktop
    - id: main
      position: main
      width: flex-1       # Fill remaining space
```

**Key principle:** Describe *what happens* at breakpoints, not *how to implement it*.

### View States

Every view should define states for common scenarios:

| State | When to Use | What to Show |
|-------|-------------|--------------|
| `default` | Normal operation | Standard content |
| `empty` | No data available | Empty state with CTA |
| `loading` | Fetching data | Skeleton/spinner |
| `error` | Operation failed | Error message + retry |
| `success` | Action completed | Confirmation feedback |

States override zone content without changing layout:

```yaml
states:
  - id: empty
    type: empty
    zones:
      - zone_id: main
        components:
          - component: empty-state-card
            props:
              title: "No projects yet"
              action: "Create Project"
```

### View Quality Checklist

- [ ] **Is it workflow-connected?** Linked to at least one workflow?
- [ ] **Is the layout semantic?** Uses type like `dashboard` not pixel specs?
- [ ] **Are zones clearly defined?** Each zone has a purpose?
- [ ] **Is responsive behavior specified?** Visibility/sizing at breakpoints?
- [ ] **Are all states covered?** Empty, loading, error states defined?
- [ ] **Is routing defined?** URL path and parameters specified?
- [ ] **Is data flow clear?** Data requirements documented?

### View Quality Levels

**Level 1 - Wireframe View (Starting Point)**
- Layout type selected
- Zones identified with components
- Basic structure defined

**Level 2 - Responsive View (Standard)**
- Responsive behavior at all breakpoints
- All states (empty, loading, error) defined
- Routes and data requirements documented

**Level 3 - Production View (Target)**
- Validated against actual content
- Edge cases handled
- Performance considerations noted

### Example: Good vs. Poor View

**Poor View:**
```yaml
id: V01
name: Dashboard
layout:
  zones:
    - id: zone1
      width: "250px"
      height: "100%"
    - id: zone2
      width: "calc(100% - 250px)"
```
*Problems: No layout type, CSS implementation details, no responsive behavior, no states, no workflow connection*

**Good View:**
```yaml
id: V01
name: Analytics Dashboard
description: Main dashboard showing key metrics and recent activity
workflows:
  - W01  # First Load Experience
  - W03  # Daily Analytics Review

layout:
  type: dashboard
  zones:
    - id: header
      position: header
      components: [main-nav, user-menu, search]
      sticky: true

    - id: sidebar
      position: sidebar-left
      width: "280px"
      components: [filter-panel, quick-actions]
      visibility:
        base: hidden
        lg: visible

    - id: main
      position: main
      components: [metrics-grid, activity-feed]
      padding: { base: "16px", lg: "24px" }

states:
  - id: empty
    type: empty
    description: No data loaded yet
    zones:
      - zone_id: main
        components:
          - component: empty-state-card
            props:
              title: "No data yet"
              description: "Import your first dataset to see analytics"
              action: "Import Data"
              onAction: "navigate:/import"

  - id: loading
    type: loading
    zones:
      - zone_id: main
        components: [metrics-skeleton, activity-skeleton]

  - id: error
    type: error
    zones:
      - zone_id: main
        components:
          - component: error-card
            props:
              message: "Failed to load dashboard data"
              retry: true

routes:
  - path: "/dashboard"
    title: "Dashboard"
  - path: "/dashboard/:projectId"
    params:
      - name: projectId
        type: string
        required: true
    title: "Project Dashboard"

data_requirements:
  - id: metrics
    source: "/api/metrics"
    required: true
    loading_state: loading
    error_state: error
  - id: activity
    source: "/api/activity"
    required: false

sources:
  - title: "Dashboard Wireframes"
    url: "https://figma.com/file/dashboard-v2"
    summary: "Approved layout with sidebar navigation"
```
*Strengths: Semantic layout, responsive zones, complete states, clear routing, data requirements*

---

## Interactions

### Purpose

Interactions define how components respond to user actions. They specify component states (hover, focus, disabled), transitions between states, and microinteractions that provide feedback. Well-defined interactions enable consistent, accessible, and delightful user experiences.

### The Interaction Framework

Interactions are built from four concepts:

| Concept | Purpose | Example |
|---------|---------|---------|
| **States** | Visual modes a component can be in | default, hover, focus, disabled |
| **Transitions** | How to move between states | fade 150ms ease-out |
| **Microinteractions** | Small feedback moments | Button press animation |
| **Accessibility** | Keyboard and screen reader support | Focus visible, ARIA labels |

### Dan Saffer's Microinteraction Model

Every microinteraction has four parts:

| Part | Description | Example |
|------|-------------|---------|
| **Trigger** | What initiates the interaction | Click, hover, keystroke |
| **Rules** | What happens during | Validate input, update count |
| **Feedback** | How system communicates | Animation, color change, sound |
| **Loops/Modes** | How it changes over time | Repeat, escalate, timeout |

### Quality Criteria

A high-quality interaction:

| Criterion | Description | Why It Matters |
|-----------|-------------|----------------|
| **Complete states** | All relevant states defined | No missing hover/focus/disabled |
| **Consistent timing** | Uses token-defined durations | Cohesive feel across app |
| **Accessible** | Keyboard navigable, screen reader friendly | Inclusive design |
| **Purposeful** | Every animation serves a function | Not decorative noise |
| **Performant** | Runs at 60fps | Smooth experience |

### Standard Component States

Based on Material Design 3, define these states:

| State | CSS Pseudo | Opacity Overlay | When |
|-------|------------|-----------------|------|
| **Default** | — | 0% | Normal state |
| **Hover** | `:hover` | 8% | Mouse over (desktop) |
| **Focus** | `:focus-visible` | 12% | Keyboard focus |
| **Pressed** | `:active` | 12% | Being clicked |
| **Disabled** | `:disabled` | 38% content, 12% bg | Not interactive |
| **Dragged** | — | 16% | Being dragged |

### What to Include

| Include | Why |
|---------|-----|
| States that differ visually | Users need to see state changes |
| Transition timing and easing | Consistent animation feel |
| Keyboard shortcuts | Accessibility requirement |
| Focus indicators | WCAG requirement |
| Loading feedback | Users need to know system is working |
| Error feedback | Users need to know what went wrong |

### What to Omit

| Omit | Why |
|------|-----|
| Implementation details (CSS/JS code) | That's for developers |
| Browser-specific workarounds | Platform concerns |
| Exact pixel coordinates | Let implementation handle it |
| Complex animation sequences | Keep interactions simple |
| States with no visual difference | If it looks the same, don't define it |

### Required Fields Assessment

| Field | Quality Standard |
|-------|-----------------|
| `states` | At minimum: default, hover, focus, disabled |
| `states[].style` | Visual treatment for each state |
| `accessibility.keyboard` | Focusable, tab navigation |
| `accessibility.aria` | Role and required attributes |

### State Style Specification

Define state styles using tokens, not hardcoded values:

```yaml
states:
  - type: default
    style:
      background: "{colors.semantic.surface}"
      border_color: "{colors.semantic.border_default}"
      text_color: "{colors.semantic.text_primary}"

  - type: hover
    style:
      background: "{colors.semantic.surface}"
      state_layer_opacity: 0.08  # Material Design pattern
      cursor: pointer

  - type: focus
    style:
      outline: "2px solid {colors.semantic.focus_ring}"
      outline_offset: "2px"
      state_layer_opacity: 0.12

  - type: disabled
    style:
      opacity: 0.38
      cursor: not-allowed
```

### Transition Specification

Use token references for consistent timing:

```yaml
transitions:
  - from: default
    to: hover
    trigger: mouseenter
    animation:
      duration: "{motion.durations.fast}"   # 150ms
      easing: "{motion.easings.ease_out}"
      properties: [background, box-shadow]

  - from: "*"           # Any state
    to: disabled
    trigger: disabled-attribute
    animation:
      duration: "{motion.durations.fast}"
```

### Microinteraction Specification

Document significant interactions using Saffer's framework:

```yaml
microinteractions:
  - id: submit-feedback
    trigger:
      type: click
      target: submit-button
    rules:
      - Validate all form fields
      - If valid, submit to API
      - If invalid, focus first error
    feedback:
      - type: visual
        description: Button shows loading spinner
      - type: motion
        animation: "spinner-rotate"
        duration: "until complete"
      - type: text
        message: "Saving..."
        position: inline
    accessibility:
      announce: "Submitting form"
      aria_live: polite
```

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

### Interaction Quality Checklist

- [ ] **Are all states defined?** Default, hover, focus, active, disabled?
- [ ] **Do states use tokens?** Colors and timing from token system?
- [ ] **Are transitions smooth?** Duration and easing specified?
- [ ] **Is it keyboard accessible?** Can navigate and activate with keyboard?
- [ ] **Are ARIA attributes defined?** Role, label, states?
- [ ] **Is focus visible?** Clear focus indicator meets WCAG?
- [ ] **Is reduced motion supported?** Alternative for prefers-reduced-motion?
- [ ] **Are microinteractions purposeful?** Each serves a function?

### Interaction Quality Levels

**Level 1 - Basic States (Starting Point)**
- Default, hover, disabled states
- Basic keyboard support
- Functional but minimal

**Level 2 - Complete Interactions (Standard)**
- All relevant states defined
- Transitions with proper timing
- Full keyboard accessibility
- ARIA attributes documented

**Level 3 - Polished Interactions (Target)**
- Microinteractions for feedback
- Reduced motion alternatives
- Loading and error states
- Comprehensive accessibility

### Example: Good vs. Poor Interaction

**Poor Interaction:**
```yaml
states:
  - name: hover
    color: blue
  - name: click
    color: dark blue
```
*Problems: Missing states, no tokens, no transitions, no accessibility*

**Good Interaction:**
```yaml
states:
  - type: default
    style:
      background: "{colors.primary.500}"
      text_color: "{colors.semantic.text_inverse}"
      shadow: "{shadows.sm}"

  - type: hover
    style:
      background: "{colors.primary.600}"
      shadow: "{shadows.md}"
      cursor: pointer
    css_pseudo: ":hover"

  - type: focus
    style:
      outline: "2px solid {colors.semantic.focus_ring}"
      outline_offset: "2px"
    css_pseudo: ":focus-visible"

  - type: active
    style:
      background: "{colors.primary.700}"
      scale: 0.98
    css_pseudo: ":active"

  - type: disabled
    style:
      background: "{colors.neutral.200}"
      text_color: "{colors.neutral.400}"
      cursor: not-allowed
    css_pseudo: ":disabled"
    aria_attribute: "aria-disabled"

  - type: loading
    style:
      background: "{colors.primary.500}"
      cursor: wait

transitions:
  - from: default
    to: hover
    animation:
      duration: "{motion.durations.fast}"
      easing: "{motion.easings.ease_out}"
      properties: [background, box-shadow]

  - from: active
    to: default
    animation:
      duration: "{motion.durations.fast}"
      properties: [transform]

default_transition:
  duration: "{motion.durations.fast}"
  easing: "{motion.easings.ease_in_out}"

microinteractions:
  - id: click-feedback
    trigger:
      type: click
    rules:
      - Scale down slightly on press
      - Return to normal on release
    feedback:
      - type: motion
        motion:
          animation: scale-down
          duration: "{motion.durations.fast}"

accessibility:
  keyboard:
    focusable: true
    shortcuts:
      - key: Enter
        action: activate
      - key: Space
        action: activate
  aria:
    role: button
  reduced_motion:
    disable_animations: true
    alternative: "Instant state changes without animation"
```
*Strengths: Complete states, token references, smooth transitions, full accessibility, microinteraction feedback*

---

## Sources

### Purpose

Sources create traceability from design decisions back to research, specifications, and external documentation. They enable future revisiting of decisions and support knowledge management.

### Quality Criteria

| Criterion | Description | Why It Matters |
|-----------|-------------|----------------|
| **Accessible** | URL is valid and team can access it | Enables verification |
| **Relevant** | Directly supports the entity | Not tangentially related |
| **Summarized** | Key takeaway captured | Quick reference without clicking |
| **Complete** | Includes bibliographic info when formal | Proper attribution |

### Source Quality Checklist

- [ ] **Is the URL accessible?** Team members can reach it?
- [ ] **Is the title descriptive?** Clear what the source contains?
- [ ] **Is there a summary?** Key insight captured for quick reference?
- [ ] **Is it actually relevant?** Directly informs this specific entity?

### Example: Good Source

```yaml
sources:
  - title: "Onboarding UX Study Q3 2024"
    url: "https://research.internal/studies/onboarding-q3-2024"
    summary: "Users who see visualization within 60s have 3x higher retention. Drag-drop import preferred over file dialogs."
    bibliography:
      author: "UX Research Team"
      date: "2024-09-15"
      version: "1.2"
```

---

## Quality Validation Checklist

Use this master checklist to validate your entire design system:

### Completeness Checks

- [ ] Every workflow has at least one persona
- [ ] Every workflow has measurable success criteria
- [ ] Every capability is used by at least one workflow
- [ ] Every capability has specific requirements
- [ ] Every component implements at least one capability
- [ ] Every component has documented dependencies

### Traceability Checks

- [ ] Run `design_validate` with no errors
- [ ] Run `design_find_orphans` with no results
- [ ] Run `design_find_gaps` and address all gaps
- [ ] Run `design_coverage_report` with >80% coverage

### Research Backing Checks

- [ ] Each persona cites user research
- [ ] Each workflow traces to user needs
- [ ] Key decisions have source documentation

---

## Anti-Patterns to Avoid

### Persona Anti-Patterns

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| **Demographic-focused** | Age/gender rarely affect design | Focus on goals and behaviors |
| **Aspirational** | Describes who you want users to be | Base on actual research |
| **Generic** | "Power user" or "casual user" | Create specific archetypes |
| **Undifferentiated** | All personas look the same | Ensure meaningful differences |
| **Static** | Never updated | Review quarterly with new research |

### Workflow Anti-Patterns

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| **Feature-focused** | "Use the filter" instead of user goal | Describe user outcomes |
| **Unmeasurable** | "User is satisfied" | Add quantifiable criteria |
| **Persona-less** | No link to who does this | Connect to specific personas |
| **Premature validation** | Marked valid without testing | Only validate after user testing |

### Capability Anti-Patterns

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| **UI-specific** | "Show a modal" instead of function | Describe capability, not UI |
| **Too broad** | "Data management" (epic-sized) | Split into specific capabilities |
| **Too narrow** | "Blue button" (task-sized) | Combine into meaningful capability |
| **Untestable** | "Fast performance" | Specify measurable requirements |
| **Orphaned** | Not used by any workflow | Delete or connect to workflow |

### Component Anti-Patterns

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| **God component** | Does everything | Split by responsibility |
| **Unlinked** | No capability connection | Connect to capabilities |
| **Undocumented** | No props defined | Document interface |
| **Hidden dependencies** | Implicit requirements | Make dependencies explicit |

---

## References

### Persona Research

- [Personas Make Users Memorable - Nielsen Norman Group](https://www.nngroup.com/articles/persona/)
- [3 Persona Types: Lightweight, Qualitative, and Statistical - NN/G](https://www.nngroup.com/articles/persona-types/)
- [Best Practices on Creating Effective Personas - Salesforce](https://medium.com/salesforce-ux/best-practices-on-creating-effective-personas-620a5076bdd2)
- [A Guide to User Personas in UX - Maze](https://maze.co/guides/user-personas/)
- [How to Create Research-Backed User Personas - IxDF](https://www.interaction-design.org/literature/article/user-persona-guide)

### Workflow & Journey Mapping

- [User Journeys vs. User Flows - Nielsen Norman Group](https://www.nngroup.com/articles/user-journeys-vs-user-flows/)
- [User Journey Map: The Ultimate Guide - Appcues](https://www.appcues.com/blog/user-journey-map)
- [The UX Designer's Guide to Critical User Journey Mapping - Userpilot](https://userpilot.com/blog/critical-user-journey/)
- [User Journey Mapping: What is it & How to do it - Figma](https://www.figma.com/resource-library/user-journey-map/)

### Requirements & Capabilities

- [Functional and Non-functional Requirements - AltexSoft](https://www.altexsoft.com/blog/functional-and-non-functional-requirements-specification-and-types/)
- [Features and Capabilities - Scaled Agile Framework](https://framework.scaledagile.com/features-and-capabilities)
- [A Guide to Functional Requirements - Nuclino](https://www.nuclino.com/articles/functional-requirements)
- [Software Requirements Specification Guide - IEEE](https://www.computer.org/resources/software-requirements-specifications)

### Design Systems & Components

- [Atomic Design Methodology - Brad Frost](https://atomicdesign.bradfrost.com/chapter-2/)
- [Atomic Design Systems Component Checklist - UXPin](https://www.uxpin.com/studio/blog/atomic-design-system/)
- [Building better UIs with Atomic Design principles - Justinmind](https://www.justinmind.com/ui-design/atomic-design)
- [Building Design Systems with Atomic Principles - Kajoo](https://kajoo.ai/blog/building-design-systems-with-atomic-principles)

### Design Tokens

- [Design Tokens Format Module - W3C Design Tokens Community Group](https://tr.designtokens.org/format/)
- [Tokens Studio Documentation - Design Tokens Best Practices](https://docs.tokens.studio/)
- [Design Tokens 101 - Supernova](https://www.supernova.io/blog/design-tokens-101)
- [Design Tokens — The Atomic Units of Design Systems - UX Collective](https://uxdesign.cc/design-tokens-the-atomic-units-of-design-systems-3e0d7b73bdd5)
- [Naming Design Tokens - Nathan Curtis](https://medium.com/eightshapes-llc/naming-tokens-in-design-systems-9e86c7444676)
- [Responsive Design Tokens - CSS-Tricks](https://css-tricks.com/what-are-design-tokens/)

### Views & Layouts

- [Responsive Web Design - A List Apart](https://alistapart.com/article/responsive-web-design/)
- [Layout Patterns - web.dev](https://web.dev/patterns/layout/)
- [Holy Grail Layout - CSS-Tricks](https://css-tricks.com/the-holy-grail-layout-with-css-grid/)
- [State Management for UI - Nielsen Norman Group](https://www.nngroup.com/articles/empty-state/)
- [Skeleton Screens - UX Collective](https://uxdesign.cc/what-you-should-know-about-skeleton-screens-a820c45a571a)
- [Loading State Best Practices - Smashing Magazine](https://www.smashingmagazine.com/2016/12/best-practices-for-animated-progress-indicators/)

### Interactions & Microinteractions

- [Microinteractions: Designing with Details - Dan Saffer](https://www.microinteractionsbook.com/)
- [Material Design 3 - State Layers](https://m3.material.io/foundations/interaction/states/state-layers)
- [The 4 Parts of Every Microinteraction - UX Planet](https://uxplanet.org/microinteractions-the-secret-of-great-app-design-4cfe70fbaccf)
- [WCAG 2.1 Focus Visible - W3C](https://www.w3.org/WAI/WCAG21/Understanding/focus-visible.html)
- [Accessible Animations - A11y Project](https://www.a11yproject.com/posts/understanding-vestibular-disorders/)
- [Reduced Motion - CSS-Tricks](https://css-tricks.com/introduction-reduced-motion-media-query/)
- [Animation Timing Guidelines - Material Design](https://m3.material.io/styles/motion/easing-and-duration/tokens-specs)
- [Keyboard Accessibility - WebAIM](https://webaim.org/techniques/keyboard/)

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2025-01-15 | 1.1 | Added Tokens, Views, and Interactions sections with quality guidance |
| 2025-01-14 | 1.0 | Initial framework based on UX research best practices |
