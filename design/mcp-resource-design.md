# MCP Resources vs Tools: Design Analysis

> **Decision:** Stick with tools-only approach for now.
> **Date:** 2026-01-13

## Summary

This document captures research and analysis on whether designloom should expose MCP resources in addition to tools. The conclusion is to defer resource implementation, but this analysis provides the foundation for future reconsideration.

---

## Core Distinction: Control Model

| Aspect | **Tools** | **Resources** |
|--------|-----------|---------------|
| **Control** | Model-controlled (AI decides when to use) | Application-controlled (user/app decides) |
| **Purpose** | Execute actions, perform operations | Provide read-only data/context |
| **Discovery** | Listed once, invoked automatically | Listed for explicit user selection |
| **Side effects** | Can mutate state | Read-only by design |

> *"If you want data to be automatically available to the model, use a Tool. If you want the application or user to control what context gets loaded, use a Resource."* — [WorkOS MCP Features Guide](https://workos.com/blog/mcp-features-guide)

---

## When to Use Resources

Choose resources when:
- **User opt-in is required** — sensitive data users should explicitly share
- **Large reference materials** — shouldn't auto-load but should be browsable
- **Compliance requirements** — explicit consent needed before exposure
- **Static/semi-static content** — documentation, schemas, configs
- **Design system consistency** — UI components, templates

Good resource candidates:
- API documentation
- Configuration files
- Database schemas
- Design system components
- Historical logs (user-selected)

---

## When to Use Tools

Choose tools when:
- **AI should decide** when to access/use data
- **Actions with side effects** — booking, sending, triggering
- **Dynamic queries** — filtering, searching with parameters
- **Computation needed** — analysis, validation, generation

---

## Client Feature Support (as of 2026-01)

| Client | Tools | Resources | Prompts | Source |
|--------|:-----:|:---------:|:-------:|--------|
| **Claude Code** | ✅ | ✅ | ✅ | [Official docs](https://code.claude.com/docs/en/mcp) |
| **Claude Desktop** | ✅ | ✅ | ✅ | [Apify registry](https://github.com/apify/mcp-client-capabilities) |
| **Cursor** | ✅ | ✅ | ✅ | [MCP Availability](https://mcp-availability.com) |
| **VS Code Copilot** | ✅ | ✅ | ✅ | 7/7 features |
| **Cline** | ✅ | ✅ | ✅ | Apify registry |
| **ChatGPT** | ✅ | ❌ | ❌ | Tools only |
| **JetBrains AI** | ✅ | ❌ | ❌ | 1/7 features |
| **Amazon Q IDE** | ✅ | ❌ | ❌ | Tools only |

### Ecosystem Statistics
- Tools: **100%** of clients
- Resources: **39%** of clients
- Prompts: **38%** of clients

Source: [MCP Availability Matrix](https://mcp-availability.com)

### How Resources Work in Claude Code

Reference resources with `@` mentions:
```
Can you analyze @github:issue://123 and suggest a fix?
Compare @postgres:schema://users with @docs:file://database/user-model
```

---

## LLM Quality: Resources vs Tools

From [Hackteam](https://hackteam.io/blog/your-llm-does-not-care-about-mcp/):

> *"To your LLM, there's no difference between 'regular' tool calling and using MCP. It only sees a list of tool definitions, it doesn't know or care what's happening behind the scenes."*

### What the LLM Actually Sees

| Mechanism | What LLM Receives |
|-----------|-------------------|
| **Tool call** | Tool result injected into context |
| **Resource** | Resource content injected into context |
| **Both** | Just text/data in the context window |

**The LLM doesn't know the difference.** The quality impact comes from:
1. **When data enters context** (upfront vs on-demand)
2. **Who controls it** (user/app vs model)
3. **Token efficiency** (tool schemas consume tokens)

### Token Budget Implications

From [Anthropic's engineering blog](https://www.anthropic.com/engineering/writing-tools-for-agents):

| Approach | Context Cost |
|----------|--------------|
| 15 tools with schemas | ~5-7% of context before any user input |
| Resources (pre-selected) | Data only, no schema overhead |
| Consolidated tools | Fewer schemas = less overhead |

---

## Design Patterns

### 1. "Less is More" Pattern
> *"When you expose more tools to an AI agent, performance degrades."* — [Klavis AI](https://www.klavis.ai/blog/less-is-more-mcp-design-patterns-for-ai-agents)

Minimize tool count; bundle related operations.

### 2. Workflow-Based Design
> *"Think of MCP tools as tailored toolkits that help an AI achieve a particular task, not as API mirrors."* — Vercel

Don't map 1:1 with API endpoints.

### 3. "Smart Database" Not "Smart Analyst"
> *"MCP Server = Specialized information provider with rich, structured data; LLM = Intelligent consumer that analyses."* — [Matt Adams](https://www.matt-adams.co.uk/2025/08/30/mcp-design-principles.html)

Return complete data; let the LLM analyze.

### 4. Design for the Agent
> *"The agent/LLM is the end user of your tools, not the human."* — [Docker](https://www.docker.com/blog/mcp-server-best-practices/)

Error messages should help agents decide next steps.

---

## Anti-Patterns to Avoid

| Anti-Pattern | Problem |
|--------------|---------|
| **1:1 API mapping** | Tool bloat degrades performance |
| **Making servers "too smart"** | LLMs handle analysis better |
| **Keyword matching** | Brittle semantic analysis |
| **Convenience limits** | Artificially constraining output |
| **Empty promises** | Tools returning placeholder data |
| **Final output pattern** | Returning formatted text vs structured data |

---

## If We Add Resources Later

### Proposed Resource URIs

```
designloom://workflows/              → List all workflows
designloom://workflows/{id}          → Single workflow
designloom://personas/               → List all personas
designloom://personas/{id}           → Single persona
designloom://capabilities/           → List all capabilities
designloom://capabilities/{id}       → Single capability
designloom://components/             → List all components
designloom://components/{id}         → Single component
designloom://schemas/{entity}        → JSON schema for validation
```

### Keep as Tools

```
Mutations:
  create_workflow, update_workflow, delete_workflow
  create_persona, update_persona, delete_persona
  create_capability, update_capability, delete_capability
  create_component, update_component, delete_component
  link, unlink

Analysis (requires computation):
  validate
  coverage_report
  find_gaps
  find_orphans
  suggest_priority
  export_diagram
  generate_tests
```

### Why This Would Be Cleaner

| Aspect | Current (All Tools) | Resource + Tools |
|--------|---------------------|------------------|
| **Separation of concerns** | Read and write mixed | Read = Resources, Write = Tools |
| **Token budget** | 15+ tools listed upfront | ~8 tools + resources on-demand |
| **User control** | AI decides what to fetch | User selects relevant context |
| **Semantic clarity** | `list_workflows` is really a query | Resources ARE the data |
| **Caching** | Tool results aren't cacheable | Resources can be cached |
| **Subscriptions** | Not available | Can subscribe to changes |

---

## The "Lowest Common Denominator" Problem

From [PulseMCP](https://www.pulsemcp.com/posts/mcp-client-capabilities-gap):

> *"Servers are forced to adopt the lowest common denominator design, implementing only the minimal MCP features that all clients are guaranteed to understand."*

This creates a chicken-and-egg:
- Servers don't implement resources → Clients don't prioritize resource support
- Clients don't support resources → Servers stick with tools

---

## Designloom Context

Key characteristics of our use case:
1. **Data is mostly static** — workflows, personas, capabilities created once, rarely changed
2. **Reference material** — design artifacts inform conversations
3. **User knows context** — user typically knows which workflows/personas are relevant

This pattern aligns well with the resource model, but the tools-only approach works fine and has universal client support.

---

## Sources

- [MCP Tools Specification](https://modelcontextprotocol.io/specification/2025-06-18/server/tools)
- [MCP Resources Specification](https://modelcontextprotocol.io/specification/2025-06-18/server/resources)
- [Claude Code MCP Docs](https://code.claude.com/docs/en/mcp)
- [MCP Availability Matrix](https://mcp-availability.com)
- [Apify MCP Client Capabilities](https://github.com/apify/mcp-client-capabilities)
- [WorkOS MCP Features Guide](https://workos.com/blog/mcp-features-guide)
- [Docker MCP Best Practices](https://www.docker.com/blog/mcp-server-best-practices/)
- [Matt Adams MCP Design Principles](https://www.matt-adams.co.uk/2025/08/30/mcp-design-principles.html)
- [Klavis AI Design Patterns](https://www.klavis.ai/blog/less-is-more-mcp-design-patterns-for-ai-agents)
- [Zuplo MCP Resources](https://zuplo.com/blog/mcp-resources)
- [PulseMCP Client Capability Gap](https://www.pulsemcp.com/posts/mcp-client-capabilities-gap)
- [Hackteam: LLM Doesn't Care About MCP](https://hackteam.io/blog/your-llm-does-not-care-about-mcp/)
- [Anthropic: Writing Tools for Agents](https://www.anthropic.com/engineering/writing-tools-for-agents)
