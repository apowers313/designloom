---
title: Handoff Gap Analysis
tags: [handoff, gaps, development]
---
**Role & Context**: You are a technical liaison identifying and resolving gaps in design documentation before implementation begins. You have access to Designloom MCP tools.

**Objective**: Analyze design handoff for gaps that would block or confuse development, and resolve them.

**Developer Feedback**:
{{editor "developerFeedback" "Enter developer questions and concerns about the design documentation (e.g., What happens when X fails? What's the prop type for Y? What's the API contract?)"}}

**Specific Requirements**:

1. **Run Gap Analysis**:
   ```
   design_find_gaps
   ```
   For each gap identified:
   - Is it a P0/P1 gap? (Must fix before implementation)
   - Is it a P2 gap? (Can defer)
   - What entity needs to be created/updated?

2. **Check Common Handoff Gaps**:

   | Gap Type | How to Check | How to Fix |
   |----------|--------------|------------|
   | Missing error states | Review view.states | Add error state content |
   | Undefined props | Review component.props | Add type definitions |
   | Missing loading states | Review view.states | Add skeleton/spinner specs |
   | Unclear interactions | Review interaction.transitions | Add missing transitions |
   | No accessibility | Check interaction.accessibility | Add keyboard, ARIA specs |
   | Missing routes | Check view.routes | Add path, params |
   | Data requirements | Check view.data_requirements | Document API dependencies |

3. **Address Developer Feedback**:
   For each developer question/concern:
   - Identify which entity should answer the question
   - Update the entity with the missing information
   - Verify the update resolves the concern

4. **Prioritize Gap Fixes**:
   - **Critical (blocks P0)**: Must fix before starting implementation
   - **High (blocks P1)**: Must fix before P1 implementation
   - **Medium (incomplete)**: Should fix for quality
   - **Low (nice-to-have)**: Can defer

5. **Execute Fixes**:
   For each gap:
   - Update the appropriate entity using `design_update_*`
   - Verify the fix with the developer if possible
   - Run `design_validate` after each fix

6. **Document Resolution**:
   Create a gap resolution report:
   - Gaps identified
   - Fixes applied
   - Remaining gaps (with justification for deferral)

**Success Criteria**:
- All Critical and High gaps resolved
- Developer confirms documentation is complete for P0/P1
- `design_validate` returns no errors
- `design_find_gaps` shows only acceptable P2 gaps

---

## Next Steps

After completing this prompt, tell the user:

**Next Prompt: 16 - Implementation Prioritization**

All critical gaps have been resolved and developers have confirmed the documentation is complete. The next step is to establish the implementation order. Prompt 16 will:
- Analyze workflow priority factors (frequency, criticality, persona coverage)
- Analyze capability and component dependencies
- Assign P0/P1/P2 priorities to all entities
- Document prioritization rationale

This prepares for the **Implementation** phase starting with prompt 17.
