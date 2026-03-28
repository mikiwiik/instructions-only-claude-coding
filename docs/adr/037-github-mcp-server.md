# ADR-037: GitHub MCP Server Adoption

## Status

Accepted

**Note**: Once accepted, this ADR should not be modified except for:

- Minor corrections (typos, formatting, broken links)
- Status updates when superseded or amended
- Adding links to newer ADRs that reference this one

For architectural changes or evolution, create a new ADR that references this one. See
[PROCESS.md](PROCESS.md#adr-immutability-and-evolution) for complete immutability guidelines.

## Context

This project relies heavily on the GitHub CLI (`gh`) for GitHub integration within Claude Code:

- **6 slash commands** use `gh` for issues, PRs, and project management
- **2 shell scripts** automate project status updates via `gh`
- **12+ documentation files** reference `gh` command patterns
- **1 GitHub Actions workflow** uses `gh` for Dependabot auto-merge

Current `gh` CLI usage has several limitations:

- **Shell construction overhead**: Claude must construct shell commands, handle quoting, and parse text output
- **Token-inefficient pipelines**: Bulk data fetches require `jq` filtering to strip unnecessary fields (issue bodies
  consume 85-94% of tokens but are rarely needed)
- **No structured data**: Output is text that must be parsed, increasing error surface
- **Implicit tool discovery**: Claude has no native awareness of available GitHub operations; it relies on documentation
  in slash commands

GitHub's official MCP (Model Context Protocol) server (`github/github-mcp-server`) provides native tool-level
integration for Claude Code, exposing GitHub API operations as structured MCP tools that Claude can discover and
invoke directly.

### MCP Server Options Evaluated

| Server | Maintainer | Status | Notes |
| --- | --- | --- | --- |
| `github/github-mcp-server` | GitHub (official) | Active | Canonical choice, Go binary, HTTP and Docker transport |
| `@modelcontextprotocol/server-github` | MCP org | Deprecated | Development moved to official repo |
| `cyanheads/git-mcp-server` | Community | Active | Local git operations only, complementary |

## Decision

Adopt **GitHub's official MCP server** (`github/github-mcp-server`) via **HTTP transport** as the primary GitHub
integration for Claude Code, replacing `gh` CLI usage in slash commands and agent workflows.

### Configuration

- **Transport**: HTTP (connects to `https://api.githubcopilot.com/mcp/`, no Docker required)
- **Scope**: Project-level (`.mcp.json` in repo root, shared via git)
- **Authentication**: GitHub Personal Access Token via `${GITHUB_PERSONAL_ACCESS_TOKEN}` environment variable
- **Token type**: Fine-grained PAT recommended, scoped to required permissions

### Migration Strategy

Phased adoption across 4 issues:

1. **#478** (this issue): Infrastructure setup, ADR, configuration, environment docs
2. **#479**: Migrate read-only slash commands (`/user-info`, `/select-next-issue`, `/quick-wins`,
   `/export-closed-issues`)
3. **#480**: Unify `/work-on` and `/create-pr` into MCP-based Claude Code skills (`.claude/skills/`)
4. **#481**: Capabilities reference document and reference doc consolidation

### What Stays as `gh` CLI

- **GitHub Actions workflows**: `dependabot-auto-merge.yml` runs in CI, not Claude Code
- **Standalone shell scripts**: `update-project-status.sh`, migration scripts run outside Claude Code
- **Fallback for unsupported operations**: If MCP lacks equivalent tools (e.g., `gh pr merge --auto --rebase`
  semantics), `gh` remains the fallback until MCP support is added

## Consequences

### Positive

- **Native tool integration**: Claude discovers and invokes GitHub tools directly instead of constructing shell commands
- **Structured data**: MCP returns typed responses, eliminating `jq` pipelines and reducing token consumption
- **Reduced error surface**: No shell escaping, command construction, or text parsing errors
- **Auto-discovery**: MCP server exposes available tools based on token scopes, reducing documentation burden
- **Simplified slash commands**: Commands become more concise since MCP tools are self-describing

### Negative

- **Large migration surface**: 6 slash commands, 2 scripts, 12+ docs reference `gh` patterns
- **Dual maintenance period**: During migration, both `gh` and MCP patterns coexist
- **Projects toolset maturity**: GitHub Projects MCP tools were added January 2026 and may not cover all
  `gh project item-edit` patterns used in this repo
- **Automerge validation needed**: Critical `gh pr merge --auto --rebase` workflow must be validated against MCP
  merge tool capabilities before full migration

### Neutral

- **PAT management**: Shifts from `gh auth login` (browser OAuth) to PAT environment variable (already familiar
  pattern from Upstash Redis setup)
- **Team onboarding**: Each developer must set `GITHUB_PERSONAL_ACCESS_TOKEN` env var (documented in local dev setup)

## Alternatives Considered

- **Keep `gh` CLI only**: Rejected because it limits Claude Code to shell-based interaction, requires `jq` pipelines,
  and doesn't leverage MCP's native tool integration
- **Docker transport**: Rejected in favor of HTTP transport because HTTP requires no Docker installation, connects to
  GitHub's hosted endpoint, and reduces setup friction
- **User-scope config only**: Rejected because project-scope `.mcp.json` ensures consistent configuration across
  team members and is version-controlled
- **Community MCP servers**: Rejected in favor of GitHub's official server for maintenance guarantees and feature parity

## References

- [GitHub MCP Server repository](https://github.com/github/github-mcp-server)
- [GitHub MCP Server installation guide for Claude](https://github.com/github/github-mcp-server/blob/main/docs/installation-guides/install-claude.md)
- [GitHub Docs: Using the GitHub MCP Server](https://docs.github.com/en/copilot/how-tos/provide-context/use-mcp/use-the-github-mcp-server)
- [Claude Code MCP documentation](https://code.claude.com/docs/en/mcp)
- [ADR-030: Claude Code Environment Hooks](030-claude-code-environment-hooks.md) (prior Claude Code integration pattern)
- Related issues: #478, #479, #480, #481
