# ADR-026: Security Scanning in CI/CD Pipeline

## Status

Accepted

**Amends**: [ADR-011: GitHub Actions for CI/CD Pipeline](011-github-actions-ci-cd.md)

**Note on Origin**: This ADR was created retroactively as part of [issue #221](https://github.com/mikiwiik/instructions-only-claude-coding/issues/221)
to serve dual purposes:

1. **Document Existing Architecture**: Security scanning features were previously implemented (#146, #147, #154) but
   never formally documented via ADR
2. **Reference Example**: Demonstrate the proper **amendment pattern** for evolving architecture without modifying
   historical ADRs

This approach is valid and encouraged - creating ADRs retroactively to document existing features while following
immutability principles.

## Context

ADR-011 established GitHub Actions as our CI/CD platform with basic build, test, and lint workflows. Since that
decision, we have expanded our CI/CD pipeline to include comprehensive security scanning capabilities. This ADR
documents the addition of security scanning layers without modifying the original decision to use GitHub Actions.

### Security Scanning Requirements

- **Dependency Vulnerabilities**: Identify known vulnerabilities in npm packages
- **Source Code Security**: Detect potential security issues in application code
- **Code Quality**: Identify code smells and maintainability issues
- **Automated Updates**: Keep dependencies current with security patches
- **Pre-deployment Validation**: Block deployments with critical vulnerabilities

## Decision

We extend the GitHub Actions CI/CD pipeline established in ADR-011 with multi-layered security scanning:

### Layer 1: Dependency Security

**npm audit** (Implemented in #146):

- Weekly automated dependency vulnerability scanning
- Fails build on high/critical vulnerabilities
- Integrated into CI/CD pipeline
- Zero cost (built into npm)

**Dependabot** (Implemented in #147):

- Automated dependency update pull requests
- Security vulnerability alerts
- Version update recommendations
- Native GitHub integration

### Layer 2: Source Code Security

**CodeQL** (Implemented in #154):

- Static analysis for security vulnerabilities
- Detects SQL injection, XSS, path traversal
- Runs on push and pull requests
- Free for public repositories

**SonarCloud**:

- Comprehensive code quality and security analysis
- Tracks code coverage, duplications, complexity
- PR decoration with quality gates
- Free tier for open source projects

### Implementation Strategy

```yaml
# .github/workflows/security.yml
name: Security Scanning

on:
  push:
    branches: [main]
  pull_request:
  schedule:
    - cron: '0 0 * * 0' # Weekly scan

jobs:
  npm-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run npm audit
        run: npm audit --audit-level=high

  codeql:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v3
        with:
          languages: javascript, typescript
      - uses: github/codeql-action/analyze@v3

  sonarcloud:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: SonarSource/sonarcloud-github-action@master
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

### Integration with Existing CI/CD

This security scanning **extends** the existing CI/CD pipeline from ADR-011 rather than replacing it:

- Original build/test/lint workflows remain unchanged
- Security scans run as additional parallel jobs
- Both must pass for PR approval
- Maintains fast feedback loops

## Alternatives Considered

### Snyk

- **Pros**: Excellent vulnerability database, developer-friendly UI
- **Cons**: Limited free tier, additional third-party dependency
- **Rejection Reason**: npm audit + Dependabot provide sufficient coverage

### GitHub Advanced Security (GHAS)

- **Pros**: Native integration, secret scanning, dependency review
- **Cons**: Requires GitHub Enterprise (paid)
- **Rejection Reason**: Cost prohibitive for educational project

### Manual Security Reviews

- **Pros**: Deep insight, custom checks
- **Cons**: Not scalable, inconsistent, human error
- **Rejection Reason**: Automation provides consistent baseline

### OWASP Dependency-Check

- **Pros**: Comprehensive vulnerability database
- **Cons**: Slower than npm audit, Java dependency
- **Rejection Reason**: npm audit more lightweight for Node.js projects

## Consequences

### Positive

- **Proactive Security**: Catch vulnerabilities before deployment
- **Automated Remediation**: Dependabot PRs reduce manual effort
- **Quality Assurance**: SonarCloud enforces code quality standards
- **Free Tier Compliance**: All tools available at zero cost
- **GitHub Integration**: Native tooling, no external dependencies
- **Educational Value**: Demonstrates security best practices

### Negative

- **Build Time Increase**: Additional 2-3 minutes for security scans
- **Alert Fatigue**: May generate many low-priority findings
- **Maintenance Overhead**: Need to review Dependabot PRs regularly
- **False Positives**: Static analysis tools may flag non-issues
- **Complexity**: Multiple security tools to monitor and configure

### Neutral

- **Learning Curve**: Team needs to understand security findings
- **Configuration Management**: Security policies need maintenance
- **Dependency on GitHub**: Continued reliance on GitHub ecosystem

## Relationship to ADR-011

This ADR **amends** ADR-011 by adding security scanning capabilities to the established GitHub Actions CI/CD pipeline.
The core decision to use GitHub Actions remains valid and unchanged. This is the appropriate pattern when:

- ✅ Extending existing architecture with new capabilities
- ✅ Original decision still valid, just evolving
- ✅ Adding features rather than replacing foundation

If we were switching from GitHub Actions to a different CI/CD platform (e.g., GitLab CI), that would require a
**superseding** ADR instead.

## Success Metrics

- **Zero Critical Vulnerabilities**: No critical vulnerabilities in production
- **Automated Update Rate**: ≥80% of Dependabot PRs merged within 7 days
- **Code Quality Gates**: SonarCloud quality gate passing on all PRs
- **Security Scan Coverage**: 100% of PRs scanned before merge
- **Build Time Impact**: Security scans add <3 minutes to CI/CD pipeline

## Implementation Status

- ✅ **Implemented**: npm audit (#146), Dependabot (#147), CodeQL (#154)
- 🚧 **Pending**: SonarCloud integration
- 📋 **Planned**: Secret scanning, SBOM generation

## References

- [ADR-011: GitHub Actions for CI/CD Pipeline](011-github-actions-ci-cd.md) - Original CI/CD decision
- [OWASP Dependency-Check](https://owasp.org/www-project-dependency-check/)
- [GitHub CodeQL Documentation](https://codeql.github.com/docs/)
- [SonarCloud for Open Source](https://sonarcloud.io/projects)
- [npm audit Documentation](https://docs.npmjs.com/cli/v10/commands/npm-audit)
- [Dependabot Configuration](https://docs.github.com/en/code-security/dependabot)

---

**Note**: This ADR serves as a reference example of the **amendment pattern** described in
[PROCESS.md](PROCESS.md#adr-immutability-and-evolution). When your architecture evolves without fundamentally changing
an original decision, create an amending ADR like this one rather than modifying the historical record.
