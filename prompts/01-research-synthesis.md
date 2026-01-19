---
title: Research Synthesis
tags: [discovery, research, sources]
variables:
  - name: projectContext
    type: editor
    message: "Describe your project (required): What are you building? What domain/industry? What problem does it solve? Who are the likely users?"
    required: true
  - name: existingResearch
    type: editor
    message: "Optional: Paste existing research materials (interview transcripts, survey results, articles, competitive analysis, user feedback, etc.)"
    required: false
  - name: webResearchTopics
    type: editor
    message: "Optional: List topics to research online (e.g., 'financial analyst workflows', 'competitor dashboard UX', 'data visualization best practices')"
    required: false
---
**Role & Context**: You are a senior UX researcher conducting foundational research that will drive all downstream design decisions. The quality and comprehensiveness of this research directly determines the quality of personas, workflows, capabilities, and ultimately the product itself. Shallow or incomplete research leads to flawed designs.

**Objective**: Create a comprehensive, well-sourced research synthesis through systematic, iterative investigation. Take your time. Be thorough. This is the foundation everything else builds on.

**Project Context**:
{{projectContext}}

{{#if existingResearch}}
**Existing Research Materials**:
{{existingResearch}}
{{/if}}

{{#if webResearchTopics}}
**Topics to Research Online**:
{{webResearchTopics}}
{{/if}}

---

## Research Approach

**Mindset**: Approach this research systematically and methodically. Do not rush. It is better to spend more time gathering comprehensive research than to proceed with gaps that will compound into design problems later.

**If neither existing research nor web topics are provided**: You must still conduct research. Use the project context to identify relevant topics and conduct web research autonomously. Ask clarifying questions only if the project context is too vague to begin.

---

## Quality Thresholds

Research is NOT complete until these minimums are met:

### Quantitative Minimums
| Category | Minimum | Purpose |
|----------|---------|---------|
| **Total sources** | 5+ | Sufficient breadth |
| **Source types** | 2+ distinct types | Avoid echo chamber |
| **User segments** | 2+ | Most products serve multiple user types |
| **Goals per segment** | 2+ | Enough to define meaningful workflows |
| **Pain points per segment** | 2+ | Enough to prioritize solutions |
| **Competitors/alternatives** | 1+ | Context for differentiation |

### Source Type Diversity
Include sources from at least 2 of these categories:
- **Academic/Industry**: Research papers, industry reports, UX case studies
- **User Voice**: Forums (Reddit, Stack Exchange), reviews, social media discussions
- **Competitive**: Competitor websites, product reviews, comparison articles
- **Expert**: Blog posts from practitioners, conference talks, documentation
- **Primary** (if provided): Interview transcripts, survey results, analytics

### Coverage Requirements
The research must address ALL of these dimensions:

| Dimension | Question to Answer | Feeds Into |
|-----------|-------------------|------------|
| **WHO** | Who are the distinct user types? What are their roles, expertise levels, demographics? | Personas |
| **WHAT** | What are they trying to accomplish? What tasks do they perform? | Workflows |
| **WHY** | What frustrates them? What unmet needs exist? What problems do they face? | Capabilities |
| **HOW** | How do they currently work? What tools/workarounds do they use? | Interaction patterns |
| **WHERE** | What devices, environments, constraints? How frequently? | Component design |
| **VERSUS** | What alternatives exist? What do competitors do well/poorly? | Differentiation |

---

## Research Process (Iterative)

### Phase 1: Initial Research

1. **Process Existing Research** (if provided):
   - Read each material carefully and completely
   - Extract user goals, frustrations, behaviors, and context
   - Note direct quotes — these are gold for personas
   - Assign source IDs (S1, S2, etc.) for traceability
   - Note what categories each source covers (WHO/WHAT/WHY/HOW/WHERE/VERSUS)

2. **Conduct Web Research**:
   Even if topics are provided, expand based on what you learn. Research iteratively:

   **Round 1 - Breadth**: Search across all coverage dimensions
   - User roles and segments in this domain
   - Common goals and tasks
   - Frustrations and pain points (forums are excellent for this)
   - Current tools and workflows
   - Competitor landscape

   **Round 2 - Depth**: For each user segment identified, search specifically for:
   - "[Role] workflow" / "[Role] daily tasks"
   - "[Role] frustrations" / "[Role] pain points"
   - "[Domain] best practices"
   - "[Competitor] reviews" / "[Competitor] vs alternatives"

3. **Catalog Sources Systematically**:
   For each source, record:
   - Unique ID (S1, S2, etc.)
   - Title and URL
   - Source type (Academic/User Voice/Competitive/Expert/Primary)
   - Date (for recency assessment)
   - Key insights (2-3 sentences)
   - Which coverage dimensions it addresses

### Phase 2: Gap Analysis

After initial research, evaluate coverage:

```
Coverage Assessment:
[ ] WHO: Do we have 2+ distinct segments with evidence?
[ ] WHAT: Do we have 2+ goals per segment with evidence?
[ ] WHY: Do we have 2+ pain points per segment with evidence?
[ ] HOW: Do we understand current behaviors/workflows?
[ ] WHERE: Do we know context of use (devices, frequency, environment)?
[ ] VERSUS: Do we understand the competitive landscape?

Source Assessment:
[ ] Do we have 5+ total sources?
[ ] Do we have 2+ source types?
[ ] Do high-confidence findings have 2+ sources agreeing?
```

**If gaps exist**: Return to Phase 1 and conduct targeted research to fill specific gaps. Do not proceed with incomplete coverage.

### Phase 3: Synthesis

Only after coverage is adequate:

1. **Consolidate User Segments**:
   - Group similar findings into distinct segments
   - Ensure each segment is meaningfully different from others
   - Assign confidence levels based on evidence strength

2. **Triangulate Findings**:
   - Findings supported by 2+ sources = High confidence
   - Findings from 1 credible source = Medium confidence
   - Findings inferred or assumed = Low confidence (flag for validation)

3. **Identify Remaining Gaps**:
   - What questions remain unanswered?
   - What segments have thin evidence?
   - What would strengthen confidence?

### Phase 4: Quality Self-Check

Before finalizing, verify:

```
Quality Checklist:
[ ] All quantitative minimums met (sources, segments, goals, pain points)
[ ] All coverage dimensions addressed (WHO/WHAT/WHY/HOW/WHERE/VERSUS)
[ ] Source diversity requirement met (2+ types)
[ ] Each segment has evidence citations
[ ] High-priority findings have triangulation (2+ sources)
[ ] Confidence levels assigned honestly
[ ] Gaps explicitly documented (not hidden)
[ ] Output file structure is complete
```

**If any checkbox fails**: Address the gap before proceeding. It is better to iterate now than to build on a weak foundation.

---

## Output Format

Write the synthesis to {{reviewFile "outputFile" "Select where to save the research synthesis (e.g., research-synthesis.md)"}} using this structure:

```markdown
# Research Synthesis: [Project Name]
Date: {{date}}

## Executive Summary
[2-3 sentences: Key user segments, primary goals, major pain points, competitive context]

## Project Context
- **Product**: [What is being built]
- **Domain**: [Industry/space]
- **Problem**: [What problem it solves]
- **Target Users**: [Initial hypothesis about users]

## Research Quality Summary
- **Total Sources**: [N]
- **Source Types**: [List types represented]
- **User Segments**: [N] identified
- **Coverage**: [WHO/WHAT/WHY/HOW/WHERE/VERSUS - all addressed?]
- **Confidence**: [Overall assessment]

## Sources
| ID | Title | URL | Type | Date | Coverage | Summary |
|----|-------|-----|------|------|----------|---------|
| S1 | [Title] | [URL] | [Type] | [Date] | WHO, WHAT | [2-3 sentence summary] |
| S2 | ... | ... | ... | ... | ... | ... |

## User Segments Identified

### Segment 1: [Descriptive Name]
- **Role**: [Job title or function]
- **Expertise Level**: [Novice/Intermediate/Advanced]
- **Goals**:
  - [Goal 1] — Evidence: S1, S2
  - [Goal 2] — Evidence: S3
- **Frustrations**:
  - [Frustration 1] — Evidence: S1
  - [Frustration 2] — Evidence: S2, S4
- **Current Behaviors**: [How they work today]
- **Context**: [Devices, frequency, environment]
- **Evidence**: [S1, S3] (primary sources for this segment)
- **Confidence**: [High/Medium/Low] — [Rationale]
- **Key Quotes**:
  - "[Direct quote]" — S1
  - "[Another quote]" — S3

### Segment 2: [Descriptive Name]
...

## Key Findings

### User Goals (WHAT)
| Goal | Segments | Evidence | Confidence |
|------|----------|----------|------------|
| [Goal 1] | Segment 1, 2 | S1, S2, S3 | High |
| [Goal 2] | Segment 1 | S4 | Medium |

### Pain Points (WHY)
| Pain Point | Segments | Evidence | Confidence |
|------------|----------|----------|------------|
| [Pain point 1] | Segment 1 | S1, S2 | High |
| [Pain point 2] | Segment 2 | S3 | Medium |

### Behavior Patterns (HOW)
- [Pattern 1] — Evidence: S2
- [Pattern 2] — Evidence: S1, S3

### Context of Use (WHERE)
- **Devices**: [What devices they use]
- **Frequency**: [How often they perform tasks]
- **Environment**: [Where they work]
- **Constraints**: [Limitations, requirements]

## Competitive Landscape (VERSUS)
| Competitor | Strengths | Weaknesses | User Sentiment | Source |
|------------|-----------|------------|----------------|--------|
| [Name] | [What they do well] | [Gaps/complaints] | [Positive/Mixed/Negative] | S4 |

## Research Gaps
Issues requiring additional investigation:
- [ ] [Topic that needs more investigation] — Impact: [High/Medium/Low]
- [ ] [User segment with limited data] — Impact: [High/Medium/Low]
- [ ] [Question that remains unanswered] — Impact: [High/Medium/Low]

## Recommendations for Next Steps
1. **Personas to create**: [List segments ready for persona creation, with confidence assessment]
2. **Workflows to define**: [Key tasks identified from research]
3. **Capabilities to consider**: [Features suggested by pain points]
4. **Additional research needed**: [Priority gaps to fill]

## Confidence Assessment
| Aspect | Confidence | Rationale |
|--------|------------|-----------|
| User segments | [H/M/L] | [Why] |
| Goals | [H/M/L] | [Why] |
| Pain points | [H/M/L] | [Why] |
| Competitive landscape | [H/M/L] | [Why] |

## Appendix: Raw Notes
[Optional: Include detailed notes, full quotes, or additional context that didn't fit above]
```

---

## Success Criteria

The research synthesis is complete when ALL of the following are true:

### Quantitative
- [ ] 5+ sources cataloged with IDs, titles, URLs, types, and summaries
- [ ] 2+ distinct source types represented
- [ ] 2+ user segments identified with evidence citations
- [ ] 2+ goals per segment with source citations
- [ ] 2+ pain points per segment with source citations
- [ ] 1+ competitor/alternative analyzed

### Coverage
- [ ] WHO: User segments clearly defined with roles and expertise
- [ ] WHAT: Goals and tasks documented per segment
- [ ] WHY: Pain points and frustrations documented per segment
- [ ] HOW: Current behaviors and workflows understood
- [ ] WHERE: Context of use documented (devices, frequency, environment)
- [ ] VERSUS: Competitive landscape understood

### Quality
- [ ] High-confidence findings supported by 2+ sources
- [ ] Confidence levels assigned to all segments and key findings
- [ ] Research gaps explicitly identified with impact assessment
- [ ] Output file follows the complete structure
- [ ] Executive summary accurately reflects the research

### Iteration
- [ ] Gap analysis performed after initial research
- [ ] Additional research conducted to fill critical gaps
- [ ] Quality self-check completed before finalizing

**If any criterion is not met**: Continue iterating. Do not proceed to persona creation with incomplete research — the gaps will compound into larger problems downstream.

---

## Next Steps

After completing this prompt, tell the user:

**Next Prompt: 02 - Source-Backed Persona Creation**

The research synthesis you just created will serve as the foundation for creating research-validated personas. The output file from this prompt becomes the `researchFile` input for prompt 02, which will:
- Extract user segments identified in the research
- Create persona entities with embedded source citations
- Maintain traceability from research findings to persona attributes

Inform the user of the output file location and confirm they are ready to proceed to persona creation.
