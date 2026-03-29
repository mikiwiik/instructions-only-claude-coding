# ADR-037: Supply Chain Hardening for CI/CD Pipeline

## Status

Accepted

Amends [ADR-026](026-security-scanning-ci-cd-pipeline.md)

## Context

The CI/CD pipeline already has strong supply chain defenses (SHA-pinned GitHub Actions, lockfile v3
with `npm ci`, pinned dependency versions via ADR-035, multi-layered scanning via ADR-026). However,
several gaps remain:

- **Lifecycle scripts run unrestricted during `npm ci`** — a compromised npm package can execute
  arbitrary code via `preinstall`/`postinstall` hooks during dependency installation. This is a
  well-documented attack vector (e.g., eslint-scope incident, ua-parser-js, event-stream)
- **`npm audit` uses `continue-on-error: true`** — high and critical vulnerabilities do not block
  builds, reducing the audit to an informational step
- **No `.npmrc`** — security defaults are not enforced consistently across CI and local environments
- **Workflow permissions are broader than necessary** — `pull-requests: write` was granted at
  workflow level in `build.yml` when only one job requires it

## Decision

### 1. Block lifecycle scripts in CI with `NPM_CONFIG_IGNORE_SCRIPTS=true`

Set this environment variable on all `npm ci` steps across build, e2e-tests, and security-scan
workflows. This prevents any package from executing code during installation.

### 2. Fail builds on high/critical audit findings

Change the npm audit step from `continue-on-error: true` with `--audit-level=moderate` to a
hard-failing step with `--audit-level=high`. This blocks builds when high or critical vulnerabilities
are present. The weekly security scan retains `--audit-level=moderate` for full visibility.

The audit step runs **before** `npm ci` so vulnerabilities are detected before packages are
downloaded.

### 3. Add `.npmrc` with security defaults

Commit an `.npmrc` file with:

- `ignore-scripts=true` — local parity with CI behavior
- `audit-level=moderate` — default for local audit commands
- `engine-strict=true` — enforce Node.js version constraints from `package.json`

### 4. Apply least-privilege workflow permissions

Move `pull-requests: write` from workflow-level to job-level in `build.yml`, granting it only to the
build job that posts coverage comments. Other workflows already have properly scoped permissions.

## Consequences

### Positive

- **Eliminates install-time code execution** — compromised packages cannot run arbitrary code during
  `npm ci`
- **High/critical vulnerabilities block merges** — forces resolution before code reaches main
- **Consistent security posture** — `.npmrc` ensures local development matches CI defaults
- **Reduced blast radius** — least-privilege permissions limit damage from token compromise

### Negative

- **Packages requiring postinstall scripts** — any dependency that legitimately needs lifecycle
  scripts (e.g., native modules with node-gyp, esbuild binary downloads) will need explicit
  handling. Currently verified that no project dependencies require this
- **Audit false positives** — `--audit-level=high` may occasionally block builds on disputed or
  not-yet-patched advisories. Run `npm audit` locally to verify before investigating

### Exception Process

If a future dependency requires lifecycle scripts:

1. Document the dependency and why it needs scripts
2. Add a targeted `--ignore-scripts=false` for that specific install step
3. Update this ADR with an amendment noting the exception

## References

- [ADR-026: Security Scanning in CI/CD Pipeline](026-security-scanning-ci-cd-pipeline.md)
- [ADR-035: Pinned Dependency Policy](035-pinned-dependency-policy.md)
- [npm lifecycle scripts documentation](https://docs.npmjs.com/cli/v10/using-npm/scripts#life-cycle-scripts)
- [GitHub Actions security hardening](https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions)
