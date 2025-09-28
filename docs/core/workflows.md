# Development Workflows

## Git and Branch Management

### Feature Branch Workflow

**🚨 MANDATORY**: All code changes must be made on feature branches and handled via Pull Requests.

1. **Create Feature Branch**: `git checkout -b feature/XX-description`
2. **Implement Changes**: Make atomic commits with clear messages
3. **Push to Remote**: `git push -u origin feature/XX-description`
4. **Create Pull Request**: Always required regardless of GitHub settings
5. **Merge After Approval**: Via auto-merge or manual approval

### Atomic Commit Strategy

**🚨 PRINCIPLE**: Multi-step code changes are implemented as **multiple small atomic commits**, not one large commit.

**Commit Message Format:**

```text
type(scope): description (#issue-number)

Optional body explaining the change in detail
Optional footer for breaking changes or issue closure
```

**Commit Types:**

- `feat`: New features
- `fix`: Bug fixes
- `test`: Adding or updating tests
- `docs`: Documentation updates
- `refactor`: Code refactoring without behavior changes
- `style`: Code style changes (formatting)
- `chore`: Maintenance tasks

### AI Agent Attribution

**🚨 REQUIRED**: All AI-assisted work must use proper attribution as defined in [ADR-015](../adr/015-ai-agent-attribution-strategy.md).

**AI Agent Commit Format:**

```text
type(scope): description (#issue-number)

Optional body explaining the change in detail

🤖 Generated with AI Agent

Co-Authored-By: [Human Name] <human.email@domain.com>
```

**Attribution Requirements:**

- **Author**: AI Agent account (`{user}+agent@domain.com`)
- **Footer**: `🤖 Generated with AI Agent`
- **Co-Author**: Human collaborator with proper credit
- **Repository Config**: Use `.gitconfig` for automatic attribution

### Multi-Step Implementation Approach

**Each logical change = One atomic commit:**

- ✅ **Incremental Development**: Build functionality step by step
- ✅ **Easy Review**: Each commit addresses single concern
- ✅ **Precise Rollback**: Revert specific changes without losing others
- ✅ **Clear History**: Logical progression through development

**Example Multi-Step Feature Implementation:**

```bash
git commit -m "test: add failing test for feature X (#33)"
git commit -m "feat: implement basic feature X functionality (#33)"
git commit -m "refactor: extract utility functions for feature X (#33)"
git commit -m "test: add edge cases for feature X (#33)"
git commit -m "docs: update README with feature X usage (#33)"
git commit -m "feat: complete feature X implementation

Implements full functionality including:
- Core feature implementation
- Comprehensive test coverage
- Documentation updates

Closes #33"
```

### TDD Commit Pattern

**Follow Red-Green-Refactor cycle with commits:**

```bash
# Red: Write failing test
git commit -m "test: add failing test for feature X (#issue)"

# Green: Make test pass
git commit -m "feat: implement minimal feature X functionality (#issue)"

# Refactor: Improve without changing behavior
git commit -m "refactor: optimize feature X implementation (#issue)"

# Repeat cycle for additional functionality
git commit -m "test: add edge cases for feature X (#issue)"
git commit -m "feat: handle edge cases in feature X (#issue)"
```

## Pull Request Protocol

### Creation Requirements

- Feature branch pushed to remote with tracking
- All local commits present on remote branch
- Clear PR title and description
- Reference related GitHub issue with closing keywords

### Issue Closure via PR Description

**🚨 REQUIRED**: Use GitHub closing keywords in PR descriptions to automatically close related issues when merged.

**Supported Keywords:**

- `Closes #123`
- `Fixes #123`
- `Resolves #123`

**PR Description Template:**

```markdown
## Summary

Brief description of changes

## Context

Addresses issue #XXX - [brief issue context]

## Implementation

- Key changes made
- Technical decisions

Closes #XXX
```

**Multiple Issues:**

```markdown
Closes #123, closes #124, fixes #125
```

### Auto-merge Protocol

**✅ STREAMLINED WORKFLOW**: Repository configured with automerge and branch protection.

**Current Configuration:**

- **Branch Protection**: 1 required reviewer + passing CI checks
- **Automerge**: Enabled at repository level
- **Branch Cleanup**: Automatic deletion after merge

**Standard Process:**

