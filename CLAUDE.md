# CLAUDE.md - designloom

Package-specific guidance for Claude Code when working with the designloom package.

## Package Overview

Designloom is an MCP server for workflow-driven design management. It stores design artifacts as YAML files and provides query, mutation, and analysis tools accessible through Claude Code.

## Package Commands

```bash
# Build
npm run build           # Compile TypeScript
npm run build:watch     # Watch mode

# Test
npm test                # Run tests in watch mode
npm run test:run        # Run tests once
npm run coverage        # Run with coverage

# Lint
npm run lint            # Run linter
npm run lint:fix        # Auto-fix lint issues

# Type check
npm run typecheck       # Run TypeScript type checking
```

## Architecture Overview

```
src/
├── index.ts           # DesignloomServer class, MCP server setup
├── cli.ts             # CLI entry point for npx execution
├── path-resolver.ts   # Git-aware path resolution for worktrees
├── schemas/           # Zod validation schemas
│   ├── workflow.ts    # Workflow entity schema
│   ├── capability.ts  # Capability entity schema
│   ├── persona.ts     # Persona entity schema
│   └── component.ts   # Component entity schema
├── store/
│   ├── yaml-store.ts  # Main store class with all CRUD operations
│   ├── yaml-reader.ts # (future) YAML file reading utilities
│   └── yaml-writer.ts # YAML file writing utilities
└── tools/
    ├── query.ts       # Query tool definitions (list, get, dependencies)
    ├── mutation.ts    # Mutation tool definitions (create, update, delete, link)
    └── analysis.ts    # Analysis tool definitions (validate, coverage, gaps)
```

## Key Classes and Functions

### DesignloomServer (src/index.ts)

Main server class that wraps the store and provides MCP interface:
- `listTools()` - Returns all available MCP tools
- `callTool(name, args)` - Executes a tool and returns result

### DesignDocsStore (src/store/yaml-store.ts)

Core store class managing YAML files:
- List operations: `listWorkflows()`, `listCapabilities()`, etc.
- Get operations: `getWorkflow(id)`, `getCapability(id)`, etc.
- Create operations: `createWorkflow(data)`, `createCapability(data)`, etc.
- Update operations: `updateWorkflow(id, updates)`, etc.
- Delete operations: `deleteWorkflow(id, options)`, etc.
- Link operations: `link(fromType, fromId, toType, toId, relationship)`, `unlink(...)`
- Analysis: `validate()`, `coverageReport()`, `findOrphans()`, `findGaps()`, `suggestPriority()`
- Generation: `generateTests(workflowId, options)`, `exportDiagram(options)`

## Testing Guidelines

### Test Organization

- `tests/schemas/` - Schema validation tests
- `tests/store/` - Store operation tests
- `tests/server/` - MCP server integration tests
- `tests/integration/` - End-to-end workflow tests
- `tests/fixtures/design/` - Sample YAML files for testing

### Test Patterns

```typescript
// Use temporary directories for mutation tests
const testDir = path.join(process.cwd(), "tests", "fixtures", "temp-test");

beforeEach(() => {
    fs.mkdirSync(path.join(testDir, "workflows"), { recursive: true });
    // ... create other directories
    store = new DesignDocsStore(testDir);
});

afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
});
```

### Coverage Thresholds

Target: 80% coverage for lines, functions, statements, and 75% for branches.

## Common Tasks

### Adding a New Tool

1. Define the tool in the appropriate file (`query.ts`, `mutation.ts`, or `analysis.ts`)
2. Add handler logic in the `handle*Tool()` function
3. Export from `tools/index.ts`
4. Add tests in `tests/tools/` or `tests/server/`

### Adding a New Entity Field

1. Update the Zod schema in `schemas/`
2. Update relevant store methods in `yaml-store.ts`
3. Update tests to cover the new field
4. Update sample fixtures if needed

### Testing MCP Server Directly

```bash
# Send a JSON-RPC request via stdin
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node dist/cli.js
```

## Important Notes

### YAML Storage

- All entities are stored as individual YAML files
- File names are based on entity IDs (e.g., `W01.yaml`, `data-import.yaml`)
- Bidirectional relationships are maintained automatically

### Referential Integrity

- Creating entities validates all referenced entities exist
- Deleting entities warns about dependents unless `force: true`
- Force delete cleans up references in dependent entities

### Git Worktree Support

The path resolver (`path-resolver.ts`) automatically detects git worktrees and resolves the data path to the main repository when appropriate.

### Error Handling

- Validation errors return `{ isError: true }` in the tool result
- Store operations return `{ success: boolean, error?: string }`
- Zod errors are formatted for human readability

## Entity Relationships

```
Workflow
  ├── personas[] → Persona.id
  ├── requires_capabilities[] → Capability.id
  └── suggested_components[] → Component.id

Capability
  ├── used_by_workflows[] ← Workflow.requires_capabilities (reverse)
  └── implemented_by_components[] → Component.id

Persona
  └── workflows[] ← Workflow.personas (reverse)

Component
  ├── implements_capabilities[] → Capability.id
  ├── used_in_workflows[] → Workflow.id
  └── dependencies[] → Component.id
```
