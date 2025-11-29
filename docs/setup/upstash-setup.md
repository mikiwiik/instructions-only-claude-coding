# Upstash Redis Setup Guide

This guide walks you through setting up Upstash Redis for the todo application backend.

## Prerequisites

- Vercel account with project deployed
- Upstash account (free tier available)
- Command-line access for local development setup

## Overview

Upstash Redis provides serverless Redis with:

- **10,000 commands/day** on free tier
- **256MB storage** on free tier
- **Global edge replication**
- **REST API** (works with serverless/edge functions)

## Step-by-Step Setup Instructions

### 1. Create Upstash Account

1. Go to [https://console.upstash.com](https://console.upstash.com)
2. Sign up with GitHub, Google, or email
3. Complete the registration process

### 2. Create Redis Database

1. Click **"Create Database"** button
2. Configure the database:
   - **Name**: `todo-app-redis` (or your preferred name)
   - **Type**: Regional (or Global for multi-region)
   - **Region**: Select closest to your users (recommend `us-east-1` for Vercel)
   - **TLS**: Enabled (default)
3. Click **"Create"** button
4. Wait for database creation (usually instant)

### 3. Get Environment Variables

After the database is created:

1. You'll be on the database details page
2. Scroll to **"REST API"** section
3. You'll see environment variables displayed:

   ```bash
   UPSTASH_REDIS_REST_URL=https://your-database-name.upstash.io
   UPSTASH_REDIS_REST_TOKEN=AXxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

4. Click **"Copy"** buttons to copy each value

### 4. Add Environment Variables to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `instructions-only-claude-coding`
3. Click **"Settings"** tab
4. Click **"Environment Variables"** in the left sidebar
5. Add each variable:

   **First Variable:**

   - Click **"Add"** button
   - Name: `UPSTASH_REDIS_REST_URL`
   - Value: Paste the URL from step 3
   - Environment: Select **All** (Production, Preview, Development)
   - Click **"Save"**

   **Second Variable:**

   - Click **"Add"** button again
   - Name: `UPSTASH_REDIS_REST_TOKEN`
   - Value: Paste the token from step 3
   - Environment: Select **All** (Production, Preview, Development)
   - Click **"Save"**

### 5. Set Up Local Development

For local development, create a `.env.local` file:

1. In your project root directory:

   ```bash
   touch .env.local
   ```

2. Add the environment variables:

   ```bash
   UPSTASH_REDIS_REST_URL=https://your-database-name.upstash.io
   UPSTASH_REDIS_REST_TOKEN=AXxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

3. **Important**: `.env.local` is in `.gitignore` - never commit it

4. Restart your development server:

   ```bash
   npm run dev
   ```

### 6. Verify Connection

#### Local Development

1. Start the development server: `npm run dev`
2. Open [http://localhost:3000](http://localhost:3000)
3. Add a todo item
4. Refresh the page - todos should persist

#### Upstash Console Verification

1. Go to Upstash Console → Your database
2. Click **"Data Browser"** tab
3. You should see keys like: `shared:list:main-list`
4. Click on a key to see the stored data

### 7. Deploy to Production

1. Commit and push your changes
2. Vercel will automatically deploy
3. Environment variables are already configured (step 4)
4. Test the production app

## Troubleshooting

### Error: "UPSTASH_REDIS_REST_URL is not defined"

**Cause**: Environment variables not set

**Solution**:

1. Check Vercel Dashboard → Settings → Environment Variables
2. Verify both variables are present and enabled for all environments
3. Redeploy the project

### Error: "Unauthorized" or "Invalid token"

**Cause**: Incorrect token value

**Solution**:

1. Go to Upstash Console → Your database
2. Copy the correct `UPSTASH_REDIS_REST_TOKEN`
3. Update in Vercel settings and `.env.local`
4. Redeploy/restart dev server

### Data Not Persisting

**Cause**: API not connecting to Upstash

**Solution**:

1. Check browser console for API errors
2. Verify environment variables are set correctly
3. Check `app/lib/kv-store.ts` uses `@upstash/redis` package
4. Verify API routes are called correctly

## Cost Monitoring

### Free Tier Limits

- **Commands**: 10,000 per day
- **Storage**: 256MB
- **Bandwidth**: 50GB per month

### Expected Usage (Educational Project)

- **Commands**: ~100-500/day (well within limits)
- **Storage**: < 1MB
- **Cost**: $0

### Monitor Usage

1. Go to Upstash Console
2. Select your database
3. View **"Usage"** tab for metrics

## Security Notes

- **Never commit** `.env.local` to git
- **Never share** your `UPSTASH_REDIS_REST_TOKEN` publicly
- **Rotate tokens** if exposed: Upstash Console → Database → Settings → Reset Token

## Support

- **Upstash Docs**: [https://upstash.com/docs/redis](https://upstash.com/docs/redis)
- **Upstash Discord**: [https://upstash.com/discord](https://upstash.com/discord)
- **Project Issues**: [GitHub Issues](https://github.com/mikiwiik/instructions-only-claude-coding/issues)
