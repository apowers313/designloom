---
title: Workflow Creation from Personas
tags: [define, workflows, journeys]
variables:
  - name: researchFile
    type: file
    message: "Select the research synthesis file from the Discovery phase:"
    required: true
    filter: "*.md"
---
**Role & Context**: You are a UX designer defining user workflows based on research-validated personas. You have access to Designloom MCP tools and will build on existing persona entities.

**Objective**: Create workflow entities that represent key user journeys for personas already in Designloom.

**Research Context**:
Read and reference: {{researchFile}}
Use this to ensure workflows address tasks identified in research and success criteria align with research benchmarks.

**Specific Requirements**:

1. **Retrieve and analyze existing personas**:
   - Use `design_list_personas` to retrieve all personas
   - For each persona, identify goals that would require workflows
   - A workflow is needed when the goal involves multiple steps, has measurable success, and has clear start/end states

2. **For each workflow, think step-by-step**:
   - What is the persona trying to accomplish? (goal)
   - How do we know they succeeded? (success_criteria)
   - What's true when they start? (starting_state)
   - Is this workflow distinct from others? (unique value)

3. **Create workflow entities** using `design_create_workflow` with:
   - `id`: W01, W02, etc. (sequential)
   - `name`: Action-oriented name (e.g., "First Data Import" not "Data Loading")
   - `category`: onboarding/analysis/exploration/reporting/collaboration/administration
   - `goal`: Single clear statement from user's perspective
   - `personas`: Link to all personas who perform this workflow
   - `success_criteria`: At least 2 SMART metrics with specific targets
   - `starting_state`: Context when workflow begins (data_type, user_expertise, prior_context)
   - `validated`: false (not yet tested)

4. **Define measurable success criteria** using:
   - Task completion rate (% of users who complete) - target typically >85%
   - Time on task (seconds/minutes to complete)
   - Error rate (errors per task) - target typically <3
   - Help requests (% who access help) - target typically <10%

5. **Validate the work**:
   - Run `design_validate` to confirm no errors
   - Run `design_find_orphans` to verify no orphan personas
   - Ensure each workflow is testable (could run a usability test measuring success criteria)

**Format & Structure**:
```yaml
design_create_workflow --data '{
  "id": "W01",
  "name": "First Data Import",
  "category": "onboarding",
  "goal": "Import data from external source and verify it loaded correctly",
  "personas": ["analyst-alex", "manager-maria"],
  "success_criteria": [
    { "metric": "task_completion_rate", "target": "> 90%" },
    { "metric": "time_to_completion", "target": "< 60 seconds" }
  ],
  "starting_state": {
    "data_type": "CSV or Excel file",
    "user_expertise": "familiar with spreadsheets",
    "prior_context": "first time using the application"
  },
  "validated": false
}'
```

6. **Verify research traceability** (reflexion step):
   After creating all workflows, verify alignment with research:

   **Forward Check (Research → Workflows)**:
   - Review the research file's "Key Findings" section for user goals and behavior patterns
   - For each major task or goal identified in research, confirm a workflow addresses it
   - Check if research mentioned any benchmarks (e.g., "users expect this in <30 seconds") and incorporate into success_criteria

   **Backward Check (Workflows → Research)**:
   - For each workflow created, verify:
     - The goal aligns with persona goals (which trace to research)
     - Success criteria targets are informed by research where data exists
     - Personas linked are the correct ones per research segments
   - Flag any workflows that seem disconnected from research

   **Quick Traceability Table**:
   ```
   | Research Goal/Task | Workflow Created | Personas Linked | Research-Informed Criteria |
   |--------------------|------------------|-----------------|---------------------------|
   | [Goal from research] | W01 | [persona-ids] | Yes: time target from S2 |
   | [Task from research] | W02 | [persona-ids] | No benchmark in research |
   ```

   If gaps are found:
   - Missing workflow for a research task → Create additional workflow
   - No research basis for success criteria → Mark as assumption, consider research gap

**Success Criteria**:
- At least 1 workflow per persona
- Each workflow has at least 2 success criteria with measurable targets
- Each workflow has documented starting_state
- `design_validate` returns no errors
- `design_find_orphans` returns no orphan personas
- Traceability table completed showing research alignment
- All major research-identified tasks have corresponding workflows

---

## Next Steps

After completing this prompt, tell the user:

**Next Prompt: 05 - Success Criteria Definition**

Workflows have been created, but success criteria may need refinement to ensure they are fully SMART (Specific, Measurable, Achievable, Relevant, Time-bound). Prompt 05 will:
- Review each workflow's success criteria
- Apply the SMART framework to ensure measurability
- Add common UX metrics where appropriate (task completion rate, time on task, error rate)
- Ensure criteria are testable in the Validation phase
