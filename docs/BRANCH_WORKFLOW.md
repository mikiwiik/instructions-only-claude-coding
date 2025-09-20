# Branch-Based Development Workflow

## Overview

This document outlines the branch-based development workflow for the Todo App project. While GitHub branch protection
requires GitHub Pro for private repositories, we implement the workflow practices to establish professional development
standards.

## Branch Strategy

### Branch Naming Convention

```text
feature/[issue-number]-[short-description]
bugfix/[issue-number]-[short-description]
docs/[issue-number]-[short-description]
```

**Examples:**

- `feature/33-completion-timestamps`
- `bugfix/45-mobile-responsive-fix`
- `docs/22-workflow-documentation`

## Development Workflow

### 1. Create Feature Branch

```bash
# Ensure you're on main and up to date
git checkout main
git pull origin main

# Create and switch to feature branch
git checkout -b feature/[issue-number]-[description]
```

### 2. Development Process

```bash
# Make changes following TDD approach
# Write tests first, then implementation

# Commit atomically with conventional commit format
git add .
git commit -m "feat: implement completion timestamps

Add createdAt and completedAt fields to Todo interface
Update TodoItem component to display completion time

References #33"

# Push feature branch
git push -u origin feature/[issue-number]-[description]
```

### 3. Pull Request Creation

```bash
# Create PR using GitHub CLI
gh pr create \
  --title "feat: implement completion timestamps" \
  --body "Implements completion timestamp tracking for todo items.

## Changes
- Add completedAt field to Todo interface
- Update TodoItem component to show completion time
- Add tests for timestamp functionality

Closes #33"
```

### 4. Code Review and Merge

1. **Self-Review**: Review your own PR thoroughly
2. **CI Validation**: Ensure all GitHub Actions checks pass
3. **Testing**: Verify all tests pass locally and in CI
4. **Merge**: Use squash merge to maintain clean commit history

```bash
# Merge PR (squash commits for clean history)
gh pr merge --squash --delete-branch
```

### 5. Cleanup

```bash
# Switch back to main and clean up
git checkout main
git pull origin main
git branch -d feature/[issue-number]-[description]
```

## Branch Protection (Future)

When upgrading to GitHub Pro or making repository public, implement:

- **Required status checks**: Build and test must pass
- **Required pull request reviews**: At least 1 approval
- **Up-to-date branches**: Must be current with main
- **Include administrators**: Rules apply to all users

## GitHub Actions Integration

The CI/CD pipeline runs on:

- **Push to main**: Full build, test, and deploy
- **Pull requests**: Build and test validation
- **Failed builds**: Should block merge (manual enforcement for now)

## Commit Message Guidelines

Follow established format with issue linking:

```text
type(scope): description

Optional body with more details

Closes #[issue-number]
```

## Pull Request Template

Located at `.github/pull_request_template.md`, provides:

- Standardized PR structure
- Issue linking requirements
- Testing checklist
- Type of change classification

## Benefits

- **Quality Control**: Code review before integration
- **CI Validation**: Automated testing on all changes
- **Issue Tracking**: Clear connection between code and issues
- **Professional Practice**: Industry-standard development workflow
- **Clean History**: Squash merges maintain readable git log

## Current Limitations

- **No automatic branch protection** (requires GitHub Pro)
- **Manual merge enforcement** (self-discipline required)
- **No automatic PR review requirements**

## Best Practices

1. **Keep branches small**: Focus on single issue per branch
2. **Regular commits**: Atomic commits with clear messages
3. **Test thoroughly**: Both automated and manual testing
4. **Self-review**: Review your own PR before requesting review
5. **Clean up**: Delete merged branches promptly
6. **Stay current**: Regularly sync with main branch

## Migration from Direct Main Development

For transitioning existing workflow:

1. Complete current work on main
2. Push and ensure CI passes
3. Start next feature using branch workflow
4. Document any issues or improvements needed

---

🤖 Generated with [Claude Code](https://claude.ai/code)
