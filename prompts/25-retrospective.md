---
title: Implementation Retrospective
tags: [release, retrospective, process]
---
**Role & Context**: You are a process improvement facilitator documenting lessons learned from the design-to-implementation cycle. You have access to Designloom MCP tools and will analyze the process for improvements.

**Objective**: Document lessons learned and establish maintenance schedule for ongoing Designloom synchronization.

**Specific Requirements**:

1. **Gather Metrics from Designloom**:
   - Total entities created: [count per type using design_list_*]
   - Entities updated during implementation: [from Source entities]
   - Deviations documented: [count Source entities with "deviation" in id]
   - Spikes conducted: [count Source entities with "spike" in id]

2. **Gather Test Metrics**:
   ```
   design_get_test_coverage
   ```
   - Test coverage percentage: [workflow-persona combinations tested]
   - Simulated tests: `design_list_test_results --test_type simulated` [count]
   - Real user tests: `design_list_test_results --test_type real` [count]
   - Pass rate: [count passed / total]
   - Failed or partial tests: `design_list_test_results --status failed` and `--status partial`
   - Total issues found: [sum of issues across all test results]

3. **Analyze What Went Well**:
   Questions to answer:
   - Which Designloom features saved development time?
   - Which entities were most useful for developers?
   - What design decisions proved correct after implementation?
   - Where did prototype testing pay off?
   - Did simulated testing (cognitive walkthroughs) correctly predict real user issues?
   - Which workflows had the highest pass rates in testing?

4. **Analyze What Could Improve**:
   Questions to answer:
   - Which entities needed frequent updates during implementation?
   - What was missing from design specifications?
   - Where did implementation reveal design gaps?
   - What Designloom fields would have helped?
   - Which workflows had the most issues in testing? (review TestResult issues)
   - Were there issues real users found that simulated testing missed?
   - Were success criteria targets realistic based on actual test results?

5. **Generate Process Recommendations**:
   Based on learnings, identify:
   - [ ] Entity fields to add/remove
   - [ ] Validation rules to change
   - [ ] Phase sequence modifications
   - [ ] Success criteria updates

6. **Document Retrospective**:
   ```yaml
   design_create_source --data '{
     "id": "retrospective-v1",
     "title": "Implementation Retrospective - v1.0",
     "url": "internal/retrospective",
     "summary": "Key learnings: [top 3]. Recommendations: [top 3 changes]."
   }'
   ```

7. **Create Retrospective Report**:
   ```markdown
   # Implementation Retrospective - [VERSION]

   ## Metrics
   - Entities created: [counts by type]
   - Development duration: [timeframe]
   - Rework rate: [% of entities updated post-handoff]

   ## Test Metrics
   - Test coverage: [X%] of workflow-persona combinations tested
   - Simulated tests: [count] | Real user tests: [count]
   - Pass rate: [X%] (passed: X, failed: X, partial: X)
   - Issues found: [total count across all tests]

   ## What Went Well
   1. [Learning 1 - specific example]
   2. [Learning 2 - specific example]

   ## What Could Improve
   1. [Issue 1] → Recommendation: [specific fix]
   2. [Issue 2] → Recommendation: [specific fix]

   ## Testing Insights
   - Did simulated tests predict real issues? [yes/no with examples]
   - Most common issue types: [list]
   - Workflows needing redesign: [list based on failed tests]

   ## Process Changes for Next Project
   1. [Specific change to adopt]
   2. [Specific change to adopt]

   ## Designloom Improvements
   1. [Suggestion for tool enhancement]
   2. [Suggestion for tool enhancement]
   ```

8. **Establish Maintenance Schedule**:
   ```
   Maintenance Schedule:
   - Weekly: Run design_validate, check for drift
   - Monthly: Run design_find_orphans, review coverage
   - Per release: Full synchronization (prompt 23)
   - Annually: Process retrospective
   ```

**Success Criteria**:
- Metrics gathered from Designloom (entities and test results)
- Test metrics analyzed via `design_get_test_coverage`
- Learnings documented with specific examples
- Testing insights included (simulated vs real test comparison)
- Recommendations are actionable
- Maintenance schedule established
- Retrospective documented as Source entity

---

## Next Steps

**The design-to-implementation cycle is complete.**

After completing this prompt, tell the user:

This release cycle is finished. The Designloom workflow has taken you from research through implementation to release. Here are your options going forward:

**For the next version or major feature:**
→ Start fresh at **01 - Research Synthesis**
   Conduct new research for the next set of features or user needs.

**For incremental feature additions to the existing product:**
→ Use **27 - New Feature Addition**
   Add features following established Designloom patterns without full research cycle.

**For ongoing maintenance:**
Follow the maintenance schedule established in this retrospective:
- Weekly: Run `design_validate`, check for drift
- Monthly: Run `design_find_orphans`, review coverage
- Per release: Run prompt 23 (Release Synchronization)
- Annually: Run prompt 25 (Retrospective)

**Utility prompts available at any time:**
- **26** - Impact Analysis (before making changes)
- **28** - Entity Quality Review (audit specific entity types)
- **29** - Accessibility Audit (WCAG compliance check)
- **30-32** - Meta-prompts for improving the process itself
