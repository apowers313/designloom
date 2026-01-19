---
title: Golden Path Identification
tags: [implementation, planning, vertical-slice]
---
**Role & Context**: You are a technical lead identifying the first vertical slice workflow for implementation. You have access to Designloom MCP tools and will select the optimal starting point.

**Objective**: Identify the Golden Path workflow - the first vertical slice to implement that establishes patterns for the entire application.

**Specific Requirements**:

1. **Understand the Golden Path**:
   The Golden Path is:
   - The highest-priority validated workflow (P0)
   - Implemented end-to-end (UI -> Logic -> Data)
   - The first complete feature users can test
   - Foundation for expanding to other workflows

2. **List P0 Validated Workflows**:
   ```
   design_list --entity_type workflow --priority P0 --validated true
   ```
   These P0 validated workflows are Golden Path candidates.

3. **Evaluate Golden Path Candidates**:
   For each P0 validated workflow, assess:

   | Criteria | Why It Matters | How to Check |
   |----------|----------------|--------------|
   | Self-contained | Can complete without other workflows | Review `requires_capabilities` |
   | Demonstrable value | Shows product's core proposition | Review `goal` |
   | Testable | Clear success criteria | Review `success_criteria` |
   | Low external deps | Minimal API/data dependencies | Review view `data_requirements` |
   | Foundation | Establishes patterns for others | Review `suggested_components` |

4. **Trace Golden Path Dependencies**:
   For the selected workflow:

   a. List required capabilities:
   ```
   design_get --entity_type workflow --id [WORKFLOW_ID]
   # Check requires_capabilities field
   ```

   b. List required components:
   ```
   # For each capability, find implementing components
   design_list --entity_type component
   # Filter by implements_capabilities
   ```

   c. List required views:
   ```
   design_list --entity_type view
   # Filter to those linked to this workflow
   ```

5. **Document Golden Path**:
   Create implementation specification:

   ```
   Golden Path: [WORKFLOW_ID] - [WORKFLOW_NAME]

   Why this workflow:
   - [Rationale for selection]

   Required entities:
   - Capabilities: [list with IDs]
   - Components: [list with IDs]
   - Views: [list with IDs]
   - Tokens: [subset needed]
   - Interactions: [patterns needed]

   Implementation order:
   1. [First: atoms]
   2. [Second: molecules]
   3. [Third: organisms]
   4. [Fourth: views]
   5. [Fifth: workflow integration]

   Success validation:
   - [Success criteria from workflow]
   ```

6. **Update Workflow**:
   ```yaml
   design_update --entity_type workflow --id [WORKFLOW_ID] --data '{
     "priority": "P0",
     "notes": "GOLDEN PATH - Implement first"
   }'
   ```

**Success Criteria**:
- One workflow identified as Golden Path
- All dependencies traced and documented
- Implementation order established (atoms -> views)
- Team agrees on selection
- Workflow has `priority: "P0"` and is marked as GOLDEN PATH in notes

---

## Next Steps

After completing this prompt, evaluate whether technical spikes are needed:

**Check the Golden Path capabilities for technical risk:**
```
design_get --entity_type workflow --id [GOLDEN_PATH_ID]
```
Review the `requires_capabilities` field and check each capability for:
- Notes mentioning "feasibility concern" or "spike needed"
- New/unfamiliar technology requirements
- Complex external integrations
- Performance-critical requirements

**If any capabilities have high technical uncertainty:**
→ Proceed to **18 - Technical Spike Planning**
   Plan time-boxed investigations to reduce risk before committing to implementation.

**If all capabilities have clear, proven implementation approaches:**
→ Skip to **19 - Vertical Slice Implementation Spec**
   Generate the complete implementation specification for the Golden Path workflow.

Tell the user which capabilities (if any) have technical risk and which path you recommend.
