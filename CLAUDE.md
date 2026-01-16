# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Designloom is an MCP server for workflow-driven design management. It stores design artifacts as YAML files and provides query, mutation, and analysis tools accessible through Claude Code.

## Commands

```bash
npm run build           # Compile TypeScript
npm run build:watch     # Watch mode
npm test                # Run tests once
npm run test:watch      # Run tests in watch mode
npm run coverage        # Run with coverage
npm run lint            # Run linter (includes typecheck)
npm run lint:fix        # Auto-fix lint issues
npm run typecheck       # TypeScript type checking only

# Run a single test file
npx vitest run tests/store/yaml-store.test.ts

# Run tests matching a pattern
npx vitest run -t "should create workflow"
```

## Architecture

### Core Flow

`cli.ts` → `index.ts` (DesignloomServer) → `tools/*.ts` → `store/yaml-store.ts` → YAML files

- **DesignloomServer** (`src/index.ts`): MCP server wrapper that routes tool calls
- **DesignDocsStore** (`src/store/yaml-store.ts`): Core store with all CRUD, link, and analysis operations
- **Tools** (`src/tools/`): MCP tool definitions split by category (query, mutation, analysis)
- **Schemas** (`src/schemas/`): Zod validation schemas for each entity type

### Entity Types

| Type | ID Format | Storage |
|------|-----------|---------|
| Workflow | W01, W02... | `workflows/` |
| Capability | kebab-case | `capabilities/` |
| Persona | kebab-case | `personas/` |
| Component | kebab-case | `components/` |
| Tokens | kebab-case | `tokens/` |
| View | V01, V02... | `views/` |
| Interaction | kebab-case | `interactions/` |
| Source | kebab-case | `sources/` |

### Entity Relationships

```
Workflow → personas[], requires_capabilities[], suggested_components[]
Capability ← used_by_workflows[] (reverse), → implemented_by_components[]
Component → implements_capabilities[], used_in_workflows[], dependencies[], interaction_pattern
View → workflows[], layout.zones[].components[]
Tokens → extends (parent theme)
InteractionPattern → applies_to[], ← components_using[] (reverse)
```

Bidirectional relationships are maintained automatically by the store.

## Key Patterns

### Test Setup for Mutations

```typescript
const testDir = path.join(process.cwd(), "tests", "fixtures", "temp-test");

beforeEach(() => {
    fs.mkdirSync(path.join(testDir, "workflows"), { recursive: true });
    store = new DesignDocsStore(testDir);
});

afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
});
```

### Adding a New Tool

1. Add tool definition in `query.ts`, `mutation.ts`, or `analysis.ts`
2. Add handler case in the corresponding `handle*Tool()` function
3. Export from `tools/index.ts`
4. Add tests

### Adding a New Entity Field

1. Update Zod schema in `schemas/`
2. Update store methods in `yaml-store.ts`
3. Add tests

## Notes

- YAML files use entity IDs as filenames (e.g., `W01.yaml`, `data-import.yaml`)
- Creating entities validates all referenced entities exist
- Deleting entities warns about dependents unless `force: true`
- Path resolver (`path-resolver.ts`) handles git worktree detection
- Coverage thresholds: 80% lines/functions/statements, 75% branches
