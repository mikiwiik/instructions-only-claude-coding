# Claude Code Instructions

This file contains specific instructions for Claude Code when working on this agentic coding prototype project.

## Agentic Coding Methodology

**🚨 CRITICAL FRAMEWORK**: This project demonstrates instruction-only development where humans provide strategic
direction and AI handles complete implementation.

### Role Definition and Boundaries

#### Human Role: Strategic Architect & Product Owner

- Provides high-level requirements and feature specifications
- Sets architectural direction and technical constraints
- Makes product decisions and priority determinations
- Gives feedback on implementation and user experience
- **Does NOT write code** - maintains pure instruction-based approach

#### AI Role: Complete Implementation Team

- Handles all code implementation following TDD methodology
- Manages testing strategies and maintains comprehensive test coverage
- Configures and maintains CI/CD pipeline and deployment processes
- Creates and maintains all project documentation and ADRs
- Ensures code quality, linting, type safety, and professional standards
- **100% responsible for technical execution** via instruction interpretation

### Instruction-Based Development Principles

1. **Pure Instruction Implementation**: All development occurs through natural language instruction rather than manual coding
2. **Strategic vs. Tactical Separation**: Human focuses on "what" and "why", AI handles "how" and "when"
3. **Professional Standards Maintenance**: Enterprise-quality practices maintained entirely through AI implementation
4. **Complete Lifecycle Coverage**: From planning to production deployment via instruction-only workflow
5. **Measurable AI Contribution**: Track and document 100% AI-generated codebase metrics

### Quality Assurance Through AI

- **Test-Driven Development**: AI writes comprehensive tests before implementation
- **Atomic Commit Strategy**: AI maintains clean, logical commit history
- **Documentation Generation**: AI creates and maintains all technical documentation
- **CI/CD Management**: AI configures and maintains automated quality assurance
- **Code Review Standards**: AI applies enterprise coding standards throughout development

## Architecture Decision Records (ADRs)

**🚨 CRITICAL REQUIREMENT**: All major architectural changes and decisions MUST be documented as ADRs.

**📋 Process Documentation**: See [`docs/adr/PROCESS.md`](docs/adr/PROCESS.md) for complete ADR requirements and guidelines.

### Quick Reference

- **When**: Before any significant technical decision
- **Where**: `docs/adr/###-title.md` using the template
- **What**: Technology choices, architecture patterns, development practices
- **Why**: Maintain project knowledge and decision rationale

### Key Requirements

1. **Create ADR before implementation** - not after
2. **Use sequential numbering** - next available number
3. **Document alternatives considered** - show the thinking process
4. **Update ADR index** - maintain `docs/adr/README.md`
5. **Reference in commits** - link ADRs to related code changes

## Issue Prompt Logs (IPLs)

**📝 METHODOLOGY DOCUMENTATION**: All significant issues should have corresponding Issue Prompt Logs to capture
the instruction-only development process.

**📋 Process Documentation**: See [`docs/ipl/README.md`](docs/ipl/README.md) for complete IPL guidelines and usage instructions.

### Quick Reference

- **When**: For issues that involve significant requirement evolution or learning value
- **Where**: `docs/ipl/###-issue-title.md` matching GitHub issue numbers
- **What**: Prompt evolution, requirement refinements, instruction patterns
- **Why**: Document instruction-only development methodology and effective AI collaboration

### Key Components

1. **Before Implementation**: Initial user request and problem context
2. **During Implementation**: Clarifying questions and requirement refinements
3. **After Implementation**: Final instructions and lessons learned
4. **Related Issues**: Cross-references to GitHub issues and ADRs

### When to Create IPLs

**Create IPLs for:**

- Complex requirements that evolve through discussion
- Issues that demonstrate effective instruction patterns
- Problems that required significant clarification
- Features with educational value for instruction-only development
- Issues labeled with `claude-workflow`

**Optional for:**

- Simple, straightforward requests
- Minor bug fixes with clear requirements
- Routine maintenance tasks

## Parallel Agent Execution Strategy

**🚨 ENHANCEMENT OPPORTUNITY**: For complexity-moderate+ tasks, leverage Claude Code's Task tool to execute work in
parallel for improved efficiency and quality.

### When to Use Parallel Agents

**Automatic Suggestion Required** for:

- **complexity-moderate** or higher issues (unless user explicitly requests sequential)
- Multi-component features requiring implementation + testing + documentation
- Tasks with clear separation of concerns (frontend/backend, feature/testing, etc.)
- Complex refactoring affecting multiple systems

**User Prompting Transformation**:

**Current Sequential Approach:**

```text
User: "implement issue #72"
Claude: Plans → Implements → Tests → Documents (sequential)
```

**Target Parallel Approach:**

```text
User: "implement issue #72"
Claude: "This is complexity-moderate. Should I use parallel agents for faster delivery?"
User: "yes" (or just "implement #72 in parallel")
Claude: [Launches coordinated agents] → [Integrated delivery]
```

### How to Request Parallel Execution

**Explicit Request (Recommended):**

```text
"Implement issue #72 using parallel agents"
"Use parallel execution for #72"
"Implement #72 in parallel"
```

**Automatic Suggestion Response:**

```text
Claude: "This appears to be complexity-moderate. Should I use parallel agents?"
User: "yes" / "proceed in parallel" / "use agents"
```

**Always Sequential (Override):**

```text
"Implement #72 sequentially"
"Do #72 step by step"
"No parallel agents for #72"
```

### Available Agent Types

**Claude Code Built-in Agent Types:**

#### general-purpose

- **Tool Access**: All tools (Read, Write, Edit, Bash, Glob, Grep, etc.)
- **Use Cases**: Feature implementation, testing, documentation, complex multi-step tasks
- **Capabilities**: Complete development workflow from research to deployment

#### statusline-setup

- **Tool Access**: Read, Edit tools only
- **Use Cases**: Claude Code configuration and statusline customization
- **Capabilities**: Limited to reading and editing Claude Code settings

#### output-style-setup

- **Tool Access**: Read, Write, Edit, Glob, Grep tools
- **Use Cases**: Development output style customization and formatting
- **Capabilities**: File operations and search for output configuration

### Specialized Role Patterns

**Using general-purpose agents with focused instructions for role-based specialization:**

#### Code Reviewer Agent

```text
<invoke name="Task">
<parameter name="subagent_type">general-purpose</parameter>
<parameter name="description">Code review and quality analysis</parameter>
<parameter name="prompt">Focus on code quality, security best practices, performance optimization,
and architectural consistency. Review implementation for maintainability and standards compliance.</parameter>
</invoke>
```

#### Full-Stack Developer Agent

```text
<invoke name="Task">
<parameter name="subagent_type">general-purpose</parameter>
<parameter name="description">Feature implementation and architecture</parameter>
<parameter name="prompt">Implement core feature functionality, handle system integration,
state management, and ensure architectural consistency with existing codebase.</parameter>
</invoke>
```

#### Quality Analyst Agent

```text
<invoke name="Task">
<parameter name="subagent_type">general-purpose</parameter>
<parameter name="description">Testing strategy and validation</parameter>
<parameter name="prompt">Develop comprehensive testing approach including unit tests, integration tests,
coverage analysis, and quality validation following TDD methodology.</parameter>
</invoke>
```

### Standard 3-Agent Coordination Patterns

#### Pattern 1: Feature Development (Implementation + Testing + Documentation)

```text
Agent A (Full-Stack Developer):
- Feature code development
- Integration with existing systems
- State management updates

Agent B (Quality Analyst):
- Test-driven development approach
- Unit and integration tests
- Coverage validation

Agent C (Code Reviewer):
- Code quality verification
- README updates
- ADR creation if needed
```

#### Pattern 2: Infrastructure + Feature (Parallel Development)

```text
Agent A (Full-Stack Developer):
- Core feature implementation
- Frontend/backend integration

Agent B (Quality Analyst):
- Testing infrastructure setup
- CI/CD pipeline validation

Agent C (Code Reviewer):
- Architecture review
- Security analysis
```

### Prompting Benefits for Users

**Time Efficiency:**

- 30-40% faster delivery for complex features
- Parallel work streams reduce total time-to-completion
- No waiting for sequential step completion

**Quality Enhancement:**

- Focused agent specialization improves output quality
- Comprehensive testing happens alongside implementation
- Documentation keeps pace with development

**Reduced Cognitive Load:**

