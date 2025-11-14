---
description: Analyze all open issues and recommend the next one to work on
argument-hint: [filter] (optional: priority level like "high", "medium", "low" or complexity like "simple", "moderate", "complex", or "all" to include Icebox)
---

Analyze open GitHub issues and recommend the next issue to work on based on:

1. **GitHub Projects Query**: Fetch issues with Status of Backlog or In Progress (excludes Icebox by default)
   - Use optimized command to get project items (strips issue bodies for 94% token reduction):

     ```bash
     gh project item-list 1 --owner mikiwiik --format json | \
       jq '{items: [.items[] | {content: {number: .content.number}, title: .title, labels: .labels, status: .status}]}'
     ```

   - Filter for `(.status == "Backlog" OR .status == "In Progress")` to exclude Done and Icebox
   - Verify GitHub issue state is OPEN to exclude closed issues
   - Extract issue details from filtered project items
   - **Token Optimization**: Only metadata needed for selection (not full issue bodies)
2. **Priority Assessment**: Group issues by priority labels (priority-1-critical, priority-2-high,
   priority-3-medium, priority-4-low)
3. **Complexity Analysis**: Consider complexity labels (complexity-minimal, complexity-simple,
   complexity-moderate, complexity-complex, complexity-epic)
4. **Strategic Recommendations**: Provide 3-5 top recommendations with rationale

**Filter Logic** (if $1 provided):

- If $1 = "all": Include all Status values (Icebox, Backlog, In Progress) using `gh issue list --state open`
- If $1 = "high": Focus on priority-2-high issues (Status: Backlog or In Progress only)
- If $1 = "medium": Focus on priority-3-medium issues (Status: Backlog or In Progress only)
- If $1 = "low": Focus on priority-4-low issues (Status: Backlog or In Progress only)
- If $1 = "simple": Focus on complexity-simple issues (Status: Backlog or In Progress only)
- If $1 = "quick": Focus on complexity-minimal issues (Status: Backlog or In Progress only)
- If $1 = "moderate": Focus on complexity-moderate issues (Status: Backlog or In Progress only)
- Default (no argument): All Backlog/In Progress issues

**Analysis Framework**:

- **Quick Wins**: High priority + simple complexity
- **Strategic Work**: High priority + moderate complexity
- **Learning Opportunities**: Lower priority + complex work
- **Maintenance**: Medium priority + simple complexity

**Status Filtering**:

- **Default**: Only considers Backlog and In Progress issues (ready for work)
- **Icebox Excluded**: Raw ideas with Status="Icebox" are not refined enough for selection
- **Done Excluded**: Completed items with Status="Done" are automatically excluded
- **Use "all" filter**: When you need to see all issues including unrefined Icebox items

**Output Format**:

1. Issue summary with priority/complexity breakdown
2. Top 3-5 specific recommendations with reasoning
3. Suggested next action based on current project state

$ARGUMENTS
