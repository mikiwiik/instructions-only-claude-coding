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

### ✅ Good Example: `/export-closed-issues`

Already token-efficient with specific field selection:

```bash
gh issue list --state closed \
  --search "closed:>=$START_DATE" \
  --json number,title,state,closedAt,createdAt,author,assignees,labels,url \
  --limit 1000
```

### ✅ Fixed Example: `/select-next-issue`

Original problem, optimized solution:

```markdown
**Before (#320):**

- Command: `gh project item-list 1 --owner mikiwiik --format json`
- Token consumption: 45,486 tokens
- Result: Read tool failure

**After (#320):**

- Added jq filter to strip issue bodies
- Token consumption: 2,728 tokens
- Result: 94% reduction, command works reliably
```

### ✅ Fixed Example: `/quick-wins`

Applied same optimization pattern:

```markdown
**Before (#321):**

- Same issue as /select-next-issue
- Token consumption: 45,486 tokens

**After (#321):**

- Applied identical jq optimization
- Token consumption: 2,728 tokens
- Result: 94% reduction
```

## Troubleshooting

See [Troubleshooting Guide - Token Limit Issues](../reference/troubleshooting.md#token-limit-issues) for common
errors and solutions.

## References

- **Issue #320**: `/select-next-issue` token limit bug fix
- **Issue #321**: Comprehensive slash command audit
- **PR #324**: First implementation of token optimization pattern
- **Claude Code Read Tool**: 25,000 token maximum limit
