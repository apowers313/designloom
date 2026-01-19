---
title: Prompt Improvement (Reflexion)
tags: [metaprompting, reflexion, improvement]
---
**Role & Context**: You are a prompt engineer applying the reflexion pattern to improve prompts based on actual results. You will analyze what went wrong and create improved versions.

**Objective**: Review and improve a prompt based on the output it produced.

**Original Prompt**:
{{editor "originalPrompt" "Paste the original prompt that was used"}}

**Output Received**:
{{editor "outputReceived" "Paste the output that was generated from the prompt"}}

**Issues Identified**:
{{editor "issues" "Describe what was wrong with the output (missing information, incorrect format, wrong focus, etc.)"}}

**Specific Requirements**:

1. **Analyze Failures**:
   For each issue, identify root cause:
   - Was the instruction unclear?
   - Was context missing?
   - Were assumptions wrong?
   - Was scope too broad/narrow?
   - Was output format unspecified?

2. **Identify Improvements**:
   For each root cause, determine fix:
   - Add explicit instructions
   - Provide necessary context
   - Correct assumptions
   - Adjust scope
   - Specify output format

3. **Apply Improvement Techniques**:
   - **Clarity**: Use specific, unambiguous language
   - **Structure**: Add numbered steps or sections
   - **Examples**: Include sample outputs
   - **Constraints**: Add explicit boundaries
   - **Validation**: Add success criteria

4. **Generate Improved Prompt**:
   Create new version that:
   - Addresses all identified issues
   - Maintains original intent
   - Adds necessary constraints
   - Includes success criteria

5. **Predict Potential Issues**:
   What could still go wrong?
   - Edge cases not covered?
   - Ambiguities remaining?
   - Context still missing?

6. **Output**:
   ```
   ## Analysis

   Root Causes:
   1. [Issue]: [Root cause]
   2. [Issue]: [Root cause]

   ## Improved Prompt

   [Complete improved prompt]

   ## Changelog

   | Change | Reason |
   |--------|--------|
   | [What changed] | [Why] |

   ## Validation Criteria

   To verify the improved prompt works:
   - [ ] [Specific check 1]
   - [ ] [Specific check 2]

   ## Remaining Risks
   - [Potential issue to monitor]
   ```

**Success Criteria**:
- Root causes identified for each issue
- Improved prompt addresses all issues
- Changes documented with rationale
- Validation criteria provided

---

## Next Steps

**This is a meta-prompt with no fixed next step.**

After completing this prompt improvement, tell the user:

The improved prompt has been generated. To use it:

1. **Test the improved prompt** with a similar task to verify it produces better output
2. **If the prompt is part of the Designloom workflow** (prompts 01-32):
   - Update the prompt file in `./prompts/` with the improved version
   - Document the change in the changelog section of the prompt
3. **If issues persist**, run this prompt again with the new output to iterate further

This prompt can be used at any time to improve any prompt in the Designloom workflow or custom prompts you create.

**Related utility prompts:**
- **31 - Context-Specific Prompt Generation**: Create new prompts for specific needs
- **32 - Multi-Agent Verification**: Verify prompt output quality from multiple perspectives
