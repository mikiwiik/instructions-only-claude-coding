# Project Management and Issue Tracking

This document outlines the project management practices, issue tracking workflow, and planning methodologies
used in the Todo App project.

## Overview: Human and Agent Collaboration

**Primary Users**: The GitHub Projects views and boards are designed primarily for **human project management** -
providing visual workflow management, prioritization, and planning capabilities.

**Agent Role**: Claude Code agents (like `mikiwiik-agent`) interact with the project by:

- **Reading** issue states, labels, and metadata to understand work priorities
- **Updating** project fields (Status, Lifecycle) as work progresses
- **Creating/Closing** issues and updating linked project items automatically
- **Following** the workflow defined here while working on implementation tasks

**Key Distinction**: Humans use the visual boards for planning and oversight; agents use the CLI and API to read
priorities and update state as they execute the work defined in issues.

### Role-Based Access Model

The project uses GitHub Projects' built-in roles to enforce the separation between planning and execution:

| User Type | Role  | Responsibilities                                                             |
| --------- | ----- | ---------------------------------------------------------------------------- |
| **Human** | Admin | Project ownership, view configuration, access management, strategic planning |
| **Agent** | Write | Read priorities, update item states, execute work, no access control changes |

**Why This Matters**:

- **Least Privilege**: Agents get exactly the permissions needed for execution, nothing more
- **Clear Boundaries**: Humans manage structure/access, agents execute defined work
- **Auditability**: Role assignments make it clear who can do what
- **Security**: Agents cannot accidentally modify project access or structure

