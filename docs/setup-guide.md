# Designloom Setup Guide

This guide walks you through setting up Designloom in your project.

## Prerequisites

- Node.js 18.19.0 or later
- Claude Code installed and configured
- Git repository (optional, but recommended for worktree support)

## Installation Options

### Option 1: Install from npm (when published)

```bash
npm install @graphty/designloom
```

### Option 2: Use from monorepo

If you're working within the graphty-monorepo:

```bash
cd designloom
npm run build
```

## Directory Structure Setup

Designloom expects a specific directory structure for your design documents:

```
your-project/
├── design/
│   └── designloom/
│       ├── workflows/      # Workflow YAML files
│       ├── capabilities/   # Capability YAML files
│       ├── personas/       # Persona YAML files
│       └── components/     # Component YAML files
├── .mcp.json              # MCP server configuration
└── ...
```

Create the directory structure:

```bash
mkdir -p design/designloom/{workflows,capabilities,personas,components}
```

## Claude Code Configuration

### Basic Configuration

Create or edit `.mcp.json` in your project root:

```json
{
    "mcpServers": {
        "designloom": {
            "command": "npx",
            "args": ["@graphty/designloom"],
            "env": {
                "DESIGNLOOM_DATA_PATH": "./design/designloom"
            }
        }
    }
}
```

### Local Development Configuration

For development within the graphty-monorepo:

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

### Custom Data Path

You can customize the data path:

```json
{
    "mcpServers": {
        "designloom": {
            "command": "npx",
            "args": ["@graphty/designloom"],
            "env": {
                "DESIGNLOOM_DATA_PATH": "./docs/design-artifacts"
            }
        }
    }
}
```

## Verifying Installation

### 1. Start Claude Code

After configuring `.mcp.json`, start a new Claude Code session in your project directory.

### 2. Approve the MCP Server

Claude Code will prompt you to approve the designloom MCP server. Accept the prompt.

### 3. Test the Connection

Ask Claude Code:
> "List all workflows"

Expected response: Claude will call `design_list_workflows` and return an empty list or any existing workflows.

### 4. Create Your First Entity

Ask Claude Code:
> "Create a new persona called 'Developer Dave' who is a software developer with intermediate expertise"

Expected: Claude creates a YAML file at `design/designloom/personas/developer-dave.yaml`.

## Git Worktree Support

Designloom automatically detects git worktrees and resolves paths to the main repository. This means:

1. Design documents are shared across all worktrees
2. Changes made in any worktree are visible to all others
3. No additional configuration is needed

### How It Works

When running in a git worktree, Designloom:
1. Detects the worktree via `git rev-parse --git-dir`
2. Finds the main repo via `git rev-parse --git-common-dir`
3. Resolves the data path relative to the main repository

### Manual Override

If you want worktree-specific design documents, use an absolute path:

```json
{
    "mcpServers": {
        "designloom": {
            "command": "npx",
            "args": ["@graphty/designloom"],
            "env": {
                "DESIGNLOOM_DATA_PATH": "/absolute/path/to/design/docs"
            }
        }
    }
}
```

## Initial Design Documents

### Sample Workflow

Create `design/designloom/workflows/W01.yaml`:

```yaml
id: W01
name: First Load Experience
category: onboarding
validated: false
goal: Help users load their first dataset
personas: []
requires_capabilities: []
suggested_components: []
success_criteria:
  - metric: time_to_visualization
    target: "< 30 seconds"
```

### Sample Persona

Create `design/designloom/personas/analyst-alex.yaml`:

```yaml
id: analyst-alex
name: Analyst Alex
role: Data Analyst
characteristics:
  expertise: intermediate
  time_pressure: medium
goals:
  - Find patterns in data
  - Generate reports
frustrations:
  - Complex interfaces
workflows: []
```

### Sample Capability

Create `design/designloom/capabilities/data-import.yaml`:

```yaml
id: data-import
name: Data Import
category: data
description: Import data from various file formats
status: planned
algorithms: []
used_by_workflows: []
implemented_by_components: []
requirements:
  - Support CSV format
  - Support JSON format
```

## Next Steps

- Read the [Workflow Guide](./workflow-guide.md) to learn about workflow-driven design
- Read the [MCP Integration Guide](./mcp-integration.md) for advanced Claude Code usage
- Explore the available tools in the [README](../README.md)

## Troubleshooting

### "MCP server failed to start"

1. Check that the command path is correct
2. Verify the package is built (`npm run build` in designloom directory)
3. Check Node.js version (requires 18.19.0+)

### "Directory not found" errors

1. Verify the data path exists
2. Check file permissions
3. Ensure the path is relative to the project root

### "Entity not found" after creation

1. Check the YAML file was created correctly
2. Verify the file is in the correct subdirectory
3. Look for YAML syntax errors in the file

### Git worktree not detected

1. Verify you're in a git repository
2. Check `git rev-parse --git-dir` returns a worktree path
3. Ensure git is installed and accessible
