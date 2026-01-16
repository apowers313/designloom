# Designloom Future Work

This document captures potential entity types and features identified during gap analysis but not yet implemented. It provides sufficient detail for future development sessions to pick up where research left off.

---

## Table of Contents

1. [Gap Analysis Methodology](#gap-analysis-methodology)
2. [Journey Maps Entity](#journey-maps-entity)
3. [Information Architecture Entity](#information-architecture-entity)
4. [Content Entity](#content-entity)
5. [Stakeholder Requirements](#stakeholder-requirements)
6. [Other Enhancements](#other-enhancements)
7. [Research Sources](#research-sources)

---

## Gap Analysis Methodology

### How Gaps Were Identified

The gap analysis compared Designloom's current entity types against established UI/UX design frameworks to identify what artifacts are commonly produced in professional UX practice but not captured in Designloom.

### Frameworks Analyzed

#### 1. Double Diamond (British Design Council, 2005)

The Double Diamond divides design into four phases with distinct deliverables:

| Phase | Thinking | Standard Deliverables | Designloom Coverage |
|-------|----------|----------------------|---------------------|
| **Discover** | Divergent | User interviews, surveys, competitive analysis, observation notes | ✅ Sources (references) |
| **Define** | Convergent | Personas, journey maps, problem statements, requirements | ✅ Personas, Workflows ⚠️ Journey maps partial |
| **Develop** | Divergent | Ideation, wireframes, prototypes, design concepts | ✅ Capabilities, Components |
| **Deliver** | Convergent | Final designs, design systems, specifications, handoff docs | ✅ Tokens, Views, Interactions |

**Gap identified**: Journey maps capture emotional journey and touchpoints not in Workflows.

#### 2. Design Thinking (Stanford d.school)

Five stages with associated artifacts:

| Stage | Standard Deliverables | Designloom Coverage |
|-------|----------------------|---------------------|
| **Empathize** | Empathy maps, interview notes, observation photos, quotes | ✅ Sources, Personas |
| **Define** | Point-of-view statements, "How Might We" questions, journey maps | ✅ Workflows ⚠️ No HMW format |
| **Ideate** | Brainstorm outputs, concept sketches, storyboards | ✅ Capabilities (functional) ❌ No storyboards |
| **Prototype** | Low-fi prototypes, wireframes, mockups | ✅ Components, Views |
| **Test** | Usability test results, iteration notes | ✅ Sources (as references) |

**Gap identified**: Storyboards and visual ideation artifacts not captured (acceptable - implementation detail).

#### 3. ISO 9241-210 (Human-Centered Design)

Four iterative activities:

| Activity | Standard Deliverables | Designloom Coverage |
|----------|----------------------|---------------------|
| **Understand context** | Context-of-use analysis, user profiles, task models | ✅ Personas (context), Workflows |
| **Specify requirements** | User requirements spec, usability requirements | ✅ Capabilities ⚠️ No non-user requirements |
| **Produce solutions** | Design concepts, prototypes, design specs | ✅ Components, Tokens, Views, Interactions |
| **Evaluate** | Usability evaluation reports, conformance reports | ✅ Sources (as references) |

**Gap identified**: Non-user requirements (business, technical, compliance) not captured.

#### 4. Atomic Design (Brad Frost)

Five levels of component hierarchy:

| Level | Description | Designloom Coverage |
|-------|-------------|---------------------|
| **Atoms** | Basic building blocks | ✅ Components (category: atom) |
| **Molecules** | Simple component combinations | ✅ Components (category: molecule) |
| **Organisms** | Complex component combinations | ✅ Components (category: organism) |
| **Templates** | Page-level layout structures | ✅ Views (layout) |
| **Pages** | Templates with real content | ✅ Views (states) ⚠️ Content not captured |

**Gap identified**: Actual content/copy not captured - Views define structure but not text.

#### 5. UX Deliverables (Nielsen Norman Group, IxDF)

Common UX deliverables across the industry:

| Deliverable | Description | Designloom Coverage |
|-------------|-------------|---------------------|
| Personas | User archetypes | ✅ Personas |
| User flows | Task-level interaction flows | ✅ Workflows |
| Journey maps | End-to-end experience with emotions | ⚠️ Workflows (functional only) |
| Sitemaps | Information architecture | ❌ Not captured |
| Wireframes | Low-fi screen layouts | ✅ Views |
| Mockups/Prototypes | High-fi designs | ✅ Components, Views |
| Design systems | Tokens, components, patterns | ✅ Tokens, Components, Interactions |
| Usability reports | Test findings | ✅ Sources |
| Content specs | Microcopy, labels, messages | ❌ Not captured |

**Gaps identified**: Sitemaps/IA, content/copy not captured.

### Summary of Gaps

| Gap | Identified From | Priority | Recommendation |
|-----|-----------------|----------|----------------|
| Journey Maps | Double Diamond, NN/g deliverables | Medium | New entity or Workflow extension |
| Information Architecture | NN/g deliverables | Medium | New entity |
| Content/Copy | Atomic Design, NN/g deliverables | Medium | New entity |
| Stakeholder Requirements | ISO 9241-210 | Low | Capability extension or new entity |

---

## Journey Maps Entity

### What Journey Maps Capture

Journey maps visualize the complete user experience across time and touchpoints. Unlike Workflows (which capture functional task flows), journey maps capture:

1. **Emotional arc**: How the user feels at each stage
2. **Touchpoints**: All channels/systems involved (not just the app)
3. **Pain points**: Where friction occurs
4. **Opportunities**: Where to improve
5. **Moments of truth**: Critical decision points

### Research Sources

- [User Journey Map - Figma](https://www.figma.com/resource-library/user-journey-map/)
- [Journey Mapping 101 - Nielsen Norman Group](https://www.nngroup.com/articles/journey-mapping-101/)
- [User Journey vs User Flow - NN/g](https://www.nngroup.com/articles/user-journeys-vs-user-flows/)

Key insight from NN/g: "Journey maps are about the holistic experience, while user flows are about task completion."

### Proposed Schema

```typescript
/**
 * JourneyMap ID pattern: J01, J02, etc. (like Workflows, Views)
 */
const JourneyMapIdSchema = z
    .string()
    .regex(/^J\d{2,3}$/, "ID must match pattern J01, J99, etc.");

/**
 * Emotion levels for journey stages
 */
const EmotionLevelSchema = z.enum([
    "frustrated",
    "anxious",
    "neutral",
    "satisfied",
    "delighted",
]);

/**
 * A single stage in the journey
 */
const JourneyStageSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    description: z.string().optional(),

    // What the user is doing
    actions: z.array(z.string()).min(1),

    // What the user is thinking
    thoughts: z.array(z.string()).optional(),

    // How the user feels
    emotion: EmotionLevelSchema,
    emotion_description: z.string().optional(),

    // Where this happens
    touchpoints: z.array(z.string()).optional().describe(
        "Channels/systems involved, e.g., 'website', 'mobile-app', 'email', 'support'"
    ),

    // Pain points at this stage
    pain_points: z.array(z.string()).optional(),

    // Opportunities for improvement
    opportunities: z.array(z.string()).optional(),

    // Is this a critical decision point?
    moment_of_truth: z.boolean().optional().default(false),

    // Link to workflow if this maps to a functional flow
    workflow: z.string().optional().describe("Workflow ID if applicable"),
});

/**
 * Journey Map schema
 */
export const JourneyMapSchema = z.object({
    id: JourneyMapIdSchema,
    name: z.string().min(1),
    description: z.string().optional(),

    // Which persona takes this journey
    persona: z.string().min(1).describe("Persona ID"),

    // The goal/outcome of this journey
    goal: z.string().min(1),

    // Journey stages in order
    stages: z.array(JourneyStageSchema).min(2),

    // Overall journey duration
    duration: z.string().optional().describe(
        "Typical journey duration, e.g., '5 minutes', '2 weeks'"
    ),

    // Key insights from mapping this journey
    insights: z.array(z.string()).optional(),

    // Metadata
    version: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
    sources: z.array(SourceSchema).optional().default([]),
});
```

### Relationship to Existing Entities

```
Persona (1) → JourneyMap (many)
JourneyMap.stages[].workflow → Workflow (optional, for functional mapping)
```

### Implementation Notes

1. **Store location**: `journey-maps/` directory
2. **ID pattern**: J01, J02, etc. (sequential like Workflows)
3. **Validation**: Persona must exist
4. **Analysis tools**:
   - `design_find_pain_points` - aggregate pain points across journeys
   - `design_journey_coverage` - which workflows are mapped to journeys

---

## Information Architecture Entity

### What Information Architecture Captures

Information architecture (IA) defines the structural organization of content:

1. **Sitemap**: Hierarchical map of all screens/pages
2. **Navigation structure**: Primary, secondary, utility navigation
3. **Labeling system**: Consistent naming conventions
4. **Search systems**: How users find content (if applicable)

### Research Sources

- [Information Architecture Basics - Usability.gov](https://www.usability.gov/what-and-why/information-architecture.html)
- [IA Lenses - Abby Covert](https://abbycovert.com/ia-tools/)
- [Complete Guide to Information Architecture - Toptal](https://www.toptal.com/designers/ia/guide-to-information-architecture)

Key insight: IA is the "blueprint" that Views implement. Views define individual screens; IA defines how screens relate.

### Proposed Schema

```typescript
/**
 * Sitemap ID pattern: kebab-case (typically one per project)
 */
const SitemapIdSchema = z
    .string()
    .regex(/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/, "ID must match kebab-case");

/**
 * Navigation item - a single link in navigation
 */
const NavItemSchema = z.object({
    id: z.string().min(1),
    label: z.string().min(1).describe("Display text for navigation"),

    // Where it links to
    view: z.string().optional().describe("View ID"),
    url: z.string().optional().describe("External URL if not a View"),

    // Visual/behavior hints
    icon: z.string().optional(),
    badge: z.string().optional().describe("Badge text, e.g., 'New', '5'"),

    // Access control
    requires_auth: z.boolean().optional(),
    permissions: z.array(z.string()).optional(),

    // Children for hierarchical navigation
    children: z.array(z.lazy(() => NavItemSchema)).optional(),
});

/**
 * Navigation group - a collection of nav items
 */
const NavigationSchema = z.object({
    primary: z.array(NavItemSchema).describe("Main navigation items"),
    secondary: z.array(NavItemSchema).optional().describe("Less prominent items"),
    utility: z.array(NavItemSchema).optional().describe("User menu, settings, help"),
    footer: z.array(NavItemSchema).optional().describe("Footer navigation"),
});

/**
 * Page node in sitemap hierarchy
 */
const PageNodeSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    view: z.string().optional().describe("View ID for this page"),

    // Hierarchy
    level: z.number().min(0).describe("Depth in hierarchy, 0 = root"),
    parent: z.string().optional().describe("Parent page ID"),
    children: z.array(z.string()).optional().describe("Child page IDs"),

    // Content classification
    content_type: z.string().optional().describe(
        "Type of content, e.g., 'dashboard', 'list', 'detail', 'form', 'settings'"
    ),

    // Priority for crawlers/SEO
    priority: z.number().min(0).max(1).optional().default(0.5),
});

/**
 * Labeling convention
 */
const LabelingRuleSchema = z.object({
    pattern: z.string().describe("What this rule applies to"),
    convention: z.string().describe("The naming convention to follow"),
    examples: z.array(z.string()).optional(),
    anti_examples: z.array(z.string()).optional().describe("What NOT to do"),
});

/**
 * Information Architecture schema
 */
export const SitemapSchema = z.object({
    id: SitemapIdSchema,
    name: z.string().min(1),
    description: z.string().optional(),

    // Site structure
    pages: z.array(PageNodeSchema).min(1),

    // Navigation definition
    navigation: NavigationSchema,

    // Labeling system
    labeling: z.array(LabelingRuleSchema).optional().describe(
        "Naming conventions for consistency"
    ),

    // Global elements (appear on all/most pages)
    global_elements: z.object({
        header: z.array(z.string()).optional().describe("Component IDs"),
        footer: z.array(z.string()).optional().describe("Component IDs"),
        sidebar: z.array(z.string()).optional().describe("Component IDs"),
    }).optional(),

    // Metadata
    version: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
    sources: z.array(SourceSchema).optional().default([]),
});
```

### Relationship to Existing Entities

```
Sitemap.pages[].view → View (many)
Sitemap.navigation.*.view → View
Sitemap.global_elements.* → Component (many)
```

### Implementation Notes

1. **Store location**: `sitemaps/` directory (typically just one file per project)
2. **Validation**: All referenced Views must exist
3. **Analysis tools**:
   - `design_sitemap_coverage` - which Views are in sitemap
   - `design_orphan_views` - Views not in any sitemap
   - `design_nav_depth` - navigation depth analysis

---

## Content Entity

### What Content Captures

Content entities capture the actual text users see:

1. **Microcopy**: Button labels, form labels, tooltips, placeholders
2. **Messages**: Success, error, warning, info messages
3. **Empty states**: Text shown when no data exists
4. **Onboarding**: Walkthrough text, feature tours
5. **Help**: Contextual help, tooltips, documentation links

### Research Sources

- [Microcopy: Complete Guide - UX Writing Hub](https://uxwritinghub.com/microcopy-complete-guide/)
- [UI Copy Best Practices - NN/g](https://www.nngroup.com/articles/ui-copy/)
- [Error Message Guidelines - NN/g](https://www.nngroup.com/articles/error-message-guidelines/)

Key insight: Separating content from components enables:
- **Internationalization (i18n)**: Same component, different content per locale
- **A/B testing**: Test different copy without code changes
- **Content governance**: Writers can update without developers
- **Consistency**: Ensure consistent terminology across app

### Proposed Schema

```typescript
/**
 * Content ID pattern: kebab-case, typically matching component or context
 */
const ContentIdSchema = z
    .string()
    .regex(/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/, "ID must match kebab-case");

/**
 * Content string with optional variants
 */
const ContentStringSchema = z.union([
    z.string(), // Simple string
    z.object({  // String with metadata
        text: z.string(),
        max_length: z.number().optional().describe("Character limit"),
        tone: z.enum(["formal", "friendly", "urgent", "neutral"]).optional(),
        notes: z.string().optional().describe("Context for translators/writers"),
    }),
]);

/**
 * Message variant for different states
 */
const MessageVariantsSchema = z.object({
    default: ContentStringSchema,
    loading: ContentStringSchema.optional(),
    success: ContentStringSchema.optional(),
    error: ContentStringSchema.optional(),
    empty: ContentStringSchema.optional(),
});

/**
 * Form field content
 */
const FieldContentSchema = z.object({
    label: ContentStringSchema,
    placeholder: ContentStringSchema.optional(),
    help_text: ContentStringSchema.optional(),
    error_required: ContentStringSchema.optional(),
    error_invalid: ContentStringSchema.optional(),
    error_min: ContentStringSchema.optional(),
    error_max: ContentStringSchema.optional(),
});

/**
 * Content collection for a component or context
 */
export const ContentSchema = z.object({
    id: ContentIdSchema,
    name: z.string().min(1),
    description: z.string().optional(),

    // What component/context this content is for
    component: z.string().optional().describe("Component ID"),
    view: z.string().optional().describe("View ID"),
    context: z.string().optional().describe("Generic context identifier"),

    // Locale (for i18n)
    locale: z.string().default("en-US"),

    // Content entries - flexible structure
    entries: z.record(z.union([
        ContentStringSchema,
        MessageVariantsSchema,
        FieldContentSchema,
        z.record(ContentStringSchema), // Nested content
    ])),

    // Glossary - terms that must be consistent
    glossary: z.array(z.object({
        term: z.string(),
        definition: z.string(),
        usage: z.string().optional(),
    })).optional(),

    // Metadata
    version: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
    sources: z.array(SourceSchema).optional().default([]),
});
```

### Example Content Entity

```yaml
id: data-import-dialog-content
name: Data Import Dialog Content
component: data-import-dialog
locale: en-US

entries:
  title: "Import Data"
  subtitle: "Upload a file to get started"

  file_input:
    label: "Select file"
    placeholder: "Drag and drop or click to browse"
    help_text: "Supported formats: CSV, JSON, GraphML (max 100MB)"
    error_required: "Please select a file to import"
    error_invalid: "This file format is not supported"
    error_max: "File exceeds 100MB limit"

  submit_button:
    default: "Import"
    loading: "Importing..."
    success: "Import complete"
    error: "Import failed"

  cancel_button: "Cancel"

  empty_state:
    title: "No recent imports"
    description: "Files you import will appear here"
    action: "Import your first file"

glossary:
  - term: "import"
    definition: "Load external data into the system"
    usage: "Use 'import' not 'upload' or 'load'"
```

### Relationship to Existing Entities

```
Content.component → Component (optional)
Content.view → View (optional)
```

### Implementation Notes

1. **Store location**: `content/` directory
2. **Validation**: Referenced Component or View must exist
3. **Analysis tools**:
   - `design_content_coverage` - components without content definitions
   - `design_glossary_check` - terms used inconsistently
   - `design_content_length` - find content exceeding max_length

---

## Stakeholder Requirements

### What Stakeholder Requirements Capture

Requirements that aren't user-driven but constrain the design:

1. **Business rules**: "Must accept ToS before purchase"
2. **Compliance**: "GDPR consent required", "WCAG AA compliance"
3. **Technical constraints**: "Must work offline", "< 3s load time"
4. **Business KPIs**: "Increase conversion 15%", "Reduce support tickets 20%"
5. **Integration requirements**: "Must integrate with SSO", "Support API v2"

### Research Sources

- [Functional vs Non-Functional Requirements - AltexSoft](https://www.altexsoft.com/blog/functional-and-non-functional-requirements-specification-and-types/)
- [Software Requirements Specification - IEEE](https://www.computer.org/resources/software-requirements-specifications)
- [Business Requirements Document - ProductPlan](https://www.productplan.com/glossary/business-requirements-document/)

### Recommended Approach: Extend Capability

Rather than a new entity, extend the Capability schema:

```typescript
// Add to CapabilitySchema
business_requirements: z.array(z.object({
    id: z.string(),
    description: z.string(),
    type: z.enum([
        "compliance",      // Legal/regulatory
        "security",        // Security requirements
        "performance",     // Speed, scale
        "integration",     // External systems
        "business-rule",   // Business logic
        "kpi",             // Success metrics
    ]),
    priority: z.enum(["must-have", "should-have", "nice-to-have"]).optional(),
    verification: z.string().optional().describe("How to verify this is met"),
})).optional(),

technical_constraints: z.array(z.object({
    id: z.string(),
    description: z.string(),
    type: z.enum([
        "browser-support",
        "performance",
        "accessibility",
        "offline",
        "security",
    ]),
    specification: z.string().optional().describe("Specific value, e.g., 'Chrome 90+'"),
})).optional(),
```

### Alternative: Separate Entity

If requirements become complex, create a Requirements entity:

```typescript
export const RequirementSchema = z.object({
    id: z.string().regex(/^R\d{3}$/),  // R001, R002, etc.
    name: z.string(),
    description: z.string(),

    type: z.enum([
        "functional",      // What system does (currently Capability)
        "non-functional",  // Quality attributes
        "business",        // Business rules
        "compliance",      // Legal/regulatory
        "technical",       // Technical constraints
    ]),

    category: z.string().optional(),
    priority: z.enum(["must-have", "should-have", "nice-to-have"]),

    // Traceability
    source: z.string().optional().describe("Where this came from"),
    stakeholder: z.string().optional().describe("Who requested this"),

    // Verification
    verification_method: z.enum(["test", "inspection", "demonstration", "analysis"]),
    acceptance_criteria: z.array(z.string()),

    // Links
    capabilities: z.array(z.string()).optional().describe("Related Capability IDs"),
    workflows: z.array(z.string()).optional().describe("Related Workflow IDs"),

    // Status
    status: z.enum(["proposed", "approved", "implemented", "verified", "rejected"]),

    version: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
    sources: z.array(SourceSchema).optional().default([]),
});
```

### Implementation Notes

1. **Recommended**: Start with Capability extension, migrate to separate entity if needed
2. **Store location**: If separate entity, `requirements/` directory
3. **Analysis tools**:
   - `design_requirements_coverage` - requirements without linked capabilities
   - `design_compliance_check` - verify compliance requirements have verification

---

## Other Enhancements

### Rationale Field

Add `rationale` field to all entities to capture *why* decisions were made:

```typescript
rationale: z.string().optional().describe(
    "Why this entity exists or why key decisions were made"
),
```

This complements Sources (which say *where* information came from) by explaining *why* the team made specific choices.

### Priority and Roadmap Fields

Add to Capability schema:

```typescript
priority: z.enum(["critical", "high", "medium", "low"]).optional(),
target_release: z.string().optional().describe("Version or date target"),
effort_estimate: z.enum(["xs", "s", "m", "l", "xl"]).optional(),
```

### Git History Tool

Add MCP tool for version history:

```typescript
// design_history tool
{
    name: "design_history",
    description: "Get version history for an entity",
    inputSchema: {
        type: "object",
        properties: {
            entity_type: { type: "string", enum: ["workflow", "capability", ...] },
            entity_id: { type: "string" },
            limit: { type: "number", default: 10 },
        },
        required: ["entity_type", "entity_id"],
    },
}
```

Implementation would wrap `git log --follow` for the entity's YAML file.

---

## Research Sources

### UI/UX Process Frameworks

| Source | URL | Key Insight |
|--------|-----|-------------|
| Double Diamond - Design Council | https://www.designcouncil.org.uk/our-resources/the-double-diamond/ | Discover → Define → Develop → Deliver |
| Design Thinking - Stanford d.school | https://dschool.stanford.edu/resources | 5 stages: Empathize, Define, Ideate, Prototype, Test |
| ISO 9241-210 | https://www.iso.org/standard/77520.html | Human-centered design standard |
| Lean UX | https://www.oreilly.com/library/view/lean-ux-2nd/9781491953594/ | Build-Measure-Learn for UX |
| Atomic Design - Brad Frost | https://atomicdesign.bradfrost.com/ | Atoms → Molecules → Organisms → Templates → Pages |

### UX Deliverables

| Source | URL | Key Insight |
|--------|-----|-------------|
| UX Deliverables - IxDF | https://www.interaction-design.org/literature/topics/ux-deliverables | Comprehensive list of UX artifacts |
| Common UX Deliverables - NN/g | https://www.nngroup.com/articles/common-ux-deliverables/ | Industry survey on deliverable usage |
| UX Artifacts - UXPin | https://www.uxpin.com/studio/documentation/ux-artifacts/ | Artifacts per design phase |

### Specific Gap Areas

| Gap | Research Source | URL |
|-----|-----------------|-----|
| Journey Maps | Nielsen Norman Group | https://www.nngroup.com/articles/journey-mapping-101/ |
| Journey vs Flow | Nielsen Norman Group | https://www.nngroup.com/articles/user-journeys-vs-user-flows/ |
| Information Architecture | Usability.gov | https://www.usability.gov/what-and-why/information-architecture.html |
| Microcopy | UX Writing Hub | https://uxwritinghub.com/microcopy-complete-guide/ |
| Error Messages | Nielsen Norman Group | https://www.nngroup.com/articles/error-message-guidelines/ |
| Requirements | IEEE | https://www.computer.org/resources/software-requirements-specifications |

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2025-01-15 | 1.0 | Initial future work document |
