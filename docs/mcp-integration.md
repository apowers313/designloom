# Claude Code MCP Integration Guide

This guide explains how Designloom integrates with Claude Code through the Model Context Protocol (MCP).

## What is MCP?

The Model Context Protocol (MCP) allows Claude Code to interact with external tools and services. Designloom runs as an MCP server, providing design management tools that Claude Code can invoke.

## How It Works

```
┌─────────────────┐     JSON-RPC      ┌─────────────────┐
│   Claude Code   │◄─────────────────►│   Designloom    │
│                 │                   │   MCP Server    │
└─────────────────┘                   └─────────────────┘
                                              │
                                              ▼
                                      ┌─────────────────┐
                                      │   YAML Files    │
                                      │   (design/)     │
                                      └─────────────────┘
```

1. Claude Code starts Designloom as a subprocess
2. Communication happens via JSON-RPC over stdio
3. Designloom provides tools that Claude Code can call
4. Tools read/write YAML files in your project

## Tool Categories

### Query Tools

These tools retrieve information without modifying files.

#### design_list_workflows
List all workflows with optional filtering.

```
> "List all analysis workflows"
```

Parameters:
- `category` (optional): Filter by category

#### design_get_workflow
Get a workflow with resolved relationships.

```
> "Get workflow W01 with all its relationships"
```

Parameters:
- `id` (required): Workflow ID

The response includes `_resolved` object with full details of referenced entities.

#### design_get_dependencies
Get entities that an entity depends on.

```
> "What does workflow W01 depend on?"
```

Parameters:
- `entityType`: "workflow" | "capability" | "persona" | "component"
- `id`: Entity ID

#### design_get_dependents
Get entities that depend on an entity.

```
> "What depends on the data-import capability?"
```

Parameters:
- `entityType`: "workflow" | "capability" | "persona" | "component"
- `id`: Entity ID

### Mutation Tools

These tools modify design documents.

#### design_create_*
Create new entities with validation.

```
> "Create a new capability for graph export with status planned"
```

All referenced entities must exist. Creates the YAML file and updates reverse relationships.

All create tools support a `sources` parameter for tracking where information came from:

```
> "Create a capability for data-import with sources from our user research docs"
```

Sources include:
- `title`: Name of the source document (required)
- `url`: URL to the source (required)
- `summary`: Brief description of what the source contains
- `bibliography`: Optional author, date, publisher, version info

#### design_update_*
Update existing entities.

```
> "Update capability data-import to status implemented"
```

Parameters:
- `id` (required): Entity ID
- `updates`: Object with fields to update (including `sources` array)

#### design_delete_*
Delete entities with dependency checking.

```
> "Delete the unused-capability"
```

Parameters:
- `id` (required): Entity ID
- `force` (optional): Skip dependency warnings

Without `force`, deletion fails if other entities reference this one.

#### design_link / design_unlink
Manage relationships between entities.

```
> "Link workflow W05 to capability graph-export"
```

Parameters:
- `fromType`, `fromId`: Source entity
- `toType`, `toId`: Target entity
- `relationship`: Relationship type

### Analysis Tools

These tools analyze design documents.

#### design_validate
Check design integrity.

```
> "Validate my design documents"
```

Checks:
- All references point to existing entities
- No orphaned entities (optional warning)
- YAML syntax is valid

#### design_coverage_report
Generate usage statistics.

```
> "Show the design coverage report"
```

Returns:
- Capability usage counts
- Implementation status breakdown
- Persona workflow counts
- Component capability counts
- Workflow readiness status

#### design_find_orphans
Find unused entities.

```
> "Find orphaned capabilities"
```

Parameters:
- `entityType` (optional): Filter to specific type

#### design_find_gaps
Find design gaps.

```
> "Find gaps in the design"
```

Returns:
- Workflows without capabilities
- Workflows without personas
- Capabilities without implementations
- Categories with low coverage

#### design_suggest_priority
Get implementation priority suggestions.

```
> "What should I build next?"
```

Parameters:
- `focus` (optional): "capability" | "component"

Returns recommendations sorted by impact.

#### design_generate_tests
Generate test scaffolding.

```
> "Generate tests for workflow W07"
```

Parameters:
- `workflowId` (required): Workflow to generate tests for
- `format` (optional): "vitest" (default) | "playwright"

#### design_export_diagram
Export Mermaid diagrams.

```
> "Export a diagram for workflow W01"
```

Parameters:
- `focus`: Entity ID or "all"
- `depth` (optional): How many relationship levels to include

## Effective Prompts

### Discovery

```
> "What workflows exist for onboarding users?"
> "What capabilities are still planned?"
> "Show me all personas and their goals"
```

### Creation

```
> "Create a workflow for power users to export graph data"
> "Add a capability for real-time collaboration"
> "Create a persona for mobile users with novice expertise"
```

### Analysis

```
> "Are there any broken references in the design?"
> "What's the implementation status of all capabilities?"
> "Which capabilities would unblock the most workflows?"
```

### Planning

```
> "Generate tests for the anomaly detection workflow"
> "Create a diagram showing all dependencies of W01"
> "What gaps exist in the current design?"
```

### Updates

```
> "Mark capability data-import as implemented"
> "Add success criteria to workflow W03"
> "Link the new graph-viewer component to the visualization capability"
```

## Response Formats

### Success Response

```json
{
    "content": [
        {
            "type": "text",
            "text": "{ \"success\": true }"
        }
    ]
}
```

### Error Response

```json
{
    "content": [
        {
            "type": "text",
            "text": "Error: Capability 'non-existent' not found"
        }
    ],
    "isError": true
}
```

### List Response

```json
{
    "content": [
        {
            "type": "text",
            "text": "[{\"id\":\"W01\",\"name\":\"First Load\",\"category\":\"onboarding\"}]"
        }
    ]
}
```

## Error Handling

Claude Code handles errors gracefully:

1. **Validation errors**: Reported with specific field issues
2. **Reference errors**: Identifies missing entities
3. **Permission errors**: Reports file access issues
4. **Syntax errors**: Reports YAML parsing problems

## Best Practices

### 1. Be Specific in Requests

❌ "Create something for data loading"
✅ "Create a capability named 'data-import' in category 'data' with status 'planned'"

### 2. Validate After Changes

```
> "Create workflow W10 for advanced analysis"
> "Validate the design"
```

### 3. Use Analysis Before Planning

```
> "Show coverage report"
> "What should I build next?"
```

### 4. Chain Operations Logically

```
> "Create capability graph-export"
> "Create component export-dialog that implements graph-export"
> "Create workflow W11 that requires graph-export and uses export-dialog"
```

### 5. Review Diagrams for Understanding

```
> "Export diagram for all entities"
```

Then paste the Mermaid code into a viewer like mermaid.live.

## Debugging

### Check Tool Availability

```
> "What designloom tools are available?"
```

### Test Basic Operations

```
> "List all workflows"
> "Get workflow W01"
```

### Verify File Changes

After mutations, you can verify YAML files:

```
> "Show me the contents of design/designloom/workflows/W01.yaml"
```

### Check for Errors

```
> "Validate design documents"
```

## Advanced Usage

### Batch Operations

Claude Code can chain multiple operations:

```
> "Create personas for developer, analyst, and admin roles, then create an onboarding workflow for each"
```

### Conditional Operations

```
> "If any capabilities are orphaned, suggest which workflows might use them"
```

### Iterative Refinement

```
> "Generate tests for W01, review them, and update the success criteria based on what's missing"
```
