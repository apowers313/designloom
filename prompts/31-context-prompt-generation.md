---
title: Context-Specific Prompt Generation
tags: [metaprompting, generation, customization]
variables:
  - name: phase
    type: select
    message: "What phase is your project in?"
    choices: ["discovery", "define", "ideate", "design", "validation", "handoff", "implementation", "release"]
---
**Role & Context**: You are a prompt engineer generating customized Designloom prompts for specific project contexts. You will create prompts tailored to the current project state.

**Objective**: Generate a customized prompt for a project in the {{phase}} phase.

**Specific Need**:
{{editor "specificNeed" "Describe what you need the prompt to accomplish (e.g., 'create personas for a B2B SaaS product', 'design components for a mobile app')"}}

**Specific Requirements**:

1. **Assess Project Context**:
   Retrieve current state:
   ```
   design_list_personas
   design_list_workflows
   design_list_capabilities
   design_list_components
   ```
   Summarize what exists and what's missing.

2. **Scope Appropriately**:
   The generated prompt should be:
   - Not too broad (would exceed context limits)
   - Not too narrow (would require many prompts)
   - Achievable in a single interaction
   - Focused on the {{phase}} phase goals

3. **Include Necessary Context**:
   The prompt should:
   - Reference existing entities by ID where relevant
   - Include quality criteria from Designloom standards
   - Specify expected output format
   - Link to related entities

4. **Apply Effective Techniques**:
   Based on task type:
   - **Reasoning tasks**: Use chain-of-thought (step-by-step)
   - **Entity creation**: Use structured output format
   - **Validation tasks**: Use self-consistency checks
   - **Multi-part tasks**: Break into numbered steps

5. **Make Self-Contained**:
   The prompt should:
   - Include all needed information
   - Not assume knowledge not provided
   - Be executable independently

6. **Generate Custom Prompt**:
   ```
   ## Generated Prompt

   ---
   title: [Descriptive Title]
   tags: [{{phase}}, relevant-tags]
   ---

   **Role & Context**: [Specific role for this task]

   **Objective**: [Clear objective based on specific need]

   [Content referencing existing entities]

   **Specific Requirements**:
   [Numbered steps appropriate to task]

   **Success Criteria**:
   [Measurable outcomes]

   ---

   ## Prompt Metadata

   - Estimated context size: [X] words
   - Expected output: [description]
   - Designloom tools used: [list]
   - Follow-up prompts (if needed): [suggestions]
   ```

**Success Criteria**:
- Prompt addresses specific need
- Scope is appropriate for single interaction
- References existing entities correctly
- Includes clear success criteria
- Uses appropriate prompting techniques

---

## Next Steps

**This is a meta-prompt with no fixed next step.**

After generating the custom prompt, tell the user:

The custom prompt has been generated. To use it:

1. **Run the generated prompt** to accomplish the specific task
2. **Evaluate the output** against the success criteria included in the prompt
3. **If the prompt will be reused**, consider:
   - Saving it to `./prompts/` with an appropriate number (e.g., `33-custom-task.md`)
   - Adding it to the workflow documentation

**After the generated prompt completes**, return to the main Designloom workflow at the appropriate phase based on what was accomplished.

**Related utility prompts:**
- **30 - Prompt Improvement**: If the generated prompt produces suboptimal results
- **32 - Multi-Agent Verification**: To verify the output quality of the generated prompt
