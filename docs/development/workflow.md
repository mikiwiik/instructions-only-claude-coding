# Development Workflow and Code Standards

This document outlines the development workflow, coding standards, and quality assurance practices for the Todo App project.

## Development Workflow Overview

### Branch-Based Development

**Current Workflow**: `Branch-based with Pull Requests`

- Development follows feature branch workflow with pull requests
- Each feature is developed on a separate branch (`feature/issue-number-description`)
- Pull requests are used for code review and CI validation before merge
- Main branch maintains stable, tested code
- See [Branch Workflow Documentation](../BRANCH_WORKFLOW.md) for detailed guidelines

## Code Quality Standards

The project enforces strict code quality through automated tools and processes:

### Automated Quality Tools

- **ESLint**: JavaScript/TypeScript linting with strict rules
- **Prettier**: Automatic code formatting for consistency
- **markdownlint**: Documentation formatting standards
- **TypeScript**: Strict type checking for type safety
- **Husky + lint-staged**: Pre-commit hooks prevent poorly formatted code from being committed

### Pre-commit Quality Checks

Every commit automatically runs:

1. **ESLint**: Checks code for errors and style violations
2. **Prettier**: Auto-formats code for consistency
3. **markdownlint**: Ensures documentation follows formatting standards
4. **Type Checking**: Verifies TypeScript compilation

## Atomic Commit Strategy

The project follows professional atomic commit practices for improved code history and collaboration.

### Core Principles

