---
title: Source-Backed Persona Creation
tags: [discovery, personas, research]
variables:
  - name: researchFile
    type: file
    message: "Select the research synthesis file from the Discovery phase:"
    required: true
    filter: "*.md"
---
**Role & Context**: You are a UX designer creating research-backed personas from a research synthesis document. You have access to Designloom MCP tools and will create personas with properly embedded source citations.

**Objective**: Create Level 2 (research-validated) personas based on the user segments identified in the research synthesis.

**Research Synthesis**:
Read and analyze: {{researchFile}}

**Specific Requirements**:

1. **Extract from Research File**:
   - User segments identified (under "## User Segments Identified")
   - Source citations (from "## Sources" table)
   - Goals, frustrations, behaviors for each segment
   - Evidence citations (S1, S2, etc.) linking findings to sources

2. **For each user segment, create a persona** that meets quality criteria:
   - **Research-based**: Embed sources from the research file
   - **Goal-focused**: Goals are specific and actionable (not generic)
   - **Context-specific**: Reflects THIS product's usage patterns
   - **Actionable**: Every detail could influence a design decision
   - **Memorable**: Has a distinct name and role

3. **Map research sources to embedded format**:
   Convert source table entries to Designloom's embedded format:
   ```yaml
   sources: [
     { "title": "Title from S1", "url": "https://...", "summary": "Key insight from this source" },
     { "title": "Title from S2", "url": "https://...", "summary": "Key insight from this source" }
   ]
   ```

4. **Create persona entities** using `design_create_persona` with:
   - `id`: kebab-case memorable identifier
   - `name`: Full human name
   - `role`: Specific job title or function (from research)
   - `description`: Key characteristic that makes them distinct
   - `goals`: 2-3 specific, actionable goals (from research findings)
   - `frustrations`: Real pain points (from research findings)
   - `characteristics`: expertise level, frequency, context (from research)
   - `sources`: Array of source objects (converted from research file)

5. **Maintain traceability**:
   - Note which research source IDs (S1, S2) informed each field
   - Include key quotes in the description if available
   - Set confidence based on research evidence strength

6. **Validate the work**:
   - Run `design_validate` to confirm no errors
   - Verify each persona has at least 1 embedded source
   - Confirm all high-confidence research segments have corresponding personas

**Format & Structure**:
```yaml
design_create_persona --data '{
  "id": "analyst-alex",
  "name": "Alex Chen",
  "role": "Senior Financial Analyst",
  "description": "Data-driven analyst who processes 10+ reports daily. Key quote: \"I need answers in seconds, not minutes\" (S1)",
  "goals": [
    "Generate risk reports in under 5 minutes",
    "Compare multiple portfolios side-by-side"
  ],
  "frustrations": [
    "Current tools require too many clicks to get basic data",
    "Cannot see real-time updates without manual refresh"
  ],
  "characteristics": {
    "expertise": "advanced",
    "frequency": "daily",
    "context": "desktop, office environment"
  },
  "sources": [
    { "title": "Financial Analyst Workflow Study", "url": "https://example.com/study", "summary": "Found analysts spend 40% of time on data gathering" },
    { "title": "Reddit r/financialanalysts", "url": "https://reddit.com/r/...", "summary": "Common complaint about slow refresh rates" }
  ]
}'
```

7. **Verify research traceability** (reflexion step):
   After creating all personas, verify completeness:

   **Forward Check (Research → Personas)**:
   - Review the research file's "User Segments Identified" section
   - For each segment with High or Medium confidence, confirm a persona was created
   - Flag any segments that were skipped and document why

   **Backward Check (Personas → Research)**:
   - For each persona created, verify:
     - Goals trace to specific findings in the research (cite source IDs)
     - Frustrations trace to specific findings in the research
     - Sources array contains entries from the research file's Sources table
   - Flag any persona fields that lack research backing

   **Quick Traceability Table**:
   ```
   | Research Segment | Persona Created | Sources Embedded | Gaps |
   |------------------|-----------------|------------------|------|
   | [Segment 1]      | [persona-id]    | S1, S2           | None |
   | [Segment 2]      | [persona-id]    | S3               | Missing frustration source |
   ```

   If gaps are found, either:
   - Update the persona to add missing source citations
   - Document why the gap is acceptable (e.g., assumption-based, to be validated)

**Success Criteria**:
- Persona created for each high-confidence research segment
- Each persona has at least 1 embedded source with title, URL, and summary
- Goals and frustrations trace back to research findings
- `design_validate` returns no errors
- Research coverage: all major segments represented
- Traceability table completed with no unexplained gaps

---

## Next Steps

After completing this prompt, tell the user:

**Next Prompt: 04 - Workflow Creation from Personas**

With research-validated personas now in Designloom, the next step is to define the user workflows (journeys) that these personas need to accomplish. Prompt 04 will:
- Analyze persona goals to identify workflows
- Create workflow entities linked to personas
- Define success criteria and starting states for each workflow

Note: Prompt 03 does not exist in this sequence. Proceed directly to prompt 04.
