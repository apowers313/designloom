# Designloom Process Guide

A comprehensive guide for using Designloom throughout the full lifecycle of UI/UX projects, from initial discovery through ongoing maintenance.

---

## Table of Contents

1. [Overview](#overview)
2. [How Designloom Maps to UX Design Processes](#how-designloom-maps-to-ux-design-processes)
3. [Gap Analysis: What's Missing](#gap-analysis-whats-missing)
4. [New Project Workflow](#new-project-workflow)
5. [Implementation Anti-Patterns to Avoid](#implementation-anti-patterns-to-avoid)
6. [Summary: Design-to-Implementation Lifecycle](#summary-design-to-implementation-lifecycle)
7. [Change Management for Existing Projects](#change-management-for-existing-projects)
8. [Entity Creation Order](#entity-creation-order)
9. [Data Gathering Requirements](#data-gathering-requirements)
10. [Quality Assurance Checkpoints](#quality-assurance-checkpoints)
11. [References](#references)

---

## Overview

Designloom is an MCP-based design management system with 8 entity types that map to established UX design processes:

| Entity | Purpose | Maps to UX Phase |
|--------|---------|------------------|
| **Source** | Research citations and traceability | All phases |
| **Persona** | User archetypes | Empathize/Discover |
| **Workflow** | User journeys and goals | Define |
| **Capability** | What the system can do | Ideate |
| **Tokens** | Visual design language | Design/Prototype |
| **Component** | UI building blocks | Design/Prototype |
| **Interaction** | Behavior patterns | Design/Prototype |
| **View** | Screen layouts | Design/Prototype |

### The Traceability Principle

Every design decision should trace back to user needs:

```
SOURCE (research evidence)
  → PERSONA (who has the need?)
    → WORKFLOW (what are they trying to accomplish?)
      → CAPABILITY (what feature supports this?)
        → COMPONENT (how is it built?)
          → INTERACTION (how does it behave?)
            → TOKENS (how does it look?)
              → VIEW (where is it placed?)
```

---

## How Designloom Maps to UX Design Processes

### Double Diamond Model (British Design Council)

The Double Diamond process has four phases: Discover, Define, Develop, Deliver. Here's how Designloom maps:

| Diamond | Phase | Thinking | Designloom Entities | Activities |
|---------|-------|----------|---------------------|------------|
| **1st Diamond** | **Discover** | Divergent | Sources, Personas | User interviews, market research, competitive analysis |
| | **Define** | Convergent | Workflows | Synthesize insights into user needs, define problem space |
| **2nd Diamond** | **Develop** | Divergent | Capabilities, Components | Ideate solutions, explore approaches |
| | **Deliver** | Convergent | Tokens, Interactions, Views | Finalize design, build, test |

**Key insight**: The first diamond (Discover/Define) focuses on *understanding the problem*. Designloom captures this through Personas and Workflows. The second diamond (Develop/Deliver) focuses on *solving the problem*. Designloom captures this through Capabilities, Components, Tokens, Interactions, and Views.

### Design Thinking (Stanford d.school)

The five stages of design thinking map to Designloom as follows:

| Stage | Description | Designloom Entities | Designloom Activities |
|-------|-------------|---------------------|----------------------|
| **Empathize** | Research users' needs | Sources, Personas | Create research-backed personas with goals, frustrations, context |
| **Define** | State users' needs and problems | Workflows | Define workflows with measurable success criteria |
| **Ideate** | Challenge assumptions, create ideas | Capabilities | Brainstorm capabilities that serve workflows; don't specify implementation |
| **Prototype** | Create solutions | Components, Tokens, Interactions | Design components, define visual tokens, specify interactions |
| **Test** | Try solutions | Views, Workflows | Validate views against workflows; update `validated` flag |

### ISO 9241-210 (Human-Centered Design)

The ISO standard for human-centered design has four activities:

| ISO Activity | Designloom Mapping |
|--------------|-------------------|
| **Understand context of use** | Personas (context, devices, frequency), Workflows (starting_state) |
| **Specify user requirements** | Workflows (goal, success_criteria), Capabilities (requirements) |
| **Produce design solutions** | Components, Tokens, Interactions, Views |
| **Evaluate against requirements** | Validate workflows, run `design_analyze --report coverage`, run `design_validate --check all` |

### Lean UX (Build-Measure-Learn)

Designloom supports Lean UX methodology through iterative refinement:

| Lean UX Phase | Designloom Approach |
|---------------|---------------------|
| **Think (Hypothesis)** | Create Workflow with unvalidated assumptions (`validated: false`) |
| **Make (MVP)** | Define minimal Capabilities, basic Components |
| **Check (Validate)** | Test, gather feedback, update entities, set `validated: true` |

### Atomic Design (Brad Frost)

Designloom's Component entity supports the atomic design hierarchy:

| Atomic Level | Designloom `category` |
|--------------|----------------------|
| Atoms | `atom` |
| Molecules | `molecule` |
| Organisms | `organism` |
| Templates | Views (layout structure) |
| Pages | Views (with states) |

**Important**: Atomic Design is *not linear*. Don't create all atoms, then all molecules, etc. Work on templates/pages and atomic components simultaneously, extracting patterns as they emerge.

---

## Gap Analysis: What's Missing

After mapping Designloom to established UX processes, the following gaps were identified:

### Currently Not Captured by Designloom

| Gap | Description | Impact | Recommendation |
|-----|-------------|--------|----------------|
| **User Research Raw Data** | Interview transcripts, survey responses, observation notes | Personas lack evidence depth | Use Sources with detailed summaries; consider external research repository |
| **Journey Maps** | End-to-end user journey with touchpoints, emotions, pain points | Workflows capture *what*, not *how it feels* | Extend Workflow schema to include emotional journey |
| **Information Architecture** | Sitemaps, navigation structure, content hierarchy | Views don't capture full IA | Create dedicated Sitemap entity or extend Views |
| **Content/Copy** | Microcopy, error messages, labels, help text | Components lack content specifications | Consider Content entity for UI copy |
| **Usability Test Results** | Task success rates, time-on-task, error rates, qualitative findings | Validation lacks evidence | Use Sources to link test reports; extend Workflow with test results |
| **Stakeholder Requirements** | Business requirements, constraints, priorities | Capabilities focus on user needs | Add `business_requirements` field or new entity |
| **Accessibility Audit Results** | WCAG compliance evidence, audit findings | Interactions specify requirements, not evidence | Use Sources to link audit reports |
| **Version History** | Design decision evolution over time | No built-in versioning | Rely on git history; consider changelog fields |

### Partially Captured

| Area | Current Support | Enhancement Opportunity |
|------|-----------------|------------------------|
| **Competitive Analysis** | Sources can link competitors | Add `competitor_analysis` entity with structured comparison |
| **Design Rationale** | Sources explain *where* info came from | Add `rationale` field to explain *why* decisions were made |
| **Priority/Roadmap** | Capability `status` field | Add `priority` and `target_release` fields |
| **A/B Test Variants** | Not captured | Add `variants` to Components or Views |

### Recommended Extensions (Future Work)

1. **Content Entity** - For microcopy, labels, error messages
2. **Sitemap Entity** - For information architecture
3. **Research Entity** - For raw user research (interviews, surveys)
4. **Variant Entity** - For A/B testing and design alternatives

---

## New Project Workflow

### Phase 1: Discovery (Weeks 1-2)

**Goal**: Understand users and their needs through research.

**Deliverables**:

| Type | Deliverable | Description |
|------|-------------|-------------|
| **Primary** | Source entities | Research citations for all materials gathered |
| **Primary** | Proto-Personas | Initial user archetypes based on team assumptions + early research |
| **Secondary** | Research synthesis | Summary of key findings across sources |
| **Secondary** | Competitive analysis | Summary of competitor approaches (as Source entities) |

**Designloom Activities**:

1. **Create Sources** for all research materials
   - User interview recordings/transcripts
   - Survey results
   - Analytics reports
   - Competitive analysis
   - Market research

2. **Create Personas** (Level 1: Proto-Personas initially)
   - Start with team assumptions
   - Include `sources` linking to research
   - Focus on `goals` and `frustrations`
   - Mark as proto-personas (note in description)

**Success Criteria**:

- [ ] ≥3 Source entities created (minimum viable research base)
- [ ] ≥2 Proto-Personas created covering distinct user segments
- [ ] Each Persona cites ≥1 Source
- [ ] Each Persona documents: role, goals, frustrations, context
- [ ] `design_validate --check all` returns no errors

### Phase 2: Define (Weeks 2-3)

**Goal**: Synthesize research into actionable problem statements.

**Deliverables**:

| Type | Deliverable | Description |
|------|-------------|-------------|
| **Primary** | Level 2 Personas | Research-validated personas with real quotes and specific goals |
| **Primary** | Workflows | User journeys with measurable success criteria |
| **Secondary** | Problem statements | Synthesized user needs (captured in Workflow goals) |
| **Secondary** | Journey insights | Key moments documented in Workflow starting_state |

**Designloom Activities**:

1. **Upgrade Personas** to Level 2 (Qualitative) after validation
   - Update with research insights
   - Add real quotes from interviews
   - Ensure goals are specific and actionable

2. **Create Workflows** for each key user journey
   - Link to relevant personas
   - Define measurable `success_criteria`
   - Document `starting_state`
   - Keep `validated: false` until tested

3. **Run Analysis**:
   ```
   design_validate --check all          # Check for errors
   design_validate --check orphans      # Find disconnected entities
   ```

**Success Criteria**:

- [ ] All Proto-Personas upgraded to Level 2 (research-backed)
- [ ] ≥1 Workflow per Persona (key journeys captured)
- [ ] Each Workflow has ≥2 measurable success criteria with targets
- [ ] Each Workflow linked to ≥1 Persona
- [ ] Each Workflow has documented `starting_state`
- [ ] `design_validate --check all` returns no errors
- [ ] `design_validate --check orphans` returns no orphan Personas

### Phase 3: Ideate (Weeks 3-4)

**Goal**: Explore solutions that serve the defined workflows.

**Deliverables**:

| Type | Deliverable | Description |
|------|-------------|-------------|
| **Primary** | Capabilities | Implementation-agnostic feature definitions |
| **Secondary** | Priority notes | Initial capability prioritization (in `priority` field) |
| **Secondary** | Feasibility flags | Technical concerns noted in capability requirements |

**Designloom Activities**:

1. **Create Capabilities** for each workflow requirement
   - Keep implementation-agnostic (what, not how)
   - Link to workflows via `used_by_workflows`
   - Add specific `requirements`
   - Set `status: planned`

2. **Run Analysis**:
   ```
   design_validate --check gaps         # Find workflows missing capabilities
   design_analyze --report coverage   # Check overall coverage
   ```

**Success Criteria**:

- [ ] Every Workflow has ≥1 required Capability
- [ ] Each Capability linked to ≥1 Workflow via `used_by_workflows`
- [ ] Each Capability has ≥3 testable requirements
- [ ] `design_validate --check orphans` returns no orphan Capabilities
- [ ] `design_validate --check gaps` returns acceptable gaps only (exceptions documented)
- [ ] `design_validate --check all` returns no errors

### Phase 4: Design Foundation (Weeks 4-5)

**Goal**: Establish visual design language.

**Deliverables**:

| Type | Deliverable | Description |
|------|-------------|-------------|
| **Primary** | Tokens | Design system foundation (colors, typography, spacing) |
| **Primary** | Base Interaction Patterns | Common states and transitions |
| **Secondary** | Design rationale | Token value decisions documented in Sources |
| **Secondary** | Accessibility verification | WCAG contrast validation |

**Designloom Activities**:

1. **Create Tokens** for design system foundation
   - Start with `colors.neutral` (required)
   - Add `colors.primary` for brand
   - Define `typography` scale
   - Establish `spacing` system
   - Add `radii`, `shadows`, `motion` as needed

2. **Create base Interaction patterns**
   - Define common states (default, hover, focus, disabled)
   - Establish transition timings
   - Document accessibility requirements

**Success Criteria**:

- [ ] `colors.neutral` scale defined (required)
- [ ] `colors.primary` scale defined (brand color)
- [ ] `typography.sizes.base` defined
- [ ] `typography.fonts.sans` or primary font defined
- [ ] `spacing.scale` defined with ≥8 values
- [ ] Base interaction states documented: default, hover, focus, disabled
- [ ] WCAG 2.1 AA contrast ratios verified (4.5:1 for text, 3:1 for UI)
- [ ] `motion.durations` defined for animation consistency
- [ ] `design_validate --check all` returns no errors

### Phase 5: Component Design (Weeks 5-7)

**Goal**: Create UI building blocks that implement capabilities.

**Deliverables**:

| Type | Deliverable | Description |
|------|-------------|-------------|
| **Primary** | Components | UI building blocks with props, interactions, accessibility |
| **Secondary** | Component hierarchy | Atomic design categorization (atom/molecule/organism) |
| **Secondary** | Dependency map | Component dependency relationships |

**Designloom Activities**:

1. **Create Components** starting with most-used
   - Link to capabilities via `implements_capabilities`
   - Document `props` interface
   - List `dependencies`
   - Assign appropriate `category` (atom/molecule/organism)

2. **Assign Interactions** to components
   - Either embed `interactions` directly
   - Or reference reusable `interaction_pattern`

3. **Run Analysis**:
   ```
   design_validate --check gaps         # Find capabilities without components
   design_analyze --report coverage   # Check implementation coverage
   ```

**Success Criteria**:

- [ ] All P0/P1 Capabilities have ≥1 implementing Component
- [ ] Each Component has documented `props` with types/descriptions
- [ ] Each Component has explicit `dependencies` (or empty array)
- [ ] Each Component has interaction specification (embedded or `interaction_pattern` reference)
- [ ] Each Component has `category` assigned (atom/molecule/organism)
- [ ] `design_validate --check gaps` shows no P0/P1 capabilities without components
- [ ] `design_validate --check all` returns no errors

### Phase 6: View Assembly (Weeks 7-8)

**Goal**: Assemble components into complete screens.

**Deliverables**:

| Type | Deliverable | Description |
|------|-------------|-------------|
| **Primary** | Views | Complete screen layouts with zones and components |
| **Secondary** | Navigation documentation | Route structure and parameters |
| **Secondary** | Data requirements map | API/data dependencies per view |

**Designloom Activities**:

1. **Create Views** for each screen
   - Select appropriate `layout.type`
   - Define `zones` with component placement
   - Create `states` (empty, loading, error, default)
   - Define `routes` for navigation
   - Link to `workflows`

2. **Document `data_requirements`** for each view
   - What APIs/data sources are needed
   - Which states handle loading/errors

**Success Criteria**:

- [ ] All P0/P1 Workflows have ≥1 associated View
- [ ] Each View has `layout.type` and `layout.zones` defined
- [ ] Each View handles all states: empty, loading, error, default
- [ ] Each View has `routes` defined (if user-navigable)
- [ ] Each View has `data_requirements` documented
- [ ] All Components referenced in View zones exist in Designloom
- [ ] `design_validate --check all` returns no errors

### Phase 7: Validation (Weeks 8-9)

**Goal**: Test designs against user needs before implementation.

**Why validate before coding?** Fixing issues during design costs far less than during implementation. Testing prototypes early can save 40-50% of rework time.

**Deliverables**:

| Type | Deliverable | Description |
|------|-------------|-------------|
| **Primary** | Validated Workflows | Workflows marked `validated: true` after user testing |
| **Primary** | Test findings | User test results documented as Source entities |
| **Secondary** | Prototype assets | Wireframes/prototypes used for testing |
| **Secondary** | Iteration notes | Design changes made based on feedback |

**Activities**:

1. **Create and Test Prototypes**
   - Generate wireframes/prototypes from View definitions
   - Test with 5-8 representative users per Persona
   - Walk through key Workflows end-to-end
   - Measure against `success_criteria`

2. **Update Entities Based on Findings**
   - Refine View layouts if navigation confused users
   - Update Component interactions if behavior was unclear
   - Adjust Workflow success criteria if targets were unrealistic

3. **Document Test Results**
   - Create Source entities for test findings
   - Link to affected Workflows, Views, Components

4. **Set `validated: true`** on workflows that pass testing

**Success Criteria**:

- [ ] All P0 Workflows tested with ≥5 representative users
- [ ] Test findings documented as Source entities linked to Workflows
- [ ] Major usability issues identified and resolved in designs
- [ ] P0 Workflows marked `validated: true`
- [ ] Updated entities reflect test-driven refinements
- [ ] `design_analyze --report coverage` shows ≥80% capability coverage for P0 workflows
- [ ] `design_validate --check all` returns no errors

**Designloom Integration**:
```
# Document test results
design_create --entity_type source --id prototype-test-w01 --title "Prototype Test - First Data Import" --url "path/to/findings" --summary "8/10 users completed in target time"

# Mark workflow as validated
design_update --entity_type workflow --id W01 --validated true

# Run validation checks
design_validate --check all
design_validate --check orphans
design_analyze --report coverage   # Target: >80% coverage
```

### Phase 8: Handoff (Week 9+)

**Goal**: Prepare validated designs for development implementation.

**Deliverables**:

| Primary | Secondary |
|---------|-----------|
| Development-ready documentation package | Visual diagram exports |
| Interaction specifications with all states | Test specifications |
| Component API documentation | Accessibility checklist per component |
| Edge case documentation (empty, loading, error states) | |

**Development-Ready Checklist**:

| Category | What to Check | Designloom Source |
|----------|---------------|-------------------|
| **Visual specs** | Colors, typography, spacing | `tokens` |
| **Component API** | Props documented with types | `component.props` |
| **Interactions** | States and transitions specified | `interaction.states` |
| **Accessibility** | Keyboard, ARIA, reduced motion | `interaction.accessibility` |
| **Edge cases** | Empty, loading, error states | `view.states` |

**Activities**:

1. **Review all entities** for completeness
2. **Export documentation**:
   ```
   design_export --format diagram    # Generate visual diagrams
   design_export --format tests    # Generate test specifications
   ```
3. **Final validation**:
   ```
   design_validate --check all          # No errors
   design_validate --check orphans      # No orphans
   ```

**Success Criteria**:
- [ ] `design_validate --check all` returns no errors
- [ ] `design_validate --check orphans` returns empty
- [ ] All key workflows have `validated: true`
- [ ] All components have `props` documented with types
- [ ] All views have all `states` defined (default, loading, error, empty)
- [ ] Interaction specifications include all state transitions
- [ ] Accessibility requirements documented for each component
- [ ] Documentation package reviewed by at least one developer

### Phase 9: Implementation Planning (Week 10-11)

**Goal**: Determine implementation order based on Designloom data and prepare for development.

**Deliverables**:

| Primary | Secondary |
|---------|-----------|
| Prioritized workflow list (P0/P1/P2) | Priority factors documentation |
| Prioritized capability list with dependency mapping | Complexity assessments |
| Golden path workflow identification | Technical spike results |
| Implementation order document | Risk assessment for high-complexity items |

**Key Principles**:
- Not all features are equally important—prioritize ruthlessly
- Use Designloom's relationship data to inform priority decisions
- Identify technical risks and plan spikes before committing

**Activities**:

1. **Establish Implementation Priority**

   Use Designloom data to determine what to build first:

   **Workflow Priority Factors**:
   | Factor | How to Assess | Designloom Data |
   |--------|---------------|-----------------|
   | User frequency | How often is this performed? | Persona `frequency` field |
   | Criticality | Is this core to the product? | Workflow `category` (onboarding = high) |
   | Persona coverage | How many personas need this? | Workflow `personas[]` count |
   | Dependency | Do other workflows depend on it? | Cross-reference `requires_capabilities` |

   **Capability Priority Factors**:
   | Factor | How to Assess | Designloom Data |
   |--------|---------------|-----------------|
   | Workflow coverage | How many workflows need it? | `used_by_workflows[]` count |
   | Foundation | Is this a dependency for others? | Cross-reference component `dependencies` |
   | Complexity | Is this technically risky? | Capability `requirements` complexity |

   **Component Priority Factors**:
   | Factor | How to Assess | Designloom Data |
   |--------|---------------|-----------------|
   | Reusability | Used by many views? | Count views containing component |
   | Dependency chain | Are other components waiting? | `dependencies[]` reverse lookup |
   | Atomic level | Build atoms before molecules | `category` field |

2. **Identify the Golden Path**
   - Select the highest-priority validated workflow (P0)
   - This becomes your first vertical slice
   - Trace all required capabilities and components
   - This workflow should already be `validated: true` from Phase 7 testing

3. **Technical Spikes for Risky Areas** (time-boxed 1-3 days each)
   - Identify capabilities with complex or uncertain requirements
   - Prototype technical approaches before committing to implementation
   - Spike outputs: decision, proof-of-concept, or "don't build this"
   - Update Designloom entities with learnings

**Success Criteria**:
- [ ] All workflows have assigned priority (P0/P1/P2) with documented rationale
- [ ] All capabilities have assigned priority
- [ ] P0 workflows already validated (from Phase 7)
- [ ] Golden path workflow identified and documented
- [ ] Technical spikes completed for high-complexity capabilities
- [ ] Implementation order documented and agreed upon by team
- [ ] Dependency mapping shows no circular dependencies
- [ ] Risk assessment completed for P0 items

**Designloom Integration**:
```
# Find highest-impact capabilities (used by most workflows)
design_list --entity_type capability
# Sort by length of used_by_workflows[]

# Find foundational components (most dependencies on them)
design_list --entity_type component
# Look for components frequently appearing in others' dependencies[]

# Identify golden path workflow (validated, highest priority)
design_list --entity_type workflow --filter '{"validated": true}'

# Add priority to workflows
design_update --entity_type workflow --id W01 --notes "P0 - Golden path, implement first"

# Add priority to capabilities
design_update --entity_type capability --id data-import --notes "P0 - Required by 3 workflows"

# Document technical spike results
design_create --entity_type source --id spike-file-parsing --title "Technical Spike - Large File Parsing" --url "path/to/spike-results" --summary "Validated streaming approach handles 100MB files in <5s"
```

### Phase 10: Vertical Slice Implementation (Weeks 11-15)

**Goal**: Implement features as complete vertical slices to reduce risk and enable early validation.

**Deliverables**:

| Primary | Secondary |
|---------|-----------|
| Golden path workflow implemented end-to-end | Updated Designloom entities with implementation learnings |
| All P0 components built and functional | Component unit tests |
| All P0 views rendered with correct layout | Integration tests for P0 workflows |
| P0 capabilities functional | Design deviation documentation |

**Key Principles**:
- Implement features end-to-end (UI → API → data) rather than layer-by-layer
- Start with the P0 "golden path" workflow identified in Phase 9
- Each slice is deployable and testable independently
- Use Designloom as the source of truth for what to build

**What is a Vertical Slice?**

Instead of building all UI components, then all APIs, then all data layers (horizontal), build one complete feature at a time (vertical):

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

**Activities**:

1. **Implement P0 Workflow End-to-End** (Golden Path)
   - Use Workflow definition to understand the complete journey
   - Build all components listed in the View's zones
   - Implement capabilities linked to the workflow
   - Implement all view states (empty, loading, error, default)

2. **Use Designloom as Implementation Spec**

   | What to Build | Designloom Source |
   |---------------|-------------------|
   | Component interface | `component.props` |
   | Component behavior | `component.interactions` or `interaction_pattern` |
   | Visual styling | `tokens` (colors, typography, spacing) |
   | Page layout | `view.layout` and `view.zones` |
   | User flow | `workflow.goal` and `success_criteria` |
   | Feature requirements | `capability.requirements` |
   | Accessibility | `interaction.accessibility` |

3. **Validate Against Design During Implementation**
   - Compare implementation to View definitions
   - Check component behavior matches Interaction specifications
   - Verify token usage (no hardcoded values)
   - Test workflow completion against success criteria

4. **Update Designloom Based on Learnings**
   - If implementation reveals design issues, update the entity
   - If new components emerge, add them to Designloom
   - Document deviations and rationale

**Success Criteria** (per slice):
- [ ] Workflow completable end-to-end by target persona
- [ ] All success criteria from Workflow definition are met and measurable
- [ ] Implementation matches View layout specification
- [ ] Component props match Designloom definitions
- [ ] Accessibility requirements from Interactions are met
- [ ] All view states implemented (default, loading, error, empty)
- [ ] No hardcoded values—all styling via tokens
- [ ] Designloom entities updated with any implementation-driven changes

**Designloom Integration**:
```
# Get implementation spec for a workflow
design_get --entity_type workflow --id W01
# Returns: goal, success_criteria, required capabilities, suggested components

# Get component implementation details
design_get --entity_type component --id file-upload-dialog
# Returns: props, dependencies, interaction pattern, accessibility requirements

# Get view layout for implementation
design_get --entity_type view --id V01
# Returns: layout type, zones with components, states, routing

# Mark workflow as implemented
design_update --entity_type workflow --id W01 --notes "Implemented 2025-01-16, validated: pending"

# Track overall progress
design_analyze --report coverage
```

### Phase 11: Validation and Documentation (Throughout Implementation)

**Goal**: Continuously validate implementation matches design and generate documentation from Designloom.

**Deliverables**:

| Primary | Secondary |
|---------|-----------|
| Validation test results per workflow | User acceptance test reports |
| Updated Designloom entities reflecting implementation | Implementation deviation log |
| Component API documentation (generated) | Style guide exports |
| User flow diagrams (exported) | Accessibility compliance checklist |

**Key Principles**:
- Validation is continuous, not a phase at the end
- Designloom entities ARE your documentation—keep them updated
- Test against Workflow success criteria, not just visual appearance

**Validation Against Designloom**:

| What to Validate | Designloom Source | How to Validate |
|------------------|-------------------|-----------------|
| Component interface | `component.props` | Props match type definitions |
| Visual styling | `tokens` | No hardcoded colors/spacing/typography |
| Interaction states | `interaction.states` | All states implemented and visually correct |
| Accessibility | `interaction.accessibility` | Keyboard nav, ARIA, screen reader tested |
| Page layout | `view.layout.zones` | Components in correct positions |
| User flow | `workflow.success_criteria` | Actual metrics meet targets |

**Activities**:

1. **Validate Implementation Against Design Specs**
   - Compare implemented component props to Designloom `props` definitions
   - Verify View layouts match `zones` configuration
   - Test Interaction states match specification
   - Measure Workflow completion against `success_criteria`

2. **User Acceptance Testing**
   - Test workflows with real users from target Personas
   - Measure against success criteria (time, completion rate, errors)
   - Compare to prototype test results from Phase 9
   - Update Workflow `validated` status based on results

3. **Keep Designloom Updated**
   - When implementation deviates from design, update the entity
   - Add implementation notes to components
   - Document rationale for changes

**Documentation from Designloom**:

Designloom entities serve as living documentation:

| Documentation Need | Designloom Source | Export/Usage |
|--------------------|-------------------|--------------|
| **Component API docs** | `component.props` | Generate TypeScript interfaces, Storybook docs |
| **Style guide** | `tokens` | Export to CSS custom properties, design tool sync |
| **User flows** | `workflows` | Generate user journey diagrams |
| **Architecture diagrams** | Entity relationships | `design_export --format diagram` |
| **Test specifications** | `capability.requirements`, `workflow.success_criteria` | `design_export --format tests` |
| **Accessibility requirements** | `interaction.accessibility` | Compliance checklist |
| **Feature specifications** | `capabilities` | PRD/requirements documents |

**Success Criteria**:
- [ ] All P0/P1 workflows pass user acceptance testing
- [ ] Workflow `validated` flags updated based on test results
- [ ] Workflow success criteria metrics achieved (time, completion rate, error rate)
- [ ] Designloom entities reflect implemented reality (no drift)
- [ ] Documentation exports are current and accurate
- [ ] Accessibility requirements validated with target users
- [ ] Implementation deviations documented with rationale

**Designloom Integration**:
```
# After user testing, update validated status
design_update --entity_type workflow --id W01 --validated true

# Document test findings as sources
design_create --entity_type source --id uat-results-w01 --title "UAT Results - First Data Import" --url "path/to/results" --summary "8/10 users completed in <60s, 2 had navigation issues at step 3"

# Export documentation
design_export --format diagram --type workflow    # User flow diagrams
design_export --format diagram --type component   # Component relationship diagrams
design_export --format tests --workflow W01     # Test specs from success criteria

# Generate component documentation
design_get --entity_type component --id file-upload-dialog
# Use props output for TypeScript interface generation
```

### Phase 12: Iterative Expansion (Weeks 15+)

**Goal**: Systematically expand implementation following the priority order from Phase 9.

**Deliverables**:

| Primary | Secondary |
|---------|-----------|
| All P1 workflows implemented and validated | Updated coverage report |
| Reusable component patterns extracted | New component definitions in Designloom |
| Updated Designloom reflecting all changes | User feedback integration log |
| Implementation progress tracking | Pattern extraction documentation |

**Key Principles**:
- Follow P0 → P1 → P2 priority order established in Phase 9
- Reuse components across workflows—extract patterns as they emerge
- Update Designloom as the source of truth evolves
- Each workflow is a vertical slice with its own validation

**Activities**:

1. **Implement by Priority Order**

   Follow the priority established in Phase 9:
   ```
   P0 Workflows (Critical)     → Implemented in Phase 10
   P1 Workflows (Important)    → Implement next
   P2 Workflows (Nice-to-have) → Implement if time permits
   ```

   For each workflow:
   - Review Designloom definition for requirements
   - Identify which components can be reused from P0
   - Build new components as needed
   - Validate against success criteria

2. **Track Progress with Designloom**

   Use Designloom to track implementation status:

   ```
   # See what's left to implement
   design_analyze --report coverage

   # Find workflows by priority
   design_list --entity_type workflow
   # Filter by notes containing "P1" or "P2"

   # Check capability implementation status
   design_list --entity_type capability --filter '{"status": "planned"}'
   ```

3. **Extract Reusable Patterns**
   - When similar code appears 3+ times, extract to component
   - Add new component to Designloom
   - Update Views to reference the new component
   - Keep Designloom as single source of truth

4. **Feedback Integration**
   - Collect user feedback on implemented workflows
   - Update Designloom entities based on learnings
   - Discover new workflows from production usage
   - Refine success criteria based on real data

**Success Criteria**:
- [ ] All P0 and P1 workflows implemented and validated
- [ ] Coverage report shows target coverage achieved (>80%)
- [ ] All implemented workflows have `validated: true`
- [ ] `design_validate --check orphans` returns empty
- [ ] New patterns extracted (3+ similar implementations → component)
- [ ] User feedback reviewed and integrated
- [ ] Designloom entities current with implementation state

**Designloom Integration**:
```
# Track implementation progress
design_analyze --report coverage

# Update workflow status as implemented
design_update --entity_type workflow --id W02 --notes "P1 - Implemented 2025-01-20"

# Add newly discovered component
design_create --entity_type component --id data-preview-card --name "Data Preview Card" --description "Extracted pattern - used in 4 views" --category molecule --implements_capabilities '["data-preview"]'

# Update views to use new component
design_update --entity_type view --id V03 --layout '{...updated zones...}'

# Check for orphans after changes
design_validate --check orphans
```

### Phase 13: Release and Living Documentation (Weeks 18+)

**Goal**: Complete release and establish Designloom as living documentation.

**Deliverables**:

| Primary | Secondary |
|---------|-----------|
| Synchronized Designloom (matches implementation) | Implementation retrospective document |
| Generated documentation package | Maintenance schedule |
| Final validation reports (no errors, no orphans) | Lessons learned as Source entity |
| 100% P0/P1 coverage | Process improvement recommendations |

**Key Principles**:
- Designloom is the single source of truth—keep it synchronized with implementation
- Documentation is generated from Designloom, not written separately
- Implementation learnings feed back into the design for future iterations

**Activities**:

1. **Synchronize Designloom with Implementation**
   - Audit all entities against implemented code
   - Update any entities that drifted during implementation
   - Add rationale for intentional deviations
   - Remove deprecated entities no longer in use

2. **Generate Final Documentation**

   Use Designloom exports for documentation:

   | Documentation | Designloom Command | Output |
   |---------------|-------------------|--------|
   | System architecture | `design_export --format diagram` | Entity relationship diagrams |
   | User flows | `design_export --format diagram --type workflow` | Workflow journey diagrams |
   | Test specifications | `design_export --format tests` | Test cases from requirements |
   | Component catalog | `design_list --entity_type component` | Component inventory with props |
   | Design tokens | `design_list --entity_type tokens` | Style guide source |
   | Accessibility spec | `design_list --entity_type interaction` | A11y requirements per component |

3. **Retrospective and Process Improvement**
   - What design decisions changed during implementation?
   - What was missing from design specifications?
   - What Designloom fields would have helped?
   - Document lessons learned as a Source entity

4. **Establish Ongoing Maintenance**
   - Schedule regular audits (`design_validate`, `design_validate --check orphans`)
   - Update Designloom when implementation changes
   - Use Designloom for change impact analysis
   - Keep documentation exports in sync

**Success Criteria**:
- [ ] `design_validate --check all` returns no errors
- [ ] `design_validate --check orphans` returns empty
- [ ] `design_analyze --report coverage` shows 100% for P0/P1 workflows
- [ ] All workflows have `validated: true`
- [ ] Designloom entities match implemented code (no drift)
- [ ] Documentation exports generated and published
- [ ] Retrospective completed and lessons learned documented
- [ ] Maintenance schedule established and communicated
- [ ] Stakeholder sign-off on release readiness

**Designloom Integration**:
```
# Final validation
design_validate --check all
design_validate --check orphans
design_analyze --report coverage

# Generate all documentation
design_export --format diagram --type all          # Architecture diagrams
design_export --format tests --all               # Test specifications

# Document lessons learned
design_create --entity_type source --id implementation-retro-v1 --title "Implementation Retrospective - v1.0" --url "path/to/retro-doc" --summary "Key learnings: Components needed more detailed props specs, workflow success criteria were accurate"

# List all entities for documentation export
design_list --entity_type component --format detailed  # For component catalog
design_list --entity_type tokens                        # For style guide
design_list --entity_type workflow                     # For user documentation
```

---

## Implementation Anti-Patterns to Avoid

| Anti-Pattern | Problem | Better Approach |
|--------------|---------|-----------------|
| **Skipping Prototype Testing** | Costly rework—fixing post-dev is 100x more expensive | Test at lo-fi, mid-fi, hi-fi before coding |
| **Big Bang Release** | All-or-nothing deployment is high risk | Vertical slices with feature flags |
| **Layer-by-Layer** | No testable value until all layers done | Vertical slices enable early testing |
| **Design Freeze** | Reality reveals design issues | Update Designloom based on learnings |
| **No Prioritization** | Building low-value features first | Use Designloom data to prioritize P0/P1/P2 |
| **Siloed Handoff** | Designers and devs work separately | Continuous collaboration throughout |
| **Incomplete Specs** | Missing edge cases, states, accessibility | Use development-ready checklist (Phase 8) |
| **Skipping Spikes** | Discover problems late in implementation | Time-boxed spikes for uncertain areas |

---

## Summary: Design-to-Implementation Lifecycle

```
DESIGN PHASES (Weeks 1-9)                    IMPLEMENTATION PHASES (Weeks 9+)
┌─────────────────────────────────────┐     ┌─────────────────────────────────────┐
│ 1. Discovery     → Sources, Personas │     │ 9.  Planning      → Prioritization   │
│ 2. Define        → Workflows         │     │ 10. Golden Path   → First Workflow   │
│ 3. Ideate        → Capabilities      │     │ 11. Validation    → Continuous QA    │
│ 4. Foundation    → Tokens, Patterns  │     │ 12. Expansion     → P1, P2 Workflows │
│ 5. Components    → Components        │     │ 13. Release       → Documentation    │
│ 6. Views         → Views             │     └─────────────────────────────────────┘
│ 7. Validation    → Prototype Testing │
│ 8. Handoff       → Dev-Ready Gate    │              ↑ Feedback Loop ↓
└─────────────────────────────────────┘     ┌─────────────────────────────────────┐
                                            │ Update Designloom based on learnings │
                                            └─────────────────────────────────────┘
```

**Key Concepts**:
- **Golden Path** (Phase 10): Implement the highest-priority workflow (P0) end-to-end first
- **Vertical Slices**: Each workflow is implemented completely (UI → Logic → Data) before moving to the next
- **Iterative Expansion** (Phase 12): Follow P0 → P1 → P2 priority order, reusing components across workflows

---

## Change Management for Existing Projects

### Types of Changes

Changes to existing projects fall into these categories:

| Change Type | Trigger | Impact | Process |
|-------------|---------|--------|---------|
| **New User Need** | Discovery of new persona or workflow | May require new capabilities, components | Follow Discovery → Define → Ideate → Build |
| **New Feature** | Business requirement | Add capabilities to existing workflows | Follow Ideate → Build → Validate |
| **Design Refinement** | Usability testing, analytics | Update components, interactions | Update → Validate |
| **Bug Fix** | User feedback, testing | Fix specific component/interaction | Fix → Regression Test |
| **Visual Update** | Rebranding, design refresh | Update tokens, cascade to components | Update Tokens → Review Components |

### Change Process Workflow

#### 1. Impact Assessment

Before making changes, assess impact:

```
# Check what depends on the entity you're changing
design_get --entity_type capability --id <capability-id>  # See _resolved.workflows, _resolved.components
design_get --entity_type component --id <component-id>    # See _resolved.workflows, _resolved.capabilities
```

#### 2. Incremental vs. Big-Bang Changes

**Prefer incremental changes**:
- Less disruption to existing users
- Easier to test and validate
- Lower risk of regression
- Better for continuous delivery

**Guidelines from Bloomberg UX**:
1. **Communicate early**: Document planned changes in entity descriptions
2. **Provide transition period**: Keep old and new versions during migration
3. **Allow rollback**: Don't remove old entities until new ones are validated
4. **Don't force**: Let users opt-in when possible

#### 3. Adding New Information

| New Information | Process |
|-----------------|---------|
| **New Persona** | 1. Create persona with sources → 2. Link to existing workflows if applicable → 3. Create new workflows if needed → 4. Follow capability/component process for new workflows |
| **New Workflow** | 1. Create workflow linked to personas → 2. Identify required capabilities (new or existing) → 3. Create/update components → 4. Create/update views → 5. Validate |
| **New Capability** | 1. Create capability linked to workflows → 2. Design components → 3. Update views to include components → 4. Validate |
| **New Component** | 1. Create component implementing capabilities → 2. Define interaction → 3. Add to relevant views → 4. Test |
| **Token Update** | 1. Update token values → 2. Review all components using those tokens → 3. Test for visual regressions → 4. Validate accessibility (contrast) |

#### 4. Cascading Updates

When updating entities, changes may cascade:

```
Persona updated → Review linked Workflows → Review linked Capabilities → Review Components
Workflow updated → Review linked Capabilities → Review Components → Review Views
Capability updated → Review implementing Components → Review Views using Components
Token updated → Review all Components (visual regression) → Review all Views
Component updated → Review dependent Components → Review Views
Interaction updated → Review Components using pattern
```

#### 5. Deprecation Process

When deprecating entities:

1. **Mark as deprecated**: Set `status: deprecated` (for Capabilities, Components)
2. **Document replacement**: Note what replaces it in description
3. **Update dependents**: Migrate all references to replacement
4. **Grace period**: Keep deprecated entity for one release cycle
5. **Remove**: Delete after all references migrated

### Continuous Design Operations

For ongoing projects, establish these practices:

#### Regular Audits

| Audit | Frequency | Command |
|-------|-----------|---------|
| Validation | Every change | `design_validate --check all` |
| Orphan check | Weekly | `design_validate --check orphans` |
| Gap analysis | Sprint planning | `design_validate --check gaps` |
| Coverage report | Monthly | `design_analyze --report coverage` |

#### Living Documentation

- **Update Sources** when new research is conducted
- **Update Personas** quarterly with new insights
- **Review Workflows** when analytics show behavior changes
- **Update Tokens** when brand guidelines change

---

## Entity Creation Order

### Recommended Order for New Projects

```
1. Sources (research materials)
2. Personas (who are users)
3. Workflows (what do they need)
4. Capabilities (what features support needs)
5. Tokens (visual language foundation)
6. Interaction patterns (behavior foundation)
7. Components (UI building blocks)
8. Views (assembled screens)
```

### Rationale

This order follows the principle of **define before design**:

1. **Sources first** - Establish evidence base before making claims
2. **Personas second** - Understand users before defining their journeys
3. **Workflows third** - Define needs before solutions
4. **Capabilities fourth** - Solution requirements before implementation
5. **Tokens fifth** - Visual foundation before components (enables consistency)
6. **Interactions sixth** - Behavior patterns before components (enables reuse)
7. **Components seventh** - Build blocks that implement capabilities
8. **Views eighth** - Assemble components into complete screens

### Parallel Work Patterns

While the order above is recommended, teams can parallelize:

```
Stream 1: Sources → Personas → Workflows → Capabilities
Stream 2: (after initial tokens) Tokens → Interactions → Components
Stream 3: (after initial components) Views
```

---

## Data Gathering Requirements

### For High-Quality Personas

| Data Needed | Sources | Quality Impact |
|-------------|---------|----------------|
| User interviews (5-15) | Interview transcripts | Goals, frustrations, behaviors |
| Survey data | Survey results | Quantitative validation |
| Analytics | Product analytics | Actual behavior patterns |
| Support tickets | CRM/support system | Pain points, common issues |
| Competitive users | User interviews | Alternatives, expectations |

**Minimum viable**: 5 user interviews with transcripts

### For High-Quality Workflows

| Data Needed | Sources | Quality Impact |
|-------------|---------|----------------|
| User journey maps | Research synthesis | Complete journey coverage |
| Task analysis | Observation, interviews | Step-by-step understanding |
| Analytics funnels | Product analytics | Actual task completion rates |
| Success metrics | Business requirements | Measurable targets |
| Edge cases | Support tickets, testing | Starting state variations |

**Minimum viable**: Documented goal, 2-3 success criteria with targets

### For High-Quality Capabilities

| Data Needed | Sources | Quality Impact |
|-------------|---------|----------------|
| Requirements | Stakeholder interviews | Clear scope |
| Constraints | Technical assessment | Feasible requirements |
| Acceptance criteria | QA, Product | Testable requirements |
| Dependencies | Architecture review | Integration points |

**Minimum viable**: Description of what (not how), 3+ testable requirements

### For High-Quality Tokens

| Data Needed | Sources | Quality Impact |
|-------------|---------|----------------|
| Brand guidelines | Brand team | Color palette, typography |
| Accessibility requirements | WCAG 2.1 | Contrast ratios |
| Platform constraints | Technical assessment | Supported CSS, responsive needs |
| Existing design systems | Design team | Migration considerations |

**Minimum viable**: Neutral color scale, primary color, base typography, spacing scale

### For High-Quality Components

| Data Needed | Sources | Quality Impact |
|-------------|---------|----------------|
| Design specifications | Figma/design files | Visual accuracy |
| Interaction requirements | Design team, research | Behavior specification |
| Accessibility requirements | WCAG 2.1 | ARIA, keyboard support |
| Reusability patterns | Codebase analysis | Dependency management |

**Minimum viable**: Description, linked capability, basic props

### For High-Quality Views

| Data Needed | Sources | Quality Impact |
|-------------|---------|----------------|
| Wireframes | Design team | Layout structure |
| Content requirements | Content team | Zone content |
| Responsive specs | Design team | Breakpoint behavior |
| State variations | Design team | Empty, loading, error states |
| Routing | Information architecture | URL patterns, parameters |

**Minimum viable**: Layout type, zones with components, linked workflow

---

## Quality Assurance Checkpoints

### Pre-Development Checklist

Run these before starting development:

- [ ] `design_validate --check all` returns no errors
- [ ] `design_validate --check orphans` returns empty (no disconnected entities)
- [ ] `design_analyze --report coverage` shows >80% coverage
- [ ] All workflows have `validated: true` or documented validation plan
- [ ] All capabilities have testable requirements
- [ ] All components have props documented
- [ ] All tokens meet WCAG contrast requirements
- [ ] All interactions have accessibility specifications

### Per-Entity Checklists

See [design/framework.md](./framework.md) for detailed quality criteria per entity type.

---

## References

### UX Design Process Frameworks

- [Design Thinking 101 - Nielsen Norman Group](https://www.nngroup.com/articles/design-thinking/)
- [The Double Diamond Process - Maze](https://maze.co/blog/double-diamond-design-process/)
- [ISO 9241-210:2019 - Human-Centred Design](https://www.iso.org/standard/77520.html)
- [Lean UX Process - UserTesting](https://www.usertesting.com/blog/lean-ux-process)
- [Atomic Design Methodology - Brad Frost](https://atomicdesign.bradfrost.com/chapter-2/)

### UX Deliverables and Artifacts

- [UX Deliverables - IxDF](https://www.interaction-design.org/literature/topics/ux-deliverables)
- [Common UX Deliverables - NN/G](https://www.nngroup.com/articles/common-ux-deliverables/)
- [UX Artifacts - UXPin](https://www.uxpin.com/studio/documentation/ux-artifacts/)

### Change Management

- [UX and Change Management - Bloomberg](https://www.bloomberg.com/ux/2019/10/18/ux-and-change-management-bloombergs-4-guidelines-for-rolling-out-ui-product-updates/)
- [Iteration in UX Design - UX4sight](https://ux4sight.com/blog/iterative-development-in-ux-design-process)

### Design Systems

- [The Atomic Workflow - Brad Frost](https://atomicdesign.bradfrost.com/chapter-4/)
- [Design Tokens Format - W3C DTCG](https://tr.designtokens.org/format/)
- [Material Design 3 - State Layers](https://m3.material.io/foundations/interaction/states/state-layers)

### Design-to-Development Handoff

- [10 Ways to Improve Design-to-Development Handoff - UXPin](https://www.uxpin.com/studio/blog/10-ways-to-improve-design-to-development-handoff/)
- [Complete Design Handoff Process Guide 2025 - UI Deploy](https://ui-deploy.com/blog/complete-design-handoff-process-guide-designer-developer-collaboration-best-practices-2025)
- [The Designer's Handbook for Developer Handoff - Figma](https://www.figma.com/blog/the-designers-handbook-for-developer-handoff/)
- [Guide to Developer Handoff in Figma](https://www.figma.com/best-practices/guide-to-developer-handoff/)

### Design System Implementation

- [How to Build a Design System - Figma](https://www.figma.com/blog/design-systems-102-how-to-build-your-design-system/)
- [Design Systems 101 - Nielsen Norman Group](https://www.nngroup.com/articles/design-systems-101/)
- [Component-Based Design Implementation Guide - UXPin](https://www.uxpin.com/studio/blog/component-based-design-complete-implementation-guide/)
- [Design System Driven Development - CMSWire](https://www.cmswire.com/digital-experience/why-dsdd-is-the-future-of-scalable-digital-experience/)

### Vertical Slice Architecture

- [What is a Vertical Slice? - monday.com](https://monday.com/blog/rnd/vertical-slice/)
- [Vertical Slice Architecture - Jimmy Bogard](https://www.jimmybogard.com/vertical-slice-architecture/)
- [Vertical Slice Architecture - DevIQ](https://deviq.com/architecture/vertical-slice-architecture/)
- [Fix Fragile Software with Vertical Slice Architecture - Trailhead](https://trailheadtechnology.com/fix-fragile-software-with-vertical-slice-architecture/)

### Visual Regression Testing

- [Visual Regression Testing in Design Systems - Sparkbox](https://sparkbox.com/foundry/design_system_visual_regression_testing)
- [Automated Visual Regression Testing Guide - Medium](https://medium.com/@david-auerbach/automated-visual-regression-testing-from-implementation-to-tools-dcb3c75ce76d)
- [Visual Regression Testing Guide - LambdaTest](https://www.lambdatest.com/learning-hub/visual-regression-testing)

### Feature Flags and Progressive Delivery

- [Feature Flags 101 - LaunchDarkly](https://launchdarkly.com/blog/what-are-feature-flags/)
- [Moving to Progressive Delivery with Feature Flags - Flagsmith](https://www.flagsmith.com/blog/progressive-delivery)
- [Feature Flags & Progressive Rollouts Guide - PM Toolkit](https://pmtoolkit.ai/learn/experimentation/feature-flags-guide)
- [Feature Flags for Safe Production Deployment - Harness](https://www.harness.io/harness-devops-academy/feature-flags-in-production-safe-releases)

### Wireframes and Prototype Testing

- [Wireframe Testing: Find Usability Issues Early - Maze](https://maze.co/blog/wireframe-testing/)
- [Prototype Testing: Step-by-Step Guide - Maze](https://maze.co/guides/prototype-testing/)
- [User Testing Prototypes and Wireframes - Justinmind](https://www.justinmind.com/blog/user-testing-prototypes-wireframes/)
- [UX Prototypes: Low vs High Fidelity - Nielsen Norman Group](https://www.nngroup.com/articles/ux-prototype-hi-lo-fidelity/)
- [Why Test Prototypes Before Coding - UserTesting](https://www.usertesting.com/blog/why-you-should-user-test-your-prototype-before-coding-anything)
- [High-Fidelity Prototyping - Figma](https://www.figma.com/resource-library/high-fidelity-prototyping/)

### Design Handoff Checklists

- [Design Handoff Checklist - 47 Points - UXPin](https://www.uxpin.com/studio/blog/design-handoff-checklist/)
- [Essential UI/UX Handoff Checklist - CVA Plugin](https://medium.com/cva-design/the-essential-ui-ux-handoff-checklist-ensure-your-designs-are-client-approved-and-developer-ready-f544c748069d)
- [Design Handoff Guide - UX Studio](https://www.uxstudioteam.com/ux-blog/design-handoff)
- [What Developers Need from Designers - UXPin](https://www.uxpin.com/studio/blog/what-developers-need-from-designers-during-design-handoff/)

### Technical Spikes and Risk Reduction

- [Spikes - Scaled Agile Framework](https://framework.scaledagile.com/spikes)
- [What is a Spike in Agile? - Agilemania](https://agilemania.com/what-is-a-spike-in-agile)
- [Technical Spike: What it is, How it Works - Learning Loop](https://learningloop.io/plays/technical-spike)
- [Using Spikes to Manage Risks in Scrum - Deep Project Manager](https://deeprojectmanager.com/spikes-in-scrum/)

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2025-01-16 | 1.2 | Rebalanced Phase 6-8 for proportionality; added prioritization framework; emphasized Golden Path and Iterative Expansion concepts; added development-ready checklist and documentation from Designloom |
| 2025-01-16 | 1.1 | Added implementation phases (9-13), anti-patterns, lifecycle summary, and implementation references |
| 2025-01-15 | 1.0 | Initial process guide |
