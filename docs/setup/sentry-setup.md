# Sentry Error Monitoring Setup Guide

This guide walks you through setting up Sentry for error monitoring in the todo application.

## Prerequisites

- Vercel account with project deployed
- Sentry account (free tier available)
- Command-line access for local development setup

## Overview

Sentry provides error monitoring with:

- **5,000 errors/month** on free tier
- **10,000 performance transactions/month** on free tier
- **EU data residency** (Frankfurt) - matches our Vercel region
- **Next.js SDK** with automatic instrumentation

See [ADR-032](../adr/032-error-monitoring-solution.md) for the decision rationale.

## Step-by-Step Setup Instructions

### 1. Create Sentry Account

1. Go to [https://sentry.io/signup](https://sentry.io/signup)
2. Sign up with GitHub, Google, or email
3. **Important**: During organization setup, select **EU** as your data storage region
   - This ensures data residency in Frankfurt per our compliance requirements
   - The DSN will contain `.ingest.de.sentry.io` (EU endpoint)

### 2. Create Sentry Project

1. Click **"Create Project"** button
2. Select platform: **Next.js**
3. Configure the project:
   - **Project Name**: `todo-app` (or your preferred name)
   - **Team**: Select or create a team
4. Click **"Create Project"**
5. Skip the wizard setup (we have manual configuration)

### 3. Get Your DSN

After the project is created:

1. Go to **Settings** → **Projects** → Your project
2. Click **"Client Keys (DSN)"** in the left sidebar
3. Copy the **DSN** value, which looks like:

   ```text
   https://abc123@o123456.ingest.de.sentry.io/1234567
   ```

   Note: EU DSNs contain `.ingest.de.sentry.io`

### 4. Add Environment Variables to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `instructions-only-claude-coding`
3. Click **"Settings"** tab
4. Click **"Environment Variables"** in the left sidebar
5. Add each variable:

   **First Variable (Server-side):**
   - Click **"Add"** button
   - Name: `SENTRY_DSN`
   - Value: Paste the DSN from step 3
   - Environment: Select **All** (Production, Preview, Development)
   - Click **"Save"**

   **Second Variable (Client-side):**
   - Click **"Add"** button again
   - Name: `NEXT_PUBLIC_SENTRY_DSN`
   - Value: Paste the same DSN from step 3
   - Environment: Select **All** (Production, Preview, Development)
   - Click **"Save"**

   **Optional Variables (for source map uploads - improves stack traces):**
   - `SENTRY_ORG`: Your organization slug from the URL
   - `SENTRY_PROJECT`: Your project slug
   - `SENTRY_AUTH_TOKEN`: Create at Settings → Developer Settings → Organization Tokens
     - Click "Create New Token"
     - Scope: `org:ci` (default)
     - Copy the token value (shown only once)

### 5. Set Up Local Development

1. Copy the example environment file (see [.env.example](../../.env.example)):

   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Sentry DSN values in `.env.local`

3. Restart your development server:

   ```bash
   npm run dev
   ```

**Note**: `.env.local` is in `.gitignore` - never commit it

### 6. Verify Error Capture

#### Local Development (errors won't be sent)

Sentry is disabled in development (`enabled: process.env.NODE_ENV === 'production'`).
To test locally, you can temporarily modify `sentry.shared.ts`:

```typescript
// Temporarily for testing - don't commit this!
enabled: true,
```

#### Production Verification

**Important**: `console.error()` does NOT send to Sentry. Only uncaught exceptions are captured.

To test Sentry in production:

1. Deploy to Vercel (or use a Preview deployment)
2. Open browser DevTools console on your deployed app
3. Trigger a test error by running:

   ```javascript
   // This sends a test error to Sentry
   throw new Error('Sentry test error');
   ```

4. Go to Sentry Dashboard → **Issues**
5. Verify the error appears (may take 1-2 minutes) with:
   - Stack trace
   - Environment: `production`
   - Browser/device info

### 7. Deploy to Production

1. Commit and push your changes
2. Vercel will automatically deploy
3. Environment variables are already configured (step 4)
4. Errors will be captured automatically

## Configuration Files

The Sentry setup uses these files:

| File                        | Purpose                               |
| --------------------------- | ------------------------------------- |
| `sentry.shared.ts`          | Shared configuration for all runtimes |
| `sentry.server.config.ts`   | Server/Edge runtime initialization    |
| `instrumentation-client.ts` | Client-side (browser) initialization  |
| `instrumentation.ts`        | Next.js instrumentation hook          |
| `next.config.js`            | Sentry webpack plugin integration     |
| `app/lib/monitoring.ts`     | Custom event tracking utilities       |

## Using the Monitoring Utilities

### Track Rate Limit Events

```typescript
import { trackRateLimitEvent } from '@/lib/monitoring';

// When user approaches rate limit
trackRateLimitEvent('warning', {
  listId: 'abc123',
  remaining: 5,
  endpoint: '/api/shared/abc123/sync',
});

// When request is blocked
trackRateLimitEvent('blocked', {
  listId: 'abc123',
  endpoint: '/api/shared/abc123/sync',
});
```

### Capture Errors with Context

```typescript
import { captureError } from '@/lib/monitoring';

try {
  await syncTodos(listId);
} catch (error) {
  captureError(error, {
    listId,
    operation: 'sync',
    userId: 'anonymous',
  });
}
```

## Troubleshooting

### Error: "Sentry DSN is not defined"

**Cause**: Environment variables not set

**Solution**:

1. Check Vercel Dashboard → Settings → Environment Variables
2. Verify both `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN` are set
3. Redeploy the project

### Errors Not Appearing in Sentry

**Cause**: Sentry disabled in non-production

**Solution**:

1. Verify you're testing in production environment
2. Check `sentry.shared.ts` has `enabled: process.env.NODE_ENV === 'production'`
3. For local testing, temporarily set `enabled: true`

### Source Maps Not Working

**Cause**: Auth token not configured

**Solution**:

1. Create auth token: Sentry → Settings → Auth Tokens → Create New Token
2. Add to Vercel: `SENTRY_AUTH_TOKEN` environment variable
3. Add `SENTRY_ORG` and `SENTRY_PROJECT` variables
4. Redeploy

### EU Data Residency Verification

**Check**: Verify your DSN contains `.ingest.de.sentry.io`

**If incorrect**:

1. Go to Sentry → Settings → Organization Settings
2. Verify "Data Storage Location" is EU
3. If wrong, you may need to create a new organization with EU region

## Cost Monitoring

### Free Tier Limits

- **Errors**: 5,000 per month
- **Performance**: 10,000 transactions per month
- **Replays**: 500 sessions per month (disabled in our config)
- **Users**: 1 user

### Expected Usage (Educational Project)

- **Errors**: ~50-200/month (well within limits)
- **Performance**: ~500-2,000/month
- **Cost**: $0

### Monitor Usage

1. Go to Sentry Dashboard
2. Click **"Stats"** in the left sidebar
3. View usage metrics and quotas

## Security Notes

- **Never commit** `.env.local` to git
- **Never share** your `SENTRY_AUTH_TOKEN` publicly
- **DSN is safe** to expose in client-side code (it only allows sending errors)
- **Rotate tokens** if exposed: Sentry → Settings → Auth Tokens → Revoke

## Support

- **Sentry Docs**: [https://docs.sentry.io/platforms/javascript/guides/nextjs/](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- **Sentry Discord**: [https://discord.gg/sentry](https://discord.gg/sentry)
- **Project Issues**: [GitHub Issues](https://github.com/mikiwiik/instructions-only-claude-coding/issues)
- **ADR Reference**: [ADR-032: Error Monitoring Solution](../adr/032-error-monitoring-solution.md)
