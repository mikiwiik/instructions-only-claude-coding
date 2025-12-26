---
description: Start working on a specific GitHub issue with full workflow setup
argument-hint: [issue-number]
---

Start working on GitHub issue #$1 following the project's development methodology:

1. **Issue Analysis**: Read and understand the issue requirements using `gh issue view $1`
2. **Update GitHub Projects**: Set Status="In Progress" using helper script:
   - Run: `./.claude/scripts/update-project-status.sh $1 "In Progress"`
   - If this fails due to missing project scope, follow the error message instructions
   - Manual alternative: `gh project item-edit` (see [GitHub Projects Setup](../../docs/setup/github-projects-setup.md))
   - Continue with workflow even if project update fails (graceful degradation)
3. **Task Planning**: Create comprehensive TodoWrite task breakdown (required for non-trivial changes per CLAUDE.md)
4. **Branch Setup**: Create feature branch `git checkout -b feature/$1-description`
5. **Implementation Strategy**:
   - Follow TDD methodology (tests first, then implementation)
   - Use atomic commits with conventional commit format
   - Follow project code quality standards
6. **Workflow Setup**: Prepare for complete issue closure including PR creation

**Prerequisites Check**:

- Verify issue exists and is open
- Confirm issue has proper priority/complexity labels
- Check if parallel agent execution is recommended (complexity-moderate+)
- (Optional) Verify `project` scope: `gh auth status` should show `project` in scopes
  - If missing, run: `gh auth refresh --hostname github.com --scopes project`
  - Then ensure agent is invited as Write collaborator to the project
  - See [GitHub Projects Setup Guide](../../docs/setup/github-projects-setup.md) for details

**Output**: Ready-to-implement task plan with clear next steps.

**📘 PR Creation**: When ready to create PR, see [PR Approval Protocol](../../docs/core/workflows.md#pull-request-workflow)
for the mandatory 5-step workflow including automerge setup.
