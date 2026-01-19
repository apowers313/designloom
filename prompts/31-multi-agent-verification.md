---
title: Multi-Agent Verification
tags: [metaprompting, verification, quality]
---
**Role & Context**: You are applying multi-perspective verification to cross-check design work. You will evaluate work from user, quality, and developer perspectives to identify blind spots.

**Objective**: Verify work using three analytical perspectives to catch issues a single perspective might miss.

**Work to Verify**:
{{editor "workToVerify" "Paste the entity data or output you want to verify (e.g., a workflow definition, component specification, or set of capabilities)"}}

**Specific Requirements**:

1. **Perspective 1: User Advocate**
   Evaluate as if you're the persona this serves:
   - Does this actually solve my problem?
   - Is this how I would want to interact?
   - Are my frustrations addressed?
   - Would I find this usable?
   - Is the language user-friendly?

2. **Perspective 2: Quality Auditor**
   Evaluate against Designloom quality standards:
   - Does this meet quality level 2 standards?
   - Are all required fields complete?
   - Are all relationships valid?
   - Is traceability maintained (linked to sources)?
   - Are success criteria measurable?

3. **Perspective 3: Developer**
   Evaluate for implementation:
   - Is this implementable as specified?
   - Are there ambiguities that would cause questions?
   - Are edge cases covered?
   - Is the scope clear (not too big, not too small)?
   - Are props/interfaces clearly typed?

4. **Score Each Perspective**:
   | Score | Criteria |
   |-------|----------|
   | Acceptable | Meets standards, minor issues only |
   | Needs Work | Significant gaps, must address |
   | Unacceptable | Fundamental problems, rethink needed |

5. **Synthesize Findings**:
   ```
   ## Multi-Agent Verification Report

   ### Perspective 1: User Advocate
   Score: [Acceptable/Needs Work/Unacceptable]

   Findings:
   - [Finding 1]
   - [Finding 2]

   Issues:
   - [Issue requiring attention]

   ### Perspective 2: Quality Auditor
   Score: [Acceptable/Needs Work/Unacceptable]

   Findings:
   - [Finding 1]
   - [Finding 2]

   Issues:
   - [Issue requiring attention]

   ### Perspective 3: Developer
   Score: [Acceptable/Needs Work/Unacceptable]

   Findings:
   - [Finding 1]
   - [Finding 2]

   Issues:
   - [Issue requiring attention]

   ## Overall Verdict

   **PASS** - All perspectives acceptable
   or
   **REVISE** - Some perspectives need work
   or
   **FAIL** - Fundamental issues identified

   ## Required Changes (if REVISE or FAIL)

   Priority Order:
   1. [Most critical change]
   2. [Second priority]
   3. [Third priority]

   Verification Criteria for Revised Version:
   - [ ] [How to verify issue 1 is fixed]
   - [ ] [How to verify issue 2 is fixed]
   ```

**Success Criteria**:
- All three perspectives evaluated
- Scores assigned with rationale
- Issues identified with specifics
- Priority order for fixes provided
- Clear verdict on overall quality

---

## Next Steps

**This is a utility prompt with no fixed next step.**

After completing this multi-agent verification, tell the user:

Based on the verification verdict:

**If PASS (all perspectives acceptable):**
The work is ready to proceed. Return to the main Designloom workflow at the appropriate phase.

**If REVISE (some perspectives need work):**
Address the required changes in priority order, then:
- Re-run this verification to confirm fixes, OR
- Proceed with caution if time-constrained (document remaining issues)

**If FAIL (fundamental issues identified):**
The work needs significant rework. Based on which perspective failed:
- **User Advocate failed**: Revisit persona goals and workflow design (prompts 02, 03)
- **Quality Auditor failed**: Run **27 - Entity Quality Review** for detailed assessment
- **Developer failed**: Clarify specifications, add missing details (prompts 06, 09)

This prompt can be used at any checkpoint in the workflow to verify work quality before proceeding to the next phase.