1. Create PR with: `gh pr create --title "..." --body "..."`
2. **🚨 REQUIRED**: Enable automerge: `gh pr merge --auto --squash`
3. Wait for approval and CI: Automatic merge when requirements met
4. Branch cleanup: Automatic deletion after successful merge

**Note**: Step 2 is mandatory for all PRs to maintain consistent workflow and reduce manual intervention.

**Manual Override (when needed):**

- If automerge not desired: Skip step 2, merge manually after approval
- If urgent merge needed: Use `--admin` flag to bypass protection (with permission)

### Bypass Rules (Admin Privileges)

**When to Use:**

- CI checks failing but changes are safe/urgent
- Branch protection blocking despite user approval
- User explicitly requests immediate merge

**Required Process:**

1. Ask explicit permission: "Should I bypass rules and merge immediately?"
2. Wait for clear consent: "yes, bypass rules", "merge with admin"
3. Execute: `gh pr merge --admin --squash --delete-branch`

## Issue Completion Workflow

### Feature Completion Sequence

**🚨 CRITICAL WORKFLOW**: Follow exact sequence to prevent violations:

1. **Complete Implementation** - Code, tests, documentation
2. **Run Quality Checks** - Ensure all tests pass, lint, typecheck
3. **Verify Test Coverage** - All tests in version control and passing
4. **Commit for Issue Closure** - Local commit with "Closes #X"
5. **Push to Remote** - `git push -u origin feature/XX-description`
6. **Verify Push Success** - Confirm remote branch tracking and all tests pushed
7. **Create PR** - Always required by methodology (ONLY after all tests pass and pushed)
   - **🚨 REQUIRED**: Include "Closes #X" in PR description for automatic issue closure
8. **🚨 REQUIRED**: Enable automerge: `gh pr merge --auto --squash`
9. **Wait for Merge** - CI passes + reviewer approval (automerge handles the merge)
10. **Verify Issue Closure** - Use `gh issue view #X` to confirm
11. **Confirm Completion** - All requirements satisfied

### Issue Closure Verification

**Only claim "Issue #X is closed" AFTER:**

- PR has been merged to main branch
- GitHub automatically closed issue via "Closes #X" commit
- Verification completed with `gh issue view #X`

## Quality Gates

### Pre-commit Requirements

- ESLint: Zero errors or warnings
- Prettier: Consistent code formatting
- TypeScript: Strict mode compliance
- Tests: All tests passing and in version control

### Pre-merge Requirements

- All automated CI checks passing
- All tests passing on remote branch
- Required reviewer approval (GitHub enforcement)
- Branch up to date with main
- No merge conflicts

### Quality Commands

```bash
npm run lint          # ESLint validation
npm run type-check    # TypeScript validation
npm test             # Run test suite
npm run build        # Production build test
```

## Task Planning Integration

### When Planning is Required

**Non-Trivial Changes** requiring TodoWrite:

- Multi-component modifications (3+ files)
- New feature implementations
- Architecture or design pattern changes
- Breaking changes or API modifications

### Planning Process

1. **Initial Assessment** - Understand requirements and scope
2. **Task Breakdown** - Create comprehensive TodoWrite list
3. **User Presentation** - Present plan for approval
4. **Implementation Tracking** - Mark tasks in_progress/completed
5. **Completion Verification** - Ensure all tasks finished

## Documentation Workflow

### Required Documentation Updates

- **ADRs**: For architectural decisions before implementation
- **README.md**: For new features or setup changes
- **Inline Comments**: For complex logic (sparingly)
- **CLAUDE.md**: For workflow or process changes

### Documentation Consistency

- Maintain consistency across CLAUDE.md, README.md, and ADRs
- Update related documents when making changes
- Verify cross-references remain current
- Ensure documentation matches implementation

## Troubleshooting Common Issues

### PR Creation Failures

- Verify feature branch exists on remote
- Check GitHub CLI authentication
- Ensure branch follows naming convention

### Auto-merge Not Working

- Verify repository "Allow auto-merge" setting enabled
- Check CI status and branch protection requirements
- Use `gh pr status` to check merge eligibility

### Workflow Violations

- Acknowledge violation immediately
- Explain correct process
- Document for process improvement
- Take corrective action if possible

This workflow ensures consistent, quality development while maintaining the instruction-only
methodology and agent coordination capabilities.
