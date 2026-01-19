# Designloom MCP Aggressive Tool Consolidation Plan

## Overview

Consolidate 53 MCP tools down to 10 tools using JSON Schema discriminated unions (oneOf with discriminator). This targets the optimal <20 tool range identified in LLM research for best tool selection accuracy.

**Current State:** 53 tools
**Target State:** 10 tools (81% reduction)

---

## Consolidated Tool Architecture

### Final Tool Set (10 tools)

| # | Tool | Consolidates | Purpose |
|---|------|--------------|---------|
| 1 | `design_list` | 8 list tools | List entities with filters |
| 2 | `design_get` | 8 get tools | Get single entity with resolved relations |
| 3 | `design_create` | 8 create tools | Create entity (discriminated by type) |
| 4 | `design_update` | 8 update tools | Update entity (discriminated by type) |
| 5 | `design_delete` | 8 delete tools | Delete entity with force option |
| 6 | `design_link` | link + unlink | Link/unlink entities |
| 7 | `design_validate` | validate + find_orphans + find_gaps + check_schema_versions | Validation suite |
| 8 | `design_analyze` | coverage_report + suggest_priority + get_test_coverage | Analysis reports |
| 9 | `design_export` | export_diagram + generate_tests | Export artifacts |
| 10 | `design_relations` | get_dependencies + get_dependents | Relationship queries |

---

## Tool Mapping: Old → New

### 1. design_list (consolidates 8 tools)

**Old Tools:**
- `design_list_workflows` → `design_list --entity_type workflow`
- `design_list_capabilities` → `design_list --entity_type capability`
- `design_list_personas` → `design_list --entity_type persona`
- `design_list_components` → `design_list --entity_type component`
- `design_list_tokens` → `design_list --entity_type tokens`
- `design_list_views` → `design_list --entity_type view`
- `design_list_interactions` → `design_list --entity_type interaction`
- `design_list_test_results` → `design_list --entity_type test-result`

**New Schema:**
```json
{
  "name": "design_list",
  "description": "List design entities with optional filtering",
  "inputSchema": {
    "type": "object",
    "properties": {
      "entity_type": {
        "type": "string",
        "enum": ["workflow", "capability", "persona", "component", "tokens", "view", "interaction", "test-result"]
      },
      "category": { "type": "string" },
      "status": { "type": "string" },
      "priority": { "type": "string", "enum": ["P0", "P1", "P2"] },
      "validated": { "type": "boolean" },
      "workflow": { "type": "string" },
      "workflow_id": { "type": "string" },
      "persona": { "type": "string" },
      "persona_id": { "type": "string" },
      "capability": { "type": "string" },
      "test_type": { "type": "string", "enum": ["simulated", "real"] },
      "has_issues": { "type": "boolean" },
      "extends": { "type": "string" },
      "layout_type": { "type": "string" },
      "has_route": { "type": "boolean" },
      "applies_to": { "type": "string" }
    },
    "required": ["entity_type"]
  }
}
```

**Store Method Routing:**
```typescript
switch (entity_type) {
  case "workflow": return store.listWorkflows(filters);
  case "capability": return store.listCapabilities(filters);
  case "persona": return store.listPersonas();
  case "component": return store.listComponents(filters);
  case "tokens": return store.listTokens(filters);
  case "view": return store.listViews(filters);
  case "interaction": return store.listInteractions(filters);
  case "test-result": return store.listTestResults(filters);
}
```

---

### 2. design_get (consolidates 8 tools)

**Old Tools:**
- `design_get_workflow --id W01` → `design_get --entity_type workflow --id W01`
- `design_get_capability --id data-import` → `design_get --entity_type capability --id data-import`
- `design_get_persona --id analyst-alex` → `design_get --entity_type persona --id analyst-alex`
- `design_get_component --id file-upload` → `design_get --entity_type component --id file-upload`
- `design_get_tokens --id default-theme` → `design_get --entity_type tokens --id default-theme`
- `design_get_view --id V01` → `design_get --entity_type view --id V01`
- `design_get_interaction --id button-press` → `design_get --entity_type interaction --id button-press`
- `design_get_test_result --id TR-W01-alex-001` → `design_get --entity_type test-result --id TR-W01-alex-001`

