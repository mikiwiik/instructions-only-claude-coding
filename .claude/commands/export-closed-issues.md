---
description: Export closed GitHub issues from current month to CSV file
argument-hint: [days] (optional: export issues closed in past N days, default: current month)
---

Export closed GitHub issues to CSV format for analysis and reporting.

## Workflow

**1. Determine Date Range:**

- If `$1` argument provided: Calculate start date as N days ago from today
- If no argument: Use first day of current month as start date

**2. Fetch Closed Issues (via MCP):**

Use the `mcp__github__list_issues` tool to retrieve closed issues:

- `owner`: `mikiwiik`
- `repo`: `instructions-only-claude-coding`
- `state`: `CLOSED`
- `since`: Start date in ISO 8601 format (e.g., `2026-03-01T00:00:00Z`)
- `orderBy`: `UPDATED_AT`, `direction`: `DESC`
- `perPage`: `100` (paginate with `after` cursor if more results)

The MCP tool returns structured data with number, title, state, createdAt, closedAt, author, assignees, labels,
and URL — no `jq` transformation needed.

> **Note**: The `since` filter returns issues updated since that date, which may include issues closed before the
> date range. Filter the results by `closedAt` date to ensure accuracy.

> **Fallback**: If MCP call fails, use `gh issue list --state closed --search "closed:>=$START_DATE"
> --json number,title,state,closedAt,createdAt,author,assignees,labels,url --limit 1000`.

**3. Transform to CSV:**

From the structured MCP response, generate CSV with these columns:

- Number
- Title
- State
- Created At (ISO 8601 format)
- Closed At (ISO 8601 format)
- Author (login)
- Assignees (semicolon-separated logins)
- Labels (semicolon-separated names)
- URL

Write the CSV header and data rows directly — no `jq` pipeline needed since MCP returns structured data.

**4. Generate Output File:**

- Filename pattern: `closed_issues_YYYY-MM-DD_to_YYYY-MM-DD.csv`
- If current month: `closed_issues_YYYY-MM.csv`
- Save to repository root directory

**5. Report Results:**
Display to user:

- Number of issues exported
- Date range covered
- Output filename and location

## Usage Examples

```bash
# Export issues closed in current month
/export-closed-issues

# Export issues closed in past 7 days
/export-closed-issues 7

# Export issues closed in past 30 days
/export-closed-issues 30

# Export issues closed in past 90 days (quarter)
/export-closed-issues 90
```

## Output Format

CSV file with the following structure:

```csv
"Number","Title","State","Created At","Closed At","Author","Assignees","Labels","URL"
289,"bug: App page title","CLOSED","2025-10-26T07:18:20Z","2025-10-26T08:57:59Z","mikiwiik","","priority-2-high;complexity-simple","https://github.com/..."
```

**Arguments**: $ARGUMENTS
