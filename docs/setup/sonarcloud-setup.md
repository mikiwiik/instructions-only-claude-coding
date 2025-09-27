# SonarCloud Setup for Instructions-Only Claude Coding

This guide covers project-specific SonarCloud configuration. For general SonarCloud setup, follow the
[official SonarCloud GitHub integration guide](https://docs.sonarsource.com/sonarcloud/getting-started/github/).

## Project-Specific Configuration

### Repository Details

- **Repository**: `mikiwiik/instructions-only-claude-coding`
- **Project Key**: `mikiwiik_instructions-only-claude-coding`
- **Organization**: `mikiwiik`

### Required GitHub Secret

Add this secret to your repository settings following the [SonarCloud authentication guide](https://docs.sonarsource.com/sonarcloud/advanced-setup/ci-based-analysis/github-actions-for-sonarcloud/):

- **Secret Name**: `SONAR_TOKEN`
- **Value**: Token generated from SonarCloud project setup

### Project Structure Considerations

This Next.js project has the following structure that affects SonarCloud configuration:

```text
├── app/                 # Next.js 14 App Router pages
├── components/          # React components
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── __tests__/          # Jest test files
└── coverage/           # Jest coverage output
```

### Integration with Existing CI/CD

The project already has a comprehensive GitHub Actions workflow (`.github/workflows/build.yml`) that includes:

- TypeScript type checking
- ESLint linting
- Jest testing with coverage
- Coverage threshold enforcement (90%)

SonarCloud analysis will be added to this existing workflow to complement the current quality gates.

### Quality Gate Configuration

The project maintains high quality standards:

- **Test Coverage**: 90% minimum threshold
- **TypeScript**: Strict mode enabled
- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier with pre-commit hooks

SonarCloud quality gates should align with these existing standards.

## Next Steps

1. Complete SonarCloud account setup using the [official guide](https://docs.sonarsource.com/sonarcloud/getting-started/github/)
2. Add `SONAR_TOKEN` secret to GitHub repository
3. Configure `sonar-project.properties` with project-specific paths
4. Integrate SonarCloud analysis into existing GitHub Actions workflow
5. Set up quality gates to complement existing coverage requirements

## Integration Notes

- **Coverage Reports**: Jest already generates coverage in LCOV format at `coverage/lcov.info`
- **TypeScript**: Project uses `tsconfig.json` for TypeScript configuration
- **Testing**: Comprehensive test suite with React Testing Library and Jest
- **Build Process**: Next.js build process already validates TypeScript and linting

The SonarCloud integration will enhance existing quality assurance without replacing current tools.
