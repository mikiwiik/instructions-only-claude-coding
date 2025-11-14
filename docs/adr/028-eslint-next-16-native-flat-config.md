# ADR-028: ESLint Native Flat Config for Next.js 16 Compatibility

## Status

Accepted

## Context

Following ADR-019's migration to ESLint v9 flat config, the project used `FlatCompat` from
`@eslint/eslintrc` as a compatibility layer to bridge old-style ESLint configs (like
`next/core-web-vitals`) to the new flat config system.

However, upgrading to `eslint-config-next` 16.x (required for Next.js 16 compatibility) created
circular reference errors when using `FlatCompat`:

```text
TypeError: Converting circular structure to JSON
    --> property 'react' closes the circle
```

This error occurs because:

1. `next/core-web-vitals` includes the `react-hooks` plugin
2. `FlatCompat` processes this plugin configuration
3. The plugin creates circular references where the same plugin object points to itself
4. ESLint crashes when trying to serialize this for error reporting

### Upstream Issues

- **Next.js**: <https://github.com/vercel/next.js/issues/85244>
- **ESLint**: <https://github.com/eslint/eslint/issues/20237>

### Blocking Impact

- Dependabot PR #299 (eslint-config-next 15.5.5 → 16.0.3) failed
- Cannot upgrade to Next.js 16-compatible ESLint configs
- Project stuck on older eslint-config-next versions

## Decision

Remove `FlatCompat` dependency and migrate to **native ESLint flat config** by importing and configuring plugins directly.

### Configuration Changes

**Before (FlatCompat approach)**:

```javascript
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

export default [
  ...compat.extends(
    'next/core-web-vitals',
    'next/typescript',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'prettier'
  ),
  // ... custom rules
];
```

**After (Native flat config)**:

```javascript
import nextPlugin from '@next/eslint-plugin-next';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import tsPlugin from '@typescript-eslint/eslint-plugin';

export default [
  // React configuration
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: { react: reactPlugin },
    rules: {
      ...reactPlugin.configs['jsx-runtime'].rules,
      // Custom overrides
    },
    settings: {
      react: { version: 'detect' },
    },
  },
  // React Hooks configuration
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: { 'react-hooks': reactHooksPlugin },
    rules: reactHooksPlugin.configs.recommended.rules,
  },
  // JSX A11y configuration
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: { 'jsx-a11y': jsxA11y },
    rules: jsxA11y.configs.recommended.rules,
  },
  // Next.js configuration
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: { '@next/next': nextPlugin },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
    },
  },
  // TypeScript configuration
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      // Custom overrides
    },
  },
  // ... complexity rules, test files, etc.
];
```

### Preserved Standards

All existing linting standards maintained:

- **ADR-027 Complexity Standards**: Cyclomatic complexity ≤15, nesting depth ≤4
- **Accessibility**: WCAG 2.2 AA via jsx-a11y plugin
- **TypeScript**: Strict type safety rules
- **React**: Next.js best practices
- **Code Quality**: no-console warnings, no-debugger errors

### Global Definitions

Added required globals for Next.js/React/TypeScript:

```javascript
globals: {
  ...globals.browser,
  ...globals.es2020,
  ...globals.node,
  React: 'readonly',
  JSX: 'readonly',
  NodeJS: 'readonly',
}
```

Test files also get Jest globals:

```javascript
globals: {
  ...globals.jest,
  ...globals.node,
  ...globals.browser,
  EventListener: 'readonly',
}
```

## Consequences

### Positive

- **Next.js 16 Compatibility**: Can now use eslint-config-next 16.0.3
- **No Circular References**: Direct plugin imports avoid FlatCompat circular structure bug
- **Future-Proof**: Native flat config is ESLint's official long-term direction
- **Better Control**: Explicit plugin configuration vs. black-box compatibility layer
- **Cleaner Dependencies**: Removes @eslint/eslintrc dependency
- **Maintainability**: Easier to understand and debug configuration

### Negative

- **More Verbose**: Native config requires explicit plugin setup for each tool
- **Initial Migration Effort**: Required manual conversion from FlatCompat approach
- **Plugin Updates**: Each plugin must be configured individually when upgraded

### Neutral

- **Linting Behavior**: Core rules unchanged, same linting results
- **Standards Compliance**: All ADR-027 complexity rules preserved
- **Test Coverage**: All tests pass without modification

## Validation

### Linting

```bash
npm run lint
# ✓ 0 errors, 3 warnings (pre-existing max-lines-per-function warnings)
```

### Testing

```bash
npm test
# ✓ All test suites pass
```

### Build

```bash
npm run build
# ✓ Next.js build succeeds
```

## Implementation

Implemented in issue #307:

1. Removed `FlatCompat` usage from `eslint.config.mjs`
2. Imported plugins directly (`@next/eslint-plugin-next`, `eslint-plugin-react`, etc.)
3. Configured each plugin in separate config blocks with appropriate file matchers
4. Added required globals for React, JSX, NodeJS, Jest, EventListener
5. Preserved all existing rules and standards (complexity, accessibility, TypeScript)
6. Upgraded `eslint-config-next` from 15.5.5 → 16.0.3
7. Verified all tests pass and linting succeeds

## Alternatives Considered

### Wait for Upstream Fix

**Rejected**: No clear timeline for Next.js or ESLint to fix the circular reference issue with
FlatCompat. Native flat config is the recommended long-term approach anyway.

### Pin eslint-config-next to 15.x

**Rejected**: Would block Next.js 16 upgrade path and accumulate technical debt. Solves symptom,
not root cause.

### Use eslint-config-next Simplified Export

**Considered**: Starting with Next.js 16, the package exports `flatConfig.recommended` and
`flatConfig.coreWebVitals` for direct use. However, the project needed compatibility with multiple
plugins (TypeScript, a11y) requiring explicit configuration anyway, so native setup provides more
clarity and control.

## References

- **Issue**: #307
- **Failing PR**: #299 (eslint-config-next 15.5.5 → 16.0.1)
- **Parent ADR**: ADR-019 (ESLint v9 Flat Config Migration)
- **Next.js Issue**: <https://github.com/vercel/next.js/issues/85244>
- **ESLint Issue**: <https://github.com/eslint/eslint/issues/20237>
- **Next.js ESLint Docs**: <https://nextjs.org/docs/app/api-reference/config/eslint>
- **Implementation**: `eslint.config.mjs` (commits 514525f, e354e65)
