# Deployment Guide: Spotify Stats Dashboard

This guide provides step-by-step instructions for deploying the Spotify Stats Dashboard to Vercel with a custom domain.

## Prerequisites

- ✅ GitHub account
- ✅ Vercel account (free tier works)
- ✅ Spotify Developer account
- ✅ Domain name (optional, for custom domain)

## Step 1: Get Spotify API Credentials

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click "Create App"
3. Fill in:
   - **App name**: Spotify Stats Dashboard
   - **App description**: Dashboard for Spotify statistics
   - **Redirect URI**: `http://localhost:3000` (for local testing)
   - Accept terms and create
4. Copy your **Client ID** and **Client Secret**
5. Save these for Step 4

## Step 2: Push Your Project to GitHub

This step will guide you through creating a GitHub repository and pushing your code to it.

### 2.1 Create a GitHub Repository

1. **Sign in to GitHub**: Go to [github.com](https://github.com) and sign in to your account
2. **Create New Repository**:
   - Click the **"+"** icon in the top right corner
   - Select **"New repository"**
3. **Configure Repository**:
   - **Repository name**: `spotify-stats-dashboard` (or your preferred name)
   - **Description**: "Spotify statistics dashboard with real-time data from kworb.net"
   - **Visibility**: Choose **Public** (free) or **Private** (requires GitHub Pro for private repos)
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
4. **Click "Create repository"**
5. **Copy the repository URL**: GitHub will show you the repository URL. It will look like:
   - HTTPS: `https://github.com/yourusername/spotify-stats-dashboard.git`
   - SSH: `git@github.com:yourusername/spotify-stats-dashboard.git`
   - Copy the HTTPS URL (easier for beginners)

### 2.2 Initialize Git (If Not Already Done)

Open your terminal in the project directory and check if Git is initialized:

```bash
# Check if git is already initialized
ls -la .git
```

If you see a `.git` folder, Git is already initialized. If not, initialize it:

```bash
# Initialize Git repository
git init

# Configure Git (if not already done)
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### 2.3 Prepare Your Files

Before committing, make sure you have a `.gitignore` file. Check if it exists:

```bash
cat .gitignore
```

If it doesn't exist or is incomplete, create/update it to include:

```bash
# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env
.env*.local

# Vercel
.vercel

# Prisma
prisma/migrations/

# Database
*.db
*.db-journal
dev.db
```

### 2.4 Stage and Commit Your Files

```bash
# Check what files will be added
git status

# Add all files to staging
git add .

# Create your first commit
git commit -m "Initial commit: Spotify Stats Dashboard"
```

**Note**: If you see files you don't want to commit (like `.env` or `node_modules`), make sure they're in `.gitignore` and remove them from staging:

```bash
# Remove a file from staging (but keep it locally)
git reset HEAD path/to/file

# Or remove from Git tracking entirely
git rm --cached path/to/file
```

### 2.5 Add GitHub Remote

Connect your local repository to the GitHub repository you created:

```bash
# Add the remote repository (replace with your actual URL)
git remote add origin https://github.com/yourusername/spotify-stats-dashboard.git

# Verify the remote was added
git remote -v
```

You should see:
```
origin  https://github.com/yourusername/spotify-stats-dashboard.git (fetch)
origin  https://github.com/yourusername/spotify-stats-dashboard.git (push)
```

### 2.6 Rename Branch to Main (If Needed)

GitHub uses `main` as the default branch name. Ensure your local branch is named `main`:

```bash
# Check current branch name
git branch

# If you're on 'master', rename it to 'main'
git branch -M main
```

### 2.7 Push to GitHub

Push your code to GitHub:

```bash
# Push to GitHub (first time)
git push -u origin main
```

**What this does**:
- `git push`: Uploads your commits to GitHub
- `-u origin main`: Sets up tracking so future pushes can just use `git push`
- `origin`: The name of your remote repository
- `main`: The branch you're pushing

### 2.8 Verify Upload

1. **Refresh your GitHub repository page** in the browser
2. You should see all your project files
3. Verify important files are present:
   - `package.json`
   - `prisma/schema.prisma`
   - `src/` directory
   - `README.md`
   - `.gitignore`

### 2.9 Future Updates

After making changes to your code, push updates with:

```bash
# Check what changed
git status

# Add changed files
git add .

# Commit changes
git commit -m "Description of your changes"

# Push to GitHub
git push
```

### Troubleshooting GitHub Push Issues

**Issue: "Authentication failed"**
- **Solution**: Use a Personal Access Token instead of password
  1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
  2. Generate new token with `repo` scope
  3. Use token as password when prompted
  4. Or use SSH keys (more secure, recommended for long-term)

**Issue: "Repository not found"**
- **Solution**: Verify the repository URL is correct
  ```bash
  # Check current remote
  git remote -v
  
  # Update if wrong
  git remote set-url origin https://github.com/yourusername/correct-repo-name.git
  ```

**Issue: "Updates were rejected"**
- **Solution**: Someone else pushed changes, or you made changes on GitHub
  ```bash
  # Pull changes first
  git pull origin main --rebase
  
  # Then push
  git push
  ```

**Issue: "Large files"**
- **Solution**: Remove large files from Git history
  ```bash
  # Remove file from Git
  git rm --cached large-file.db
  
  # Add to .gitignore
  echo "large-file.db" >> .gitignore
  
  # Commit
  git commit -m "Remove large file"
  git push
  ```

**Issue: "Branch protection"**
- **Solution**: If main branch is protected, create a new branch:
  ```bash
  git checkout -b feature/your-changes
  git push -u origin feature/your-changes
  # Then create a Pull Request on GitHub
  ```

## Step 3: Create Vercel Project

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Import your repository
4. Configure:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

5. **Don't deploy yet** - we need to set environment variables first

## Step 4: Set Up Environment Variables

In Vercel dashboard → Your Project → **Settings** → **Environment Variables**, add:

| Variable | Value | Notes |
|----------|-------|-------|
| `SPOTIFY_CLIENT_ID` | Your Spotify Client ID | From Step 1 |
| `SPOTIFY_CLIENT_SECRET` | Your Spotify Client Secret | From Step 1 |
| `ADMIN_SECRET` | A strong random string | e.g., `openssl rand -hex 32` |
| `DATABASE_URL` | PostgreSQL connection string | See Step 5 |

**Important**: Select **"Production"**, **"Preview"**, and **"Development"** for each variable.

## Step 5: Set Up Production Database

For production, use PostgreSQL. Options:

### Option A: Vercel Postgres (Recommended)

1. In Vercel dashboard → Your Project → **Storage** tab
2. Click **"Create Database"** → **"Postgres"**
3. Create database
4. Copy the connection string
5. Add it as `DATABASE_URL` environment variable

### Option B: External PostgreSQL

Use services like:
- [Supabase](https://supabase.com) (free tier available)
- [Neon](https://neon.tech) (free tier available)
- [Railway](https://railway.app) (free tier available)

1. Create a PostgreSQL database
2. Copy the connection string (format: `postgresql://user:password@host:5432/dbname?sslmode=require`)
3. Add as `DATABASE_URL` in Vercel

### Update Prisma Schema for PostgreSQL

Before deploying, update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // Change from "sqlite"
  url      = env("DATABASE_URL")
}
```

Then commit and push:
```bash
git add prisma/schema.prisma
git commit -m "Update Prisma for PostgreSQL"
git push
```

## Step 6: Deploy

1. In Vercel dashboard, click **"Deploy"**
2. Wait for build to complete
3. Your app will be live at `https://your-project.vercel.app`