- Single instruction triggers coordinated work
- No need to track multiple development phases
- Integrated delivery with consistent standards

### Agent Selection Guidelines

**When to Use Specialized Agents:**

**statusline-setup agent:**

- Claude Code configuration changes
- Statusline customization requests
- Development environment setup

**output-style-setup agent:**

- Output formatting modifications
- Development style configurations
- File organization for output management

**Specialized Role-Based general-purpose agents:**

- Complex features requiring focused expertise
- Quality-critical implementations needing review
- Large-scale changes requiring architectural oversight

### Advanced Prompting Patterns

**Feature + Infrastructure Pattern:**

```text
"Implement #72 with parallel agents: feature development and CI/CD updates"
```

**Research + Implementation Pattern:**

```text
"Research and implement #72 in parallel: analysis agent + implementation agent"
```

**Multi-Component Pattern:**

```text
"Implement #72 with component-focused parallel agents"
```

**Role-Specialized Pattern:**

```text
"Implement #72 using specialized agents: full-stack developer, quality analyst, and code reviewer"
```

### Claude's Mandatory Suggestion Protocol

**For complexity-moderate+ issues, Claude MUST:**

1. **Assess task complexity** and identify parallel opportunities
2. **Suggest parallel agents** unless user explicitly requests sequential:

   ```text
   "This appears to be complexity-moderate. Should I use parallel agents
   for faster delivery with coordinated implementation, testing, and documentation?"
   ```

3. **Execute with Task tool** when approved, launching specialized agents
4. **Coordinate delivery** ensuring integrated, quality output

## Task Planning Protocol

**🚨 CRITICAL REQUIREMENT**: All non-trivial changes must follow a structured task planning process before implementation.

### When Task Planning is Required

**Non-Trivial Changes** (requiring task planning):

- Multi-component modifications affecting 3+ files
- New feature implementations beyond simple additions
- Architecture or design pattern changes
- Breaking changes or API modifications
- Complex state management updates
- Integration with external systems or libraries
- Performance optimizations requiring measurement
- Accessibility improvements across components
- Security implementations or updates
- Database schema or data model changes

**Trivial Changes** (no task planning needed):

- Single file bug fixes
- Simple text or styling updates
- Adding comments or documentation
- Dependency version updates without breaking changes
- Single component styling adjustments
- Basic test additions for existing functionality

### Task Planning Process

#### Step 1: Initial Assessment

- Read and thoroughly understand the requirement
- Identify all affected components, files, and systems
- Assess technical complexity and implementation scope
- Determine if the change qualifies as non-trivial

#### Step 2: Task List Creation

Use TodoWrite to create a comprehensive task breakdown including:

**Required Task Categories:**

- **Analysis & Research**: Understanding current codebase state
- **Implementation**: Core development work broken into logical steps
- **Testing**: Test creation and validation requirements
- **Documentation**: README, ADR, or inline documentation updates
- **Quality Assurance**: Linting, type checking, accessibility validation
- **Integration**: Ensuring changes work with existing functionality
- **Issue Closure**: Verify GitHub issue status and ensure proper completion

**Task List Standards:**

- Each task should be specific and actionable
- Tasks should be granular enough for tracking progress
- Include both `content` (imperative) and `activeForm` (present continuous)
- Estimate complexity using established criteria
- Order tasks logically by dependencies

#### Step 3: User Presentation

Present the task plan to the user with:

```text
## Task Planning for [Feature/Issue Name]

I've analyzed this request and created a comprehensive implementation plan:

### Task Breakdown:
[Present complete TodoWrite task list]

### Implementation Approach:
- **Complexity Assessment**: [Simple/Moderate/Complex/Epic]
- **Estimated Scope**: [Brief scope description]
- **Key Technical Considerations**: [Major technical challenges]
- **Testing Strategy**: [How functionality will be validated]

### Dependencies and Risks:
- [Any dependencies on other work]
- [Potential risks or unknowns]

**This plan follows our established [development methodology] and maintains our [quality standards].**

Ready to proceed with implementation? Please approve or request modifications.
```

#### Step 4: User Approval

- **WAIT** for explicit user approval before proceeding
- Accept modifications or clarifications to the plan
- Only begin implementation after receiving clear confirmation
- Respect user decisions to delay or modify the approach

