# ADR 020: React/Next.js Version Dependency Constraints

## Status

Accepted

## Context

On 2025-10-14, Dependabot attempted to automatically upgrade React from 18.3.1 to 19.2.0 via PR #225, which
caused build failures due to peer dependency incompatibility with our current Next.js version (14.2.33).

### The Problem

```text
npm error Could not resolve dependency:
npm error peer react@"^18.2.0" from next@14.2.33
```

This revealed a critical gap in our dependency management strategy: **React and Next.js have strict peer dependency
relationships that must be maintained during upgrades**.

### Peer Dependency Relationship

- **Next.js 14.x** requires React 18.x (peer dependency: `"react": "^18.2.0"`)
- **React 19.x** requires Next.js 15.x or higher for compatibility
- **Upgrading React without upgrading Next.js first breaks the build**

### Current State

```json
{
  "dependencies": {
    "next": "14.2.33",
    "react": "18.3.1",
    "react-dom": "18.3.1"
  },
  "devDependencies": {
    "@types/react": "18.3.18",
    "@types/react-dom": "18.3.6"
  }
}
```

## Decision

We will implement a **coordinated dependency management strategy** to prevent incompatible framework upgrades:

### 1. Dependabot Ignore Rules

Configure Dependabot (`.github/dependabot.yml`) to **ignore React ecosystem major version updates**:

```yaml
ignore:
  - dependency-name: 'react'
    update-types: ['version-update:semver-major']
  - dependency-name: 'react-dom'
    update-types: ['version-update:semver-major']
  - dependency-name: '@types/react'
    update-types: ['version-update:semver-major']
  - dependency-name: '@types/react-dom'
    update-types: ['version-update:semver-major']
```

This prevents Dependabot from creating PRs for React 19+ until we manually upgrade Next.js first.

### 2. Mandatory Upgrade Sequence

When upgrading React/Next.js major versions:

```text
Step 1: Upgrade Next.js 14.x → Next.js 15.x
         ↓
Step 2: Verify compatibility and build passes
         ↓
Step 3: Upgrade React 18.x → React 19.x
         ↓
Step 4: Update Dependabot ignore rules (if needed)
```

**Never upgrade React major versions before Next.js is compatible.**

### 3. Awareness Strategy

Since Dependabot will not notify us about React major versions, we will:

- **Quarterly Manual Checks**: Run `npm outdated` to review available major versions
- **GitHub Action Monitoring**: Create automated monthly checks for all outdated major versions (see related issue)
- **Security Alerts**: GitHub security advisories will still alert for critical vulnerabilities

### 4. Documentation Requirements

- Document this constraint in `.github/dependabot.yml` comments
- Reference this ADR in upgrade-related issues (#232, #191, #223)
- Update project documentation with framework version dependencies

## Consequences

### Positive

- **Prevents Build Failures**: No more automatic incompatible upgrades
- **Controlled Upgrades**: Framework upgrades are deliberate, planned decisions
- **Clear Upgrade Path**: Documented sequence prevents mistakes
- **Reproducible Builds**: Pinned dependencies maintain compatibility

### Negative

- **Manual Awareness Required**: Must actively check for React major versions quarterly
- **Potential Delay in Updates**: React upgrades delayed until Next.js compatibility verified
- **Additional Maintenance**: Dependabot ignore rules need updating when constraints change

### Neutral

- **No Impact on Minor/Patch**: Dependabot still handles React 18.x minor/patch updates
- **Security Updates**: Critical security patches bypass ignore rules automatically

## Related Issues

- **#232**: Configure Dependabot to prevent incompatible React 19 upgrade (this implementation)
- **#191**: Infrastructure: Evaluate additional dependency updates (React 19, Next.js 15, etc.) - actual upgrade work
- **#223**: Investigate and plan React 19 migration compatibility - research and planning
- **#225**: Failed Dependabot PR attempting React 19 upgrade (to be closed)

## References

- [Next.js 14 Documentation](https://nextjs.org/docs) - Peer dependencies
- [React 19 Release Notes](https://react.dev/blog/2024/12/05/react-19) - Compatibility requirements
- [Dependabot Configuration Options](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuration-options-for-the-dependabot.yml-file#ignore)

## Supersedes

None

## Date

2025-10-14
