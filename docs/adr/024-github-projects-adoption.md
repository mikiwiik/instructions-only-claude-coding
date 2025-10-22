# ADR-024: GitHub Projects Adoption for Enhanced Project Management

## Status

Accepted

## Context

The project currently uses GitHub Issues with a sophisticated label system (priority, complexity, category) for
project management. While this approach works well for issue tracking, it lacks visual workflow management, quick
wins identification, and idea capture capabilities.

**Current strengths**:

- Well-defined priority and complexity labels
- Clear categorization system
- Integration with `/select-next-issue` command
- Works well for kanban-style, continuous delivery workflow

**Current limitations**:

- No visual representation of workflow (Todo → In Progress → Done)
- Difficult to identify quick wins (high priority + simple complexity) at a glance
- No dedicated space for capturing raw ideas before they're refined
- Limited ability to visualize work-in-progress and agent coordination
- Manual tracking of issue status and lifecycle

**Development workflow context**:

- Kanban-style continuous delivery (no formal sprints)
- On-demand releases (push to production as features complete)
- Typically 1-2 issues being worked on at a time
- Priority-driven issue selection using labels + `/select-next-issue`
- Multi-agent coordination (frontend, testing, QA, documentation specialists)

**Question**: Would GitHub Projects add meaningful value while maintaining the instruction-only development
philosophy and current workflow?

## Decision

**Adopt GitHub Projects as a pilot enhancement** to the existing label-based issue management system.

**Key components**:

1. **Custom Fields**:
   - Priority (Critical/High/Medium/Low) - mapped from labels
   - Complexity (Minimal/Simple/Moderate/Complex/Epic) - mapped from labels
   - Category (Feature/Infrastructure/Documentation/DX) - mapped from labels
   - Status (Todo/In Progress/Done) - workflow tracking
   - Lifecycle (Icebox/Backlog/Active/Done) - idea maturity tracking

2. **Five Project Views**:
   - **Board**: Primary kanban view (Status columns, Priority grouping, Lifecycle:Active/Backlog filter)
   - **Backlog**: Table view for issue selection (sorted Priority→Complexity, Lifecycle:Backlog/Active)
   - **Quick Wins**: Filtered board (priority-2-high + complexity-simple/minimal) for momentum
   - **Agent Workload**: Visualize current work by agent specialization (Lifecycle:Active)
   - **Icebox**: Raw ideas storage (Lifecycle:Icebox, minimal requirements)

3. **Automation**:
   - Auto-add all open issues to project
   - Auto-update Status when PR merged (→ Done)
   - Auto-archive completed items

4. **Lifecycle Workflow**:
   - **Icebox**: Capture raw ideas, minimal description, optional labels
   - **Backlog**: Triaged issues ready for prioritization, proper labels required
   - **Active**: Currently working (1-2 issues) or next up (high priority)
   - **Done**: Completed and archived

**Pilot approach**:

- Labels remain the primary source of truth
- Projects adds visual layer and workflow management
- Evaluate after 2-3 months of usage
- Easy to abandon if overhead exceeds benefits

## Consequences

### Positive

1. **Visual Workflow**: Clear kanban board showing work moving through Todo → In Progress → Done
2. **Quick Wins Identification**: Dedicated view for high-priority + simple-complexity issues, perfect for building momentum
3. **Idea Capture**: Icebox provides low-friction way to capture raw ideas without full requirements
4. **Agent Coordination**: Visual tracking of which specialized agents are working on what
5. **Better Prioritization**: Backlog view makes `/select-next-issue` decisions more informed with sortable table
6. **Workflow Automation**: Reduces manual status updates via auto-add and PR-merge automation
7. **Multiple Perspectives**: Different views for different needs (workflow, planning, quick wins, ideas)
8. **Low Risk**: Pilot approach with easy rollback if it doesn't add value
9. **CLI Integration**: `gh project` commands available for programmatic access
10. **Maintains Current Workflow**: Designed around existing kanban-style, continuous delivery process

### Negative

