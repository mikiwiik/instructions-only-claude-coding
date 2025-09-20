# ADR-009: Pre-commit linting strategy

## Status

Accepted

## Context

We need to establish code quality standards and ensure consistent formatting across the codebase. Key considerations:

- Prevent code quality issues from entering the repository
- Maintain consistent code style and formatting
- Catch common errors before they reach remote repository
- Support multiple file types (JavaScript/TypeScript, Markdown, JSON)
- Integrate seamlessly with development workflow
- Provide fast feedback to developers

Without automated linting, code quality issues can accumulate, leading to:

- Inconsistent code formatting and style
- Common programming errors reaching production
- Merge conflicts due to formatting differences
- Reduced code readability and maintainability

## Decision

Implement pre-commit hooks using Husky with the following linting strategy:

- **ESLint + Prettier** for JavaScript/TypeScript code quality and formatting
- **markdownlint** for Markdown file consistency and formatting
- **lint-staged** to run linters only on staged files for performance
- **Pre-commit hooks** to automatically run linters before each commit

## Consequences

### Positive

- Consistent code formatting across the entire codebase
- Early detection of common programming errors and style issues
- Reduced code review time by catching formatting issues automatically
- Improved code readability and maintainability
- Prevention of broken or poorly formatted code reaching remote repository
- Standardized documentation formatting in Markdown files
- Fast linting execution by processing only staged files

### Negative

- Initial setup complexity and configuration overhead
- Potential developer friction if linting rules are too strict
- Commit process may be slower due to linting execution
- Developers need to understand and fix linting errors before committing
- Additional development dependencies and tooling

### Neutral

- Requires establishment of linting rules and team conventions
- Need to handle legacy code that doesn't meet new standards
- May require IDE configuration for optimal developer experience

## Alternatives Considered

- **CI-only linting**: Catches issues later in the process but allows broken code to be committed
- **IDE-only linting**: Relies on individual developer setup and doesn't enforce consistency
- **Manual linting**: Error-prone and inconsistent enforcement
- **Commit message linting only**: Doesn't address code quality issues
- **No linting**: Fastest development but sacrifices code quality and consistency

## Implementation Details

### Tools Selected

- **Husky**: Git hooks management (industry standard, well-maintained)
- **lint-staged**: Run linters on staged files only (performance optimization)
- **ESLint**: JavaScript/TypeScript static analysis (extensive rule ecosystem)
- **Prettier**: Code formatting (opinionated, reduces configuration decisions)
- **markdownlint-cli**: Markdown linting (ensures documentation quality)

### Hook Configuration

- Pre-commit hook will run linters on staged files
- Linting failures will prevent commit until issues are resolved
- Support for auto-fixing when possible (Prettier, some ESLint rules)

## References

- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged Documentation](https://github.com/okonet/lint-staged)
- [ESLint Documentation](https://eslint.org/docs/latest/)
- [Prettier Documentation](https://prettier.io/docs/en/)
- [markdownlint Documentation](https://github.com/DavidAnson/markdownlint)