**New Schema:**
```json
{
  "name": "design_get",
  "description": "Get a single design entity by ID with resolved relationships",
  "inputSchema": {
    "type": "object",
    "properties": {
      "entity_type": {
        "type": "string",
        "enum": ["workflow", "capability", "persona", "component", "tokens", "view", "interaction", "test-result"]
      },
      "id": { "type": "string" }
    },
    "required": ["entity_type", "id"]
  }
}
```

---

### 3. design_create (consolidates 8 tools)

**Old Tools → New Mapping:**
- `design_create_workflow --data {...}` → `design_create --entity_type workflow ...fields`
- `design_create_capability --data {...}` → `design_create --entity_type capability ...fields`
- `design_create_persona --data {...}` → `design_create --entity_type persona ...fields`
- `design_create_component --data {...}` → `design_create --entity_type component ...fields`
- `design_create_tokens --data {...}` → `design_create --entity_type tokens ...fields`
- `design_create_view --data {...}` → `design_create --entity_type view ...fields`
- `design_create_interaction --data {...}` → `design_create --entity_type interaction ...fields`
- `design_create_test_result --data {...}` → `design_create --entity_type test-result ...fields`

**New Schema (discriminated union):**
```json
{
  "name": "design_create",
  "description": "Create a new design entity",
  "inputSchema": {
    "type": "object",
    "discriminator": { "propertyName": "entity_type" },
    "oneOf": [
      {
        "title": "CreateWorkflow",
        "properties": {
          "entity_type": { "const": "workflow" },
          "id": { "type": "string", "pattern": "^W\\d{1,3}$" },
          "name": { "type": "string" },
          "category": { "type": "string", "enum": ["onboarding", "analysis", "exploration", "reporting", "collaboration", "administration"] },
          "goal": { "type": "string" },
          "validated": { "type": "boolean" },
          "personas": { "type": "array", "items": { "type": "string" } },
          "requires_capabilities": { "type": "array" },
          "suggested_components": { "type": "array" },
          "starting_state": { "type": "object" },
          "success_criteria": { "type": "array" },
          "sources": { "type": "array" }
        },
        "required": ["entity_type", "id", "name", "category", "goal"]
      },
      {
        "title": "CreateCapability",
        "properties": {
          "entity_type": { "const": "capability" },
          "id": { "type": "string" },
          "name": { "type": "string" },
          "category": { "type": "string", "enum": ["data", "visualization", "analysis", "interaction", "export", "collaboration", "performance"] },
          "description": { "type": "string" },
          "status": { "type": "string", "enum": ["planned", "in-progress", "implemented", "deprecated"] },
          "algorithms": { "type": "array" },
          "requirements": { "type": "array" },
          "sources": { "type": "array" }
        },
        "required": ["entity_type", "id", "name", "category", "description"]
      },
      {
        "title": "CreatePersona",
        "properties": {
          "entity_type": { "const": "persona" },
          "id": { "type": "string" },
          "name": { "type": "string" },
          "role": { "type": "string" },
          "quote": { "type": "string" },
          "bio": { "type": "string" },
          "characteristics": { "type": "object" },
          "motivations": { "type": "array" },
          "behaviors": { "type": "array" },
          "goals": { "type": "array" },
          "frustrations": { "type": "array" },
          "context": { "type": "object" },
          "workflows": { "type": "array" },
          "sources": { "type": "array" }
        },
        "required": ["entity_type", "id", "name", "role", "characteristics", "goals"]
      },
      {
        "title": "CreateComponent",
        "properties": {
          "entity_type": { "const": "component" },
          "id": { "type": "string" },
          "name": { "type": "string" },
          "category": { "type": "string", "enum": ["dialog", "control", "display", "layout", "utility", "navigation"] },
          "description": { "type": "string" },
          "status": { "type": "string" },
          "implements_capabilities": { "type": "array" },
          "used_in_workflows": { "type": "array" },
          "dependencies": { "type": "array" },
          "props": { "type": "object" },
          "sources": { "type": "array" }
        },
        "required": ["entity_type", "id", "name", "category", "description"]
      },
      {
        "title": "CreateTokens",
        "properties": {
          "entity_type": { "const": "tokens" },
          "id": { "type": "string" },
          "name": { "type": "string" },
          "description": { "type": "string" },
          "extends": { "type": "string" },
          "colors": { "type": "object" },
          "typography": { "type": "object" },
          "spacing": { "type": "object" },
          "radii": { "type": "object" },
          "shadows": { "type": "object" },
          "motion": { "type": "object" },
          "breakpoints": { "type": "object" }
        },
        "required": ["entity_type", "id", "name", "colors", "typography", "spacing"]
      },
      {
        "title": "CreateView",
        "properties": {
          "entity_type": { "const": "view" },
          "id": { "type": "string", "pattern": "^V\\d+$" },
          "name": { "type": "string" },
          "description": { "type": "string" },
          "workflows": { "type": "array" },
          "layout": { "type": "object" },
          "states": { "type": "array" },
          "routes": { "type": "array" },
          "data_requirements": { "type": "array" }
        },
        "required": ["entity_type", "id", "name", "layout"]
      },
      {
        "title": "CreateInteraction",
        "properties": {
          "entity_type": { "const": "interaction" },
          "id": { "type": "string" },
          "name": { "type": "string" },
          "description": { "type": "string" },
          "interaction": { "type": "object" },
          "applies_to": { "type": "array" }
        },
        "required": ["entity_type", "id", "name", "interaction"]
      },
      {
        "title": "CreateTestResult",
        "properties": {
          "entity_type": { "const": "test-result" },
          "id": { "type": "string" },
          "workflow_id": { "type": "string" },
          "persona_id": { "type": "string" },
          "test_type": { "type": "string", "enum": ["simulated", "real"] },
          "date": { "type": "string" },
          "status": { "type": "string", "enum": ["passed", "failed", "partial"] },
          "confidence": { "type": "string", "enum": ["high", "medium", "low"] },
          "success_criteria_results": { "type": "array" },
          "issues": { "type": "array" },
          "summary": { "type": "string" },
          "participants": { "type": "number" },
          "quotes": { "type": "array" },
          "recommendations": { "type": "array" },
          "sources": { "type": "array" }
        },
        "required": ["entity_type", "id", "workflow_id", "persona_id", "test_type", "date", "status"]
      }
    ]
  }
}
```

