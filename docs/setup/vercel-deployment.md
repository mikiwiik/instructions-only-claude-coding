# Production Deployment Guide

This guide covers deploying the Todo App to production using Vercel with automatic CI/CD integration.

## Live Demo

**🌐 Live Application**: [Todo App on Vercel](https://instructions-only-claude-coding.vercel.app/)

The Todo App is automatically deployed to Vercel and updated on every push to the main branch after CI passes.

## Vercel Deployment Setup

This project uses automatic deployment to Vercel with GitHub integration. Follow these steps to set up deployment for
this or similar projects.

> **📝 Configuration Overview**
>
> This project uses a minimal `vercel.json` configuration file for Upstash Redis backend integration. The file
> configures API function timeouts, deployment region (colocated with Redis storage), and environment variable references.
> All other settings (framework, build commands, Node version) are auto-detected from `package.json` and Next.js
> conventions.

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

#### 3. Configuration

Vercel automatically detects these settings from `package.json` and Next.js conventions:

```json
{
  "framework": "Next.js",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "nodeVersion": "22.x",
  "installCommand": "npm ci"
}
```

The project also includes a `vercel.json` for Upstash Redis backend configuration:

```json
{
  "functions": { "app/api/**/*.ts": { "maxDuration": 10 } },
  "regions": ["iad1"],
  "env": {
    "UPSTASH_REDIS_REST_URL": "@upstash-redis-rest-url",
    "UPSTASH_REDIS_REST_TOKEN": "@upstash-redis-rest-token"
  }
}
```

**Note**: See [Upstash Redis Setup Guide](upstash-setup.md) for complete backend configuration.

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

### Minimal Configuration

- **Framework Detection**: Automatic Next.js project recognition from `package.json`
- **Build Optimization**: Production-ready builds auto-configured from Next.js conventions
- **Performance**: Automatic CDN, compression, and caching
- **Upstash Redis Config**: Minimal `vercel.json` for backend integration (region, timeouts, env vars)

### Custom Domains

- **Free Subdomain**: Automatic `.vercel.app` subdomain
- **Custom Domains**: Optional custom domain configuration
- **SSL/HTTPS**: Automatic SSL certificate provisioning

## Environment Configuration

### Required Environment Variables

This project uses Upstash Redis for backend storage. Configure these variables in Vercel Dashboard:

| Variable | Description | Required |
|----------|-------------|----------|
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST API endpoint | Yes |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis authentication token | Yes |

### Setup Steps

1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` (from Upstash console)
3. Enable for all environments: Production, Preview, Development

See [Upstash Redis Setup Guide](upstash-setup.md) for detailed instructions.

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
- ✅ **Backend Storage**: Upstash Redis for persistent data

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
