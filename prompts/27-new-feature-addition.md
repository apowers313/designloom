---
title: New Feature Addition
tags: [change-management, features, planning]
---
**Role & Context**: You are a product designer adding a new feature to an existing Designloom project. You have access to Designloom MCP tools and will follow the established design patterns.

**Objective**: Add a new feature following Designloom's entity relationships and quality standards.

**Feature Description**:
{{editor "featureDescription" "Describe the new feature you want to add, including what users should be able to do and why it's valuable"}}

**Specific Requirements**:

1. **Research Fit with Existing Design**:
   Analyze existing personas:
   ```
   design_list_personas
   ```
   - Which personas need this feature?
   - Does this require a new persona?

2. **Define the Need**:
   Check existing workflows:
   ```
   design_list_workflows
   ```
   - Does this feature serve an existing workflow?
   - If new workflow needed:
     - What persona(s) does it serve?
     - What is the user goal?
     - What are success criteria?

3. **Specify Capability**:
   Check existing capabilities:
   ```
   design_list_capabilities
   ```
   - Can existing capabilities support this?
   - Create new capability:
     - What does this feature DO (not how)?
     - What are the requirements (at least 3)?
     - Which workflow(s) does it serve?

4. **Design Implementation**:
   Check existing components:
   ```
   design_list_components
   ```
   - Can existing components implement this?
   - What new components are needed?

   For new components:
   - What capability does it implement?
   - What props does it need?
   - What interaction pattern applies?
   - What dependencies does it have?

5. **Integrate into Views**:
   Check existing views:
   ```
   design_list_views
   ```
   - Which views need this feature?
   - What zones should include new components?
   - What states are affected?

6. **Create Entities in Order**:
   1. Persona (if new user type)
   2. Workflow (if new journey)
   3. Capability (what the feature does)
   4. Components (atoms -> molecules -> organisms)
   5. View updates (add components to zones)

7. **Validate the Addition**:
   ```
   design_validate
   design_find_gaps
   design_coverage_report
   ```

   Ensure the new feature is:
   - Linked to personas (traceable)
   - Has measurable success criteria
   - Has complete component specifications
   - Integrates with existing views

**Success Criteria**:
- Feature traced to persona need
- Workflow has measurable success criteria
- Capability has at least 3 testable requirements
- Components have props documented
- `design_validate` returns no errors
- `design_find_gaps` shows no new gaps

---

## Next Steps

**This is a utility prompt with variable next steps based on what was created.**

After completing this prompt, tell the user:

Based on the entities created for this new feature, proceed to the appropriate prompt:

**If a new workflow was created:**
→ Proceed to **05 - Success Criteria Definition** to ensure SMART metrics
→ Then continue through the standard flow (06 → 07 → ... → 13)

**If only a new capability was added to an existing workflow:**
→ Proceed to **07 - Capability Requirements Refinement** to ensure IEEE-quality requirements
→ Then **10 - Component Design** to create implementing components

**If only new components were added:**
→ Proceed to **11 - View Assembly** to integrate into views
→ Then **12 - Pre-Development Validation** to verify completeness

**If the feature is fully specified:**
→ Proceed to **12 - Pre-Development Validation** to verify the addition is complete
→ Then **13 - Testing** to validate the new feature

Tell the user what entities were created and which prompt to run next based on the above logic.
