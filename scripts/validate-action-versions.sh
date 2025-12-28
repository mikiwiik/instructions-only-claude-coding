#!/usr/bin/env bash
set -euo pipefail

# GitHub Actions Version Validation Script
# Validates that GitHub Actions use SHA-pinned versions, not tag versions
# See ADR-035 for policy details

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

WORKFLOWS_DIR=".github/workflows"
EXIT_CODE=0

echo "🔍 Validating GitHub Actions versions in ${WORKFLOWS_DIR}..."
echo

# Check if workflows directory exists
if [[ ! -d "${WORKFLOWS_DIR}" ]]; then
  echo -e "${RED}✗ Error: ${WORKFLOWS_DIR} not found${NC}"
  exit 1
fi

# Find all workflow files
workflow_files=$(find "${WORKFLOWS_DIR}" -name "*.yml" -o -name "*.yaml" 2>/dev/null)

if [[ -z "${workflow_files}" ]]; then
  echo "No workflow files found."
  exit 0
fi

declare -a violations=()

# Check each workflow file
for file in ${workflow_files}; do
  # Find all 'uses:' lines with actions
  # Pattern: uses: owner/repo@version or uses: owner/repo/path@version
  while IFS= read -r line; do
    [[ -z "${line}" ]] && continue

    # Extract the action reference (everything after 'uses:')
    action_ref=$(echo "${line}" | sed -E 's/.*uses:\s*([^[:space:]]+).*/\1/')

    # Skip docker:// and local actions (./)
    if [[ "${action_ref}" =~ ^docker:// ]] || [[ "${action_ref}" =~ ^\.\/ ]]; then
      continue
    fi

    # Check if the version part (after @) is a SHA (40 hex chars)
    # Pattern: @[0-9a-f]{40} indicates SHA-pinned
    if [[ ! "${action_ref}" =~ @[0-9a-f]{40}($|[[:space:]]|#) ]]; then
      # Extract version for display
      version=$(echo "${action_ref}" | grep -oE '@[^[:space:]#]+' | head -1 || echo "@unknown")
      violations+=("${file}: ${action_ref}")
    fi
  done < <(grep -E '^\s*uses:\s*[^/]+/[^@]+@' "${file}" 2>/dev/null || true)
done

if [[ ${#violations[@]} -gt 0 ]]; then
  echo -e "${RED}✗ Non-SHA-pinned GitHub Actions found:${NC}"
  echo

  for violation in "${violations[@]}"; do
    echo "  ${violation}"
  done

  echo
  echo "Fix: Replace tag versions with SHA-pinned versions"
  echo "Example: uses: actions/checkout@v4"
  echo "      → uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 # v4.1.7"
  echo
  echo "To find SHA: Check the action's releases page on GitHub"
  echo "See ADR-035 for pinned dependency policy details."
  EXIT_CODE=1
else
  echo -e "${GREEN}✓ All GitHub Actions use SHA-pinned versions${NC}"
fi

exit ${EXIT_CODE}
