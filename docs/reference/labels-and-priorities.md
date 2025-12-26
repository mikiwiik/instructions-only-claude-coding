# GitHub Issue Labels and Priority System

## Priority System

**🏷️ REQUIREMENT**: All GitHub issues must be assigned appropriate priority labels.

### Priority Labels

#### priority-1-critical 🔴

- **Blocking issues** preventing development or deployment
- **Security vulnerabilities** requiring immediate attention
- **Production bugs** affecting user experience
- **Immediate attention required** within 24 hours

#### priority-2-high 🟠

- **Important features** for current sprint
- **Significant bugs** affecting core functionality
- **User experience improvements** with high impact
- **Current sprint priority** - should be worked on next

#### priority-3-medium 🟡

- **Standard features** for future sprints
- **Enhancements** that improve but don't block functionality
- **Technical debt** that should be addressed
- **Next sprint scheduling** - planned future work

#### priority-4-low 🟢

- **Nice-to-have features** for backlog
- **Minor improvements** with limited impact
- **Experimental features** for exploration
- **Backlog items** - work when time permits

## Complexity Estimation

**🎯 REQUIREMENT**: All GitHub issues must be assigned complexity labels for effort estimation.

### Complexity Labels

#### complexity-minimal 🟢

- **Single file changes** or quick fixes
- **Simple configuration updates**
- **Documentation additions** without research
- **Estimated effort**: 15-30 minutes

#### complexity-simple 🔵

- **Basic features** with straightforward implementation
- **Single component additions**
- **Clear requirements** with known approach
- **Estimated effort**: 1-3 hours

#### complexity-moderate 🟡

- **Multi-component changes** affecting 3-5 files
- **State management updates**
- **Integration between systems**
- **Some architectural decisions required**
- **Estimated effort**: 3-8 hours

#### complexity-complex 🟠

- **Architecture changes** affecting system design
- **Multiple integration points**
- **Research required** for implementation approach
- **Breaking changes** or major refactoring
- **Estimated effort**: 1-3 days

#### complexity-epic 🔴

- **Major overhauls** requiring significant planning
- **Multiple related features** delivered together
- **System-wide changes** affecting many components
- **Long-term projects** spanning multiple sprints
- **Estimated effort**: 1+ weeks

## Category Labels

**Every issue must have exactly ONE category label:**

### category-feature 🟦

- **Core application functionality** and user features
- **Todo CRUD operations** and user interactions
- **UI/UX improvements** for end users
- **Feature bugs and fixes**

### category-infrastructure 🟧

- **DevOps, CI/CD, deployment** configurations
- **GitHub Actions and workflows**
- **Security and performance tooling**
- **Backend architecture** and system design

### category-testing 🧪

- **Test code** (unit, integration, E2E tests)
- **Testing infrastructure** (Jest, testing libraries, runners)
- **Test standards** and conventions
- **Test utilities** and mocking setup
- **Coverage and quality** tooling

### category-documentation 🟩

- **Documentation files** and technical writing
- **Architecture Decision Records (ADRs)**
- **Process documentation** and guidelines
- **Diagrams and visual documentation**

### category-dx 🟪

- **Developer experience** improvements
- **Claude Code workflows** and AI collaboration
- **Development tooling** and automation
- **Issue/PR management** processes
- **Code quality** and development standards

## Special Labels

### claude-workflow

- **Claude Code usage** and instructions
- **AI collaboration patterns** and workflows
- **CLAUDE.md documentation** and requirements
- **Task planning protocols** and methodologies
- **Agent coordination** and specialized implementations

### enhancement

- **Feature improvements** and enhancements
- **Performance optimizations**
- **User experience improvements**

### documentation

- **Documentation-related work**
- **Can be combined with category labels**

### ux

- **User experience focused** improvements
- **Interface and interaction enhancements**

## Label Usage Guidelines

### Issue Creation Checklist

**🚨 MANDATORY**: All issues must include:

- [ ] **Priority label** (priority-1-critical through priority-4-low)
- [ ] **Complexity label** (complexity-minimal through complexity-epic)
- [ ] **Category label** (exactly one category)
- [ ] **Assessment rationale** in issue description

### Claude Code Commands

Always include labels in issue creation:

```bash
gh issue create --title "Issue Title" \
  --label "priority-2-high,complexity-moderate,category-feature" \
  --body "Issue description with rationale"
```

