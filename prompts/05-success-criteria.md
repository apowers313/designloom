---
title: Success Criteria Definition
tags: [define, workflows, metrics]
---
**Role & Context**: You are a UX researcher defining measurable success criteria for user workflows. You have access to Designloom MCP tools and will enhance existing workflow entities.

**Objective**: Ensure each workflow has at least 2 measurable success criteria using the SMART framework.

**Specific Requirements**:

1. **Retrieve existing workflows**:
   - Use `design_list_workflows` to retrieve all workflows
   - Identify workflows missing success criteria or with incomplete metrics

2. **Apply the SMART framework** for each criterion:
   - **Specific**: What exactly is measured?
   - **Measurable**: What is the numeric target?
   - **Achievable**: Is this realistic based on research/benchmarks?
   - **Relevant**: Does this matter to the user?
   - **Time-bound**: What's the context (per session, daily, etc.)?

3. **Consider common UX metrics**:
   | Metric | Description | Typical Target |
   |--------|-------------|----------------|
   | Task completion rate | % of users who complete | >85% |
   | Time on task | Duration to complete | Based on complexity |
   | Error rate | Errors per task | <3 per task |
   | Help requests | % who access help | <10% |
   | Satisfaction score | Post-task rating | >4/5 |
   | Abandonment rate | % who start but don't finish | <15% |

4. **Check existing test data** (if available):
   ```
   design_list_test_results --workflow_id [WORKFLOW_ID]
   ```
   If prior test results exist:
   - Review success_criteria_results from past tests
   - Note which criteria passed/failed and with what actual values
   - Use this data to set realistic targets (if a criterion consistently fails, consider adjusting the target or redesigning the workflow)

5. **For each workflow**:
   - Review current goal statement
   - Define at least 2 success criteria with specific targets
   - Document rationale for each metric (why it matters to the persona)
   - Specify how to measure (usability test, analytics, survey)
   - If test data exists, ensure criteria align with achievable results

6. **Update workflows** using `design_update_workflow`:
   ```yaml
   design_update_workflow --id W01 --data '{
     "success_criteria": [
       { "metric": "task_completion_rate", "target": "> 90%", "measurement": "usability test" },
       { "metric": "time_to_completion", "target": "< 120 seconds", "measurement": "analytics" }
     ]
   }'
   ```

7. **Validate the work**:
   - Run `design_validate` to confirm no errors
   - Ensure all workflows have at least 2 success criteria
   - Confirm success criteria are testable in the Validation phase
   - Note: Success criteria will be measured in usability testing (prompt 13) and captured as TestResult entities

**Success Criteria**:
- Each workflow has at least 2 success criteria with numeric targets
- Each workflow has documented starting_state
- Metrics are measurable (can be captured via testing or analytics)
- Success criteria align with any existing test data (if available)
- `design_validate` returns no errors

---

## Next Steps

After completing this prompt, tell the user:

**Next Prompt: 06 - Capability Generation from Workflows**

With workflows now having measurable success criteria, the next step is to identify what system capabilities are needed to support these workflows. Prompt 06 will:
- Analyze each workflow to identify required system capabilities
- Create capability entities using the INVEST framework
- Link capabilities to the workflows they support
- Define testable requirements for each capability

This transitions from the **Define** phase to the **Ideate** phase.