## Step 7: Initialize Database

After first deployment:

1. Go to your Vercel project → **Settings** → **Functions**
2. Or use Vercel CLI:
   ```bash
   npm i -g vercel
   vercel login
   vercel link
   vercel env pull .env.local
   npx prisma db push
   ```

Alternatively, add a one-time setup script or use Vercel's database UI to run migrations.

## Step 8: Configure Cron Jobs

Cron jobs are configured in `vercel.json`:

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

**Important**: Update `/api/cron/refresh/route.ts` to work with Vercel cron format. Vercel sends an Authorization header. The current implementation should work, but verify:

1. Vercel cron calls with: `Authorization: Bearer ${ADMIN_SECRET}`
2. Our endpoint checks: `cronSecret === `Bearer ${expectedSecret}``

If needed, update the cron endpoint to match Vercel's format exactly.

**Verify Cron Jobs**:
- In Vercel dashboard → **Settings** → **Cron Jobs**
- You should see two cron jobs listed
- They will run automatically at 00:00 and 12:00 UTC

## Step 9: Set Up Custom Domain

### 9.1 Add Domain in Vercel

1. In Vercel dashboard → Your Project → **Settings** → **Domains**
2. Enter your domain (e.g., `spotify-stats.yourdomain.com`)
3. Click **"Add"**

