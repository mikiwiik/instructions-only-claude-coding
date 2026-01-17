# Security Policy

## Disclaimer

This is a hobby project created for educational purposes. It is provided "as-is" without any warranties
or guarantees of any kind. Use is entirely at your own risk. Security issues are addressed on a
best-effort basis as time and resources allow. That said, the goal is to make this project as robust
as resources permit, and all contributions are greatly appreciated and will be credited appropriately.

## Supported Versions

This project currently maintains security support for the latest deployed version only. As a demonstration project
following continuous deployment practices, we recommend always using the most recent version.

| Version  | Supported          |
| -------- | ------------------ |
| Latest   | :white_check_mark: |
| Previous | :x:                |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

We take all security vulnerabilities seriously. Thank you for helping improve the security of this project.

### How to Report

1. **GitHub Security Advisories (Preferred)**: Use
   [GitHub's private vulnerability reporting][security-advisories] to submit a confidential report.

2. **Email**: If you cannot use GitHub Security Advisories, contact the maintainers directly through GitHub.

[security-advisories]: https://github.com/mikiwiik/instructions-only-claude-coding/security/advisories/new

### What to Include

Please include as much of the following information as possible:

- **Description**: Clear description of the vulnerability
- **Location**: Affected files, functions, or components
- **Steps to Reproduce**: Detailed steps to reproduce the issue
- **Impact Assessment**: Potential security impact (data exposure, privilege escalation, etc.)
- **Proof of Concept**: Code snippets or screenshots demonstrating the vulnerability (if available)
- **Suggested Fix**: Any recommendations for remediation (optional)

## How We Handle Reports

When a vulnerability is reported, the general approach is:

1. Assess the severity and scope
2. Develop and test a fix
3. Release the fix and publish a security advisory
4. Credit the reporter (unless they prefer anonymity)

## Out of Scope

The following are generally not considered security vulnerabilities:

- Issues in development/test environments only
- Denial of service through excessive legitimate requests
- Social engineering attacks
- Physical attacks requiring device access
- Issues requiring unlikely user interaction or configuration
- Vulnerabilities in dependencies already reported upstream
- Theoretical vulnerabilities without demonstrated impact

## Security Measures

This project implements the following security practices:

- **Dependency Scanning**: Automated vulnerability scanning via Dependabot
- **Static Analysis**: CodeQL security analysis in CI/CD pipeline
- **Pre-commit Hooks**: Security checks before code commits
- **XSS Protection**: Input sanitization and safe rendering of user content
- **GDPR Compliance**: EU data residency for all third-party services

For detailed security architecture, see [Security Assessment](docs/security/shared-lists-security-assessment.md).

## Recognition

We appreciate the security research community's efforts to improve project security. Researchers who report valid
vulnerabilities will be acknowledged in our security advisories unless they prefer to remain anonymous.

## References

- [OWASP Vulnerability Disclosure Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Vulnerability_Disclosure_Cheat_Sheet.html)
- [GitHub Security Advisories Documentation](https://docs.github.com/en/code-security/security-advisories)
