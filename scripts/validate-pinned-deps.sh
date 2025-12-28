#!/usr/bin/env bash
set -euo pipefail

# Pinned Dependencies Validation Script
# Validates that package.json uses exact versions without range operators (^, ~)
# See ADR-035 for policy details

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

PACKAGE_JSON="package.json"
EXIT_CODE=0

echo "🔍 Validating pinned dependency versions in ${PACKAGE_JSON}..."
echo

# Check if package.json exists
if [[ ! -f "${PACKAGE_JSON}" ]]; then
  echo -e "${RED}✗ Error: ${PACKAGE_JSON} not found${NC}"
  exit 1
fi

# Find all dependencies with ^ or ~ prefixes
# Pattern matches: "package-name": "^version" or "package-name": "~version"
violations=$(grep -E '"[^"]+"\s*:\s*"[\^~][^"]+"' "${PACKAGE_JSON}" || true)

if [[ -n "${violations}" ]]; then
  echo -e "${RED}✗ Non-pinned dependency versions found:${NC}"
  echo

  # Parse and display each violation
  while IFS= read -r line; do
    # Extract package name and version
    package=$(echo "${line}" | grep -oE '"[^"]+"\s*:\s*"[\^~][^"]+"' | head -1)
    if [[ -n "${package}" ]]; then
      echo "  ${package}"
    fi
  done <<< "${violations}"

  echo
  echo "Fix: Remove the ^ or ~ prefix from version strings"
  echo "Example: \"react\": \"^19.2.3\" → \"react\": \"19.2.3\""
  echo
  echo "See ADR-035 for pinned dependency policy details."
  EXIT_CODE=1
else
  echo -e "${GREEN}✓ All dependencies use exact versions (no ^ or ~ prefixes)${NC}"
fi

exit ${EXIT_CODE}
