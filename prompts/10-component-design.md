---
title: Component Design from Capabilities
tags: [design, components, ui]
---
**Role & Context**: You are a UI designer creating components that implement capabilities. You have access to Designloom MCP tools and will build on existing capability, token, and interaction pattern entities.

**Objective**: Design components that implement capabilities, following atomic design principles (atoms -> molecules -> organisms).

**Specific Requirements**:

1. **Analyze what components are needed**:
   - Use `design_list_capabilities --priority P0` and `--priority P1` to retrieve high-priority capabilities
   - For each capability, identify UI components needed
   - Group related UI elements using atomic design hierarchy

2. **Create component entities** using `design_create_component` with:

   **Required fields**:
   - `id`: kebab-case (e.g., "file-upload-dialog")
   - `name`: Human-readable name
   - `category`: atom/molecule/organism
   - `description`: What it is and does
   - `implements_capabilities`: Link to capabilities it implements
   - `props`: Component interface with types
   - `dependencies`: Other components this uses (explicit, empty array if none)
   - `interaction_pattern`: Reference to reusable pattern OR `interactions`: inline definition
   - `accessibility`: role, label_required, keyboard_support
   - `status`: planned

3. **Define props with TypeScript-style types**:
   ```yaml
   props:
     onSubmit:
       type: function
       type_definition: "(data: FormData) => void"
       required: true
       description: "Callback when form is submitted"
     disabled:
       type: boolean
       default_value: false
       description: "Disables all form inputs"
   ```

4. **Apply atomic design hierarchy**:
   - **Atoms**: Basic building blocks (buttons, inputs, labels)
   - **Molecules**: Groups of atoms (form fields, search bars)
   - **Organisms**: Complex components (forms, headers, data tables)

5. **Build from atoms -> molecules -> organisms**:
   - Start with the most-referenced components first
   - Ensure dependencies reference existing components

6. **Validate the work**:
   - Run `design_validate` to confirm no errors
   - Run `design_find_gaps` to verify no P0/P1 capability gaps
   - Verify all components have props with types
   - Verify all components have explicit dependencies

**Format & Structure**:
```yaml
design_create_component --data '{
  "id": "file-upload-button",
  "name": "File Upload Button",
  "category": "atom",
  "description": "Button that triggers file selection dialog",
  "implements_capabilities": ["data-import"],
  "props": {
    "accept": { "type": "string", "default_value": "*", "description": "Accepted file types" },
    "multiple": { "type": "boolean", "default_value": false, "description": "Allow multiple files" },
    "onFilesSelected": { "type": "function", "type_definition": "(files: File[]) => void", "required": true }
  },
  "dependencies": [],
  "interaction_pattern": "button-interaction",
  "accessibility": { "role": "button", "label_required": true, "keyboard_support": ["Enter", "Space"] },
  "status": "planned"
}'
```

**Success Criteria**:
- All P0/P1 capabilities have at least 1 implementing component
- Each component has props documented with types
- Each component has explicit dependencies (even if empty array)
- Each component has interaction specification
- Each component has category assigned
- `design_find_gaps` shows no P0/P1 capability gaps
- `design_validate` returns no errors

---

## Next Steps

After completing this prompt, tell the user:

**Next Prompt: 11 - View Assembly**

Components are now designed and ready to be assembled into complete screens. The next step is to create view entities that arrange components into layouts. Prompt 11 will:
- Create views for P0/P1 workflows
- Define layout types and zones for component placement
- Specify all view states (default, empty, loading, error)
- Document routing and data requirements

This completes the **Design** phase. Validation begins in prompt 12.
