---
description: Export closed GitHub issues from current month to CSV file
argument-hint: [days] (optional: export issues closed in past N days, default: current month)
---

Export closed GitHub issues to CSV format for analysis and reporting.

## Workflow

**1. Determine Date Range:**

- If `$1` argument provided: Calculate start date as N days ago
- If no argument: Use first day of current month as start date

**2. Fetch Closed Issues:**
Execute the following command to retrieve closed issues:

```bash
gh issue list --state closed --search "closed:>=YYYY-MM-DD" --json number,title,state,closedAt,createdAt,author,assignees,labels,url --limit 1000
```

**3. Transform to CSV:**
Use `jq` to convert JSON to CSV format with the following columns:

- Number
- Title
- State
- Created At (ISO 8601 format)
- Closed At (ISO 8601 format)
- Author (login)
- Assignees (semicolon-separated logins)
- Labels (semicolon-separated names)
- URL

**4. Generate Output File:**

- Filename pattern: `closed_issues_YYYY-MM-DD_to_YYYY-MM-DD.csv`
- If current month: `closed_issues_YYYY-MM.csv`
- Save to repository root directory

**5. Report Results:**
Display to user:

- Number of issues exported
- Date range covered
- Output filename and location

## Implementation Details

**Date Calculation:**

```bash
# For current month (no argument)
START_DATE=$(date '+%Y-%m-01')
DATE_LABEL=$(date '+%Y-%m')

# For N days ago (with argument)
START_DATE=$(date -v-${1}d '+%Y-%m-%d')
DATE_LABEL="past_${1}_days"
```

**CSV Generation Command:**

```bash
gh issue list --state closed --search "closed:>=$START_DATE" --json number,title,state,closedAt,createdAt,author,assignees,labels,url --limit 1000 | \
jq -r '["Number","Title","State","Created At","Closed At","Author","Assignees","Labels","URL"],
       (.[] | [.number, .title, .state, .createdAt, .closedAt, .author.login,
               ([.assignees[].login] | join(";")),
               ([.labels[].name] | join(";")),
               .url]) | @csv' > "closed_issues_${DATE_LABEL}.csv"
```

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
