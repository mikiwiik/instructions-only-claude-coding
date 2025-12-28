# Development Workflows

> **Strategic Context**: [Development Principles](principles.md) | [Framework](framework.md) |
> [Operational Guide](../development/workflow.md)

## Git and Branch Management

### Feature Branch Workflow

**🚨 MANDATORY**: All code changes must be made on feature branches and handled via Pull Requests.

**🚨 PRINCIPLE**: One issue per feature branch - each branch addresses exactly one GitHub issue.

1. **Create Feature Branch**: `git checkout -b feature/XX-description` (where XX = issue number)
2. **Implement Changes**: Make atomic commits with clear messages
3. **Push to Remote**: `git push -u origin feature/XX-description`
4. **Create Pull Request**: Always required regardless of GitHub settings
5. **Merge After Approval**: Via auto-merge or manual approval

### Atomic Commit Strategy

**🚨 PRINCIPLE**: Multi-step code changes are implemented as **multiple small atomic commits**, not one large commit.

**This project uses [Conventional Commits](https://www.conventionalcommits.org/)** - a specification for structured,
human and machine-readable commit messages.

**Commit Message Format:**

```text
type(scope): description (#issue-number)

Optional body explaining the change in detail
Optional footer for breaking changes or issue closure
```

**Commit Types ([Conventional Commits](https://www.conventionalcommits.org/)):**

See `commitlint.config.mjs` for the authoritative list of allowed types. Common types include:

- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation updates
- `test`: Adding or updating tests
- `refactor`: Code refactoring without behavior changes
- `style`: Code style changes (formatting)
- `ci`: CI/CD pipeline changes
- `build`: Build system and dependencies
- `chore`: Maintenance tasks
- `security`: Security fixes and patches
- `perf`: Performance improvements

**Reference**: See `commitlint.config.mjs` for complete rules, validation logic, and detailed type descriptions.

### Commit Message Validation

**🚨 ENFORCED**: Commit messages are validated automatically via commitlint.

**Local Validation** (commit-msg hook):

- Runs on every `git commit`
- Immediate feedback before push
- Validates format against `commitlint.config.mjs`

**CI Validation** (GitHub Actions):

- Runs on all pull requests
- Validates all commits in PR
- Blocks merge if non-compliant commits found

**Configuration**: See `commitlint.config.mjs` (root directory) for complete rules and allowed commit types.

**⚠️ Known Limitation - Bullet List Parser Bug**:

Commitlint has a parser bug that incorrectly inserts blank lines before the 3rd+ bullet point in commit
message lists, causing `footer-leading-blank` validation failures even when the message is correctly formatted.

**Workaround**: Limit bullet lists to **2 items maximum** or use prose format instead. See
[Troubleshooting Guide](../reference/troubleshooting.md#commitlint-parser-bug) for details.

**Common Validation Errors**:

```bash
# ❌ Missing type
Update README

# ✅ Correct
docs: update README

# ❌ Uppercase subject
feat: Add new feature

# ✅ Correct
feat: add new feature

# ❌ Invalid type
updated: fix typo

# ✅ Correct
fix: fix typo

# ❌ Period at end
docs: update README.

# ✅ Correct
docs: update README
```

**Bypassing Validation** (emergency only):

```bash
git commit --no-verify -m "emergency fix"
```

⚠️ CI will still validate - use only for local emergencies, fix before pushing.

### AI Agent Attribution

**🚨 REQUIRED**: All AI-assisted work must use proper attribution as defined in [ADR-015](../adr/015-ai-agent-attribution-strategy.md).

**AI Agent Commit Format:**

```text
type(scope): description (#issue-number)

Optional body explaining the change in detail. If using bullet lists,
limit to 2 items maximum to avoid commitlint parser bugs.

🤖 Generated with AI Agent

Co-Authored-By: [Human Name] <human.email@domain.com>
```

**Attribution Requirements:**

- **Author**: AI Agent account (`{user}+agent@domain.com`)
- **Footer**: `🤖 Generated with AI Agent`
- **Co-Author**: Human collaborator with proper credit
- **Repository Config**: Use `.gitconfig` for automatic attribution

### Multi-Step Implementation Approach

**Each logical change = One atomic commit, all commits reference the same issue:**

- ✅ **Incremental Development**: Build functionality step by step
- ✅ **Easy Review**: Each commit addresses single concern
- ✅ **Precise Rollback**: Revert specific changes without losing others
- ✅ **Clear History**: Logical progression through development
- ✅ **Issue Traceability**: All commits in branch reference the same issue number

**Example Multi-Step Feature Implementation:**

```bash
git commit -m "test: add failing test for feature X (#33)"
git commit -m "feat: implement basic feature X functionality (#33)"
git commit -m "refactor: extract utility functions for feature X (#33)"
git commit -m "test: add edge cases for feature X (#33)"
git commit -m "docs: update README with feature X usage (#33)"
git commit -m "feat: complete feature X implementation

Implements full functionality including core feature implementation,
comprehensive test coverage, and documentation updates.

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

### Issue Linking Requirements

**🚨 REQUIRED**: All commits and PRs related to GitHub issues MUST include appropriate linking keywords.

**Closing Keywords** (automatically close issues when merged):

- `Closes #123` - Use for feature implementations
- `Fixes #123` - Use for bug fixes
- `Resolves #123` - Use for general issue resolution

**Linking Keywords** (reference without closing):

- `References #123` - Use for partial work or related changes
- `Related to #123` - Use for tangentially related commits

**PR Description Template:**

```markdown
## Summary

Brief description of changes

## Context

Addresses issue #XXX - [brief issue context]

## Implementation

Key changes made and technical decisions. Use prose format or
limit to 2 bullet items maximum to avoid commitlint parser issues.

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
2. **🚨 REQUIRED**: Enable automerge: `gh pr merge --auto --rebase`
3. Wait for approval and CI: Automatic merge when requirements met
4. Branch cleanup: Automatic deletion after successful merge

**Note**: Step 2 is mandatory for all PRs to maintain consistent workflow and reduce manual intervention.

**Manual Override (when needed):**

- If automerge not desired: Skip step 2, merge manually after approval
- If urgent merge needed: Use `--admin` flag to bypass protection (with permission)

### PR Approval Protocol {#pull-request-workflow}

**🚨 MANDATORY 5-STEP WORKFLOW**: Follow this exact sequence for all PRs.

#### Step-by-Step PR Creation and Completion

##### Step 1: Create Pull Request

```bash
gh pr create --title "..." --body "..."
```

- Use descriptive title following conventional commit format
- Include "Closes #XXX" in PR body for automatic issue closure
- Reference related issues and provide implementation context

##### Step 2: Enable Automerge with Rebase (MANDATORY)

```bash
gh pr merge <PR_NUMBER> --auto --rebase
```

- **🚨 REQUIRED**: Must be done immediately after PR creation (not optional)
- `--rebase` preserves atomic commit history (per ADR-010)
- Automerge triggers when CI passes and approvals received

##### Step 3: Report Status to User

Report the following to user:

- ✅ PR URL and number
- ✅ Automerge enabled with rebase strategy
- ✅ Waiting for CI checks and required approvals
- ✅ Will auto-merge when requirements met

##### Step 4: Let CI Run and PR Auto-Merge

- 🛑 **STOP and WAIT** - Do not claim completion yet
- ⏳ CI checks must pass automatically
- 👤 Required reviewer approval (automated or manual)
- ✅ PR auto-merges when all requirements satisfied

##### Step 5: Verify Completion

```bash
gh issue view #XXX
```

- **ONLY claim completion after** verifying issue is closed and PR merged
- Confirm GitHub Projects status updated to "Done"
- Task completion = PR merged and issue closed, NOT just PR created

#### Forbidden Actions Without User Permission

❌ **NEVER** use these without explicit user permission:

- `gh pr merge --admin`
- `gh pr merge --force`
- `git push --force`
- `git push --force-with-lease`
- Any command that bypasses branch protection or review requirements

#### When PR Cannot Auto-Merge

1. Report the blocking issue to user
2. Ask user how to proceed
3. Wait for explicit instructions

#### Quick Reference

```bash
# Complete PR workflow in 2 commands
gh pr create --title "..." --body "Closes #XXX\n\n..."
gh pr merge <PR_NUMBER> --auto --rebase

# Then wait for CI + approval, verify with:
gh issue view #XXX
```

### Bypass Rules (Admin Privileges)

#### 🚨 USE ONLY WITH EXPLICIT USER PERMISSION

**When to Use:**

- CI checks failing but changes are safe/urgent
- Branch protection blocking despite user approval
- User explicitly requests immediate merge with phrases like:
  - "bypass rules and merge"
  - "use admin flag to merge"
  - "force merge this PR"

**Required Process:**

1. **DO NOT** proceed unless user explicitly requests bypass
2. Confirm user intent if unclear
3. Only then execute: `gh pr merge --admin --rebase --delete-branch`

### Merge Strategy Guidelines

**🚨 DEFAULT STRATEGY: Rebase** - Preserves atomic commits and maintains linear history (per ADR-010)

| Strategy                 | When to Use                                        | Result                                              | Command                       |
| ------------------------ | -------------------------------------------------- | --------------------------------------------------- | ----------------------------- |
| **`--rebase`** (default) | Multi-commit features, preserving atomic history   | Individual commits replayed on main, linear history | `gh pr merge --auto --rebase` |
| **`--squash`**           | Trivial single-commit changes (typos, doc updates) | All commits combined into one                       | `gh pr merge --auto --squash` |
| **`--merge`**            | When merge commit context needed                   | Preserves commits + adds merge commit               | `gh pr merge --auto --merge`  |

**Why Rebase is Default:**

- ✅ **Preserves atomic commits**: Full commit history visible in main branch
- ✅ **Linear history**: Clean, easy-to-follow git log without merge commits
- ✅ **Bisect-friendly**: Can pinpoint exact commit that introduced issues
- ✅ **AI attribution**: Each commit retains individual co-author attribution
- ✅ **Aligns with ADR-010**: Philosophy matches implementation

**When to Override:**

- Use `--squash` only for trivial changes (typo fixes, minor doc updates)
- Use `--merge` when you need explicit merge commit context (rare)

## Issue Completion Workflow

### Feature Completion Sequence

**🚨 CRITICAL WORKFLOW**: Follow exact sequence to prevent violations:

1. **Start Work** - Update GitHub Projects status (automated via `/work-on`)
   - Status: Todo → **In Progress**
   - Lifecycle: Icebox/Backlog → **Active**
2. **Complete Implementation** - Code, tests, documentation
3. **Run Quality Checks** - Ensure all tests pass, lint, typecheck
4. **Verify Test Coverage** - All tests in version control and passing
5. **Commit for Issue Closure** - Local commit with "Closes #X"
6. **Push to Remote** - `git push -u origin feature/XX-description`
7. **Verify Push Success** - Confirm remote branch tracking and all tests pushed
8. **Create PR** - Always required by methodology (ONLY after all tests pass and pushed)
   - **🚨 REQUIRED**: Include "Closes #X" in PR description for automatic issue closure
9. **🚨 REQUIRED**: Enable automerge: `gh pr merge --auto --rebase`
10. **Wait for Merge** - CI passes + reviewer approval (automerge handles the merge)
11. **Verify Issue Closure** - Use `gh issue view #X` to confirm
    - Status automatically set to **Done** (via GitHub Projects automation)
    - Lifecycle automatically set to **Done** (via GitHub Projects automation)
12. **Confirm Completion** - All requirements satisfied

### GitHub Projects Status Transitions

**Status Field** (tracks current work state):

- **Todo** → **In Progress**: When `/work-on` starts (automated)
- **In Progress** → **Done**: When PR merged (automated via GitHub Projects workflow)

**Lifecycle Field** (tracks idea maturity):

- **Icebox** → **Backlog**: When idea is triaged and labeled (manual)
- **Backlog** → **Active**: When work begins via `/work-on` (automated)
- **Active** → **Done**: When issue closed via PR merge (automated)

**Automation**:

- `/work-on` command automatically sets Status="In Progress" and Lifecycle="Active"
- PR merge automatically sets Status="Done" and Lifecycle="Done" (GitHub Projects workflow)
- Status field updates are fully automated - no manual updates needed during workflow

### Issue Closure Verification

**Only claim "Issue #X is closed" AFTER:**

- PR has been merged to main branch
- GitHub automatically closed issue via "Closes #X" commit
- Verification completed with `gh issue view #X`

## Requirement Traceability

All issues and PRs must trace back to product requirements defined in
[docs/product/requirements.md](../product/requirements.md).

### Issue Creation Requirement Check

**Before creating an issue**:

1. Review [docs/product/requirements.md](../product/requirements.md)
2. Determine if the issue:
   - **Fulfills** an existing Planned requirement (note which section)
   - **Enhances** an existing Implemented requirement (note which section)
   - **Introduces** a new requirement (add to requirements.md first via separate PR)

### PR Requirement Validation

- Linked issue must specify which requirement(s) it addresses
- Definition of Done includes: requirement fulfillment verified
- Update requirement status when work completes (Planned → In Progress → Implemented)

### Requirement Status Updates

When a PR completes work that changes a requirement's status:

1. Include requirement status update in PR (edit requirements.md)
2. Update from `Planned` → `In Progress` when development starts
3. Update from `In Progress` → `Implemented` when PR merges

## Quality Gates

### Quality Metrics

Current project maintains the following quality targets:

- **TypeScript Coverage**: 100% (strict mode, no `any` types)
- **Test Coverage**: 80%+ line coverage, 100% for critical paths
- **ESLint**: Zero warnings or errors policy
- **SonarCloud**: Quality gate passing (bugs, code smells, security vulnerabilities)
- **Accessibility**: WCAG 2.2 AA compliance (see [docs/ux/accessibility-requirements.md](../ux/accessibility-requirements.md))
- **Code Complexity**: ADR-027 compliance (cognitive ≤15, nesting ≤4, cyclomatic ≤15)
- **Performance**: Optimal React patterns and bundle size management

These metrics are enforced through pre-commit hooks, CI/CD pipelines, SonarCloud analysis, and manual code review.

### Code Quality Standards

**TypeScript Requirements:**

- Strict mode compliance with no `any` types (enforced as error per ADR-022)
- 100% type coverage for all application code
- Proper interface definitions and type exports
- Use approved alternatives to `any`: `unknown`, interfaces, generics, type guards
- Test code must maintain same type safety standards as production code
- See [docs/guidelines/typescript-standards.md](../guidelines/typescript-standards.md) for comprehensive best practices

**Linting and Formatting:**

- ESLint: Zero errors or warnings (enforced via pre-commit hooks)
- Prettier: Consistent code formatting (enforced via pre-commit hooks)
- Import organization and unused import removal

**Testing Standards:**

- TDD approach: Tests written before implementation
- 80%+ line coverage, 100% for critical paths
- All tests passing and in version control
- React Testing Library for component testing
- Jest for test runner and coverage reporting

**Accessibility Compliance:**

- WCAG 2.2 AA standards adherence
- Proper ARIA attributes and semantic HTML
- Keyboard navigation support
- Screen reader compatibility
- See [docs/ux/accessibility-requirements.md](../ux/accessibility-requirements.md) for complete requirements

**Code Complexity Standards:**

- Cognitive complexity ≤15 per function (enforced as error per ADR-027)
- Nesting depth ≤4 levels (enforced via ESLint `max-depth`)
- Cyclomatic complexity ≤15 per function (enforced via ESLint `complexity`)
- Function length ≤150 lines (warning), ≤300 lines (error)
- Function parameters ≤4 (warning for maintainability)
- Refactoring patterns: Extract functions, custom hooks, utility modules
- See [docs/guidelines/code-complexity-guidelines.md](../guidelines/code-complexity-guidelines.md) for refactoring strategies
- See [docs/adr/027-code-complexity-standards.md](../adr/027-code-complexity-standards.md) for decision rationale

### Pre-commit Requirements

- ESLint: Zero errors or warnings (includes complexity rules)
- Prettier: Consistent code formatting
- TypeScript: Strict mode compliance
- Code Complexity: All functions meet ADR-027 thresholds
- Tests: All tests passing and in version control

### Pre-merge Requirements

- All automated CI checks passing
- All tests passing on remote branch
- **SonarCloud quality gate passing** (no new bugs, code smells, or security issues)
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

Follow the 5-step protocol defined in [CLAUDE.md Task Planning Protocol](../../CLAUDE.md#task-planning-protocol):
Assessment → Task Breakdown → User Approval → Implementation Tracking → Completion Verification

## Documentation Workflow

### Architecture Decision Records (ADRs)

**When to Create:**

- Before any significant technical decision
- When choosing between multiple implementation approaches
- For architectural patterns and framework choices

**Process:**

- Create in `docs/adr/###-title.md` using sequential numbering
- Include: Problem statement, alternatives considered, decision rationale
- Reference: See `docs/adr/PROCESS.md` for complete guidelines

### Mermaid Diagrams

**Purpose:** Create visual representations to improve documentation clarity and system understanding

**When to Create:**

- Architecture overviews and system design documentation
- Logic flows and decision trees for complex processes
- Component interaction diagrams
- Development workflow illustrations
- Data flow and state management visualizations
- User interaction flows and UX documentation

**Process:**

- Use Mermaid syntax for GitHub-compatible diagrams
- Include diagrams inline in markdown files using ```mermaid code blocks
- Focus on clarity and logical flow over visual complexity
- Update diagrams when underlying systems change

**Common Diagram Types:**

- **Flowcharts**: Decision logic, process flows, algorithm steps, user interaction flows
- **Sequence Diagrams**: Component interactions, API calls, user flows
- **Class Diagrams**: Data models, type relationships, architecture
- **Git Graphs**: Branch strategies, workflow illustrations

**User Flow Diagrams** (`docs/diagrams/user-flows.md`):

- **🚨 REQUIRED**: Update when user interaction patterns change
- Document all main user capabilities (add, edit, delete, filter, etc.)
- Include decision points, alternate paths, and system behaviors
- Show multi-input support (click, touch gestures, keyboard)
- Maintain for UX understanding and onboarding

### Required Documentation Updates

- **ADRs**: For architectural decisions before implementation
- **README.md**: For new features or setup changes
- **Inline Comments**: For complex logic (sparingly)
- **CLAUDE.md**: For workflow or process changes
- **Mermaid Diagrams**: For architecture, flows, and system interactions
- **User Flow Diagrams** (`docs/diagrams/user-flows.md`): When user interaction patterns change (new features, UI
  changes, gesture modifications)

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
