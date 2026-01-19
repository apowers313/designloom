---
title: Implementation Progress Tracking
tags: [implementation, progress, tracking]
---
**Role & Context**: You are a project manager tracking implementation progress using Designloom data. You have access to Designloom MCP tools and will generate progress reports.

**Objective**: Track implementation progress and generate a status dashboard.

**Specific Requirements**:

1. **Run Coverage Report**:
   ```
   design_coverage_report
   ```
   Interpret results:
   - Workflow coverage: [X]% (target: >80% for P0/P1)
   - Capability coverage: [X]%
   - Component coverage: [X]%

2. **Check Implementation Status by Priority**:

   **P0 Workflows**:
   ```
   design_list_workflows --priority P0
   ```
   Check status for each:
   - [ ] W01: [Implemented/In Progress/Not Started]
   - [ ] W02: [status]

   **P1 Workflows**:
   ```
   design_list_workflows --priority P1
   ```
   - [ ] W03: [status]
   - [ ] W04: [status]

3. **Update Implementation Status**:
   For completed workflows:
   ```yaml
   design_update_workflow --id W01 --data '{
     "validated": true,
     "priority": "P0",
     "notes": "IMPLEMENTED - [date], all success criteria met"
   }'
   ```

   For in-progress:
   ```yaml
   design_update_workflow --id W02 --data '{
     "priority": "P0",
     "notes": "IN PROGRESS - [X]% complete, blocked on [issue]"
   }'
   ```

4. **Identify Blockers**:
   Common blockers to check:
   - Missing component specifications
   - Unclear capability requirements
   - Missing API documentation
   - Technical spike needed

   For each blocker:
   - Document in relevant entity notes
   - Create Source if external dependency
   - Adjust priority if blocked

5. **Generate Progress Dashboard**:
   ```
   Implementation Progress - [DATE]

   P0 Workflows: [X]/[Y] complete ([Z]%)
   ■■■■■■□□□□ 60%

   P1 Workflows: [X]/[Y] complete ([Z]%)
   ■■□□□□□□□□ 20%

   Blockers:
   - [Blocker 1]: Owner: [name], Status: [status]
   - [Blocker 2]: Owner: [name], Status: [status]

   Next to implement:
   1. [Next workflow or capability]
   2. [Following item]

   Coverage: [X]% (target: 80%)
   ```

**Success Criteria**:
- All workflow statuses current (priority field for P0/P1/P2, notes for implementation status)
- Blockers identified and documented
- Coverage trending toward target (>=80%)
- Next implementations identified
- Progress dashboard generated

---

## Next Steps

After completing this prompt, determine the next step based on implementation status:

**Evaluate the progress dashboard to determine the path:**

**If more P0/P1 workflows need implementation:**
→ Return to **19 - Vertical Slice Implementation Spec**
   Generate the implementation spec for the next workflow.

**If patterns are emerging across implemented components (3+ similar implementations):**
→ Proceed to **22 - Pattern Extraction**
   Extract reusable patterns to reduce duplication and establish consistency.

**If all P0/P1 workflows are implemented and validated:**
→ Proceed to **23 - Release Synchronization**
   Synchronize Designloom with implemented code before release.

**Summary to tell the user:**
1. Overall progress: X% of P0 complete, Y% of P1 complete
2. Blockers requiring attention (if any)
3. Recommended next prompt based on current status
4. Estimated remaining work (number of workflows left)
