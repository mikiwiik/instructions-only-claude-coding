# ADR-010: Atomic Commit Strategy Adoption

## Status

Accepted

## Context

The project currently uses a single-commit approach where entire features are implemented and
committed as one large changeset. This practice, while simple, creates several challenges:

- **Code Review Difficulty**: Large commits encompassing multiple logical changes are hard to review
  effectively
- **Development History Clarity**: The progression of feature development is not visible in git history
- **Debugging Complexity**: Git tools like bisect and blame are less effective with monolithic commits
- **Rollback Precision**: Cannot revert specific changes without losing entire features
- **Requirement Traceability**: No clear connection between individual code changes and specific
  requirements
- **Collaboration Barriers**: Multiple developers cannot easily understand the logical steps taken
  during development

As this is a learning project focused on professional development practices, adopting
industry-standard commit practices is essential for educational value and demonstration of best
practices in Claude Code-assisted development.

## Decision

We will adopt an **atomic commit strategy** with the following principles:

1. **One Logical Change Per Commit**: Each commit represents a single, focused change that can be
   understood and reviewed independently
2. **Self-Contained Commits**: Every commit maintains a working state of the application
3. **Conventional Commit Format**: Standardized commit message format with type prefixes (feat,
   fix, test, docs, etc.)
4. **Issue Linking**: Every commit references the related GitHub issue number
5. **TDD Commit Pattern**: Follow test-driven development with separate commits for tests and
   implementation

### Commit Message Format

```text
type(scope): description (#issue-number)

Optional body explaining the change in detail

Optional footer for breaking changes or issue closure
```

### Workflow Integration

- **Feature Development**: Break features into logical atomic changes during implementation
- **Issue Closure**: Final commit provides comprehensive summary and closes the GitHub issue
- **Code Review**: Each commit can be reviewed individually for focused feedback
- **Documentation**: Separate commits for documentation updates related to the feature

### Merge Strategy

**🚨 DEFAULT: Rebase Merge** - To preserve the atomic commit strategy when merging PRs to main:

- **Use `--rebase` by default**: Replays all commits from the feature branch onto main, preserving individual commits
  and maintaining linear history
- **Avoid `--squash`**: Squashing destroys the atomic commit history we carefully crafted, defeating the purpose of
  this ADR
- **Use `--squash` only for trivial changes**: Single-commit PRs like typo fixes or minor doc updates where atomic
  history provides no value

**Rationale:**

The rebase merge strategy directly supports the atomic commit philosophy:

- ✅ All individual commits remain visible in main branch history
- ✅ Each commit's AI attribution and co-authorship is preserved
- ✅ Git bisect can pinpoint the exact commit that introduced an issue
- ✅ Code review benefits carry over to the main branch
- ✅ Development progression remains traceable in production history

Using squash merge by default would contradict the core principles of this ADR by collapsing carefully structured
atomic commits into a single monolithic change.

## Consequences

### Positive

- **Improved Code Review**: Reviewers can focus on individual logical changes, providing more targeted feedback
- **Enhanced Git History**: Clear progression of feature development visible in commit log
- **Better Debugging**: Git bisect, blame, and other tools become more effective for identifying issues
- **Precise Rollbacks**: Ability to revert specific changes without losing entire features
- **Requirement Traceability**: Direct link from code changes to GitHub issues and requirements
- **Professional Practice**: Demonstrates industry-standard git workflow practices
- **Learning Value**: Provides experience with atomic thinking and change decomposition
- **Collaboration Enhancement**: Other developers can understand development progression easily

### Negative

- **Initial Learning Curve**: Requires thinking about logical change boundaries during development
- **Perceived Overhead**: May feel like more work initially compared to single-commit approach
- **Planning Required**: Need to think ahead about commit structure during feature development
- **Discipline Required**: Maintaining atomic commits requires consistent practice

### Neutral

- **Commit Frequency**: More frequent commits (neither inherently good nor bad)
- **Branch Management**: May influence branching strategy for complex features
- **CI/CD Integration**: Each commit should maintain working state for continuous integration

## Alternatives Considered

- **Squash Strategy**: Develop with many commits, then squash before merge
  - **Rejected**: Loses the benefits of atomic history and makes code review harder

- **Feature Branch with Single Merge**: Keep current practice but use feature branches
  - **Rejected**: Doesn't address the core issues of large, unfocused commits

- **Commit After Each File**: Very granular approach with one commit per file changed
  - **Rejected**: Too granular, doesn't respect logical boundaries of changes

- **Hybrid Approach**: Atomic commits for complex features, single commits for simple ones
  - **Rejected**: Inconsistency would make it harder to establish good habits

## References

- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [Git Best Practices - Atomic Commits](https://blog.gitbutler.com/git-tips-2-new-repo/)
- [GitHub Issue Linking](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue)
- [Test-Driven Development Commit Patterns](https://martinfowler.com/articles/workflowsOfRefactoring/)
- Issue #34: Establish atomic commit guidelines and issue linking practices
