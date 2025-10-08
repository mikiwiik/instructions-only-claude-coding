# Project Management and Issue Tracking

This document outlines the project management practices, issue tracking workflow, and planning methodologies
used in the Todo App project.

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

## Priority System

The project uses a standardized priority labeling system for effective issue management and resource allocation.

### Priority Labels

- **priority-1-critical** 🔴: Blocking issues, security vulnerabilities, broken core functionality
- **priority-2-high** 🟠: Important features, significant improvements, major bugs
- **priority-3-medium** 🟡: Standard features, minor improvements, non-critical bugs
- **priority-4-low** 🟢: Nice-to-have features, documentation updates, minor enhancements

### Priority-Based Development Workflow

Development efforts are prioritized based on issue labels:

1. **Critical Priority** 🔴: Immediate attention, stop other work
   - Security vulnerabilities requiring immediate patches
   - Blocking bugs that prevent core functionality
   - Infrastructure issues affecting development workflow

2. **High Priority** 🟠: Primary development focus for current sprint
   - Major features that significantly enhance user experience
   - Important architectural improvements
   - Critical bug fixes for released features

3. **Medium Priority** 🟡: Standard workflow, next sprint scheduling
   - Standard feature development
   - Performance improvements
   - Non-critical bug fixes and enhancements

4. **Low Priority** 🟢: Backlog items, learning opportunities
   - Nice-to-have features for future consideration
   - Documentation improvements and updates
   - Learning experiments and exploration tasks

### Priority Assessment Criteria

When assigning priority labels, consider:

- **User Impact**: How many users are affected by this issue?
- **Business Value**: What value does this provide to the project goals?
- **Technical Risk**: What are the risks of not addressing this issue?
- **Dependencies**: Does this block other work or features?
- **Effort vs. Value**: What is the return on investment for this work?

## Complexity-Based Effort Estimation

The project uses complexity labels to enable accurate effort estimation in Claude Code development, replacing
traditional time-based estimates with cognitive load assessment.

### Complexity Labels

- **complexity-minimal** 🟢: Single file changes, quick fixes, documentation updates
- **complexity-simple** 🔵: Basic features, straightforward logic, standard patterns
- **complexity-moderate** 🟡: Multi-component changes, state management, integration work
- **complexity-complex** 🟠: Architecture changes, system design, comprehensive testing
- **complexity-epic** 🔴: Major overhauls, breaking changes, foundational work

### Complexity Assessment Guidelines

#### Minimal Complexity 🟢

- **Scope**: Single file modifications
- **Examples**: Documentation updates, simple bug fixes, configuration changes
- **Typical Tasks**: Text changes, comment additions, single line fixes
- **Considerations**: No architectural impact, minimal testing required

#### Simple Complexity 🔵

- **Scope**: Basic feature additions with straightforward logic
- **Examples**: New UI components, simple data transformations, basic validations
- **Typical Tasks**: Single component features, standard patterns
- **Considerations**: Well-understood requirements, minimal dependencies

#### Moderate Complexity 🟡

- **Scope**: Multi-component changes requiring coordination
- **Examples**: State management updates, feature integration, cross-component functionality
- **Typical Tasks**: Complex UI interactions, data flow modifications
- **Considerations**: Multiple file changes, integration testing required

#### Complex Complexity 🟠

- **Scope**: Architectural changes affecting system design
- **Examples**: New technology adoption, major refactoring, performance optimization
- **Typical Tasks**: Framework changes, design pattern implementation
- **Considerations**: Significant testing, documentation, and review requirements

#### Epic Complexity 🔴

- **Scope**: Major overhauls requiring fundamental changes
- **Examples**: Complete rewrites, breaking changes, foundational infrastructure
- **Typical Tasks**: System-wide changes, major version updates
- **Considerations**: Extensive planning, phased implementation, comprehensive testing

## Combined Planning Approach

Issues are labeled with both priority and complexity for optimal development planning and resource allocation.

### Planning Matrix

- **High Priority + Low Complexity** 🟠🟢: Quick wins and urgent fixes
  - Immediate implementation for maximum impact
  - Perfect for filling small time gaps
  - Build momentum with visible progress

