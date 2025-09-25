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
