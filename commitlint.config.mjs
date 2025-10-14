/**
 * Commitlint Configuration
 *
 * Enforces conventional commit format for all commits.
 * This configuration is the single source of truth for commit message standards.
 *
 * Referenced by:
 * - docs/core/workflows.md (Commit Message Format section)
 * - .husky/commit-msg (local validation)
 * - .github/workflows/build.yml (CI validation - requires .mjs extension)
 *
 * @see https://www.conventionalcommits.org/
 * @see https://commitlint.js.org/
 */

const config = {
  extends: ['@commitlint/config-conventional'],

  rules: {
    /**
     * Allowed commit types - covers all project needs:
     *
     * Core Development:
     * - feat: New features and functionality
     * - fix: Bug fixes and corrections
     * - refactor: Code restructuring without behavior changes
     * - perf: Performance improvements
     *
     * Quality & Testing:
     * - test: Adding or updating tests
     * - style: Code formatting changes (not UI styling)
     *
     * Infrastructure & DevOps:
     * - ci: CI/CD pipeline, GitHub Actions, workflows
     * - build: Build system, dependencies, tooling configuration
     * - chore: Maintenance tasks, dependency updates, repo management
     *
     * Security:
     * - security: Security fixes, vulnerability patches, security tooling
     *
     * Documentation:
     * - docs: Documentation updates (README, ADRs, guides, comments)
     */
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'security',
      ],
    ],

    /**
     * Scope is optional but recommended for clarity.
     *
     * Common scopes used in this project:
     * - Component/feature: todo, ui, api
     * - Infrastructure: ci, deps, deployment
     * - Documentation: docs, adr, readme, claude
     *
     * Scopes help categorize changes but are not strictly enforced.
     */
    'scope-empty': [0], // Allow commits without scope
    'scope-case': [2, 'always', 'lower-case'],

    /**
     * Subject (commit description) requirements:
     * - Must be lowercase (except proper nouns)
     * - No period at the end
     * - Clear and concise
     */
    'subject-case': [2, 'never', ['upper-case', 'pascal-case', 'start-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],

    /**
     * Allow long lines in body and footer for:
     * - AI attribution footers (🤖 Generated with AI Agent)
     * - Co-Author trailers
     * - Detailed explanations
     * - URLs and references
     */
    'body-max-line-length': [0],
    'footer-max-line-length': [0],

    /**
     * Header (first line) length: Keep under 100 characters
     * Format: type(scope): description (#issue-number)
     */
    'header-max-length': [2, 'always', 100],

    /**
     * Require empty line between header and body (if body exists)
     */
    'body-leading-blank': [2, 'always'],
    'footer-leading-blank': [2, 'always'],

    /**
     * Type must always be present and lowercase
     */
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
  },

  /**
   * Custom validation for AI attribution (future enhancement)
   *
   * Could add plugin to validate:
   * - 🤖 Generated with AI Agent footer presence
   * - Co-Authored-By: trailer format
   * - Issue number reference format (#XXX)
   *
   * @see docs/adr/015-ai-agent-attribution-strategy.md
   */
  plugins: [],

  /**
   * Help message shown on validation failure
   */
  helpUrl:
    'https://github.com/mikiwiik/instructions-only-claude-coding/blob/main/docs/core/workflows.md#atomic-commit-strategy',
};

export default config;
