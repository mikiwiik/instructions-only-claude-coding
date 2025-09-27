# SonarCloud Setup for Instructions-Only Claude Coding

This guide covers project-specific SonarCloud configuration. For general SonarCloud setup, follow the
[official SonarCloud GitHub integration guide](https://docs.sonarsource.com/sonarcloud/getting-started/github/).

## Project-Specific Configuration

### Repository Details

- **Repository**: `mikiwiik/instructions-only-claude-coding`
- **Project Key**: `mikiwiik_instructions-only-claude-coding`
- **Organization**: `mikiwiik`

## Step-by-Step Setup Guide

### Step 1: Create SonarCloud Account and Project

1. **Go to [SonarCloud.io](https://sonarcloud.io/)**
2. **Sign in with GitHub** and authorize SonarCloud to access your GitHub account
3. **Install SonarCloud GitHub App**:
   - During setup, choose to install on selected repositories
   - Select `mikiwiik/instructions-only-claude-coding`
4. **Create Organization**:
   - Organization key: `mikiwiik`
   - Display name: Your preferred name
5. **Import Repository**:
   - Click "Analyze new project"
   - Select `instructions-only-claude-coding`
   - Project key will be: `mikiwiik_instructions-only-claude-coding`

### Step 2: Configure Analysis Method

1. **In your SonarCloud project dashboard**:
   - Go to **Administration** → **Analysis Method**
   - **Disable "Automatic Analysis"** (this prevents conflicts with CI-based analysis)
   - **Enable "CI-based Analysis"**
   - Select **"GitHub Actions"** as the CI method
   - SonarCloud will display a token (starts with `sqp_`)
   - **Copy this token** - you'll need it for the next step

### Step 3: Generate SONAR_TOKEN

1. **After configuring analysis method in Step 2**:
   - SonarCloud will display your project token (starts with `sqp_`)
   - **Copy this token** - you'll need it for the next step

### Step 4: Add SONAR_TOKEN to GitHub Repository

1. **Navigate to your GitHub repository**:
   - Go to <https://github.com/mikiwiik/instructions-only-claude-coding>
2. **Access repository secrets**:
   - Click **Settings** tab
   - In the left sidebar, click **Secrets and variables** → **Actions**
3. **Add the secret**:
   - Click **"New repository secret"**
   - **Name**: `SONAR_TOKEN`
   - **Secret**: Paste the token from SonarCloud (starts with `sqp_`)
   - Click **"Add secret"**

### Step 5: Verify Integration

1. **Trigger a workflow**:
   - Push a commit or create a pull request
   - Check the **Actions** tab for workflow execution
2. **Confirm SonarCloud analysis**:
   - SonarCloud step should now run successfully
   - Visit your SonarCloud project to see analysis results

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

## Configuration Files

The integration includes these pre-configured files:

- **`sonar-project.properties`** - Project-specific SonarCloud configuration
- **`.github/workflows/build.yml`** - GitHub Actions workflow with SonarCloud step
- **`coverage/lcov.info`** - Jest coverage reports (generated automatically)

## Troubleshooting

### Common Issues

#### Error: "Running this GitHub Action without SONAR_TOKEN is not recommended"

- **Solution**: Follow Step 3 above to add the `SONAR_TOKEN` secret to your repository

#### Error: "You are running CI analysis while Automatic Analysis is enabled"

- **Solution**: In SonarCloud project → Administration → Analysis Method → Disable "Automatic Analysis"

#### Error: "The folder '**tests**' does not exist"

- **Solution**: Verify `sonar.tests` path in `sonar-project.properties` matches your actual test directory structure

#### Error: "Project not found"

- **Solution**: Verify the project key `mikiwiik_instructions-only-claude-coding` matches your SonarCloud project

#### Error: "Organization not found"

- **Solution**: Ensure the organization key `mikiwiik` exists in your SonarCloud account

### Getting Help

- **SonarCloud Documentation**: [docs.sonarsource.com/sonarcloud](https://docs.sonarsource.com/sonarcloud/)
- **GitHub Actions Integration**: [SonarCloud GitHub Actions Guide](https://docs.sonarsource.com/sonarcloud/advanced-setup/ci-based-analysis/github-actions-for-sonarcloud/)
- **Community Support**: [community.sonarsource.com](https://community.sonarsource.com/)

## Integration Notes

- **Coverage Reports**: Jest already generates coverage in LCOV format at `coverage/lcov.info`
- **TypeScript**: Project uses `tsconfig.json` for TypeScript configuration
- **Testing**: Comprehensive test suite with React Testing Library and Jest
- **Build Process**: Next.js build process already validates TypeScript and linting

The SonarCloud integration will enhance existing quality assurance without replacing current tools.
