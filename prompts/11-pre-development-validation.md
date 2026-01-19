---
title: Pre-Development Validation
tags: [validation, quality, review]
---
**Role & Context**: You are a design quality assurance specialist validating that design documentation is complete before prototype testing and development. You have access to Designloom MCP tools.

**Objective**: Perform comprehensive validation of all design entities to ensure readiness for prototype testing.

**Specific Requirements**:

Execute these validation checks in order:

1. **Schema Validation**:
   ```
   design_validate --check all
   ```
   - Expected: No errors
   - If errors: List each error and propose a fix

2. **Orphan Check**:
   ```
   design_validate --check orphans
   ```
   - Expected: Empty (no disconnected entities)
   - If orphans found: For each, decide to connect or delete

3. **Gap Analysis**:
   ```
   design_validate --check gaps
   ```
   - Expected: All P0/P1 workflows have capabilities, all P0/P1 capabilities have components
   - If gaps found: List missing entities to create

4. **Coverage Report**:
   ```
   design_analyze --report coverage
   ```
   - Expected: At least 80% coverage for P0 workflows
   - If below target: Identify lowest-coverage areas and prioritize fixes

5. **Test Coverage Status**:
   ```
   design_analyze --report test-coverage
   ```
   - Review which workflow-persona combinations have been tested
   - For any P0 workflows, check existing test results:
     ```
     design_list --entity_type test-result --workflow_id [WORKFLOW_ID]
     ```
   - Document baseline test status before new testing begins
   - Note any failed or partial test results that indicate design issues to address

6. **Quality Spot-Check** - For each entity type, sample 2-3 P0/P1 entities and verify:

   **Personas**:
   - Has sources linked
   - Goals are specific
   - Frustrations are from research

   **Workflows**:
   - Has at least 2 success_criteria with measurable targets
   - Linked to personas
   - Has starting_state

   **Capabilities**:
   - Has at least 3 testable requirements
   - Linked to workflows
   - Implementation-agnostic (what, not how)

   **Components**:
   - Implements at least 1 capability
   - Has props documented with types
   - Has interaction specification
   - Has category assigned (atom/molecule/organism)

   **Views**:
   - Has all states (default, empty, loading, error)
   - Has layout.type and layout.zones
   - Has data_requirements
   - Linked to workflows

7. **Generate Summary Report**:
   - Overall readiness score (%)
   - Critical issues (must fix before testing)
   - Recommended improvements (should fix)
   - P0 workflows ready for prototype testing
   - Workflows NOT ready (with reasons)
   - Test coverage status (% of workflow-persona combinations tested)
   - Any known issues from prior test results

**Success Criteria**:
- `design_validate --check all` returns no errors
- `design_validate --check orphans` returns empty
- `design_analyze --report coverage` shows at least 80% for P0 workflows
- Test coverage status documented via `design_analyze --report test-coverage`
- All critical issues identified and documented
- Clear list of P0 workflows ready for user testing

---

## Next Steps

After completing this prompt, evaluate the validation results to determine the next step:

**If validation passed (no critical issues, ≥80% coverage for P0):**
→ Proceed to **12 - Simulated Testing & Entity Updates**
   Begin testing workflows through cognitive walkthroughs and/or real user testing to validate the design before handoff.

**If critical issues were found:**
→ Return to the appropriate Design phase prompt to fix issues:
   - Token issues → **07 - Token Foundation Setup**
   - Interaction issues → **08 - Interaction Pattern Creation**
   - Component issues → **09 - Component Design**
   - View issues → **10 - View Assembly**

After fixing issues, re-run this validation prompt (11) before proceeding.

Tell the user the validation result and which path to take, listing any critical issues that need to be addressed first.
