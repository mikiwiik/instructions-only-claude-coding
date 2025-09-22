# Auto-Merge Workflow Documentation

## Overview

This repository uses GitHub's built-in auto-merge feature combined with automatic PR approval to streamline
the development workflow while maintaining code quality through CI validation.

## How It Works

### 1. Automatic PR Approval

- When you create a PR, the `auto-approve.yml` workflow runs
- If the PR author is the repository owner (`mikiwiik`), it automatically approves the PR
- This satisfies the "1 approval required" branch protection rule

### 2. GitHub Auto-Merge

- After creating a PR, auto-merge can be enabled using `gh pr merge --auto`
- The PR will automatically merge when:
  - CI checks pass (Build and Test workflow)
  - PR has required approval (provided by auto-approve workflow)
  - Branch is up to date with main

### 3. Complete Workflow

```bash
# 1. Create feature branch
git checkout -b feature/XX-description

# 2. Make changes and commit
git add .
git commit -m "feat: implement feature X

Closes #XX"

# 3. Push branch
git push -u origin feature/XX-description

# 4. Create PR
gh pr create --title "Feature: Description" --body "Closes #XX"

# 5. Enable auto-merge
gh pr merge --auto --squash

# PR will merge automatically when CI passes!
```

## Benefits

1. **Zero Manual Overhead**: No need to manually approve or merge PRs
2. **CI Protection**: Code only merges if all tests pass
3. **Audit Trail**: Every change has a PR record
4. **Branch Protection**: Direct pushes to main are blocked
5. **Automatic Issue Closure**: Issues close when PR merges

## Configuration Requirements

### Repository Settings

- ✅ Auto-merge enabled: Settings → General → "Allow auto-merge"
- ✅ Branch protection with 1 approval required
- ✅ Required status checks (Build and Test)

### Workflow Files

- `.github/workflows/auto-approve.yml` - Automatically approves PRs from repository owner
- `.github/workflows/build.yml` - CI workflow that must pass before merge

## Troubleshooting

### Auto-merge not working?

1. Check that auto-merge is enabled in repository settings
2. Verify CI is passing with `gh pr checks`
3. Ensure PR has approval (should be automatic)
4. Check if branch needs updating with `gh pr view`

### PR stuck in "Waiting for status checks"?

- CI may be running, wait for completion
- Check Actions tab for workflow status
- Use `gh run list` to see running workflows

### Manual fallback

If auto-merge fails, you can always merge manually:

```bash
gh pr merge --squash
```

## Security Considerations

- Auto-approval only works for repository owner
- All code still goes through CI validation
- Branch protection prevents direct pushes
- Force pushes and deletions are blocked
