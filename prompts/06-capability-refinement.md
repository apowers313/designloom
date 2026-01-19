---
title: Capability Requirements Refinement
tags: [ideate, capabilities, requirements]
---
**Role & Context**: You are a requirements analyst ensuring each capability has detailed, testable requirements. You have access to Designloom MCP tools and will enhance existing capability entities.

**Objective**: Review and refine capabilities to ensure each has at least 3 specific, testable requirements following IEEE standards.

**Specific Requirements**:

1. **Retrieve existing capabilities**:
   - Use `design_list --entity_type capability` to retrieve all capabilities
   - Identify capabilities with fewer than 3 requirements or vague requirements

2. **Apply IEEE requirement standards**:
   - **Clear**: Unambiguous, one interpretation only
   - **Complete**: Covers all scenarios including errors
   - **Consistent**: No contradictions
   - **Testable**: Can verify with specific test
   - **Traceable**: Links to source (research, standard, etc.)

3. **Use good requirement patterns**:
   - "Support [format] files with [specification]"
   - "Handle inputs up to [limit] without [failure mode]"
   - "Provide [feedback type] within [time]"
   - "Report [error type] with [message format]"

4. **Avoid bad requirement patterns**:
   - "Fast performance" (not measurable)
   - "User-friendly" (subjective)
   - "Like competitor X" (vague)
   - "Should work well" (meaningless)

5. **For each capability needing refinement**:
   - List current description and requirements count
   - Identify missing scenarios:
     - Happy path (normal operation)
     - Error cases (what can go wrong)
     - Edge cases (boundary conditions)
   - Propose specific, testable requirements (ensure at least 3 total)
   - Note technical feasibility concerns in notes field

6. **Update capabilities** using `design_update --entity_type capability`:
   ```yaml
   design_update --entity_type capability --id data-import --data '{
     "requirements": [
       "Support CSV files up to 100MB with UTF-8 encoding",
       "Support Excel files (.xlsx, .xls) with multiple sheets",
       "Display progress bar updating every 500ms during import",
       "Report validation errors listing row number and field name",
       "Allow cancellation of import at any time without data corruption"
     ]
   }'
   ```

7. **Validate the work**:
   - Run `design_validate --check all` to confirm no errors
   - Run `design_validate --check gaps` to ensure no workflow gaps
   - Verify requirements cover: happy path, error cases, edge cases

**Success Criteria**:
- Each capability has at least 3 testable requirements
- Requirements cover happy path, error cases, and edge cases
- No vague or subjective requirements remain
- `design_validate --check gaps` returns acceptable gaps only
- `design_validate --check all` returns no errors

---

## Next Steps

After completing this prompt, tell the user:

**Next Prompt: 07 - Token Foundation Setup**

Capabilities are now fully specified with IEEE-quality requirements. The next step begins the **Design** phase by establishing the visual design language. Prompt 07 will:
- Create design tokens for colors (neutral, primary, semantic)
- Define typography scales and font families
- Establish spacing and motion values
- Verify WCAG accessibility compliance for color combinations

This foundation will be referenced by all subsequent design entities (interactions, components, views).
