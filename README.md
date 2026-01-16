# designloom

MCP (Model Context Protocol) server for workflow-driven design management. Designloom enables Claude Code to query, create, and analyze design artifacts (workflows, capabilities, personas, components) stored as YAML files in your project repository.

## Features

- **Query Tools**: List and retrieve design entities with filtering support
- **Mutation Tools**: Create, update, delete, and link design entities
- **Analysis Tools**: Validate integrity, generate coverage reports, find gaps, and suggest priorities
- **Test Generation**: Generate vitest or Playwright test scaffolding from workflow success criteria
- **Diagram Export**: Export Mermaid diagrams of entity relationships
- **Git Worktree Support**: Automatically resolves paths to the main repository in worktree setups

## Quick Start

### 1. Install (if publishing to npm)

```bash
npm install designloom
```

### 2. Configure Claude Code

Add to your project's `.mcp.json`:

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

Or for local development within the monorepo:

```json
{
    "mcpServers": {
        "designloom": {
            "command": "node",
            "args": ["./designloom/dist/cli.js"],
            "env": {
                "DESIGNLOOM_DATA_PATH": "./design/designloom"
            }
        }
    }
}
```

### 3. Create Design Directory Structure

```bash
mkdir -p design/designloom/{workflows,capabilities,personas,components}
```

### 4. Start Using with Claude Code

Once configured, Claude Code will have access to designloom tools. Try:

- "List all workflows"
- "Create a new persona for data analysts"
- "Show the design coverage report"
- "Validate my design docs"

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DESIGNLOOM_DATA_PATH` | Path to design documents directory | `./design/designloom` |

## Available Tools

### Query Tools

| Tool | Description |
|------|-------------|
| `design_list_workflows` | List all workflows with optional category filter |
| `design_list_capabilities` | List all capabilities with optional status filter |
| `design_list_personas` | List all personas |
| `design_list_components` | List all components with optional status filter |
| `design_get_workflow` | Get a workflow by ID with resolved relationships |
| `design_get_capability` | Get a capability by ID with resolved relationships |
| `design_get_persona` | Get a persona by ID with resolved relationships |
| `design_get_component` | Get a component by ID with resolved relationships |
| `design_get_dependencies` | Get entities that an entity depends on |
| `design_get_dependents` | Get entities that depend on an entity |

### Mutation Tools

| Tool | Description |
|------|-------------|
| `design_create_workflow` | Create a new workflow |
| `design_create_capability` | Create a new capability |
| `design_create_persona` | Create a new persona |
| `design_create_component` | Create a new component |
| `design_update_workflow` | Update an existing workflow |
| `design_update_capability` | Update an existing capability |
| `design_update_persona` | Update an existing persona |
| `design_update_component` | Update an existing component |
| `design_delete_workflow` | Delete a workflow |
| `design_delete_capability` | Delete a capability (warns about dependents) |
| `design_delete_persona` | Delete a persona |
| `design_delete_component` | Delete a component |
| `design_link` | Link two entities with a relationship |
| `design_unlink` | Remove a link between entities |

### Analysis Tools

| Tool | Description |
|------|-------------|
| `design_validate` | Validate all design documents for integrity |
| `design_coverage_report` | Generate a coverage report showing usage statistics |
| `design_find_orphans` | Find entities not used by any workflow |
| `design_find_gaps` | Find gaps in design coverage |
| `design_suggest_priority` | Get priority suggestions for implementation |
| `design_generate_tests` | Generate test scaffolding from workflow success criteria |
| `design_export_diagram` | Export Mermaid diagram of entity relationships |

## Entity Types

### Workflow

Workflows represent user journeys or tasks. They reference personas, capabilities, and components.

```yaml
id: W01
name: First Load Experience
category: onboarding
validated: true
personas:
  - analyst-alex
requires_capabilities:
  - data-import
  - basic-visualization
suggested_components:
  - welcome-panel
  - data-import-dialog
starting_state:
  data_type: unknown
  node_count: "0"
  user_expertise: novice
goal: Load sample or personal data and see a basic visualization
success_criteria:
  - metric: time_to_first_visualization
    target: "< 30 seconds"
  - metric: user_understands_next_steps
    target: clear call-to-action visible
```

### Capability

Capabilities represent features or functions that the system provides.

```yaml
id: data-import
name: Data Import
category: data
description: Import graph data from various file formats
status: implemented
algorithms: []
used_by_workflows:
  - W01
  - W02
implemented_by_components:
  - data-import-dialog
requirements:
  - Support CSV, JSON, GraphML formats
  - Validate file structure before import
  - Show progress for large files
```

### Persona

Personas represent user archetypes with specific goals and frustrations.

```yaml
id: analyst-alex
name: Analyst Alex
role: Financial Analyst
characteristics:
  expertise: intermediate
  time_pressure: high
  graph_literacy: basic
  domain_knowledge: advanced
goals:
  - Identify anomalies in transaction data
  - Generate reports for compliance team
frustrations:
  - Tools that require programming knowledge
  - Slow response times on large datasets
workflows:
  - W01
  - W07
```

### Component

Components represent UI elements that implement capabilities.

```yaml
id: data-import-dialog
name: Data Import Dialog
category: dialog
description: Modal dialog for importing graph data
status: implemented
implements_capabilities:
  - data-import
used_in_workflows:
  - W01
dependencies:
  - file-picker
props:
  onImport: "(data: GraphData) => void"
  supportedFormats: "string[]"
```

## Usage Examples

### Creating a New Workflow

Ask Claude Code:
> "Create a new workflow W10 for advanced users to analyze graph patterns, requiring the 'pattern-detection' and 'graph-export' capabilities"

### Generating Tests

Ask Claude Code:
> "Generate vitest tests for workflow W10"

### Analyzing Design Coverage

Ask Claude Code:
> "Show me the design coverage report and highlight any orphaned capabilities"

### Exporting Diagrams

Ask Claude Code:
> "Export a Mermaid diagram showing all relationships for workflow W01"

## Development

### Building

```bash
cd designloom
npm run build
```

### Testing

```bash
npm test        # Watch mode
npm run test:run  # Single run
npm run coverage  # With coverage
```

### Linting

```bash
npm run lint
npm run lint:fix
```

## Architecture

```
designloom/
├── src/
│   ├── index.ts           # MCP server entry point
│   ├── cli.ts             # CLI entry for npx execution
│   ├── path-resolver.ts   # Git-aware path resolution
│   ├── schemas/           # Zod schemas for entities
│   ├── store/             # YAML store implementation
│   └── tools/             # MCP tool definitions
├── tests/
│   ├── fixtures/          # Test YAML files
│   ├── integration/       # End-to-end tests
│   ├── schemas/           # Schema tests
│   ├── store/             # Store tests
│   └── server/            # MCP server tests
└── docs/                  # Documentation
```

## License

MIT
