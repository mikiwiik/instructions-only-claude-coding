---
description: Implement a GitHub issue — analysis, planning, TDD, and PR-ready delivery
argument-hint: [issue-number]
---

Implement GitHub issue #$ARGUMENTS following the project's development methodology.

**Current branch**: !`git branch --show-current`

---

## Step 1: Issue Analysis & Project Status

1. **Read issue** via MCP `mcp__github__issue_read` tool:
   - `owner`: `mikiwiik`, `repo`: `instructions-only-claude-coding`, `issue_number`: $ARGUMENTS
   - Verify issue state is **OPEN** with **priority** and **complexity** labels

   > **Fallback**: If MCP fails, use `gh issue view $ARGUMENTS`

2. **Update GitHub Projects** (also checks WIP — warns if >1 issue already In Progress):
   - Run: `./.claude/scripts/update-project-status.sh $ARGUMENTS "In Progress"`
   - Continue with workflow even if this fails (graceful degradation)

3. **Requirements traceability**: Check if issue references a requirement in
   [docs/product/requirements.md](../../docs/product/requirements.md). Note the linked requirement for the PR later.

4. **Session naming**: Suggest to the user: *"You may want to rename this session to `Issue #$ARGUMENTS — <title>`"*

## Step 2: Task Planning

1. **Assessment**: Identify affected components and files from the issue requirements
2. **Task breakdown**: Create TaskCreate task list (required for 3+ files, new features, architecture changes)
3. **Parallel agents**: If complexity-moderate or higher, recommend specialized agents
   (`frontend-specialist`, `testing-specialist`, `quality-assurance`, `documentation-agent`)
4. **Present plan**: Wait for user approval before implementation

## Step 3: Branch Setup & Implementation Strategy

1. **Branch setup**:
   - If already on a feature branch for this issue, skip
   - Otherwise: `git checkout main && git pull && git checkout -b feature/$ARGUMENTS-description`
   - One issue per feature branch (mandatory)

2. **E2E-first** (for user-facing features):
   - Ask: "Can the user see or interact with this feature?"
   - If YES → write E2E visibility test BEFORE implementation
   - See [E2E Feature Template](../../docs/testing/e2e-feature-template.md)

3. **TDD Red-Green-Simplify** cycle:
   - **Red**: `test: add failing test for <feature> (#$ARGUMENTS)`
   - **Green**: `feat: implement <feature> (#$ARGUMENTS)`
   - **Simplify**: Run `/simplify` to review for reuse, quality, and efficiency — fix issues found
   - **Edge cases**: `test: add edge cases for <feature> (#$ARGUMENTS)`

4. **Atomic commits** with [conventional commit format](../../docs/core/workflows.md#atomic-commit-strategy):
   - Each commit = one focused change, referencing `(#$ARGUMENTS)`
   - Format: `type(scope): description (#$ARGUMENTS)` — see [allowed types](../../docs/core/workflows.md#atomic-commit-strategy)
   - AI attribution footer: `🤖 Generated with AI Agent` + `Co-Authored-By:` line
   - Max 2 bullet items in commit body (commitlint parser bug workaround)

## Step 4: Completion

**Before each commit**: `npm run lint && npm run type-check && npm test && npx tsc --noEmit`

**Quality standards**: See [quality-standards.md](../../docs/core/quality-standards.md) — zero ESLint warnings,
strict TypeScript, ADR-028 complexity limits, 80%+ coverage, WCAG 2.2 AA for UI features.

**When done**:
- Include `Closes #$ARGUMENTS` in the final commit
- Push to remote: `git push -u origin <branch-name>`
- Use `/create-pr` to create the pull request
