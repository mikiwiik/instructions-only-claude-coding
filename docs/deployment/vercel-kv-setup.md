# Vercel KV Setup Guide

This guide walks you through setting up Vercel KV (Redis-compatible key-value storage) for the todo application backend.

## Prerequisites

- Vercel account with project deployed
- Admin access to Vercel project: `instructions-only-claude-coding`
- Command-line access for local development setup

## Overview

Vercel KV provides Redis-compatible storage with:

- **30GB storage** on free tier
- **100k requests/month** on free tier
- **Global edge replication**
- **Zero configuration** deployment integration

## Step-by-Step Setup Instructions

### 1. Navigate to Vercel Dashboard

1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project: `instructions-only-claude-coding`
3. You should see the project overview page

### 2. Create Vercel KV Database

1. Click the **"Storage"** tab in the left sidebar
2. Click **"Create Database"** button
3. Select **"KV"** (Key-Value Store) from the database type options
4. Configure the database:
   - **Name**: `todo-app-kv` (or your preferred name)
   - **Region**: Select same region as your deployment (recommend `iad1` - Washington D.C.)
   - **Primary Region**: Leave as default
5. Click **"Create"** button
6. Wait for database creation (usually takes 10-30 seconds)

### 3. Get Environment Variables

After the database is created:

1. You'll be redirected to the database overview page
2. Click the **".env.local"** tab (or **"Connect"** button)
3. You'll see environment variables displayed:

   ```bash
   KV_REST_API_URL=https://your-project-name-kv-abcd1234.kv.vercel-storage.com
   KV_REST_API_TOKEN=AXxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   KV_REST_API_READ_ONLY_TOKEN=AYyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
   ```

4. Keep this page open - you'll need these values in the next steps

### 4. Add Environment Variables to Vercel Project

1. Go back to your project (click project name in breadcrumbs)
2. Click **"Settings"** tab
3. Click **"Environment Variables"** in the left sidebar
4. Add each variable:

   **First Variable:**

   - Click **"Add"** button
   - Name: `KV_REST_API_URL`
   - Value: Paste the URL from step 3
   - Environment: Select **All** (Production, Preview, Development)
   - Click **"Save"**

   **Second Variable:**

   - Click **"Add"** button again
   - Name: `KV_REST_API_TOKEN`
   - Value: Paste the token from step 3
   - Environment: Select **All** (Production, Preview, Development)
   - Click **"Save"**

5. You should now see both variables listed

### 5. Set Up Local Development Environment

For local development, you need to add the environment variables to your local machine:

1. In your project root directory, create a `.env.local` file:

   ```bash
   touch .env.local
   ```

2. Copy the environment variables from Vercel dashboard (step 3) and paste them into `.env.local`:

   ```bash
   KV_REST_API_URL=https://your-project-name-kv-abcd1234.kv.vercel-storage.com
   KV_REST_API_TOKEN=AXxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

3. **Important**: `.env.local` is already in `.gitignore` and should **never** be committed to git

4. Restart your development server to load the new environment variables:

   ```bash
   npm run dev
   ```

### 6. Verify Connection

#### Local Development

1. Start the development server:

   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000)
3. Try adding a todo item
4. Check the browser console for any errors
5. Refresh the page - todos should persist (now stored in Vercel KV, not localStorage)

#### Vercel Dashboard Verification

1. Go to Vercel Dashboard → Storage → KV
2. Click on your `todo-app-kv` database
3. Click the **"Data"** tab
4. After using the app, you should see keys like:
   - `shared:list:main-list`
5. Click on a key to see the stored data structure

### 7. Deploy to Production

1. Commit your code changes (vercel.json, .env.example, updated code)
2. Push to your git repository:

   ```bash
   git push origin your-branch-name
   ```

3. Vercel will automatically deploy
4. Check the deployment logs in Vercel dashboard:
   - Go to **"Deployments"** tab
   - Click on the latest deployment
   - Check **"Build Logs"** for any errors related to KV connection

5. Test the production app:
   - Visit your production URL
   - Add a todo
   - Refresh the page
   - Todo should persist

### 8. Verify Production Deployment

1. Visit your production URL: `https://instructions-only-claude-coding.vercel.app`
2. Open browser DevTools → Console tab
3. Add a todo item
4. Check for any errors in console
5. Refresh the page - data should persist
6. Go to Vercel Dashboard → Storage → KV → Data tab
7. Verify new keys appear for production usage