1. **Learning Curve**: Team needs to understand project structure and field meanings
2. **Maintenance Overhead**: Custom fields need to be kept in sync with labels
3. **Additional Complexity**: Another tool to manage alongside issues and labels
4. **Initial Setup Effort**: Configuration, automation, view creation, and issue triage
5. **Potential Duplication**: Custom fields duplicate some label information
6. **Cognitive Load**: Need to remember which view to use for which purpose
7. **Triage Responsibility**: Requires periodic review of Icebox to promote ideas to Backlog

### Neutral

1. **Field vs. Label Duality**: Priority/Complexity/Category exist in both labels and fields
2. **View Management**: Five views provide flexibility but may feel overwhelming initially
3. **Lifecycle Tracking**: Adds new dimension (Icebox/Backlog/Active/Done) not present in current system
4. **GraphQL API Available**: Advanced automation possible but not immediately needed

## Alternatives Considered

- **GitHub Discussions for Ideas**: Use Discussions for Icebox instead of Lifecycle field
  - Rejected: Adds another tool; Projects Icebox view keeps everything in one place

- **Draft Issues for Icebox**: Use draft status instead of Lifecycle field
  - Rejected: Draft issues less visible and harder to filter/manage

- **Labels Only (Status Quo)**: Continue with current label-only approach
  - Rejected: Misses visual workflow benefits and quick wins identification

- **Third-Party Tools** (Linear, Jira, etc.): Use dedicated project management tool
  - Rejected: Adds external dependency; GitHub Projects integrates natively with issues/PRs

- **Automated Fields Only**: Skip manual field population, rely only on label-to-field automation
  - Rejected: Not all fields (Status, Lifecycle) can be auto-populated from labels

## Update: Labels-Only Architecture (2025-10-19)

After initial implementation, we refined the architecture to eliminate data duplication and align with atomic data
principles.

### Revised Decision

**Use built-in Labels field instead of custom Priority/Complexity/Category fields.**

**Custom Fields Retained**:

- **Status** (Todo/In Progress/Done) - workflow state not in labels
- **Lifecycle** (Icebox/Backlog/Active/Done) - idea maturity stage not in labels

**Custom Fields Removed**:

- ~~Priority~~ - use `label:priority-*` filters instead
- ~~Complexity~~ - use `label:complexity-*` filters instead
- ~~Category~~ - use `label:category-*` filters instead

### Rationale

**Labels are atomic data**:

- Belong to issues themselves (not project-specific)
- Compatible everywhere (CLI, GitHub Actions, all projects, issue views)
- No sync burden or automation needed
- Single source of truth principle

**Instruction-only philosophy**:

- Manual field sync (Step 9) contradicts automation-first approach
- Duplication creates maintenance overhead
- Labels provide universal compatibility for CLI-heavy workflows

### Trade-offs Accepted

**UX limitations**:

- ❌ Cannot group board by Priority (labels don't support grouping)
- ❌ Cannot sort table by Priority/Complexity (labels are unordered sets)
- ⚠️ More verbose filters (`label:priority-2-high` vs `Priority:High`)

**Benefits gained**:

- ✅ Zero data duplication
- ✅ Zero sync burden (no manual Step 9 for P/C/C)
- ✅ Universal compatibility (CLI, Actions, all contexts)
- ✅ Simpler architecture and maintenance
- ✅ Aligns with stated "labels as source of truth" principle

### Impact on Existing Decision

The core decision to adopt GitHub Projects remains valid. The refinement only affects **how** we integrate with
Projects:

- **Still gain**: Visual workflow, Icebox/Backlog/Active lifecycle tracking, quick wins filtering
- **Now simpler**: Fewer custom fields, no duplication, compatible with existing label-based workflows

## References

- [GitHub Issue #192](https://github.com/mikiwiik/instructions-only-claude-coding/issues/192): Full evaluation and analysis
- [GitHub Docs: About Projects](https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects)
- [GitHub Docs: Built-in Automations](https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project/using-the-built-in-automations)
- [GitHub Docs: Customizing Views](https://docs.github.com/en/issues/planning-and-tracking-with-projects/customizing-views-in-your-project)
- [docs/development/project-management.md](../development/project-management.md): Current workflow documentation
- [docs/reference/labels-and-priorities.md](../reference/labels-and-priorities.md): Label system documentation
