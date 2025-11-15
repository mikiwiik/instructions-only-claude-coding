# GitHub Projects Migration: Dual-Field to Linear Status

**Issue**: #287
**Date**: 2024-11-14
**Backup**: `docs/migrations/287-linear-status/backup.json` (66 issues)

---

## Overview

Migrates GitHub Projects from a dual-field system (Status + Lifecycle) to a single
linear Status field based on actual usage analysis showing 96% field synchronization.

**Estimated Time**: 30-45 minutes
**Rollback Available**: Yes (see section below)

---

## Quick Start Checklist

- [ ] **Step 1**: Add Icebox & Backlog to Status field (5 min)
- [ ] **Step 2**: Run migration script with --dry-run (2 min)
- [ ] **Step 3**: Execute migration (2 min)
- [ ] **Step 4**: Update 5 project views (10 min)
- [ ] **Step 5**: Update 3 automation workflows (5 min)
- [ ] **Step 6**: Verify migration success (5 min)
- [ ] **Step 7**: Delete Lifecycle field (1 min)
- [ ] **Step 8**: Remove deprecated Todo status option (2 min)

---

## Step 1: Add Status Field Options

**URL**: <https://github.com/users/mikiwiik/projects/1/settings/fields>

### Actions Required

1. Navigate to Project Settings → Fields
2. Find "Status" field → Click "..." menu → "Edit field"
3. Add new options:
   - Click "+ Add option" → Name: **Icebox** → Color: Gray/Light Blue
   - Click "+ Add option" → Name: **Backlog** → Color: Yellow/Orange
4. Click "Save changes"

### Verification

Run this command to confirm:

```bash
gh project field-list 1 --owner mikiwiik --format json | \
  jq -r '.fields[] | select(.name == "Status") | .options[] | .name'
```

**Expected output**:

```text
Todo
In Progress
Done
Icebox
Backlog
```

---

## Step 2: Test Migration (Dry Run)

Run the migration script in dry-run mode to preview changes:

```bash
./docs/migrations/287-linear-status/migrate.sh --dry-run
```

### Expected Output

```text
✓ Found project ID: PVT_kwHOABVon84BF52z
✓ Status field ID: PVTSSF_lAHOABVon84BF52zzg3GwCs
✓ Icebox ID: [hash]
✓ Backlog ID: [hash]
✓ In Progress ID: [hash]
✓ Done ID: [hash]

🔄 Issue #287: 'Active' + 'In Progress' → 'In Progress'
   [DRY RUN] Would update to: In Progress
...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Migration Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total issues:    66
✓ Migrated:      ~60
⏭ Skipped:       ~5
✗ Failed:        0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Step 3: Execute Migration

If dry run looks correct, execute the migration:

```bash
./docs/migrations/287-linear-status/migrate.sh
```

### Migration Mapping

| Current (Lifecycle + Status) | Count | → New Status |
| ---------------------------- | ----- | ------------ |
| Icebox + none                | 13    | Icebox       |
| Backlog + none               | 11    | Backlog      |
| Backlog + Todo               | 6     | Backlog      |
| Active + In Progress         | 3     | In Progress  |
| Active + Done                | 5     | Done         |
| Active + none                | 1     | Backlog      |
| Done + Done                  | 19    | Done         |
| none + none                  | 3     | Icebox       |

### Manual Verification

Check a few issues manually in GitHub Projects UI to confirm Status values are correct.

---

## Step 4: Update Project Views

**URL**: <https://github.com/users/mikiwiik/projects/1>

Update filters for all 5 views:

### View 1: "Board - Workflow"

- **Current filter**: `Lifecycle:Active,Backlog`
- **New filter**: `Status:Backlog,"In Progress"`

**Steps**:

1. Navigate to "Board - Workflow" view
2. Click filter icon (funnel)
3. Remove Lifecycle filter
4. Add Status filter → Select "Backlog" and "In Progress"
5. Save view

### View 2: "Backlog - Next Issue"

- **Current filter**: `Lifecycle:Active,Backlog`
- **New filter**: `Status:Backlog,"In Progress"`

**Steps**: Same as View 1

### View 3: "Quick Wins"

- **Current filter**: `Lifecycle:Active` + priority/complexity
- **New filter**: `Status:Backlog` + priority/complexity

**Steps**:

1. Navigate to "Quick Wins" view
2. Change Lifecycle:Active → Status:Backlog
3. Keep priority-2-high and complexity-simple filters

### View 4: "Agent Workload"

- **Current filter**: `Lifecycle:Active`
- **New filter**: `Status:"In Progress"`

### View 5: "Icebox - Raw Ideas"

- **Current filter**: `Lifecycle:Icebox`
- **New filter**: `Status:Icebox`

---

## Step 5: Update Automation Workflows

**URL**: <https://github.com/users/mikiwiik/projects/1/workflows>

Update 3 workflows:

### Workflow 1: "Item closed"

**Current**: Sets Status=Done AND Lifecycle=Done
**New**: Set Status=Done only

**Steps**:

1. Click "Item closed" workflow → "Edit"
2. Find action setting Lifecycle=Done → Delete it
3. Keep only: Status → Done
4. Save workflow

### Workflow 2: "Pull request merged"

**Current**: Sets Status=Done AND Lifecycle=Done
**New**: Set Status=Done only

**Steps**: Same as Workflow 1

### Workflow 3: "Auto-add to project"

**Current**: May set initial Lifecycle
**New**: Set Status=Icebox for new issues

**Steps**:

1. Click "Auto-add to project" → "Edit"
2. Remove Lifecycle default (if present)
3. Set Status → Icebox
4. Save workflow

---

## Step 6: Verify Migration Success

### Verification Checklist

- [ ] All 66 issues have Status values (no nulls)
- [ ] Check 5 random issues: Status matches expected mapping
- [ ] All 5 views display correct filtered issues
- [ ] Close a test issue → Verify Status=Done (automation test)
- [ ] Create test issue → Verify Status=Icebox (automation test)

### Verification Commands

```bash
# Count issues by Status
gh project item-list 1 --owner mikiwiik --format json | \
  jq -r '.items[].status' | sort | uniq -c

