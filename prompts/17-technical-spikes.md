---
title: Technical Spike Planning
tags: [implementation, planning, spikes]
---
**Role & Context**: You are a technical architect identifying high-risk capabilities that need technical spikes before implementation. You have access to Designloom MCP tools.

**Objective**: Identify capabilities requiring technical investigation and plan time-boxed spikes to reduce risk.

**Specific Requirements**:

1. **Understand Technical Spikes**:
   A spike is a time-boxed investigation (1-3 days) to:
   - Reduce uncertainty before committing to implementation
   - Prototype technical approaches
   - Validate feasibility of complex requirements
   - Output: decision, proof-of-concept, or "don't build this"

2. **Identify High-Complexity Capabilities**:
   ```
   design_list --entity_type capability
   ```
   Flag capabilities with:
   - New/unfamiliar technology
   - Complex requirements (many edge cases)
   - Performance-critical requirements
   - External integration dependencies
   - Security-sensitive functionality
   - Notes mentioning "feasibility concern"

3. **Assess Spike Need**:
   For each flagged capability:

   | Question | If Yes | If No |
   |----------|--------|-------|
   | Have we done this before? | Lower risk | Spike candidate |
   | Is the approach proven? | Lower risk | Spike candidate |
   | Are requirements clear? | Lower risk | Research spike |
   | Is scale/performance known? | Lower risk | Performance spike |
   | Are APIs documented? | Lower risk | Integration spike |

4. **Define Spike Scope**:
   For each spike needed:

   ```
   Spike: [CAPABILITY_ID] - [SPIKE_NAME]
   Time-box: [1-3 days]

   Questions to answer:
   1. [Specific question 1]
   2. [Specific question 2]

   Acceptance criteria:
   - Can/cannot do [X]
   - Approach [A] vs [B] decision made
   - Performance meets [target]

   Output:
   - Decision document
   - Proof-of-concept (if applicable)
   - Updated capability requirements
   ```

5. **Update Capability with Spike Info**:
   ```yaml
   design_update --entity_type capability --id [CAPABILITY_ID] --data '{
     "priority": "P0",
     "notes": "SPIKE NEEDED: Evaluate [approach] vs [alternative]. Time-box: 2 days"
   }'
   ```

6. **Document Spike Results** (after completion):
   ```yaml
   design_create --entity_type source --id spike-[capability-id] --title "Technical Spike - [Capability Name]" --url "path/to/spike-results" --summary "Decision: [chosen approach]. Validated [what worked]. Risk: [remaining risk level]"
   ```

   Update capability:
   ```yaml
   design_update --entity_type capability --id [CAPABILITY_ID] --data '{
     "priority": "P0",
     "notes": "Spike complete. Approach: [chosen]. Risk: low"
   }'
   ```

**Success Criteria**:
- All high-complexity capabilities identified
- Spikes defined with time-boxes
- Questions and acceptance criteria clear
- Spike schedule fits before implementation
- No P0 capabilities have unresolved technical uncertainty

---

## Next Steps

After completing this prompt, tell the user:

**Next Prompt: 18 - Vertical Slice Implementation Spec**

Technical spikes have been planned (or completed). The next step is to generate the implementation specification for the Golden Path workflow. Prompt 18 will:
- Auto-select the next workflow to implement (Golden Path first)
- Retrieve all related views, components, and tokens
- Generate a complete implementation specification
- Define acceptance tests from workflow success criteria

**Note:** If spikes are still in progress, wait for spike completion and update capability notes with results before running prompt 18. The spike results may affect the implementation approach.
