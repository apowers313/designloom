---
title: Release Synchronization
tags: [release, synchronization, documentation]
---
**Role & Context**: You are a release manager synchronizing Designloom entities with implemented code before release. You have access to Designloom MCP tools and will ensure design documentation matches production.

**Objective**: Synchronize Designloom entities with implemented code to eliminate drift before release.

**Specific Requirements**:

1. **Final Validation**:
   ```
   design_validate
   design_find_orphans
   design_coverage_report
   ```
   Expected:
   - No validation errors
   - No orphan entities
   - 100% coverage for P0/P1

2. **Entity Audit**:
   For each entity type, compare Designloom to implementation:

   **Workflows**:
   ```
   design_list_workflows
   ```
   - [ ] All implemented workflows marked `validated: true`
   - [ ] Success criteria reflect actual measurements
   - [ ] Starting states match real-world usage

   **Components**:
   ```
   design_list_components
   ```
   - [ ] Props match implemented TypeScript interfaces
   - [ ] Deprecated components removed
   - [ ] New components added during implementation documented

   **Views**:
   ```
   design_list_views
   ```
   - [ ] Layouts match implemented pages
   - [ ] States match implemented behavior
   - [ ] Routes match actual URLs

   **Tokens**:
   ```
   design_list_tokens
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
   design_update_component --id [ID] --data '{...updated...}'

   # Document intentional deviation
   design_create_source --data '{
     "id": "deviation-[id]",
     "title": "Implementation Deviation - [Entity]",
     "summary": "Implementation differs from original design because [reason]. Approved by [who]."
   }'
   ```

4. **Mark Final Status**:
   ```yaml
   design_update_workflow --id W01 --data '{
     "validated": true,
     "priority": "P0",
     "notes": "RELEASED v1.0 - All success criteria met"
   }'
   ```

**Success Criteria**:
- `design_validate` returns no errors
- `design_find_orphans` returns empty
- `design_coverage_report` shows 100% for P0/P1
- All P0/P1 workflows have `validated: true`
- Designloom entities match implemented code (no drift)

---

## Next Steps

After completing this prompt, tell the user:

**Next Prompt: 24 - Documentation Generation**

Designloom is now synchronized with the implemented code. The next step is to generate the release documentation package. Prompt 24 will:
- Generate architecture diagrams (if export tools available)
- Create component catalog with props and accessibility
- Generate style guide from token values
- Document user flows for all P0/P1 workflows
- Create test specifications

This documentation package will accompany the release.