- **High Priority + High Complexity** 🟠🔴: Major features requiring careful planning
  - Requires detailed planning and architecture consideration
  - May need breaking into smaller issues
  - Allocate dedicated focused time

- **Low Priority + Low Complexity** 🟢🟢: Good filler work and maintenance tasks
  - Excellent for learning and experimentation
  - Can be completed when waiting for other work
  - Good for new contributors or skill development

- **Low Priority + High Complexity** 🟢🔴: Learning opportunities and future preparation
  - Research and exploration tasks
  - Technology evaluation and prototyping
  - Long-term strategic improvements

## Claude-Workflow Label Integration

### AI Collaboration Issue Management

The project includes specialized tracking for AI collaboration and Claude Code workflow improvements through
the `claude-workflow` label.

**📋 Full Guidelines**: See [`docs/guidelines/claude-workflow-labels.md`](../guidelines/claude-workflow-labels.md)
for comprehensive claude-workflow label usage and integration guidelines.

#### When to Use claude-workflow Label

**✅ Use for AI-related issues:**

- Claude Code usage and instruction improvements
- AI collaboration patterns and methodologies
- CLAUDE.md documentation and requirements
- Task planning protocols for agentic coding
- Issue creation and labeling processes for AI development
- Documentation consistency across AI-assisted development

**❌ Standard development issues:**

- General git/CI/CD workflow (use standard labels)
- Feature implementations (focus on functionality)
- UI/UX improvements (unless AI interaction specific)
- Infrastructure changes (unless Claude Code related)

#### Combined Label Patterns

**Critical AI Workflow Issues:**

```bash
--label "claude-workflow,priority-1-critical,complexity-simple"
```

**AI Documentation and Guidelines:**

```bash
--label "claude-workflow,documentation,priority-2-high,complexity-simple"
```

**AI Process Improvements:**

```bash
--label "claude-workflow,process-improvement,priority-2-high,complexity-moderate"
```

#### Integration Benefits

- **Clear AI Focus**: Easy identification of AI collaboration improvements
- **Methodology Tracking**: Monitor agentic coding workflow evolution
- **Knowledge Management**: Organize learnings about instruction-based development
- **Process Optimization**: Track and improve human-AI collaboration patterns

## Issue Management Workflow

### Issue Creation

1. **Issue Template**: Use appropriate GitHub issue template
2. **Title Format**: Clear, descriptive title following naming conventions
3. **Priority Label**: Assign appropriate priority level
4. **Complexity Label**: Estimate complexity based on assessment guidelines
5. **Claude-Workflow Label**: Add if issue relates to AI collaboration or Claude Code usage
6. **Additional Labels**: Add relevant labels (enhancement, bug, documentation, etc.)

### Issue Description Requirements

- **Clear Problem Statement**: What needs to be solved or implemented?
- **Acceptance Criteria**: Specific, testable requirements
- **Technical Considerations**: Architecture impact, dependencies, constraints
- **Documentation Requirements**: What documentation needs updating?
- **Testing Strategy**: How will the implementation be validated?

### Issue Lifecycle

1. **Open**: Issue created and labeled
2. **Triaged**: Priority and complexity assessed
3. **Assigned**: Issue assigned to developer or sprint
4. **In Progress**: Work begins, status updates provided
5. **Review**: Code review and testing
6. **Closed**: Issue resolved and validated

### Issue Linking and Tracking

- **Commit Linking**: All commits reference related issue numbers
- **Automatic Closure**: Use closing keywords (Closes, Fixes, Resolves)
- **Cross-References**: Link related issues and pull requests
- **Progress Updates**: Regular status updates on complex issues

## Development Workflow

### Kanban-Style Continuous Delivery

The project follows a **kanban-style workflow** with continuous, on-demand releases. There are no formal sprints or
scheduled releases—work flows continuously from backlog to production.

**Core Workflow Principles**:

- **Continuous Flow**: Issues move through Todo → In Progress → Review → Testing → Done
- **Work-in-Progress Limits**: Typically 1-2 issues actively being worked on at any time
- **On-Demand Releases**: Features are pushed to production immediately upon completion
- **Priority-Driven**: Next work is selected based on priority labels and complexity assessment
- **Just-in-Time Planning**: Issue selection and planning happens as current work completes