---

### 4. design_update (consolidates 8 tools)

**Old → New Mapping:**
- `design_update_workflow --id W01 --data {...}` → `design_update --entity_type workflow --id W01 ...fields`
- (Same pattern for all 8 entity types)

**New Schema:** Same discriminated union pattern as design_create, but only `entity_type` and `id` are required.

---

### 5. design_delete (consolidates 8 tools)

**Old → New Mapping:**
- `design_delete_workflow --id W01` → `design_delete --entity_type workflow --id W01`
- `design_delete_capability --id cap --force true` → `design_delete --entity_type capability --id cap --force true`

**New Schema:**
```json
{
  "name": "design_delete",
  "description": "Delete a design entity",
  "inputSchema": {
    "type": "object",
    "properties": {
      "entity_type": {
        "type": "string",
        "enum": ["workflow", "capability", "persona", "component", "tokens", "view", "interaction", "test-result"]
      },
      "id": { "type": "string" },
      "force": { "type": "boolean", "description": "Force delete even if dependents exist" }
    },
    "required": ["entity_type", "id"]
  }
}
```

---

### 6. design_link (consolidates 2 tools)

**Old → New Mapping:**
- `design_link --from_type workflow --from_id W01 --to_type capability --to_id cap --relationship requires` → `design_link --action link ...same params`
- `design_unlink ...` → `design_link --action unlink ...same params`

**New Schema:**
```json
{
  "name": "design_link",
  "description": "Link or unlink two entities with bidirectional references",
  "inputSchema": {
    "type": "object",
    "properties": {
      "action": { "type": "string", "enum": ["link", "unlink"] },
      "from_type": { "type": "string", "enum": ["workflow", "capability", "persona", "component"] },
      "from_id": { "type": "string" },
      "to_type": { "type": "string", "enum": ["workflow", "capability", "persona", "component"] },
      "to_id": { "type": "string" },
      "relationship": { "type": "string", "enum": ["requires", "uses", "suggests", "implements", "depends"] }
    },
    "required": ["action", "from_type", "from_id", "to_type", "to_id", "relationship"]
  }
}
```

---

### 7. design_validate (consolidates 4 tools)

**Old → New Mapping:**
- `design_validate` → `design_validate --check all`
- `design_find_orphans` → `design_validate --check orphans`
- `design_find_orphans --entity_type capability` → `design_validate --check orphans --entity_type capability`
- `design_find_gaps` → `design_validate --check gaps`
- `design_check_schema_versions` → `design_validate --check schema`

