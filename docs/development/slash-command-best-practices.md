# Slash Command Best Practices

## Purpose

This guide establishes token-efficient patterns and best practices for developing slash commands in
`.claude/commands/`. Following these practices prevents token limit issues and ensures reliable command execution.

## Background

**Token limits in Claude Code context window:**

- Read tool maximum: 25,000 tokens
- Average: ~3.5 bytes per token
- File size limit: ~87KB for Read tool

**Discovery:** Commands fetching GitHub data can easily exceed limits when including full issue bodies,
leading to "File content exceeds maximum allowed tokens" errors.

## Token-Efficient Patterns

### ✅ Pattern 1: Strip Unnecessary Data Immediately

**Problem:** Fetching all GitHub data then filtering later

```bash
# ❌ BAD: Includes full issue bodies, URLs, timestamps, etc.
gh project item-list 1 --owner mikiwiik --format json
```

**Solution:** Use `jq` to strip unnecessary fields immediately

```bash
# ✅ GOOD: Only metadata needed for analysis (94% token reduction)
gh project item-list 1 --owner mikiwiik --format json | \
  jq '{items: [.items[] | {content: {number: .content.number}, title: .title, labels: .labels, lifecycle: .lifecycle, status: .status}]}'
```

**Token Impact:**

- Original: 159,204 bytes / 45,486 tokens
- Optimized: 9,549 bytes / 2,728 tokens
- **Savings: 42,758 tokens (94% reduction)**

### ✅ Pattern 2: Use Specific Field Selection

**When available, use `--json` with specific fields:**

```bash
# ✅ GOOD: Only fetch needed fields
gh issue list --state closed \
  --json number,title,state,closedAt,createdAt,author,assignees,labels,url \
  --limit 1000
```

**Benefits:**

- Reduces payload size
- Faster API responses
- More predictable token consumption

### ✅ Pattern 3: Use Limit Flags for Large Datasets

```bash
# ✅ GOOD: Prevent unbounded data fetching
gh issue list --limit 100
gh pr list --limit 50
```

### ✅ Pattern 4: Single Item Fetches Are Acceptable

```bash
# ✅ ACCEPTABLE: Single issue/PR bodies are within limits
gh issue view $1
gh pr view $1
```

**Rationale:** Single item bodies rarely exceed 25,000 tokens. Issues arise with bulk data fetches.

## Command Development Checklist

When creating or modifying slash commands:

- [ ] **Identify data sources**: Does the command fetch GitHub data?
- [ ] **Assess token risk**: Is it bulk data (issues/PRs/projects) or single items?
- [ ] **Apply optimization**: Use `jq` filters or `--json` field selection for bulk data
- [ ] **Measure token consumption**: Test with real project data
- [ ] **Document optimization**: Add comments explaining token-efficient choices
- [ ] **Test functionality**: Verify optimized command maintains full functionality

## Common Pitfalls

### Pitfall 1: Fetching Full Project Data

```bash
# ❌ Problematic for projects with many issues
gh project item-list <id> --format json
```

**Fix:** Strip issue bodies immediately with `jq`

### Pitfall 2: Unbounded Issue Lists

```bash
# ❌ Could fetch thousands of issues
gh issue list --state all
```

**Fix:** Add `--limit` flag and filter for specific states

### Pitfall 3: Unnecessary Fields

```bash
# ❌ Includes body, reactions, comments, etc.
gh issue list --json "*"
```

**Fix:** Specify only needed fields explicitly

## Measuring Token Consumption

**Quick estimate:**

```bash
# Get file size in bytes
wc -c data.json

# Estimate tokens (divide by 3.5)
awk '{printf "Estimated tokens: %d\n", $1/3.5}' < <(wc -c < data.json)
```

**Token budgets for different operations:**

