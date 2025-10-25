---
description: Find and prioritize quick win issues (high priority + simple complexity)
---

Find quick win opportunities from triaged, ready-to-work GitHub issues:

1. **Fetch Backlog/Active Issues**: Get issues from Backlog or Active lifecycle states (excludes Icebox)
   - Use `gh project item-list 1 --owner mikiwiik --format json` to get project items
   - Filter for `(.lifecycle == "Backlog" OR .lifecycle == "Active") AND .status != "Done"`
   - Verify GitHub issue state is OPEN to exclude closed issues
   - Extract issue details from filtered project items
2. **Filter for Quick Wins**: Identify issues that are:
   - High priority (priority-2-high) + Simple complexity (complexity-simple or complexity-minimal)
   - Medium priority (priority-3-medium) + Minimal complexity (complexity-minimal)
3. **Impact Analysis**: Assess which quick wins provide maximum value
4. **Implementation Estimate**: Provide time estimates for each quick win

**Quick Win Criteria**:

- Can be completed in single development session
- High user or developer value
- Low risk of introducing bugs
- Clear requirements and scope

**Lifecycle Filtering Rationale**:

Quick wins come from triaged, ready-to-work issues (Backlog/Active). Icebox items are excluded
as they haven't been refined yet and may lack proper requirements or complexity assessment.

**Status Filtering**: Also excludes items where Status="Done" even if Lifecycle is stale, ensuring
only active open issues are considered.

**Output Format**:

- Ranked list of quick wins with impact/effort ratios
- Recommended sequence for completing multiple quick wins
- Estimated completion times
