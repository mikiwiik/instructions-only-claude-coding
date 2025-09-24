---
description: Find and prioritize quick win issues (high priority + simple complexity)
---

Find quick win opportunities from open GitHub issues:

1. **Fetch All Issues**: Get complete list of open issues with `gh issue list --state open`
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

**Output Format**:

- Ranked list of quick wins with impact/effort ratios
- Recommended sequence for completing multiple quick wins
- Estimated completion times