| Operation          | Recommended Limit | Reasoning                      |
| ------------------ | ----------------- | ------------------------------ |
| Single item fetch  | No limit          | Rarely exceeds 25K tokens      |
| Bulk metadata only | 15,000 tokens     | Leaves buffer for processing   |
| Full issue bodies  | Avoid             | Exceeds limits with 30+ issues |

## Examples from Project

### Current: MCP-First Commands

All four read-only commands (`/user-info`, `/export-closed-issues`, `/select-next-issue`, `/quick-wins`) now use
GitHub MCP tools as their primary data source, with `gh` CLI as documented fallbacks. See each command file in
`.claude/commands/` for the current implementation.

### Historical: CLI Token Optimization (#320, #321)

Before MCP migration, these commands used `gh` CLI + `jq` pipelines. Token optimization was critical:

- **Problem**: `gh project item-list` returned 45,486 tokens (full issue bodies)
- **Fix**: `jq` filters stripped to metadata-only → 2,728 tokens (94% reduction)
- **Current state**: MCP returns structured data natively, eliminating both the token problem and `jq` pipelines

## MCP Query Patterns

With the GitHub MCP server ([ADR-040](../adr/040-github-mcp-server.md)), slash commands can use MCP tools instead of
`gh` CLI + `jq` pipelines. MCP returns structured data natively, eliminating shell parsing entirely.

### ✅ Pattern 5: Use MCP Tools for Structured Data

**Problem:** Shelling out to `gh` CLI and parsing with `jq`

```bash
# ❌ OLD: CLI + jq pipeline
gh issue list --state closed --json number,title,labels --limit 100 | \
  jq '[.[] | {number, title, labels: [.labels[].name]}]'
```

**Solution:** Use MCP tools that return structured data directly

```text
# ✅ NEW: MCP structured response — no shell, no jq
mcp__github__list_issues(owner, repo, state: CLOSED, perPage: 100)
→ Returns structured JSON with number, title, labels, etc.
```

**Benefits:**

- No `jq` pipelines to maintain or debug
- No shell escaping issues
- Structured data available immediately for analysis
- Reduces token waste from CLI output formatting

### ✅ Pattern 6: Document MCP Limitations and Fallbacks

Not all `gh` CLI functionality has MCP equivalents. Always document:

1. **What's covered**: Which MCP tool replaces which CLI command
2. **What's missing**: Features with no MCP equivalent (e.g., `gh project item-list`, `gh auth status`)
3. **Fallback path**: Include the original `gh` CLI command as a documented fallback

```markdown
> **Fallback**: If MCP call fails, use `gh issue list --state closed ...`
```

### ✅ Pattern 7: Handle MCP Pagination

MCP `list_issues` returns up to 100 results per page. To paginate:

1. Check `pageInfo.hasNextPage` in the response
2. If `true`, pass `pageInfo.endCursor` as the `after` parameter in the next call
3. Stop when `hasNextPage` is `false` or you have enough data for analysis

For most slash commands, a single page of 100 results is sufficient. Only paginate when the command explicitly
needs comprehensive data (e.g., `/export-closed-issues` for reporting).

### MCP vs CLI Coverage

| Capability | MCP Tool | `gh` CLI Fallback |
| --- | --- | --- |
| Get authenticated user | `get_me` | `gh api user` |
| List/search issues | `list_issues`, `search_issues` | `gh issue list` |
| Read single issue | `issue_read` | `gh issue view` |
| Project items (status, lifecycle) | ❌ Not available | `gh project item-list` |
| Auth status/scopes | ❌ Not available | `gh auth status` |

## Troubleshooting

If you encounter token limit errors at runtime, see [Troubleshooting Guide - Token Limit
Issues](../reference/troubleshooting.md#token-limit-issues) for:

- Quick diagnostic procedures
- Symptom identification
- Step-by-step remediation
- Verification after fixes

## References

- **Issue #320**: `/select-next-issue` token limit bug fix
- **Issue #321**: Comprehensive slash command audit
- **PR #324**: First implementation of token optimization pattern
- **Claude Code Read Tool**: 25,000 token maximum limit
