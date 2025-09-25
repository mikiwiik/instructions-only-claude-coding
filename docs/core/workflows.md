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

**Example Sequence:**

```bash
git commit -m "test: add failing test for feature X (#33)"
git commit -m "feat: implement basic feature X functionality (#33)"
git commit -m "refactor: extract utility functions for feature X (#33)"
git commit -m "docs: update README with feature X usage (#33)"
git commit -m "feat: complete feature X implementation

Implements full functionality including:
- Core feature implementation
- Comprehensive test coverage
- Documentation updates

Closes #33"
```

## Pull Request Protocol

### Creation Requirements

- Feature branch pushed to remote with tracking
- All local commits present on remote branch
- Clear PR title and description
- Reference related GitHub issue

### Auto-merge Protocol

**🚨 BLOCKING REQUIREMENT**: NEVER enable auto-merge without explicit user approval.

**Required Process:**

1. Create PR first (without merge flags)
2. Ask explicit permission: "Should I enable auto-merge for PR #X?"
3. Wait for clear approval: "yes", "enable auto-merge", "proceed with auto-merge"
4. If approved: `gh pr merge --auto --squash --delete-branch`
5. If declined: Leave for manual review

**Invalid Approval Responses:**

- General statements: "looks good", "proceed", "continue"
- Silence or assumptions
- Indirect approval

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
3. **Commit for Issue Closure** - Local commit with "Closes #X"
4. **Push to Remote** - `git push -u origin feature/XX-description`
5. **Verify Push Success** - Confirm remote branch tracking
6. **Ask User for Auto-merge** - NEVER assume approval
7. **Create PR** - Always required by methodology
8. **Wait for Merge** - CI passes + reviewer approval (if auto-merge enabled)
9. **Verify Issue Closure** - Use `gh issue view #X` to confirm
10. **Confirm Completion** - All requirements satisfied

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
- Tests: All tests passing

### Pre-merge Requirements

- All automated CI checks passing
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
