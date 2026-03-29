#!/usr/bin/env bash
set -euo pipefail

# Generate npm audit report from a single audit invocation.
# Usage: ./scripts/generate-audit-report.sh [--audit-level=LEVEL]
#
# Outputs:
#   reports/audit-report.json  - Full JSON audit data
#   reports/audit-summary.md   - Human-readable markdown summary
#
# Sets GitHub Actions output VULNERABILITIES_FOUND=true if threshold exceeded.

AUDIT_LEVEL="${1:---audit-level=moderate}"

mkdir -p reports

# Single audit call — capture JSON
npm audit --json > reports/audit-report.json 2>&1 || true

# Derive markdown summary from JSON
node -e "
  const fs = require('fs');
  const audit = JSON.parse(fs.readFileSync('reports/audit-report.json'));
  const meta = audit.metadata?.vulnerabilities || {};
  const total = Object.values(meta).reduce((a, b) => a + b, 0);
  const lines = [
    '# Security Audit Report - ' + new Date().toISOString().split('T')[0],
    '',
    '## Summary',
    '',
    'Total: ' + total + ' vulnerabilities',
    '',
    '## Vulnerability Counts',
    '',
    '- Critical: ' + (meta.critical || 0),
    '- High: ' + (meta.high || 0),
    '- Moderate: ' + (meta.moderate || 0),
    '- Low: ' + (meta.low || 0),
    '- Info: ' + (meta.info || 0),
  ];
  fs.writeFileSync('reports/audit-summary.md', lines.join('\n') + '\n');
"

# Check threshold and set GitHub Actions output if exceeded
if ! npm audit "$AUDIT_LEVEL" > /dev/null 2>&1; then
  if [ -n "${GITHUB_OUTPUT:-}" ]; then
    echo "VULNERABILITIES_FOUND=true" >> "$GITHUB_OUTPUT"
  fi
  echo "Vulnerabilities found at $AUDIT_LEVEL"
else
  echo "No vulnerabilities at $AUDIT_LEVEL"
fi