#### Step 5: Implementation Tracking

- Mark tasks as `in_progress` when beginning work
- Complete tasks incrementally and update TodoWrite immediately
- Maintain exactly ONE task as `in_progress` at any time
- Mark tasks as `completed` only when fully finished
- Add new tasks if unexpected requirements emerge

### Exemptions

**Emergency Situations** (skip planning for immediate fixes):

- Critical production bugs requiring immediate patches
- Security vulnerabilities needing urgent resolution
- User explicitly requests immediate implementation
- Simple fixes that become complex during implementation (create plan mid-work)

### Benefits of Task Planning

**For Users:**

- Clear visibility into implementation scope and approach
- Opportunity to provide feedback before work begins
- Understanding of technical complexity and time investment
- Confidence in systematic, methodical development

**For Development:**

- Reduced implementation errors through upfront analysis
- Better code organization and architecture decisions
- Comprehensive test coverage planning
- Structured progress tracking and completion verification

### Integration with Existing Processes

- **ADR Requirement**: Task plans should identify when ADRs are needed
- **Atomic Commits**: Task breakdown guides logical commit structure
- **Testing Strategy**: Ensures TDD approach is properly planned
- **Priority Assessment**: Task complexity informs priority assignment

## Development Guidelines

### Testing Requirements

- **TDD Approach**: Write tests first, then implementation
- **Test Coverage**: Aim for comprehensive coverage of core functionality
- **Testing Strategy**: Unit tests for logic, integration tests for user workflows

### Code Quality

- **TypeScript**: Use strict typing, avoid `any` types
- **ESLint**: Follow established linting rules (automatically enforced via pre-commit hooks)
- **Prettier**: Maintain consistent code formatting (automatically applied via pre-commit hooks)
- **Markdown linting**: Documentation follows consistent formatting standards
- **Pre-commit hooks**: All code is automatically linted and formatted before commit
- **Comments**: Document complex logic and architectural decisions

### Atomic Commit Guidelines

**🔀 REQUIREMENT**: All code changes must follow atomic commit practices for improved code history, review, and debugging.

**📋 Full Guidelines**: See [ADR-010: Atomic Commit Strategy](docs/adr/010-atomic-commit-strategy.md) for
comprehensive commit strategy and workflow details.

#### Atomic Commit Principles

- **One Logical Change**: Each commit represents a single, focused change
- **Self-Contained**: Every commit maintains a working state
- **Clear Purpose**: Commit message clearly explains the specific change
- **Issue Linking**: Reference related issue number in each commit

#### Conventional Commit Format

Use standardized commit message format:

```text
type(scope): description (#issue-number)

Optional body explaining the change in detail

Optional footer for breaking changes or issue closure
```

**Commit Types:**

- **feat**: New features
- **fix**: Bug fixes
- **test**: Adding or updating tests
- **docs**: Documentation updates
- **refactor**: Code refactoring without behavior changes
- **style**: Code style changes (formatting, missing semicolons)
- **chore**: Maintenance tasks (dependency updates, build changes)

#### Issue Linking Strategy

**Individual Commits:** Reference issue in each commit

```bash
git commit -m "feat(todo): add completedAt field to TodoItem interface (#33)"
git commit -m "test(todo): add timestamp tracking tests (#33)"
git commit -m "docs(todo): update README with completion feature (#33)"
```

**Final Commit:** Close issue with comprehensive summary

```bash
git commit -m "feat: complete todo completion timestamp tracking

Implements full completion timestamp functionality including:
- Data model updates with completedAt field
- State management for timestamp capture
- UI component for displaying completion history
- Comprehensive test coverage

Closes #33"
```

#### TDD Commit Pattern

Follow test-driven development commit sequence:

```bash
git commit -m "test: add failing test for feature X (#issue)"
git commit -m "feat: implement basic feature X functionality (#issue)"
git commit -m "refactor: extract utility functions for feature X (#issue)"
git commit -m "test: add edge cases for feature X (#issue)"
```

#### Development Workflow Integration

1. **Planning**: Break feature into logical atomic changes
2. **Implementation**: Make focused commits throughout development
3. **Testing**: Separate commits for test additions and updates
4. **Documentation**: Document changes in dedicated commits
5. **Integration**: Final commit summarizes and closes issue

