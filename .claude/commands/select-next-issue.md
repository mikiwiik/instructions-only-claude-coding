---
description: Analyze Backlog issues and recommend the next one to work on
---

Analyze open GitHub issues and recommend the next issue to work on.

## Step 1: Fetch Open Issues (via MCP)

Use the `mcp__github__list_issues` tool to retrieve open issues:

- `owner`: `mikiwiik`
- `repo`: `instructions-only-claude-coding`
- `state`: `OPEN`
- `orderBy`: `UPDATED_AT`, `direction`: `DESC`
- `perPage`: `100` (paginate with `after` cursor if more results)

The MCP tool returns structured data with number, title, labels, state, and assignees — no `jq` pipeline needed.

> **Note**: MCP has no project-level tools, so project Status/Lifecycle fields are not available. Use issue
> labels (priority-\*, complexity-\*) and state (OPEN) as filtering criteria instead.

> **Fallback**: If MCP call fails, use `gh project item-list 1 --owner mikiwiik --format json --limit 1000 |
> jq '[.items[] | select(.status == "Backlog") | {number: .content.number, title: .title, labels: .labels}]'`.

## Step 2: Filter for Backlog-Eligible Issues

From the MCP response, exclude issues that are:

- Already assigned (likely in progress)
- Labeled `icebox` or `blocked` (not ready for work)

## Step 3: Analyze and Recommend

Group by priority (priority-1-critical → priority-4-low) and complexity (minimal → epic), then provide:

1. Issue summary table with priority/complexity breakdown
2. Top 3-5 recommendations using this framework:
   - **Quick Wins**: High priority + minimal/simple complexity
   - **Strategic Work**: High priority + moderate complexity
   - **Maintenance**: Medium priority + simple complexity
3. Suggested next action
