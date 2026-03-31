# ADR-041: Minimum Package Release Age

## Status

Accepted

Amends [ADR-039](039-supply-chain-hardening.md)

**Note**: Once accepted, this ADR should not be modified except for:

- Minor corrections (typos, formatting, broken links)
- Status updates when superseded or amended
- Adding links to newer ADRs that reference this one

For architectural changes or evolution, create a new ADR that references this one. See
[PROCESS.md](PROCESS.md#adr-immutability-and-evolution) for complete immutability guidelines.

## Context

ADR-039 hardened the CI/CD pipeline by blocking lifecycle scripts, enforcing strict audits, and
tightening permissions. However, a gap remains: a compromised package version can be installed
if it passes `npm audit` before being flagged by the npm security team.

The typical timeline for supply chain attacks:

1. **Attacker publishes malicious version** — immediately available via `npm install`
2. **Detection** — usually within 24-48 hours by automated scanners or community reports
3. **Removal** — npm security team unpublishes the malicious version

The danger window is between steps 1 and 3. During this period, `npm audit` may not flag the
package, and pinned versions don't help if the attacker targets a new version number.

npm v11.10.0 introduced `min-release-age`, which refuses to install any package version
published less than N minutes ago. pnpm (v10.16+) and Yarn (v4.10+) offer equivalent support.

## Decision

Add `min-release-age=10080` (7 days) to `.npmrc`.

### Why 7 Days

- Most attacks are detected within 24-48 hours — 7 days provides a comfortable margin
- This project does not use bleeding-edge packages
- All dependency updates arrive via Dependabot PRs, which naturally add review latency
- A 7-day window ensures packages are well-vetted by the community before installation

### Exception Process

When a dependency must be installed before the 7-day window (e.g., urgent security patch):

1. Use `npm install --min-release-age=0` for the specific install
2. Document the override reason in the PR description
3. Verify the package manually (check publisher, changelog, source)

## Consequences

### Positive

- **Eliminates zero-day supply chain risk** — malicious packages are caught and removed before
  they become installable in this project
- **Zero configuration burden** — single line in `.npmrc`, works with existing `npm ci` workflow
- **Compatible with Dependabot** — Dependabot PRs reference specific versions; the age check
  applies at install time, so Dependabot-proposed versions must also meet the threshold

### Negative

- **Cannot install same-day releases** — acceptable trade-off given Dependabot-based update workflow
- **Urgent patches delayed** — critical security fixes in dependencies require the manual exception
  process above

## References

- [ADR-039: Supply Chain Hardening](039-supply-chain-hardening.md)
- [npm minimumReleaseAge announcement](https://socket.dev/blog/npm-introduces-minimumreleaseage-and-bulk-oidc-configuration)
- [npm CLI issue #8570](https://github.com/npm/cli/issues/8570)
- [Datadog: Learnings from npm supply chain compromises](https://securitylabs.datadoghq.com/articles/learnings-from-recent-npm-compromises/)
