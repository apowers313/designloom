---
title: Accessibility Audit
tags: [quality, accessibility, wcag]
---
**Role & Context**: You are an accessibility specialist auditing Designloom entities for WCAG compliance. You have access to Designloom MCP tools and will identify accessibility gaps.

**Objective**: Verify accessibility specifications are complete across all components and interactions.

**Specific Requirements**:

1. **Audit Components**:
   ```
   design_list --entity_type component
   ```
   For each component, verify:

   **Keyboard Accessibility**:
   - [ ] Is it focusable (if interactive)?
   - [ ] Can it be activated via keyboard (Enter/Space)?
   - [ ] Are shortcuts documented?
   - [ ] Is focus visible and distinct?

   **ARIA Specification**:
   - [ ] Is role defined?
   - [ ] Are required attributes specified?
   - [ ] Is label strategy defined (aria-label vs visible label)?

   **Interaction States**:
   - [ ] Is disabled state specified?
   - [ ] Does it have focus state?
   - [ ] Is focus-visible (keyboard only) distinct from focus?

   **Reduced Motion**:
   - [ ] Is alternative specified for animations?
   - [ ] Are animations disableable?

2. **Audit Interactions**:
   ```
   design_list --entity_type interaction
   ```
   For each interaction pattern:
   - [ ] Has accessibility.keyboard section?
   - [ ] Has accessibility.aria section?
   - [ ] Has reduced_motion alternative?

3. **Audit Tokens**:
   ```
   design_list --entity_type tokens
   ```
   For color tokens:
   - [ ] Do text/background combinations meet WCAG AA (4.5:1)?
   - [ ] Do UI elements meet 3:1 contrast?
   - [ ] Is focus ring color visible against all backgrounds?
   - [ ] Are motion durations reasonable (not too long)?

4. **Prioritize Issues**:
   | Priority | Criteria |
   |----------|----------|
   | CRITICAL | Missing keyboard access (blocks users) |
   | HIGH | Missing ARIA roles (confuses assistive tech) |
   | MEDIUM | Missing reduced motion (discomfort risk) |
   | LOW | Missing documentation (implementation risk) |

5. **Generate Accessibility Report**:
   ```
   Accessibility Audit Report
   Date: [DATE]

   Summary:
   - Components audited: [N]
   - Interactions audited: [N]
   - Token sets audited: [N]

   Critical Issues (Must Fix):
   | Entity | Issue | WCAG | Fix |
   |--------|-------|------|-----|
   | [id] | [Missing keyboard access] | 2.1.1 | [Add focusable: true] |

   High Priority Issues:
   | Entity | Issue | WCAG | Fix |
   |--------|-------|------|-----|
   | [id] | [Missing ARIA role] | 4.1.2 | [Add role: button] |

   Medium Priority Issues:
   [table]

   Low Priority Issues:
   [list]

   Contrast Verification:
   | Combination | Ratio | Status |
   |-------------|-------|--------|
   | text_primary on background | [X]:1 | PASS/FAIL |

   Recommendations:
   1. [Highest priority fix]
   2. [Second priority]
   ```

**Success Criteria**:
- All components audited for keyboard access
- All interactions audited for ARIA
- Contrast ratios verified for token combinations
- Issues prioritized by severity
- Specific fixes recommended with WCAG references

---

## Next Steps

**This is a utility prompt with no fixed next step.**

After completing this accessibility audit, tell the user:

Based on the issues found, the user should address them:

**For keyboard accessibility issues (CRITICAL):**
→ Update components using **10 - Component Design** to add `accessibility.keyboard` specs
→ Update interaction patterns using **09 - Interaction Pattern Creation** to add keyboard support

**For ARIA issues (HIGH):**
→ Update components to add proper `accessibility.aria` specifications
→ Ensure all interactive components have roles defined

**For contrast issues:**
→ Update tokens using **08 - Token Foundation Setup** to fix color combinations
→ Document compliant text/background pairings

**For reduced motion issues (MEDIUM):**
→ Update interaction patterns to add `reduced_motion` alternatives

After fixing critical and high-priority issues, run this audit again to verify compliance, or proceed to **12 - Pre-Development Validation** for a comprehensive check.

**Note:** Accessibility is not optional. All CRITICAL issues must be resolved before implementation.