**New Schema:**
```json
{
  "name": "design_validate",
  "description": "Validate design documents: check references, find orphans, find gaps, or check schema versions",
  "inputSchema": {
    "type": "object",
    "properties": {
      "check": {
        "type": "string",
        "enum": ["all", "orphans", "gaps", "schema"],
        "description": "'all' validates references, 'orphans' finds unreferenced entities, 'gaps' finds missing coverage, 'schema' checks versions"
      },
      "entity_type": {
        "type": "string",
        "enum": ["capability", "persona", "component"],
        "description": "For orphans check: filter by entity type"
      }
    },
    "required": ["check"]
  }
}
```

---

### 8. design_analyze (consolidates 3 tools)

**Old → New Mapping:**
- `design_coverage_report` → `design_analyze --report coverage`
- `design_suggest_priority --focus capability --limit 5` → `design_analyze --report priority --focus capability --limit 5`
- `design_get_test_coverage` → `design_analyze --report test-coverage`

**New Schema:**
```json
{
  "name": "design_analyze",
  "description": "Generate analysis reports: coverage, priority suggestions, or test coverage",
  "inputSchema": {
    "type": "object",
    "properties": {
      "report": {
        "type": "string",
        "enum": ["coverage", "priority", "test-coverage"]
      },
      "focus": {
        "type": "string",
        "enum": ["capability", "workflow"],
        "description": "For priority report: what to prioritize"
      },
      "limit": {
        "type": "number",
        "description": "For priority report: max recommendations"
      }
    },
    "required": ["report"]
  }
}
```

---

### 9. design_export (consolidates 2 tools)

**Old → New Mapping:**
- `design_export_diagram --focus W01 --depth 2` → `design_export --format diagram --focus W01 --depth 2`
- `design_generate_tests --workflow_id W01 --format vitest` → `design_export --format tests --workflow_id W01 --test_format vitest`

**New Schema:**
```json
{
  "name": "design_export",
  "description": "Export design artifacts: Mermaid diagrams or test scaffolding",
  "inputSchema": {
    "type": "object",
    "properties": {
      "format": {
        "type": "string",
        "enum": ["diagram", "tests"]
      },
      "focus": { "type": "string", "description": "For diagram: entity ID or 'all'" },
      "depth": { "type": "number", "description": "For diagram: relationship depth" },
      "workflow_id": { "type": "string", "description": "For tests: workflow to generate tests for" },
      "test_format": { "type": "string", "enum": ["vitest", "playwright"], "description": "For tests: framework" }
    },
    "required": ["format"]
  }
}
```

---

### 10. design_relations (consolidates 2 tools)

**Old → New Mapping:**
- `design_get_dependencies --entity_type workflow --id W01` → `design_relations --direction dependencies --entity_type workflow --id W01`
- `design_get_dependents --entity_type capability --id cap` → `design_relations --direction dependents --entity_type capability --id cap`

**New Schema:**
```json
{
  "name": "design_relations",
  "description": "Get dependency or dependent relationships for an entity",
  "inputSchema": {
    "type": "object",
    "properties": {
      "direction": {
        "type": "string",
        "enum": ["dependencies", "dependents"]
      },
      "entity_type": {
        "type": "string",
        "enum": ["workflow", "capability", "persona", "component", "tokens", "view", "interaction"]
      },
      "id": { "type": "string" }
    },
    "required": ["direction", "entity_type", "id"]
  }
}
```

---

## Prompt Updates Required

### Transformation Rules

| Old Pattern | New Pattern |
|-------------|-------------|
| `design_list_workflows` | `design_list --entity_type workflow` |
| `design_list_workflows --priority P0` | `design_list --entity_type workflow --priority P0` |
| `design_get_workflow --id W01` | `design_get --entity_type workflow --id W01` |
| `design_create_persona --data '{...}'` | `design_create --entity_type persona ...fields` |
| `design_update_workflow --id W01 --data '{...}'` | `design_update --entity_type workflow --id W01 ...fields` |
| `design_validate` | `design_validate --check all` |
| `design_find_orphans` | `design_validate --check orphans` |
| `design_find_gaps` | `design_validate --check gaps` |
| `design_coverage_report` | `design_analyze --report coverage` |
| `design_export_diagram` | `design_export --format diagram` |
| `design_generate_tests` | `design_export --format tests` |

