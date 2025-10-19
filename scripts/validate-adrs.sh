#!/usr/bin/env bash
set -euo pipefail

# ADR Validation Script
# Validates Architecture Decision Records in docs/adr/ for:
# - Correct filename format (###-kebab-case.md)
# - No duplicate ADR numbers
# - Sequential numbering (warns about gaps)

ADR_DIR="docs/adr"
EXIT_CODE=0

# Color codes for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo "🔍 Validating ADRs in ${ADR_DIR}..."
echo

# Check if ADR directory exists
if [[ ! -d "${ADR_DIR}" ]]; then
  echo -e "${RED}✗ Error: ADR directory '${ADR_DIR}' not found${NC}"
  exit 1
fi

# Temporary file to track ADR numbers and filenames
TEMP_FILE=$(mktemp)
trap "rm -f ${TEMP_FILE}" EXIT

# Arrays to store findings
declare -a INVALID_NAMES=()
declare -a DUPLICATE_NUMBERS=()
declare -a ALL_NUMBERS=()

# Validate each ADR file
for file in "${ADR_DIR}"/*.md; do
  # Skip if no .md files found
  [[ -e "${file}" ]] || continue

  filename=$(basename "${file}")

  # Skip special files (template, PROCESS.md, etc.)
  if [[ "${filename}" =~ ^(template\.md|PROCESS\.md|README\.md)$ ]]; then
    continue
  fi

  # Check filename format: ###-kebab-case.md (no "ADR-" prefix)
  if [[ "${filename}" =~ ^ADR- ]]; then
    INVALID_NAMES+=("${filename} (has 'ADR-' prefix, should be '###-kebab-case.md')")
    EXIT_CODE=1
  elif [[ ! "${filename}" =~ ^[0-9]{3}-[a-z0-9-]+\.md$ ]]; then
    INVALID_NAMES+=("${filename} (invalid format, should be '###-kebab-case.md')")
    EXIT_CODE=1
  else
    # Extract ADR number
    adr_number=$(echo "${filename}" | grep -oE '^[0-9]{3}')

    # Check for duplicates using temp file
    if grep -q "^${adr_number}:" "${TEMP_FILE}" 2>/dev/null; then
      prev_filename=$(grep "^${adr_number}:" "${TEMP_FILE}" | cut -d: -f2)
      DUPLICATE_NUMBERS+=("ADR-${adr_number}: ${prev_filename} and ${filename}")
      EXIT_CODE=1
    else
      echo "${adr_number}:${filename}" >> "${TEMP_FILE}"
      ALL_NUMBERS+=("${adr_number}")
    fi
  fi
done

# Report invalid filenames
if [[ ${#INVALID_NAMES[@]} -gt 0 ]]; then
  echo -e "${RED}✗ Invalid ADR filenames found:${NC}"
  for name in "${INVALID_NAMES[@]}"; do
    echo "  - ${name}"
  done
  echo
fi

# Report duplicate numbers
if [[ ${#DUPLICATE_NUMBERS[@]} -gt 0 ]]; then
  echo -e "${RED}✗ Duplicate ADR numbers found:${NC}"
  for dup in "${DUPLICATE_NUMBERS[@]}"; do
    echo "  - ${dup}"
  done
  echo
fi

# Check for numbering gaps
if [[ ${#ALL_NUMBERS[@]} -gt 0 ]]; then
  # Sort numbers
  IFS=$'\n' sorted_numbers=($(sort -n <<<"${ALL_NUMBERS[*]}"))
  unset IFS

  # Check for gaps
  prev_num=0
  gaps_found=false
  for num in "${sorted_numbers[@]}"; do
    num_int=$((10#${num}))  # Convert to base 10 to handle leading zeros
    if [[ ${prev_num} -gt 0 ]]; then
      expected=$((prev_num + 1))
      if [[ ${num_int} -ne ${expected} ]]; then
        if [[ ${gaps_found} == false ]]; then
          echo -e "${YELLOW}⚠ Numbering gaps detected:${NC}"
          gaps_found=true
        fi
        echo "  - Gap between ADR-$(printf "%03d" ${prev_num}) and ADR-${num}"
      fi
    fi
    prev_num=${num_int}
  done

  if [[ ${gaps_found} == true ]]; then
    echo
  fi
fi

# Summary
if [[ ${EXIT_CODE} -eq 0 ]]; then
  adr_count=${#ALL_NUMBERS[@]}
  echo -e "${GREEN}✓ All ${adr_count} ADRs are valid${NC}"
  echo "  - All filenames follow correct format (###-kebab-case.md)"
  echo "  - No duplicate ADR numbers"
  exit 0
else
  echo -e "${RED}✗ ADR validation failed${NC}"
  echo "  Please fix the issues above and run validation again"
  exit 1
fi
