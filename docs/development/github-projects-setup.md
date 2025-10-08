# GitHub Projects Setup Guide

This guide provides step-by-step instructions for setting up GitHub Projects for the Todo App project.

**📋 Context**: See [ADR-020: GitHub Projects Adoption](../adr/020-github-projects-adoption.md) for decision rationale.

**📖 Usage**: See [Project Management Documentation](project-management.md#github-projects-integration) for daily
workflow and best practices.

## Prerequisites

- Repository admin access to create projects
- GitHub account with project scope permissions

## Phase 1: Project Creation

### Step 1: Create New Project

1. Navigate to repository: <https://github.com/mikiwiik/instructions-only-claude-coding>
2. Click **Projects** tab
3. Click **New project**
4. Choose **Board** template (we'll customize views later)
5. Name: `Todo App Project Management`
6. Description: `Kanban-style project management with visual workflow, quick wins identification, and idea capture`
7. Click **Create**

## Phase 2: Custom Fields Configuration

### Step 2: Add Priority Field

1. In project, click **+ New field** (top-right)
2. Field name: `Priority`
3. Field type: **Single select**
4. Options (in order):
   - `Critical` (🔴 red)
   - `High` (🟠 orange)
   - `Medium` (🟡 yellow)
   - `Low` (🟢 green)
5. Click **Save**

### Step 3: Add Complexity Field

1. Click **+ New field**
2. Field name: `Complexity`
3. Field type: **Single select**
4. Options (in order):
   - `Minimal` (🟢 green)
   - `Simple` (🔵 blue)
   - `Moderate` (🟡 yellow)
   - `Complex` (🟠 orange)
   - `Epic` (🔴 red)
5. Click **Save**

### Step 4: Add Category Field

1. Click **+ New field**
2. Field name: `Category`
3. Field type: **Single select**
4. Options:
   - `Feature` (🟦 blue)
   - `Infrastructure` (🟧 orange)
   - `Documentation` (🟩 green)
   - `DX` (🟪 purple)
5. Click **Save**

### Step 5: Rename Status Field

1. Find existing **Status** field (from Board template)
2. Click field menu → **Edit field**
3. Ensure options are:
   - `Todo`
   - `In Progress`
   - `Review`
   - `Testing`
   - `Done`
   - `Blocked` (add if missing)
4. Click **Save**

### Step 6: Add Lifecycle Field

1. Click **+ New field**
2. Field name: `Lifecycle`
3. Field type: **Single select**
4. Options (in order):
   - `Icebox` (🧊 light blue)
   - `Backlog` (📋 gray)
   - `Active` (⚡ yellow/green)
   - `Done` (✅ green)
5. Click **Save**

## Phase 3: View Configuration

### Step 7: Configure Board View (Rename Default)

1. Find default view (likely named "Board" or similar)
2. Click view menu → **Rename**
3. Name: `Board - Workflow`
4. Click **Settings** (gear icon)
5. **Layout**: Board
6. **Columns**: Group by `Status`
7. **Column grouping**: Group by `Priority` (creates priority swimlanes)
8. **Filter**: Add filter: `Lifecycle:Active OR Lifecycle:Backlog`
9. **Sort**: (Status handles primary sort)
10. Click **Save**

### Step 8: Create Backlog View

1. Click **+ New view**
2. Name: `Backlog - Next Issue`
3. **Layout**: Table
4. **Columns**: (reorder to show these first)
   - Title
   - Priority
   - Complexity
   - Category
   - Status
   - Lifecycle
   - Labels (optional)
5. **Sort**:
   - Primary: `Priority` (Critical → Low)
   - Secondary: `Complexity` (Minimal → Epic)
6. **Filter**: `Lifecycle:Active OR Lifecycle:Backlog`
7. Click **Save**

### Step 9: Create Quick Wins View

1. Click **+ New view**
2. Name: `Quick Wins - High Priority + Simple`
3. **Layout**: Board
4. **Columns**: Group by `Status`
5. **Filter**: Add three filters (AND logic):
   - `Priority:High`
   - `Complexity:Simple OR Complexity:Minimal`
   - `Lifecycle:Active`
6. Click **Save**

### Step 10: Create Agent Workload View

1. Click **+ New view**
2. Name: `Agent Workload - Current Work`
3. **Layout**: Board
4. **Columns**: Group by `Status`
5. **Group by**: If available, group by `Agent` field (optional - may need to create Agent field first)
6. **Filter**: `Lifecycle:Active`
7. Click **Save**

**Note**: If you want the Agent field:

- Create new field: `Agent` (Single select)
- Options: `Frontend`, `Testing`, `QA`, `Documentation`, `Multiple`, `None`
- Then configure this view to group by Agent

### Step 11: Create Icebox View

1. Click **+ New view**
2. Name: `Icebox - Raw Ideas`
3. **Layout**: Table or Board (your preference)
4. **Filter**: `Lifecycle:Icebox`
5. **Columns** (if Table): Title, Priority (optional), Complexity (optional), Category (optional)
6. Click **Save**

## Phase 4: Automation Configuration

### Step 12: Set Up Auto-Add Workflow

1. Click project menu (three dots) → **Workflows**
2. Find **Item added to project** workflow
3. Enable **Auto-add to project**
4. **Filter**: `repo:mikiwiik/instructions-only-claude-coding is:issue is:open`
5. This automatically adds all new and existing open issues to project
6. Click **Save**

### Step 13: Set Up Auto-Archive Workflow

1. In **Workflows** settings
2. Find **Item closed** workflow
3. Enable **Auto-archive items**
4. **When**: `Item closed`
5. **Set**: `Status = Done`, `Lifecycle = Done`
6. Click **Save**

### Step 14: Set Up PR Merge Workflow (if available)

1. In **Workflows** settings
2. Find **Pull request merged** workflow (if available)
3. Enable **Set field values**
4. **When**: `Pull request merged and linked issue`
5. **Set**: `Status = Done`
6. Click **Save**

**Note**: Some automation may require project beta features. Enable what's available.

## Phase 5: Initial Population

### Step 15: Bulk Add Existing Issues

If auto-add didn't trigger for existing issues:

1. Navigate to Issues tab
2. Select all open issues (or use filter)
3. Click **Projects** → Select your project
4. This adds issues in bulk

**CLI Alternative**:

```bash
# Get project number first
gh project list --owner @me

# Add all open issues
gh issue list --limit 1000 --json number,url --jq '.[] | .url' | \
  xargs -I {} gh project item-add PROJECT_NUMBER --owner mikiwiik --url {}
```

### Step 16: Triage Issues to Lifecycle Stages

Go through each issue and set Lifecycle field based on readiness:

**Icebox** 🧊 - Move here if:

- Rough idea without clear requirements
- Needs research or exploration
- "Nice to have someday" without immediate plan
- Unclear scope or approach

**Backlog** 📋 - Move here if:

- Well-defined with clear requirements
- Has proper priority and complexity labels
- Ready for implementation, but not immediate
- Dependency or sequencing considerations

**Active** ⚡ - Move here if:

- Currently being worked on (1-2 issues max)
- Next up based on priority
- High priority and ready to start
- Blocks other work

**Done** ✅:

- Only for closed/completed issues
- Usually auto-set by automation

**Triage Checklist**:

- [ ] Review all issues in project
- [ ] Set Lifecycle for each issue
- [ ] Verify high-priority issues are in Active
- [ ] Ensure 1-2 issues max in Active with Status "In Progress"
- [ ] Move unclear/exploratory issues to Icebox
- [ ] Ensure Backlog issues have proper labels

### Step 17: Populate Custom Fields from Labels

For each issue with Lifecycle `Active` or `Backlog`:

1. **Priority field**: Set based on issue's `priority-*` label
   - `priority-1-critical` → `Critical`
   - `priority-2-high` → `High`
   - `priority-3-medium` → `Medium`
   - `priority-4-low` → `Low`

2. **Complexity field**: Set based on issue's `complexity-*` label
   - `complexity-minimal` → `Minimal`
   - `complexity-simple` → `Simple`
   - `complexity-moderate` → `Moderate`
   - `complexity-complex` → `Complex`
   - `complexity-epic` → `Epic`

3. **Category field**: Set based on issue's `category-*` label
   - `category-feature` → `Feature`
   - `category-infrastructure` → `Infrastructure`
   - `category-documentation` → `Documentation`
   - `category-dx` → `DX`

4. **Status field**: Set based on current work state
   - Not started → `Todo`
   - Currently working → `In Progress`
   - Awaiting review → `Review`
   - In testing → `Testing`
   - Blocked → `Blocked`

**Note**: Icebox issues can skip Priority/Complexity if not yet defined.

## Phase 6: Verification

### Step 18: Test Views

Navigate through each view and verify:

- [ ] **Board - Workflow**: Shows Active/Backlog issues grouped by Priority
- [ ] **Backlog - Next Issue**: Table sorted by Priority → Complexity
- [ ] **Quick Wins**: Filtered to high-priority + simple-complexity issues only
- [ ] **Agent Workload**: Shows Active issues (grouped by Agent if field exists)
- [ ] **Icebox**: Shows only Icebox issues

### Step 19: Test Automation

Create a test issue to verify automation:

```bash
gh issue create \
  --title "Test: GitHub Projects Automation" \
  --body "Testing auto-add to project and field population" \
  --label "priority-4-low,complexity-minimal,category-infrastructure"
```

Verify:

- [ ] Issue automatically added to project
- [ ] Appears in Backlog view
- [ ] Can manually set Lifecycle, Priority, Complexity, Category fields
- [ ] Closing issue sets Status and Lifecycle to Done

### Step 20: Document Project URL

Get project URL to reference in documentation:

1. Navigate to project
2. Copy URL from browser (format: `https://github.com/users/mikiwiik/projects/N`)
3. Add to `CLAUDE.md` and documentation as needed

## Daily Workflow Quick Reference

**Morning**:

1. Open Board view → Check "In Progress" column
2. Continue current work or move to Done

**Selecting Next Work**:

1. Open Backlog view → Sort by Priority → Complexity
2. Or check Quick Wins view for momentum opportunities
3. Select next issue, set Lifecycle:Active, Status:In Progress

**Capturing Ideas**:

1. Create issue with minimal description
2. Set Lifecycle:Icebox (no labels required yet)
3. Triage weekly to promote to Backlog

**Weekly Triage**:

1. Review Icebox view
2. Promote ready ideas to Backlog with proper labels
3. Close or archive stale Icebox items

## Troubleshooting

**Issues not auto-adding**:

- Check Workflows → Auto-add filter matches repository
- Manually add: Click issue → Projects → Select project

**Fields not populating from labels**:

- This is manual for now; set fields based on labels
- Future: Could create GitHub Action to sync label → field

**Views not filtering correctly**:

- Double-check filter syntax: `Lifecycle:Active OR Lifecycle:Backlog`
- Ensure field values match exactly (case-sensitive)

**Automation not working**:

- Verify workflows are enabled in project settings
- Some features may require GitHub Projects beta enrollment

## CLI Reference

```bash
# List projects
gh project list --owner @me

# View project items
gh project item-list PROJECT_NUMBER

# Add issue to project
gh project item-add PROJECT_NUMBER --owner mikiwiik --url ISSUE_URL

# Close issue (triggers automation)
gh issue close ISSUE_NUMBER

# View project in browser
gh project view PROJECT_NUMBER --web
```

## Next Steps

After setup:

1. Use project daily for 2-3 months
2. Evaluate effectiveness vs. overhead
3. Document lessons learned
4. Decide on full adoption or rollback

See [ADR-020](../adr/020-github-projects-adoption.md) for success criteria and evaluation plan.
