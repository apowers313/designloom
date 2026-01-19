---
title: Pattern Extraction
tags: [implementation, patterns, refactoring]
---
**Role & Context**: You are a software architect identifying and extracting reusable patterns from implemented components. You have access to Designloom MCP tools.

**Objective**: Identify components with similar implementations and extract reusable patterns into Designloom.

**Specific Requirements**:

1. **When to Extract a Pattern**:
   Extract when:
   - 3+ components share similar structure
   - Same interaction pattern appears repeatedly
   - Same layout zone configuration repeats
   - Developers are copy-pasting code

2. **Identify Pattern Candidates**:
   Review implemented components:
   ```
   design_list --entity_type component
   ```
   Look for similarities in:
   - [ ] Similar prop interfaces
   - [ ] Similar interaction states
   - [ ] Similar layout structures
   - [ ] Similar accessibility patterns

3. **Define Shared Pattern**:
   For each pattern candidate:
   ```
   Pattern: [PATTERN_NAME]

   Shared by:
   - [component-1]
   - [component-2]
   - [component-3]

   Common elements:
   - Props: [shared props]
   - States: [shared states]
   - Accessibility: [shared requirements]

   Variations:
   - [component-1]: [what's different]
   - [component-2]: [what's different]
   ```

4. **Create Pattern Entity**:
   If interaction pattern:
   ```yaml
   design_create --entity_type interaction --data '{
     "id": "[pattern-id]",
     "name": "[Pattern Name]",
     "applies_to": ["[component-type-1]", "[component-type-2]"],
     "states": { ... },
     "accessibility": { ... }
   }'
   ```

   If component pattern (abstract base):
   ```yaml
   design_create --entity_type component --data '{
     "id": "[base-component-id]",
     "name": "[Base Component Name]",
     "description": "Abstract pattern for [purpose]",
     "category": "atom",
     "props": { ...common props... }
   }'
   ```

5. **Update Existing Components**:
   Link components to the pattern:
   ```yaml
   design_update --entity_type component --id [component-id] --data '{
     "interaction_pattern": "[pattern-id]"
   }'
   ```

   Or note the pattern relationship:
   ```yaml
   design_update --entity_type component --id [component-id] --data '{
     "notes": "Extends [pattern-id] pattern with [variations]"
   }'
   ```

6. **Document Pattern**:
   Create Source documenting the extraction:
   ```yaml
   design_create --entity_type source --id pattern-[name] --title "Pattern Extraction - [Name]" --summary "Extracted from [components]. Used by [N] components. Reduces duplication by [benefit]."
   ```

**Success Criteria**:
- Patterns with 3+ uses identified
- Pattern entities created in Designloom
- Existing components updated to reference patterns
- Pattern documentation created
- `design_validate --check all` returns no errors

---

## Next Steps

After completing this prompt, determine the next step based on implementation status:

**Check remaining work:**
```
design_list --entity_type workflow --priority P0
design_list --entity_type workflow --priority P1
```

**If more P0/P1 workflows need implementation:**
→ Return to **19 - Vertical Slice Implementation Spec**
   Generate the implementation spec for the next workflow, now benefiting from extracted patterns.

**If implementation is ongoing but you want to track progress:**
→ Proceed to **21 - Implementation Progress Tracking**
   Generate a progress dashboard to see overall status.

**If all P0/P1 workflows are implemented and validated:**
→ Proceed to **23 - Release Synchronization**
   Synchronize Designloom with implemented code before release.

Tell the user the current implementation status and which prompt to run next.
