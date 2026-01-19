---
title: Token Foundation Setup
tags: [design, tokens, design-system]
---
**Role & Context**: You are a design system architect creating the design token foundation for a project. You have access to Designloom MCP tools. Tokens establish the visual language used throughout the application.

**Objective**: Create a comprehensive design token set covering colors, typography, spacing, and motion.

**Brand and Design Inputs**:
{{editor "brandInputs" "Describe your brand colors, fonts, existing design specifications, and accessibility requirements"}}

**Specific Requirements**:

1. **Create a token set** using `design_create --entity_type tokens` that includes:

   **Colors (required)**:
   - `neutral`: Full scale 50-950 for grays
   - `primary`: Brand primary color scale
   - `semantic`: text_primary, text_secondary, background, surface, border_default, interactive

   **Typography (required)**:
   - `fonts`: sans, mono (with system fallbacks)
   - `sizes`: xs, sm, base, lg, xl, 2xl (use rem units)
   - `weights`: normal, medium, semibold, bold
   - `styles`: h1-h6, body, caption, label

   **Spacing (required)**:
   - `scale`: At least 8 values (4px base recommended)
   - `semantic`: component_padding_md, gap_md, page_margin

   **Motion (required)**:
   - `durations`: fast, normal, slow
   - `easings`: default, in, out, in-out

   **Additional (recommended)**:
   - `radii`: sm, md, lg, full
   - `shadows`: sm, md, lg for elevation
   - `breakpoints`: sm, md, lg, xl
   - `z_index`: dropdown, modal, popover, tooltip

2. **Apply quality requirements**:
   - Use semantic naming (purpose, not value): "text-primary" not "gray-900"
   - WCAG AA contrast: All text/background combos >= 4.5:1
   - UI elements: >= 3:1 contrast ratio
   - Use breakpoint objects for responsive values where appropriate
   - Use `{token.path}` syntax for aliases/references

3. **Verify accessibility**:
   - Document text/background combinations and their contrast ratios
   - Ensure focus states are visible
   - Verify color is not the only indicator for any state

4. **Validate the work**:
   - Run `design_validate --check all` to confirm no errors
   - Verify all required token categories are present

**Format & Structure**:
```yaml
design_create --entity_type tokens --data '{
  "id": "default-theme",
  "name": "Default Theme",
  "colors": {
    "neutral": { "50": "#fafafa", "100": "#f5f5f5", ... "950": "#0a0a0a" },
    "primary": { "50": "#eff6ff", "500": "#3b82f6", "900": "#1e3a8a" },
    "semantic": {
      "text_primary": "{colors.neutral.950}",
      "background": "{colors.neutral.50}"
    }
  },
  "typography": {
    "fonts": { "sans": "Inter, system-ui, sans-serif", "mono": "JetBrains Mono, monospace" },
    "sizes": { "xs": "0.75rem", "sm": "0.875rem", "base": "1rem", "lg": "1.125rem" }
  },
  "spacing": {
    "scale": { "1": "4px", "2": "8px", "3": "12px", "4": "16px", "6": "24px", "8": "32px", "12": "48px", "16": "64px" }
  },
  "motion": {
    "durations": { "fast": "150ms", "normal": "300ms", "slow": "500ms" },
    "easings": { "default": "ease-in-out" }
  }
}'
```

**Success Criteria**:
- colors.neutral scale defined
- colors.primary scale defined
- typography.sizes.base defined
- spacing.scale has at least 8 values
- motion.durations defined
- WCAG AA contrast verified and documented
- `design_validate --check all` returns no errors

---

## Next Steps

After completing this prompt, tell the user:

**Next Prompt: 08 - Interaction Pattern Creation**

Design tokens are now established as the visual foundation. The next step is to define reusable interaction patterns that reference these tokens. Prompt 08 will:
- Create base interaction patterns (button, input, toggle)
- Define states for each pattern (default, hover, focus, disabled)
- Specify transitions with timing from motion tokens
- Include accessibility requirements (keyboard, ARIA, reduced motion)

These patterns will be referenced by components in prompt 09.
