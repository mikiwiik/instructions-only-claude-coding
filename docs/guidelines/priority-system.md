# Priority System Guidelines

**🏷️ REQUIREMENT**: All GitHub issues must be assigned appropriate priority labels for effective project management.

## Priority Label Usage

### priority-1-critical 🔴

#### Blocking issues, security vulnerabilities, broken core functionality

- **Action**: Stop other work to address immediately
- **Review**: Must be validated before closing
- **Timeline**: Immediate attention required
- **Examples**: Security vulnerabilities, broken builds, critical bugs preventing development

### priority-2-high 🟠

#### Important features, significant improvements, major bugs

- **Action**: Schedule as primary development focus
- **Review**: Technical review required
- **Timeline**: Current sprint/milestone priority
- **Examples**: Core features, major enhancements, significant bug fixes

### priority-3-medium 🟡

#### Standard features, minor improvements, non-critical bugs

- **Action**: Standard development workflow
- **Review**: Peer review sufficient
- **Timeline**: Next sprint or when capacity allows
- **Examples**: Feature enhancements, minor improvements, standard bug fixes

### priority-4-low 🟢

#### Nice-to-have features, documentation updates, minor enhancements

- **Action**: Good for learning/exploration
- **Review**: Self-review acceptable for simple changes
- **Timeline**: Backlog items, filler work
- **Examples**: Documentation updates, minor UI tweaks, nice-to-have features

## Priority-Based Development Workflow

1. **Issue Selection**: Always prioritize higher-priority issues first
2. **Work Planning**: Consider priority when estimating effort and scheduling
3. **Review Rigor**: Apply appropriate review depth based on priority level
4. **Claude Code Assistance**: Mention priority level when requesting implementation
5. **Progress Tracking**: Use priority labels for filtering and project planning

## Priority Assignment Guidelines

### Assignment Criteria

- **Assign on Creation**: Set priority when creating new issues
- **Regular Review**: Reassess priorities as project evolves
- **Context Consideration**: Factor in deadlines, dependencies, and impact
- **Learning Balance**: Mix high-impact work with learning opportunities

### Decision Matrix

| Factor           | Critical           | High           | Medium           | Low         |
| ---------------- | ------------------ | -------------- | ---------------- | ----------- |
| **Impact**       | Blocks development | Major feature  | Standard feature | Enhancement |
| **Urgency**      | Immediate          | This sprint    | Next sprint      | Backlog     |
| **Risk**         | High               | Medium         | Low              | Minimal     |
| **Dependencies** | Blocks others      | Enables others | Independent      | Optional    |

## Integration with Development Process

### Sprint Planning

- **Critical**: Address immediately, reshuffle sprint if necessary
- **High**: Primary focus for current sprint
- **Medium**: Secondary objectives, next sprint candidates
- **Low**: Filler work, learning opportunities

### Review Process

- **Critical**: Multi-person review, testing validation
- **High**: Thorough technical review
- **Medium**: Standard peer review
- **Low**: Self-review for simple changes

### Communication

- **Critical**: Immediate team notification
- **High**: Regular status updates
- **Medium**: Standard progress tracking
- **Low**: Completed notification only

## Integration with Other Labels

### Claude-Workflow Integration

For AI collaboration and Claude Code workflow issues, combine priority labels with the `claude-workflow` label:

- **priority-1-critical + claude-workflow**: Urgent AI workflow blockers
- **priority-2-high + claude-workflow**: Important AI collaboration improvements
- **priority-3-medium + claude-workflow**: Standard AI methodology enhancements
- **priority-4-low + claude-workflow**: AI workflow nice-to-have improvements

**📋 Full Guidelines**: See [`claude-workflow-labels.md`](claude-workflow-labels.md) for comprehensive AI collaboration
issue management.

### Related Documentation

- **Complexity Estimation**: [`complexity-estimation.md`](complexity-estimation.md)
- **Claude-Workflow Labels**: [`claude-workflow-labels.md`](claude-workflow-labels.md)
- **Project Management**: [`../development/project-management.md`](../development/project-management.md)

---

**Note**: This priority system is designed specifically for Claude Code-assisted development and learning
projects. Adjust thresholds based on project context and team needs.
