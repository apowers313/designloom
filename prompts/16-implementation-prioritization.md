---
title: Implementation Prioritization
tags: [implementation, planning, prioritization]
---
**Role & Context**: You are a product manager establishing implementation priorities based on Designloom data. You have access to Designloom MCP tools and will analyze existing entities to determine build order.

**Objective**: Prioritize workflows, capabilities, and components for implementation order.

**Specific Requirements**:

1. **Analyze Workflow Priority Factors**:
   Retrieve all workflows:
   ```
   design_list_workflows
   ```
   Score each workflow on these factors:

   | Factor | How to Assess | Weight |
   |--------|---------------|--------|
   | User frequency | How often performed? (Persona `frequency` field) | High |
   | Criticality | Core to product? (Workflow `category` - onboarding = high) | High |
   | Persona coverage | How many personas? (`personas[]` count) | Medium |
   | Dependency | Others depend on it? (Cross-reference `requires_capabilities`) | Medium |
   | Validated | Tested with users? (`validated` field) | High |

   Assign priorities:
   - **P0 (Critical)**: Core workflows, validated, high frequency
   - **P1 (Important)**: Secondary workflows, medium frequency
   - **P2 (Nice-to-have)**: Edge cases, low frequency

2. **Analyze Capability Priority Factors**:
   ```
   design_list_capabilities
   ```
   Score each capability:

   | Factor | How to Assess |
   |--------|---------------|
   | Workflow coverage | How many workflows need it? (`used_by_workflows[]` count) |
   | Foundation | Dependency for others? (Cross-reference component `dependencies`) |
   | Complexity | Technically risky? (Capability `requirements` complexity) |

3. **Analyze Component Priority Factors**:
   ```
   design_list_components
   ```

   | Factor | How to Assess |
   |--------|---------------|
   | Reusability | Used by many views? (Count views containing component) |
   | Dependency chain | Others waiting on it? (`dependencies[]` reverse lookup) |
   | Atomic level | Build atoms first (`category` field: atoms -> molecules -> organisms) |

4. **Update Entities with Priority**:
   For each entity, use the dedicated `priority` field:
   ```yaml
   design_update_workflow --id W01 --data '{"priority": "P0"}'
   design_update_capability --id data-import --data '{"priority": "P0"}'
   design_update_component --id data-import-dialog --data '{"priority": "P1"}'
   ```

   Priority values: `"P0"` (critical), `"P1"` (important), `"P2"` (nice-to-have)

5. **Document Prioritization Rationale**:
   Create a Source entity:
   ```yaml
   design_create_source --data '{
     "id": "implementation-priorities",
     "title": "Implementation Priority Assignment",
     "url": "internal",
     "summary": "P0: W01, W03 (core onboarding). P1: W02, W04 (reporting). P2: W05 (admin). Rationale: ..."
   }'
   ```

**Success Criteria**:
- All workflows have `priority` field set (P0/P1/P2)
- All capabilities have `priority` field set
- All components have `priority` field set
- P0 workflows have `validated: true`
- Prioritization rationale documented as Source entity
- Implementation order is logical (dependencies respected)
- Can filter by priority: `design_list_workflows --priority P0`

---

## Next Steps

After completing this prompt, tell the user:

**Next Prompt: 17 - Golden Path Identification**

Priorities are now assigned to all entities. The next step is to identify the **Golden Path** - the first vertical slice workflow to implement. Prompt 17 will:
- Evaluate P0 validated workflows as candidates
- Select the workflow that best establishes patterns for the entire application
- Trace all dependencies (capabilities, components, views, tokens)
- Document the implementation order for this first slice

This begins the **Implementation** phase.