### Issue Selection Process

**When current work completes**:

1. **Review completed work**: Ensure PR is merged and deployed
2. **Evaluate priorities**: Use `/select-next-issue` command or manual review
3. **Select next issue**: Choose based on:
   - Priority level (critical → high → medium → low)
   - Complexity (prefer quick wins: high priority + simple/minimal complexity)
   - Dependencies (blocking issues take precedence)
   - Context switching costs (related work may be more efficient)
4. **Start implementation**: Move issue to "In Progress" and begin work

### Backlog Management

- **Priority Ordering**: Issues ordered by priority label (critical at top)
- **Complexity Assessment**: All issues labeled with complexity for informed selection
- **Continuous Grooming**: Priorities and complexity updated as understanding evolves
- **Dependency Tracking**: Blocking issues identified and prioritized appropriately
- **Quick Wins**: High-priority + simple-complexity issues highlighted for momentum

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

### Planning and Coordination

**No formal sprint planning**, but regular activities include:

- **Daily prioritization**: Quick review of what to work on next
- **Backlog grooming**: Update issue priorities and complexity as needed
- **Dependency management**: Identify and sequence blocking issues
- **Capacity awareness**: Consider complexity when selecting next work
- **Retrospective improvements**: Continuous process optimization based on experience

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

**📋 Decision Documentation**: See [ADR-020: GitHub Projects Adoption](../adr/020-github-projects-adoption.md) for
full rationale and trade-offs.

### Custom Fields

GitHub Projects uses custom fields to provide structured data and filtering capabilities:

| Field          | Type          | Values                                            | Source                           |
| -------------- | ------------- | ------------------------------------------------- | -------------------------------- |
| **Priority**   | Single Select | Critical, High, Medium, Low                       | Mapped from priority-\* labels   |
| **Complexity** | Single Select | Minimal, Simple, Moderate, Complex, Epic          | Mapped from complexity-\* labels |
| **Category**   | Single Select | Feature, Infrastructure, Documentation, DX        | Mapped from category-\* labels   |
| **Status**     | Single Select | Todo, In Progress, Review, Testing, Done, Blocked | Manual workflow tracking         |
| **Lifecycle**  | Single Select | Icebox, Backlog, Active, Done                     | Idea maturity stage              |

### Project Views

Five specialized views provide different perspectives on the work:

#### 1. Board View (Primary Workflow)

**Purpose**: Daily kanban workflow visualization

**Configuration**:

- Layout: Board (kanban)
- Columns: Status field (Todo → In Progress → Review → Testing → Done)
- Grouping: Priority (horizontal swimlanes)
- Filter: `Lifecycle:Active OR Lifecycle:Backlog`

**Use Case**: See what's being worked on, move issues through workflow stages, identify bottlenecks

#### 2. Backlog View (Issue Selection)

**Purpose**: Select next issue to work on

**Configuration**:

- Layout: Table
- Columns: Title, Priority, Complexity, Category, Status, Lifecycle
- Sorting: Priority (Critical first), then Complexity (Simple first)
- Filter: `Lifecycle:Active OR Lifecycle:Backlog`

**Use Case**: Replacement/enhancement for `/select-next-issue` with sortable, filterable table view

#### 3. Quick Wins View (Momentum)

**Purpose**: Identify high-impact, low-effort tasks

**Configuration**:

- Layout: Board
- Columns: Status
- Filter: `Priority:High AND (Complexity:Simple OR Complexity:Minimal) AND Lifecycle:Active`

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

**Labels remain the primary source of truth**:

- Priority labels (priority-1-critical through priority-4-low)
- Complexity labels (complexity-minimal through complexity-epic)
- Category labels (category-feature, category-infrastructure, etc.)

**Projects provides visual layer**:

- Custom fields mirror label values for filtering/sorting
- Status and Lifecycle fields add workflow tracking
- Views provide different perspectives on labeled issues

**Workflow**:

1. Create issue with labels (via `gh issue create` or web UI)
2. Issue auto-added to project with fields populated from labels
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
2. Move items through Status as work progresses
3. When work completes, use Backlog view to select next issue
4. Check Quick Wins view for momentum opportunities

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