## Troubleshooting

### Error: "KV_REST_API_URL is not defined"

**Cause**: Environment variables not set in Vercel project settings

**Solution**:

1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Verify `KV_REST_API_URL` and `KV_REST_API_TOKEN` are present
3. Check they're enabled for all environments (Production, Preview, Development)
4. Redeploy the project

### Error: "Unauthorized" or "Invalid token"

**Cause**: Incorrect `KV_REST_API_TOKEN` value

**Solution**:

1. Go to Vercel Dashboard → Storage → KV → Your database
2. Click ".env.local" tab
3. Copy the correct `KV_REST_API_TOKEN` value
4. Update the environment variable in Vercel settings
5. For local development, update `.env.local`
6. Restart dev server: `npm run dev`

### Error: "Connection refused" or "Timeout"

**Cause**: KV database and deployment in different regions

**Solution**:

1. Check KV database region: Storage → KV → Your database → Settings
2. Check deployment region: Project → Settings → Functions
3. Ensure they're in the same or nearby regions
4. If needed, recreate KV database in correct region

### Error: localStorage data not migrating

**Note**: In the current implementation, there's **no automatic migration**. This is intentional.

**What to do**:

1. Open browser DevTools → Console
2. Run: `localStorage.clear()`
3. Refresh the page
4. Start fresh with server-backed storage

### Data Not Persisting After Refresh

**Cause**: API routes not calling Vercel KV correctly

**Solution**:

1. Check browser console for API errors
2. Check Vercel deployment logs
3. Verify environment variables are set correctly
4. Check `app/lib/kv-store.ts` is using `@vercel/kv` package
5. Verify API routes (`app/api/shared/[listId]/sync/route.ts`) are called correctly

## Cost Monitoring

### Free Tier Limits

- **Storage**: 30GB
- **Requests**: 100,000 per month
- **Bandwidth**: Included in Vercel free tier

### Expected Usage (Educational Project)

- **Storage**: < 1MB (todos are small JSON objects)
- **Requests**: ~1,000-5,000/month (depending on usage)
- **Cost**: $0 (well within free tier)

### Monitor Usage

1. Go to Vercel Dashboard
2. Click **Storage** → **KV** → Your database
3. Click **"Usage"** tab
4. Monitor:
   - Storage used
   - Request count
   - Bandwidth

### If You Exceed Free Tier

- First 100k requests free
- After that: $0.30 per 100k requests
- Storage: First 30GB free, then $0.25/GB per month

For this educational project, you should **never** exceed free tier limits.

## Next Steps

After Vercel KV is set up and working:

1. Test all CRUD operations (create, read, update, delete todos)
2. Verify real-time sync works across browser tabs
3. Test on multiple devices using the same URL
4. Consider implementing backup strategy (separate issue)
5. Consider implementing unique URLs per user (separate issue)

## Security Notes

- **Never commit** `.env.local` to git (already in `.gitignore`)
- **Never share** your `KV_REST_API_TOKEN` publicly
- **Rotate tokens** if accidentally exposed:
  1. Go to Storage → KV → Your database → Settings
  2. Click "Regenerate Token"
  3. Update environment variables in Vercel and `.env.local`

## Support

- **Vercel KV Docs**: [https://vercel.com/docs/storage/vercel-kv](https://vercel.com/docs/storage/vercel-kv)
- **Vercel Support**: [https://vercel.com/support](https://vercel.com/support)
- **Project Issues**: [GitHub Issues](https://github.com/mikiwiik/instructions-only-claude-coding/issues)
