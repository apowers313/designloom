# Proposed Prompts for Designloom AI Workflow

This document provides prompts optimized for agentic AI development using Designloom. These prompts are designed to be used with Claude Code or similar AI assistants that have access to Designloom's MCP tools.

---

## Table of Contents

1. [Prompt Engineering Principles](#prompt-engineering-principles)
2. [Discovery Phase Prompts](#discovery-phase-prompts)
3. [Define Phase Prompts](#define-phase-prompts)
4. [Ideate Phase Prompts](#ideate-phase-prompts)
5. [Design Phase Prompts](#design-phase-prompts)
6. [Validation Phase Prompts](#validation-phase-prompts)
7. [Change Management Prompts](#change-management-prompts)
8. [Quality Assurance Prompts](#quality-assurance-prompts)
9. [Metaprompting Templates](#metaprompting-templates)
10. [References](#references)

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

After creating sources, provide a summary of the most significant findings
that should influence persona and workflow creation.
```

**Size**: ~150 words + materials list
**Expected output**: Multiple Source entities, research summary

---

### Prompt 2: Source-Backed Persona Creation

**Purpose**: Create research-backed personas from source materials.

**Context needed**: Source entities already created

**Prompt**:

```
Based on the research sources already in Designloom, create personas for [PROJECT_NAME].

First, list the sources and summarize the key user insights from each:
[Use design_list_sources to retrieve]

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

Quality criteria (from framework.md):
- Research-based: Can cite sources for claims
- Goal-focused: Goals are specific and actionable
- Context-specific: Reflects THIS product's usage
- Actionable: Every detail could influence design
- Memorable: Has a name and role that stick

Create [N] personas that represent distinct user segments.
```

**Size**: ~220 words
**Expected output**: N Persona entities with source links

---

### Prompt 3: Proto-Persona for Early Alignment

**Purpose**: Create assumption-based personas when research is limited.

**Context needed**: Team assumptions, known user characteristics

**Prompt**:

```
We need to create proto-personas for [PROJECT_NAME] based on current team assumptions.
These are Level 1 personas (per framework.md) that will be validated with research.

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

Create [N] proto-personas covering main user segments.
```

**Size**: ~200 words
**Expected output**: N Proto-Persona entities

---

## Define Phase Prompts

### Prompt 4: Workflow Creation from Personas

**Purpose**: Define user workflows based on persona goals.

**Context needed**: Persona entities

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
6. **Success Criteria**: 2-3 SMART metrics (Specific, Measurable, Achievable, Relevant, Time-bound)
   - Example: { metric: "time_to_completion", target: "< 60 seconds" }
7. **Starting State**: Context when workflow begins
   - data_type, user_expertise, etc.
8. **Validated**: Set to false (not yet tested)

Think step-by-step:
1. What is the persona trying to accomplish? (goal)
2. How do we know they succeeded? (success_criteria)
3. What's true when they start? (starting_state)
4. Is this workflow different from others? (distinct value)

Quality check: Each workflow should be testable - you could run a usability test
that measures the success criteria.
```

**Size**: ~280 words
**Expected output**: Multiple Workflow entities

---

### Prompt 5: Success Criteria Definition

**Purpose**: Define measurable success criteria for existing workflows.

**Context needed**: Workflow entities needing success criteria

**Prompt**:

```
Review the workflows in Designloom and ensure each has measurable success criteria.

Retrieve workflows:
[Use design_list_workflows to retrieve]

For each workflow without complete success_criteria, define metrics using the SMART framework:

- **Specific**: What exactly is measured?
- **Measurable**: What is the numeric target?
- **Achievable**: Is this realistic based on research/benchmarks?
- **Relevant**: Does this matter to the user?
- **Time-bound**: What's the context (per session, daily, etc.)?

Common UX metrics to consider:
- Task completion rate (% of users who complete)
- Time on task (seconds/minutes to complete)
- Error rate (errors per task)
- Help requests (% who access help)
- Satisfaction score (post-task rating)
- Abandonment rate (% who start but don't finish)

For each workflow, provide:
1. Current goal statement
2. Proposed success_criteria (2-3 metrics)
3. Rationale for each metric (why this matters)
4. How to measure (usability test, analytics, survey)

Update workflows using design_update_workflow for each.
```

**Size**: ~200 words
**Expected output**: Updated Workflow entities with success criteria

---

## Ideate Phase Prompts

### Prompt 6: Capability Generation from Workflows

**Purpose**: Generate capabilities needed to support workflows.

**Context needed**: Workflow entities

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
- requirements: 3-5 testable requirements
- used_by_workflows: Link to workflows that need it
- status: "planned"

Group related capabilities to avoid overlap. If two capabilities always go together,
consider merging them.
```

**Size**: ~260 words
**Expected output**: Multiple Capability entities

---

### Prompt 7: Capability Requirements Refinement

**Purpose**: Add detailed, testable requirements to capabilities.

**Context needed**: Capability entities with basic descriptions

**Prompt**:

```
Review capabilities in Designloom and ensure each has specific, testable requirements.

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
1. List current description and requirements
2. Identify missing scenarios (happy path, errors, edge cases)
3. Propose specific, testable requirements
4. Note any assumptions that need validation

Update using design_update_capability for each.
```

**Size**: ~200 words
**Expected output**: Updated Capability entities with refined requirements

---

## Design Phase Prompts

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
- scale: 1-12 at minimum (4px base recommended)
- semantic: component_padding_md, gap_md, page_margin

**4. Additional (recommended)**
- radii: sm, md, lg, full
- shadows: sm, md, lg for elevation
- motion: durations (fast, normal, slow), easings
- breakpoints: sm, md, lg, xl
- z_index: dropdown, modal, popover, tooltip

Quality requirements:
- Semantic naming (purpose, not value): "text-primary" not "gray-900"
- WCAG AA contrast: All text/background combos ≥ 4.5:1
- Responsive values: Use breakpoint objects where appropriate
- Token references: Use {token.path} syntax for aliases

Create the token set using design_create_tokens.
```

**Size**: ~280 words
**Expected output**: Tokens entity (default-theme)

---

### Prompt 9: Interaction Pattern Creation

**Purpose**: Create reusable interaction patterns for common components.

**Context needed**: Component types to support, accessibility requirements

**Prompt**:

```
Create reusable interaction patterns for common component types in [PROJECT_NAME].

Required patterns to create:
- button-interaction: For clickable buttons
- input-interaction: For text inputs
- toggle-interaction: For checkboxes, switches
- [ADDITIONAL_PATTERNS_NEEDED]

For each interaction pattern, define:

**1. States** (based on Material Design 3):
- default: Normal state (0% overlay)
- hover: Mouse over (8% overlay, cursor: pointer)
- focus: Keyboard focus (12% overlay, focus ring)
- active: Being pressed (12% overlay, slight scale)
- disabled: Not interactive (38% opacity, cursor: not-allowed)
- [loading, selected, etc. as needed]

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
```

**Size**: ~250 words
**Expected output**: Multiple InteractionPattern entities

---

### Prompt 10: Component Design from Capabilities

**Purpose**: Design components that implement capabilities.

**Context needed**: Capability entities, Token entities, Interaction patterns

**Prompt**:

```
Design components that implement the capabilities in Designloom.

First, analyze what components are needed:
1. Retrieve capabilities: [design_list_capabilities]
2. For each capability, identify UI components needed
3. Group related UI elements into components (atomic design hierarchy)

For each component, define:

**Required fields**:
- id: kebab-case (e.g., "file-upload-dialog")
- name: Human-readable name
- category: atom/molecule/organism (or dialog/control/display/etc.)
- description: What it is and does
- implements_capabilities: Link to capabilities it implements

**Recommended fields**:
- props: Component interface with types
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
- dependencies: Other components this uses
- interaction_pattern: Reference reusable pattern OR
- interactions: Inline interaction definition
- accessibility: role, label_required, keyboard_support
- status: planned

**Quality checklist**:
- [ ] Implements at least one capability
- [ ] Has documented props with types
- [ ] Has interaction specification
- [ ] Has accessibility requirements
- [ ] Dependencies are explicit
- [ ] Appropriate scope (not too big/small)

Create components working from atoms → molecules → organisms.
Start with the most-referenced components first.
```

**Size**: ~280 words
**Expected output**: Multiple Component entities

---

### Prompt 11: View Assembly

**Purpose**: Assemble components into complete screen views.

**Context needed**: Components, Workflows

**Prompt**:

```
Create views that assemble components into complete screens for [PROJECT_NAME].

First, identify screens needed:
1. List workflows: [design_list_workflows]
2. For each workflow, identify screens involved in the journey
3. Group related screens (same layout, different content = states, not views)

For each view, define:

**1. Basic Info**:
- id: V01, V02, etc.
- name: Descriptive screen name
- description: Purpose of this view
- workflows: Link to workflows this serves

**2. Layout**:
- type: single-column/sidebar-left/dashboard/etc.
- zones: Named regions for component placement
  - For each zone: id, position, components, width, visibility by breakpoint

**3. States** (required):
- default: Normal operation
- empty: No data (include CTA)
- loading: Fetching data (skeleton components)
- error: Operation failed (error message + retry)

**4. Routing** (recommended):
- path: URL pattern ("/dashboard/:id")
- params: URL parameters with types
- title: Browser tab title
- requires_auth: If authentication needed

**5. Data Requirements** (recommended):
- What APIs/data needed
- Which state to show during loading/error

**Layout patterns to use**:
- Dashboard: header + sidebar + main content
- Settings: sidebar-left with navigation
- Detail: sidebar-right with metadata
- Forms: single-column, centered

Create using design_create_view for each.
```

**Size**: ~280 words
**Expected output**: Multiple View entities

---

## Validation Phase Prompts

### Prompt 12: Pre-Development Validation

**Purpose**: Validate design is complete before development.

**Context needed**: All entities created

**Prompt**:

```
Perform comprehensive validation of the Designloom design before development begins.

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
Expected: All workflows have capabilities, all capabilities have components
If gaps: List missing entities to create

**4. Coverage Report**
Run: design_coverage_report
Expected: >80% coverage
If below: Identify lowest-coverage areas

**5. Quality Spot-Check**
For each entity type, sample 2-3 entities and verify:

Personas:
- [ ] Has sources linked
- [ ] Goals are specific
- [ ] Frustrations are real (from research)

Workflows:
- [ ] Has success_criteria
- [ ] Linked to personas
- [ ] Has starting_state

Capabilities:
- [ ] Has testable requirements
- [ ] Linked to workflows
- [ ] Implementation-agnostic

Components:
- [ ] Implements capability
- [ ] Has props documented
- [ ] Has interaction specification

Views:
- [ ] Has all states (empty, loading, error)
- [ ] Responsive behavior specified
- [ ] Linked to workflows

**6. Summary Report**
Provide:
- Overall readiness score (%)
- Critical issues (must fix)
- Recommended improvements (should fix)
- Nice-to-haves (could fix)
```

**Size**: ~300 words
**Expected output**: Validation report with action items

---

### Prompt 13: Post-Test Entity Updates

**Purpose**: Update entities based on usability test findings.

**Context needed**: Usability test results, existing entities

**Prompt**:

```
Update Designloom entities based on usability testing results.

Test findings:
[USABILITY_TEST_RESULTS]

For each finding, determine impact:

**1. Workflow Updates**
- Did users complete the workflow? → Update success_criteria actuals
- Did the goal make sense? → Refine goal statement
- Were there unexpected starting states? → Expand starting_state
- Did users succeed? → Set validated: true / false

**2. Capability Updates**
- Were requirements met? → Update status to implemented
- Were requirements unclear? → Refine requirements
- Were capabilities missing? → Create new capabilities

**3. Component Updates**
- Were interactions confusing? → Update interaction specification
- Were props incorrect? → Update props
- Were components missing? → Create new components

**4. View Updates**
- Were layouts effective? → Confirm or revise
- Were states handled well? → Update state content
- Were errors clear? → Update error state

**5. New Insights**
- Any new personas discovered?
- Any new workflows observed?
- Any new frustrations identified?

For each update:
1. Cite the specific test finding
2. Explain the change rationale
3. Execute the update using appropriate design_update_* tool
4. Verify the update using design_get_*

Create new Source entries for test reports and link to updated entities.
```

**Size**: ~250 words
**Expected output**: Updated entities, new Source entities

---

## Change Management Prompts

### Prompt 14: Impact Analysis for Changes

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

### Prompt 15: New Feature Addition

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

### Prompt 16: Entity Quality Review

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

### Prompt 17: Accessibility Audit

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

### Prompt 18: Prompt Improvement (Reflexion)

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

### Prompt 19: Context-Specific Prompt Generation

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

### Prompt 20: Multi-Agent Verification

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
| 2025-01-15 | 1.0 | Initial prompt collection |
