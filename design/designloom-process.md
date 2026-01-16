# Designloom Process Guide

A comprehensive guide for using Designloom throughout the full lifecycle of UI/UX projects, from initial discovery through ongoing maintenance.

---

## Table of Contents

1. [Overview](#overview)
2. [How Designloom Maps to UX Design Processes](#how-designloom-maps-to-ux-design-processes)
3. [Gap Analysis: What's Missing](#gap-analysis-whats-missing)
4. [New Project Workflow](#new-project-workflow)
5. [Change Management for Existing Projects](#change-management-for-existing-projects)
6. [Entity Creation Order](#entity-creation-order)
7. [Data Gathering Requirements](#data-gathering-requirements)
8. [Quality Assurance Checkpoints](#quality-assurance-checkpoints)
9. [References](#references)

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
| **Evaluate against requirements** | Validate workflows, run `design_coverage_report`, run `design_validate` |

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

**Quality Checkpoint**: Each persona should answer:
- Who is this user? (role, context)
- What do they want to accomplish? (goals)
- What gets in their way? (frustrations)
- Can you cite research? (sources)

### Phase 2: Define (Weeks 2-3)

**Goal**: Synthesize research into actionable problem statements.

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
   design_validate          # Check for errors
   design_find_orphans      # Find disconnected entities
   ```

**Quality Checkpoint**: Each workflow should answer:
- Which persona does this? (linked personas)
- What are they trying to accomplish? (goal)
- How do we know if they succeeded? (success_criteria)
- What's the starting context? (starting_state)

### Phase 3: Ideate (Weeks 3-4)

**Goal**: Explore solutions that serve the defined workflows.

**Designloom Activities**:

1. **Create Capabilities** for each workflow requirement
   - Keep implementation-agnostic (what, not how)
   - Link to workflows via `used_by_workflows`
   - Add specific `requirements`
   - Set `status: planned`

2. **Run Analysis**:
   ```
   design_find_gaps         # Find workflows missing capabilities
   design_coverage_report   # Check overall coverage
   ```

**Quality Checkpoint**: Each capability should answer:
- What does it do? (description, requirements)
- Which workflows need it? (used_by_workflows)
- Can you verify it works? (testable requirements)
- Is scope appropriate? (not epic-sized, not task-sized)

### Phase 4: Design Foundation (Weeks 4-5)

**Goal**: Establish visual design language.

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

**Quality Checkpoint**: Tokens should:
- Use semantic naming (purpose, not appearance)
- Cover all UI needs (no hardcoded values needed)
- Meet WCAG contrast requirements
- Support responsive behavior

### Phase 5: Component Design (Weeks 5-7)

**Goal**: Create UI building blocks that implement capabilities.

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
   design_find_gaps         # Find capabilities without components
   design_coverage_report   # Check implementation coverage
   ```

**Quality Checkpoint**: Each component should:
- Implement at least one capability
- Have documented props
- Have explicit dependencies
- Have interaction specification (states, transitions, accessibility)

### Phase 6: View Assembly (Weeks 7-8)

**Goal**: Assemble components into complete screens.

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

**Quality Checkpoint**: Each view should:
- Link to at least one workflow
- Handle all states (empty, loading, error)
- Have responsive behavior specified
- Define routing information

### Phase 7: Validation (Weeks 8-9)

**Goal**: Test designs against user needs.

**Designloom Activities**:

1. **Conduct usability testing** on views
2. **Update entities** based on findings:
   - Refine workflow `success_criteria`
   - Update component interactions
   - Fix identified issues

3. **Set `validated: true`** on workflows that pass testing

4. **Run Final Analysis**:
   ```
   design_validate          # No errors
   design_find_orphans      # No orphans
   design_coverage_report   # >80% coverage
   ```

### Phase 8: Handoff (Week 9+)

**Goal**: Prepare for development implementation.

**Designloom Activities**:

1. **Export documentation**:
   ```
   design_export_diagram    # Generate visual diagrams
   design_generate_tests    # Generate test specifications
   ```

2. **Review all entities** for completeness:
   - All components have props documented
   - All interactions have accessibility requirements
   - All views have routing defined
   - All tokens are semantic and complete

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
design_get_capability --id <capability-id>  # See _resolved.workflows, _resolved.components
design_get_component --id <component-id>    # See _resolved.workflows, _resolved.capabilities
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
| Validation | Every change | `design_validate` |
| Orphan check | Weekly | `design_find_orphans` |
| Gap analysis | Sprint planning | `design_find_gaps` |
| Coverage report | Monthly | `design_coverage_report` |

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

- [ ] `design_validate` returns no errors
- [ ] `design_find_orphans` returns empty (no disconnected entities)
- [ ] `design_coverage_report` shows >80% coverage
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

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2025-01-15 | 1.0 | Initial process guide |
