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

## Labels vs Custom Fields: Core Principles

**Understanding the distinction between labels and custom fields is essential for effective GitHub Projects usage.**

### Labels (Atomic, Issue-Specific, Not Time-Bound)

Labels describe **what the issue is** - intrinsic properties that belong to the issue itself:

- **Priority** (priority-1-critical through priority-4-low): Issue importance
- **Complexity** (complexity-minimal through complexity-epic): Implementation effort
- **Category** (category-feature, category-infrastructure, etc.): Work type

**Key characteristics**:

- ✅ **Atomic data**: Belong to issues, not projects
- ✅ **Universal compatibility**: Work everywhere (CLI, GitHub Actions, all projects, issue views)
- ✅ **Not time-bound**: Don't change based on workflow progression
- ✅ **No sync needed**: Single source of truth, auto-visible in Projects via Labels field

### Custom Fields (Workflow State, Time-Bound)

Custom fields describe **where the issue is** in the development workflow - transient state that changes over time:

- **Status** (Todo → In Progress → Review → Testing → Done → Blocked): Current work state
- **Lifecycle** (Icebox → Backlog → Active → Done): Idea maturity stage

**Key characteristics**:

- ⚙️ **Project-specific**: Belong to project items, not issues themselves
- ⚙️ **Workflow tracking**: Change as work progresses
- ⚙️ **Time-bound**: Reflect current state, not intrinsic properties
- ⚙️ **Manual updates**: Require updates during workflow progression

### Why This Matters

**Labels as atomic data**:

- No duplication across projects
- Zero synchronization burden
- Compatible with all GitHub workflows (CLI, Actions, automations)
- Aligns with instruction-only philosophy (no manual sync required)

**Custom fields for workflow**:

- Visual kanban workflow management
- Idea maturity tracking (Icebox → Backlog → Active)
- Work-in-progress visualization
- Workflow automation triggers