- **One Logical Change**: Each commit represents a single, focused change
- **Conventional Commits**: Standardized format with type prefixes (feat, fix, test, docs)
- **Issue Linking**: Every commit references the related GitHub issue (#issue-number)
- **Self-Contained**: Each commit maintains a working application state

### Commit Message Format

```text
type(scope): description (#issue-number)

Optional body explaining the change in detail

Optional footer for issue closure
```

### Commit Types

- **feat**: New features and functionality
- **fix**: Bug fixes and corrections
- **test**: Test additions, updates, or improvements
- **docs**: Documentation changes and updates
- **refactor**: Code refactoring without behavior changes
- **style**: Code style changes (formatting, missing semicolons, etc.)
- **chore**: Maintenance tasks (dependency updates, build changes, etc.)

### Example Commit Sequence

```bash
# Individual atomic commits for a feature
feat(todo): add completedAt field to TodoItem interface (#33)
test(todo): add timestamp tracking tests (#33)
docs(todo): update README with completion feature (#33)

# Final comprehensive commit
feat: complete todo completion timestamp tracking

Implements full completion timestamp functionality including:
- Data model updates with completedAt field
- State management for timestamp capture
- UI component for displaying completion history
- Comprehensive test coverage

Closes #33
```

### Benefits of Atomic Commits

- **Focused Code Review**: Individual logical changes are easier to review
- **Clear Development History**: Logical progression visible in git log
- **Precise Debugging**: Better git bisect and blame functionality
- **Selective Rollbacks**: Revert specific changes without losing entire features

## GitHub Issue Integration

### Issue Linking Requirements

All commits related to GitHub issues MUST include appropriate linking keywords to automatically connect commits to
issues and enable automatic issue closure.

### Closing Keywords

Use these keywords to automatically close issues when commits are pushed/merged:

- **`Closes #123`**: Use for feature implementations
- **`Fixes #123`**: Use for bug fixes
- **`Resolves #123`**: Use for general issue resolution

### Linking Keywords

Use these keywords to reference issues without closing them:

- **`References #123`**: Use for partial work or related changes
- **`Related to #123`**: Use for tangentially related commits

### Commit Examples

```bash
# Feature implementation (closes issue)
feat: implement todo deletion functionality

Adds delete button to todo items with confirmation dialog
and proper state management for removing items from list.

Closes #15

# Bug fix (closes issue)
fix: resolve todo timestamp display issue in Safari

Updates date formatting to use cross-browser compatible
approach for displaying completion timestamps.

Fixes #23

# Partial work (references without closing)
test: add initial tests for todo filtering

Sets up test infrastructure for filtering functionality.
Additional tests will be added in subsequent commits.

References #18
```

### Benefits of Issue Linking

- Issues automatically close when commits are pushed/merged
- Clear traceability between commits and issues
- Improved project tracking and development history
- Follows GitHub best practices for issue management

## Code Review Process

### Pull Request Requirements

- **Branch Naming**: Use `feature/issue-number-description` format
- **CI Validation**: All GitHub Actions checks must pass
- **Code Review**: At least one review required (can be self-approved for learning)
- **Documentation**: Update relevant documentation with changes
- **Testing**: Include appropriate tests for new functionality

### Review Checklist

- [ ] Code follows project style and conventions
- [ ] All tests pass and coverage is maintained
- [ ] Documentation is updated appropriately
- [ ] Commit messages follow atomic commit guidelines
- [ ] No merge conflicts or build failures
- [ ] Security considerations addressed

## Testing Standards

### Test-Driven Development (TDD)

The project follows TDD methodology:

1. **Write Failing Tests**: Create tests for new functionality first
2. **Implement Functionality**: Write minimum code to make tests pass
3. **Refactor**: Improve code while maintaining passing tests
4. **Repeat**: Continue cycle for each new feature

### Testing Requirements

- **Unit Tests**: Required for all business logic and utilities
- **Component Tests**: Required for React components
- **Integration Tests**: Required for complex user workflows
- **Coverage**: Maintain comprehensive test coverage

### Test Commands

```bash
npm run test         # Run test suite
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

## Development Commands

### Quality Assurance Commands

```bash
# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Auto-fix ESLint issues
npm run format       # Format code with Prettier
npm run format:check # Check if code needs formatting
npm run type-check   # TypeScript type checking

# Documentation Quality
npm run lint:md      # Lint markdown files
npm run lint:md:fix  # Auto-fix markdown issues
```

### Development Commands

```bash
npm run dev          # Start development server
npm run build        # Create production build
npm run start        # Start production server
```

## Documentation Requirements

### Code Documentation

- **TypeScript Types**: Use comprehensive type definitions
- **Function Documentation**: Document complex functions and algorithms
- **Component Props**: Document React component interfaces
- **API Documentation**: Document any external interfaces

### Architecture Documentation

- **ADRs**: Document all significant architectural decisions
- **README Updates**: Keep project overview current
- **Process Documentation**: Document workflow changes
- **Cross-References**: Maintain links between related documentation

## Quality Metrics

### Code Quality Indicators

- **Linting**: Zero ESLint errors or warnings
- **Formatting**: All code formatted with Prettier
- **Type Safety**: No TypeScript errors
- **Test Coverage**: Comprehensive test coverage maintained

### Process Quality Indicators

- **Atomic Commits**: Clean, focused commit history
- **Issue Linking**: All commits properly linked to issues
- **Documentation**: Up-to-date and comprehensive documentation
- **CI/CD**: All automated checks passing

## Best Practices

### Code Organization

- **File Structure**: Follow established project structure
- **Naming Conventions**: Use clear, descriptive names
- **Component Design**: Follow React best practices
- **State Management**: Use appropriate state management patterns

### Collaboration

- **Communication**: Clear commit messages and PR descriptions
- **Knowledge Sharing**: Document decisions and processes
- **Code Review**: Constructive feedback and discussion
- **Issue Tracking**: Comprehensive issue descriptions and updates

### Continuous Improvement

- **Retrospectives**: Regular process evaluation and improvement
- **Tool Updates**: Keep development tools current
- **Standard Evolution**: Adapt standards as project grows
- **Learning**: Share knowledge and best practices

## Issue and Pull Request Completion Protocol

**🚨 CRITICAL REQUIREMENT**: All development work must follow this completion protocol to ensure proper project
management and workflow integrity.

### Mandatory Completion Workflow

All development work must follow this completion protocol before considering any work finished.

#### Issue Lifecycle Management

**Before Considering Work Complete:**

1. **Verify Implementation**: Confirm all requirements from the issue are fully implemented
2. **Test Validation**: Ensure all tests pass and new functionality works as expected
3. **Documentation**: Update any relevant documentation (README, ADRs, inline docs)
4. **Status Check**: Use `gh issue view <issue-number>` to verify current issue status
5. **Explicit Closure**: Close the issue if work is truly complete

**Commands for Issue Management:**

```bash
# Check issue status
gh issue view <issue-number>

# Close issue with comment
gh issue close <issue-number> --comment "Implementation complete and tested"

# Verify closure
gh issue view <issue-number> --json state
```

#### Pull Request Lifecycle Management

**For Branch-Based Development:**

1. **PR Creation**: Create pull request with comprehensive description
2. **CI Validation**: Ensure all continuous integration checks pass
3. **Code Review**: Complete any required code review process
4. **Merge Completion**: Merge PR using appropriate merge strategy
5. **Branch Cleanup**: Delete feature branch after successful merge
6. **Issue Auto-Closure**: Verify associated issues were automatically closed

**Commands for PR Management:**

```bash
# Create pull request
gh pr create --title "..." --body "..."

# Check PR status
gh pr view <pr-number> --json state,mergeable,statusCheckRollup

# Merge pull request
gh pr merge <pr-number> --squash --delete-branch

# Verify associated issues were closed
gh issue list --state closed --search "linked:pr-<pr-number>"
```

#### Quality Assurance Checklist

**Development Completion Checklist:**

- [ ] All implementation requirements satisfied
- [ ] Test suite passes completely (`npm test`)
- [ ] Code quality checks pass (`npm run lint`, `npm run type-check`)
- [ ] Documentation updated as needed
- [ ] GitHub issue status verified and closed
- [ ] Pull request merged and branch cleaned up
- [ ] No orphaned issues or incomplete workflows

#### Best Practices

**Issue Management:**

- Link commits to issues using `#issue-number` in commit messages
- Use conventional commit messages for clear traceability
- Close issues only when work is completely finished and tested
- Add closing comments that summarize what was accomplished

**Pull Request Management:**

- Include comprehensive descriptions of changes
- Reference related issues using "Closes #issue-number"
- Ensure all CI checks pass before merging
- Use appropriate merge strategy (squash for feature branches)
- Clean up feature branches after successful merge

#### Troubleshooting Workflow Issues

**Common Issues:**

- **Issue Not Auto-Closing**: Verify PR description includes "Closes #issue-number"
- **Failed CI Checks**: Review and fix all failing tests and quality checks
- **Merge Conflicts**: Resolve conflicts and update PR branch
- **Orphaned Branches**: Use `git branch -d branch-name` to clean up merged branches

**Recovery Actions:**

- If issue remains open after PR merge, manually close with explanation
- If CI fails after merge, create hotfix issue and immediate resolution
- If branch wasn't deleted, clean up using GitHub interface or CLI

---

This development workflow ensures high code quality, clear project history, effective collaboration, and complete
issue/PR lifecycle management while supporting the educational objectives of the Todo App project.
