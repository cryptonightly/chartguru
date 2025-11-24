# Vercel Cron Jobs Setup

## Current Configuration

The `vercel.json` file contains cron job definitions that run at 00:00 and 12:00 UTC:

```json
{
  "crons": [
    {
      "path": "/api/cron/refresh",
      "schedule": "0 0 * * *"
    },
    {
      "path": "/api/cron/refresh",
      "schedule": "0 12 * * *"
    }
  ]
}
```

## How Vercel Cron Works

Vercel cron jobs send requests to your endpoint with an `Authorization` header. The format may vary, so the endpoint checks for:

1. `Authorization: Bearer <ADMIN_SECRET>` header (from Vercel cron)
2. `?secret=<ADMIN_SECRET>` query parameter (for manual testing)

## Setting Up Cron Secret in Vercel

1. Go to your Vercel project → **Settings** → **Cron Jobs**
2. For each cron job, you can set a **Cron Secret**
3. Set the cron secret to match your `ADMIN_SECRET` environment variable
4. Vercel will send this as: `Authorization: Bearer <cron-secret>`

## Alternative: Use Vercel's Built-in Cron Secret

If Vercel provides a built-in cron secret (check Vercel dashboard), you can:

1. Use that secret as your `ADMIN_SECRET`, OR
2. Update the cron endpoint to check for Vercel's specific header format

## Testing Cron Jobs

### Test Locally

```bash
curl -X GET "http://localhost:3000/api/cron/refresh?secret=your_admin_secret"
```

### Test in Production

```bash
curl -X GET "https://your-domain.com/api/cron/refresh?secret=your_admin_secret"
```

### Verify Cron Execution

1. Check Vercel dashboard → **Functions** → View logs
2. Look for requests to `/api/cron/refresh` at scheduled times
3. Check function execution logs for any errors

## Troubleshooting

**Cron jobs not running:**
- Verify `vercel.json` is in your repository root
- Check that cron jobs appear in Vercel dashboard → Settings → Cron Jobs
- Ensure `ADMIN_SECRET` matches the cron secret in Vercel
- Check function logs for authentication errors

**401 Unauthorized errors:**
- Verify `ADMIN_SECRET` environment variable is set in Vercel
- Check that the cron secret in Vercel matches `ADMIN_SECRET`
- Update the cron endpoint if Vercel uses a different header format

**Timeout errors:**
- The refresh runs in the background to avoid timeouts
- Check function logs to see if refresh completed
- Consider using Vercel's background functions for long-running tasks

## Manual Cron Alternative

If Vercel cron doesn't work, you can use external cron services:

1. **cron-job.org** (free): Set up HTTP requests to your endpoint
2. **EasyCron**: Schedule HTTP calls with authentication
3. **GitHub Actions**: Use GitHub's scheduled workflows to call your API

For external cron services, use the query parameter method:
```
https://your-domain.com/api/cron/refresh?secret=your_admin_secret
```