#### Code Review Benefits

- **Focused Review**: Each commit addresses single concern
- **Logical Progression**: Reviewers follow development thinking
- **Selective Feedback**: Comments target specific changes
- **Rollback Precision**: Revert specific changes without losing others

#### Quality Assurance

- **Working State**: Each commit maintains compilation and basic functionality
- **Commit Size**: Prefer smaller, focused commits over large changes
- **Message Quality**: Clear, descriptive commit messages
- **Traceability**: Direct link from code changes to requirements

### Legacy Commit Practices

- **Co-author attribution**: Always include Claude Code co-authorship in commits
- **ADR updates**: Include ADR updates in relevant commits when applicable

### Push Workflow

- **🚨 CRITICAL**: Always ask user for confirmation before pushing to remote
- **Local commits**: Continue committing locally without confirmation
- **User control**: Only push when user explicitly approves
- **Verify push success**: Confirm changes are visible on GitHub after user approval
- **Update remote tracking**: Ensure local branch tracks remote properly
- **Feature branching**: All work must be done on feature branches (e.g., feature/XX-description)

### Issue Completion Protocol

**🚨 CRITICAL REQUIREMENT**: All work must include proper issue closure and PR completion before the work session ends.

#### Pre-Completion Checklist

Before declaring any work complete, verify:

- [ ] All implementation requirements are met
- [ ] All tests pass and quality checks succeed
- [ ] Documentation updated as needed
- [ ] Issue status verified using `gh issue view <issue-number>`
- [ ] Associated PRs handled appropriately (merged, closed, or documented)

**📋 Developer Guidelines**: See [`docs/development/workflow.md`](docs/development/workflow.md) for comprehensive
issue and PR completion protocol.

#### Feature Completion Sequence

1. **Complete feature implementation** (write code, tests, documentation)
2. **Run tests and verify functionality** (ensure all tests pass)
3. **Commit changes with issue closure** (local commit with "Closes #X")
4. **🔴 ASK USER**: "Should I automatically merge after CI passes? This will close Issue #X"
   - If **Yes**: Create PR with auto-merge enabled (`gh pr create` + `gh pr merge --auto`)
   - If **No**: Create PR and wait for manual approval (`gh pr create` only)
5. **Create PR** (always required due to branch protection)
6. **Wait for CI completion and user verification** (auto-merge or manual approval)
7. **Verify GitHub issue closure** (after PR merge completion)
8. **Confirm workflow completion** (all requirements satisfied, no orphaned issues)

### Pull Request and Merge Protocol

**🚨 REQUIREMENT**: All changes must go through Pull Requests due to branch protection rules.

#### Auto-merge Option (Streamlined)

- **ALWAYS** ask first: "Should I enable auto-merge for this PR? It will merge automatically after CI passes."
- **Auto-merge workflow**:
  1. Create PR with `gh pr create`
  2. Enable auto-merge with `gh pr merge --auto --squash` (or --merge/--rebase as appropriate)
  3. PR merges automatically when all requirements are satisfied (CI pass + 1 approval)
- **Benefits**: No manual merge step needed, maintains full protection requirements
- **Note**: Repository must have auto-merge enabled in Settings → General → Allow auto-merge

#### Manual Approval Option (User Control)

- **Alternative**: Create PR and wait for user to verify and manually merge
- **Workflow**: User reviews PR, verifies CI passes, then merges when satisfied
- **Benefits**: Full user control over timing and final approval

#### Protocol Requirements

- **NEVER** attempt direct push to main (branch protection prevents this)
- **ALWAYS** create feature branch and PR for all changes
- **WAIT** for user response before proceeding with either option
- **EXPLAIN** the chosen workflow and expected outcome

#### Branch Protection Troubleshooting

**If push to main is rejected:**

- Error: "GH013: Repository rule violations found"
- Solution: Create feature branch and PR as required

**If PR won't merge:**

- Check CI status: All checks must pass
- Check approval: 1 review required (can be self-approved)
- Check branch status: Must be up to date with main

**Auto-merge not working:**

- Verify repository setting: Settings → General → "Allow auto-merge" must be enabled
- Check PR requirements: All protection rules must be satisfied
- Use `gh pr status` to check merge eligibility

### Documentation Maintenance