### Prompts by Update Complexity

**High Impact (10+ tool references):**
- `12-pre-development-validation.md` - 7 tools
- `13-post-test-updates.md` - 9 tools
- `14-handoff-preparation.md` - 9 tools
- `20-implementation-validation.md` - 11 tools
- `23-release-synchronization.md` - 10 tools

**Medium Impact (5-9 tool references):**
- `04-workflow-creation.md` - 4 tools
- `06-capability-generation.md` - 5 tools
- `16-implementation-prioritization.md` - 7 tools
- `19-vertical-slice-spec.md` - 5 tools
- `21-progress-tracking.md` - 3 tools
- `24-documentation-generation.md` - 6 tools
- `27-new-feature-addition.md` - 8 tools

**Low Impact (1-4 tool references):**
- `02-persona-creation.md` - 2 tools
- `05-success-criteria.md` - 4 tools
- `07-capability-refinement.md` - 4 tools
- `08-token-foundation.md` - 2 tools
- `09-interaction-patterns.md` - 2 tools
- `10-component-design.md` - 4 tools
- `11-view-assembly.md` - 3 tools
- `15-handoff-gap-analysis.md` - 3 tools
- `17-golden-path.md` - 4 tools
- `18-technical-spikes.md` - 3 tools
- `22-pattern-extraction.md` - 5 tools
- `25-retrospective.md` - 5 tools
- `26-impact-analysis.md` - 3 tools
- `28-entity-quality-review.md` - 1 tool
- `29-accessibility-audit.md` - 3 tools
- `31-context-prompt-generation.md` - 4 tools

**No Updates Needed:**
- `01-research-synthesis.md` - No design_* tools
- `30-prompt-improvement.md` - No design_* tools
- `32-multi-agent-verification.md` - No design_* tools

---

## design/designloom-process.md Updates

The process document references these tool patterns that need updating:

| Section | Old Reference | New Reference |
|---------|---------------|---------------|
| Phase 2: Define | `design_validate` | `design_validate --check all` |
| Phase 2: Define | `design_find_orphans` | `design_validate --check orphans` |
| Phase 3: Ideate | `design_find_gaps` | `design_validate --check gaps` |
| Phase 3: Ideate | `design_coverage_report` | `design_analyze --report coverage` |
| Phase 7: Validation | `design_create_source` | `design_create --entity_type source` (if source entity exists) |
| Phase 7: Validation | `design_update_workflow --id W01` | `design_update --entity_type workflow --id W01` |
| Phase 8: Handoff | `design_export_diagram` | `design_export --format diagram` |
| Phase 8: Handoff | `design_generate_tests` | `design_export --format tests` |
| Phase 9: Planning | `design_list_capabilities` | `design_list --entity_type capability` |
| Phase 9: Planning | `design_list_components` | `design_list --entity_type component` |
| Phase 9: Planning | `design_list_workflows --filter` | `design_list --entity_type workflow --validated true` |
| Phase 10: Implementation | `design_get_workflow --id W01` | `design_get --entity_type workflow --id W01` |
| Phase 10: Implementation | `design_get_component --id X` | `design_get --entity_type component --id X` |
| Phase 10: Implementation | `design_get_view --id V01` | `design_get --entity_type view --id V01` |
| Phase 11: Validation | `design_export_diagram --type workflow` | `design_export --format diagram --focus workflow` |
| Phase 12: Expansion | `design_create_component --data` | `design_create --entity_type component ...` |
| Phase 12: Expansion | `design_update_view --id V03` | `design_update --entity_type view --id V03` |
| Change Management | `design_get_capability --id X` | `design_get --entity_type capability --id X` |
| Change Management | `design_get_component --id X` | `design_get --entity_type component --id X` |
| Regular Audits | `design_validate` | `design_validate --check all` |
| Regular Audits | `design_find_orphans` | `design_validate --check orphans` |
| Regular Audits | `design_find_gaps` | `design_validate --check gaps` |
| Regular Audits | `design_coverage_report` | `design_analyze --report coverage` |

---

## Test Updates Required

### Files to Update

