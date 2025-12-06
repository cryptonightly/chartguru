# Hostinger + Neon Quick Fix Guide

## Most Common Issue: Connection String Format

### ✅ Correct Neon Connection String Format

Your `DATABASE_URL` in Hostinger should look like this:

```
postgresql://username:password@ep-xxxxx-pooler.region.aws.neon.tech/neondb?sslmode=require
```

**Key Requirements:**
1. ✅ Must include `?sslmode=require` at the end
2. ✅ Use **pooled connection** URL (has `-pooler` in hostname or `pgbouncer=true` parameter)
3. ✅ No extra spaces, quotes, or line breaks
4. ✅ Full connection string on one line

### How to Get the Correct String from Neon

1. Go to [Neon Console](https://console.neon.tech) → Your Project
2. Click **"Connection Details"** or **"Dashboard"**
3. Find **"Connection string"** section
4. Select **"Pooled connection"** tab (NOT "Direct connection")
5. Copy the entire string
6. Paste it directly into Hostinger's `DATABASE_URL` environment variable

### ❌ Common Mistakes

**Mistake 1: Missing SSL Mode**
```
postgresql://user:pass@host/db
```
**Fix:** Add `?sslmode=require`

**Mistake 2: Using Direct Connection**
```
postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
```
**Fix:** Use pooled connection (different endpoint)

**Mistake 3: Extra Quotes or Spaces**
```
DATABASE_URL="postgresql://..." 
```
**Fix:** Remove quotes and spaces

## Quick Diagnostic Steps

### Step 1: Test Connection Endpoint

After deploying, visit:
```
https://your-domain.com/api/test-db
```

This will show:
- ✅ If `DATABASE_URL` is set
- ✅ Connection string format
- ✅ Connection test results
- ✅ Specific error messages and suggestions

### Step 2: Check Hostinger Logs

1. Go to Hostinger dashboard → Your App → **Logs**
2. Look for:
   - `P1001` error = Can't reach database
   - `P1000` error = Authentication failed
   - SSL/TLS errors = Missing `?sslmode=require`

### Step 3: Verify in Neon Dashboard

1. Go to Neon Console → Your Project
2. Check **"Connection Status"** = Active
3. Check **"Usage"** = No connection limits hit
4. Check **"IP Allowlist"** = Not blocking Hostinger (if enabled)

## Quick Fix Checklist

- [ ] Using **pooled connection** URL from Neon (not direct)
- [ ] Connection string includes `?sslmode=require`
- [ ] No spaces, quotes, or line breaks in `DATABASE_URL`
- [ ] Environment variable set **before** build/deploy
- [ ] App restarted after setting environment variable
- [ ] Database is active in Neon console
- [ ] Test endpoint `/api/test-db` shows connection details

## Still Not Working?

1. **Copy exact connection string** from Neon (pooled connection)
2. **Remove all quotes/spaces** when pasting into Hostinger
3. **Restart the app** in Hostinger dashboard
4. **Check `/api/test-db`** endpoint for specific error
5. **Review Hostinger logs** for Prisma error codes

## Need More Help?

See `HOSTINGER_TROUBLESHOOTING.md` for detailed troubleshooting steps.

