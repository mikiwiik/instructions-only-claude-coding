# ADR-019: ESLint v9 Flat Config Migration

## Status

Accepted

## Context

ESLint v8.57.1 reached end-of-life and is no longer supported, producing multiple deprecation warnings for its dependencies:

- **eslint@8.57.1** → "This version is no longer supported. Please see <https://eslint.org/version-support> for other options."
- **@humanwhocodes/config-array@0.13.0** → Use @eslint/config-array
- **@humanwhocodes/object-schema@2.0.3** → Use @eslint/object-schema
- **rimraf@3.0.2** → Rimraf versions prior to v4 are no longer supported
- **glob@7.2.3** (5 instances) → Glob versions prior to v9 are no longer supported
- **inflight@1.0.6** → Memory leak, use lru-cache

ESLint v9 introduces a new "flat config" format (`eslint.config.js`) as the default configuration system,
replacing the legacy `.eslintrc.*` format. The flat config format provides:

- Simpler, more predictable configuration merging
- Better TypeScript support
- Improved plugin system
- Elimination of cascading configuration complexity
- Native ESM support

The project currently uses `.eslintrc.js` with the legacy configuration format and needs to migrate to
remain supported and eliminate security warnings from deprecated dependencies.

## Decision

Migrate to ESLint v9 with the flat config format (`eslint.config.js`) and upgrade all related dependencies:

### Package Upgrades

```json
{
  "devDependencies": {
    "eslint": "8.57.1" → "9.17.0",
    "@typescript-eslint/eslint-plugin": "6.21.0" → "8.21.0",
    "@typescript-eslint/parser": "6.21.0" → "8.21.0",
    "eslint-config-next": "14.2.33" → "15.1.4",
    "eslint-config-prettier": "9.1.2" → "10.0.1",
    "eslint-plugin-react-hooks": "4.6.2" → "5.1.0"
  }
}
```

### Configuration Migration

1. **Create `eslint.config.js`** using flat config format
2. **Convert all configuration elements**:
   - `extends` → import and spread config objects
   - `plugins` → import plugins as objects
   - `env` → `languageOptions.globals` from `globals` package
   - `parserOptions` → `languageOptions`
   - `rules` → unchanged (same structure)
   - `settings` → unchanged (same structure)
   - `overrides` → multiple config objects in array
3. **Remove `.eslintrc.js`** after successful migration
4. **Update documentation** to reflect new configuration approach

### Key Flat Config Patterns

```javascript
import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import nextPlugin from 'eslint-config-next';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.es2020,
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin,
    },
    rules: {
      // Custom rules
    },
  },
  prettierConfig, // Must be last
];
```

## Consequences

### Positive

- **Security**: Eliminates 6 deprecation warnings from unsupported packages
- **Long-term Support**: ESLint v9 is actively maintained and supported
- **Simplified Configuration**: Flat config provides clearer, more predictable behavior
- **Better Performance**: Removes complexity of cascading configuration resolution
- **Modern Standards**: Aligns with ESLint's official recommendation and future direction
- **Plugin Compatibility**: All project plugins support ESLint v9 and flat config
- **TypeScript Support**: typescript-eslint v8 fully supports ESLint v9 with improved features

### Negative

- **Breaking Change**: Requires complete configuration rewrite
- **Learning Curve**: Team must understand new flat config format
- **Migration Effort**: Non-trivial migration requiring testing across entire codebase
- **Potential Compatibility**: Some third-party tools may not yet support flat config (minimal risk)

### Neutral

- **Configuration Location**: Config moves from `.eslintrc.js` to `eslint.config.js`
- **Linting Behavior**: Core linting rules and behavior remain largely unchanged
- **IDE Integration**: Modern IDEs (VS Code, etc.) support both formats

## Risks and Mitigation

### Risk: Breaking Changes in Plugin Rules

**Mitigation**:

- Comprehensive testing with `npm run lint` before and after migration
- Review all linting errors and adjust rules as needed
- Document any rule behavior changes in commit messages

### Risk: Next.js Integration Compatibility

**Mitigation**:

- Upgrade `eslint-config-next` to v15 which supports flat config
- Verify Next.js linting integration works correctly
- Test both development and build processes

### Risk: Pre-commit Hook Failures

**Mitigation**:

- Test lint-staged with new configuration
- Verify husky pre-commit hooks work correctly
- Document any workflow changes needed

## Implementation Plan

1. **Phase 1: Research** ✓
   - Review ESLint v9 migration guide
   - Verify plugin compatibility
   - Create this ADR

2. **Phase 2: Package Upgrades**
   - Update all ESLint-related packages
   - Install new required packages (`globals`, `@eslint/js`)
   - Verify package installation

3. **Phase 3: Configuration Migration**
   - Create `eslint.config.js` with flat config
   - Import and configure all plugins
   - Migrate all rules and settings
   - Test configuration

4. **Phase 4: Validation**
   - Run linting across entire codebase
   - Fix any new linting errors
   - Verify pre-commit hooks work
   - Remove old `.eslintrc.js`

5. **Phase 5: Verification**
   - Confirm all deprecation warnings resolved
   - Verify CI/CD linting passes
   - Document configuration changes

## Alternatives Considered

### Continue with ESLint v8

**Rejected**: ESLint v8 is no longer supported and produces security warnings. Staying on v8 would leave
the project with known vulnerabilities and deprecated dependencies.

### Gradual Migration with Compatibility Layer

**Rejected**: While ESLint v9 supports legacy `.eslintrc.*` format temporarily, this would delay the
inevitable migration and doesn't resolve deprecation warnings. The flat config is the future and should
be adopted now.

### Use Third-Party Migration Tools

**Considered**: Tools exist for automated migration, but manual migration provides:

- Better understanding of configuration changes
- Opportunity to review and optimize rules
- More control over the final configuration
- Learning experience for the team

**Decision**: Perform manual migration with assistance from AI coding agent for accuracy and documentation.

## References

- [ESLint v9.0.0 Release](https://eslint.org/blog/2024/04/eslint-v9.0.0-released/)
- [ESLint v9 Migration Guide](https://eslint.org/docs/latest/use/migrate-to-9.0.0)
- [Flat Config Documentation](https://eslint.org/docs/latest/use/configure/configuration-files)
- [typescript-eslint v8 Release](https://typescript-eslint.io/blog/announcing-typescript-eslint-v8/)
- [TypeScript ESLint ESLint v9 Support](https://github.com/typescript-eslint/typescript-eslint/issues/8211)
- [Next.js ESLint Configuration](https://nextjs.org/docs/app/api-reference/config/eslint)
- [GitHub Issue #190](https://github.com/mikiwiik/instructions-only-claude-coding/issues/190)
- [Parent Issue #187](https://github.com/mikiwiik/instructions-only-claude-coding/issues/187)