| Test File | Changes Required |
|-----------|------------------|
| `tests/tools/mutation-tools.test.ts` | Update tool names: `design_create_*` → `design_create`, add `entity_type` param |
| `tests/tools/analysis-tools.test.ts` | Update: `design_validate` → params, `design_coverage_report` → `design_analyze` |
| `tests/tools/test-result-tools.test.ts` | Update test result tool calls |
| `tests/integration/end-to-end.test.ts` | Update all tool calls throughout integration flow |

### Test Transformation Pattern

**Before:**
```typescript
const result = await server.callTool("design_create_capability", {
    id: "new-cap",
    name: "New Capability",
    category: "data",
    description: "A new capability"
});
```

**After:**
```typescript
const result = await server.callTool("design_create", {
    entity_type: "capability",
    id: "new-cap",
    name: "New Capability",
    category: "data",
    description: "A new capability"
});
```

### New Tests to Add

1. **Discriminator validation tests** - Verify correct schema variant selected
2. **Invalid entity_type rejection** - Ensure bad types are rejected
3. **Cross-variant validation** - Verify workflow fields rejected for capability type
4. **design_validate --check variants** - Test all check modes
5. **design_analyze --report variants** - Test all report modes
6. **design_link --action variants** - Test link and unlink modes

---

## Implementation Plan

### Phase 1: Create Consolidated Tool Definitions (src/tools/consolidated.ts)

**New file:** `/home/apowers/Projects/designloom/src/tools/consolidated.ts`

Contains:
- `getConsolidatedTools()` - Returns array of 10 tool definitions
- `handleConsolidatedTool()` - Routes calls to existing store methods

### Phase 2: Update Tool Registration (src/index.ts)

Modify `DesignloomServer` to:
- Import consolidated tools instead of query/mutation/analysis
- Update `listTools()` to return consolidated tools
- Update `callTool()` to route to consolidated handler

### Phase 3: Update Tests

1. Update `tests/tools/*.test.ts` with new tool signatures
2. Update `tests/integration/end-to-end.test.ts`
3. Add discriminator validation tests
4. Verify all existing test scenarios pass

### Phase 4: Update Prompts (./prompts/*.md)

Apply transformation rules to all 29 affected prompt files.

### Phase 5: Update Documentation

1. Update `design/designloom-process.md` with new tool syntax
2. Update `CLAUDE.md` if it references specific tools
3. Update any README files

### Phase 6: Cleanup

1. Remove old tool files (`query.ts`, `mutation.ts`, `analysis.ts`)
2. Update exports in `src/tools/index.ts` to only export consolidated tools

---

## Critical Files

| File | Action |
|------|--------|
| `src/tools/consolidated.ts` | CREATE - New consolidated tools |
| `src/tools/index.ts` | MODIFY - Export consolidated tools |
| `src/index.ts` | MODIFY - Use consolidated tool handler |
| `src/store/yaml-store.ts` | NO CHANGE - Store layer unchanged |
| `tests/tools/*.test.ts` | MODIFY - Update tool call syntax |
| `tests/integration/end-to-end.test.ts` | MODIFY - Update integration tests |
| `prompts/*.md` | MODIFY - 29 files need tool syntax updates |
| `design/designloom-process.md` | MODIFY - Update tool references |

---

## Verification

### After Implementation

1. **Run all tests:**
   ```bash
   npm test
   ```

2. **Verify tool listing:**
   ```bash
   # Should show exactly 10 tools
   npx mcp-cli list-tools designloom
   ```

3. **Test each consolidated tool manually:**
   ```
   design_list --entity_type workflow
   design_get --entity_type workflow --id W01
   design_create --entity_type capability --id test-cap --name Test --category data --description Test
   design_update --entity_type capability --id test-cap --status in-progress
   design_delete --entity_type capability --id test-cap
   design_link --action link --from_type workflow --from_id W01 --to_type capability --to_id data-import --relationship requires
   design_validate --check all
   design_analyze --report coverage
   design_export --format diagram --focus all
   design_relations --direction dependencies --entity_type workflow --id W01
   ```

4. **Run a sample prompt to verify end-to-end:**
   - Execute prompt 12 (pre-development-validation) against test fixtures
   - Verify all tool calls succeed with new syntax

---

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| LLM confusion with oneOf schemas | Clear descriptions per variant; test with Claude |
| Validation error messages less specific | Add context to error messages in handler |
| Complex prompt updates | Automated find/replace for simple cases |

**Note:** No migration path needed - single-user tool with git history for rollback if needed.
