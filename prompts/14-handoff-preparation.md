---
title: Handoff Preparation
tags: [handoff, documentation, development]
---
**Role & Context**: You are a design lead preparing documentation for development handoff. You have access to Designloom MCP tools and will generate a comprehensive handoff package.

**Objective**: Prepare design documentation package for development handoff, ensuring completeness and clarity.

**Specific Requirements**:

1. **Final Validation**:
   Run all validation checks:
   ```
   design_validate          # Expected: No errors
   design_find_orphans      # Expected: Empty
   design_coverage_report   # Expected: >=80% coverage for P0/P1
   ```

2. **Development-Ready Checklist**:
   For each category, verify completeness using Designloom tools:

   | Category | What to Check | Tool |
   |----------|---------------|------|
   | Visual specs | Colors, typography, spacing values | `design_list_tokens` |
   | Component API | Props documented with types | `design_get_component` |
   | Interactions | All states and transitions | `design_list_interactions` |
   | Accessibility | Keyboard, ARIA, reduced motion | Check interaction.accessibility |
   | Edge cases | Empty, loading, error states | Check view.states |

3. **Generate Documentation Exports** (if available):
   ```
   design_export_diagram --type workflow    # User flow diagrams
   design_export_diagram --type component   # Component relationships
   design_generate_tests --all              # Test specifications
   ```

4. **Verify Key Workflows**:
   List all validated workflows:
   ```
   design_list_workflows
   ```
   Filter to those with `validated: true`

   For each P0/P1 workflow, verify:
   - All components in views have props documented
   - All interactions have accessibility requirements
   - All views have routing defined (if navigable)
   - Success criteria are measurable for UAT

5. **Create Handoff Summary** containing:
   - List of validated workflows (ready for implementation)
   - Component inventory with complexity estimates (atom/molecule/organism)
   - Key technical considerations from capability requirements
   - Accessibility requirements summary
   - Token values for design system implementation

6. **Developer Review Checklist**:
   - At least one developer has reviewed documentation
   - Developer questions captured and addressed
   - Implementation concerns documented

**Success Criteria**:
- `design_validate` returns no errors
- `design_find_orphans` returns empty
- All P0/P1 workflows have `validated: true`
- All components have props with types
- All views have all states defined (default, loading, error, empty)
- Handoff summary document created

---

## Next Steps

After completing this prompt, determine the next step based on developer readiness:

**If developers have questions or concerns about the documentation:**
→ Proceed to **15 - Handoff Gap Analysis**
   Address developer questions, identify missing information, and resolve gaps before implementation begins.

**If the handoff is clean (developers confirm documentation is complete):**
→ Skip to **16 - Implementation Prioritization**
   Establish the implementation order for workflows, capabilities, and components.

**How to determine which path:**
1. Share the handoff summary with developers
2. Ask if they have questions or see gaps
3. If questions exist → prompt 15
4. If no questions → prompt 16

Tell the user which path you recommend and why.
