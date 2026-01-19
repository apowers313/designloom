---
title: Entity Quality Review
tags: [quality, review, audit]
variables:
  - name: entityType
    type: select
    message: "Which entity type do you want to review?"
    choices: ["personas", "workflows", "capabilities", "components", "tokens", "views", "interactions"]
---
**Role & Context**: You are a design quality auditor reviewing Designloom entities against quality standards. You have access to Designloom MCP tools and will assess entity completeness and quality.

**Objective**: Review {{entityType}} entities against the Designloom quality framework.

**Specific Requirements**:

1. **Retrieve Entities**:
   ```
   design_list --entity_type {{entityType}}
   ```

2. **Apply Quality Criteria** based on entity type:

   **Personas**:
   - [ ] Research-based (has sources linked)
   - [ ] Goal-focused (goals are specific, not generic)
   - [ ] Context-specific (reflects THIS product's usage)
   - [ ] Actionable (every detail could influence design)
   - [ ] Memorable (distinct name and role)

   **Workflows**:
   - [ ] User-centered (written from user perspective)
   - [ ] Goal-oriented (clear outcome)
   - [ ] Measurable (has success_criteria with targets)
   - [ ] Persona-linked (serves specific personas)
   - [ ] Starting state documented

   **Capabilities**:
   - [ ] Implementation-agnostic (what, not how)
   - [ ] Workflow-connected (linked to workflows)
   - [ ] Clearly scoped (not too big or too small)
   - [ ] Testable (at least 3 verifiable requirements)
   - [ ] Independent (can implement alone)

   **Components**:
   - [ ] Capability-linked (implements at least 1 capability)
   - [ ] Appropriately scoped (atom/molecule/organism)
   - [ ] Props documented (typed interface)
   - [ ] Dependencies explicit (even if empty array)
   - [ ] Interaction specified (states and accessibility)

   **Tokens**:
   - [ ] Semantic naming (purpose, not value)
   - [ ] Complete coverage (no hardcoding needed)
   - [ ] WCAG compliant (contrast ratios)
   - [ ] Responsive where needed

   **Views**:
   - [ ] Workflow-connected (serves user journey)
   - [ ] All states covered (default, empty, loading, error)
   - [ ] Responsive specified (breakpoints)
   - [ ] Routes defined (if navigable)

   **Interactions**:
   - [ ] All states defined (default, hover, focus, disabled)
   - [ ] Transitions specified (timing, easing)
   - [ ] Accessibility complete (keyboard, ARIA)
   - [ ] Reduced motion alternative

3. **Score Each Entity**:
   | Level | Criteria |
   |-------|----------|
   | Level 3 (Excellent) | All criteria met, well-documented |
   | Level 2 (Good) | Most criteria met, minor gaps |
   | Level 1 (Needs Work) | Multiple criteria missing |

4. **Generate Quality Report**:
   ```
   Entity Quality Review: {{entityType}}
   Date: [DATE]

   Summary:
   - Total entities: [N]
   - Level 3 (Excellent): [N] ([%])
   - Level 2 (Good): [N] ([%])
   - Level 1 (Needs Work): [N] ([%])

   Issues Found:
   | Entity | Issue | Priority | Fix |
   |--------|-------|----------|-----|
   | [id] | [issue] | [P0/P1/P2] | [recommendation] |

   Top Recommendations:
   1. [Highest impact improvement]
   2. [Second priority]
   3. [Third priority]
   ```

**Success Criteria**:
- All entities reviewed against criteria
- Quality scores assigned
- Issues prioritized by impact
- Specific recommendations provided

---

## Next Steps

**This is a utility prompt with no fixed next step.**

After completing this quality review, tell the user:

Based on the issues found, the user should address them using the appropriate prompt:

**For Persona issues:**
→ Use **02 - Source-Backed Persona Creation** to enhance personas with better research backing

**For Workflow issues:**
→ Use **04 - Workflow Creation** or **05 - Success Criteria Definition** to refine workflows

**For Capability issues:**
→ Use **07 - Capability Requirements Refinement** to improve requirement quality

**For Component issues:**
→ Use **10 - Component Design** to add missing props, dependencies, or interactions

**For Token issues:**
→ Use **08 - Token Foundation Setup** to complete token coverage

**For View issues:**
→ Use **11 - View Assembly** to add missing states or layout specifications

**For Interaction issues:**
→ Use **09 - Interaction Pattern Creation** to complete accessibility or state definitions

After fixing issues, run this prompt again to verify improvements, or run **12 - Pre-Development Validation** for a comprehensive check.
