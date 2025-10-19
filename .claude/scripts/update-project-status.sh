#!/bin/bash
# Update GitHub Projects Status and Lifecycle fields for an issue
# Usage: ./update-project-status.sh <issue-number> <status> <lifecycle>
# Example: ./update-project-status.sh 247 "In Progress" "Active"

set -euo pipefail

# Configuration
OWNER="mikiwiik"
REPO="instructions-only-claude-coding"

# Arguments
ISSUE_NUMBER="${1:-}"
STATUS="${2:-}"
LIFECYCLE="${3:-}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
log_info() { echo -e "${BLUE}ℹ ${NC}$1"; }
log_success() { echo -e "${GREEN}✓${NC} $1"; }
log_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
log_error() { echo -e "${RED}✗${NC} $1" >&2; }

# Validate arguments
if [[ -z "$ISSUE_NUMBER" || -z "$STATUS" || -z "$LIFECYCLE" ]]; then
    log_error "Usage: $0 <issue-number> <status> <lifecycle>"
    log_error "Example: $0 247 'In Progress' 'Active'"
    exit 1
fi

# Check for project scope
log_info "Checking GitHub CLI authentication..."
if ! gh auth status 2>&1 | grep -q "project"; then
    log_error "Missing required 'project' scope for GitHub CLI"
    log_error "Run: gh auth refresh --hostname github.com --scopes project"
    log_error "Then ask repository owner to invite you as a Write collaborator to the project"
    exit 1
fi
log_success "GitHub CLI has project scope"

# Get project number
log_info "Finding GitHub Project..."
PROJECT_DATA=$(gh project list --owner "$OWNER" --format json 2>&1) || {
    log_error "Failed to list projects. Ensure you have project scope and Write collaborator access."
    log_error "Run: gh project view <PROJECT_NUMBER> --owner $OWNER --web"
    log_error "Then go to Settings → Manage access → Invite collaborators"
    exit 1
}

PROJECT_NUMBER=$(echo "$PROJECT_DATA" | jq -r '.[0].number // empty')
if [[ -z "$PROJECT_NUMBER" ]]; then
    log_error "No projects found for owner: $OWNER"
    log_error "Ensure GitHub Projects is set up and you have collaborator access"
    exit 1
fi
log_success "Found project #$PROJECT_NUMBER"

# Get project ID (needed for item-edit command)
PROJECT_ID=$(echo "$PROJECT_DATA" | jq -r '.[0].id')
log_info "Project ID: $PROJECT_ID"

# Get field IDs for Status and Lifecycle
log_info "Resolving field IDs..."
FIELDS_DATA=$(gh project field-list "$PROJECT_NUMBER" --owner "$OWNER" --format json 2>&1) || {
    log_error "Failed to list project fields"
    exit 1
}

STATUS_FIELD_ID=$(echo "$FIELDS_DATA" | jq -r '.fields[] | select(.name == "Status") | .id // empty')
LIFECYCLE_FIELD_ID=$(echo "$FIELDS_DATA" | jq -r '.fields[] | select(.name == "Lifecycle") | .id // empty')

if [[ -z "$STATUS_FIELD_ID" ]]; then
    log_error "Status field not found in project"
    exit 1
fi

if [[ -z "$LIFECYCLE_FIELD_ID" ]]; then
    log_error "Lifecycle field not found in project"
    exit 1
fi

log_success "Status field ID: $STATUS_FIELD_ID"
log_success "Lifecycle field ID: $LIFECYCLE_FIELD_ID"

# Get option IDs for the provided values
log_info "Resolving field option IDs..."
STATUS_OPTIONS=$(echo "$FIELDS_DATA" | jq -r --arg name "Status" '.fields[] | select(.name == $name) | .options[]')
LIFECYCLE_OPTIONS=$(echo "$FIELDS_DATA" | jq -r --arg name "Lifecycle" '.fields[] | select(.name == $name) | .options[]')

STATUS_OPTION_ID=$(echo "$STATUS_OPTIONS" | jq -r --arg val "$STATUS" 'select(.name == $val) | .id // empty')
LIFECYCLE_OPTION_ID=$(echo "$LIFECYCLE_OPTIONS" | jq -r --arg val "$LIFECYCLE" 'select(.name == $val) | .id // empty')

if [[ -z "$STATUS_OPTION_ID" ]]; then
    log_error "Status option '$STATUS' not found in project"
    log_error "Available options:"
    echo "$STATUS_OPTIONS" | jq -r '.name' | sed 's/^/  - /'
    exit 1
fi

if [[ -z "$LIFECYCLE_OPTION_ID" ]]; then
    log_error "Lifecycle option '$LIFECYCLE' not found in project"
    log_error "Available options:"
    echo "$LIFECYCLE_OPTIONS" | jq -r '.name' | sed 's/^/  - /'
    exit 1
fi

log_success "Status option '$STATUS' ID: $STATUS_OPTION_ID"
log_success "Lifecycle option '$LIFECYCLE' ID: $LIFECYCLE_OPTION_ID"

# Get issue URL
ISSUE_URL="https://github.com/$OWNER/$REPO/issues/$ISSUE_NUMBER"
log_info "Issue URL: $ISSUE_URL"

# Find item ID for the issue in the project
log_info "Finding issue in project..."
ITEMS_DATA=$(gh project item-list "$PROJECT_NUMBER" --owner "$OWNER" --format json --limit 1000 2>&1) || {
    log_error "Failed to list project items"
    exit 1
}

ITEM_ID=$(echo "$ITEMS_DATA" | jq -r --arg url "$ISSUE_URL" '.items[] | select(.content.url == $url) | .id // empty')

# If issue not in project, add it first
if [[ -z "$ITEM_ID" ]]; then
    log_warning "Issue #$ISSUE_NUMBER not found in project, adding it..."
    ADD_RESULT=$(gh project item-add "$PROJECT_NUMBER" --owner "$OWNER" --url "$ISSUE_URL" --format json 2>&1) || {
        log_error "Failed to add issue to project"
        exit 1
    }
    ITEM_ID=$(echo "$ADD_RESULT" | jq -r '.id // empty')
    if [[ -z "$ITEM_ID" ]]; then
        log_error "Failed to get item ID after adding issue"
        exit 1
    fi
    log_success "Added issue #$ISSUE_NUMBER to project (Item ID: $ITEM_ID)"
else
    log_success "Found issue in project (Item ID: $ITEM_ID)"
fi

# Update Status field
log_info "Updating Status to '$STATUS'..."
gh project item-edit \
    --project-id "$PROJECT_ID" \
    --id "$ITEM_ID" \
    --field-id "$STATUS_FIELD_ID" \
    --single-select-option-id "$STATUS_OPTION_ID" > /dev/null 2>&1 || {
    log_error "Failed to update Status field"
    exit 1
}
log_success "Updated Status to '$STATUS'"

# Update Lifecycle field
log_info "Updating Lifecycle to '$LIFECYCLE'..."
gh project item-edit \
    --project-id "$PROJECT_ID" \
    --id "$ITEM_ID" \
    --field-id "$LIFECYCLE_FIELD_ID" \
    --single-select-option-id "$LIFECYCLE_OPTION_ID" > /dev/null 2>&1 || {
    log_error "Failed to update Lifecycle field"
    exit 1
}
log_success "Updated Lifecycle to '$LIFECYCLE'"

# Final success message
echo ""
log_success "GitHub Projects updated successfully!"
log_info "Issue #$ISSUE_NUMBER: Status='$STATUS', Lifecycle='$LIFECYCLE'"
