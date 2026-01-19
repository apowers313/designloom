---
title: Impact Analysis for Changes
tags: [change-management, impact, analysis]
variables:
  - name: entityType
    type: select
    message: "What type of entity are you changing?"
    choices: ["workflow", "capability", "component", "view", "tokens", "interaction", "persona", "source"]
  - name: entityId
    type: input
    message: "Enter the entity ID:"
    required: true
---
**Role & Context**: You are a change analyst assessing the impact of proposed changes to Designloom entities. You have access to Designloom MCP tools and will trace dependencies to understand ripple effects.

**Objective**: Analyze the impact of a proposed change to {{entityType}} {{entityId}} before making modifications.

**Proposed Change**:
{{editor "proposedChange" "Describe the change you want to make to this entity"}}

**Specific Requirements**:

1. **Identify Direct Dependencies**:
   Retrieve the entity and examine references:
   ```
   design_get --entity_type {{entityType}} --id {{entityId}}
   ```
   List all entities that:
   - Reference this entity (dependents)
   - Are referenced by this entity (dependencies)

2. **Trace Cascading Effects**:
   Follow the dependency chains:
   - **Changing a Workflow** → What Capabilities depend on it? → What Components?
   - **Changing a Capability** → What Workflows use it? → What Components implement it?
   - **Changing a Component** → What Views include it? → What Capabilities does it implement?
   - **Changing Tokens** → What Components use these tokens? (visual regression risk)
   - **Changing an Interaction** → What Components use this pattern?

3. **Assess Risk Level**:
   | Impact Level | Criteria |
   |--------------|----------|
   | HIGH | Changes user-facing behavior, affects multiple workflows |
   | MEDIUM | Changes implementation, affects multiple components |
   | LOW | Isolated change, affects single entity |

4. **Recommend Approach**:
   Based on impact analysis:
   - Can this be done incrementally?
   - What entities need updating?
   - What order should updates happen?
   - What validation is needed after?
   - Should we create new entities and deprecate old ones?

5. **Generate Change Plan**:
   ```
   Change Impact Analysis: {{entityType}} {{entityId}}

   Proposed Change: [summary]

   Direct Dependencies:
   - [Entity 1]: [relationship]
   - [Entity 2]: [relationship]

   Cascading Effects:
   - [Effect 1]: [what happens]
   - [Effect 2]: [what happens]

   Risk Level: [HIGH/MEDIUM/LOW]
   Reason: [explanation]

   Recommended Approach:
   1. [Step 1 - specific tool call]
   2. [Step 2 - specific tool call]
   3. [Validation step]

   Rollback Plan:
   - [How to undo if needed]
   ```

**Success Criteria**:
- All dependencies identified
- Cascading effects traced
- Risk level assessed with rationale
- Step-by-step change plan provided
- Validation steps included

---

## Next Steps

**This is a utility prompt with no fixed next step.**

After completing this impact analysis, tell the user:

Based on the analysis, the user should decide whether to proceed with the proposed change. If proceeding:

1. **Execute the change plan** generated above (step-by-step updates to Designloom entities)
2. **Run validation** after changes: `design_validate --check all` and `design_validate --check gaps`
3. **Return to the main workflow** at the appropriate phase based on what was changed:
   - Workflow changes → may need re-testing (prompt 12)
   - Capability changes → may need component updates (prompt 09)
   - Component changes → may need view updates (prompt 10)
   - Token changes → may need visual regression testing

This prompt can be run at any time when considering changes to existing Designloom entities.
