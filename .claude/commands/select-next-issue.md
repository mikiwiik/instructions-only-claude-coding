---
description: Analyze Backlog issues and recommend the next one to work on
---

Analyze GitHub Backlog issues and recommend the next issue to work on.

## Step 1: Fetch Backlog Issues

```bash
gh project item-list 1 --owner mikiwiik --format json --limit 1000 | \
  jq '[.items[] | select(.status == "Backlog") | {number: .content.number, title: .title, labels: .labels}]'
```

## Step 2: Analyze and Recommend

Group by priority (priority-1-critical → priority-4-low) and complexity (minimal → epic), then provide:

1. Issue summary table with priority/complexity breakdown
2. Top 3-5 recommendations using this framework:
   - **Quick Wins**: High priority + minimal/simple complexity
   - **Strategic Work**: High priority + moderate complexity
   - **Maintenance**: Medium priority + simple complexity
3. Suggested next action
