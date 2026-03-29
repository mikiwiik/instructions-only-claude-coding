---
description: Find and prioritize quick win issues (high priority + simple complexity)
---

Find quick win opportunities from open, triaged GitHub issues:

1. **Fetch Open Issues (via MCP)**: Use the `mcp__github__list_issues` tool to retrieve open issues:

   - `owner`: `mikiwiik`
   - `repo`: `instructions-only-claude-coding`
   - `state`: `OPEN`
   - `orderBy`: `UPDATED_AT`, `direction`: `DESC`
   - `perPage`: `100` (paginate with `after` cursor if more results)

   The MCP tool returns structured data with number, title, labels, state, and assignees — no `jq` pipeline needed.

   > **Note**: MCP has no project-level tools, so project Status/Lifecycle fields are not available. Use issue
   > labels (priority-\*, complexity-\*) and state (OPEN) as filtering criteria instead.

   > **Fallback**: If MCP call fails, use `gh project item-list 1 --owner mikiwiik --format json |
   > jq '{items: [.items[] | {content: {number: .content.number}, title: .title, labels: .labels,
   > lifecycle: .lifecycle, status: .status}]}'`.

2. **Filter for Quick Wins**: From the structured MCP response, identify issues that are:
   - High priority (priority-2-high) + Simple complexity (complexity-simple or complexity-minimal)
   - Medium priority (priority-3-medium) + Minimal complexity (complexity-minimal)
   - Not assigned (available for work)
   - Not labeled `icebox` or `blocked`
3. **Impact Analysis**: Assess which quick wins provide maximum value
4. **Implementation Estimate**: Provide time estimates for each quick win

**Quick Win Criteria**:

- Can be completed in single development session
- High user or developer value
- Low risk of introducing bugs
- Clear requirements and scope

**Output Format**:

- Ranked list of quick wins with impact/effort ratios
- Recommended sequence for completing multiple quick wins
- Estimated completion times