### 9.2 Configure DNS

Vercel will show you DNS records to add. Choose one:

**Option A: Subdomain (Recommended)**
- Type: **CNAME**
- Name: `spotify-stats` (or your subdomain)
- Value: `cname.vercel-dns.com`

**Option B: Root Domain**
- Type: **A**
- Name: `@` (or root)
- Value: Vercel's IP addresses (shown in dashboard)

### 9.3 Add DNS Records

1. Go to your domain registrar (e.g., Namecheap, GoDaddy, Cloudflare)
2. Navigate to DNS settings
3. Add the CNAME or A record as shown in Vercel
4. Save changes

### 9.4 Wait for Propagation

- DNS changes can take a few minutes to 48 hours
- Usually completes within 1-2 hours
- Check with: `nslookup your-domain.com`

### 9.5 SSL Certificate

- Vercel automatically provisions SSL via Let's Encrypt
- HTTPS will be available once DNS propagates
- No additional configuration needed

## Step 10: Test Everything

1. **Visit your site**: `https://your-domain.com`
2. **Check data loads**: Should see artists and tracks
3. **Test manual refresh**: Click "Refresh Now" button (requires admin secret)
4. **Verify cron**: Wait for next scheduled run or trigger manually:
   ```bash
   curl -X GET "https://your-domain.com/api/cron/refresh?secret=YOUR_ADMIN_SECRET"
   ```

## Troubleshooting

### Build Fails

- Check Vercel build logs
- Ensure all dependencies are in `package.json`
- Verify Node.js version (Vercel uses 18.x by default)

### Database Connection Errors

- Verify `DATABASE_URL` is correct
- Check database allows connections from Vercel IPs
- Ensure SSL mode is set (`?sslmode=require`)

### Cron Jobs Not Running

- Check Vercel dashboard → Cron Jobs
- Verify `vercel.json` is in repo
- Check cron endpoint logs in Vercel dashboard
- Ensure `ADMIN_SECRET` matches in environment variables

### No Data Showing

- Trigger manual refresh first
- Check API endpoint logs in Vercel
- Verify scraping functions work (kworb.net structure may have changed)
- Check database has data: `npx prisma studio` (local) or use database UI

### Custom Domain Not Working

- Verify DNS records are correct
- Wait for DNS propagation (can take up to 48 hours)
- Check Vercel domain settings show "Valid Configuration"
- Ensure domain is verified in Vercel

## Monitoring

- **Vercel Dashboard**: View deployments, logs, analytics
- **Function Logs**: Check API route execution
- **Cron Logs**: Verify scheduled jobs run successfully
- **Database**: Monitor connection and query performance

## Next Steps

- Set up monitoring/alerting (optional)
- Configure analytics (optional)
- Set up staging environment (optional)
- Add more features as needed

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review function logs for errors
3. Verify environment variables are set
4. Test API endpoints directly
5. Check database connectivity

