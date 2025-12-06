# Hostinger Deployment Troubleshooting Guide

## Common Issues with Neon Database on Hostinger

### Issue: 500 Errors - Database Connection Failures

If you're seeing 500 errors immediately when the app loads, it's likely a database connection issue. Here's how to troubleshoot:

## Step 1: Verify Environment Variables

### Check in Hostinger Dashboard

1. **Log into Hostinger** and go to your Node.js app
2. **Navigate to Environment Variables** section
3. **Verify `DATABASE_URL` is set correctly**

### Neon Connection String Format

Your Neon connection string should look like this:

```
postgresql://username:password@ep-xxxxx-xxxxx.region.aws.neon.tech/neondb?sslmode=require
```

**Important Notes:**
- ✅ Must include `?sslmode=require` at the end
- ✅ Use the **Connection Pooling URL** (not the direct connection URL)
- ✅ In Neon dashboard, look for "Connection string" → Select "Pooled connection" or "Session mode"

### How to Get the Correct Connection String from Neon

1. Go to [Neon Console](https://console.neon.tech)
2. Select your project
3. Go to **Dashboard** or **Connection Details**
4. Look for **"Connection string"** section
5. **Select "Pooled connection"** (recommended for serverless/Node.js apps)
6. Copy the full connection string including `?sslmode=require`

**Example of correct format:**
```
postgresql://neondb_owner:your_password@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require&pgbouncer=true
```

## Step 2: Test Database Connection

### Option A: Test from Hostinger Logs

1. Add a test endpoint to verify connection
2. Check Hostinger logs for connection errors

### Option B: Test Locally with Hostinger's Environment

1. Copy the exact `DATABASE_URL` from Hostinger
2. Create a `.env.local` file:
   ```bash
   DATABASE_URL="your_neon_connection_string_here"
   ```
3. Test connection:
   ```bash
   npx prisma db pull
   ```
   If this works, the connection string is correct.

## Step 3: Common Connection String Issues

### ❌ Wrong: Missing SSL Mode
```
postgresql://user:pass@host/db
```
**Fix:** Add `?sslmode=require`

### ❌ Wrong: Using Direct Connection (Not Pooled)
```
postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
```
**Fix:** Use pooled connection URL (adds `&pgbouncer=true` or use different endpoint)

### ❌ Wrong: Extra Spaces or Line Breaks
```
DATABASE_URL="postgresql://..." 
```
**Fix:** Remove any spaces, line breaks, or quotes in Hostinger environment variable

### ✅ Correct Format
```
postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
```

## Step 4: Check Hostinger-Specific Issues

### Build Process

Hostinger should run:
```bash
npm run build
```

This runs `prisma generate && next build`. Verify:
1. **Build logs** show "Prisma Client generated successfully"
2. **No errors** about missing `@prisma/client`

### Runtime Environment

1. **Node.js Version**: Hostinger should use Node.js 18+ or 20+
2. **Environment Variables**: Must be set **before** the build process
3. **Restart Required**: After changing environment variables, restart the app

## Step 5: Enhanced Error Logging

The updated `src/lib/db.ts` now includes better error handling. Check your Hostinger logs for:

- `Database connection: Configured` or `Database connection: Missing DATABASE_URL`
- Prisma error messages with connection details
- Timeout errors
- SSL/TLS errors

## Step 6: Verify Database is Accessible

### Check Neon Dashboard

1. Go to Neon Console → Your Project
2. Check **"Connection Status"** - should be "Active"
3. Check **"Usage"** - ensure you haven't hit connection limits
4. Verify **IP Allowlist** (if enabled) - Hostinger's IP might need to be whitelisted

### Test Connection from Neon SQL Editor

1. In Neon Console, go to **SQL Editor**
2. Run a simple query:
   ```sql
   SELECT 1;
   ```
3. If this works, the database is accessible

## Step 7: Connection Pooling Configuration

Neon requires connection pooling for serverless/Node.js apps. The connection string should include:

- **Pooled connection URL** (recommended)
- Or add `?pgbouncer=true` parameter

### How to Enable Pooling in Neon

1. In Neon Console → Your Project
2. Go to **Connection Details**
3. Select **"Pooled connection"** tab
4. Copy that connection string (it includes pooling automatically)

## Step 8: Network/Firewall Issues

### Check Neon IP Allowlist

1. In Neon Console → **Settings** → **IP Allowlist**
2. If you have IP restrictions enabled, you may need to:
   - Add Hostinger's server IP addresses
   - Or disable IP restrictions (if security allows)

### Check Hostinger Network

Some hosting providers block outbound connections. Verify:
- Hostinger allows outbound connections to `*.neon.tech` domains
- Port 5432 (PostgreSQL) is not blocked

## Step 9: Debugging Steps

### Add Temporary Debug Endpoint

Create a test API route to check connection:

```typescript
// src/app/api/test-db/route.ts
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Simple connection test
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ 
      status: 'success', 
      message: 'Database connection successful',
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 20) + '...'
    });
  } catch (error: any) {
    return NextResponse.json({ 
      status: 'error', 
      message: error.message,
      code: error.code,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
    }, { status: 500 });
  }
}
```

Then visit: `https://your-domain.com/api/test-db`

### Check Hostinger Logs

1. In Hostinger dashboard, go to **Logs** section
2. Look for:
   - Prisma errors
   - Connection timeout errors
   - SSL/TLS errors
   - "Can't reach database server" errors

## Step 10: Alternative Solutions

### If Connection Pooling Doesn't Work

Try using **Session mode** connection string instead of pooled:

1. In Neon Console → Connection Details
2. Select **"Session mode"** tab
3. Copy that connection string
4. Update `DATABASE_URL` in Hostinger

### If SSL Issues Persist

Try different SSL modes:
- `?sslmode=require` (default, recommended)
- `?sslmode=prefer` (fallback if require fails)
- `?sslmode=disable` (NOT recommended, only for testing)

## Quick Checklist

- [ ] `DATABASE_URL` is set in Hostinger environment variables
- [ ] Connection string includes `?sslmode=require`
- [ ] Using **pooled connection** URL from Neon
- [ ] No extra spaces/quotes in connection string
- [ ] Database is active in Neon dashboard
- [ ] IP allowlist allows Hostinger (if enabled)
- [ ] Build logs show Prisma Client generated successfully
- [ ] App restarted after setting environment variables

## Still Having Issues?

1. **Check Hostinger logs** for specific error messages
2. **Test connection locally** with the same connection string
3. **Contact Hostinger support** - they may have specific requirements
4. **Check Neon status page** - ensure service is operational
5. **Review Prisma logs** - the updated code now logs more details

## Useful Commands

### Test Connection Locally
```bash
# Set DATABASE_URL in .env.local
npx prisma db pull
```

### Generate Prisma Client
```bash
npx prisma generate
```

### Check Prisma Connection
```bash
npx prisma studio
```

### View Connection String Format
```bash
echo $DATABASE_URL
```

