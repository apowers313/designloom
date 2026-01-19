---
title: Vertical Slice Implementation Spec
tags: [implementation, vertical-slice, spec]
---
**Role & Context**: You are a technical lead generating implementation specifications from Designloom design data. You have access to Designloom MCP tools and will create a complete implementation spec for a vertical slice.

**Objective**: Generate a complete implementation specification for the next workflow ready for implementation.

**Understanding Vertical Slices**:
Build one complete feature (UI -> Logic -> Data) instead of horizontal layers:
```
Traditional (Risky):          Vertical Slice (Lower Risk):
┌─────────────────────┐       ┌─────┐ ┌─────┐ ┌─────┐
│      All UI         │       │ UI  │ │ UI  │ │ UI  │
├─────────────────────┤       ├─────┤ ├─────┤ ├─────┤
│     All Logic       │  →    │Logic│ │Logic│ │Logic│
├─────────────────────┤       ├─────┤ ├─────┤ ├─────┤
│      All Data       │       │Data │ │Data │ │Data │
└─────────────────────┘       └─────┘ └─────┘ └─────┘
                              Feat 1  Feat 2  Feat 3
```

**Specific Requirements**:

1. **Select Workflow to Implement**:

   Auto-select the next workflow using this priority order:

   **Step 1: Check for Golden Path**
   ```
   design_list --entity_type workflow --priority P0
   ```
   Look for workflow with "GOLDEN PATH" in notes that is NOT marked "IMPLEMENTED".
   If found → select this workflow.

   **Step 2: Find next P0 validated workflow**
   ```
   design_list --entity_type workflow --priority P0 --validated true
   ```
   Filter results:
   - Exclude workflows with "IMPLEMENTED" in notes
   - Exclude workflows with "IN PROGRESS" in notes (already being worked on)
   - Prefer workflows with fewer unimplemented dependencies

   If found → select the first matching workflow.

   **Step 3: Fall back to P1 if no P0 available**
   ```
   design_list --entity_type workflow --priority P1 --validated true
   ```
   Apply same filters as Step 2.

   **Step 4: If no validated workflows available**
   Report that no workflows are ready for implementation. Recommend running:
   - Prompt 11 (Pre-Development Validation) to identify issues
   - Prompt 12 (Testing) to validate workflows

   **Document Selection**:
   ```
   Selected Workflow: [ID] - [NAME]
   Selection Reason: [Golden Path | Next P0 validated | Next P1 validated]
   Skipped Workflows: [List any skipped and why]
   ```

2. **Get Workflow Definition**:
   ```
   design_get --entity_type workflow --id [SELECTED_WORKFLOW_ID]
   ```
   Extract: goal, success criteria, starting state, required capabilities, target personas

3. **Get View Specifications**:
   ```
   design_list --entity_type view
   ```
   Filter to views linked to this workflow. For each view extract:
   - Layout type and zones
   - Components per zone
   - All states (default, loading, error, empty)
   - Routes and data requirements

4. **Get Component Specifications**:
   For each component in views:
   ```
   design_get --entity_type component --id [COMPONENT_ID]
   ```
   Extract: props with types, dependencies, interaction pattern, accessibility

5. **Get Token Values**:
   ```
   design_list --entity_type tokens
   ```
   Extract values needed for: colors, typography, spacing, motion

6. **Generate Implementation Spec**:
   ```
   Workflow: [ID] - [NAME]
   Priority: [P0/P1/P2]
   Validated: [true/false]

   User Goal: [goal statement from workflow]

   Success Criteria:
   - metric: [metric]
     target: [target]
     how_to_measure: [method]

   Views to Build:
   - [VIEW_ID]:
       route: [path]
       layout: [type]
       components: [list]
       states: [default, loading, error, empty]

   Components to Build (in order):
   1. Atoms:
      - [COMPONENT_ID]: [props interface]
   2. Molecules:
      - [COMPONENT_ID]: [props interface, dependencies]
   3. Organisms:
      - [COMPONENT_ID]: [props interface, dependencies]

   Tokens Needed:
   - colors: [list of used colors]
   - typography: [list of used typography]
   - spacing: [list of used spacing]
   - motion: [list of used motion]

   Acceptance Tests:
   - [ ] [Success criterion 1 from workflow]
   - [ ] [Success criterion 2]
   - [ ] [Accessibility requirements met]
   ```

7. **Update Workflow Status**:
   Mark the workflow as in progress:
   ```yaml
   design_update --entity_type workflow --id [SELECTED_WORKFLOW_ID] --data '{
     "notes": "IN PROGRESS - Implementation spec generated [DATE]"
   }'
   ```

**Success Criteria**:
- Workflow auto-selected with documented rationale
- Complete implementation spec generated
- All dependencies traced
- Implementation order follows atomic design (atoms -> molecules -> organisms -> views)
- Acceptance tests derived from workflow success criteria
- Workflow marked as IN PROGRESS

---

## Next Steps

After completing this prompt, tell the user:

**Next Prompt: 19 - Implementation Validation Against Design**

The implementation specification has been generated. After the development team implements this vertical slice, use prompt 19 to validate that the implementation matches the Designloom specifications. Prompt 19 will:
- Auto-select the next implemented workflow needing validation
- Compare implementation against component, token, and interaction specs
- Verify success criteria are met
- Record results as a TestResult entity

**Implementation happens between prompts 18 and 19.** The user should:
1. Share this implementation spec with developers
2. Wait for implementation to complete
3. Run prompt 19 to validate the implementation
