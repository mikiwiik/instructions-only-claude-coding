# Claude Code Instructions

This file contains specific instructions for Claude Code when working on this agentic coding prototype project.

## Agentic Coding Methodology

**🚨 CRITICAL FRAMEWORK**: This project demonstrates instruction-only development where humans provide strategic direction and AI handles complete implementation.

### Role Definition and Boundaries

**Human Role: Strategic Architect & Product Owner**
- Provides high-level requirements and feature specifications
- Sets architectural direction and technical constraints
- Makes product decisions and priority determinations
- Gives feedback on implementation and user experience
- **Does NOT write code** - maintains pure instruction-based approach

**AI Role: Complete Implementation Team**
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
- **Current branching**: All work is currently done directly on main branch

### Feature Completion Sequence

1. **Complete feature implementation** (write code, tests, documentation)
2. **Run tests and verify functionality** (ensure all tests pass)
3. **Commit changes with issue closure** (local commit with "Closes #X")
4. **🔴 ASK USER**: "Ready to push changes to remote? (y/n)"
5. **Push to remote repository** (only if user confirms)
6. **Verify GitHub issue was automatically closed** (after successful push)

### Push Confirmation Protocol

- **ALWAYS** ask before pushing: "Ready to push [feature name] to remote? This will close Issue #X"
- **NEVER** push without explicit user approval
- **WAIT** for user response before proceeding
- **RESPECT** user's decision if they decline to push
- **EXPLAIN** what will happen when pushing (issue closure, public visibility)

### Documentation Maintenance

- **README Updates**: When implementing significant features or architectural changes, update README.md to reflect new
  capabilities and project status
- **Keep Purpose Clear**: Maintain the educational focus and learning objectives in documentation
- **Project Evolution**: Update project description as new features are added
- **Learning Context**: Ensure documentation supports the educational mission of the project

### Documentation Consistency Requirements

**🚨 CRITICAL REQUIREMENT**: All major changes must maintain consistency across CLAUDE.md, README.md, and ADRs to preserve project knowledge and ensure accurate guidance.

**📋 Full Guidelines**: See [`docs/guidelines/documentation-standards.md`](docs/guidelines/documentation-standards.md) for comprehensive documentation consistency requirements and workflows.

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

## Project Structure

```text
my-first-claude-code/
├── app/                    # Next.js app directory
│   ├── components/         # React components
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript type definitions
│   └── __tests__/         # Component tests
├── docs/                  # Project documentation
│   └── adr/              # Architecture Decision Records
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
