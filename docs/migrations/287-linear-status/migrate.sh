#!/usr/bin/env bash
#
# Migration Script: Dual-Field to Linear Status
#
# Migrates all GitHub Projects issues from the dual-field system
# (Status + Lifecycle) to a single linear Status field.
#
# PREREQUISITES:
# 1. Status field must have options: Icebox, Backlog, In Progress, Done
# 2. Backup exists: docs/migrations/287-linear-status/backup.json
# 3. gh CLI authenticated with project scope
#
# Usage: ./docs/migrations/287-linear-status/migrate.sh [--dry-run]
#

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NUMBER=1
OWNER="mikiwiik"
BACKUP_FILE="docs/migrations/287-linear-status/backup.json"
DRY_RUN=false

# Check for --dry-run flag
if [[ "${1:-}" == "--dry-run" ]]; then
    DRY_RUN=true
    echo -e "${YELLOW}🔍 DRY RUN MODE - No changes will be made${NC}\n"
fi

# Verify backup file exists
if [[ ! -f "$BACKUP_FILE" ]]; then
    echo -e "${RED}❌ Backup file not found: $BACKUP_FILE${NC}"
    exit 1
fi

# Get project ID
echo -e "${BLUE}ℹ${NC} Finding GitHub Project..."
PROJECT_ID=$(gh project list --owner "$OWNER" --format json | jq -r --arg num "$PROJECT_NUMBER" '.projects[] | select(.number == ($num | tonumber)) | .id')

if [[ -z "$PROJECT_ID" ]]; then
    echo -e "${RED}❌ Could not find project #$PROJECT_NUMBER${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Found project ID: $PROJECT_ID\n"

# Get Status field ID
echo -e "${BLUE}ℹ${NC} Resolving Status field ID..."
STATUS_FIELD_ID=$(gh project field-list "$PROJECT_NUMBER" --owner "$OWNER" --format json | jq -r '.fields[] | select(.name == "Status") | .id')

if [[ -z "$STATUS_FIELD_ID" ]]; then
    echo -e "${RED}❌ Could not find Status field${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Status field ID: $STATUS_FIELD_ID\n"

# Get Status field option IDs
echo -e "${BLUE}ℹ${NC} Resolving Status option IDs..."
ICEBOX_ID=$(gh project field-list "$PROJECT_NUMBER" --owner "$OWNER" --format json | jq -r '.fields[] | select(.name == "Status") | .options[] | select(.name == "Icebox") | .id')
BACKLOG_ID=$(gh project field-list "$PROJECT_NUMBER" --owner "$OWNER" --format json | jq -r '.fields[] | select(.name == "Status") | .options[] | select(.name == "Backlog") | .id')
IN_PROGRESS_ID=$(gh project field-list "$PROJECT_NUMBER" --owner "$OWNER" --format json | jq -r '.fields[] | select(.name == "Status") | .options[] | select(.name == "In Progress") | .id')
DONE_ID=$(gh project field-list "$PROJECT_NUMBER" --owner "$OWNER" --format json | jq -r '.fields[] | select(.name == "Status") | .options[] | select(.name == "Done") | .id')

if [[ -z "$ICEBOX_ID" ]] || [[ -z "$BACKLOG_ID" ]]; then
    echo -e "${RED}❌ Status field missing required options (Icebox or Backlog)${NC}"
    echo -e "${YELLOW}Please add these options to the Status field in GitHub Projects UI first${NC}"
    echo -e "${YELLOW}See: docs/migrations/287-linear-status/README.md${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Icebox ID: $ICEBOX_ID"
echo -e "${GREEN}✓${NC} Backlog ID: $BACKLOG_ID"
echo -e "${GREEN}✓${NC} In Progress ID: $IN_PROGRESS_ID"
echo -e "${GREEN}✓${NC} Done ID: $DONE_ID\n"

# Migration mapping function
get_new_status() {
    local lifecycle="$1"
    local current_status="$2"

    # Migration logic based on issue #287 specification
    case "${lifecycle}|${current_status}" in
        "Icebox|none"|"Icebox|")
            echo "Icebox|$ICEBOX_ID"
            ;;
        "Backlog|none"|"Backlog|"|"Backlog|Todo")
            echo "Backlog|$BACKLOG_ID"
            ;;
        "Active|In Progress")
            echo "In Progress|$IN_PROGRESS_ID"
            ;;
        "Active|none"|"Active|")
            # Edge case: Active but no status -> move to Backlog
            echo "Backlog|$BACKLOG_ID"
            ;;
        "Active|Done"|"Done|Done")
            echo "Done|$DONE_ID"
            ;;
        "none|none"|"none|"|"|none"|"|")
            # Newly created issues without triage -> Icebox
            echo "Icebox|$ICEBOX_ID"
            ;;
        *)
            # Unknown combination - default to Backlog
            echo "Backlog|$BACKLOG_ID"
            ;;
    esac
}

# Process each issue
echo -e "${BLUE}ℹ${NC} Processing issues from backup...\n"

TOTAL=0
SUCCESS=0
SKIPPED=0
FAILED=0

while IFS=$'\t' read -r issue_number lifecycle current_status item_id; do
    TOTAL=$((TOTAL + 1))

    # Get new status mapping
    new_status_mapping=$(get_new_status "$lifecycle" "$current_status")
    new_status_name=$(echo "$new_status_mapping" | cut -d'|' -f1)
    new_status_id=$(echo "$new_status_mapping" | cut -d'|' -f2)

    # Skip if already has correct status
    if [[ "$current_status" == "$new_status_name" ]]; then
        echo -e "${YELLOW}⏭${NC}  Issue #$issue_number: Already '$new_status_name' - skipping"
        SKIPPED=$((SKIPPED + 1))
        continue
    fi

    echo -e "${BLUE}🔄${NC} Issue #$issue_number: '$lifecycle' + '$current_status' → '$new_status_name'"

    if [[ "$DRY_RUN" == true ]]; then
        echo -e "   ${YELLOW}[DRY RUN]${NC} Would update to: $new_status_name"
        SUCCESS=$((SUCCESS + 1))
    else
        # Update the issue
        if gh project item-edit --project-id "$PROJECT_ID" --id "$item_id" --field-id "$STATUS_FIELD_ID" --single-select-option-id "$new_status_id" 2>&1; then
            echo -e "   ${GREEN}✓${NC} Updated to: $new_status_name"
            SUCCESS=$((SUCCESS + 1))
        else
            echo -e "   ${RED}✗${NC} Failed to update issue #$issue_number"
            FAILED=$((FAILED + 1))
        fi
    fi

done < <(jq -r '.items[] | "\(.content.number)\t\(.lifecycle // "none")\t\(.status // "none")\t\(.id)"' "$BACKUP_FILE")

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}Migration Summary${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "Total issues:    $TOTAL"
echo -e "${GREEN}✓${NC} Migrated:      $SUCCESS"
echo -e "${YELLOW}⏭${NC} Skipped:       $SKIPPED"
echo -e "${RED}✗${NC} Failed:        $FAILED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [[ "$DRY_RUN" == true ]]; then
    echo -e "\n${YELLOW}This was a dry run. No changes were made.${NC}"
    echo -e "Run without --dry-run to apply changes."
fi

if [[ $FAILED -gt 0 ]]; then
    exit 1
fi
