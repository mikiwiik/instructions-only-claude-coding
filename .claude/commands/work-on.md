---
description: Start working on a specific GitHub issue with full workflow setup
argument-hint: <issue-number>
---

Start working on GitHub issue #$1 following the project's development methodology:

1. **Issue Analysis**: Read and understand the issue requirements using `gh issue view $1`
2. **Task Planning**: Create comprehensive TodoWrite task breakdown (required for non-trivial changes per CLAUDE.md)
3. **Branch Setup**: Create feature branch `git checkout -b feature/$1-description`
4. **Implementation Strategy**:
   - Follow TDD methodology (tests first, then implementation)
   - Use atomic commits with conventional commit format
   - Follow project code quality standards
5. **Workflow Setup**: Prepare for complete issue closure including PR creation

**Prerequisites Check**:

- Verify issue exists and is open
- Confirm issue has proper priority/complexity labels
- Check if parallel agent execution is recommended (complexity-moderate+)

**Output**: Ready-to-implement task plan with clear next steps.
