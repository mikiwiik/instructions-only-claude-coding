# Development Troubleshooting Guide

## Common Issues and Solutions

### Pull Request Issues

#### PR Creation Failures

**Problem**: `gh pr create` fails or returns errors

**Solutions:**

- **Verify remote branch exists**: `git branch -r | grep feature/XX-description`
- **Check push status**: Ensure `git push -u origin feature/XX-description` succeeded
- **Authenticate GitHub CLI**: `gh auth status` and `gh auth login` if needed
- **Verify branch naming**: Use `feature/XX-description` convention
- **Check repository access**: Ensure proper permissions for the repository

#### Auto-merge Not Working

**Problem**: Auto-merge enabled but PR not merging automatically

**Solutions:**

- **Check repository settings**: Settings → General → "Allow auto-merge" must be enabled
- **Verify CI status**: All checks must pass for auto-merge to trigger
- **Check branch protection**: Branch must be up to date with main
- **Use status command**: `gh pr status` to check merge eligibility
- **Review requirements**: Ensure all required reviews are approved

#### Merge Conflicts

**Problem**: PR has merge conflicts preventing merge

**Solutions:**

- **Update feature branch**: `git checkout main && git pull && git checkout feature/XX && git merge main`
- **Resolve conflicts**: Edit conflicted files, remove conflict markers
- **Commit resolution**: `git add . && git commit -m "resolve merge conflicts"`
- **Push update**: `git push` to update PR with conflict resolution

### GitHub CLI Issues

#### Authentication Problems

**Problem**: `gh` commands fail with authentication errors

**Solutions:**

- **Check authentication**: `gh auth status`
- **Login if needed**: `gh auth login` and follow prompts
- **Refresh token**: `gh auth refresh`
- **Verify permissions**: Ensure token has repository access

#### Issue Creation Failures

**Problem**: `gh issue create` fails or returns errors

**Solutions:**

- **Check label existence**: Ensure all labels exist in repository
- **Create missing labels**: `gh label create "label-name" --color "RRGGBB"`
- **Verify repository**: Ensure you're in correct repository directory
- **Check permissions**: Ensure write access to repository

### Token Limit Issues

#### Slash Command Token Limit Exceeded

**Problem**: Slash command fails with "File content (X tokens) exceeds maximum allowed tokens (25000)"

**Symptoms:**

- Read tool fails when processing GitHub CLI data
- Error message shows actual token count exceeding 25,000 limit
- Command worked previously but fails with larger project data
- Typically occurs with bulk data fetches (issues, PRs, project items)

**Root Cause:**

Commands fetching GitHub data with full issue/PR bodies can consume 40,000+ tokens when only 2,000-3,000 tokens
of metadata needed. Full issue bodies contribute 85-94% of token consumption but are usually unnecessary for
command logic.

**Quick Diagnosis:**

```bash
# Quick token estimate
gh project item-list 1 --owner mikiwiik --format json > /tmp/data.json
wc -c /tmp/data.json | awk '{printf "Estimated tokens: %d\n", $1/3.5}'
```

