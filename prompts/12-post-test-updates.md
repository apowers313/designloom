---
title: Simulated Testing & Entity Updates
tags: [validation, testing, iteration]
variables:
  - name: realTestResults
    type: editor
    message: "Optional: Paste real user testing results if available (participants, completion rates, quotes). Leave empty to run AI-simulated testing only."
    required: false
---
**Role & Context**: You are a UX researcher conducting persona-based cognitive walkthroughs and incorporating test findings into design documentation. You have access to Designloom MCP tools and will run simulated tests, create TestResult entities, and update design entities based on findings.

**Objective**: Test all workflow-persona combinations through simulated cognitive walkthroughs (and optionally real user testing), record formal TestResult entities, and update design entities based on findings.

{{#if realTestResults}}
**Real User Testing Results**:
{{realTestResults}}
{{/if}}

---

## Testing Approach

This prompt supports two modes:
1. **Simulated Testing** (AI-driven): You adopt each persona's mindset and walk through workflows to identify issues
2. **Real Testing** (if provided): Incorporate actual user testing data

Simulated testing is NOT a replacement for real user testing, but it catches design issues early and provides baseline coverage. TestResult entities track both types with different confidence levels.

---

## Phase 1: Assess Current Test Coverage

First, understand what needs testing:

```
design_analyze --report test-coverage
design_list --entity_type workflow
design_list --entity_type persona
```

Identify:
- Which workflow-persona combinations are untested
- Which workflows are priority (P0 workflows should be tested first)
- Which personas are primary users of each workflow

---

## Phase 2: Run Simulated Testing

For each untested workflow-persona combination, conduct a cognitive walkthrough:

### 2.1 Retrieve Full Context

For each test, retrieve:
```
design_get --entity_type workflow --id [workflow_id]
design_get --entity_type persona --id [persona_id]
```

### 2.2 Adopt the Persona

Before walking through the workflow, internalize:
- **Goals**: What does this persona want to accomplish?
- **Expertise**: What's their skill level?
- **Frustrations**: What already annoys them?
- **Context**: What devices, environment, time constraints?

### 2.3 Walk Through the Workflow

For each step in the workflow, ask from the persona's perspective:
- **Will they know what to do?** (Discoverability)
- **Will they know they did it right?** (Feedback)
- **Can they complete it given their expertise level?** (Capability match)
- **Does this align with their goals?** (Goal alignment)
- **Does this trigger their known frustrations?** (Friction)
- **Is the success criterion achievable for them?** (Realistic targets)

### 2.4 Evaluate Success Criteria

For each success criterion in the workflow:
- Can this persona realistically meet this target?
- What might prevent them from meeting it?
- Would they consider this "success"?

### 2.5 Identify Issues

Document issues with:
- **Severity**: critical (blocks completion), major (significant friction), minor (small annoyance)
- **Description**: What's the problem?
- **Workflow step**: Where does it occur?
- **Persona factor**: What about this persona makes this an issue?
- **Affected components/capabilities**: What needs to change?
- **Recommendation**: How might we fix it?

### 2.6 Create TestResult Entity

```yaml
design_create --entity_type test-result --id TR-[WorkflowID]-[PersonaID]-001 --workflow_id [WorkflowID] --persona_id [PersonaID] --test_type simulated --date [TODAY] --status [passed|failed|partial] --confidence medium --success_criteria_results '[
  { "criterion": "...", "target": "...", "passed": true/false, "notes": "..." }
]' --issues '[
  { "severity": "major", "description": "...", "workflow_step": "...", "persona_factor": "...", "recommendation": "..." }
]' --summary "Brief narrative of the test" --recommendations '["Fix X", "Consider Y"]'
```

---

## Phase 3: Incorporate Real Test Results (If Provided)

{{#if realTestResults}}
For real user testing data provided above:

1. **Parse the results** to extract:
   - Which workflows were tested
   - Which user segments (map to personas)
   - Completion rates and times
   - Errors observed
   - User quotes

2. **Create TestResult entities** with `test_type: "real"` and `confidence: "high"`:
   ```yaml
   design_create --entity_type test-result --id TR-[WorkflowID]-[PersonaID]-002 --workflow_id [WorkflowID] --persona_id [PersonaID] --test_type real --date [TEST_DATE] --status [passed|failed|partial] --confidence high --participants [N] --quotes '["User quote 1", "User quote 2"]' --success_criteria_results '[...]' --issues '[...]'
   ```

3. **Compare with simulated results**:
   - Did real testing find the same issues?
   - Did real testing reveal issues simulation missed?
   - Update simulated test confidence based on validation
{{/if}}

---

## Phase 4: Update Design Entities Based on Findings

For each issue identified (from simulated or real testing):

### 4.1 Workflow Updates
- **Goal unclear**: Refine goal statement
- **Success criteria unrealistic**: Adjust targets based on test data
- **Starting state assumptions wrong**: Update starting_state
- **Workflow validated**: If 5+ real users passed, set `validated: true`

```yaml
design_update --entity_type workflow --id W01 --data '{
  "validated": true,
  "success_criteria": [
    { "metric": "task_completion_rate", "target": "> 85%" },
    { "metric": "time_to_completion", "target": "< 90 seconds" }
  ]
}'
```

### 4.2 Capability Updates
- **Requirements unclear**: Refine requirement language
- **Requirements unmet**: Note blockers or adjust
- **Missing capability**: Create new capability

### 4.3 Component Updates
- **Interaction confusing**: Update props, states, or interaction pattern
- **Missing component**: Create new component
- **Accessibility issue**: Update accessibility properties

### 4.4 Persona Updates
- **New frustration discovered**: Add to frustrations array with test source
- **Behavior assumption wrong**: Update characteristics

```yaml
design_update --entity_type persona --id analyst-alex --data '{
  "frustrations": [
    "Existing frustration",
    "New: Progress indicator unclear during import (discovered in testing)"
  ],
  "sources": [
    { "title": "Simulated Test TR-W01-analyst-alex-001", "url": "internal://test-result/TR-W01-analyst-alex-001", "summary": "Cognitive walkthrough revealed confusion at step 3" }
  ]
}'
```

---

## Phase 5: Validate and Report

1. **Run validation**:
   ```
   design_validate --check all
   design_analyze --report test-coverage
   ```

2. **Generate summary report**:
   ```markdown
   ## Testing Summary

   ### Coverage
   - Workflows tested: X/Y
   - Personas covered: X/Y
   - Combinations tested: X/Y (Z%)

   ### Results by Workflow
   | Workflow | Status | Issues | Confidence |
   |----------|--------|--------|------------|
   | W01 | passed | 0 critical, 1 major | medium (simulated) |
   | W02 | partial | 1 critical, 2 major | high (real + simulated) |

   ### Critical Issues
   1. [Issue] in [Workflow] for [Persona] — Recommendation: [Fix]

   ### Design Updates Made
   - Updated W01 success criteria
   - Added frustration to analyst-alex
   - Created new component: progress-indicator

   ### Remaining Gaps
   - [ ] W03 needs real user testing
   - [ ] New persona needed for edge case users
   ```

---

## Success Criteria

- [ ] All P0 workflows have TestResult entities (simulated at minimum)
- [ ] Critical issues have recommendations
- [ ] Design entities updated to reflect test findings
- [ ] Test sources embedded in updated entities
- [ ] `design_validate --check all` returns no errors
- [ ] `design_analyze --report test-coverage` shows improved coverage
{{#if realTestResults}}- [ ] Real test results recorded with `test_type: "real"` and high confidence
- [ ] Workflows with 5+ real user passes marked `validated: true`{{/if}}

---

## Next Steps

After completing this prompt, evaluate the test results to determine the next step:

**If all P0 workflows passed testing (no critical issues):**
→ Proceed to **14 - Handoff Preparation**
   Prepare the design documentation package for development handoff.

**If critical issues were found during testing:**
→ Return to the appropriate Design phase prompt to fix issues:
   - Workflow goal/criteria issues → **04 - Workflow Creation** or **05 - Success Criteria**
   - Capability issues → **06 - Capability Generation** or **07 - Capability Refinement**
   - Component issues → **10 - Component Design**
   - View issues → **11 - View Assembly**

After fixing issues, re-run validation (**12**) and testing (**13**) to confirm fixes.

**Summary to tell the user:**
1. Test coverage achieved (X% of workflow-persona combinations)
2. Overall pass/fail status for P0 workflows
3. Critical issues requiring design changes (if any)
4. Recommended next prompt and reasoning