# List issues without Status (should be 0)
gh project item-list 1 --owner mikiwiik --format json | \
  jq -r '.items[] | select(.status == null or .status == "") | .content.number'
```

---

## Step 7: Delete Lifecycle Field

⚠️ **IMPORTANT**: Only proceed if verification passed!

**Pre-deletion checklist**:

- [ ] All verifications passed
- [ ] No issues have null Status
- [ ] Automation workflows tested
- [ ] Views display correctly

**Steps**:

1. Go to: <https://github.com/users/mikiwiik/projects/1/settings/fields>
2. Find "Lifecycle" custom field
3. Click "..." menu → "Delete field"
4. Confirm deletion (**irreversible**)

**Post-Deletion Verification**:

```bash
gh project field-list 1 --owner mikiwiik --format json | \
  jq -r '.fields[] | .name'
```

Should NOT include "Lifecycle".

---

## Step 8: Remove Deprecated "Todo" Status Option

⚠️ **IMPORTANT**: The old "Todo" status option is now redundant with "Backlog" and must be removed.

**Pre-deletion verification**:

```bash
# Verify NO issues still use "Todo" status
gh project item-list 1 --owner mikiwiik --format json | \
  jq -r '.items[] | select(.status == "Todo") | .content.number'
```

**Expected output**: Empty (no issue numbers)

If any issues still have "Todo" status, the migration script didn't run correctly. Re-run it.

**Steps to remove "Todo" option**:

1. Go to: <https://github.com/users/mikiwiik/projects/1/settings/fields>
2. Find "Status" field → Click "..." menu → "Edit field"
3. Find "Todo" option → Click "..." → "Delete option"
4. Confirm deletion

**Post-deletion verification**:

```bash
gh project field-list 1 --owner mikiwiik --format json | \
  jq -r '.fields[] | select(.name == "Status") | .options[] | .name'
```

**Expected output** (exactly 4 options):

```text
Icebox
Backlog
In Progress
Done
```

---

## Rollback Procedure

If critical issues discovered:

### 1. Recreate Lifecycle Field

- Project Settings → Fields → "Add field"
- Name: "Lifecycle"
- Type: Single select
- Options: Icebox, Backlog, Active, Done

### 2. Restore Dual-Field Values

Create rollback script based on backup:

```bash
# Pseudo-code - would need implementation
while read issue; do
  restore_lifecycle_from_backup "$issue"
done < docs/migrations/287-linear-status/backup.json
```

### 3. Restore View Filters

Change all Status filters back to Lifecycle filters (reverse of Step 4).

### 4. Restore Automation Workflows

Add Lifecycle field updates back to all workflows.

### 5. Document Rollback Reason

Create GitHub issue explaining what went wrong and why rollback was necessary.

---

## Post-Migration Notes

After successful migration and verification:

1. Helper script updated automatically (in PR)
2. Slash commands updated automatically (in PR)
3. Documentation updated automatically (in PR)
4. "Todo" status option removed (Step 8 above)
5. Optional: Archive this migration doc after 30 days

---

## Migration Mapping Logic

**Linear Progression Model**:

```text
Icebox → Backlog → In Progress → Done
```

**Rules**:

- Icebox + (any) → Icebox
- Backlog + (any except Done) → Backlog
- Active + In Progress → In Progress
- Active + Done → Done
- Active + (none) → Backlog (edge case)
- Done + Done → Done
- (none) + (none) → Icebox (new issues)

---

## Support

**Backup**: `docs/migrations/287-linear-status/backup.json`
**Script**: `docs/migrations/287-linear-status/migrate.sh`
**Issue**: #287
**ADR**: `docs/adr/024-github-projects-adoption.md`

For issues during migration, refer to backup file and use rollback procedure.