See [ADR-020](../adr/020-github-projects-adoption.md#update-labels-only-architecture-2025-10-19) for
architectural decision rationale.

## Prerequisites

- Repository admin access to create projects
- GitHub CLI with project scope permissions

### Authenticate GitHub CLI

```bash
# Add project scope to GitHub CLI (for mikiwiik-agent)
gh auth refresh --hostname github.com --scopes project
```

### Project Scope Security Model

#### Understanding OAuth Scope vs. Project Access

The `project` scope grants the **capability** to interact with GitHub Projects API, but does **not** grant automatic
access to any projects. This is a critical security distinction:

#### What the scope does

- ✅ Enables `gh project` CLI commands
- ✅ Allows API calls to Projects v2 endpoints
- ✅ Grants technical capability to read/write project data

#### What the scope does NOT do

- ❌ Does not grant access to any specific projects
- ❌ Does not bypass project collaborator requirements
- ❌ Does not allow viewing/editing projects without explicit invitation

#### Security Principle: Scope = Capability, Invitation = Access

- The `project` scope is like having a key that can unlock doors (capability)
- The project invitation determines which doors you're allowed to unlock (access)
- Without explicit per-project invitation, the agent **cannot** access any project data

#### Security Benefits

- **Least Privilege**: Agent cannot access projects it hasn't been explicitly invited to
- **Audit Trail**: All project access requires explicit collaborator invitations
- **Multi-Project Isolation**: Agent can only interact with projects where it has Write role
- **Security by Design**: OAuth scope alone provides zero project visibility

#### Practical Example

```bash
# After running gh auth refresh with project scope:
gh project list --owner someuser  # ❌ Fails - agent not invited to their projects
gh project list --owner mikiwiik  # ✅ Works - agent invited as Write collaborator
```

#### Next Step

After adding the `project` scope, you **must** explicitly invite `mikiwiik-agent` as a Write
collaborator to each project (see Step 2 below).

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
# Create Lifecycle field
gh project field-create $PROJECT_NUMBER \
  --owner mikiwiik \
  --name "Lifecycle" \
  --data-type "SINGLE_SELECT" \
  --single-select-options "Icebox,Backlog,Active,Done"
```

**Note**: The default "Status" field is created automatically with the project.

**Why only Lifecycle?** We use the built-in **Labels** field for Priority, Complexity, and Category to maintain
labels as the single source of truth and avoid data duplication. See
[ADR-020](../adr/020-github-projects-adoption.md#update-labels-only-architecture-2025-10-19) for rationale.

#### Why These Two Custom Fields Are Required

**Status and Lifecycle track workflow state - they cannot be replaced by labels.**

**Status** (built-in field):

- **What it tracks**: Current work state (Todo → In Progress → Review → Testing → Done → Blocked)
- **Why it's needed**: Visualizes where issues are in the development workflow
- **Why not a label**: Changes frequently as work progresses (time-bound, project-specific)
- **Example**: Issue moves from "In Progress" to "Review" when PR created

**Lifecycle** (custom field):

- **What it tracks**: Idea maturity stage (Icebox → Backlog → Active → Done)
- **Why it's needed**: Manages issue readiness and work-in-progress limits
- **Why not a label**: Reflects current planning state, not issue properties
- **Example**: Raw idea starts in "Icebox", moves to "Backlog" after triage with proper labels

**Why NOT create Priority/Complexity/Category custom fields:**

- These are **intrinsic properties** of the issue (what it IS, not where it IS)
- Already exist as **issue labels** (priority-2-high, complexity-moderate, category-feature)
- Built-in **Labels field** displays them automatically in all project views
- Creating custom fields would **duplicate data** and require synchronization
- Labels are **atomic data** - belong to issues, work everywhere (CLI, Actions, all projects)

**Key Principle**: Custom fields for **workflow state** (changes over time), labels for **issue properties**
(don't change based on workflow).

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
   - **Filter**: `label:priority-1-critical,priority-2-high Lifecycle:Active,Backlog`
4. Click Save

**Note**: We filter to show only high-priority and critical issues. Adjust the label filter to match your workflow
needs. Labels don't support column grouping, so we group by Status only.

#### View 2: Backlog - Next Issue

1. Click **+ New view**
2. Name: `Backlog - Next Issue`
3. Configure:
   - **Layout**: Table
   - **Columns**: Title, Labels, Status, Lifecycle, Assignees
   - **Filter**: `Lifecycle:Active,Backlog`
4. Click Save

**Note**: The Labels column shows priority/complexity/category labels. GitHub Projects cannot sort by labels, so use
visual scanning or the `/select-next-issue` command for priority-based selection.

#### View 3: Quick Wins - High Priority + Simple

1. Click **+ New view**
2. Name: `Quick Wins - High Priority + Simple`
3. Configure:
   - **Layout**: Board
   - **Group by**: Status
   - **Filter**: `label:priority-2-high label:complexity-simple,complexity-minimal Lifecycle:Active`
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
   - **Columns** (if Table): Title, Labels, Status, Lifecycle
4. Click Save

**Note**: Icebox issues may not have priority/complexity labels yet - that's expected for raw ideas.

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

### Step 9: Populate Workflow Fields

For each issue with Lifecycle `Active` or `Backlog`, set workflow fields based on current state:

**Status field** (based on current work state):

- Not started → `Todo`
- Currently working → `In Progress`
- Awaiting review → `Review`
- In testing → `Testing`
- Blocked → `Blocked`

**Lifecycle field** (already set in Step 8)

**Note**: Priority, Complexity, and Category are managed via issue labels and automatically visible in the Labels
column. No manual field population needed - labels provide the source of truth.

## Verification

### Test Views

Navigate through each view and verify:

- [ ] **Board - Workflow**: Shows Active/Backlog issues with high-priority filter
- [ ] **Backlog - Next Issue**: Table showing all Active/Backlog issues with Labels column
- [ ] **Quick Wins**: Filtered to high-priority + simple-complexity issues only
- [ ] **Agent Workload**: Shows Active issues
- [ ] **Icebox**: Shows only Icebox issues

### Test Automation

Create a test issue to verify automation:

```bash
gh issue create \
  --repo mikiwiik/instructions-only-claude-coding \
  --title "Test: GitHub Projects Automation" \
  --body "Testing auto-add to project and label visibility" \
  --label "priority-4-low,complexity-minimal,category-infrastructure"
```

Verify:

- [ ] Issue automatically added to project
- [ ] Appears in Backlog view
- [ ] Labels visible in Labels column
- [ ] Can manually set Lifecycle and Status fields
- [ ] Closing issue sets Status and Lifecycle to Done

## Daily Workflow Quick Reference

**Morning**:

1. Open Board view → Check "In Progress" column
2. Continue current work or move to Done

**Selecting Next Work**:

1. Open Backlog view → Review labels column for priority/complexity
2. Or check Quick Wins view for momentum opportunities
3. Or use `/select-next-issue` command for priority-based selection
4. Select next issue, set Lifecycle:Active, Status:In Progress

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

- Priority, Complexity, and Category are now read directly from issue labels (no custom fields)
- Use the Labels column in table views to see all label values
- Status and Lifecycle are the only custom fields requiring manual updates

**Views not filtering correctly**:

- Double-check filter syntax: `Lifecycle:Active,Backlog`
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
