---
title: Implementation Validation Against Design
tags: [implementation, validation, qa]
---
**Role & Context**: You are a QA engineer validating that implementation matches Designloom specifications. You have access to Designloom MCP tools and will compare implementation against design.

**Objective**: Validate implementation of the next workflow needing validation against Designloom specifications.

**Specific Requirements**:

1. **Select Workflow to Validate**:

   Auto-select the next workflow needing validation using this priority order:

   **Step 1: Find implemented workflows lacking validation**
   ```
   design_list --entity_type workflow --priority P0
   ```
   For each P0 workflow, check:
   - Has "IMPLEMENTED" or "IN PROGRESS" in notes
   - Does NOT have "VALIDATED" in notes

   For candidates, check test coverage:
   ```
   design_list --entity_type test-result --workflow_id [WORKFLOW_ID]
   ```
   Filter to workflows that:
   - Have no TestResult with `test_type: "real"` and `status: "passed"`
   - OR have TestResult older than implementation date
   - OR have TestResult with `status: "failed"` or `status: "partial"`

   If found → select the first matching workflow.

   **Step 2: Check P1 workflows if no P0 need validation**
   ```
   design_list --entity_type workflow --priority P1
   ```
   Apply same filters as Step 1.

   **Step 3: If no workflows need validation**
   Report that all implemented workflows have been validated. Recommend:
   - Running prompt 18 to implement the next workflow
   - Running prompt 20 to check overall progress

   **Document Selection**:
   ```
   Selected Workflow: [ID] - [NAME]
   Selection Reason: [No TestResult | Failed TestResult | Outdated TestResult]
   Last Test: [TestResult ID and date, if any]
   Implementation Status: [From notes field]
   ```

2. **Component Interface Validation**:
   For each implemented component, retrieve spec:
   ```
   design_get --entity_type component --id [COMPONENT_ID]
   ```
   Compare implemented props to Designloom props:
   - [ ] All required props implemented
   - [ ] Prop types match specification
   - [ ] Default values match specification
   - [ ] No extra undocumented props (unless justified)

3. **Visual Validation**:
   Compare implementation to tokens:
   ```
   design_list --entity_type tokens
   ```
   Check:
   - [ ] Colors match token values (no hardcoded hex colors)
   - [ ] Typography matches token values
   - [ ] Spacing matches token values
   - [ ] No hardcoded values that should be tokens

4. **Interaction Validation**:
   Compare implementation to interaction specifications:
   ```
   design_list --entity_type interaction
   ```
   Verify:
   - [ ] All states implemented (default, hover, focus, disabled, etc.)
   - [ ] Transitions match specification
   - [ ] Timing matches token durations
   - [ ] Accessibility requirements met

5. **Layout Validation**:
   Compare implementation to view specifications:
   ```
   design_get --entity_type view --id [VIEW_ID]
   ```
   Check:
   - [ ] Layout type matches (single-column, sidebar-left, etc.)
   - [ ] Components in correct zones
   - [ ] Responsive behavior matches breakpoints
   - [ ] All states implemented (default, empty, loading, error)

6. **Success Criteria Validation**:
   ```
   design_get --entity_type workflow --id [SELECTED_WORKFLOW_ID]
   ```
   Measure against success_criteria:
   - [ ] Task completion rate: [actual] vs [target]
   - [ ] Time on task: [actual] vs [target]
   - [ ] Error rate: [actual] vs [target]

7. **Check Prior Test Results**:
   ```
   design_list --entity_type test-result --workflow_id [SELECTED_WORKFLOW_ID]
   ```
   Review any existing test results for this workflow to understand:
   - Known issues from prior testing
   - Which personas have been tested
   - Previous success criteria results

8. **Record Validation as TestResult**:
   Create a formal test result to document this validation:
   ```yaml
   design_create --entity_type test-result --id TR-[WORKFLOW_ID]-[persona-id]-[sequence] --workflow_id [WORKFLOW_ID] --persona_id [relevant-persona] --test_type real --date [TODAY] --status [passed|failed|partial] --confidence high --success_criteria_results '[
     { "criterion": "Task completion rate", "target": "[target]", "actual": "[actual]", "passed": true/false },
     { "criterion": "Time on task", "target": "[target]", "actual": "[actual]", "passed": true/false }
   ]' --issues '[
     { "severity": "major|minor|critical", "description": "...", "workflow_step": "...", "affected_components": ["..."], "recommendation": "..." }
   ]' --summary "Validation summary"
   ```

9. **Update Workflow Status**:
   Based on validation results:

   **If PASSED**:
   ```yaml
   design_update --entity_type workflow --id [SELECTED_WORKFLOW_ID] --validated true --notes "IMPLEMENTED - VALIDATED [DATE]. All success criteria met. TestResult: TR-[ID]"
   ```

   **If FAILED or PARTIAL**:
   ```yaml
   design_update --entity_type workflow --id [SELECTED_WORKFLOW_ID] --notes "IMPLEMENTED - VALIDATION FAILED [DATE]. Issues: [summary]. TestResult: TR-[ID]"
   ```

10. **Update Designloom with Learnings**:
    If implementation revealed issues or required changes:
    ```yaml
    # Update component if props changed
    design_update --entity_type component --id [ID] --props '{"...updated..."}'

    # Document deviation
    design_create --entity_type source --id impl-deviation-[component-id] --title "Implementation Deviation - [Component]" --summary "Changed X because Y. Approved by [who]."
    ```

11. **Generate Validation Report**:
    ```
    Validation Report: [WORKFLOW_ID] - [NAME]
    Date: [DATE]

    | Check | Status | Notes |
    |-------|--------|-------|
    | Component interfaces | Pass/Fail | |
    | Token usage | Pass/Fail | |
    | Interactions | Pass/Fail | |
    | Layout | Pass/Fail | |
    | Accessibility | Pass/Fail | |
    | Success criteria | Pass/Fail | |

    **Overall: PASS / NEEDS FIXES**

    **Test Result ID**: TR-[WORKFLOW_ID]-[persona]-[sequence]
    ```

**Success Criteria**:
- Workflow auto-selected with documented rationale
- Implementation matches Designloom specifications
- All deviations documented with rationale
- Success criteria measurements captured as TestResult entity
- Designloom updated with any learnings
- Workflow status updated based on validation result
- `design_validate --check all` returns no errors
- TestResult created with `design_create --entity_type test-result`

---

## Next Steps

After completing this prompt, determine the next step based on implementation status:

**Check remaining work:**
```
design_list --entity_type workflow --priority P0
design_list --entity_type workflow --priority P1
```

**If more workflows need implementation (not marked IMPLEMENTED):**
→ Return to **18 - Vertical Slice Implementation Spec**
   Generate the implementation spec for the next workflow in the queue.

**If all P0/P1 workflows are implemented but need tracking/review:**
→ Proceed to **20 - Implementation Progress Tracking**
   Generate a progress dashboard and identify any blockers.

**Summary to tell the user:**
1. Validation result for this workflow (PASS/FAIL)
2. Number of workflows remaining to implement
3. Number of workflows remaining to validate
4. Recommended next prompt and reasoning
