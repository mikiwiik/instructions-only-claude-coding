# ADR-035: Pinned Dependency Policy with Automated Enforcement

## Status

Accepted

## Context

CLAUDE.md Principle #11 establishes a pinned dependency policy requiring exact versions without range operators
(`^`, `~`). However, this policy has gaps:

1. **No formal documentation**: The rationale and consequences are not documented in an ADR
2. **Inconsistent compliance**: 2 npm packages currently use `^` prefix (`@tailwindcss/postcss`, `tailwindcss`)
3. **GitHub Actions not covered**: 17 actions use tag versions (`@v4`, `@main`) instead of SHA-pinned
4. **No enforcement mechanism**: Violations can be committed without any automated checks

### Why Pinned Dependencies Matter

**Security**:

- Range operators allow automatic installation of newer versions that may contain vulnerabilities
- SHA-pinned GitHub Actions prevent supply chain attacks via tag mutation
- Exact versions provide clear audit trails for security reviews

**Reproducibility**:

- `npm ci` with exact versions guarantees identical `node_modules` across environments
- SHA-pinned actions ensure CI runs the exact same code regardless of tag updates
- Eliminates "works on my machine" issues from version drift

**Controlled Updates**:

- All updates flow through Dependabot PRs with proper review
- Breaking changes are caught before deployment
- Clear changelog via PR history

## Decision

### 1. Dependency Version Requirements

**npm packages** (package.json):

- All `dependencies` and `devDependencies` MUST use exact versions
- No `^` (caret) or `~` (tilde) prefixes allowed
- Example: `"react": "19.2.3"` (correct) vs `"react": "^19.2.3"` (incorrect)

**GitHub Actions** (.github/workflows/\*.yml):

- All third-party actions MUST use SHA-pinned versions
- Include version comment for readability
- Example: `actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 # v4.1.7`

### 2. Automated Enforcement

**Pre-commit validation** (`.husky/pre-commit`):

- Run `scripts/validate-pinned-deps.sh` when `package.json` is staged
- Run `scripts/validate-action-versions.sh` when workflow files are staged
- Block commits with violations

**CI validation** (`.github/workflows/build.yml`):

- Run both validation scripts as an early build step
- Fail builds with violations
- Catches direct pushes and GitHub UI edits

### 3. Dependabot Configuration

**npm ecosystem** (existing):

- `versioning-strategy: increase` maintains exact versions on updates
- Weekly schedule for controlled update flow

**github-actions ecosystem** (new):

- Add to `.github/dependabot.yml`
- Updates SHA-pinned versions automatically
- Same weekly schedule as npm

## Consequences

### Positive

- **Security**: Supply chain attack surface reduced via explicit version control
- **Reproducibility**: Identical builds across all environments guaranteed
- **Audit trail**: All dependency changes visible in git history and PRs
- **Automated compliance**: Pre-commit and CI prevent accidental violations

### Negative

- **Manual SHA lookup**: Initial SHA-pinning of actions requires checking release pages
- **Verbose workflow files**: SHA hashes are less readable than version tags
- **Dependabot PR volume**: Two ecosystems generate more update PRs

### Neutral

- **No impact on development flow**: Dependabot handles updates automatically
- **Existing npm policy maintained**: Just adds enforcement and expands to Actions

## Implementation

1. Fix existing violations (2 npm, 17 GitHub Actions)
2. Create validation scripts (`scripts/validate-pinned-deps.sh`, `scripts/validate-action-versions.sh`)
3. Integrate into pre-commit hook
4. Add CI validation step
5. Update Dependabot config with `github-actions` ecosystem
6. Update CLAUDE.md with enforcement details

## References

- CLAUDE.md Principle #11 (Pinned Dependencies)
- [GitHub Actions Security Hardening](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions#using-third-party-actions)
- [npm package-lock.json](https://docs.npmjs.com/cli/v10/configuring-npm/package-lock-json)
- ADR-020: React/Next.js Version Dependency Constraints (related)
