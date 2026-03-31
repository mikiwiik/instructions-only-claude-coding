# ADR-039: Supply Chain Hardening for CI/CD Pipeline

## Status

Accepted

Amends [ADR-027](027-security-scanning-ci-cd-pipeline.md)

## Context

The CI/CD pipeline already has strong supply chain defenses (SHA-pinned GitHub Actions, lockfile v3
with `npm ci`, pinned dependency versions via ADR-037, multi-layered scanning via ADR-027). However,
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
- `min-release-age=10080` — refuse packages published less than 7 days ago (see below)

### 4. Enforce minimum package release age

npm v11.10.0+ supports `min-release-age`, which refuses to install any package version published
less than N minutes ago. Set to 10080 minutes (7 days) in `.npmrc`.

**Why 7 days**: Most supply chain attacks are detected and removed within 24-48 hours. A 7-day
window provides a comfortable margin. This project doesn't use bleeding-edge packages — all
updates arrive via Dependabot PRs, which naturally add review latency.

**Exception process**: When a dependency must be installed before the 7-day window (e.g., urgent
security patch), use `npm install --min-release-age=0`, document the override in the PR, and
verify the package manually.

### 5. Apply least-privilege workflow permissions

Move `pull-requests: write` from workflow-level to job-level in `build.yml`, granting it only to the
build job that posts coverage comments. Other workflows already have properly scoped permissions.

## Consequences

### Positive

- **Eliminates install-time code execution** — compromised packages cannot run arbitrary code during
  `npm ci`
- **High/critical vulnerabilities block merges** — forces resolution before code reaches main
- **Consistent security posture** — `.npmrc` ensures local development matches CI defaults
- **Eliminates zero-day supply chain risk** — 7-day release age skips the detection window
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

- [ADR-027: Security Scanning in CI/CD Pipeline](027-security-scanning-ci-cd-pipeline.md)
- [ADR-035: Pinned Dependency Policy](037-pinned-dependency-policy.md)
- [npm lifecycle scripts documentation](https://docs.npmjs.com/cli/v10/using-npm/scripts#life-cycle-scripts)
- [GitHub Actions security hardening](https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions)
