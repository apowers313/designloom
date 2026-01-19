---
title: Documentation Generation
tags: [release, documentation, export]
---
**Role & Context**: You are a technical writer generating release documentation from Designloom entities. You have access to Designloom MCP tools and will create comprehensive documentation.

**Objective**: Generate release documentation package from synchronized Designloom entities.

**Specific Requirements**:

1. **Generate Architecture Diagrams** (if export tools available):
   ```
   design_export --format diagram --type all
   ```
   Creates:
   - Entity relationship diagram
   - Workflow journey diagrams
   - Component dependency diagram

2. **Generate Component Catalog**:
   ```
   design_list --entity_type component
   ```
   For each component, document:
   - Name and description
   - Props with TypeScript types
   - Usage examples
   - Dependencies
   - Accessibility requirements

3. **Generate Style Guide**:
   ```
   design_list --entity_type tokens
   ```
   Document:
   - Color palette with values and usage
   - Typography scale with examples
   - Spacing scale with examples
   - Motion tokens with timing values

4. **Generate User Flow Documentation**:
   ```
   design_list --entity_type workflow
   ```
   For each workflow, document:
   - User goal (what they're trying to accomplish)
   - Step-by-step journey
   - Success criteria (how we measure success)
   - Related views and components

5. **Generate Test Specifications** (if tool available):
   ```
   design_export --format tests --all
   ```
   Creates test cases from:
   - Workflow success criteria
   - Capability requirements
   - Component props
   - View states

6. **Generate Accessibility Checklist**:
   ```
   design_list --entity_type interaction
   ```
   For each component, document:
   - Keyboard requirements
   - ARIA requirements
   - Screen reader behavior
   - Reduced motion alternatives

7. **Organize Documentation Package**:
   ```
   docs/
   ├── architecture/
   │   ├── entity-relationships.md
   │   └── component-dependencies.md
   ├── components/
   │   ├── [component-name].md
   │   └── ...
   ├── workflows/
   │   ├── [workflow-name].md
   │   └── ...
   ├── style-guide/
   │   ├── colors.md
   │   ├── typography.md
   │   └── spacing.md
   ├── testing/
   │   ├── test-specs.md
   │   └── accessibility-checklist.md
   └── README.md
   ```

**Success Criteria**:
- All diagrams exported (if tool available)
- Component catalog complete with props and accessibility
- Style guide matches token values
- User flows documented for all P0/P1 workflows
- Test specifications generated
- Documentation reviewed for accuracy

---

## Next Steps

After completing this prompt, tell the user:

**Next Prompt: 24 - Implementation Retrospective**

Documentation is complete for the release. The final step is to conduct a retrospective to capture lessons learned. Prompt 24 will:
- Gather metrics from Designloom (entities created, updated, deviations)
- Analyze test metrics (coverage, pass rates, issues found)
- Document what went well and what could improve
- Generate process recommendations for the next project
- Establish a maintenance schedule for ongoing synchronization

This completes the **Release** phase and the full design-to-implementation cycle.
