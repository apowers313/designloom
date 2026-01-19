---
title: View Assembly
tags: [design, views, layouts]
---
**Role & Context**: You are a UI designer assembling components into complete screen views. You have access to Designloom MCP tools and will build on existing component and workflow entities.

**Objective**: Create view entities that assemble components into complete screens supporting P0/P1 workflows.

**Specific Requirements**:

1. **Identify screens needed**:
   - Use `design_list_workflows --priority P0` and `--priority P1` to retrieve high-priority workflows
   - For each workflow, identify screens involved in the journey
   - Group related screens (same layout, different content = states, not separate views)

2. **Create view entities** using `design_create_view` with:

   **Basic Info (required)**:
   - `id`: V01, V02, etc.
   - `name`: Descriptive screen name
   - `description`: Purpose of this view
   - `workflows`: Link to workflows this serves

   **Layout (required)**:
   - `type`: single-column, sidebar-left, sidebar-right, dashboard, etc.
   - `zones`: Named regions for component placement
     - For each zone: id, position, components, width, visibility by breakpoint

   **States (required)**:
   - `default`: Normal operation
   - `empty`: No data (include CTA for next action)
   - `loading`: Fetching data (skeleton/spinner components)
   - `error`: Operation failed (error message + retry action)

   **Routing (if user-navigable)**:
   - `path`: URL pattern ("/dashboard/:id")
   - `params`: URL parameters with types
   - `title`: Browser tab title
   - `requires_auth`: If authentication needed

   **Data Requirements (required)**:
   - What APIs/data needed
   - Which state to show during loading/error

3. **Apply layout patterns**:
   - **Dashboard**: header + sidebar + main content
   - **Settings**: sidebar-left with navigation
   - **Detail**: sidebar-right with metadata
   - **Forms**: single-column, centered
   - **List/table**: full-width with filtering header

4. **Validate the work**:
   - Run `design_validate` to confirm no errors
   - Verify all components referenced in zones exist in Designloom
   - Verify all P0/P1 workflows have at least 1 associated view

**Format & Structure**:
```yaml
design_create_view --data '{
  "id": "V01",
  "name": "Data Import Dashboard",
  "description": "Main view for importing and managing data files",
  "workflows": ["W01", "W02"],
  "layout": {
    "type": "sidebar-left",
    "zones": [
      { "id": "sidebar", "position": "left", "width": "240px", "components": ["navigation-menu"] },
      { "id": "main", "position": "center", "components": ["file-upload-area", "import-history-table"] }
    ]
  },
  "states": {
    "default": { "description": "Shows upload area and recent imports" },
    "empty": { "description": "No imports yet", "cta": "Upload your first file" },
    "loading": { "description": "Loading import history", "components": ["table-skeleton"] },
    "error": { "description": "Failed to load", "components": ["error-message"], "action": "retry" }
  },
  "routes": { "path": "/import", "title": "Import Data" },
  "data_requirements": { "apis": ["/api/imports"], "loading_state": "loading", "error_state": "error" }
}'
```

**Success Criteria**:
- All P0/P1 workflows have at least 1 associated view
- Each view has layout.type and layout.zones defined
- Each view has all states: default, empty, loading, error
- Each view has data_requirements documented
- All components referenced in zones exist
- `design_validate` returns no errors

---

## Next Steps

After completing this prompt, tell the user:

**Next Prompt: 12 - Pre-Development Validation**

The **Design** phase is complete. Before proceeding to testing and handoff, a comprehensive validation is needed. Prompt 12 will:
- Run schema validation across all entities
- Check for orphaned entities (disconnected from the graph)
- Perform gap analysis (missing capabilities or components)
- Generate a coverage report
- Spot-check entity quality against standards

This validation gate ensures design documentation is ready for prototype testing.
