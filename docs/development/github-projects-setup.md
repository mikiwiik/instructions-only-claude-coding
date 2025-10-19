# GitHub Projects Setup Guide

This guide provides step-by-step instructions for setting up GitHub Projects for the Todo App project.

**📋 Context**: See [ADR-020: GitHub Projects Adoption](../adr/020-github-projects-adoption.md) for decision rationale.

**📖 Usage**: See [Project Management Documentation](project-management.md#github-projects-integration) for daily
workflow and best practices.

## Overview

This setup combines **automated CLI steps** (project/field creation) with **manual web UI configuration**
(views/automation) due to GitHub Projects v2 API limitations.

**What can be automated**: Project creation, custom fields, bulk issue addition

**What requires web UI**: Views, filters, sorting, automation workflows

> **Note**: GitHub Projects v2 GraphQL API and `gh` CLI do not currently support programmatic view creation
> or automation workflow configuration. These features are only available via the web interface.

## Prerequisites

- Repository admin access to create projects
- GitHub CLI with project scope permissions

### Authenticate GitHub CLI

```bash
# Add project scope to GitHub CLI (for mikiwiik-agent)
gh auth refresh --hostname github.com --scopes project
```

### Role-Based Access Control

GitHub Projects supports three roles with different permission levels:

| Role      | View | Edit Items/Fields | Manage Collaborators | Use Case                 |
| --------- | ---- | ----------------- | -------------------- | ------------------------ |
| **Read**  | ✅   | ❌                | ❌                   | Observers                |
| **Write** | ✅   | ✅                | ❌                   | **Agents** (recommended) |
| **Admin** | ✅   | ✅                | ✅                   | **Humans** (owners)      |

### Recommended Role Assignments

**Human Users** (`mikiwiik`):

- **Role**: Admin
- **Capabilities**: Create project, configure views, manage collaborators, plan priorities
- **Rationale**: Full control for project ownership and strategic management

**Agent Users** (`mikiwiik-agent`):

- **Role**: Write
- **Capabilities**: Read issue states, update project fields, create/close issues
- **Rationale**: Sufficient for execution tasks without access to permission management
- **Principle**: Least privilege - agent can execute work but can't modify access control

### Setting Up Agent Permissions

#### Step 1: Verify Repository Access

Ensure `mikiwiik-agent` has repository write access (for issue operations):

```bash
# Check current collaborators
gh api /repos/mikiwiik/instructions-only-claude-coding/collaborators --jq '.[].login'
```

#### Step 2: Grant Project Access

After creating the project (Step 1 below), grant Write access to `mikiwiik-agent`:

1. Navigate to project settings: `gh project view $PROJECT_NUMBER --owner mikiwiik --web`
2. Go to **Settings** → **Manage access**
3. Click **Invite collaborators**
4. Add `mikiwiik-agent` with **Write** role
5. Save changes

#### Step 3: Verify Agent Permissions

```bash
# Agent should be able to list projects (as collaborator)
gh project list --owner mikiwiik

# Agent should be able to view project items
gh project item-list $PROJECT_NUMBER --owner mikiwiik
```

### Understanding `--owner` Flag

**Important**: The `--owner mikiwiik` flag means "manage projects owned by mikiwiik" - it does NOT change who
executes the command. When `mikiwiik-agent` runs these commands:

- `--owner mikiwiik` = "manage mikiwiik's projects"
- Agent operates as a **collaborator with Write role**
- Project ownership remains with `mikiwiik`
- Agent can read/update but cannot manage access control

## Part 1: Automated Setup (CLI)

### Step 1: Create Project

```bash
# Create new project (save the project number from output)
gh project create \
  --owner mikiwiik \
  --title "Todo App Project Management" \
  --format json | tee project-output.json

# Extract project number for subsequent commands
PROJECT_NUMBER=$(cat project-output.json | jq -r '.number')
echo "Project number: $PROJECT_NUMBER"
```

### Step 2: Create Custom Fields

```bash
# Create Priority field
gh project field-create $PROJECT_NUMBER \
  --owner mikiwiik \
  --name "Priority" \
  --data-type "SINGLE_SELECT" \
  --single-select-options "Critical,High,Medium,Low"

# Create Complexity field
gh project field-create $PROJECT_NUMBER \
  --owner mikiwiik \
  --name "Complexity" \
  --data-type "SINGLE_SELECT" \
  --single-select-options "Minimal,Simple,Moderate,Complex,Epic"

# Create Category field
gh project field-create $PROJECT_NUMBER \
  --owner mikiwiik \
  --name "Category" \
  --data-type "SINGLE_SELECT" \
  --single-select-options "Feature,Infrastructure,Documentation,DX"

# Create Lifecycle field
gh project field-create $PROJECT_NUMBER \
  --owner mikiwiik \
  --name "Lifecycle" \
  --data-type "SINGLE_SELECT" \
  --single-select-options "Icebox,Backlog,Active,Done"
```

**Note**: The default "Status" field is created automatically with the project.

### Step 3: Configure Default Status Field

The Status field is created automatically but may need option customization:

1. Navigate to project: `gh project view $PROJECT_NUMBER --web`
2. Click Status field → Edit field
3. Ensure options: `Todo`, `In Progress`, `Review`, `Testing`, `Done`, `Blocked`
4. Add any missing options

### Step 4: Bulk Add Existing Issues

```bash
# Add all open issues to project
gh issue list \
  --repo mikiwiik/instructions-only-claude-coding \
  --limit 1000 \
  --json url \
  --jq '.[] | .url' | \
  xargs -I {} gh project item-add $PROJECT_NUMBER --owner mikiwiik --url {}
```

### Step 5: Link Project to Repository

```bash
# Link project to repository for better integration
gh project link $PROJECT_NUMBER \
  --owner mikiwiik \
  --repo mikiwiik/instructions-only-claude-coding
```

## Part 2: Manual Configuration (Web UI)

The following steps **cannot be automated** with CLI or API and require web UI configuration.

### Step 6: Create Project Views

**Why manual?** GitHub Projects v2 API does not support view creation or configuration.

Navigate to project: `gh project view $PROJECT_NUMBER --web`

#### View 1: Board - Workflow (Modify Default)

1. Find default "Board" view
2. Click view menu → Settings (gear icon)
3. Configure:
   - **Layout**: Board
   - **Group by**: Status
   - **Column grouping**: Priority (swimlanes)
   - **Filter**: `Lifecycle:Active OR Lifecycle:Backlog`
4. Click Save

#### View 2: Backlog - Next Issue

1. Click **+ New view**
2. Name: `Backlog - Next Issue`
3. Configure:
   - **Layout**: Table
   - **Columns**: Title, Priority, Complexity, Category, Status, Lifecycle
   - **Sort**: Priority (Critical → Low), then Complexity (Minimal → Epic)
   - **Filter**: `Lifecycle:Active OR Lifecycle:Backlog`
4. Click Save

#### View 3: Quick Wins - High Priority + Simple

1. Click **+ New view**
2. Name: `Quick Wins - High Priority + Simple`
3. Configure:
   - **Layout**: Board
   - **Group by**: Status
   - **Filter**: `Priority:High AND (Complexity:Simple OR Complexity:Minimal) AND Lifecycle:Active`
4. Click Save

#### View 4: Agent Workload - Current Work

1. Click **+ New view**
2. Name: `Agent Workload - Current Work`
3. Configure:
   - **Layout**: Board
   - **Group by**: Status
   - **Filter**: `Lifecycle:Active`
4. Click Save

**Optional Agent Field**: If you want agent-specific grouping:

- Create Agent field:
  `gh project field-create $PROJECT_NUMBER --owner mikiwiik --name "Agent" --data-type "SINGLE_SELECT"
--single-select-options "Frontend,Testing,QA,Documentation,Multiple,None"`
- Then change "Group by" to Agent in View 4 settings

#### View 5: Icebox - Raw Ideas

1. Click **+ New view**
2. Name: `Icebox - Raw Ideas`
3. Configure:
   - **Layout**: Table or Board (your preference)
   - **Filter**: `Lifecycle:Icebox`
   - **Columns** (if Table): Title, Priority (optional), Complexity (optional)
4. Click Save

### Step 7: Configure Automation Workflows

**Why manual?** GitHub Projects v2 automation workflows are only configurable via web UI.

In project settings (three dots menu → Workflows):

#### Auto-Add Workflow

1. Find **Auto-add to project** workflow (standalone workflow)
2. Enable the workflow
3. Set filter: `repo:mikiwiik/instructions-only-claude-coding is:issue is:open`
4. This automatically adds all new and existing open issues

#### Item Closed Workflow

1. Find **Item closed** workflow
2. Enable **Set status**
3. When: `Item closed`
4. Set: `Status = Done`, `Lifecycle = Done`

**Note**: GitHub Projects also has a separate **Auto-archive items** workflow if you want items to be archived
automatically after closing (not configured by default).

#### PR Merge Workflow (if available)

1. Find **Pull request merged** workflow
2. Enable **Set field values**
3. When: `Pull request merged and linked issue`
4. Set: `Status = Done`

**Note**: Some automation workflows may require GitHub Projects beta features or may vary based on your GitHub plan.

## Part 3: Initial Population and Triage

### Step 8: Triage Issues to Lifecycle Stages

Go through each issue and set Lifecycle field based on readiness:

**Icebox** 🧊 - For issues that are:

- Rough ideas without clear requirements
- Need research or exploration
- "Nice to have someday" without immediate plan
- Unclear scope or approach

**Backlog** 📋 - For issues that are:

- Well-defined with clear requirements
- Have proper priority and complexity labels
- Ready for implementation, but not immediate
- Have dependency or sequencing considerations

**Active** ⚡ - For issues that are:

- Currently being worked on (1-2 issues max)
- Next up based on priority
- High priority and ready to start
- Block other work

**Done** ✅ - For issues that are:

- Only for closed/completed issues
- Usually auto-set by automation

**Triage Checklist**:

- [ ] Review all issues in project
- [ ] Set Lifecycle for each issue
- [ ] Verify high-priority issues are in Active
- [ ] Ensure 1-2 issues max in Active with Status "In Progress"
- [ ] Move unclear/exploratory issues to Icebox
- [ ] Ensure Backlog issues have proper labels

### Step 9: Populate Custom Fields from Labels

For each issue with Lifecycle `Active` or `Backlog`, set custom fields based on labels:

**Priority field** (from `priority-*` labels):

- `priority-1-critical` → `Critical`
- `priority-2-high` → `High`
- `priority-3-medium` → `Medium`
- `priority-4-low` → `Low`

**Complexity field** (from `complexity-*` labels):

- `complexity-minimal` → `Minimal`
- `complexity-simple` → `Simple`
- `complexity-moderate` → `Moderate`
- `complexity-complex` → `Complex`
- `complexity-epic` → `Epic`

**Category field** (from `category-*` labels):

- `category-feature` → `Feature`
- `category-infrastructure` → `Infrastructure`
- `category-documentation` → `Documentation`
- `category-dx` → `DX`

**Status field** (based on current work state):

- Not started → `Todo`
- Currently working → `In Progress`
- Awaiting review → `Review`
- In testing → `Testing`
- Blocked → `Blocked`

**Note**: Icebox issues can skip Priority/Complexity if not yet defined.

## Verification

### Test Views

Navigate through each view and verify:

- [ ] **Board - Workflow**: Shows Active/Backlog issues grouped by Priority
- [ ] **Backlog - Next Issue**: Table sorted by Priority → Complexity
- [ ] **Quick Wins**: Filtered to high-priority + simple-complexity issues only
- [ ] **Agent Workload**: Shows Active issues
- [ ] **Icebox**: Shows only Icebox issues

### Test Automation

Create a test issue to verify automation:

```bash
gh issue create \
  --repo mikiwiik/instructions-only-claude-coding \
  --title "Test: GitHub Projects Automation" \
  --body "Testing auto-add to project and field population" \
  --label "priority-4-low,complexity-minimal,category-infrastructure"
```

Verify:

- [ ] Issue automatically added to project
- [ ] Appears in Backlog view
- [ ] Can manually set Lifecycle, Priority, Complexity, Category fields
- [ ] Closing issue sets Status and Lifecycle to Done

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

## CLI Reference

```bash
# List projects
gh project list --owner mikiwiik

# View project items
gh project item-list $PROJECT_NUMBER --owner mikiwiik

# Add issue to project (usually automated)
gh project item-add $PROJECT_NUMBER --owner mikiwiik --url ISSUE_URL

# Close issue (triggers automation)
gh issue close ISSUE_NUMBER --repo mikiwiik/instructions-only-claude-coding

# View project in browser
gh project view $PROJECT_NUMBER --owner mikiwiik --web
```

## Troubleshooting

**Issues not auto-adding**:

- Check Workflows → Auto-add filter matches repository
- Manually add: `gh project item-add $PROJECT_NUMBER --owner mikiwiik --url ISSUE_URL`

**Fields not populating from labels**:

- This is manual for now; set fields based on labels in web UI
- Future: Could create GitHub Action to sync label → field

**Views not filtering correctly**:

- Double-check filter syntax: `Lifecycle:Active OR Lifecycle:Backlog`
- Ensure field values match exactly (case-sensitive)

**Automation not working**:

- Verify workflows are enabled in project settings
- Some features may require GitHub Projects beta enrollment

## Next Steps

After setup:

1. Use project daily for 2-3 months (pilot period)
2. Evaluate effectiveness vs. overhead
3. Document lessons learned
4. Decide on full adoption or rollback per [ADR-020](../adr/020-github-projects-adoption.md)
