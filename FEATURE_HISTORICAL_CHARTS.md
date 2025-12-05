# Historical Trend Charts Feature

## Overview

Your Spotify Stats Dashboard now includes interactive historical trend charts that display how artists and tracks have performed over time. Users can view:

- **Artist trends**: Monthly listeners and rank changes over time
- **Track trends**: Daily streams and rank changes over time

## What Was Added

### 1. New Dependencies
- **recharts**: Professional charting library for React (installed via npm)

### 2. API Endpoints

#### Artist History
- **Endpoint**: `/api/stats/artist/[artistId]/history`
- **Method**: GET
- **Query Parameters**:
  - `country` (default: 'global')
  - `days` (default: 30)
- **Response**: Historical snapshots of artist performance

#### Track History
- **Endpoint**: `/api/stats/tracks/history`
- **Method**: GET
- **Query Parameters**:
  - `trackName` (required)
  - `artistName` (required)
  - `country` (default: 'global')
  - `days` (default: 30)
- **Response**: Historical snapshots of track performance

### 3. New Components

#### ArtistHistoryChart (`src/components/ArtistHistoryChart.tsx`)
- Displays two charts:
  1. Monthly listeners trend (green line)
  2. Rank trend - inverted scale (blue line, lower is better)
- Auto-loads data from API
- Shows loading spinner while fetching
- Graceful handling of missing data

#### TrackHistoryChart (`src/components/TrackHistoryChart.tsx`)
- Displays two charts:
  1. Daily streams trend (green line)
  2. Rank trend - inverted scale (blue line, lower is better)
- Auto-loads data from API
- Shows loading spinner while fetching
- Graceful handling of missing data

#### TrackModal (`src/components/TrackModal.tsx`)
- New modal component for track details
- Shows track image, stats, and links
- Includes historical trend charts
- Similar design to ArtistModal

### 4. Updated Components

#### ArtistModal
- Now includes historical trend charts at the bottom
- Shows 30 days of data by default
- Seamlessly integrated with existing content

#### TrackTable
- Track rows are now clickable
- Clicking a track opens the TrackModal with charts
- Maintains existing search and sort functionality

### 5. Updated Types
New TypeScript interfaces in `src/lib/types.ts`:
- `ArtistHistoryDataPoint`
- `TrackHistoryDataPoint`
- `ArtistHistoryResponse`
- `TrackHistoryResponse`

## How to Use

### Viewing Artist Trends
1. Navigate to your dashboard at `http://localhost:3000` (or your deployed URL)
2. Click on any artist name in the artist tables
3. Scroll down in the modal to see "Historical Trends"
4. View two charts showing listener count and rank changes over the last 30 days

### Viewing Track Trends
1. Navigate to the tracks section on your dashboard
2. Click on any track row in the tracks table
3. The track modal opens showing:
   - Track details and stats
   - Links to Spotify and preview
   - Historical trend charts at the bottom

### Understanding the Charts

**Monthly Listeners / Daily Streams Chart**
- Green line shows the trend
- Y-axis shows formatted numbers (K for thousands, M for millions)
- X-axis shows dates
- Hover over points to see exact values

**Rank Chart**
- Blue line shows rank changes
- Y-axis is inverted (lower rank = better position)
- Movement down on chart = improvement in ranking
- Movement up on chart = drop in ranking

## Data Requirements

**Important**: Historical data accumulates over time through snapshots. 

- **First deployment**: Charts will show "No historical data available yet"
- **After first refresh**: Charts will show 1 data point
- **After multiple refreshes**: Charts will show trend lines as data accumulates
- **Optimal viewing**: Wait for at least 3-5 data refreshes (multiple days with cron jobs)

The dashboard refreshes data twice daily via cron jobs, so trend data will build up naturally.

## Technical Details

### Chart Features
- Responsive design (adapts to screen size)
- Interactive tooltips on hover
- Formatted numbers (K/M/B abbreviations)
- Color-coded (green for positive metrics, blue for rankings)
- Loading states and error handling
- Empty state messaging

### Performance
- Charts only load when modals are opened
- Data is fetched on-demand
- Efficient rendering with recharts library
- No impact on initial page load

### Database Queries
- Uses existing `ArtistSnapshot` and `TrackSnapshot` tables
- Queries are date-range filtered for performance
- Sorted by `createdAt` for chronological display

## Deployment Notes

When deploying to Vercel/production:

1. **No additional environment variables needed** - uses existing database
2. **Database migrations**: None required (uses existing tables)
3. **Build process**: Charts are automatically included in Next.js build
4. **Dependencies**: recharts is added to package.json

## Future Enhancements

Potential improvements you could add:
- Time range selector (7 days, 30 days, 90 days, all time)
- Compare multiple artists/tracks
- Export chart data to CSV
- Zoom and pan functionality
- Additional metrics (genre trends, country comparisons)
- Predictive trend lines
- Peak/valley markers

## Files Modified

**New Files:**
- `src/app/api/stats/artist/[artistId]/history/route.ts`
- `src/app/api/stats/tracks/history/route.ts`
- `src/components/ArtistHistoryChart.tsx`
- `src/components/TrackHistoryChart.tsx`
- `src/components/TrackModal.tsx`
- `FEATURE_HISTORICAL_CHARTS.md` (this file)

**Modified Files:**
- `src/components/ArtistModal.tsx`
- `src/components/TrackTable.tsx`
- `src/lib/types.ts`
- `package.json` (recharts dependency)
- `package-lock.json`

## Testing Locally

### Important: Database Setup

**Main Branch (Local Development)**
- Uses SQLite database (`file:./dev.db`)
- Prisma schema is configured for `sqlite` provider
- Perfect for local testing

**Production Branch (Vercel Deployment)**
- Uses PostgreSQL database (Neon)
- Prisma schema uses `postgresql` provider
- For production deployment only

### Running Locally

```bash
# Ensure you're on main branch (SQLite)
git checkout main

# Prisma schema should show:
# datasource db {
#   provider = "sqlite"
#   url      = env("DATABASE_URL")
# }

# Generate Prisma client (if needed)
npx prisma generate

# Push schema to local SQLite database
npx prisma db push

# Start development server
npm run dev

# Visit http://localhost:3000
# Click on any artist or track to see the modals with charts

# Note: Charts will show "No historical data available yet"
# until you run data refresh multiple times to build up snapshots
```

### Deploying to Production

When you're ready to deploy the new charts feature:

```bash
# Commit your changes on main branch
git add .
git commit -m "Add historical trend charts feature"
git push origin main

# Vercel will automatically deploy from main branch
# Your production DATABASE_URL (Neon PostgreSQL) is already configured in Vercel
# No additional steps needed!
```

**Note**: You don't need a separate production branch since Vercel uses the `DATABASE_URL` environment variable which points to your Neon PostgreSQL database in production, while locally it points to SQLite.

## Support

If you encounter any issues:
1. Check browser console for errors
2. Verify database has snapshot data (run refresh at least once)
3. Ensure recharts is installed: `npm install recharts`
4. Check that all API endpoints return valid JSON

---

**Feature completed**: December 5, 2025
**Next.js Version**: 14.2.33
**Database**: PostgreSQL (Neon) or SQLite (local dev)