See [GitHub Projects Setup Guide](github-projects-setup.md#role-based-access-control) for detailed role documentation
and setup instructions.

## Kanban-Style Continuous Delivery Workflow

The Todo App follows a **kanban-style workflow** with continuous, on-demand releases. There are no formal sprints or
scheduled releases—work flows continuously from backlog to production.

### Core Workflow Principles

- **Continuous Flow**: Issues move through Todo → In Progress → Done
- **Work-in-Progress Limits**: Typically 1-2 issues actively being worked on at any time
- **On-Demand Releases**: Features are pushed to production immediately upon completion
- **Priority-Driven**: Next work is selected based on priority labels and complexity assessment
- **Just-in-Time Planning**: Issue selection and planning happens as current work completes
- **Automated Status Tracking**: GitHub Projects Status/Lifecycle fields automatically updated via `/work-on` command

### Work-in-Progress (WIP) Management

**Typical WIP**: 1-2 issues at a time

**Benefits of Limited WIP**:

- **Focused effort**: Deep work on current tasks without context switching
- **Faster completion**: Issues move to Done faster with concentrated attention
- **Reduced complexity**: Simpler coordination and fewer merge conflicts
- **Clear priorities**: What's being worked on is always visible and intentional

**Exception scenarios**:

- Blocked issue: Start next priority while waiting for unblock
- Multi-agent work: Parallel implementation by specialized agents (frontend + testing)
- Quick fixes: Critical bugs may interrupt current work

### Issue Selection Process

**When current work completes**:

1. **Review completed work**: Ensure PR is merged and deployed
2. **Evaluate priorities**: Use `/select-next-issue` command or manual review
3. **Select next issue**: Choose based on:
   - Priority level (critical → high → medium → low)
   - Complexity (prefer quick wins: high priority + simple/minimal complexity)
   - Dependencies (blocking issues take precedence)
   - Context switching costs (related work may be more efficient)
4. **Start implementation**: Use `/work-on <issue-number>` which automatically:
   - Sets GitHub Projects Status to "In Progress"
   - Sets Lifecycle to "Active"
   - Begins workflow (issue analysis, task planning, branch setup)

### Release Strategy

**Continuous Deployment**:

- **No release schedule**: Features deploy when ready
- **Immediate value**: Users get improvements as soon as they're completed
- **Small batches**: Individual features deployed independently
- **Rapid feedback**: Quick iteration based on real usage
- **Rollback ready**: Small changes are easier to revert if needed

**Deployment triggers**:

- PR merged to main branch
- All CI/CD checks passing
- Automated deployment to production (Vercel)

### Backlog Management

- **Priority Ordering**: Issues ordered by priority label (critical at top)
- **Complexity Assessment**: All issues labeled with complexity for informed selection
- **Continuous Grooming**: Priorities and complexity updated as understanding evolves
- **Dependency Tracking**: Blocking issues identified and prioritized appropriately
- **Quick Wins**: High-priority + simple-complexity issues highlighted for momentum

### Planning and Coordination

**No formal sprint planning**, but regular activities include:

- **Daily prioritization**: Quick review of what to work on next
- **Backlog grooming**: Update issue priorities and complexity as needed
- **Dependency management**: Identify and sequence blocking issues
- **Capacity awareness**: Consider complexity when selecting next work
- **Retrospective improvements**: Continuous process optimization based on experience

## Project Management Overview

The Todo App uses GitHub Issues for feature tracking and follows a structured development approach designed
to demonstrate professional project management practices while supporting the educational objectives of Claude
Code collaboration.

### Core Principles

- **Issue-Driven Development**: All features begin with detailed GitHub issues
- **Architectural Documentation**: Major decisions documented as ADRs in `docs/adr/`
- **Test-Driven Development**: TDD methodology for all feature implementation
- **Quality Assurance**: Pre-commit hooks ensure code quality with automatic linting and formatting
- **AI-Assisted Development**: Claude Code assistance integrated throughout development workflow

## Priority and Complexity System

**📋 Full Documentation**: See [`docs/reference/labels-and-priorities.md`](../reference/labels-and-priorities.md) for
comprehensive details on:

- **Priority Labels**: priority-1-critical through priority-4-low
- **Complexity Labels**: complexity-minimal through complexity-epic
- **Category Labels**: category-feature, category-infrastructure, category-documentation, category-dx
- **Assessment Guidelines**: Detailed criteria for assigning each label
- **Planning Matrix**: Strategic combinations (quick wins, major features, learning opportunities)

### Quick Reference

**Priority Labels** 🔴🟠🟡🟢:

- **Critical**: Blocking issues, security, broken core functionality
- **High**: Important features, significant improvements, major bugs
- **Medium**: Standard features, minor improvements, non-critical bugs
- **Low**: Nice-to-have features, documentation, minor enhancements

**Complexity Labels** 🟢🔵🟡🟠🔴:

- **Minimal**: Single file changes (15-30 minutes)
- **Simple**: Basic features, straightforward logic (1-3 hours)
- **Moderate**: Multi-component changes, state management (3-8 hours)
- **Complex**: Architecture changes, system design (1-3 days)
- **Epic**: Major overhauls, breaking changes (1+ weeks)

**Category Labels**:

- **Feature**: Core application functionality and user features
- **Infrastructure**: DevOps, CI/CD, testing infrastructure
- **Documentation**: ADRs, guides, technical writing
- **DX**: Developer experience, Claude Code workflows, tooling

### Strategic Issue Selection

**Quick Wins** (High Priority + Low Complexity):

- Immediate implementation for maximum impact
- Perfect for filling small time gaps
- Build momentum with visible progress

**Major Features** (High Priority + High Complexity):

- Requires detailed planning and architecture consideration
- May need breaking into smaller issues
- Allocate dedicated focused time

## Claude-Workflow Label Integration

**📋 Full Guidelines**: See [`docs/guidelines/claude-workflow-labels.md`](../guidelines/claude-workflow-labels.md)
for comprehensive usage and integration guidelines.

### When to Use claude-workflow Label

**✅ Use for AI-related issues:**

- Claude Code usage and instruction improvements
- AI collaboration patterns and methodologies
- CLAUDE.md documentation and requirements
- Task planning protocols for agentic coding
- Issue creation and labeling processes for AI development

**❌ Standard development issues:**

- General git/CI/CD workflow (use standard labels)
- Feature implementations (focus on functionality)
- UI/UX improvements (unless AI interaction specific)

## Issue Management Workflow

### Issue Creation Requirements

**🚨 MANDATORY**: All issues must include:

- [ ] **Priority label** (priority-1-critical through priority-4-low)
- [ ] **Complexity label** (complexity-minimal through complexity-epic)
- [ ] **Category label** (exactly one category)
- [ ] **Assessment rationale** in issue description

### Issue Description Requirements

- **Clear Problem Statement**: What needs to be solved or implemented?
- **Acceptance Criteria**: Specific, testable requirements
- **Technical Considerations**: Architecture impact, dependencies, constraints
- **Documentation Requirements**: What documentation needs updating?
- **Testing Strategy**: How will the implementation be validated?

### Issue Lifecycle

1. **Open**: Issue created and labeled
2. **Triaged**: Priority and complexity assessed (Lifecycle: Icebox → Backlog)
3. **Start Work**: `/work-on` command automatically sets Status="In Progress", Lifecycle="Active"
4. **Implementation**: Work progresses (Status remains "In Progress" until PR merged)
5. **Review**: Code review and PR approval
6. **Closed**: PR merged, Status/Lifecycle automatically set to "Done"

**Note**: GitHub Projects Status and Lifecycle fields are automatically updated at workflow start (via `/work-on`)
and completion (via PR merge). No manual status updates needed - workflow is fully automated.

### Issue Linking and Tracking

- **Commit Linking**: All commits reference related issue numbers
- **Automatic Closure**: Use closing keywords (Closes, Fixes, Resolves)
- **Cross-References**: Link related issues and pull requests
- **Progress Updates**: Regular status updates on complex issues

## Quality Assurance Integration

### Definition of Done

**🚨 Task Completion**: Task is complete when PR is created and ready for review, NOT when merged.

- [ ] All acceptance criteria met
- [ ] Code follows project standards and conventions
- [ ] **♿ Accessibility requirements met** ([docs/guidelines/accessibility-requirements.md](../guidelines/accessibility-requirements.md)):
  - [ ] WCAG 2.2 AA compliance verified
  - [ ] Minimum 44px × 44px touch targets for interactive elements
  - [ ] Proper ARIA labels and semantic HTML
  - [ ] Keyboard navigation fully functional
  - [ ] Screen reader compatibility tested
  - [ ] Focus management implemented correctly
  - [ ] Color contrast meets minimum ratios (4.5:1 text, 3:1 UI components)
  - [ ] Zero eslint-plugin-jsx-a11y violations
- [ ] **🔄 Real-Time Synchronization requirements (when applicable)**:
  - [ ] SSE connection properly managed (connection, reconnection, cleanup)
  - [ ] Optimistic updates implemented with rollback capability
  - [ ] Conflict resolution working as expected (last-write-wins)
  - [ ] Multi-tab synchronization verified
  - [ ] Offline behavior tested (queue and sync on reconnection)
  - [ ] Connection resilience tested (auto-reconnect with backoff)
  - [ ] Error handling comprehensive (network failures, conflicts)
  - [ ] Sync status indicators in UI (connection state, pending operations)
- [ ] Comprehensive test coverage provided (including accessibility and sync tests)
- [ ] Documentation updated appropriately
- [ ] **🚨 PR created with automerge enabled and reported to user**
- [ ] **🚨 Agent has stopped and is waiting for human approval**
- [ ] Code review completed and approved (including accessibility review)
- [ ] CI/CD pipeline passes all checks

### Review Process

- **Code Review**: Technical review of implementation
- **Testing Review**: Validation of test coverage and quality
- **Documentation Review**: Ensure all documentation is current
- **Architecture Review**: Assess impact on overall system design

## Metrics and Continuous Improvement

### Tracking Metrics

- **Issue Velocity**: Rate of issue completion by complexity
- **Priority Distribution**: Balance of work across priority levels
- **Complexity Accuracy**: How well complexity estimates match reality
- **Cycle Time**: Time from issue creation to closure

### Process Improvement

- **Regular Reviews**: Evaluate planning and estimation accuracy
- **Process Adaptation**: Adjust workflows based on experience
- **Tool Evaluation**: Assess effectiveness of management tools
- **Team Feedback**: Gather input on process effectiveness

## GitHub Projects Integration

### Overview

The project uses **GitHub Projects** to enhance the label-based issue management system with visual workflow
management, quick wins identification, and idea capture capabilities. Projects complements the existing
priority/complexity label system while maintaining labels as the primary source of truth.

**📋 Decision Documentation**: See [ADR-024: GitHub Projects Adoption](../adr/024-github-projects-adoption.md) for
full rationale and trade-offs.

**🔧 Setup Guide**: See [GitHub Projects Setup Guide](github-projects-setup.md) for detailed configuration instructions.

### Custom Fields

GitHub Projects uses custom fields for workflow tracking:

| Field         | Type          | Values                        | Source                      |
| ------------- | ------------- | ----------------------------- | --------------------------- |
| **Status**    | Single Select | Todo, In Progress, Done       | Automated workflow tracking |
| **Lifecycle** | Single Select | Icebox, Backlog, Active, Done | Idea maturity stage         |

**Priority, Complexity, and Category** are managed via issue labels and displayed using GitHub Projects' built-in
**Labels** field. This maintains labels as the single source of truth and eliminates data duplication. See
[ADR-020](../adr/024-github-projects-adoption.md#update-labels-only-architecture-2025-10-19) for rationale.

#### Why Only These Two Custom Fields?

**Status and Lifecycle are the ONLY custom fields** because they track **workflow state**, which:

- Changes as work progresses (time-bound, not static)
- Is project-specific (not an intrinsic property of the issue)
- Cannot be represented by labels (labels describe what the issue IS, not where it IS in workflow)

**Status** tracks current work state (Todo → In Progress → Review → Done)
**Lifecycle** tracks idea maturity (Icebox → Backlog → Active → Done)

**Priority, Complexity, and Category do NOT need custom fields** because they:

- Are intrinsic properties of the issue (what it IS: important, complex, a feature)
- Already exist as issue labels (priority-2-high, complexity-moderate, category-feature)
- Are displayed automatically via built-in Labels field (no duplication needed)
- Are atomic data that belongs to issues, not projects (work everywhere in GitHub)

**Result**: Zero data duplication, zero synchronization burden, universal label compatibility.

### Labels vs Custom Fields Architecture

**Understanding the distinction between labels and custom fields is essential for effective workflow management.**

**Labels (Atomic, Issue-Specific, Not Time-Bound)**:

Labels describe **what the issue is** - intrinsic properties that belong to the issue itself:

- Priority, Complexity, Category
- Atomic data that belongs to issues, not projects
- Universal compatibility (CLI, GitHub Actions, all projects, issue views)
- Not time-bound - don't change based on workflow progression
- Single source of truth, auto-visible in Projects via Labels field

**Custom Fields (Workflow State, Time-Bound)**:

Custom fields describe **where the issue is** in the development workflow - transient state that changes over time:

- Status (Todo → In Progress → Done): Current work state
- Lifecycle (Icebox → Backlog → Active → Done): Idea maturity stage
- Project-specific, not issue properties
- Change as work progresses through workflow
- Time-bound - reflect current state, not intrinsic properties
- Manual updates during workflow progression

**Why This Matters**:

- **No duplication**: Labels aren't duplicated as custom fields
- **No sync burden**: Labels automatically visible, no manual synchronization
- **Universal compatibility**: Labels work everywhere in GitHub ecosystem
- **Clear separation**: Static properties (labels) vs dynamic state (custom fields)
- **Instruction-only alignment**: No manual sync steps required

See [GitHub Projects Setup Guide](github-projects-setup.md#labels-vs-custom-fields-core-principles) for detailed explanation.

### Project Views

Five specialized views provide different perspectives on the work:

#### 1. Board View (Primary Workflow)

**Purpose**: Daily kanban workflow visualization

**Configuration**:

- Layout: Board (kanban)
- Columns: Status field (Todo → In Progress → Done)
- Grouping: Status
- Filter: `label:priority-1-critical,priority-2-high Lifecycle:Active,Backlog`

**Use Case**: See what's being worked on, move issues through workflow stages

**Note**: Filter shows only high-priority and critical issues. Adjust label filter to match your workflow needs.

#### 2. Backlog View (Issue Selection)

**Purpose**: Select next issue to work on

**Configuration**:

- Layout: Table
- Columns: Title, Labels, Status, Lifecycle, Assignees
- Filter: `Lifecycle:Active,Backlog`

**Use Case**: Review backlog issues with all labels visible. Use `/select-next-issue` command for priority-based
selection.

**Note**: Labels column shows priority-_, complexity-_, and category-\* labels for each issue. GitHub Projects cannot
sort by labels.

#### 3. Quick Wins View (Momentum)

**Purpose**: Identify high-impact, low-effort tasks

**Configuration**:

- Layout: Board
- Columns: Status
- Filter: `label:priority-2-high label:complexity-simple,complexity-minimal Lifecycle:Active`

**Use Case**: Find quick wins to build momentum between larger features

#### 4. Agent Workload View (Coordination)

**Purpose**: Visualize multi-agent work distribution

**Configuration**:

- Layout: Board
- Columns: Status
- Grouping: Agent field (Frontend, Testing, QA, Documentation)
- Filter: `Lifecycle:Active`

**Use Case**: See which specialized agents are working on what, identify coordination opportunities

#### 5. Icebox View (Idea Capture)

**Purpose**: Low-friction storage for raw ideas

**Configuration**:

- Layout: Table or Board
- Filter: `Lifecycle:Icebox`

**Use Case**: Capture ideas without full requirements, periodic triage to promote to Backlog

### Lifecycle Workflow

The **Lifecycle** field tracks idea maturity from conception to completion:

```text
Icebox → Backlog → Active → Done
```

**Icebox** 🧊:

- **Purpose**: Capture raw ideas with minimal friction
- **Requirements**: Title + brief description (optional labels)
- **Triage**: Periodic review to promote promising ideas to Backlog
- **Example**: "Explore dark mode implementation"

**Backlog** 📋:

- **Purpose**: Well-defined issues ready for prioritization
- **Requirements**: Full description + priority + complexity + category labels
- **Selection**: Reviewed when selecting next work
- **Example**: "Implement dark mode toggle with system preference detection"

**Active** ⚡:

- **Purpose**: Current work (1-2 issues) or next up (high priority)
- **WIP Limit**: Typically 1-2 issues maximum
- **Visibility**: Appears in Board, Backlog, Quick Wins, and Agent Workload views
- **Example**: Currently implementing dark mode toggle

**Done** ✅:

- **Purpose**: Completed and deployed
- **Automation**: Auto-set when PR merged and issue closed
- **Archival**: Automatically archived after completion

### Automation

**Auto-Add Issues**:

- All new issues automatically added to project
- Ensures no issues are missed
- Default Lifecycle: `Backlog` (or `Icebox` if no priority label)

**Status Automation**:

- PR merged → Status: `Done`
- Issue closed → Status: `Done`, Lifecycle: `Done`
- Reduces manual field updates

**Auto-Archive**:

- Issues with `Lifecycle:Done` automatically archived after 30 days
- Keeps active views focused on current work

### Integration with Labels

**Labels are the primary source of truth**:

- Priority labels (priority-1-critical through priority-4-low)
- Complexity labels (complexity-minimal through complexity-epic)
- Category labels (category-feature, category-infrastructure, etc.)

**Projects displays labels natively**:

- Built-in Labels field shows all issue labels
- Filters use `label:` syntax (e.g., `label:priority-2-high`)
- No custom fields needed for Priority/Complexity/Category
- Zero duplication, zero sync burden

**Workflow-specific custom fields**:

- Status: Workflow state (Todo → In Progress → Done)
- Lifecycle: Idea maturity (Icebox → Backlog → Active → Done)

**Workflow**:

1. Create issue with labels (via `gh issue create` or web UI)
2. Issue auto-added to project with labels automatically visible
3. Manually set Lifecycle (Icebox/Backlog/Active) based on readiness
4. Use Board view to move through Status stages
5. PR merge auto-updates Status and Lifecycle to Done

### CLI Integration

GitHub CLI supports project management via `gh project` commands:

```bash
# List projects
gh project list --owner @me

# View project items
gh project item-list PROJECT_NUMBER

# Add issue to project (usually automated)
gh project item-add PROJECT_NUMBER --owner OWNER --url ISSUE_URL

# Update field value
gh project item-edit --project-id PROJECT_ID --field-id FIELD_ID --value "In Progress"
```

**Note**: Most operations are done via web UI for better UX. CLI is available for automation and bulk operations.

### Best Practices

**Daily Workflow**:

1. Start day by checking Board view for In Progress items
2. Use `/work-on <issue-number>` to start new work (auto-updates Status/Lifecycle)
3. Status updates are fully automated - no manual updates needed
4. When work completes and PR merges, Status/Lifecycle automatically set to "Done"
5. Use Backlog view or `/select-next-issue` to choose next work
6. Check Quick Wins view for momentum opportunities

**Weekly Activities**:

1. Review Icebox view to triage new ideas
2. Promote ready ideas to Backlog with proper labels
3. Update priorities in Backlog based on changing needs
4. Archive or close stale Icebox items

**Issue Creation**:

- Well-defined issues → Create with labels → Auto-adds to Backlog
- Raw ideas → Create without labels → Manually set Lifecycle:Icebox
- Urgent work → Create with priority-1-critical → Manually set Lifecycle:Active

## Documentation and Knowledge Management

### Project Knowledge

- **ADR Integration**: Link major decisions to project management
- **Issue Documentation**: Comprehensive issue descriptions and updates
- **Process Documentation**: Keep management processes current
- **Learning Capture**: Document lessons learned and best practices

### Communication

- **Status Updates**: Regular progress communication
- **Stakeholder Updates**: Keep stakeholders informed of progress
- **Decision Communication**: Ensure all stakeholders understand decisions
- **Knowledge Sharing**: Share learnings and best practices

---

This project management approach ensures effective resource allocation, clear communication of urgency, and
structured project planning while supporting the educational mission of the Todo App project.
