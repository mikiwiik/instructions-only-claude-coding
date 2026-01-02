# Security Documentation

This directory contains security-related documentation for the todo application.

> **Note**: See [Issue #220](https://github.com/mikiwiik/instructions-only-claude-coding/issues/220) for comprehensive
> security documentation planning.

## Dependency Security

### Pinned Dependency Policy

All dependencies use exact versions without range operators (`^`, `~`) for:

- **Reproducible builds**: Same versions across all environments
- **Security control**: Explicit approval of version changes via Dependabot PRs
- **Clear audit trail**: Every version change is tracked in git history

**Policy**: [ADR-035: Pinned Dependency Policy](../adr/035-pinned-dependency-policy.md)

### Automated Updates

[Dependabot](../../.github/dependabot.yml) manages dependency updates for:

| Ecosystem      | Schedule                  | Strategy                        |
| -------------- | ------------------------- | ------------------------------- |
| npm            | Weekly (Monday 09:00 UTC) | `versioning-strategy: increase` |
| GitHub Actions | Weekly (Monday 09:00 UTC) | SHA-pinned versions             |

### Enforcement

- **Pre-commit hooks**: Block commits with non-pinned versions
- **CI validation**: `validate-deps` job fails builds with violations
- **Scripts**: `scripts/validate-pinned-deps.sh`, `scripts/validate-action-versions.sh`

## Security Scanning

| Tool       | Purpose                    | Integration            |
| ---------- | -------------------------- | ---------------------- |
| CodeQL     | Static analysis (SAST)     | CI workflow on PR/push |
| npm audit  | Dependency vulnerabilities | CI workflow            |
| SonarCloud | Code quality and security  | CI workflow            |
| Dependabot | Dependency updates         | Weekly PRs             |

## Security Assessments

- [Shared Lists Security Assessment](shared-lists-security-assessment.md) - Threat model for anonymous sharing
