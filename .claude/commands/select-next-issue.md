---
description: Analyze all open issues and recommend the next one to work on
argument-hint: [filter] (optional: priority level like "high", "medium", "low" or complexity like "simple", "moderate", "complex", or "all" to include Icebox)
---

Analyze open GitHub issues and recommend the next issue to work on based on:

1. **GitHub Projects Query**: Fetch issues from Backlog or Active lifecycle states (excludes Icebox by default)
   - Use `gh project item-list 1 --owner mikiwiik --format json` to get project items
   - Filter for `.lifecycle == "Backlog"` OR `.lifecycle == "Active"`
   - Extract issue details from filtered project items
2. **Priority Assessment**: Group issues by priority labels (priority-1-critical, priority-2-high,
   priority-3-medium, priority-4-low)
3. **Complexity Analysis**: Consider complexity labels (complexity-minimal, complexity-simple,
   complexity-moderate, complexity-complex, complexity-epic)
4. **Strategic Recommendations**: Provide 3-5 top recommendations with rationale

**Filter Logic** (if $1 provided):

- If $1 = "all": Include all Lifecycle states (Icebox, Backlog, Active) using `gh issue list --state open`
- If $1 = "high": Focus on priority-2-high issues (Backlog/Active only)
- If $1 = "medium": Focus on priority-3-medium issues (Backlog/Active only)
- If $1 = "low": Focus on priority-4-low issues (Backlog/Active only)
- If $1 = "simple": Focus on complexity-simple issues (Backlog/Active only)
- If $1 = "quick": Focus on complexity-minimal issues (Backlog/Active only)
- If $1 = "moderate": Focus on complexity-moderate issues (Backlog/Active only)
- Default (no argument): All Backlog/Active issues

**Analysis Framework**:

- **Quick Wins**: High priority + simple complexity
- **Strategic Work**: High priority + moderate complexity
- **Learning Opportunities**: Lower priority + complex work
- **Maintenance**: Medium priority + simple complexity

**Lifecycle Filtering**:

- **Default**: Only considers Backlog and Active issues (ready for work)
- **Icebox Excluded**: Raw ideas in Icebox are not refined enough for selection
- **Use "all" filter**: When you need to see all issues including unrefined Icebox items

**Output Format**:

1. Issue summary with priority/complexity breakdown
2. Top 3-5 specific recommendations with reasoning
3. Suggested next action based on current project state

$ARGUMENTS
