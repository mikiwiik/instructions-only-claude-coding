# Production Deployment Guide

This guide covers deploying the Todo App to production using Vercel with automatic CI/CD integration.

## Live Demo

**🌐 Live Application**: [Todo App on Vercel](https://instructions-only-claude-coding.vercel.app/)

The Todo App is automatically deployed to Vercel and updated on every push to the main branch after CI passes.

## Vercel Deployment Setup

This project is configured for automatic deployment to Vercel with GitHub integration. Follow these steps to set up
deployment for this or similar projects.

### Prerequisites

- GitHub repository with the Todo App code
- Vercel account (free tier available)
- Completed GitHub Actions CI/CD pipeline
- Node.js 22.x compatibility (configured in package.json)

### Step-by-Step Vercel Setup

#### 1. Create Vercel Account

```bash
# Visit https://vercel.com
# Click "Continue with GitHub" to link your GitHub account
# Complete the registration process
```

#### 2. Import Repository

```bash
# In Vercel Dashboard:
# 1. Click "New Project"
# 2. Find your GitHub repository "instructions-only-claude-coding"
# 3. Click "Import"
```

#### 3. Automatic Configuration

Vercel automatically detects and configures:

```json
{
  "framework": "Next.js",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "nodeVersion": "22.x",
  "installCommand": "npm ci"
}
```

#### 4. Deploy

```bash
# Click "Deploy" button in Vercel
# Vercel will build and deploy your application
# You'll receive a live URL (e.g., https://project-name.vercel.app)
```

## Deployment Features

### Automatic Deployments

- **Main Branch**: Every push to `main` triggers a new deployment
- **CI Integration**: Deployments wait for GitHub Actions CI to pass
- **Build Process**: Automatic Next.js optimization and compilation

### Preview Deployments

- **Pull Requests**: Each PR gets its own preview URL for testing
- **Branch Previews**: Feature branches can be previewed before merge
- **Safe Testing**: Test changes without affecting production

### Zero Configuration

- **Framework Detection**: Automatic Next.js project recognition
- **Build Optimization**: Production-ready builds with no configuration
- **Performance**: Automatic CDN, compression, and caching

### Custom Domains

- **Free Subdomain**: Automatic `.vercel.app` subdomain
- **Custom Domains**: Optional custom domain configuration
- **SSL/HTTPS**: Automatic SSL certificate provisioning

## Environment Configuration

### Current Setup

```bash
# No environment variables needed for this Todo App
# All data is stored in localStorage (client-side)
# Production build automatically optimized by Next.js
```

### For Projects with Environment Variables

```bash
# In Vercel Dashboard:
# 1. Go to Project Settings
# 2. Navigate to Environment Variables
# 3. Add required variables for each environment:
#    - Production
#    - Preview
#    - Development
```

## CI/CD Integration

### Deployment Workflow

```bash
# 1. Developer pushes code to GitHub
git push origin main

# 2. GitHub Actions CI runs automatically:
#    - Type checking (npm run type-check)
#    - Linting (npm run lint)
#    - Testing (npm run test)
#    - Building (npm run build)

# 3. If CI passes, Vercel automatically deploys
# 4. Live site updates with new changes
# 5. Deployment URL remains consistent
```

### Build Process

Vercel executes the following steps for each deployment:

1. **Install Dependencies**: `npm ci` (uses package-lock.json)
2. **Type Checking**: Automatic TypeScript compilation
3. **Build Application**: `npm run build` with Next.js optimization
4. **Deploy Assets**: Upload to Vercel's global CDN
5. **Update Live Site**: Atomic deployment with zero downtime

## Monitoring and Management

### Vercel Dashboard Features

- **Deployment History**: View all deployments and their status
- **Build Logs**: Detailed logs for troubleshooting build failures
- **Performance Metrics**: Basic traffic and performance analytics
- **Domain Management**: Configure custom domains and SSL
- **Environment Variables**: Manage configuration across environments

### GitHub Integration

- **Commit Status**: Deployment status visible in commit history
- **PR Comments**: Automatic preview URL comments on pull requests
- **Branch Protection**: Can require successful deployment for PR merge

### Rollback Capabilities

- **Previous Deployments**: Instantly promote any previous deployment
- **Automatic Rollbacks**: Configure automatic rollback on deployment failure
- **Alias Management**: Control which deployment is live

## Deployment Status

Current production deployment status:

- ✅ **Production**: Deployed to Vercel with automatic updates
- ✅ **CI/CD Pipeline**: GitHub Actions → Vercel integration complete
- ✅ **Domain**: Free `.vercel.app` subdomain configured
- ✅ **SSL**: HTTPS enabled by default
- ✅ **Performance**: Optimized Next.js production build
- ✅ **Preview Deployments**: PR preview URLs working
- ✅ **Build Caching**: Dependency and build caching enabled

## Deploying Other Next.js Projects

### Project Compatibility Requirements

Ensure your `package.json` includes:

```json
{
  "scripts": {
    "build": "next build",
    "start": "next start"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### Setup Process

1. **Follow Setup Steps**: Use the same Vercel setup process outlined above
2. **Configure Environment Variables**: Add any required variables in Vercel dashboard
3. **Custom Domain**: Optional custom domain configuration in Vercel settings
4. **Build Settings**: Adjust build/install commands if needed

## Troubleshooting

### Common Deployment Issues

#### Build Failures

- **Check CI Logs**: Review GitHub Actions logs for the failing step
- **Local Testing**: Ensure `npm run build` works locally
- **Dependencies**: Verify all dependencies are in package.json
- **Node Version**: Confirm Node.js version compatibility

#### Environment Variable Issues

- **Missing Variables**: Ensure all required variables are set in Vercel
- **Environment Scope**: Check variable scope (Production/Preview/Development)
- **Variable Names**: Verify exact variable names and values

#### Node.js Version Conflicts

- **Package.json**: Verify `engines` field specifies correct Node version
- **Vercel Settings**: Check Node.js version in Vercel project settings
- **Dependencies**: Ensure all dependencies support the Node version

#### Dependency Issues

- **Lock File**: Ensure `package-lock.json` is committed to repository
- **Clean Install**: Try deleting node_modules and reinstalling locally
- **Audit**: Run `npm audit` to check for security vulnerabilities

### Debug Steps

1. **Local Verification**:

   ```bash
   npm run build    # Ensure local build works
   npm run start    # Test production build locally
   ```

2. **Vercel Logs**:
   - Check build logs in Vercel dashboard
   - Review function logs for runtime errors
   - Monitor performance metrics

3. **GitHub Actions**:
   - Verify CI pipeline passes completely
   - Check all workflow steps succeed
   - Ensure deployment step executes

### Support Resources

- **Vercel Documentation**: <https://vercel.com/docs>
- **Next.js Deployment**: <https://nextjs.org/docs/deployment>
- **GitHub Actions**: <https://docs.github.com/en/actions>
- **Project Issues**: <https://github.com/mikiwiik/instructions-only-claude-coding/issues>

---

This deployment guide ensures reliable, automated production deployments with comprehensive monitoring and
troubleshooting capabilities.
