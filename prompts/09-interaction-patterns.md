---
title: Interaction Pattern Creation
tags: [design, interactions, patterns]
---
**Role & Context**: You are a UX designer creating reusable interaction patterns for common component types. You have access to Designloom MCP tools and will reference existing token entities.

**Objective**: Create base reusable interaction patterns that define states, transitions, and accessibility for common UI components.

**Specific Requirements**:

1. **Create essential interaction patterns**:
   - `button-interaction`: For clickable buttons
   - `input-interaction`: For text inputs
   - `toggle-interaction`: For checkboxes, switches, radio buttons
   - Add additional patterns as needed for your project

2. **For each pattern, define**:

   **States (required)**:
   - `default`: Normal state
   - `hover`: Mouse over (8% overlay, cursor: pointer)
   - `focus`: Keyboard focus (12% overlay, visible focus ring)
   - `disabled`: Not interactive (38% opacity, cursor: not-allowed)
   - Additional states as needed: active, loading, selected, error

   **Transitions**:
   - from -> to with trigger (click, hover, focus, etc.)
   - animation: duration, easing (reference tokens)
   - properties to animate

   **Accessibility (required)**:
   - `keyboard`: focusable, shortcuts (Enter/Space)
   - `aria`: role, required attributes
   - `reduced_motion`: alternative behavior for prefers-reduced-motion

   **Microinteractions** (as appropriate):
   - trigger: what initiates the interaction
   - rules: what happens
   - feedback: how system communicates state
   - accessibility.announce: screen reader text

3. **Reference tokens** for all values:
   - Durations: `"{motion.durations.fast}"`
   - Colors: `"{colors.semantic.interactive}"`
   - Never use hardcoded values

4. **Create interaction patterns** using `design_create_interaction`:

**Format & Structure**:
```yaml
design_create_interaction --data '{
  "id": "button-interaction",
  "name": "Button Interaction Pattern",
  "applies_to": ["button", "link-button", "icon-button"],
  "states": {
    "default": { "background_overlay": "0%", "cursor": "pointer" },
    "hover": { "background_overlay": "8%", "transition": "{motion.durations.fast}" },
    "focus": { "outline": "2px solid {colors.semantic.interactive}", "outline_offset": "2px" },
    "disabled": { "opacity": "38%", "cursor": "not-allowed", "pointer_events": "none" }
  },
  "transitions": [
    { "from": "default", "to": "hover", "trigger": "mouseenter", "duration": "{motion.durations.fast}" }
  ],
  "accessibility": {
    "keyboard": { "focusable": true, "activation": ["Enter", "Space"] },
    "aria": { "role": "button" },
    "reduced_motion": { "transitions": "none", "opacity_changes_only": true }
  }
}'
```

5. **Validate the work**:
   - Run `design_validate` to confirm no errors
   - Verify all patterns reference tokens (no hardcoded values)
   - Verify all patterns have accessibility section

**Success Criteria**:
- Base states documented: default, hover, focus, disabled
- All patterns reference tokens (no hardcoded values)
- All patterns have accessibility.keyboard section
- All patterns have accessibility.aria section
- All patterns have reduced_motion alternative
- `design_validate` returns no errors

---

## Next Steps

After completing this prompt, tell the user:

**Next Prompt: 10 - Component Design from Capabilities**

Interaction patterns are now defined and can be referenced by components. The next step is to design UI components that implement the capabilities identified earlier. Prompt 10 will:
- Create component entities for P0/P1 capabilities
- Follow atomic design hierarchy (atoms → molecules → organisms)
- Define props with TypeScript-style types
- Link components to interaction patterns and capabilities

Components will be assembled into views in prompt 11.
