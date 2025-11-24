# Spotify Stats Dashboard

A production-ready web application that displays real-time Spotify statistics, including the top 500 artists by monthly listeners and the top 100 tracks by daily streams. The app scrapes data from kworb.net and enriches it with metadata from the Spotify Web API.

## Features

- **Top 500 Artists**: Monthly listeners, rank changes, genres, and Spotify links
- **Top 100 Tracks**: Daily streams, rank changes, preview audio, and Spotify links
- **Real-time Data**: Automatic refresh twice daily (00:00 and 12:00 UTC)
- **Search & Filter**: Search artists and tracks, sort by various criteria
- **Rank Tracking**: See position changes with visual indicators
- **Spotify Integration**: Enriched with images, genres, preview URLs, and direct Spotify links

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite (development) / PostgreSQL (production) via Prisma
- **Scraping**: Cheerio for HTML parsing
- **API**: Spotify Web API (Client Credentials flow)

## Prerequisites

- Node.js 18+ and npm
- Spotify Developer Account (for API credentials)
- Vercel account (for deployment) or similar platform

## Local Development Setup

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd ChatGuru_cursor
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- `SPOTIFY_CLIENT_ID`: Your Spotify app client ID
- `SPOTIFY_CLIENT_SECRET`: Your Spotify app client secret
- `ADMIN_SECRET`: A secret string for manual refresh (choose a strong password)
- `DATABASE_URL`: For local dev, SQLite is used automatically (`file:./dev.db`)

### 3. Set Up Database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npm run db:push
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Initial Data Load

On first run, you'll need to trigger a data refresh. You can do this by:

1. Using the "Refresh Now" button in the UI (requires admin secret)
2. Or calling the API directly:

```bash
curl -X POST http://localhost:3000/api/cron/refresh \
  -H "Content-Type: application/json" \
  -d '{"secret": "your_admin_secret"}'
```

## Deployment to Vercel

### Step 1: Prepare Your Repository

1. Initialize git (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. Push to GitHub:
   ```bash
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

### Step 3: Configure Environment Variables

In Vercel dashboard, go to your project → Settings → Environment Variables, and add:

- `SPOTIFY_CLIENT_ID`: Your Spotify client ID
- `SPOTIFY_CLIENT_SECRET`: Your Spotify client secret
- `ADMIN_SECRET`: Your admin secret (same as local)
- `DATABASE_URL`: For production, use a PostgreSQL connection string:
  - You can use Vercel Postgres, or
  - A service like [Supabase](https://supabase.com), [Neon](https://neon.tech), or [Railway](https://railway.app)

**Example PostgreSQL connection string:**
```
postgresql://user:password@host:5432/database?sslmode=require
```

### Step 4: Update Prisma for PostgreSQL (Production)

If using PostgreSQL in production, update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // Change from "sqlite"
  url      = env("DATABASE_URL")
}
```

Then run:
```bash
npx prisma db push
```

### Step 5: Configure Cron Jobs

Vercel cron jobs are configured in `vercel.json`. The configuration is already set up for:
- Daily at 00:00 UTC
- Daily at 12:00 UTC

**Important**: For Vercel cron to work, you need to:

1. Ensure `vercel.json` is in your repo (already included)
2. The cron endpoint must be accessible (it's protected by `ADMIN_SECRET`)
3. In Vercel dashboard → Settings → Cron Jobs, verify the crons are listed

The cron will call `/api/cron/refresh` with an Authorization header. Update the cron endpoint if needed to match Vercel's cron format.

### Step 6: Set Up Custom Domain

1. In Vercel dashboard → Settings → Domains
2. Add your custom domain (e.g., `spotify-stats.yourdomain.com`)
3. Vercel will provide DNS records to add:
   - **CNAME**: Point your subdomain to `cname.vercel-dns.com`
   - Or **A record**: Use Vercel's IP addresses (if using root domain)
4. Add the DNS records at your domain registrar
5. Wait for DNS propagation (usually a few minutes to hours)
6. Vercel automatically provisions SSL certificates via Let's Encrypt

### Step 7: Deploy

1. Push any changes to trigger a new deployment, or
2. Click "Redeploy" in Vercel dashboard

## Project Structure

```
/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── stats/
│   │   │   │   ├── artists/route.ts
│   │   │   │   ├── tracks/route.ts
│   │   │   │   └── last-updated/route.ts
│   │   │   └── cron/
│   │   │       └── refresh/route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx           # Main dashboard page
│   ├── components/
│   │   ├── ArtistTable.tsx
│   │   └── TrackTable.tsx
│   └── lib/
│       ├── db.ts              # Prisma client
│       ├── types.ts            # TypeScript interfaces
│       ├── scraping/
│       │   ├── kworbArtists.ts
│       │   └── kworbTracks.ts
│       ├── services/
│       │   └── statsProvider.ts
│       └── spotify/
│           ├── auth.ts
│           └── metadata.ts
├── .env.example
├── next.config.js
├── package.json
├── vercel.json                # Vercel cron configuration
└── README.md
```

## How It Works

### Data Flow

1. **Scraping**: Twice daily, the cron job calls `/api/cron/refresh`
2. **kworb.net**: Scrapes HTML tables from:
   - `https://kworb.net/spotify/listeners.html` (artists)
   - `https://kworb.net/spotify/country/global_daily.html` (tracks)
3. **Storage**: Saves snapshots to database
4. **Rank Calculation**: Compares current rank with previous snapshot to compute deltas
5. **Enrichment**: Uses Spotify Web API to fetch:
   - Artist images, genres, Spotify URLs
   - Track cover art, preview URLs, Spotify URLs
6. **Display**: Frontend fetches from `/api/stats/artists` and `/api/stats/tracks`

### Database Schema

- **ArtistSnapshot / TrackSnapshot**: Historical snapshots for rank delta calculation
- **ArtistCurrent / TrackCurrent**: Current stats with computed deltas and enriched metadata

## Maintenance & Troubleshooting

### Manual Refresh

You can trigger a manual refresh via:
- UI button (requires admin secret)
- API call: `POST /api/cron/refresh` with `{"secret": "your_secret"}`

### Rate Limiting

The Spotify API has rate limits. The code includes delays between requests. If you hit limits:
- Wait and retry
- Consider caching metadata more aggressively
- Use Spotify's batch endpoints if available

### Scraping Failures

If kworb.net changes their HTML structure:
1. Check the scraping functions in `src/lib/scraping/`
2. Update the Cheerio selectors to match the new structure
3. Test locally before deploying

### Database Issues

- **SQLite (local)**: Database file is in `prisma/dev.db`
- **PostgreSQL (production)**: Ensure connection string is correct and database exists
- Use `npx prisma studio` to inspect data locally

## Legal & Ethical Considerations

- **kworb.net**: Public data, but be respectful with scraping frequency
- **Spotify Web API**: Follow their [Developer Terms](https://developer.spotify.com/terms/)
- **Rate Limiting**: Built-in delays to respect API limits
- **Terms of Service**: Ensure compliance with kworb.net and Spotify ToS

## License

This project is provided as-is for educational and personal use.

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the code comments
3. Check Vercel deployment logs
4. Verify environment variables are set correctly