### Strategic Planning

#### Quick Wins (High Impact + Low Effort)

- **priority-2-high** + **complexity-simple**
- **priority-2-high** + **complexity-minimal**

#### Major Features (High Impact + High Effort)

- **priority-2-high** + **complexity-moderate**
- **priority-2-high** + **complexity-complex**

#### Maintenance Work (Medium Impact + Low Effort)

- **priority-3-medium** + **complexity-simple**
- **priority-3-medium** + **complexity-minimal**

#### Learning Opportunities (Low Priority + Complex Work)

- **priority-4-low** + **complexity-complex**
- **priority-4-low** + **complexity-epic**

## Assessment Examples

### Feature Implementation Example

**Issue**: "Add todo filtering by completion status"

- **Priority**: priority-2-high (important user feature)
- **Complexity**: complexity-moderate (state management + UI changes)
- **Category**: category-feature (core todo functionality)

### Infrastructure Example

**Issue**: "Set up automated dependency updates"

- **Priority**: priority-3-medium (useful but not urgent)
- **Complexity**: complexity-simple (configuration setup)
- **Category**: category-infrastructure (DevOps automation)

### Documentation Example

**Issue**: "Create development workflow diagram"

- **Priority**: priority-4-low (nice to have)
- **Complexity**: complexity-minimal (diagram creation)
- **Category**: category-documentation (process documentation)

### Testing Example

**Issue**: "Add cleanup hooks for Object.defineProperty mocks"

- **Priority**: priority-2-high (prevents test pollution)
- **Complexity**: complexity-simple (test utility + convention update)
- **Category**: category-testing (test standards and utilities)

This labeling system enables effective issue prioritization, effort estimation, and strategic development planning.

## GitHub Projects Integration

### Overview

GitHub Projects enhances the label-based system with visual workflow management and lifecycle tracking.
**Labels remain the primary source of truth**—Projects provides an additional visual layer.

