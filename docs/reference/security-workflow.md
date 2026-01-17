# Security Workflow

Internal documentation for handling security vulnerabilities and incidents in the todo application.

This is a hobby project maintained on a best-effort basis. The workflow below describes the general
approach, not guaranteed timelines or commitments.

## Handling Security Reports

When a security report is received, the general approach is:

### Triage

- Assess severity using simplified categorization:
  - **Critical**: Remote code execution, authentication bypass, data breach
  - **High**: Privilege escalation, sensitive data exposure, XSS with significant impact
  - **Medium**: Information disclosure, CSRF, limited XSS
  - **Low**: Minor information leakage, theoretical vulnerabilities
- Create private tracking via GitHub Security Advisory (draft) if appropriate

### Investigation

- Reproduce the issue in a local development environment
- Identify root cause and affected code paths
- Assess impact: What data/users could be affected?

### Fix Development

- Create private branch for fix development (do not use public branches)
- Write tests that verify the vulnerability is fixed
- Implement fix following project code standards
- Verify fix doesn't introduce regressions

### Release

- Merge fix to main branch
- Deploy to production
- Publish security advisory on GitHub if appropriate
- Credit reporter (unless they prefer anonymity)

## AI Agent Security Guidelines

When AI agents encounter potential security issues during development:

### Immediate Actions

1. **Do not commit** code containing potential vulnerabilities
2. **Flag the issue** to the human maintainer immediately
3. **Document** the potential vulnerability in a private note

### Classification

AI agents should flag issues that might indicate:

- Hardcoded credentials or secrets
- SQL injection patterns (N/A for this project but general awareness)
- XSS vulnerabilities in user content rendering
- Authentication/authorization bypasses
- Insecure data exposure in logs or errors
- Dependency vulnerabilities flagged by npm audit

### Escalation Process

1. **Stop work** on the affected code path
2. **Report** to maintainer with:
   - File and line number
   - Description of potential issue
   - Suggested remediation
3. **Wait for guidance** before proceeding

## Security Contacts

- **Primary**: Repository maintainers via GitHub
- **Escalation**: Use GitHub Security Advisories for confidential reporting

## Related Documentation

- [SECURITY.md](../../SECURITY.md) - Public security policy
- [Security Assessment](../security/shared-lists-security-assessment.md) - Architecture security review
- [Quality Standards](../core/quality-standards.md) - Code quality requirements
