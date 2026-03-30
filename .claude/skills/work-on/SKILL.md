---
description: Start working on a specific GitHub issue with full workflow setup
argument-hint: [issue-number]
---

Start working on GitHub issue #$ARGUMENTS following the project's development methodology.

**Current branch**: !`git branch --show-current`

---

## Phase 1: Issue Analysis & Project Status

1. **Read issue** via MCP `mcp__github__issue_read` tool:
   - `owner`: `mikiwiik`, `repo`: `instructions-only-claude-coding`, `issue_number`: $ARGUMENTS
   - Verify issue state is **OPEN**
   - Confirm issue has **priority** and **complexity** labels
   - Extract title for session naming

   > **Fallback**: If MCP fails, use `gh issue view $ARGUMENTS`

2. **Check WIP limits**: Run `gh project item-list 1 --owner mikiwiik --format json | jq '[.items[] | select(.status == "In Progress")] | length'`
   - If >1 issue already In Progress, **warn user** before proceeding
   - Typical WIP: 1-2 issues at a time

3. **Update GitHub Projects**:
   - Run: `./.claude/scripts/update-project-status.sh $ARGUMENTS "In Progress"`
   - Continue with workflow even if this fails (graceful degradation)

4. **Requirements traceability**: Check if issue references a requirement in
   [docs/product/requirements.md](../../docs/product/requirements.md). Note the linked requirement for the PR later.

5. **Session naming**: Suggest to the user: *"You may want to rename this session to `Issue #$ARGUMENTS — <title>`"*

## Phase 2: Task Planning

1. **Assessment**: Identify affected components and files from the issue requirements
2. **Task breakdown**: Create TaskCreate task list (required for 3+ files, new features, architecture changes)
3. **Parallel agents**: If complexity-moderate or higher, recommend specialized agents
   (`frontend-specialist`, `testing-specialist`, `quality-assurance`, `documentation-agent`)
4. **Present plan**: Wait for user approval before implementation

## Phase 3: Branch Setup & TDD Strategy

1. **Branch setup**:
   - If already on a feature branch for this issue, skip
   - Otherwise: `git checkout main && git pull && git checkout -b feature/$ARGUMENTS-description`
   - One issue per feature branch (mandatory)

2. **E2E-first** (for user-facing features):
   - Ask: "Can the user see or interact with this feature?"
   - If YES → write E2E visibility test BEFORE implementation
   - See [E2E Feature Template](../../docs/testing/e2e-feature-template.md)

3. **TDD Red-Green-Refactor** commit pattern:
   ```
   test: add failing test for <feature> (#$ARGUMENTS)
   feat: implement <feature> (#$ARGUMENTS)
   refactor: optimize <feature> (#$ARGUMENTS)
   test: add edge cases for <feature> (#$ARGUMENTS)
   ```

4. **Commit requirements**:
   - Every commit references issue number: `(#$ARGUMENTS)`
   - AI attribution footer: `🤖 Generated with AI Agent` + `Co-Authored-By:` line
   - Max 2 bullet items in commit body (commitlint parser bug workaround)
   - Use conventional commit format (`feat`, `fix`, `test`, `refactor`, `docs`, etc.)

## Phase 4: Quality Guidance

**Before each commit**, run:
```bash
npm run lint && npm run type-check && npm test
```

**Standards to maintain**:
- Zero ESLint errors/warnings
- TypeScript strict mode (no `any` types)
- Code complexity: cognitive ≤15, nesting ≤4, cyclomatic ≤15 (ADR-028)
- Test coverage: 80%+ line, 100% for critical paths
- Accessibility: WCAG 2.2 AA for UI features (44px touch targets, ARIA, keyboard nav)

**When implementation is complete**:
- Include `Closes #$ARGUMENTS` in the final commit
- Push to remote: `git push -u origin <branch-name>`
- Use `/create-pr` to create the pull request