**📋 Full Documentation**: See [docs/development/project-management.md](../development/project-management.md#github-projects-integration)
for complete GitHub Projects usage.

**🔧 Setup Guide**: See [docs/setup/github-projects-setup.md](../setup/github-projects-setup.md) for
configuration steps.

**📖 Decision Rationale**: See [ADR-024: GitHub Projects Adoption](../adr/024-github-projects-adoption.md) for
decision context and trade-offs.

### Labels vs Custom Fields: Core Distinction

**Labels (Atomic, Issue-Specific, Not Time-Bound)**:

- **What they describe**: Intrinsic properties of the issue itself
- **Examples**: Priority (importance), Complexity (effort), Category (work type)
- **Characteristics**:
  - Atomic data that belongs to issues, not projects
  - Universal compatibility (CLI, GitHub Actions, all projects)
  - Not time-bound - don't change based on workflow progression
  - Single source of truth, auto-visible in Projects via Labels field
  - No synchronization needed

**Custom Fields (Workflow State, Time-Bound)**:

- **What they describe**: Where the issue is in the development workflow
- **Examples**: Status (work state), Lifecycle (idea maturity)
- **Characteristics**:
  - Project-specific, not issue properties
  - Change as work progresses through workflow
  - Time-bound - reflect current state, not intrinsic properties
  - Manual updates during workflow progression

**Why This Matters**:

- Labels aren't duplicated as custom fields (zero sync burden)
- Labels work everywhere in GitHub ecosystem (universal compatibility)
- Clear separation between static properties (labels) and dynamic state (custom fields)
- Aligns with instruction-only philosophy (no manual sync required)

### Lifecycle Field

GitHub Projects adds a **Lifecycle** field to track idea maturity from conception to completion:

#### lifecycle-icebox 🧊

- **Purpose**: Low-friction capture of ideas without full requirements
- **Requirements**: Title + brief description (optional labels)
- **Characteristics**:
  - Unclear scope or approach
  - Needs research or exploration
  - "Nice to have someday" without immediate plan
  - Rough idea without clear requirements
- **Example**: "Explore dark mode implementation"
- **Triage**: Periodic weekly review to promote to Backlog or close

#### lifecycle-backlog 📋

- **Purpose**: Well-defined issues awaiting selection
- **Requirements**: Full description + priority + complexity + category labels
- **Characteristics**:
  - Clear requirements and acceptance criteria
  - Proper labels assigned
  - Ready for implementation when capacity available
  - May have dependency or sequencing considerations
- **Example**: "Implement dark mode toggle with system preference detection" (priority-2-high, complexity-moderate, category-feature)
- **Selection**: Reviewed via Backlog view or `/select-next-issue` when current work completes

#### lifecycle-active ⚡

- **Purpose**: Currently being worked on (1-2 issues) or next up
- **Requirements**: Full labels + Status field tracking
- **Characteristics**:
  - 1-2 issues maximum (WIP limit)
  - High priority and ready to start
  - Currently in progress
  - May block other work
- **Example**: "Implement dark mode toggle" (Status: In Progress)
- **Visibility**: Appears in Board, Backlog, Quick Wins, and Agent Workload views

#### lifecycle-done ✅

- **Purpose**: Finished work, deployed to production
- **Automation**: Auto-set when PR merged and issue closed
- **Archival**: Automatically archived after 30 days
- **Example**: Closed issues with merged PRs

### Label Display in GitHub Projects

GitHub Projects displays labels using the built-in **Labels** field:

| Label Pattern    | Display Method          | Projects Field |
| ---------------- | ----------------------- | -------------- |
| `priority-*`     | Labels field (built-in) | (none)         |
| `complexity-*`   | Labels field (built-in) | (none)         |
| `category-*`     | Labels field (built-in) | (none)         |
| (workflow state) | Custom field            | Status         |
| (idea maturity)  | Custom field            | Lifecycle      |

**Rationale**: Labels are atomic data that belong to issues themselves. Using the built-in Labels field eliminates
duplication and maintains labels as the single source of truth. See
[ADR-024](../adr/024-github-projects-adoption.md#update-labels-only-architecture-2025-10-19) for details.

**Filtering examples**:

- High priority: `label:priority-2-high`
- Quick wins: `label:priority-2-high label:complexity-simple,complexity-minimal`
- Features: `label:category-feature`

### Workflow Integration

**Issue Creation**:

```bash
# Well-defined issue → Auto-adds to Backlog
gh issue create --title "Feature Title" \
  --label "priority-2-high,complexity-moderate,category-feature" \
  --body "Full description"

# Raw idea → Manually set Lifecycle:Icebox in Projects
gh issue create --title "Explore feature X" \
  --body "Initial idea: investigate approach for X"
```

**Lifecycle Progression**:

```text
Raw Idea → Icebox (capture)
         → Backlog (triage + add labels)
         → Active (select for work, WIP limit: 1-2)
         → Done (PR merged, auto-archived)
```

**Daily Workflow**:

1. Check Board view for In Progress items
2. Move through Status stages as work progresses
3. When complete, use Backlog view to select next issue
4. Check Quick Wins view for momentum opportunities

**Weekly Triage**:

1. Review Icebox view
2. Promote ready ideas to Backlog with proper labels
3. Close or archive stale Icebox items

### Project Views Reference

**Five specialized views**:

1. **Board - Workflow**: Kanban view (Status columns, filtered by high-priority labels + Lifecycle:Active/Backlog)
2. **Backlog - Next Issue**: Table with Labels column (use `/select-next-issue` for priority-based selection)
3. **Quick Wins**: Filtered board (`label:priority-2-high label:complexity-simple,complexity-minimal Lifecycle:Active`)
4. **Agent Workload**: Current work by agent specialization (Lifecycle:Active)
5. **Icebox - Raw Ideas**: Idea capture (Lifecycle:Icebox)

**Quick Access**: Project board provides visual workflow management. For priority-based issue selection, use
`/select-next-issue` command or review Labels column in Backlog view.

### Best Practices

**Label First, Projects Second**:

- Always assign priority, complexity, and category **labels** to well-defined issues
- Use GitHub Projects for visual management and lifecycle tracking
- Labels enable CLI workflows and filtering; Projects adds visual layer

**Lifecycle Guidelines**:

- **Icebox**: Capture ideas freely without over-thinking
- **Backlog**: Ensure full labels before promoting from Icebox
- **Active**: Respect WIP limit (1-2 issues maximum)
- **Done**: Trust automation; manual updates rarely needed

**Avoid Label Duplication**:

- Don't create `icebox`, `backlog`, `active` **labels**
- Lifecycle is a Projects-only field, not a label
- Keep labels focused on priority, complexity, and category
