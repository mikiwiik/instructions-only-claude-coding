# ADR-008: GitHub Issues for project management

## Status

Accepted

## Context

We need a project management system to track features, bugs, and development progress. Requirements:
- Clear feature breakdown and prioritization
- Integration with version control
- Collaborative development support
- Documentation and history tracking
- Low overhead and complexity
- Good integration with development workflow

## Decision

Use GitHub Issues as our primary project management tool, with detailed issue templates and clear labeling system.

## Consequences

### Positive
- Native integration with GitHub repository and PRs
- No additional tools or services required
- Clear linkage between code changes and requirements
- Good search and filtering capabilities
- Excellent markdown support for detailed descriptions
- Issue templates ensure consistent information capture
- Labels and milestones provide organization
- Free and no external dependencies

### Negative
- Limited project management features compared to dedicated tools
- No built-in time tracking or estimation
- Basic reporting and analytics capabilities
- Limited customization options for workflows
- No built-in Kanban board (though Projects can supplement)

### Neutral
- Requires discipline to maintain issue quality and organization
- Need to establish conventions for labels and workflows
- Integration with external tools requires third-party solutions

## Alternatives Considered

- **Linear**: Excellent developer-focused PM tool but external service dependency
- **Jira**: Powerful but heavy and complex for small projects
- **Trello**: Simple Kanban but limited integration with code
- **Notion**: Flexible but not optimized for development workflow
- **GitHub Projects**: Could supplement Issues but adds complexity

## References

- [GitHub Issues Documentation](https://docs.github.com/en/issues)
- [Issue Templates](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/about-issue-and-pull-request-templates)
- [GitHub Labels Best Practices](https://medium.com/@dave_lunny/sane-github-labels-c5d2e6004b63)