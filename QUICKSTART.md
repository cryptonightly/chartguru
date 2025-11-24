# Quick Start Guide

Get the Spotify Stats Dashboard running locally in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Spotify Developer account (free)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Get Spotify API Credentials

1. Go to https://developer.spotify.com/dashboard
2. Create a new app
3. Copy your **Client ID** and **Client Secret**

## Step 3: Set Up Environment

```bash
cp .env.example .env
```

Edit `.env` and add:
```
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
ADMIN_SECRET=any_random_string_here
DATABASE_URL="file:./dev.db"
```

## Step 4: Initialize Database

```bash
npx prisma generate
npm run db:push
```

## Step 5: Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

## Step 6: Load Initial Data

The dashboard will be empty until you trigger a data refresh. Click the "Refresh Now" button and enter your `ADMIN_SECRET` when prompted.

Alternatively, use curl:

```bash
curl -X POST http://localhost:3000/api/cron/refresh \
  -H "Content-Type: application/json" \
  -d '{"secret": "your_admin_secret_here"}'
```

Wait a few minutes for the scraping and enrichment to complete, then refresh the page.

## Troubleshooting

**"Cannot find module" errors**: Run `npm install` again

**Database errors**: Run `npx prisma generate && npm run db:push`

**No data showing**: Trigger a manual refresh (see Step 6)

**Scraping fails**: Check if kworb.net is accessible. The HTML structure may have changed.

## Next Steps

- See [README.md](./README.md) for full documentation
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment

