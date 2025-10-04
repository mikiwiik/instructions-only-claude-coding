---
description: Create pull request following the agreed workflow in docs/core/workflows.md
---

Create a pull request for the current feature branch following the mandatory PR workflow.

## Workflow Sequence (docs/core/workflows.md:110-242)

### Pre-flight Checks

1. **Verify branch pushed to remote**:
   - Run `git status` to confirm tracking branch exists
   - Run `git log origin/$(git branch --show-current)..HEAD` to verify all local commits are on remote
   - If commits not pushed: STOP and report error to user

2. **Verify PR requirements**:
   - Confirm feature branch follows naming convention: `feature/XX-description`
   - Identify issue number from branch name (XX)
   - Ensure all quality checks have passed locally

### PR Creation

1. **Create pull request**:
   - Use `gh pr create` with clear title and description
   - **REQUIRED**: Include "Closes #XX" in PR description for automatic issue closure
   - Template format:

     ```markdown
     ## Summary

     [Brief description of changes]

     ## Implementation

     - [Key changes made]
     - [Technical decisions]

     Closes #XX
     ```

2. **Enable automerge with rebase**:
   - **MANDATORY**: Run `gh pr merge --auto --rebase`
   - Uses `--rebase` strategy to preserve atomic commits (per ADR-010)
   - Automerge triggers when CI passes + reviewer approves

### Post-Creation Protocol

1. **Report PR URL to user**:
   - Display PR URL from `gh pr create` output
   - Confirm automerge enabled
   - Show current PR status

2. **🛑 CRITICAL STOP POINT**:
   - **STOP and WAIT** for human approval/merge
   - Task completion = PR created and ready for review (NOT merged)
   - Do NOT proceed with any further actions

## 🚨 Forbidden Actions (Without Explicit User Permission)

**NEVER execute without user explicitly requesting:**

- `gh pr merge --admin` (bypass branch protection)
- `gh pr merge --force` (force merge)
- `git push --force` (rewrite history)
- `git push --force-with-lease` (conditional force push)
- Any command bypassing review requirements or branch protection

**When to Ask User**:

- If CI checks are failing but user wants to proceed
- If branch protection is blocking despite approval
- If user explicitly says "bypass rules and merge" or similar

## References

- **Workflow Documentation**: docs/core/workflows.md (lines 110-242)
- **CLAUDE.md Principle #7**: Feature Branch + PR Workflow
- **CLAUDE.md Principle #12**: PR Approval Protocol
- **ADR-010**: Merge strategy (--rebase for atomic commits)

## Success Criteria

- ✅ PR created with proper title and description
- ✅ "Closes #XX" included in PR description
- ✅ Automerge enabled with `--rebase` strategy
- ✅ PR URL reported to user
- ✅ Process stopped and awaiting user approval
- ❌ No bypass flags used without permission