For detailed measurement procedures, see [Slash Command Best Practices - Measuring Token
Consumption](../development/slash-command-best-practices.md#measuring-token-consumption).

**Solutions:**

Apply token-efficient patterns from the [Slash Command Best Practices](../development/slash-command-best-practices.md)
guide:

1. **Strip unnecessary data** - Use jq filters to remove issue bodies immediately
2. **Use specific field selection** - Fetch only required fields with `--json`
3. **Add limit flags** - Prevent unbounded data fetches

**Example quick fix:**

```bash
# Apply jq filter to strip issue bodies (94% token reduction)
gh project item-list 1 --owner mikiwiik --format json | \
  jq '{items: [.items[] | {content: {number: .content.number}, title: .title, labels: .labels, lifecycle: .lifecycle, status: .status}]}'
```

See [Token-Efficient Patterns](../development/slash-command-best-practices.md#token-efficient-patterns) for complete
pattern catalog and detailed examples.

**Verification:**

After applying optimization, measure token consumption to verify reduction:

```bash
# Test and measure optimized command
<your-optimized-command> > /tmp/optimized.json
wc -c /tmp/optimized.json | awk '{printf "Estimated tokens: %d\n", $1/3.5}'
```

**Target:** Keep bulk data fetches under 15,000 tokens (leaves buffer for processing).

**Prevention:**

Follow [Slash Command Best Practices](../development/slash-command-best-practices.md) for:

- Token-efficient development patterns
- Command development checklist
- Token budget guidelines
- Measuring token consumption
- Related issues and implementation examples

### Quality Gate Failures

#### ESLint Errors

**Problem**: `npm run lint` reports errors or warnings

**Solutions:**

- **Auto-fix issues**: `npm run lint -- --fix`
- **Check configuration**: Verify `.eslintrc.json` is present and correct
- **Review errors**: Address remaining issues that can't be auto-fixed
- **Pre-commit hooks**: Ensure Husky is properly configured

#### TypeScript Errors

**Problem**: `npm run type-check` reports type errors

**Solutions:**

- **Check TypeScript config**: Verify `tsconfig.json` configuration
- **Fix type definitions**: Add proper types for variables and functions
- **Import type issues**: Ensure proper import statements
- **No any types**: Replace `any` with proper type definitions

#### Test Failures

**Problem**: `npm test` reports failing tests

**Solutions:**

- **Review test output**: Understand specific test failures
- **Check test data**: Ensure test setup and mocks are correct
- **Update tests**: Modify tests if implementation changed
- **Debug tests**: Use `npm test -- --verbose` for detailed output

### AI Agent Account Switching

#### Switch to AI Agent Account

**When**: For AI-assisted development work

**Steps:**

1. **Authenticate with agent account**: `gh auth login --hostname github.com`
2. **Select web browser authentication** when prompted
3. **Switch to agent account in browser** before authorizing
4. **Complete authorization** flow
5. **Verify authentication**: `gh auth status`
6. **Activate repository git config**: `git config include.path ../.gitconfig`
7. **Verify git configuration**: `git config --list | grep user`

#### Switch to Personal Account

**When**: For personal development work or account management

**Steps:**

1. **Authenticate with personal account**: `gh auth login --hostname github.com`
2. **Select web browser authentication** when prompted
3. **Switch to personal account in browser** before authorizing
4. **Complete authorization** flow
5. **Verify authentication**: `gh auth status`
6. **Reset git config** (if using manual config):

   ```bash
   git config user.name "Your Personal Name"
   git config user.email "your-personal-email@domain.com"
   ```

#### Verify Current Account Setup

**Check GitHub CLI authentication**:

```bash
gh auth status
```

**Check git configuration**:

```bash
git config user.name
git config user.email
```

**Check repository-specific config**:

```bash
git config --list --show-origin | grep user
```

#### Common Account Switching Issues

**Problem**: GitHub CLI authentication fails

**Solutions:**

- **Clear existing tokens**: `gh auth logout`
- **Login fresh**: `gh auth login` and follow prompts carefully
- **Check browser session**: Ensure correct GitHub account is active in browser
- **Verify repository access**: Confirm agent account has proper permissions

**Problem**: Wrong attribution in commits

**Solutions:**

- **Check git config**: Verify `git config user.name` and `git config user.email`
- **Activate repository config**: Ensure `git config include.path ../.gitconfig`
- **Update local config**: If needed, manually set user information
- **Test with dry run**: Create test commit to verify attribution

**Problem**: Cannot access repository with agent account

**Solutions:**

- **Check collaboration status**: Verify agent account was added as collaborator
- **Accept invitation**: Login to agent account and accept repository invitation
- **Verify permissions**: Ensure agent account has appropriate access level
- **Contact repository owner**: If access issues persist

### Development Environment Issues

#### Node/npm Issues

**Problem**: Package installation or script execution fails

**Solutions:**

- **Check Node version**: Ensure compatible Node.js version (18+)
- **Clear cache**: `npm cache clean --force`
- **Delete node_modules**: `rm -rf node_modules package-lock.json && npm install`
- **Check permissions**: Ensure proper file permissions for npm operations

#### Docker Issues (Local Development)

**Problem**: Docker containers fail to start or build

**Solutions:**

- **Check Docker daemon**: Ensure Docker Desktop is running
- **Rebuild containers**: `docker-compose down && docker-compose up --build`
- **Clear volumes**: `docker-compose down -v` to remove volumes
- **Check ports**: Ensure ports 3000 and others aren't in use

#### Vercel Deployment Issues

**Problem**: Deployment to Vercel fails

**Solutions:**

- **Check build locally**: Run `npm run build` to test build process
- **Review deployment logs**: Check Vercel dashboard for error details
- **Environment variables**: Ensure proper environment configuration
- **Dependency issues**: Verify all dependencies are properly installed

#### Vercel Region Not Changing (Hobby Plan)

**Problem**: Changed `regions` in `vercel.json` but deployment still uses old region

**Symptoms:**

- `vercel.json` has correct region (e.g., `"regions": ["fra1"]`)
- Deployment completes successfully
- Vercel Dashboard → Functions → Function Region still shows old region (e.g., `iad1`)

**Root Cause:**

On Vercel Hobby plans, the dashboard region setting **overrides** `vercel.json`. The code configuration is ignored
in favor of the project-level dashboard setting.

**Solution:**

1. Go to Vercel Dashboard → Project Settings → Functions → Function Region
2. Expand the target region (e.g., "Europe")
3. Select the specific region (e.g., "Frankfurt, Germany (West) - fra1")
4. Remove the previous region selection
5. Click "Save"
6. Trigger a new deployment (push to main or use "Redeploy" button)

**Verification:**

After redeployment, check the Functions tab in the deployment details to confirm the new region is active.

**Note:** This limitation only affects Hobby plans. Pro and Enterprise plans respect `vercel.json` region settings.

### Workflow Violations

#### Auto-merge Without Approval

**Problem**: Auto-merge was enabled without explicit user consent

**Response Protocol:**

1. **Acknowledge violation**: "I enabled auto-merge without explicit approval"
2. **Explain correct process**: Detail what should have happened
3. **Document incident**: Note for process improvement
4. **Take corrective action**: Disable auto-merge if possible, wait for manual approval

#### Premature Issue Closure Claims

**Problem**: Claimed issue was closed before GitHub verification

**Response Protocol:**

1. **Acknowledge violation**: "I claimed issue closure before verification"
2. **Correct verification**: Use `gh issue view #X` to check actual status
3. **Update status**: Provide accurate current status
4. **Complete workflow**: Ensure proper closure verification

#### PR Branch Violations

**Problem**: Created new PRs for related changes instead of updating existing PR

**Response Protocol:**

1. **Acknowledge violation**: "I should have updated existing PR"
2. **Correct approach**: Continue work on original feature branch
3. **Update existing PR**: Push changes to same branch
4. **Maintain workflow**: Follow "ONE FEATURE = ONE BRANCH = ONE PR" principle

### Git History Rewriting

#### Force Push Blocked by Branch Protection

**Problem**: `git push --force` fails with "Cannot force-push to this branch"

**Symptoms:**

- Error: `GH006: Protected branch update failed for refs/heads/main`
- Error: `Cannot force-push to this branch`
- Occurs when rewriting git history (e.g., fixing commit attribution)

**Root Cause:**

GitHub has branch protection rules that block force pushes to `main`. This project uses both:

- **Repository rulesets** (newer): Settings → Rules
- **Legacy branch protection** (older): Settings → Branches

Both must allow force pushes for history rewriting to work.

**Solution - Temporarily Disable Protection:**

1. **Go to repository rulesets**: <https://github.com/mikiwiik/instructions-only-claude-coding/settings/rules/>
2. **Edit the ruleset** protecting `main`
3. **Remove `main` from Target branches** (this temporarily disables protection)
4. **Save changes**
5. **Perform force push**: `git push --force origin main`
6. **Re-enable protection**: Edit ruleset → Add "Include by pattern": `main`
7. **Save changes**

**API Alternative** (for automation):

```bash
# Remove branch protection temporarily
gh api repos/OWNER/REPO/branches/main/protection -X DELETE

# Perform force push
git push --force origin main

# Restore branch protection
gh api repos/OWNER/REPO/branches/main/protection -X PUT --input - <<'EOF'
{
  "required_status_checks": {
    "strict": true,
    "checks": [{"context": "Build and Test"}]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "required_approving_review_count": 1
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
EOF
```

**When This Is Needed:**

- Fixing incorrect commit attribution (email/name)
- Removing sensitive data from history
- Squashing commits for cleaner history
- Rebasing onto a new base

**Post-Operation Checklist:**

- [ ] Branch protection re-enabled
- [ ] Verify with `gh api repos/OWNER/REPO/branches/main/protection`
- [ ] Notify collaborators to re-clone or reset their local repos
- [ ] Clean up stale local branches: `git remote prune origin`

### Commitlint Parser Bug

#### Bullet List Validation Failures

**Problem**: Commit messages with 3+ bullet points fail `footer-leading-blank` validation even when correctly formatted

**Symptoms:**

- Commitlint reports phantom blank line before 3rd+ bullet point
- Same commit message format passes with 2 bullets but fails with 3+
- Error message: `✖ footer must have leading blank line [footer-leading-blank]`
- Inconsistent behavior - sometimes 3 bullets pass, sometimes fail

**Root Cause:**

Commitlint parser (both local `npx commitlint` and `wagoid/commitlint-github-action`) has a bug where it
incorrectly inserts a blank line before the final bullet in lists with 3+ items, making subsequent text
appear as a footer without proper spacing.

**Workarounds:**

##### Option 1: Limit to 2 Bullets (Recommended)

```text
type(scope): description

Body paragraph explaining the change.

Changes:
- Primary change combining related items
- Secondary change combining related items

Additional details in prose format.

Fixes #XXX
```

##### Option 2: Use Prose Format

```text
type(scope): description

Body paragraph explaining the change.

Changes include adding the category-testing section to documentation,
removing "Testing infrastructure" from category-infrastructure scope,
adding testing examples, and relabeling issues #257, #196, #189.

Fixes #XXX
```

##### Option 3: Numbered Lists (Alternative)

```text
type(scope): description

Body paragraph explaining the change.

Changes:
1. First change
2. Second change

Additional context as needed.

Fixes #XXX
```

**Testing Your Commit Message:**

```bash
# Create test message in a file
cat > /tmp/test-commit-msg.txt << 'EOF'
type(scope): description

Changes:
- First change
- Second change

This change improves functionality.

Fixes #123
EOF

# Test with commitlint
cat /tmp/test-commit-msg.txt | npx commitlint
```

**Expected Behavior:**

- ✅ 2 bullets: Passes validation consistently
- ❌ 3+ bullets: May fail with phantom blank line error
- ✅ Prose format: Passes validation consistently

**Related Issues:**

- Issue #270 - Bug documentation and workaround implementation
- Issue #266 - Where bug was initially discovered

**Technical Details:**

- Affected: `@commitlint/cli@20.1.0` and `@commitlint/config-conventional@20.0.0`
- GitHub Action: `wagoid/commitlint-github-action`
- Rule failing: `footer-leading-blank` (level 2, 'always')
- Status: Parser-level bug, not configuration issue

**When to Report:**

If you encounter this bug with a different commit message pattern, document it in issue #270 to help
identify additional edge cases.

### Performance and Quality Issues

#### Slow Development Server

**Problem**: `npm run dev` is slow or unresponsive

**Solutions:**

- **Clear Next.js cache**: Delete `.next` directory
- **Restart development server**: Stop and restart `npm run dev`
- **Check memory usage**: Monitor system resources
- **Update dependencies**: Ensure latest compatible versions

#### Build Performance Issues

**Problem**: `npm run build` takes excessive time

**Solutions:**

- **Analyze bundle size**: Use built-in Next.js bundle analyzer
- **Optimize imports**: Use tree-shaking friendly import patterns
- **Check dependencies**: Remove unused dependencies
- **Enable build optimizations**: Verify Next.js optimization settings

## Prevention Strategies

### Quality Assurance

- **Run quality checks locally** before pushing changes
- **Use pre-commit hooks** to catch issues early
- **Follow atomic commit practices** for easier troubleshooting
- **Maintain clear branch naming** conventions

### Workflow Compliance

- **Always wait for explicit approval** before enabling auto-merge
- **Verify push success** before creating PRs
- **Check GitHub issue status** before claiming closure
- **Continue work on existing branches** for related changes

### Development Best Practices

- **Keep dependencies updated** regularly
- **Monitor CI/CD pipeline** for early issue detection
- **Document unusual decisions** for future reference
- **Test changes locally** before pushing to remote

This troubleshooting guide helps maintain smooth development workflow and quick issue resolution.
