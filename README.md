# Designloom

[![npm version](https://img.shields.io/npm/v/designloom.svg)](https://www.npmjs.com/package/designloom)
[![CI](https://github.com/apowers313/designloom/actions/workflows/ci.yml/badge.svg)](https://github.com/apowers313/designloom/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/apowers313/designloom/branch/master/graph/badge.svg)](https://codecov.io/gh/apowers313/designloom)

Designloom is an agentic AI-driven application design process powered by an MCP (Model Context Protocol) server and a standardized set of prompts that guide you from initial research through implementation and release.

## The Designloom Process

Designloom implements a comprehensive design-to-implementation lifecycle grounded in established UX methodologies. The process synthesizes insights from the **Double Diamond Model** (British Design Council), **Design Thinking** (Stanford d.school), **ISO 9241-210** (Human-Centered Design), **Lean UX** (Build-Measure-Learn), and **Atomic Design** (Brad Frost). Every design decision maintains traceability from research evidence through personas, workflows, capabilities, and ultimately to implemented components and views.

The process is organized into **Design and Implementation phases** containing **13 stages**:

### Design Phases (Stages 1-8)

1. **Discovery** - Conduct foundational research through systematic investigation, creating Source entities and proto-Personas based on user interviews, surveys, and competitive analysis ([Design Thinking 101 - NNg](https://www.nngroup.com/articles/design-thinking/))
2. **Define** - Synthesize research into validated Personas and Workflows with measurable success criteria, transforming user insights into actionable problem statements ([Double Diamond - Maze](https://maze.co/blog/double-diamond-design-process/))
3. **Ideate** - Generate implementation-agnostic Capabilities that serve defined workflows, applying the INVEST framework to ensure testable requirements ([ISO 9241-210](https://www.iso.org/standard/77520.html))
4. **Design Foundation** - Establish the visual design language through Tokens (colors, typography, spacing) and base Interaction Patterns with WCAG accessibility compliance ([Design Tokens - W3C DTCG](https://tr.designtokens.org/format/))
5. **Component Design** - Create UI building blocks following Atomic Design hierarchy (atoms → molecules → organisms) that implement capabilities ([Atomic Design - Brad Frost](https://atomicdesign.bradfrost.com/chapter-2/))
6. **View Assembly** - Assemble components into complete screen layouts with zones, states (empty, loading, error, default), and routing definitions
7. **Validation** - Test designs through cognitive walkthroughs and prototype testing before implementation, creating TestResult entities to document findings ([Prototype Testing - Maze](https://maze.co/guides/prototype-testing/))
8. **Handoff** - Prepare development-ready documentation with component APIs, accessibility checklists, and validated workflow specifications ([Design Handoff - UXPin](https://www.uxpin.com/studio/blog/design-handoff-checklist/))

### Implementation Phases (Stages 9-13)

9. **Implementation Planning** - Establish priority order (P0/P1/P2) based on workflow impact, capability dependencies, and component reusability, identifying the "Golden Path" first vertical slice ([Technical Spikes - SAFe](https://framework.scaledagile.com/spikes))
10. **Vertical Slice Implementation** - Implement features end-to-end (UI → Logic → Data) rather than layer-by-layer, starting with the highest-priority validated workflow ([Vertical Slice Architecture - DevIQ](https://deviq.com/architecture/vertical-slice-architecture/))
11. **Pattern Extraction** - Identify and extract reusable patterns from implemented components (3+ similar uses → shared pattern)
12. **Iterative Expansion** - Systematically expand implementation following P0 → P1 → P2 priority order, reusing components across workflows
13. **Release & Living Documentation** - Synchronize Designloom entities with implementation, generate documentation, conduct retrospectives, and establish maintenance schedules

---

## Installation & Setup

### 1. Install Designloom with pupt

```bash
npm install -g pupt
pupt install designloom
```

Or add to your project:

```bash
npm install designloom pupt
```

### 2. Configure MCP

```bash
# Claude Code (CLI)
claude mcp add designloom -e DESIGNLOOM_DATA_PATH=./design/designloom -- npx designloom

# Cursor (edit ~/.cursor/mcp.json or .cursor/mcp.json)
# Windsurf (edit ~/.codeium/windsurf/mcp_config.json)
# VS Code (edit .vscode/mcp.json, requires v1.102+)
```

**JSON configuration** (for Cursor, Windsurf, VS Code):

```json
{
    "mcpServers": {
        "designloom": {
            "command": "npx",
            "args": ["designloom"],
            "env": {
                "DESIGNLOOM_DATA_PATH": "./design/designloom"
            }
        }
    }
}
```

Docs: [Claude Code](https://code.claude.com/docs/en/mcp) | [Cursor](https://cursor.com/docs/context/mcp) | [Windsurf](https://docs.windsurf.com/windsurf/cascade/mcp) | [VS Code](https://code.visualstudio.com/docs/copilot/customization/mcp-servers)

### 3. Install and Run Prompts with pupt

```bash
npm install -g pupt       # Install pupt globally
pt init                   # Initialize pupt configuration
pt install designloom     # Install designloom prompts
pt run claude             # Run prompts interactively (fuzzy search)
pt run -p <name> claude   # Run a specific prompt by name
```

---

## Detailed Process Guide

This guide walks you through each phase of the Designloom process. Each section explains what you're trying to accomplish, what you need to get started, and what you'll have when you're done.

---

### Phase 1: Discovery

> *"Empathize: Research users' needs"* — [Design Thinking, Stanford d.school](https://www.nngroup.com/articles/design-thinking/)

The Discovery phase is about building an evidence base before making any design decisions. You'll gather research materials, analyze competitors, and identify who your users are. Every claim you make later should trace back to something you discover here.

**Run this:**
```bash
pt run -p 01-research-synthesis claude
```

**What you need before starting:**
- A description of your project and its goals
- Any existing research (interview transcripts, survey results, analytics data)
- Topics you want to research further
- Competitor products to analyze

**What happens:**
The prompt guides you through a systematic research process. It will help you conduct web research, process existing materials, and synthesize findings. As you work, Designloom creates **Source** entities that catalog each piece of research with proper citations.

**What you'll have when done:**
- Source entities for all research materials (at least 5, from at least 2 different types)
- Identified user segments with confidence levels
- Documented goals and pain points for each segment
- Competitive analysis findings
- A research synthesis document summarizing key insights

**Technical details:**

| MCP Tool | What it does |
|----------|--------------|
| `design_create` | Creates Source entities for each research material |
| `design_list` | Lists existing sources to avoid duplicates |
| `design_validate` | Ensures sources have required fields |

<details>
<summary>Source entity schema</summary>

```yaml
id: string (kebab-case)           # e.g., "user-interview-2024-01"
title: string (required)          # Human-readable title
url: string (required)            # Link to source material
summary: string                   # Key findings summary
bibliography:
  author: string
  date: string
  publisher: string
  version: string
```
</details>

---

### Phase 2: Define

> *"Define: State users' needs and problems"* — [Double Diamond Model, British Design Council](https://maze.co/blog/double-diamond-design-process/)

The Define phase transforms your raw research into structured artifacts: **Personas** (who are your users?) and **Workflows** (what are they trying to accomplish?). This is where you converge from broad research into specific, actionable problem statements.

**Run these in order:**
```bash
pt run -p 02-persona-creation claude
pt run -p 03-workflow-creation claude
pt run -p 04-success-criteria claude
```

**What you need before starting:**
- Completed research synthesis from Phase 1
- Source entities already in Designloom
- Clear user segments identified from research

**What happens:**
1. **Persona Creation** — Transforms user segments into detailed personas with goals, frustrations, and context. Each persona must cite at least one Source to maintain research traceability.
2. **Workflow Creation** — Defines the key journeys each persona needs to complete. Workflows capture the user's goal and link to the personas who perform them.
3. **Success Criteria** — Adds measurable targets to each workflow using the SMART framework (Specific, Measurable, Achievable, Relevant, Time-bound).

**What you'll have when done:**
- Research-backed Personas with embedded source citations
- Workflows for each key user journey (at least one per persona)
- Measurable success criteria with numeric targets (e.g., "complete in < 30 seconds")
- Bidirectional links between personas and workflows

**Technical details:**

| MCP Tool | What it does |
|----------|--------------|
| `design_create` | Creates Persona and Workflow entities |
| `design_update` | Updates entities with additional research findings |
| `design_link` | Establishes bidirectional persona↔workflow links |
| `design_validate` | Checks for orphaned personas (not linked to any workflow) |

<details>
<summary>Persona entity schema</summary>

```yaml
id: string (kebab-case)           # e.g., "analyst-alex"
name: string (required)
role: string (required)           # Job title or role description
quote: string                     # Representative user quote
bio: string                       # Background narrative
characteristics:
  expertise: novice | intermediate | expert (required)
  time_pressure: string
  domain_knowledge: string
goals: string[] (required, min 1)
frustrations: string[]
context:
  frequency: daily | weekly | monthly | as-needed
  devices: [desktop | laptop | tablet | mobile]
workflows: string[]               # Auto-populated workflow IDs
sources:                          # Embedded citations
  - title: string
    url: string
    summary: string
```
</details>

<details>
<summary>Workflow entity schema</summary>

```yaml
id: string (W + digits)           # e.g., "W01", "W02"
name: string (required)
category: onboarding | analysis | exploration | reporting | collaboration | administration
status: draft | designed | validated | implementing | implemented | deprecated
priority: P0 | P1 | P2
validated: boolean
personas: string[]                # Linked persona IDs
requires_capabilities: string[]   # Filled in Phase 3
goal: string (required)
success_criteria:
  - metric: string
    target: string                # e.g., "< 30 seconds", "> 90%"
starting_state:                   # Initial conditions
  data_type: string
  user_expertise: string
```
</details>

---

### Phase 3: Ideate

> *"Ideate: Challenge assumptions, create ideas"* — [Design Thinking, Stanford d.school](https://www.nngroup.com/articles/design-thinking/)

The Ideate phase bridges the gap between user needs and technical implementation. Here you define **Capabilities**—what your system can do—without specifying how it's built. This separation keeps you focused on solving user problems rather than jumping to implementation details.

Capabilities follow the [INVEST framework](https://www.agilealliance.org/glossary/invest/) (Independent, Negotiable, Valuable, Estimable, Small, Testable) and [IEEE 830](https://www.iso.org/standard/77520.html) standards for requirements specification.

**Run these in order:**
```bash
pt run -p 05-capability-generation claude
pt run -p 06-capability-refinement claude
```

**What you need before starting:**
- Completed workflows from Phase 2
- Research synthesis for context
- Understanding of technical constraints (optional, but helps scope requirements)

**What happens:**
1. **Capability Generation** — Analyzes each workflow step-by-step and identifies what system capabilities are needed. Groups related capabilities and links them to the workflows they support.
2. **Capability Refinement** — Enhances each capability with detailed, testable requirements covering happy paths, error cases, and edge cases.

**What you'll have when done:**
- Capability entities for every system feature needed
- Each workflow linked to at least one capability
- At least 3 testable requirements per capability
- Clear traceability: Workflow → Capability → (later) Component

**Technical details:**

| MCP Tool | What it does |
|----------|--------------|
| `design_create` | Creates Capability entities |
| `design_link` | Links capabilities to workflows bidirectionally |
| `design_validate` | Checks for workflows missing capabilities |
| `design_analyze` | Generates coverage reports showing gaps |

<details>
<summary>Capability entity schema</summary>

```yaml
id: string (kebab-case)           # e.g., "data-import"
name: string (required)
category: data | visualization | analysis | interaction | export | collaboration | performance
description: string (required)    # What it does, not how
status: planned | in-progress | implemented | deprecated
priority: P0 | P1 | P2
used_by_workflows: string[]       # Auto-populated workflow IDs
implemented_by_components: string[] # Filled in Phase 5
requirements: string[]            # Testable requirement statements
algorithms: string[]              # Named algorithms if applicable
```
</details>

---

### Phase 4: Design Foundation

> *"Design tokens are the visual design atoms of the design system"* — [W3C Design Tokens Community Group](https://tr.designtokens.org/format/)

The Design Foundation phase establishes your visual design language through **Tokens** (colors, typography, spacing, motion) and **Interaction Patterns** (how components behave). These foundations ensure consistency across all components and meet [WCAG 2.1 AA](https://www.w3.org/WAI/WCAG21/quickref/) accessibility requirements.

**Run these in order:**
```bash
pt run -p 07-token-foundation claude
pt run -p 08-interaction-patterns claude
```

**What you need before starting:**
- Brand guidelines (colors, fonts, logo usage)
- Design specifications or existing style guides
- Target accessibility level (typically WCAG 2.1 AA)
- Existing design system documentation (if migrating)

**What happens:**
1. **Token Foundation** — Creates a comprehensive token system with color scales, typography, spacing, motion timing, and more. Validates contrast ratios meet accessibility standards.
2. **Interaction Patterns** — Defines reusable behavior patterns for common interactions (buttons, inputs, toggles). Specifies states, transitions, and accessibility requirements.

**What you'll have when done:**
- Complete token system with semantic naming
- Color scales for primary, neutral, and semantic colors (success, warning, error)
- Typography scale with font families, sizes, and weights
- Spacing scale (8+ values) and motion durations
- Base interaction patterns with all states (default, hover, focus, active, disabled)
- WCAG 2.1 AA compliance verified (4.5:1 text contrast, 3:1 UI contrast)

**Technical details:**

| MCP Tool | What it does |
|----------|--------------|
| `design_create` | Creates Token and Interaction entities |
| `design_get` | Retrieves token values for cross-referencing |
| `design_validate` | Validates required token fields are present |

<details>
<summary>Tokens entity schema</summary>

```yaml
id: string (kebab-case)           # e.g., "default-theme"
name: string (required)
extends: string                   # Parent theme for inheritance

colors:
  neutral: ColorScale (required)  # 50-950 scale
  primary: ColorScale             # Brand color scale
  secondary: ColorScale
  success: { base, light, dark, contrast }
  warning: { base, light, dark, contrast }
  error: { base, light, dark, contrast }
  semantic:
    background: string
    text_primary: string

typography:
  fonts: { sans, serif, mono }
  sizes: { base (required), xs, sm, md, lg, xl }
  weights: { normal, bold }

spacing:
  scale: { 1, 2, 3, 4, ... }      # 8+ values, e.g., "0.25rem"

motion:
  durations: { fast, normal, slow }
  easings: { ease_out, ease_in_out }
```
</details>

<details>
<summary>Interaction Pattern entity schema</summary>

```yaml
id: string (kebab-case)           # e.g., "button-interaction"
name: string (required)
applies_to: string[]              # Component categories

interaction:
  states:
    - type: default | hover | focus | active | disabled | loading
      style: { background, border_color, text_color, opacity, cursor }
      css_pseudo: string          # e.g., ":hover"
      aria_attribute: string      # e.g., "aria-disabled"

  transitions:
    - from: string
      to: string
      trigger: string             # e.g., "mouseenter"
      animation: { duration, easing, properties }

  accessibility:
    keyboard: { focusable, shortcuts, arrow_navigation }
    aria: { role, attributes }
    reduced_motion: { disable_animations, alternative }
```
</details>

---

### Phase 5: Component Design

> *"Atoms → Molecules → Organisms: Build from the smallest pieces up"* — [Atomic Design, Brad Frost](https://atomicdesign.bradfrost.com/chapter-2/)

The Component Design phase creates your UI building blocks. Components are organized using the Atomic Design hierarchy: **atoms** (buttons, inputs), **molecules** (search bars, cards), and **organisms** (headers, forms). Each component implements one or more capabilities and has a fully documented API.

**Run this:**
```bash
pt run -p 09-component-design claude
```

**What you need before starting:**
- Capability entities from Phase 3 (what the system needs to do)
- Token entities from Phase 4 (visual language)
- Interaction patterns from Phase 4 (behavior specifications)
- Reference designs or wireframes (optional but helpful)

**What happens:**
The prompt guides you through designing components that implement your capabilities. It starts with the most-used components (higher reusability = higher priority), ensures each has a documented props interface, and links them to the capabilities they implement.

**What you'll have when done:**
- Component entities for all P0/P1 capabilities
- Each component with documented props (types, descriptions, defaults)
- Explicit dependency chains (which components need which)
- Interaction specifications (embedded or referencing patterns)
- Atomic design categorization (atom/molecule/organism)

**Technical details:**

| MCP Tool | What it does |
|----------|--------------|
| `design_create` | Creates Component entities |
| `design_link` | Links components to capabilities bidirectionally |
| `design_get` | Retrieves capability requirements for reference |
| `design_validate` | Checks for capabilities without implementing components |

<details>
<summary>Component entity schema</summary>

```yaml
id: string (kebab-case)           # e.g., "file-upload-dialog"
name: string (required)
category: atom | molecule | organism
description: string (required)
status: planned | in-progress | implemented | deprecated
priority: P0 | P1 | P2

implements_capabilities: string[] # Capability IDs this implements
dependencies: string[]            # Other component IDs required

props:
  propName:
    type: string | number | boolean | function | ReactNode
    type_definition: string       # Full TypeScript type
    required: boolean
    default_value: any
    description: string

variants: [{ name, tokens, default }]
sizes: [{ name: xs|sm|md|lg|xl, tokens, default }]

interaction_pattern: string       # Reference to pattern ID
# OR
interactions: { ... }             # Embedded interaction spec

accessibility:
  role: string                    # ARIA role
  label_required: boolean
  keyboard_support: string[]
```
</details>

---

### Phase 6: View Assembly

> *"Templates = layout structure, Pages = templates with real content"* — [Atomic Design, Brad Frost](https://atomicdesign.bradfrost.com/chapter-2/)

The View Assembly phase combines your components into complete screens. Each **View** defines where components go (layout zones), how the screen behaves in different situations (states), and how users navigate to it (routes). Views complete the traceability chain from research to UI.

**Run this:**
```bash
pt run -p 10-view-assembly claude
```

**What you need before starting:**
- Component entities from Phase 5
- Workflow entities defining user journeys
- Navigation and routing requirements
- Responsive design requirements (breakpoints, mobile behavior)

**What happens:**
The prompt helps you create Views for each workflow. You'll define the layout structure (sidebar-left, dashboard, etc.), place components into zones, specify all states (what does the screen look like when empty? loading? error?), and define routing.

**What you'll have when done:**
- View entities for all P0/P1 workflows
- Layout definitions with zones and component placement
- All states defined: default, empty, loading, error
- Routing with URL patterns and parameters
- Data requirements documenting what each view needs

**Technical details:**

| MCP Tool | What it does |
|----------|--------------|
| `design_create` | Creates View entities |
| `design_update` | Updates views with states and routes |
| `design_get` | Retrieves component specs for placement |
| `design_validate` | Validates all referenced components exist |

<details>
<summary>View entity schema</summary>

```yaml
id: string (V + digits)           # e.g., "V01", "V02"
name: string (required)
status: draft | designed | implementing | implemented
priority: P0 | P1 | P2
workflows: string[]               # Workflow IDs using this view

layout:
  type: single-column | sidebar-left | sidebar-right | dashboard | holy-grail | split
  zones:
    - id: string
      position: header | footer | sidebar | main | aside | nav | content
      components: string[]        # Component IDs in this zone
      width: string               # Token reference or responsive object
      visibility: visible | hidden | collapsed | drawer

states:
  - id: string
    type: default | empty | loading | error | success | partial
    description: string
    zones: [{ zone_id, components, visibility }]  # Overrides per state
    conditions: string[]          # When this state activates

routes:
  - path: string                  # e.g., "/dashboard/:id"
    params: [{ name, type, required }]
    title: string                 # Browser tab title
    requires_auth: boolean

data_requirements:
  - id: string
    source: string                # API endpoint or store
    loading_state: string         # State to show while loading
    error_state: string           # State to show on error
```
</details>

---

### Phase 7: Validation

> *"Why test prototypes before coding? Fixing issues during design costs far less than during implementation"* — [Prototype Testing, Maze](https://maze.co/guides/prototype-testing/)

The Validation phase catches problems before they become expensive to fix. You'll run automated validation checks, conduct cognitive walkthroughs (simulated testing from each persona's perspective), and document findings. This is your quality gate before implementation begins.

**Run these in order:**
```bash
pt run -p 11-pre-development-validation claude
pt run -p 12-post-test-updates claude
```

**What you need before starting:**
- All design entities from Phases 1-6 completed
- Coverage targets (typically ≥80% for P0 workflows)
- Optional: Real user test results from prototype testing

**What happens:**
1. **Pre-Development Validation** — Runs comprehensive checks: schema validation, orphan detection (entities not linked to anything), gap analysis (workflows missing capabilities), and coverage reports.
2. **Post-Test Updates** — Conducts cognitive walkthroughs from each persona's perspective, identifying usability issues. Creates TestResult entities documenting findings and updates workflows based on results.

**What you'll have when done:**
- All validation checks passing (no errors, no orphans)
- Coverage report showing ≥80% for P0 workflows
- TestResult entities for each P0 workflow
- Issues documented with severity and recommendations
- P0 workflows marked `validated: true`

**Technical details:**

| MCP Tool | What it does |
|----------|--------------|
| `design_validate` | Runs validation checks (all, orphans, gaps, schema) |
| `design_analyze` | Generates coverage and test-coverage reports |
| `design_create` | Creates TestResult entities |
| `design_update` | Updates workflow `validated` status |

<details>
<summary>TestResult entity schema</summary>

```yaml
id: string (kebab-case)           # e.g., "test-w01-analyst-alex-2024-01"
workflow_id: string (required)    # Workflow being tested
persona_id: string (required)     # Persona perspective used
test_type: simulated | real (required)
date: string (ISO 8601)
status: passed | failed | partial (required)
confidence: high | medium | low

success_criteria_results:
  - metric: string                # From workflow success_criteria
    target: string
    actual: string                # Measured result
    passed: boolean

issues:
  - severity: critical | high | medium | low
    description: string
    affected_entity_type: string
    affected_entity_id: string
    recommendation: string

summary: string
recommendations: string[]
```
</details>

---

### Phase 8: Handoff

> *"Design handoff is not a moment, it's a conversation"* — [Design Handoff Guide, UXPin](https://www.uxpin.com/studio/blog/design-handoff-checklist/)

The Handoff phase prepares your validated designs for development. You'll generate documentation, address developer questions, and ensure every entity has the detail developers need to implement it. This completes the Design Phases—after this, you're ready to build.

**Run these in order:**
```bash
pt run -p 13-handoff-preparation claude
pt run -p 14-handoff-gap-analysis claude
```

**What you need before starting:**
- All P0/P1 workflows validated (from Phase 7)
- Developer questions or feedback (if available)
- Target implementation team identified

**What happens:**
1. **Handoff Preparation** — Reviews all entities against a development-ready checklist. Ensures props are documented with types, all view states are defined, interaction specifications are complete, and accessibility requirements are documented.
2. **Gap Analysis** — Addresses developer feedback, resolves documentation gaps, and updates entities based on implementation questions.

**What you'll have when done:**
- All P0/P1 workflows marked `validated: true`
- Complete component API documentation (props with types)
- All view states defined (default, loading, error, empty)
- Interaction specifications with all state transitions
- Accessibility requirements per component
- Handoff summary document
- Developer sign-off on completeness

**Technical details:**

| MCP Tool | What it does |
|----------|--------------|
| `design_validate` | Final validation checks |
| `design_export` | Exports diagrams and test specifications |
| `design_get` | Retrieves entity details for review |
| `design_analyze` | Generates final coverage report |

---

### Phase 9: Implementation Planning

> *"Not all features are equally important—prioritize ruthlessly"* — [Technical Spikes, SAFe](https://framework.scaledagile.com/spikes)

The Implementation Planning phase determines what to build first. You'll assign priorities (P0/P1/P2), identify your **Golden Path** (the first complete workflow to implement), and plan technical spikes for risky capabilities. This ensures you build the most valuable features first and reduce technical risk early.

**Run these in order:**
```bash
pt run -p 15-implementation-prioritization claude
pt run -p 16-golden-path claude
pt run -p 17-technical-spikes claude
```

**What you need before starting:**
- All design entities validated (from Phase 7-8)
- Technical constraints and team capacity
- Business priorities and stakeholder input

**What happens:**
1. **Prioritization** — Scores workflows, capabilities, and components using factors like user frequency, criticality, persona coverage, and dependency chains. Assigns P0 (critical), P1 (important), or P2 (nice-to-have).
2. **Golden Path** — Identifies the single highest-priority validated workflow to implement first. Traces all its dependencies (capabilities, components, views) to define the first vertical slice.
3. **Technical Spikes** — Plans time-boxed investigations (1-3 days) for high-risk capabilities where the implementation approach is uncertain.

**What you'll have when done:**
- All entities prioritized (P0/P1/P2)
- Golden Path workflow identified with full dependency trace
- Technical spikes defined with scope, questions, and acceptance criteria
- Implementation order documented
- No circular dependencies confirmed

**Technical details:**

| MCP Tool | What it does |
|----------|--------------|
| `design_update` | Assigns priority fields to entities |
| `design_analyze` | Generates priority suggestions and coverage analysis |
| `design_relations` | Checks dependency chains for circular references |
| `design_list` | Filters entities by priority and status |

---

### Phase 10: Vertical Slice Implementation

> *"Build features end-to-end (UI → Logic → Data) rather than layer-by-layer"* — [Vertical Slice Architecture, DevIQ](https://deviq.com/architecture/vertical-slice-architecture/)

Vertical slices reduce risk by delivering complete, testable features. Instead of building all UI, then all logic, then all data layers, you implement one complete workflow at a time. Designloom serves as your implementation specification—component props, interactions, layouts, and success criteria are all defined.

**Run these as you implement:**
```bash
pt run -p 18-vertical-slice-spec claude    # Before implementing
pt run -p 19-implementation-validation claude  # After implementing
pt run -p 20-progress-tracking claude      # Track overall progress
```

**What you need before starting:**
- Golden Path workflow identified (from Phase 9)
- Development environment ready
- Component and token specifications accessible

**What happens:**
1. **Vertical Slice Spec** — Generates a complete implementation specification for the workflow: component build order (atoms → molecules → organisms → views), acceptance tests from success criteria, and all token/interaction references.
2. **Implementation Validation** — After you implement, validates that the code matches Designloom specs: correct props, token usage, interaction states, view layouts.
3. **Progress Tracking** — Shows overall implementation progress, identifies blockers, and recommends next workflows.

**What you'll have when done:**
- Workflow completable end-to-end by target persona
- All success criteria met and measurable
- Implementation matching Designloom specs exactly
- No hardcoded values (all styling via tokens)
- TestResult entity documenting validation

**Technical details:**

| MCP Tool | What it does |
|----------|--------------|
| `design_get` | Retrieves implementation specifications |
| `design_list` | Lists components and views for the workflow |
| `design_export` | Generates test scaffolding from success criteria |
| `design_create` | Creates TestResult for implementation validation |
| `design_update` | Updates workflow status to `implemented` |

---

### Phase 11: Pattern Extraction

> *"When you see similar code 3+ times, it's time to extract a pattern"*

As you implement, common patterns emerge. This phase formalizes those patterns in Designloom so future workflows can reuse them. Extracted patterns become new Interaction or Component entities that other components reference.

**Run this periodically:**
```bash
pt run -p 21-pattern-extraction claude
```

**What you need before starting:**
- At least one workflow fully implemented
- Observation of repeated code patterns
- Design system audit showing similarities

**What happens:**
The prompt analyzes implemented components for patterns appearing 3+ times. It creates new pattern entities in Designloom and updates existing components to reference the shared pattern instead of duplicating specifications.

**What you'll have when done:**
- New pattern entities for reusable interactions/components
- Existing components updated with pattern references
- Reduced duplication in Designloom
- Documentation for extracted patterns

**Technical details:**

| MCP Tool | What it does |
|----------|--------------|
| `design_create` | Creates new Interaction or Component patterns |
| `design_update` | Updates existing components with pattern references |
| `design_list` | Finds components with similar interactions |

---

### Phase 12: Iterative Expansion

With the Golden Path complete and patterns extracted, expand to P1 and P2 workflows. Each workflow follows the same vertical slice approach, now benefiting from reusable components and established patterns.

**Run for each subsequent workflow:**
```bash
pt run -p 18-vertical-slice-spec claude
pt run -p 19-implementation-validation claude
pt run -p 20-progress-tracking claude
```

**What you need before starting:**
- Golden Path workflow implemented (Phase 10)
- Patterns extracted (Phase 11)
- Next priority workflow identified

**What happens:**
Repeat the vertical slice process for each remaining P0, then P1, then P2 workflow. Component reuse increases with each iteration. Progress tracking shows overall coverage trending toward 100%.

**What you'll have when done:**
- All P0 and P1 workflows implemented and validated
- Coverage report showing ≥80% capability coverage
- New patterns extracted as they emerge
- User feedback integrated into design

**Technical details:**

| MCP Tool | What it does |
|----------|--------------|
| `design_analyze` | Tracks coverage progress across all workflows |
| `design_list` | Finds next priority workflows to implement |
| `design_validate` | Checks for orphans after adding/modifying entities |

---

### Phase 13: Release & Living Documentation

> *"Designloom is the single source of truth—keep it synchronized with implementation"*

The Release phase synchronizes Designloom with your final implementation, ensuring no drift between design and code. You'll generate documentation artifacts, conduct a retrospective, and establish ongoing maintenance practices.

**Run these before release:**
```bash
pt run -p 22-release-synchronization claude
pt run -p 23-documentation-generation claude
pt run -p 24-retrospective claude
```

**What you need before starting:**
- All P0/P1 workflows implemented
- Access to implemented code for comparison
- Test results and project metrics

**What happens:**
1. **Release Synchronization** — Audits all entities against implemented code. Identifies drift (design says X, code does Y) and resolves it by updating Designloom or flagging code issues.
2. **Documentation Generation** — Exports architecture diagrams, component catalogs, style guides, user flows, and test specifications from Designloom data.
3. **Retrospective** — Documents what went well, what could improve, and lessons learned. Creates a Source entity capturing insights for future projects.

**What you'll have when done:**
- Zero validation errors, zero orphans
- 100% coverage for P0/P1 workflows
- All workflows marked `validated: true`
- Designloom perfectly synchronized with code
- Generated documentation package (diagrams, catalogs, specs)
- Retrospective with actionable lessons
- Maintenance schedule established

**Technical details:**

| MCP Tool | What it does |
|----------|--------------|
| `design_validate` | Final validation suite (all checks) |
| `design_analyze` | Coverage and test-coverage reports |
| `design_export` | Generates diagrams, test specs, documentation |
| `design_create` | Creates retrospective Source entity |

---

## Utility Prompts

These prompts can be used at any phase for specific tasks:

| Prompt | Purpose | When to Use |
|--------|---------|-------------|
| `25-impact-analysis` | Assess impact of proposed changes | Before modifying existing entities |
| `26-new-feature-addition` | Add features to existing projects | Adding incremental features |
| `27-entity-quality-review` | Audit entities against quality standards | Ensuring entity completeness |
| `28-accessibility-audit` | Verify WCAG compliance | Before implementation |
| `29-prompt-improvement` | Improve prompts based on output | When prompts don't produce expected results |
| `30-context-prompt-generation` | Generate custom prompts | Need specialized workflow |
| `31-multi-agent-verification` | Cross-check from multiple perspectives | Quality gate before phase transitions |

```bash
pt run -p 25-impact-analysis claude       # Before changing entities
pt run -p 26-new-feature-addition claude  # Adding features
pt run -p 27-entity-quality-review claude # Audit quality
pt run -p 28-accessibility-audit claude   # WCAG compliance
pt run -p 31-multi-agent-verification claude  # Quality gates
```

---

## MCP Tools Reference

Designloom provides 10 consolidated MCP tools:

| Tool | Description |
|------|-------------|
| `design_list` | List entities with filters (type, category, status, priority) |
| `design_get` | Get single entity with resolved relationships |
| `design_create` | Create new entity (workflow, capability, persona, component, tokens, view, interaction, test-result) |
| `design_update` | Update existing entity fields |
| `design_delete` | Delete entity (with force option for dependents) |
| `design_link` | Link/unlink entities with bidirectional references |
| `design_validate` | Validation suite (all, orphans, gaps, schema) |
| `design_analyze` | Analysis reports (coverage, priority, test-coverage) |
| `design_export` | Export artifacts (diagram, tests) |
| `design_relations` | Query dependencies or dependents |

---

## Architecture

```
designloom/
├── src/
│   ├── index.ts           # MCP server entry point
│   ├── cli.ts             # CLI entry for npx execution
│   ├── path-resolver.ts   # Git-aware path resolution
│   ├── schemas/           # Zod schemas for all entity types
│   ├── store/             # YAML store implementation
│   └── tools/             # MCP tool definitions
├── prompts/               # Standardized process prompts (01-31)
├── design/                # Process documentation
└── tests/                 # Test suite
```

---

## License

MIT
