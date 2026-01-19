---
title: Capability Generation from Workflows
tags: [ideate, capabilities, features]
variables:
  - name: researchFile
    type: file
    message: "Select the research synthesis file from the Discovery phase:"
    required: true
    filter: "*.md"
---
**Role & Context**: You are a product designer generating implementation-agnostic capabilities from user workflows. You have access to Designloom MCP tools and will build on existing workflow entities.

**Objective**: Analyze workflows and generate capabilities needed to support them, applying the INVEST framework.

**Research Context**:
Read and reference: {{researchFile}}
Use this to inform capability generation:
- Competitive landscape: What capabilities do competitors offer?
- User requests: What features did research participants ask for?
- Pain points: What capabilities would address documented frustrations?

**Specific Requirements**:

1. **Retrieve and analyze existing workflows**:
   - Use `design_list_workflows` to retrieve all workflows
   - For each workflow, think step-by-step:
     - What steps must the user take to complete this workflow?
     - What must the system be able to DO for each step?
     - Is each capability implementation-agnostic (what, not how)?

2. **Understand what a capability is**:
   - A system feature described functionally (what it does)
   - NOT a UI element (that's a component)
   - NOT an implementation detail (that's technical design)
   - TESTABLE (you can verify it works)

3. **Apply the INVEST framework**:
   - **Independent**: Can implement without other capabilities
   - **Negotiable**: Details can be discussed
   - **Valuable**: Serves a user workflow
   - **Estimable**: Clear enough to estimate
   - **Small**: Not epic-sized (weeks of work)
   - **Testable**: Clear criteria for "done"

4. **Create capability entities** using `design_create_capability` with:
   - `id`: kebab-case (e.g., "data-import", "search-filter")
   - `name`: Clear, concise name
   - `category`: data/visualization/analysis/interaction/export/collaboration/performance
   - `description`: What it does (not how)
   - `requirements`: At least 3 testable requirements
   - `used_by_workflows`: Link to workflows that need it
   - `status`: "planned"
   - `priority`: P0 (critical), P1 (important), or P2 (nice-to-have)
   - `notes`: Feasibility concerns or additional context (optional)

5. **Group related capabilities** to avoid overlap:
   - If two capabilities always go together, consider merging them
   - Ensure each capability has distinct value

6. **Validate the work**:
   - Run `design_validate` to confirm no errors
   - Run `design_find_orphans` to verify no orphan capabilities
   - Run `design_find_gaps` to identify and document any acceptable gaps

**Format & Structure**:
```yaml
design_create_capability --data '{
  "id": "data-import",
  "name": "Data Import",
  "category": "data",
  "description": "Import data from external files into the application",
  "requirements": [
    "Support CSV files up to 100MB",
    "Support Excel files (.xlsx, .xls)",
    "Provide progress indicator during import",
    "Report validation errors with line numbers"
  ],
  "used_by_workflows": ["W01", "W02"],
  "status": "planned",
  "priority": "P0",
  "notes": "Required for core onboarding workflow"
}'
```

**Success Criteria**:
- Every workflow has at least 1 required capability
- Each capability has at least 3 testable requirements
- Each capability linked to at least 1 workflow
- `design_find_orphans` returns no orphan capabilities
- `design_validate` returns no errors
- Capabilities address key pain points from research
- Competitive gaps identified in research are considered

---

## Next Steps

After completing this prompt, evaluate the quality of capability requirements to determine the next step:

**Review the capabilities you created:**
```
design_list_capabilities
```

For each capability, check:
- Does it have at least 3 specific, testable requirements?
- Do requirements cover happy path, error cases, and edge cases?
- Are requirements clear and unambiguous (IEEE standard)?

**If any capabilities have vague or incomplete requirements:**
→ Proceed to **07 - Capability Requirements Refinement**
   This prompt will apply IEEE requirement standards to ensure all capabilities have clear, complete, testable requirements.

**If all capabilities already have well-defined requirements:**
→ Skip to **08 - Token Foundation Setup**
   Begin the Design phase by establishing the visual design language (colors, typography, spacing, motion).

Tell the user which path you recommend based on your assessment of the capabilities.
