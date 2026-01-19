---
title: Release Synchronization
tags: [release, synchronization, documentation]
---
**Role & Context**: You are a release manager synchronizing Designloom entities with implemented code before release. You have access to Designloom MCP tools and will ensure design documentation matches production.

**Objective**: Synchronize Designloom entities with implemented code to eliminate drift before release.

**Specific Requirements**:

1. **Final Validation**:
   ```
   design_validate --check all
   design_validate --check orphans
   design_analyze --report coverage
   ```
   Expected:
   - No validation errors
   - No orphan entities
   - 100% coverage for P0/P1

2. **Entity Audit**:
   For each entity type, compare Designloom to implementation:

   **Workflows**:
   ```
   design_list --entity_type workflow
   ```
   - [ ] All implemented workflows marked `validated: true`
   - [ ] Success criteria reflect actual measurements
   - [ ] Starting states match real-world usage

   **Components**:
   ```
   design_list --entity_type component
   ```
   - [ ] Props match implemented TypeScript interfaces
   - [ ] Deprecated components removed
   - [ ] New components added during implementation documented

   **Views**:
   ```
   design_list --entity_type view
   ```
   - [ ] Layouts match implemented pages
   - [ ] States match implemented behavior
   - [ ] Routes match actual URLs

   **Tokens**:
   ```
   design_list --entity_type tokens
   ```
   - [ ] Values match CSS custom properties
   - [ ] No hardcoded values in implementation

3. **Update Drift**:
   For each discrepancy:
   - Determine source of truth (design intent vs implementation reality)
   - If implementation is correct, update Designloom
   - If design is correct, file bug for implementation

   ```yaml
   # Update Designloom to match implementation
   design_update --entity_type component --id [ID] --data '{...updated...}'

   # Document intentional deviation
   design_create --entity_type source --id deviation-[id] --title "Implementation Deviation - [Entity]" --summary "Implementation differs from original design because [reason]. Approved by [who]."
   ```

4. **Mark Final Status**:
   ```yaml
   design_update --entity_type workflow --id W01 --data '{
     "validated": true,
     "priority": "P0",
     "notes": "RELEASED v1.0 - All success criteria met"
   }'
   ```

**Success Criteria**:
- `design_validate --check all` returns no errors
- `design_validate --check orphans` returns empty
- `design_analyze --report coverage` shows 100% for P0/P1
- All P0/P1 workflows have `validated: true`
- Designloom entities match implemented code (no drift)

---

## Next Steps

After completing this prompt, tell the user:

**Next Prompt: 23 - Documentation Generation**

Designloom is now synchronized with the implemented code. The next step is to generate the release documentation package. Prompt 23 will:
- Generate architecture diagrams (if export tools available)
- Create component catalog with props and accessibility
- Generate style guide from token values
- Document user flows for all P0/P1 workflows
- Create test specifications

This documentation package will accompany the release.
