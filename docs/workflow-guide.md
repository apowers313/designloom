# Workflow-Driven Design Guide

This guide explains the workflow-driven design methodology that Designloom enables.

## What is Workflow-Driven Design?

Workflow-driven design is an approach where you start with **user workflows** (tasks users want to accomplish) and work backward to define the capabilities, components, and personas needed to support those workflows.

### Benefits

1. **User-Centered**: Design starts with what users need to accomplish
2. **Traceable**: Every capability links back to user needs
3. **Prioritizable**: Build what unblocks the most workflows first
4. **Measurable**: Success criteria define what "done" looks like
5. **Collaborative**: Clear artifacts for design discussions with Claude Code

## Core Concepts

### Workflows

Workflows are the starting point. They describe user journeys or tasks.

**Key Properties:**
- `id`: Unique identifier (e.g., W01, W02)
- `name`: Human-readable name
- `category`: Classification (onboarding, analysis, exploration, reporting, collaboration, administration)
- `goal`: What the user is trying to accomplish
- `personas`: Who performs this workflow
- `requires_capabilities`: What features are needed
- `suggested_components`: UI elements that might help
- `starting_state`: Initial conditions
- `success_criteria`: How we measure success

### Capabilities

Capabilities are features or functions the system provides. They are implementation-agnostic.

**Key Properties:**
- `id`: Unique identifier in kebab-case
- `name`: Human-readable name
- `category`: Classification (data, visualization, analysis, interaction, export, collaboration, performance)
- `description`: What the capability does
- `status`: Implementation status (planned, in-progress, implemented, deprecated)
- `requirements`: Detailed requirements

### Personas

Personas represent user archetypes with specific goals, expertise levels, and frustrations.

**Key Properties:**
- `id`: Unique identifier in kebab-case
- `name`: Human-readable name
- `role`: User's role or job title
- `characteristics`: Expertise level, time pressure, domain knowledge
- `goals`: What the user wants to achieve
- `frustrations`: Pain points to avoid

### Components

Components are UI elements that implement capabilities.

**Key Properties:**
- `id`: Unique identifier in kebab-case
- `name`: Human-readable name
- `category`: Classification (dialog, control, display, layout, utility, navigation)
- `description`: What the component does
- `implements_capabilities`: Capabilities this component provides
- `status`: Implementation status

## The Workflow-Driven Design Process

### Step 1: Define Personas

Start by identifying who will use your system:

```
Ask Claude Code:
> "Create a persona for data scientists who need to analyze large graphs"
```

### Step 2: Create Workflows

Define what users need to accomplish:

```
Ask Claude Code:
> "Create a workflow for loading and visualizing a graph for the first time"
```

### Step 3: Identify Required Capabilities

For each workflow, identify what capabilities are needed:

```
Ask Claude Code:
> "What capabilities does workflow W01 need? Create them as planned status."
```

### Step 4: Design Components

Define UI elements that implement capabilities:

```
Ask Claude Code:
> "Create a component that implements the data-import capability"
```

### Step 5: Validate and Analyze

Use analysis tools to ensure design integrity:

```
Ask Claude Code:
> "Validate my design docs and show any issues"
> "Show the coverage report"
> "What should I build next?"
```

### Step 6: Generate Tests

Create test scaffolding from success criteria:

```
Ask Claude Code:
> "Generate vitest tests for workflow W01"
```

## Relationship Model

```
                    ┌─────────────┐
                    │   Persona   │
                    └──────┬──────┘
                           │ used by
                           ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Component  │◄────│  Workflow   │────►│ Capability  │
└─────────────┘     └─────────────┘     └─────────────┘
       │                                       │
       │           implements                  │
       └───────────────────────────────────────┘
```

- **Workflows** reference **Personas** (who does this?)
- **Workflows** require **Capabilities** (what features are needed?)
- **Workflows** suggest **Components** (what UI helps?)
- **Components** implement **Capabilities** (how are features delivered?)

## Priority Suggestions

Designloom can suggest what to build next based on:

1. **Impact**: Capabilities that unblock the most workflows
2. **Dependencies**: Capabilities required by other planned work
3. **Status**: Focus on moving from planned to implemented

```
Ask Claude Code:
> "What capability should I implement next?"
```

## Coverage Reports

Track design completeness with coverage reports:

- **Capability coverage**: How many workflows use each capability
- **Persona coverage**: How many workflows each persona has
- **Component coverage**: How many capabilities each component implements
- **Workflow readiness**: Are all required capabilities implemented?

```
Ask Claude Code:
> "Show the design coverage report"
```

## Finding Gaps

Identify missing pieces in your design:

- **Workflows without capabilities**: Need feature definition
- **Workflows without personas**: Need user identification
- **Capabilities without components**: Need implementation planning
- **Orphaned entities**: Not connected to any workflow

```
Ask Claude Code:
> "Find gaps in my design"
> "Find orphaned capabilities"
```

## Best Practices

### 1. Start with Workflows

Don't start by listing features. Start with user goals:

❌ "We need a graph layout algorithm"
✅ "Users need to visualize large graphs without overlap"

### 2. Keep Capabilities Implementation-Agnostic

Capabilities describe *what*, not *how*:

❌ "Use D3.js to render nodes"
✅ "Display nodes with customizable visual properties"

### 3. Define Clear Success Criteria

Make success measurable:

❌ "Users should be happy"
✅ "Time to first visualization < 30 seconds"

### 4. Link Everything Back

Every capability should trace back to a workflow:

```
Ask Claude Code:
> "Find capabilities not used by any workflow"
```

### 5. Review Regularly

Use validation and analysis tools regularly:

```
Ask Claude Code:
> "Validate design docs and show coverage report"
```

## Example: Complete Workflow Definition

```yaml
id: W07
name: Anomaly Detection
category: analysis
validated: true
personas:
  - analyst-alex
  - security-sam
requires_capabilities:
  - graph-visualization
  - node-filtering
  - anomaly-detection
  - alert-notifications
suggested_components:
  - graph-viewer
  - filter-panel
  - alert-toast
  - anomaly-highlighter
starting_state:
  data_type: network-traffic
  node_count: "50000"
  edge_density: high
  user_expertise: expert
goal: Identify and investigate anomalous patterns in network traffic
success_criteria:
  - metric: time_to_identify
    target: "< 2 minutes"
  - metric: false_positive_rate
    target: "< 5%"
  - metric: drill_down_capability
    target: can inspect any node within 3 clicks
```

This workflow:
- Targets specific personas (analysts and security professionals)
- Lists required features without specifying implementation
- Defines clear, measurable success criteria
- Documents the expected starting conditions