- **README Updates**: When implementing significant features or architectural changes, update README.md to reflect new
  capabilities and project status
- **Keep Purpose Clear**: Maintain the educational focus and learning objectives in documentation
- **Project Evolution**: Update project description as new features are added
- **Learning Context**: Ensure documentation supports the educational mission of the project

### Screenshot and Image Handling Protocol

**🚨 LIMITATION**: Claude Code cannot directly upload images to GitHub issues.

#### When User Provides Screenshots

**For GitHub issue documentation:**

1. **Acknowledge receipt**: Confirm you can see and analyze the image
2. **Create placeholder**: Use `![Description](placeholder-url)` in issue content
3. **Add user reminder**: Always include manual upload instruction:

```markdown
**📸 MANUAL ACTION REQUIRED**:
Please add the screenshot to GitHub issue #[number] by opening it in browser and drag-dropping the image into a comment. GitHub will auto-upload and generate the proper URL.
```

1. **Document context**: Describe what the screenshot shows and its relevance

#### Best Practices

- **Descriptive alt text**: `![Button whitespace issue after typography changes](placeholder)`
- **Explain context**: Always describe what the image demonstrates
- **Link to code**: Reference specific files/lines shown in screenshots
- **Update placeholders**: Remind user to replace placeholder URLs

### Documentation Consistency Requirements

**🚨 CRITICAL REQUIREMENT**: All major changes must maintain consistency across CLAUDE.md, README.md, and ADRs
to preserve project knowledge and ensure accurate guidance.

**📋 Full Guidelines**: See [`docs/guidelines/documentation-standards.md`](docs/guidelines/documentation-standards.md)
for comprehensive documentation consistency requirements and workflows.

#### When Documentation Updates Are Required

**Major Changes Requiring Multi-Document Updates:**

- **Architectural Decisions**: Technology choices, design patterns, system structure changes
- **Development Practices**: Workflow changes, testing approaches, code review processes
- **Project Structure**: Directory organization, build process changes, configuration modifications
- **Quality Standards**: Linting rule changes, testing strategy modifications, code standards updates
- **Contributor Guidelines**: Onboarding process changes, collaboration tool adoption

**Documentation Update Workflow:**

1. **Impact Assessment**: Identify which documentation files are affected by the change
2. **ADR Creation**: Document decision rationale and alternatives considered (if applicable)
3. **CLAUDE.md Updates**: Update development guidelines, workflows, and standards
4. **README.md Updates**: Update project overview, setup instructions, contributor guidelines
5. **Cross-Reference Maintenance**: Ensure links between documents remain current and accurate
6. **Consistency Verification**: Review all updated documentation for consistency and accuracy

#### Documentation Update Checklist

For major changes, include this checklist in implementation issues:

```markdown
## Documentation Updates Required

- [ ] Create/update relevant ADR with decision rationale
- [ ] Update CLAUDE.md development guidelines
- [ ] Update README.md project information
- [ ] Ensure cross-references between documents are current
- [ ] Verify documentation consistency across all files
```

#### Integration with Development Workflow

**Task Planning Integration:**

- Include documentation scope in complexity assessment
- Add documentation tasks to TodoWrite task breakdowns
- Plan documentation updates as part of implementation workflow

**Quality Assurance:**

- Review documentation updates as part of code review process
- Test updated instructions and verify accuracy
- Ensure documentation changes support learning objectives

**Commit Strategy:**

- Include documentation updates with related code changes
- Reference documentation updates in commit messages
- Link documentation changes to relevant GitHub issues

### Priority System Integration

**🏷️ REQUIREMENT**: All GitHub issues must be assigned appropriate priority labels for effective project management.

**📋 Full Guidelines**: See [`docs/guidelines/priority-system.md`](docs/guidelines/priority-system.md) for
comprehensive priority assessment criteria and workflows.

#### Quick Reference

- **priority-1-critical** 🔴: Blocking issues, immediate attention required
- **priority-2-high** 🟠: Important features, current sprint priority
- **priority-3-medium** 🟡: Standard features, next sprint scheduling
- **priority-4-low** 🟢: Nice-to-have features, backlog items

### Complexity-Based Effort Estimation

**🎯 REQUIREMENT**: All GitHub issues must be assigned complexity labels to enable accurate effort estimation in
Claude Code development.

