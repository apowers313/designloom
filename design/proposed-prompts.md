# Proposed Prompts for Designloom AI Workflow

This document provides prompts optimized for agentic AI development using Designloom. These prompts are designed to be used with Claude Code or similar AI assistants that have access to Designloom's MCP tools.

---

## Table of Contents

### Design Phases (Weeks 1-9)
1. [Prompt Engineering Principles](#prompt-engineering-principles)
2. [Discovery Phase Prompts](#discovery-phase-prompts) - Prompts 1-3
3. [Define Phase Prompts](#define-phase-prompts) - Prompts 4-5
4. [Ideate Phase Prompts](#ideate-phase-prompts) - Prompts 6-7
5. [Design Phase Prompts](#design-phase-prompts) - Prompts 8-11
6. [Validation Phase Prompts](#validation-phase-prompts) - Prompts 12-13

### Implementation Phases (Weeks 9+)
7. [Handoff Phase Prompts](#handoff-phase-prompts) - Prompts 14-15
8. [Implementation Planning Prompts](#implementation-planning-prompts) - Prompts 16-18
9. [Vertical Slice Implementation Prompts](#vertical-slice-implementation-prompts) - Prompts 19-20
10. [Iterative Expansion Prompts](#iterative-expansion-prompts) - Prompts 21-22
11. [Release and Living Documentation Prompts](#release-and-living-documentation-prompts) - Prompts 23-25

### Cross-Cutting Prompts
12. [Change Management Prompts](#change-management-prompts) - Prompts 26-27
13. [Quality Assurance Prompts](#quality-assurance-prompts) - Prompts 28-29
14. [Metaprompting Templates](#metaprompting-templates) - Prompts 30-32
15. [References](#references)

---

## Prompt Engineering Principles

### Applied Best Practices

The prompts in this document apply these established techniques:

| Technique | Application | Benefit |
|-----------|-------------|---------|
| **Chain-of-Thought (CoT)** | Explicit reasoning steps in complex prompts | More accurate entity creation |
| **Structured Output** | Request specific fields and format | Consistent, complete entities |
| **Task Decomposition** | Break phases into discrete prompts | Manageable context, focused work |
| **Self-Consistency** | Validation prompts cross-check work | Catch errors and omissions |
| **Reflexion** | Review and improve prompts | Iterative quality improvement |
| **Context Engineering** | Provide necessary context, not everything | Efficient token usage |

### Prompt Size Guidelines

| Prompt Type | Recommended Length | Context Needed |
|-------------|-------------------|----------------|
| **Single Entity Creation** | 100-300 words | Entity requirements, quality criteria |
| **Phase Workflow** | 300-500 words | Phase goals, multiple entity types |
| **Analysis/Review** | 150-250 words | Existing entities, quality checklist |
| **Complex Synthesis** | 500-800 words | Multiple sources, research findings |

### Key Principles

1. **Be specific**: "Create a persona for financial analysts" not "create a persona"
2. **Include quality criteria**: Reference framework.md quality standards
3. **Request structured output**: Specify required fields and format
4. **Enable verification**: Ask for reasoning that can be validated
5. **Scope appropriately**: One phase or sub-task per prompt

---

## Discovery Phase Prompts

**Phase Goal**: Understand users and their needs through research.

**Phase Deliverables**:
| Type | Deliverable | Description |
|------|-------------|-------------|
| **Primary** | Source entities | Research citations for all materials gathered |
| **Primary** | Proto-Personas | Initial user archetypes based on team assumptions + early research |
| **Secondary** | Research synthesis | Summary of key findings across sources |
| **Secondary** | Competitive analysis | Summary of competitor approaches (as Source entities) |

**Phase Success Criteria**:
- [ ] ≥3 Source entities created (minimum viable research base)
- [ ] ≥2 Proto-Personas created covering distinct user segments
- [ ] Each Persona cites ≥1 Source
- [ ] Each Persona documents: role, goals, frustrations, context
- [ ] `design_validate` returns no errors

---

### Prompt 1: Research Synthesis to Sources

**Purpose**: Convert user research materials into Designloom Source entities.

**Context needed**: Research documents, interview transcripts, survey results

**Prompt**:

```
I have conducted user research for [PROJECT_NAME]. I need to create Source entities
in Designloom to track this research.

Research materials to catalog:
[LIST_RESEARCH_MATERIALS]

For each research material, create a Source entity that includes:
- A clear, descriptive title
- The URL or location where the material can be accessed
- A summary of the key insights relevant to UI/UX design (2-3 sentences)
- Bibliography information if available (author, date, version)

Focus on insights that will inform:
- User goals and frustrations
- Behavior patterns
- Context of use (devices, frequency, environment)
- Pain points with current solutions

After creating all sources:
1. Provide a research synthesis summary of the most significant findings
2. Identify key themes that should influence persona creation
3. Note any competitive insights discovered

Phase Success Check:
- Verify ≥3 Source entities were created
- Run design_validate to confirm no errors
- List which user segments are represented in the research
```

**Size**: ~200 words + materials list
**Expected output**: Multiple Source entities, research synthesis summary

---

### Prompt 2: Source-Backed Persona Creation

**Purpose**: Create research-backed personas (Level 2) from source materials.

**Context needed**: Source entities already created (≥3 sources)

**Prompt**:

```
Based on the research sources already in Designloom, create Level 2 personas for [PROJECT_NAME].

First, retrieve and analyze existing sources:
[Use design_list_sources to retrieve]
- Summarize key user insights from each source
- Identify distinct user segments represented

Then create personas that:
1. Are backed by specific sources (reference them in the sources field)
2. Have specific, actionable goals (not generic like "be productive")
3. Include real frustrations discovered in research
4. Specify expertise level accurately based on observed behavior
5. Include context (frequency of use, devices, voluntary vs mandatory use)

For each persona:
- Think step-by-step: Who is this user? What do they need? What frustrates them?
- Ensure the persona is distinct from others (different goals OR context OR expertise)
- Include a memorable quote from research if available

Required fields for each persona:
- id: kebab-case memorable identifier
- name: Full human name
- role: Specific job title or function
- description: Key characteristic that makes them distinct
- goals: 2-3 specific, actionable goals
- frustrations: Real pain points from research
- characteristics: expertise level, frequency, context
- sources: References to Source entities backing this persona

Quality criteria (from framework.md):
- Research-based: Can cite sources for claims
- Goal-focused: Goals are specific and actionable
- Context-specific: Reflects THIS product's usage
- Actionable: Every detail could influence design
- Memorable: Has a name and role that stick

Phase Success Check:
- Create ≥2 personas covering distinct user segments
- Verify each persona cites ≥1 Source
- Run design_validate to confirm no errors
- Confirm each persona documents: role, goals, frustrations, context
```

**Size**: ~280 words
**Expected output**: N Persona entities with source links, validation confirmation

---

### Prompt 3: Proto-Persona for Early Alignment

**Purpose**: Create assumption-based personas when research is limited (early Discovery phase).

**Context needed**: Team assumptions, known user characteristics

**Prompt**:

```
We need to create proto-personas for [PROJECT_NAME] based on current team assumptions.
These are Level 1 personas (per framework.md) that will be upgraded to Level 2 after
research validation in the Define phase.

Known information about our users:
[LIST_KNOWN_USER_INFORMATION]

Create proto-personas that:
1. Clearly note "Proto-persona - to be validated" in the description
2. Mark all assumptions that need validation
3. Include specific, testable goals
4. List hypothesized frustrations to validate

For each proto-persona, explicitly state:
- KNOWN: What we're confident about
- ASSUMED: What we believe but haven't validated
- UNKNOWN: What we need to learn

Output format for each:
- id: kebab-case memorable identifier
- name: Full human name
- role: Specific job title or function
- description: "Proto-persona - [key characteristic]"
- goals: 2-3 specific, testable goals
- frustrations: Hypothesized pain points to validate
- characteristics: expertise level (with confidence)
- sources: Link to any existing research, even if limited

Create ≥2 proto-personas covering main user segments.

Phase Success Check:
After creating proto-personas:
1. Verify ≥2 Proto-Personas created covering distinct segments
2. Each documents: role, goals, frustrations, context
3. Run design_validate to confirm no errors
4. Note which assumptions require research validation in Define phase
```

**Size**: ~240 words
**Expected output**: N Proto-Persona entities, validation assumptions list

---

## Define Phase Prompts

**Phase Goal**: Synthesize research into actionable problem statements.

**Phase Deliverables**:
| Type | Deliverable | Description |
|------|-------------|-------------|
| **Primary** | Level 2 Personas | Research-validated personas with real quotes and specific goals |
| **Primary** | Workflows | User journeys with measurable success criteria |
| **Secondary** | Problem statements | Synthesized user needs (captured in Workflow goals) |
| **Secondary** | Journey insights | Key moments documented in Workflow starting_state |

**Phase Success Criteria**:
- [ ] All Proto-Personas upgraded to Level 2 (research-backed)
- [ ] ≥1 Workflow per Persona (key journeys captured)
- [ ] Each Workflow has ≥2 measurable success criteria with targets
- [ ] Each Workflow linked to ≥1 Persona
- [ ] Each Workflow has documented `starting_state`
- [ ] `design_validate` returns no errors
- [ ] `design_find_orphans` returns no orphan Personas

---

### Prompt 4: Workflow Creation from Personas

**Purpose**: Define user workflows based on persona goals.

**Context needed**: Persona entities (Level 2, research-validated)

**Prompt**:

```
Based on the personas in Designloom, create workflows that represent their key user journeys.

First, retrieve and analyze existing personas:
[Use design_list_personas to retrieve]

For each persona goal, consider whether it requires a workflow. A workflow is needed when:
- The goal involves multiple steps or decisions
- Success can be measured objectively
- The journey has a clear start and end state

For each workflow, define:

1. **ID**: W01, W02, etc. (sequential)
2. **Name**: Action-oriented (e.g., "First Data Import" not "Data Loading")
3. **Category**: onboarding/analysis/exploration/reporting/collaboration/administration
4. **Goal**: Single clear statement from user's perspective
5. **Personas**: Link to all personas who perform this workflow
6. **Success Criteria**: ≥2 SMART metrics (Specific, Measurable, Achievable, Relevant, Time-bound)
   - Example: { metric: "time_to_completion", target: "< 60 seconds" }
   - Example: { metric: "task_completion_rate", target: "> 90%" }
7. **Starting State**: Context when workflow begins
   - data_type, user_expertise, prior_context, etc.
8. **Validated**: Set to false (not yet tested)

Think step-by-step:
1. What is the persona trying to accomplish? (goal)
2. How do we know they succeeded? (success_criteria)
3. What's true when they start? (starting_state)
4. Is this workflow different from others? (distinct value)

Quality check: Each workflow should be testable - you could run a usability test
that measures the success criteria.

Phase Success Check:
After creating workflows:
1. Verify ≥1 Workflow per Persona
2. Each Workflow has ≥2 success criteria with measurable targets
3. Each Workflow has documented starting_state
4. Run design_validate to confirm no errors
5. Run design_find_orphans to verify no orphan Personas
```

**Size**: ~320 words
**Expected output**: Multiple Workflow entities, validation confirmation

---

### Prompt 5: Success Criteria Definition

**Purpose**: Define measurable success criteria for existing workflows (minimum 2 per workflow).

**Context needed**: Workflow entities needing success criteria

**Prompt**:

```
Review the workflows in Designloom and ensure each has ≥2 measurable success criteria.

Retrieve workflows:
[Use design_list_workflows to retrieve]

For each workflow without complete success_criteria, define metrics using the SMART framework:

- **Specific**: What exactly is measured?
- **Measurable**: What is the numeric target?
- **Achievable**: Is this realistic based on research/benchmarks?
- **Relevant**: Does this matter to the user?
- **Time-bound**: What's the context (per session, daily, etc.)?

Common UX metrics to consider:
- Task completion rate (% of users who complete) - target typically >85%
- Time on task (seconds/minutes to complete) - target based on task complexity
- Error rate (errors per task) - target typically <3 per task
- Help requests (% who access help) - target typically <10%
- Satisfaction score (post-task rating) - target typically >4/5
- Abandonment rate (% who start but don't finish) - target typically <15%

For each workflow, provide:
1. Current goal statement
2. Proposed success_criteria (≥2 metrics with specific targets)
3. Rationale for each metric (why this matters to the persona)
4. How to measure (usability test, analytics, survey)

Update workflows using design_update_workflow for each.

Phase Success Check:
After updating workflows:
1. Verify each Workflow has ≥2 success criteria with numeric targets
2. Verify each Workflow has documented starting_state
3. Run design_validate to confirm no errors
4. Confirm success criteria are testable in the Validation phase
```

**Size**: ~250 words
**Expected output**: Updated Workflow entities with success criteria, validation confirmation

---

## Ideate Phase Prompts

**Phase Goal**: Explore solutions that serve the defined workflows.

**Phase Deliverables**:
| Type | Deliverable | Description |
|------|-------------|-------------|
| **Primary** | Capabilities | Implementation-agnostic feature definitions |
| **Secondary** | Priority notes | Initial capability prioritization (in `priority` field) |
| **Secondary** | Feasibility flags | Technical concerns noted in capability requirements |

**Phase Success Criteria**:
- [ ] Every Workflow has ≥1 required Capability
- [ ] Each Capability linked to ≥1 Workflow via `used_by_workflows`
- [ ] Each Capability has ≥3 testable requirements
- [ ] `design_find_orphans` returns no orphan Capabilities
- [ ] `design_find_gaps` returns acceptable gaps only (exceptions documented)
- [ ] `design_validate` returns no errors

---

### Prompt 6: Capability Generation from Workflows

**Purpose**: Generate capabilities needed to support workflows.

**Context needed**: Workflow entities with success criteria

**Prompt**:

```
Analyze the workflows in Designloom and generate capabilities needed to support them.

First, retrieve all workflows:
[Use design_list_workflows to retrieve]

For each workflow, think step-by-step:
1. What steps must the user take to complete this workflow?
2. What must the system be able to DO for each step?
3. Is each capability implementation-agnostic (what, not how)?

A capability is:
- A system feature described functionally (what it does)
- NOT a UI element (that's a component)
- NOT an implementation detail (that's technical design)
- TESTABLE (you can verify it works)

Apply the INVEST framework:
- Independent: Can implement without other capabilities
- Negotiable: Details can be discussed
- Valuable: Serves a user workflow
- Estimable: Clear enough to estimate
- Small: Not epic-sized (weeks of work)
- Testable: Clear criteria for "done"

For each capability, specify:
- id: kebab-case (e.g., "data-import", "search-filter")
- name: Clear, concise name
- category: data/visualization/analysis/interaction/export/collaboration/performance
- description: What it does (not how)
- requirements: ≥3 testable requirements
- used_by_workflows: Link to workflows that need it
- status: "planned"
- notes: Initial priority (P0/P1/P2) and any feasibility concerns

Group related capabilities to avoid overlap. If two capabilities always go together,
consider merging them.

Phase Success Check:
After creating capabilities:
1. Verify every Workflow has ≥1 required Capability
2. Each Capability has ≥3 testable requirements
3. Run design_find_orphans to verify no orphan Capabilities
4. Run design_find_gaps to identify and document any acceptable gaps
5. Run design_validate to confirm no errors
```

**Size**: ~310 words
**Expected output**: Multiple Capability entities, gap documentation

---

### Prompt 7: Capability Requirements Refinement

**Purpose**: Ensure each capability has ≥3 detailed, testable requirements.

**Context needed**: Capability entities with basic descriptions

**Prompt**:

```
Review capabilities in Designloom and ensure each has ≥3 specific, testable requirements.

Retrieve capabilities:
[Use design_list_capabilities with filters as needed]

For each capability, requirements should follow IEEE standards:
- **Clear**: Unambiguous, one interpretation only
- **Complete**: Covers all scenarios including errors
- **Consistent**: No contradictions
- **Testable**: Can verify with specific test
- **Traceable**: Links to source (research, standard, etc.)

Good requirement patterns:
- "Support [format] files with [specification]"
- "Handle inputs up to [limit] without [failure mode]"
- "Provide [feedback type] within [time]"
- "Report [error type] with [message format]"

Bad requirement patterns (avoid):
- "Fast performance" (not measurable)
- "User-friendly" (subjective)
- "Like competitor X" (vague)
- "Should work well" (meaningless)

For each capability needing refinement:
1. List current description and requirements count
2. Identify missing scenarios (happy path, errors, edge cases)
3. Propose specific, testable requirements (ensure ≥3 total)
4. Note any technical feasibility concerns in notes field
5. Note any assumptions that need validation

Update using design_update_capability for each.

Phase Success Check:
After refining capabilities:
1. Verify each Capability has ≥3 testable requirements
2. Requirements cover: happy path, error cases, edge cases
3. Run design_find_gaps to ensure no workflow gaps
4. Run design_validate to confirm no errors
```

**Size**: ~250 words
**Expected output**: Updated Capability entities with refined requirements, validation confirmation

---

## Design Phase Prompts

The Design Phase consists of two sub-phases: Design Foundation (tokens, patterns) and Component Design.

### Phase 4: Design Foundation

**Phase Goal**: Establish visual design language.

**Phase Deliverables**:
| Type | Deliverable | Description |
|------|-------------|-------------|
| **Primary** | Tokens | Design system foundation (colors, typography, spacing) |
| **Primary** | Base Interaction Patterns | Common states and transitions |
| **Secondary** | Design rationale | Token value decisions documented in Sources |
| **Secondary** | Accessibility verification | WCAG contrast validation |

**Phase Success Criteria**:
- [ ] `colors.neutral` scale defined (required)
- [ ] `colors.primary` scale defined (brand color)
- [ ] `typography.sizes.base` defined
- [ ] `typography.fonts.sans` or primary font defined
- [ ] `spacing.scale` defined with ≥8 values
- [ ] Base interaction states documented: default, hover, focus, disabled
- [ ] WCAG 2.1 AA contrast ratios verified (4.5:1 for text, 3:1 for UI)
- [ ] `motion.durations` defined for animation consistency
- [ ] `design_validate` returns no errors

---

### Prompt 8: Token Foundation Setup

**Purpose**: Create the design token foundation for a project.

**Context needed**: Brand guidelines, accessibility requirements

**Prompt**:

```
Create the design token foundation for [PROJECT_NAME].

Brand/design inputs:
[BRAND_COLORS, FONTS, EXISTING_DESIGN_SPECS]

Create a default-theme token set that includes:

**1. Colors (required)**
- neutral: Full scale 50-950 for grays
- primary: Brand primary color scale
- semantic: text_primary, text_secondary, background, surface, border_default, interactive

**2. Typography (required)**
- fonts: sans, mono (with system fallbacks)
- sizes: xs, sm, base, lg, xl, 2xl (use rem units)
- weights: normal, medium, semibold, bold
- styles: h1-h6, body, caption, label

**3. Spacing (required)**
- scale: 1-12 at minimum (≥8 values, 4px base recommended)
- semantic: component_padding_md, gap_md, page_margin

**4. Motion (required for Phase 4)**
- durations: fast, normal, slow
- easings: default, in, out, in-out

**5. Additional (recommended)**
- radii: sm, md, lg, full
- shadows: sm, md, lg for elevation
- breakpoints: sm, md, lg, xl
- z_index: dropdown, modal, popover, tooltip

Quality requirements:
- Semantic naming (purpose, not value): "text-primary" not "gray-900"
- WCAG AA contrast: All text/background combos ≥ 4.5:1 (verify and document)
- UI elements: ≥ 3:1 contrast ratio
- Responsive values: Use breakpoint objects where appropriate
- Token references: Use {token.path} syntax for aliases

Create the token set using design_create_tokens.

Phase Success Check:
After creating tokens:
1. Verify colors.neutral scale is defined
2. Verify colors.primary scale is defined
3. Verify typography.sizes.base is defined
4. Verify spacing.scale has ≥8 values
5. Verify motion.durations is defined
6. Verify WCAG contrast ratios (document verification)
7. Run design_validate to confirm no errors
```

**Size**: ~320 words
**Expected output**: Tokens entity (default-theme), contrast verification notes

---

### Prompt 9: Interaction Pattern Creation

**Purpose**: Create base reusable interaction patterns for common components.

**Context needed**: Component types to support, accessibility requirements, Tokens already created

**Prompt**:

```
Create base reusable interaction patterns for common component types in [PROJECT_NAME].

Required patterns for Phase 4 (base patterns):
- button-interaction: For clickable buttons
- input-interaction: For text inputs
- toggle-interaction: For checkboxes, switches
- [ADDITIONAL_PATTERNS_NEEDED]

For each interaction pattern, define:

**1. States** (required for Phase 4 success):
- default: Normal state (0% overlay)
- hover: Mouse over (8% overlay, cursor: pointer)
- focus: Keyboard focus (12% overlay, focus ring)
- disabled: Not interactive (38% opacity, cursor: not-allowed)
- [active, loading, selected, etc. as needed]

**2. Transitions**:
- from → to with trigger
- animation: duration, easing (reference token)
- properties to animate

**3. Accessibility** (required):
- keyboard: focusable, shortcuts (Enter/Space)
- aria: role, attributes
- reduced_motion: alternative behavior

**4. Microinteractions** (as appropriate):
- trigger: what initiates
- rules: what happens
- feedback: how system communicates
- accessibility.announce: screen reader text

Reference tokens for all values:
- durations: "{motion.durations.fast}"
- colors: "{colors.semantic.interactive}"
- etc.

Create using design_create_interaction for each pattern.

Phase Success Check:
After creating interaction patterns:
1. Verify base states documented: default, hover, focus, disabled
2. All patterns reference tokens (no hardcoded values)
3. All patterns have accessibility.keyboard section
4. All patterns have accessibility.aria section
5. All patterns have reduced_motion alternative
6. Run design_validate to confirm no errors
```

**Size**: ~290 words
**Expected output**: Multiple InteractionPattern entities, base states verification

---

---

### Phase 5: Component Design

**Phase Goal**: Create UI building blocks that implement capabilities.

**Phase Deliverables**:
| Type | Deliverable | Description |
|------|-------------|-------------|
| **Primary** | Components | UI building blocks with props, interactions, accessibility |
| **Secondary** | Component hierarchy | Atomic design categorization (atom/molecule/organism) |
| **Secondary** | Dependency map | Component dependency relationships |

**Phase Success Criteria**:
- [ ] All P0/P1 Capabilities have ≥1 implementing Component
- [ ] Each Component has documented `props` with types/descriptions
- [ ] Each Component has explicit `dependencies` (or empty array)
- [ ] Each Component has interaction specification (embedded or `interaction_pattern` reference)
- [ ] Each Component has `category` assigned (atom/molecule/organism)
- [ ] `design_find_gaps` shows no P0/P1 capabilities without components
- [ ] `design_validate` returns no errors

---

### Prompt 10: Component Design from Capabilities

**Purpose**: Design components that implement capabilities (focus on P0/P1 first).

**Context needed**: Capability entities with priority, Token entities, Interaction patterns

**Prompt**:

```
Design components that implement the capabilities in Designloom, prioritizing P0/P1.

First, analyze what components are needed:
1. Retrieve capabilities: [design_list_capabilities]
2. Filter to P0/P1 capabilities first (check notes field for priority)
3. For each capability, identify UI components needed
4. Group related UI elements into components (atomic design hierarchy)

For each component, define:

**Required fields** (for Phase 5 success):
- id: kebab-case (e.g., "file-upload-dialog")
- name: Human-readable name
- category: atom/molecule/organism (required for Phase 5)
- description: What it is and does
- implements_capabilities: Link to capabilities it implements
- props: Component interface with types (required for Phase 5)
  ```yaml
  props:
    onSubmit:
      type: function
      type_definition: "(data: FormData) => void"
      required: true
    disabled:
      type: boolean
      default_value: false
  ```
- dependencies: Other components this uses (explicit, empty array if none)
- interaction_pattern: Reference reusable pattern OR
- interactions: Inline interaction definition
- accessibility: role, label_required, keyboard_support
- status: planned

**Quality checklist**:
- [ ] Implements at least one capability
- [ ] Has documented props with types and descriptions
- [ ] Has interaction specification (embedded or pattern reference)
- [ ] Has accessibility requirements
- [ ] Dependencies are explicit (even if empty array)
- [ ] Category assigned (atom/molecule/organism)
- [ ] Appropriate scope (not too big/small)

Create components working from atoms → molecules → organisms.
Start with the most-referenced components first.

Phase Success Check:
After creating components:
1. All P0/P1 Capabilities have ≥1 implementing Component
2. Each Component has props with types
3. Each Component has explicit dependencies
4. Each Component has category assigned
5. Run design_find_gaps to verify no P0/P1 capability gaps
6. Run design_validate to confirm no errors
```

**Size**: ~350 words
**Expected output**: Multiple Component entities, gap verification

---

---

### Phase 6: View Assembly

**Phase Goal**: Assemble components into complete screens.

**Phase Deliverables**:
| Type | Deliverable | Description |
|------|-------------|-------------|
| **Primary** | Views | Complete screen layouts with zones and components |
| **Secondary** | Navigation documentation | Route structure and parameters |
| **Secondary** | Data requirements map | API/data dependencies per view |

**Phase Success Criteria**:
- [ ] All P0/P1 Workflows have ≥1 associated View
- [ ] Each View has `layout.type` and `layout.zones` defined
- [ ] Each View handles all states: empty, loading, error, default
- [ ] Each View has `routes` defined (if user-navigable)
- [ ] Each View has `data_requirements` documented
- [ ] All Components referenced in View zones exist in Designloom
- [ ] `design_validate` returns no errors

---

### Prompt 11: View Assembly

**Purpose**: Assemble components into complete screen views for P0/P1 workflows.

**Context needed**: Components, Workflows with priority

**Prompt**:

```
Create views that assemble components into complete screens for [PROJECT_NAME].

First, identify screens needed:
1. List workflows: [design_list_workflows]
2. Filter to P0/P1 workflows first (check notes field for priority)
3. For each workflow, identify screens involved in the journey
4. Group related screens (same layout, different content = states, not views)

For each view, define:

**1. Basic Info** (required):
- id: V01, V02, etc.
- name: Descriptive screen name
- description: Purpose of this view
- workflows: Link to workflows this serves

**2. Layout** (required for Phase 6 success):
- type: single-column/sidebar-left/dashboard/etc.
- zones: Named regions for component placement
  - For each zone: id, position, components, width, visibility by breakpoint

**3. States** (required for Phase 6 success):
- default: Normal operation
- empty: No data (include CTA)
- loading: Fetching data (skeleton components)
- error: Operation failed (error message + retry)

**4. Routing** (required if user-navigable):
- path: URL pattern ("/dashboard/:id")
- params: URL parameters with types
- title: Browser tab title
- requires_auth: If authentication needed

**5. Data Requirements** (required for Phase 6 success):
- What APIs/data needed
- Which state to show during loading/error

**Layout patterns to use**:
- Dashboard: header + sidebar + main content
- Settings: sidebar-left with navigation
- Detail: sidebar-right with metadata
- Forms: single-column, centered

Create using design_create_view for each.

Phase Success Check:
After creating views:
1. All P0/P1 Workflows have ≥1 associated View
2. Each View has layout.type and layout.zones
3. Each View has all states: default, empty, loading, error
4. Each View has data_requirements documented
5. Verify all components referenced in zones exist
6. Run design_validate to confirm no errors
```

**Size**: ~350 words
**Expected output**: Multiple View entities, component reference verification

---

## Validation Phase Prompts

**Phase Goal**: Test designs against user needs before implementation.

**Why validate before coding?** Fixing issues during design costs far less than during implementation. Testing prototypes early can save 40-50% of rework time.

**Phase Deliverables**:
| Type | Deliverable | Description |
|------|-------------|-------------|
| **Primary** | Validated Workflows | Workflows marked `validated: true` after user testing |
| **Primary** | Test findings | User test results documented as Source entities |
| **Secondary** | Prototype assets | Wireframes/prototypes used for testing |
| **Secondary** | Iteration notes | Design changes made based on feedback |

**Phase Success Criteria**:
- [ ] All P0 Workflows tested with ≥5 representative users
- [ ] Test findings documented as Source entities linked to Workflows
- [ ] Major usability issues identified and resolved in designs
- [ ] P0 Workflows marked `validated: true`
- [ ] Updated entities reflect test-driven refinements
- [ ] `design_coverage_report` shows ≥80% capability coverage for P0 workflows
- [ ] `design_validate` returns no errors

---

### Prompt 12: Pre-Development Validation

**Purpose**: Validate design is complete before prototype testing and development.

**Context needed**: All entities created

**Prompt**:

```
Perform comprehensive validation of the Designloom design before prototype testing.

Execute these checks in order:

**1. Schema Validation**
Run: design_validate
Expected: No errors
If errors: List each error and propose fix

**2. Orphan Check**
Run: design_find_orphans
Expected: Empty (no disconnected entities)
If orphans: For each, decide: connect to something OR delete

**3. Gap Analysis**
Run: design_find_gaps
Expected: All P0/P1 workflows have capabilities, all P0/P1 capabilities have components
If gaps: List missing entities to create

**4. Coverage Report**
Run: design_coverage_report
Expected: ≥80% coverage for P0 workflows
If below: Identify lowest-coverage areas and prioritize fixes

**5. Quality Spot-Check**
For each entity type, sample 2-3 P0/P1 entities and verify:

Personas:
- [ ] Has sources linked
- [ ] Goals are specific
- [ ] Frustrations are real (from research)

Workflows:
- [ ] Has ≥2 success_criteria with measurable targets
- [ ] Linked to personas
- [ ] Has starting_state

Capabilities:
- [ ] Has ≥3 testable requirements
- [ ] Linked to workflows
- [ ] Implementation-agnostic

Components:
- [ ] Implements capability
- [ ] Has props documented with types
- [ ] Has interaction specification
- [ ] Has category assigned

Views:
- [ ] Has all states (default, empty, loading, error)
- [ ] Has layout.type and layout.zones
- [ ] Has data_requirements
- [ ] Linked to workflows

**6. Summary Report**
Provide:
- Overall readiness score (%)
- Critical issues (must fix before testing)
- Recommended improvements (should fix)
- P0 workflows ready for prototype testing
- Workflows NOT ready (with reasons)

Phase Success Check:
After validation:
1. design_validate returns no errors
2. design_find_orphans returns empty
3. design_coverage_report shows ≥80% for P0 workflows
4. List P0 workflows ready for user testing
```

**Size**: ~380 words
**Expected output**: Validation report with readiness assessment

---

### Prompt 13: Post-Test Entity Updates

**Purpose**: Update entities based on usability test findings and mark workflows validated.

**Context needed**: Usability test results (5+ users per P0 workflow), existing entities

**Prompt**:

```
Update Designloom entities based on usability testing results.

Test findings:
[USABILITY_TEST_RESULTS]
- Number of users tested per workflow
- Task completion rates
- Time on task measurements
- Error observations
- User feedback/quotes

**Step 1: Document Test Results as Sources**

Create Source entities for test findings:
```yaml
design_create_source --data '{
  "id": "prototype-test-[workflow-id]",
  "title": "Prototype Test - [Workflow Name]",
  "url": "path/to/findings",
  "summary": "[X]/[Y] users completed in target time, key issues: [...]"
}'
```

**Step 2: Update Entities Based on Findings**

For each finding, determine impact:

**Workflow Updates**
- Did users complete the workflow? → Update success_criteria actuals
- Did the goal make sense? → Refine goal statement
- Were there unexpected starting states? → Expand starting_state
- Did ≥5 users test it successfully? → Set validated: true

**Capability Updates**
- Were requirements met? → Note in requirements or update status
- Were requirements unclear? → Refine requirements
- Were capabilities missing? → Create new capabilities

**Component Updates**
- Were interactions confusing? → Update interaction specification
- Were props incorrect? → Update props
- Were components missing? → Create new components

**View Updates**
- Were layouts effective? → Confirm or revise layout.zones
- Were states handled well? → Update state content
- Were errors clear? → Update error state messaging

**Step 3: Mark Validated Workflows**

For workflows that passed testing:
```yaml
design_update_workflow --id W01 --data '{"validated": true}'
```

**Step 4: New Insights**
- Any new personas discovered? → Create new Persona
- Any new workflows observed? → Create new Workflow
- Any new frustrations identified? → Update Persona frustrations

For each update:
1. Cite the specific test finding (link to Source)
2. Explain the change rationale
3. Execute the update using appropriate design_update_* tool
4. Verify the update using design_get_*

Phase Success Check:
After updates:
1. Test findings documented as Source entities
2. All P0 Workflows tested with ≥5 users are marked validated: true
3. Major usability issues resolved in designs
4. Updated entities reflect test-driven refinements
5. Run design_validate to confirm no errors
```

**Size**: ~380 words
**Expected output**: Updated entities, Source entities for test findings, validated workflows

---

## Handoff Phase Prompts

**Phase Goal**: Prepare validated designs for development implementation.

**Phase Deliverables**:
| Type | Deliverable | Description |
|------|-------------|-------------|
| **Primary** | Development-ready documentation package | Complete specs for implementation |
| **Primary** | Interaction specifications with all states | Behavior documentation |
| **Primary** | Component API documentation | Props, types, interfaces |
| **Secondary** | Visual diagram exports | Architecture and flow diagrams |
| **Secondary** | Test specifications | Generated from requirements |
| **Secondary** | Accessibility checklist per component | A11y requirements |

**Phase Success Criteria**:
- [ ] `design_validate` returns no errors
- [ ] `design_find_orphans` returns empty
- [ ] All key workflows have `validated: true`
- [ ] All components have `props` documented with types
- [ ] All views have all `states` defined (default, loading, error, empty)
- [ ] Interaction specifications include all state transitions
- [ ] Accessibility requirements documented for each component
- [ ] Documentation package reviewed by at least one developer

---

### Prompt 14: Handoff Preparation

**Purpose**: Prepare design documentation package for development handoff.

**Context needed**: All validated entities, developer stakeholder

**Prompt**:

```
Prepare the Designloom design for development handoff.

**Step 1: Final Validation**

Run all validation checks:
```
design_validate          # Expected: No errors
design_find_orphans      # Expected: Empty
design_coverage_report   # Expected: ≥80% coverage for P0/P1
```

**Step 2: Review Development-Ready Checklist**

For each entity type, verify completeness:

| Category | What to Check | Designloom Source |
|----------|---------------|-------------------|
| **Visual specs** | Colors, typography, spacing values | `design_list_tokens` |
| **Component API** | Props documented with types | `component.props` |
| **Interactions** | All states and transitions specified | `interaction.states` |
| **Accessibility** | Keyboard, ARIA, reduced motion | `interaction.accessibility` |
| **Edge cases** | Empty, loading, error states | `view.states` |

**Step 3: Generate Documentation Exports**

```
design_export_diagram --type workflow    # User flow diagrams
design_export_diagram --type component   # Component relationships
design_generate_tests --all              # Test specifications
```

**Step 4: Verify Key Workflows**

List all validated workflows:
```
design_list_workflows --filter '{"validated": true}'
```

For each P0/P1 workflow, verify:
- [ ] All components in views have props documented
- [ ] All interactions have accessibility requirements
- [ ] All views have routing defined (if navigable)
- [ ] Success criteria are measurable for UAT

**Step 5: Create Handoff Summary**

Generate a handoff summary document including:
1. List of validated workflows (ready for implementation)
2. Component inventory with complexity estimates
3. Key technical considerations from capability requirements
4. Accessibility requirements summary
5. Token values for design system implementation

**Step 6: Developer Review**

Before finalizing handoff:
- [ ] At least one developer has reviewed documentation
- [ ] Developer questions captured and addressed
- [ ] Implementation concerns documented

Phase Success Check:
After handoff preparation:
1. design_validate returns no errors
2. design_find_orphans returns empty
3. All P0/P1 workflows have validated: true
4. All components have props with types
5. All views have all states defined
6. Developer has reviewed and approved documentation
```

**Size**: ~380 words
**Expected output**: Handoff documentation package, developer approval

---

### Prompt 15: Handoff Gap Analysis

**Purpose**: Identify and resolve gaps before implementation begins.

**Context needed**: Handoff documentation, developer feedback

**Prompt**:

```
Analyze the design handoff for gaps that would block or confuse development.

**Step 1: Collect Developer Feedback**

Common developer concerns to address:
- "What happens when X fails?"
- "What's the prop type for Y?"
- "How does this component know about Z?"
- "What's the API contract?"

Feedback received:
[DEVELOPER_FEEDBACK]

**Step 2: Run Gap Analysis**

```
design_find_gaps
```

For each gap identified:
1. Is it a P0/P1 gap? (Must fix before implementation)
2. Is it a P2 gap? (Can defer)
3. What entity needs to be created/updated?

**Step 3: Check for Common Handoff Gaps**

| Gap Type | How to Check | Fix |
|----------|--------------|-----|
| **Missing error states** | Review view.states | Add error state content |
| **Undefined props** | Review component.props | Add type definitions |
| **Missing loading states** | Review view.states | Add skeleton/spinner specs |
| **Unclear interactions** | Review interaction.transitions | Add missing transitions |
| **No accessibility** | Check interaction.accessibility | Add keyboard, ARIA specs |
| **Missing routes** | Check view.routes | Add path, params |
| **Data requirements** | Check view.data_requirements | Document API dependencies |

**Step 4: Prioritize Gap Fixes**

Create a prioritized fix list:
- **Critical (blocks P0)**: Must fix before starting implementation
- **High (blocks P1)**: Must fix before P1 implementation
- **Medium (incomplete)**: Should fix for quality
- **Low (nice-to-have)**: Can defer

**Step 5: Execute Fixes**

For each gap:
1. Update the appropriate entity
2. Verify the fix with developer
3. Run design_validate after each fix

Phase Success Check:
After gap resolution:
1. All Critical and High gaps resolved
2. Developer confirms documentation is complete
3. design_validate returns no errors
4. design_find_gaps shows only acceptable P2 gaps
```

**Size**: ~320 words
**Expected output**: Gap resolution report, updated entities

---

## Implementation Planning Prompts

**Phase Goal**: Determine implementation order based on Designloom data and prepare for development.

**Phase Deliverables**:
| Type | Deliverable | Description |
|------|-------------|-------------|
| **Primary** | Prioritized workflow list (P0/P1/P2) | Implementation order |
| **Primary** | Golden path workflow identification | First vertical slice |
| **Primary** | Implementation order document | Sequenced build plan |
| **Secondary** | Priority factors documentation | Rationale for priorities |
| **Secondary** | Technical spike results | Risk reduction findings |

**Phase Success Criteria**:
- [ ] All workflows have assigned priority (P0/P1/P2) with documented rationale
- [ ] All capabilities have assigned priority
- [ ] P0 workflows already validated (from Validation phase)
- [ ] Golden path workflow identified and documented
- [ ] Technical spikes completed for high-complexity capabilities
- [ ] Implementation order documented and agreed upon by team
- [ ] Dependency mapping shows no circular dependencies
- [ ] Risk assessment completed for P0 items

---

### Prompt 16: Implementation Prioritization

**Purpose**: Prioritize workflows, capabilities, and components for implementation order.

**Context needed**: All validated entities, business priorities

**Prompt**:

```
Establish implementation priorities for [PROJECT_NAME] based on Designloom data.

**Step 1: Analyze Workflow Priority Factors**

Retrieve all workflows:
```
design_list_workflows
```

Score each workflow on these factors:

| Factor | How to Assess | Designloom Data | Weight |
|--------|---------------|-----------------|--------|
| User frequency | How often performed? | Persona `frequency` field | High |
| Criticality | Core to product? | Workflow `category` (onboarding = high) | High |
| Persona coverage | How many personas? | Workflow `personas[]` count | Medium |
| Dependency | Others depend on it? | Cross-reference `requires_capabilities` | Medium |
| Validated | Tested with users? | Workflow `validated` field | High |

Assign priorities:
- **P0 (Critical)**: Core workflows, validated, high frequency
- **P1 (Important)**: Secondary workflows, medium frequency
- **P2 (Nice-to-have)**: Edge cases, low frequency

**Step 2: Analyze Capability Priority Factors**

Retrieve all capabilities:
```
design_list_capabilities
```

Score each capability:

| Factor | How to Assess | Designloom Data |
|--------|---------------|-----------------|
| Workflow coverage | How many workflows need it? | `used_by_workflows[]` count |
| Foundation | Dependency for others? | Cross-reference component `dependencies` |
| Complexity | Technically risky? | Capability `requirements` complexity |

**Step 3: Analyze Component Priority Factors**

```
design_list_components
```

| Factor | How to Assess | Designloom Data |
|--------|---------------|-----------------|
| Reusability | Used by many views? | Count views containing component |
| Dependency chain | Others waiting on it? | `dependencies[]` reverse lookup |
| Atomic level | Build atoms first | `category` field (atoms → molecules → organisms) |

**Step 4: Update Entities with Priority**

For each entity:
```
design_update_workflow --id W01 --data '{"notes": "P0 - Golden path, validated"}'
design_update_capability --id data-import --data '{"notes": "P0 - Required by 3 workflows"}'
```

**Step 5: Document Rationale**

Create a Source entity documenting prioritization:
```yaml
design_create_source --data '{
  "id": "implementation-priorities",
  "title": "Implementation Priority Assignment",
  "url": "internal",
  "summary": "P0: W01, W03; P1: W02, W04; P2: W05. Rationale: ..."
}'
```

Phase Success Check:
After prioritization:
1. All workflows have P0/P1/P2 in notes field
2. All capabilities have priority assigned
3. P0 workflows are validated: true
4. Prioritization rationale documented
```

**Size**: ~400 words
**Expected output**: Prioritized entities, rationale documentation

---

### Prompt 17: Golden Path Identification

**Purpose**: Identify the first vertical slice workflow for implementation.

**Context needed**: Prioritized workflows, validated entities

**Prompt**:

```
Identify the Golden Path workflow for [PROJECT_NAME] - the first vertical slice to implement.

**What is the Golden Path?**

The Golden Path is:
- The highest-priority validated workflow (P0)
- Implemented end-to-end (UI → Logic → Data)
- The first complete feature users can test
- Foundation for expanding to other workflows

**Step 1: List P0 Validated Workflows**

```
design_list_workflows --filter '{"validated": true}'
```

Filter to those marked P0 in notes. These are candidates.

**Step 2: Evaluate Golden Path Candidates**

For each P0 validated workflow, assess:

| Criteria | Why It Matters | Check |
|----------|----------------|-------|
| Self-contained | Can complete without other workflows | Review requires_capabilities |
| Demonstrable value | Shows product's core proposition | Review goal |
| Testable | Clear success criteria | Review success_criteria |
| Low external deps | Minimal API/data dependencies | Review view data_requirements |
| Foundation | Establishes patterns for other workflows | Review suggested_components |

**Step 3: Trace Golden Path Dependencies**

For the selected workflow:

1. List required capabilities:
   ```
   design_get_workflow --id [WORKFLOW_ID]
   # Check requires_capabilities field
   ```

2. List required components:
   ```
   # For each capability, find implementing components
   design_list_components --filter '{"implements_capabilities": ["capability-id"]}'
   ```

3. List required views:
   ```
   design_list_views
   # Filter to those linked to this workflow
   ```

**Step 4: Document Golden Path**

Create implementation spec:

```yaml
Golden Path: [WORKFLOW_ID] - [WORKFLOW_NAME]

Why this workflow:
- [Rationale for selection]

Required entities:
- Capabilities: [list]
- Components: [list]
- Views: [list]
- Tokens: [subset needed]
- Interactions: [patterns needed]

Implementation order:
1. [First thing to build]
2. [Second thing to build]
...

Success validation:
- [Success criteria from workflow]
- [How to verify implementation matches design]
```

**Step 5: Update Workflow**

```
design_update_workflow --id [WORKFLOW_ID] --data '{
  "notes": "P0 - GOLDEN PATH - Implement first"
}'
```

Phase Success Check:
After Golden Path identification:
1. One workflow identified as Golden Path
2. All dependencies traced and documented
3. Implementation order established
4. Team agrees on selection
```

**Size**: ~380 words
**Expected output**: Golden Path specification document

---

### Prompt 18: Technical Spike Planning

**Purpose**: Identify high-risk capabilities and plan technical spikes.

**Context needed**: Capabilities with complexity concerns

**Prompt**:

```
Plan technical spikes for high-risk capabilities in [PROJECT_NAME].

**What is a Technical Spike?**

A spike is a time-boxed investigation (1-3 days) to:
- Reduce uncertainty before committing to implementation
- Prototype technical approaches
- Validate feasibility of complex requirements
- Output: decision, proof-of-concept, or "don't build this"

**Step 1: Identify High-Complexity Capabilities**

Review capabilities:
```
design_list_capabilities
```

Flag capabilities with:
- [ ] New/unfamiliar technology
- [ ] Complex requirements (many edge cases)
- [ ] Performance-critical requirements
- [ ] External integration dependencies
- [ ] Security-sensitive functionality
- [ ] Notes mentioning "feasibility concern"

**Step 2: Assess Spike Need**

For each flagged capability:

| Question | If Yes | If No |
|----------|--------|-------|
| Have we done this before? | Lower risk | Spike candidate |
| Is the approach proven? | Lower risk | Spike candidate |
| Are requirements clear? | Lower risk | Research spike |
| Is scale/performance known? | Lower risk | Performance spike |
| Are APIs documented? | Lower risk | Integration spike |

**Step 3: Define Spike Scope**

For each spike needed:

```yaml
Spike: [CAPABILITY_ID] - [SPIKE_NAME]

Time-box: [1-3 days]

Questions to answer:
1. [Specific question 1]
2. [Specific question 2]

Acceptance criteria:
- [ ] Can/cannot do [X]
- [ ] Approach [A] vs [B] decision made
- [ ] Performance meets [target]

Output:
- [ ] Decision document
- [ ] Proof-of-concept (if applicable)
- [ ] Updated capability requirements
```

**Step 4: Update Capability with Spike Info**

```
design_update_capability --id [CAPABILITY_ID] --data '{
  "notes": "P0 - SPIKE NEEDED: [brief description]. Time-box: 2 days"
}'
```

**Step 5: Document Spike Results**

After spike completion, create Source:

```yaml
design_create_source --data '{
  "id": "spike-[capability-id]",
  "title": "Technical Spike - [Capability Name]",
  "url": "path/to/spike-results",
  "summary": "Decision: [approach]. Validated [X]. Risk: [remaining risk]"
}'
```

Update capability with findings:
```
design_update_capability --id [CAPABILITY_ID] --data '{
  "notes": "P0 - Spike complete. Approach: [chosen]. Risk: low"
}'
```

Phase Success Check:
After spike planning:
1. All high-complexity capabilities identified
2. Spikes defined with time-boxes
3. Questions and acceptance criteria clear
4. Spike schedule fits before implementation
```

**Size**: ~400 words
**Expected output**: Spike specifications, updated capability notes

---

## Vertical Slice Implementation Prompts

**Phase Goal**: Implement features as complete vertical slices to reduce risk and enable early validation.

**Phase Deliverables**:
| Type | Deliverable | Description |
|------|-------------|-------------|
| **Primary** | Golden path workflow implemented | First complete feature |
| **Primary** | All P0 components built | Core UI building blocks |
| **Primary** | All P0 views rendered | Complete screens |
| **Secondary** | Updated Designloom entities | Implementation learnings |
| **Secondary** | Component unit tests | Quality verification |

**Phase Success Criteria** (per slice):
- [ ] Workflow completable end-to-end by target persona
- [ ] All success criteria from Workflow definition are met and measurable
- [ ] Implementation matches View layout specification
- [ ] Component props match Designloom definitions
- [ ] Accessibility requirements from Interactions are met
- [ ] All view states implemented (default, loading, error, empty)
- [ ] No hardcoded values—all styling via tokens
- [ ] Designloom entities updated with any implementation-driven changes

---

### Prompt 19: Vertical Slice Implementation Spec

**Purpose**: Generate implementation specification for a workflow vertical slice.

**Context needed**: Golden Path or P0/P1 workflow

**Prompt**:

```
Generate implementation specification for workflow [WORKFLOW_ID] as a vertical slice.

**What is a Vertical Slice?**

Build one complete feature (UI → Logic → Data) instead of layers:
```
Traditional (Risky):          Vertical Slice (Lower Risk):
┌─────────────────────┐       ┌─────┐ ┌─────┐ ┌─────┐
│      All UI         │       │ UI  │ │ UI  │ │ UI  │
├─────────────────────┤       ├─────┤ ├─────┤ ├─────┤
│     All Logic       │  →    │Logic│ │Logic│ │Logic│
├─────────────────────┤       ├─────┤ ├─────┤ ├─────┤
│      All Data       │       │Data │ │Data │ │Data │
└─────────────────────┘       └─────┘ └─────┘ └─────┘
                              Feat 1  Feat 2  Feat 3
```

**Step 1: Get Workflow Definition**

```
design_get_workflow --id [WORKFLOW_ID]
```

Extract:
- Goal (what user accomplishes)
- Success criteria (how we measure success)
- Starting state (context when workflow begins)
- Required capabilities
- Target personas

**Step 2: Get View Specifications**

```
design_list_views --filter '{"workflows": ["[WORKFLOW_ID]"]}'
```

For each view:
- Layout type and zones
- Components per zone
- All states (default, loading, error, empty)
- Routes and data requirements

**Step 3: Get Component Specifications**

For each component in views:
```
design_get_component --id [COMPONENT_ID]
```

Extract:
- Props with types (implementation interface)
- Dependencies (other components needed)
- Interaction pattern or inline interactions
- Accessibility requirements

**Step 4: Get Token Values**

```
design_list_tokens
```

Extract values needed for:
- Colors used by components
- Typography for text elements
- Spacing for layouts
- Motion for interactions

**Step 5: Generate Implementation Spec**

Create implementation document:

```yaml
Workflow: [ID] - [NAME]
Priority: [P0/P1/P2]
Validated: [true/false]

User Goal: [goal statement]

Success Criteria:
- metric: [metric]
  target: [target]
  how_to_measure: [method]

Views to Build:
- [VIEW_ID]:
    route: [path]
    layout: [type]
    components: [list]
    states: [default, loading, error, empty]

Components to Build:
- [COMPONENT_ID]:
    props: [TypeScript interface]
    dependencies: [list]
    interaction: [pattern or inline]
    accessibility: [requirements]

Tokens Needed:
- colors: [list]
- typography: [list]
- spacing: [list]
- motion: [list]

Implementation Order:
1. [atoms first]
2. [then molecules]
3. [then organisms]
4. [then views]
5. [then workflow integration]

Acceptance Tests:
- [ ] [Success criterion 1]
- [ ] [Success criterion 2]
- [ ] [Accessibility checks]
```

**Size**: ~420 words
**Expected output**: Complete implementation specification for one workflow

---

### Prompt 20: Implementation Validation Against Design

**Purpose**: Validate implementation matches Designloom specifications.

**Context needed**: Implemented workflow, Designloom entities

**Prompt**:

```
Validate implementation of [WORKFLOW_ID] against Designloom specifications.

**Step 1: Component Interface Validation**

For each implemented component:

```
design_get_component --id [COMPONENT_ID]
```

Compare implemented props to Designloom props:
- [ ] All required props implemented
- [ ] Prop types match specification
- [ ] Default values match specification
- [ ] No extra undocumented props

**Step 2: Visual Validation**

Compare implementation to tokens:

```
design_list_tokens
```

Check:
- [ ] Colors match token values (no hardcoded colors)
- [ ] Typography matches token values
- [ ] Spacing matches token values
- [ ] No hardcoded values that should be tokens

**Step 3: Interaction Validation**

Compare implementation to interaction specifications:

```
design_list_interactions
# or check component.interactions
```

Verify:
- [ ] All states implemented (default, hover, focus, disabled, etc.)
- [ ] Transitions match specification
- [ ] Timing matches token durations
- [ ] Accessibility requirements met

**Step 4: Layout Validation**

Compare implementation to view specifications:

```
design_get_view --id [VIEW_ID]
```

Check:
- [ ] Layout type matches (single-column, sidebar-left, etc.)
- [ ] Components in correct zones
- [ ] Responsive behavior matches breakpoints
- [ ] All states implemented (default, empty, loading, error)

**Step 5: Success Criteria Validation**

```
design_get_workflow --id [WORKFLOW_ID]
```

Measure against success_criteria:
- [ ] Task completion rate: [actual] vs [target]
- [ ] Time on task: [actual] vs [target]
- [ ] Error rate: [actual] vs [target]

**Step 6: Update Designloom with Learnings**

If implementation revealed issues:

```
# Update component if props changed
design_update_component --id [ID] --data '{"props": {...updated...}}'

# Document deviation
design_create_source --data '{
  "id": "impl-deviation-[component-id]",
  "title": "Implementation Deviation - [Component]",
  "summary": "Changed X because Y. Approved by Z."
}'
```

**Step 7: Validation Report**

| Check | Status | Notes |
|-------|--------|-------|
| Component interfaces | ✓/✗ | |
| Token usage | ✓/✗ | |
| Interactions | ✓/✗ | |
| Layout | ✓/✗ | |
| Accessibility | ✓/✗ | |
| Success criteria | ✓/✗ | |

Overall: PASS / NEEDS FIXES

Phase Success Check:
After validation:
1. Implementation matches Designloom specifications
2. Deviations documented with rationale
3. Success criteria measurements captured
4. Designloom updated with learnings
```

**Size**: ~400 words
**Expected output**: Validation report, updated entities if deviations

---

## Iterative Expansion Prompts

**Phase Goal**: Systematically expand implementation following priority order.

**Phase Deliverables**:
| Type | Deliverable | Description |
|------|-------------|-------------|
| **Primary** | All P1 workflows implemented | Important features complete |
| **Primary** | Reusable patterns extracted | Shared components documented |
| **Secondary** | Updated coverage report | Implementation progress |
| **Secondary** | User feedback integration | Improvements from production |

**Phase Success Criteria**:
- [ ] All P0 and P1 workflows implemented and validated
- [ ] Coverage report shows target coverage achieved (>80%)
- [ ] All implemented workflows have `validated: true`
- [ ] `design_find_orphans` returns empty
- [ ] New patterns extracted (3+ similar implementations → component)
- [ ] User feedback reviewed and integrated
- [ ] Designloom entities current with implementation state

---

### Prompt 21: Implementation Progress Tracking

**Purpose**: Track implementation progress using Designloom.

**Context needed**: Implemented workflows, remaining work

**Prompt**:

```
Track implementation progress for [PROJECT_NAME] using Designloom data.

**Step 1: Coverage Report**

```
design_coverage_report
```

Interpret results:
- Workflow coverage: [X]% (target: >80% for P0/P1)
- Capability coverage: [X]%
- Component coverage: [X]%

**Step 2: Implementation Status by Priority**

List P0 workflows:
```
design_list_workflows
# Filter to P0 in notes
```

Status for each P0:
- [ ] W01: [Implemented/In Progress/Not Started]
- [ ] W02: [status]

List P1 workflows:
- [ ] W03: [status]
- [ ] W04: [status]

**Step 3: Update Implementation Status**

For completed workflows:
```
design_update_workflow --id W01 --data '{
  "notes": "P0 - IMPLEMENTED - 2025-01-16, validated: true"
}'
```

For in-progress:
```
design_update_workflow --id W02 --data '{
  "notes": "P0 - IN PROGRESS - 60% complete, blocked on [X]"
}'
```

**Step 4: Identify Blockers**

Common blockers:
- [ ] Missing component specifications
- [ ] Unclear capability requirements
- [ ] Missing API documentation
- [ ] Technical spike needed

For each blocker:
1. Document in relevant entity notes
2. Create Source if external dependency
3. Update priority if blocked

**Step 5: Progress Dashboard**

Generate summary:

```
Implementation Progress - [DATE]

P0 Workflows: [X]/[Y] complete ([Z]%)
P1 Workflows: [X]/[Y] complete ([Z]%)

Blockers:
- [Blocker 1]: [Assigned to], [ETA]
- [Blocker 2]: [Assigned to], [ETA]

Next to implement:
1. [Next P1 workflow]
2. [Next capability]

Coverage: [X]% (target: 80%)
```

Phase Success Check:
After progress tracking:
1. All workflow statuses current
2. Blockers identified and assigned
3. Coverage trending toward target
4. Next implementations identified
```

**Size**: ~320 words
**Expected output**: Progress report, updated entity notes

---

### Prompt 22: Pattern Extraction

**Purpose**: Extract reusable patterns from implemented components.

**Context needed**: Multiple implemented components, pattern candidates

**Prompt**:

```
Identify and extract reusable patterns from implemented components.

**When to Extract a Pattern?**

Extract when:
- 3+ components share similar structure
- Same interaction pattern appears repeatedly
- Same layout zone configuration repeats
- Developers are copy-pasting code

**Step 1: Identify Pattern Candidates**

Review implemented components:
```
design_list_components
```

Look for similarities:
- [ ] Similar prop interfaces
- [ ] Similar interaction states
- [ ] Similar layout structures
- [ ] Similar accessibility patterns

**Step 2: Define Shared Pattern**

For each pattern candidate:

```yaml
Pattern: [PATTERN_NAME]

Shared by:
- [component-1]
- [component-2]
- [component-3]

Common elements:
- Props: [shared props]
- States: [shared states]
- Accessibility: [shared requirements]

Variations:
- [component-1]: [what's different]
- [component-2]: [what's different]
```

**Step 3: Create Pattern Entity**

If interaction pattern:
```
design_create_interaction --data '{
  "id": "[pattern-id]",
  "name": "[Pattern Name]",
  "applies_to": ["[component-type]"],
  "states": {...},
  "accessibility": {...}
}'
```

If component pattern, create abstract component:
```
design_create_component --data '{
  "id": "[base-component-id]",
  "name": "[Base Component Name]",
  "description": "Abstract pattern for [purpose]",
  "category": "atom",
  "props": {...common props...}
}'
```

**Step 4: Update Existing Components**

Link components to pattern:
```
design_update_component --id [component-id] --data '{
  "interaction_pattern": "[pattern-id]"
}'
```

Or note the pattern:
```
design_update_component --id [component-id] --data '{
  "notes": "Based on [pattern-id] pattern"
}'
```

**Step 5: Document in Designloom**

Create Source documenting pattern:
```yaml
design_create_source --data '{
  "id": "pattern-[name]",
  "title": "Pattern Extraction - [Name]",
  "summary": "Extracted from [components]. Used by [N] components."
}'
```

Phase Success Check:
After pattern extraction:
1. Patterns with 3+ uses identified
2. Pattern entities created in Designloom
3. Existing components updated to reference patterns
4. Pattern documentation created
```

**Size**: ~370 words
**Expected output**: New pattern entities, updated component references

---

## Release and Living Documentation Prompts

**Phase Goal**: Complete release and establish Designloom as living documentation.

**Phase Deliverables**:
| Type | Deliverable | Description |
|------|-------------|-------------|
| **Primary** | Synchronized Designloom | Matches implementation |
| **Primary** | Generated documentation | Exported from Designloom |
| **Primary** | Final validation reports | No errors, no orphans |
| **Secondary** | Implementation retrospective | Lessons learned |
| **Secondary** | Maintenance schedule | Ongoing sync process |

**Phase Success Criteria**:
- [ ] `design_validate` returns no errors
- [ ] `design_find_orphans` returns empty
- [ ] `design_coverage_report` shows 100% for P0/P1 workflows
- [ ] All workflows have `validated: true`
- [ ] Designloom entities match implemented code (no drift)
- [ ] Documentation exports generated and published
- [ ] Retrospective completed and lessons learned documented
- [ ] Maintenance schedule established

---

### Prompt 23: Release Synchronization

**Purpose**: Synchronize Designloom with implemented code before release.

**Context needed**: Implemented features, Designloom entities

**Prompt**:

```
Synchronize Designloom entities with implemented code for release.

**Step 1: Final Validation**

```
design_validate
design_find_orphans
design_coverage_report
```

Expected:
- No validation errors
- No orphan entities
- 100% coverage for P0/P1

**Step 2: Entity Audit**

For each entity type, compare Designloom to implementation:

**Workflows**:
```
design_list_workflows
```
- [ ] All implemented workflows marked `validated: true`
- [ ] Success criteria reflect actual measurements
- [ ] Starting states match real-world usage

**Components**:
```
design_list_components
```
- [ ] Props match implemented TypeScript interfaces
- [ ] Deprecated components removed
- [ ] New components added during implementation

**Views**:
```
design_list_views
```
- [ ] Layouts match implemented pages
- [ ] States match implemented behavior
- [ ] Routes match actual URLs

**Tokens**:
```
design_list_tokens
```
- [ ] Values match CSS custom properties
- [ ] No hardcoded values in implementation

**Step 3: Update Drift**

For each discrepancy:
1. Determine source of truth (design or implementation)
2. If implementation is correct, update Designloom
3. If design is correct, file bug for implementation

```
# Update Designloom to match implementation
design_update_component --id [ID] --data '{...updated...}'

# Document intentional deviation
design_create_source --data '{
  "id": "deviation-[id]",
  "summary": "Implementation differs from design because [reason]"
}'
```

**Step 4: Mark Final Status**

```
# All P0/P1 workflows implemented
design_update_workflow --id W01 --data '{
  "notes": "P0 - RELEASED v1.0 - All criteria met"
}'
```

Phase Success Check:
After synchronization:
1. design_validate returns no errors
2. design_find_orphans returns empty
3. All P0/P1 workflows have validated: true
4. Designloom matches implementation
```

**Size**: ~340 words
**Expected output**: Synchronized Designloom, drift documentation

---

### Prompt 24: Documentation Generation

**Purpose**: Generate documentation from Designloom for release.

**Context needed**: Synchronized Designloom entities

**Prompt**:

```
Generate release documentation from Designloom entities.

**Step 1: Architecture Diagrams**

```
design_export_diagram --type all
```

Generates:
- Entity relationship diagram
- Workflow journey diagrams
- Component dependency diagram

**Step 2: Component Catalog**

```
design_list_components --format detailed
```

For each component, generate:
- Name and description
- Props with TypeScript types
- Usage examples
- Dependencies
- Accessibility requirements

**Step 3: Style Guide**

```
design_list_tokens
```

Generate:
- Color palette with values
- Typography scale
- Spacing scale
- Motion tokens

**Step 4: User Flow Documentation**

```
design_list_workflows
```

For each workflow, generate:
- User goal
- Step-by-step journey
- Success criteria
- Screenshots/wireframes reference

**Step 5: Test Specifications**

```
design_generate_tests --all
```

Generate test cases from:
- Workflow success criteria
- Capability requirements
- Component props
- View states

**Step 6: Accessibility Checklist**

```
design_list_interactions
```

Generate per-component:
- Keyboard requirements
- ARIA requirements
- Screen reader behavior
- Reduced motion alternatives

**Documentation Package**:

```
docs/
├── architecture/
│   ├── entity-diagram.md
│   └── component-deps.md
├── components/
│   ├── [component-name].md
│   └── ...
├── flows/
│   ├── [workflow-name].md
│   └── ...
├── style-guide/
│   ├── colors.md
│   ├── typography.md
│   └── spacing.md
├── testing/
│   ├── test-specs.md
│   └── accessibility-checklist.md
└── README.md
```

Phase Success Check:
After documentation generation:
1. All diagrams exported
2. Component catalog complete
3. Style guide matches tokens
4. Test specifications generated
5. Documentation reviewed for accuracy
```

**Size**: ~320 words
**Expected output**: Complete documentation package

---

### Prompt 25: Implementation Retrospective

**Purpose**: Document lessons learned for process improvement.

**Context needed**: Completed implementation, team feedback

**Prompt**:

```
Conduct implementation retrospective and document lessons learned.

**Step 1: Gather Metrics**

From Designloom:
- Total entities created: [count per type]
- Entities updated during implementation: [count]
- Deviations documented: [count]
- Spikes conducted: [count]

From implementation:
- Total development time: [duration]
- Rework instances: [count]
- Bugs from design gaps: [count]

**Step 2: What Went Well**

Questions to answer:
- Which Designloom features saved time?
- Which entities were most useful for developers?
- What design decisions proved correct?
- Where did prototyping pay off?

**Step 3: What Could Improve**

Questions to answer:
- Which entities needed frequent updates?
- What was missing from design specifications?
- Where did implementation reveal design gaps?
- What Designloom fields would have helped?

**Step 4: Process Recommendations**

Based on learnings:
- [ ] Add/remove entity fields
- [ ] Change validation rules
- [ ] Modify phase sequence
- [ ] Update success criteria

**Step 5: Document Retrospective**

```yaml
design_create_source --data '{
  "id": "retrospective-v1",
  "title": "Implementation Retrospective - v1.0",
  "url": "internal/retro",
  "summary": "Key learnings: [summary]. Recommendations: [list]"
}'
```

**Retrospective Template**:

```markdown
# Implementation Retrospective - [VERSION]

## Metrics
- Entities: [counts]
- Development time: [duration]
- Rework rate: [%]

## What Went Well
1. [Learning 1]
2. [Learning 2]

## What Could Improve
1. [Issue 1] → Recommendation: [fix]
2. [Issue 2] → Recommendation: [fix]

## Process Changes for Next Time
1. [Change 1]
2. [Change 2]

## Designloom Improvements
1. [Suggestion 1]
2. [Suggestion 2]
```

**Step 6: Establish Maintenance Schedule**

```yaml
Maintenance Schedule:
- Weekly: design_validate, check for drift
- Monthly: design_find_orphans, review coverage
- Per release: Full synchronization
- Annually: Process retrospective
```

Phase Success Check:
After retrospective:
1. Metrics gathered
2. Learnings documented
3. Recommendations actionable
4. Maintenance schedule established
```

**Size**: ~370 words
**Expected output**: Retrospective document, maintenance schedule

---

## Change Management Prompts

These prompts are used throughout the project lifecycle when changes are needed to existing designs.

### Prompt 26: Impact Analysis for Changes

**Purpose**: Assess impact before making changes.

**Context needed**: Entity to change, proposed change

**Prompt**:

```
Analyze the impact of a proposed change to [ENTITY_TYPE] [ENTITY_ID].

Proposed change:
[DESCRIBE_CHANGE]

**Step 1: Identify Direct Dependencies**

Retrieve the entity and examine _resolved references:
[Use design_get_[entity_type] --id [ENTITY_ID]]

List all entities that:
- Reference this entity
- Are referenced by this entity

**Step 2: Trace Cascading Effects**

For each direct dependency, trace further:
- If changing a Workflow → What Capabilities depend on it? → What Components?
- If changing a Capability → What Workflows use it? → What Components implement it?
- If changing a Component → What Views include it? → What Capabilities does it implement?
- If changing Tokens → What Components use these tokens (visual regression)?
- If changing an Interaction → What Components use this pattern?

**Step 3: Assess Risk**

Categorize impact:
- HIGH: Changes user-facing behavior, affects multiple workflows
- MEDIUM: Changes implementation, affects multiple components
- LOW: Isolated change, affects single entity

**Step 4: Recommend Approach**

Based on impact, recommend:
- Can this be done incrementally?
- What entities need updating?
- What order should updates happen?
- What validation is needed after?
- Should we create new entities and deprecate old ones?

Provide a step-by-step change plan with specific tool calls.
```

**Size**: ~260 words
**Expected output**: Impact analysis and change plan

---

### Prompt 27: New Feature Addition

**Purpose**: Add a new feature to an existing project.

**Context needed**: Feature description, existing entities

**Prompt**:

```
Add a new feature to [PROJECT_NAME]: [FEATURE_DESCRIPTION]

**Step 1: Research Fit**

Analyze existing personas:
[design_list_personas]
- Which personas need this feature?
- Does this require a new persona?

**Step 2: Define Need**

Create or update workflows:
- Does this feature serve an existing workflow?
- If new workflow needed:
  - What persona(s) does it serve?
  - What is the user goal?
  - What are success criteria?

**Step 3: Specify Capability**

Create capability:
- What does this feature DO (not how)?
- What are the requirements?
- Which workflow(s) does it serve?

**Step 4: Design Implementation**

Check existing components:
[design_list_components]
- Can existing components implement this?
- What new components are needed?

For new components:
- What capability does it implement?
- What props does it need?
- What interaction pattern applies?
- What dependencies does it have?

**Step 5: Integrate into Views**

Check existing views:
[design_list_views]
- Which views need this feature?
- What zones should include it?
- What states are affected?

**Step 6: Validate**

After creating all entities:
- Run design_validate
- Run design_find_gaps
- Run design_coverage_report

Ensure the new feature is:
- Linked to personas (traceable)
- Has measurable success criteria
- Has complete component specifications
```

**Size**: ~280 words
**Expected output**: New entities for the feature

---

## Quality Assurance Prompts

These prompts can be used at any phase to verify quality against the framework.

### Prompt 28: Entity Quality Review

**Purpose**: Review entities against quality framework.

**Context needed**: Entities to review

**Prompt**:

```
Review [ENTITY_TYPE] entities against the quality framework (framework.md).

Retrieve entities:
[design_list_[entity_type]]

For each entity, evaluate against these criteria:

**Personas**:
- [ ] Research-based (has sources)
- [ ] Goal-focused (specific goals)
- [ ] Context-specific (THIS product)
- [ ] Actionable (every detail matters)
- [ ] Memorable (distinct from others)

**Workflows**:
- [ ] User-centered (user perspective)
- [ ] Goal-oriented (clear outcome)
- [ ] Measurable (success_criteria)
- [ ] Persona-linked (serves someone)
- [ ] Validated appropriately

**Capabilities**:
- [ ] Implementation-agnostic (what not how)
- [ ] Workflow-connected (serves need)
- [ ] Clearly scoped (not epic/task)
- [ ] Testable (verifiable requirements)
- [ ] Independent (can implement alone)

**Components**:
- [ ] Capability-linked (implements something)
- [ ] Appropriately scoped (atom/molecule/organism)
- [ ] Props documented (typed interface)
- [ ] Dependencies explicit (no hidden)
- [ ] Interaction specified (states, accessibility)

**Tokens**:
- [ ] Semantic naming (purpose not value)
- [ ] Complete coverage (no hardcoding needed)
- [ ] WCAG compliant (contrast ratios)
- [ ] Responsive where needed

**Views**:
- [ ] Workflow-connected (serves journey)
- [ ] All states covered (empty/loading/error)
- [ ] Responsive specified (breakpoints)
- [ ] Routes defined (navigation)

For each entity, output:
- Current quality level (1/2/3)
- Issues found
- Recommended improvements
- Priority (critical/high/medium/low)
```

**Size**: ~300 words
**Expected output**: Quality audit report

---

### Prompt 29: Accessibility Audit

**Purpose**: Verify accessibility specifications are complete.

**Context needed**: Component and Interaction entities

**Prompt**:

```
Audit accessibility specifications across all components and interactions.

**Step 1: Retrieve Components**
[design_list_components]

**Step 2: For Each Component, Verify**:

Keyboard accessibility:
- [ ] Is it focusable (if interactive)?
- [ ] Can it be activated via keyboard?
- [ ] Are shortcuts documented?
- [ ] Is focus visible?

ARIA specification:
- [ ] Is role defined?
- [ ] Are required attributes specified?
- [ ] Is label strategy defined (aria-label vs visible label)?

Interaction states:
- [ ] Is disabled state specified?
- [ ] Does it have focus state?
- [ ] Is focus-visible (keyboard only) distinct?

Reduced motion:
- [ ] Is alternative specified?
- [ ] Are animations disableable?

**Step 3: Check Interactions**
[design_list_interactions]

For each interaction pattern:
- [ ] Has accessibility.keyboard section?
- [ ] Has accessibility.aria section?
- [ ] Has reduced_motion alternative?

**Step 4: Check Tokens**
[design_list_tokens]

For each token set:
- [ ] Do color combinations meet WCAG AA (4.5:1)?
- [ ] Is focus ring color defined?
- [ ] Are motion durations respectful (not too long)?

**Step 5: Report**

Generate report:
- Components missing accessibility specs
- Interactions missing accessibility specs
- Potential contrast issues
- Recommendations for each

Priority by impact:
- CRITICAL: Missing keyboard access
- HIGH: Missing ARIA roles
- MEDIUM: Missing reduced motion
- LOW: Missing documentation
```

**Size**: ~280 words
**Expected output**: Accessibility audit report

---

## Metaprompting Templates

These prompts generate or improve other prompts, applying the reflexion pattern.

### Prompt 30: Prompt Improvement (Reflexion)

**Purpose**: Improve a prompt based on results.

**Context needed**: Original prompt, output received, issues identified

**Prompt**:

```
Review and improve this prompt based on results.

**Original Prompt**:
[ORIGINAL_PROMPT]

**Output Received**:
[OUTPUT_RECEIVED]

**Issues Identified**:
[ISSUES]

Apply reflexion to improve the prompt:

**1. Analyze Failures**
- What was missing from the output?
- What was incorrect?
- What was the root cause?
  - Unclear instructions?
  - Missing context?
  - Wrong assumptions?
  - Too broad scope?

**2. Identify Improvements**
For each issue:
- What specific change would prevent it?
- Is more context needed?
- Is more structure needed?
- Is scope reduction needed?

**3. Generate Improved Prompt**
Create new version that:
- Addresses all identified issues
- Maintains original intent
- Adds necessary constraints
- Includes success criteria

**4. Predict Potential Issues**
What could still go wrong with the improved prompt?
- Edge cases not covered?
- Ambiguities remaining?
- Context still missing?

**5. Output**
Provide:
- Improved prompt (complete)
- Changelog (what changed and why)
- Validation criteria (how to verify improvement worked)
```

**Size**: ~220 words
**Expected output**: Improved prompt with rationale

---

### Prompt 31: Context-Specific Prompt Generation

**Purpose**: Generate a prompt tailored to specific project needs.

**Context needed**: Project description, phase, goals

**Prompt**:

```
Generate a customized prompt for [PROJECT_NAME] at [PHASE] phase.

**Project Context**:
[PROJECT_DESCRIPTION]

**Current Phase**:
[PHASE_NAME and GOALS]

**Existing Entities**:
[SUMMARY_OF_EXISTING_ENTITIES]

**Specific Need**:
[WHAT_PROMPT_SHOULD_ACCOMPLISH]

Generate a prompt that:

**1. Is Appropriately Scoped**
- Not too broad (would exceed context)
- Not too narrow (would require many prompts)
- Achievable in single interaction

**2. Provides Necessary Context**
- References existing entities by ID
- Includes quality criteria from framework.md
- Specifies output format expected

**3. Uses Effective Techniques**
- Chain-of-thought for reasoning tasks
- Structured output for entity creation
- Self-consistency checks for validation
- Step-by-step for multi-part tasks

**4. Is Self-Contained**
- Includes all needed information
- Doesn't assume knowledge not provided
- Can be executed independently

**5. Output**
Provide:
- Complete prompt ready to use
- Estimated context size (words)
- Expected output type and format
- Potential follow-up prompts if needed
```

**Size**: ~230 words
**Expected output**: Custom prompt for project

---

### Prompt 32: Multi-Agent Verification

**Purpose**: Cross-check work using different perspectives.

**Context needed**: Work to verify, verification criteria

**Prompt**:

```
Verify the following work using multiple analytical perspectives.

**Work to Verify**:
[ENTITY_OR_OUTPUT_TO_VERIFY]

Apply three verification perspectives:

**Perspective 1: User Advocate**
As if you're the persona this serves:
- Does this actually solve my problem?
- Is this how I would want to interact?
- Are my frustrations addressed?
- Would I find this usable?

**Perspective 2: Quality Auditor**
Against framework.md criteria:
- Does this meet quality level 2 standards?
- Are all required fields complete?
- Are all relationships valid?
- Is traceability maintained?

**Perspective 3: Developer**
For implementation:
- Is this implementable as specified?
- Are there ambiguities that would cause questions?
- Are edge cases covered?
- Is the scope clear?

**Synthesis**:
For each perspective:
- Score: Acceptable / Needs Work / Unacceptable
- Key issues (if any)
- Specific recommendations

Overall verdict:
- PASS: All perspectives acceptable
- REVISE: Some perspectives need work (list what)
- FAIL: Fundamental issues (list what)

If REVISE or FAIL, provide:
- Specific changes needed
- Priority order for changes
- Verification criteria for revised version
```

**Size**: ~240 words
**Expected output**: Multi-perspective verification report

---

## References

### AI Prompting Best Practices

- [Chain-of-Thought Prompting - Prompt Engineering Guide](https://www.promptingguide.ai/techniques/cot)
- [Reflexion - Prompt Engineering Guide](https://www.promptingguide.ai/techniques/reflexion)
- [Meta Prompting - Prompt Engineering Guide](https://www.promptingguide.ai/techniques/meta-prompting)
- [Self-Consistency - Prompt Engineering Guide](https://www.promptingguide.ai/techniques/consistency)
- [Effective Context Engineering for AI Agents - Anthropic](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)

### Multi-Agent and Verification

- [Improving Factuality and Reasoning through Multiagent Debate - MIT](https://news.mit.edu/2023/multi-ai-collaboration-helps-reasoning-factual-accuracy-language-models-0918)
- [Multi-Agent Debate Paper - arXiv](https://arxiv.org/abs/2305.14325)

### Agentic AI Development

- [Prompt Engineering for AI Agents - PromptHub](https://www.prompthub.us/blog/prompt-engineering-for-ai-agents)
- [10 Best Practices for Building Reliable AI Agents - UiPath](https://www.uipath.com/blog/ai/agent-builder-best-practices)
- [Complete Prompt Engineering Guide 2025](https://aloaguilar20.medium.com/the-complete-prompt-engineering-guide-for-2025-mastering-cutting-edge-techniques-dfe0591b1d31)

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2025-01-17 | 2.0 | Major update: Added phase deliverables and success criteria to all prompts; Added Handoff, Implementation Planning, Vertical Slice, Iterative Expansion, and Release phases (Prompts 14-25); Renumbered prompts 14-20 to 26-32; Reorganized TOC by design vs implementation phases; Aligned with designloom-process.md v1.2 |
| 2025-01-15 | 1.0 | Initial prompt collection |