**📋 Full Guidelines**: See [`docs/guidelines/complexity-estimation.md`](docs/guidelines/complexity-estimation.md)
for detailed complexity assessment criteria and development workflows.

#### Quick Reference

- **complexity-minimal** 🟢: Single file changes, quick fixes
- **complexity-simple** 🔵: Basic features, straightforward logic
- **complexity-moderate** 🟡: Multi-component changes, state management
- **complexity-complex** 🟠: Architecture changes, system design
- **complexity-epic** 🔴: Major overhauls, breaking changes

#### Combined Usage

Always assign both priority and complexity labels to enable effective planning:

- **High Priority + Low Complexity**: Quick wins and urgent fixes
- **High Priority + High Complexity**: Major features requiring immediate attention
- **Low Priority + Low Complexity**: Good filler work and maintenance tasks
- **Low Priority + High Complexity**: Learning opportunities and future preparation

### Issue Creation Checklist

**🚨 MANDATORY**: All issues must include these labels before creation:

- [ ] **Priority label** (priority-1-critical through priority-4-low)
- [ ] **Complexity label** (complexity-minimal through complexity-epic)
- [ ] **Category label** (see Category Label Guidelines below)
- [ ] **Assessment rationale** documented in issue description

### Category Label Guidelines

**Every issue must have exactly ONE category label:**

- **`category-feature`** 🟦 - Core application functionality and user features
  - Todo CRUD operations
  - UI/UX improvements
  - User-facing enhancements
  - Feature bugs and fixes

- **`category-infrastructure`** 🟧 - DevOps, CI/CD, deployment, architecture
  - GitHub Actions and workflows
  - Deployment configurations (Vercel, Docker)
  - Testing infrastructure
  - Security and performance tooling
  - Backend architecture planning

- **`category-documentation`** 🟩 - Documentation, diagrams, process docs
  - README and documentation files
  - Architecture Decision Records (ADRs)
  - Mermaid diagrams
  - Process documentation
  - Accessibility guidelines

- **`category-dx`** 🟪 - Developer experience, tooling, AI workflow improvements
  - Claude Code workflows and instructions
  - Development tooling and automation
  - Issue/PR management processes
  - Code quality and standards
  - All `claude-workflow` labeled issues

#### Claude Code Instructions

- **Always include** `--label "priority-X-name,complexity-Y-name,category-Z"` in `gh issue create` commands
- **Provide label selection reasoning** in issue description (priority, complexity, and category)
- **Verify all three label types** are present before submitting
- **Flag any unlabeled or partially labeled issues** for immediate correction

#### Claude-Workflow Label Usage

**Use `claude-workflow` label for issues related to:**

- Claude Code usage and instructions
- AI collaboration patterns and workflows
- CLAUDE.md documentation and requirements
- Task planning protocols and methodologies
- Issue creation and labeling processes
- Documentation consistency across AI-assisted development
- Claude Code agent implementations and configurations

**Do NOT use for:**

- General development workflow (git, CI/CD, testing)
- Feature implementations or bug fixes
- UI/UX improvements
- Infrastructure or deployment changes

## Project Structure

```text
instructions-only-claude-coding/
├── app/                    # Next.js app directory
│   ├── components/         # React components
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript type definitions
│   └── __tests__/         # Component tests
├── docs/                  # Project documentation
│   ├── adr/              # Architecture Decision Records
│   └── ipl/              # Issue Prompt Logs
├── public/               # Static assets
├── CLAUDE.md            # This file - Claude Code instructions
├── README.md            # Project documentation
└── package.json         # Dependencies and scripts
```

## Current Architecture Decisions

Refer to existing ADRs in `docs/adr/` for current architectural decisions:

1. **Next.js 14 + App Router** - Web framework choice
2. **TypeScript** - Type safety and developer experience
3. **Tailwind CSS** - Styling approach
4. **Test-Driven Development** - Development methodology
5. **localStorage** - Data persistence strategy
6. **React Testing Library + Jest** - Testing framework
7. **Custom React Hooks** - State management approach
8. **GitHub Issues** - Project management workflow

---

**Remember**: When in doubt about architectural decisions, create an ADR to document the thought
process and decision rationale. This maintains project knowledge and helps future development.
