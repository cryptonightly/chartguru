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

### 2.7 Set Up GitHub Authentication

**Important**: GitHub no longer accepts passwords for Git operations. You need to use a **Personal Access Token (PAT)** instead.

#### Option A: Personal Access Token (Recommended for HTTPS)

1. **Create a Personal Access Token**:
   - Go to GitHub → Click your profile picture (top right) → **Settings**
   - Scroll down to **Developer settings** (left sidebar)
   - Click **Personal access tokens** → **Tokens (classic)**
   - Click **Generate new token** → **Generate new token (classic)**
   - Configure the token:
     - **Note**: "Spotify Stats Dashboard" (or any descriptive name)
     - **Expiration**: Choose your preference (90 days, 1 year, or no expiration)
     - **Scopes**: Check **`repo`** (this gives full control of private repositories)
     - Click **Generate token** at the bottom
   - **IMPORTANT**: Copy the token immediately (you won't see it again!)
     - It will look like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

2. **Use Token When Pushing**:
   ```bash
   # When prompted for password, paste your Personal Access Token instead
   git push -u origin main
   ```
   
   When Git asks:
   - **Username**: `cryptonightly` (your GitHub username)
   - **Password**: Paste your Personal Access Token (not your GitHub password)

3. **Store Token Securely (Optional)**:
   
   You can configure Git to remember your credentials:
   ```bash
   # Store credentials (macOS)
   git config --global credential.helper osxkeychain
   
   # Store credentials (Linux)
   git config --global credential.helper store
   
   # Store credentials (Windows)
   git config --global credential.helper wincred
   ```
   
   After the first push with the token, Git will remember it.

#### Option B: SSH Keys (Alternative, More Secure)

If you prefer SSH authentication:

1. **Generate SSH Key** (if you don't have one):
   ```bash
   ssh-keygen -t ed25519 -C "your.email@example.com"
   # Press Enter to accept default location
   # Optionally set a passphrase for extra security
   ```

2. **Add SSH Key to GitHub**:
   ```bash
   # Copy your public key
   cat ~/.ssh/id_ed25519.pub
   # Copy the entire output
   ```
   
   - Go to GitHub → Settings → **SSH and GPG keys**
   - Click **New SSH key**
   - **Title**: "My Computer" (or descriptive name)
   - **Key**: Paste your public key
   - Click **Add SSH key**

3. **Update Remote URL to SSH**:
   ```bash
   # Change from HTTPS to SSH
   git remote set-url origin git@github.com:cryptonightly/chartguru.git
   
   # Verify
   git remote -v
   ```

4. **Push Using SSH**:
   ```bash
   git push -u origin main
   # No password/token needed with SSH!
   ```

### 2.8 Push to GitHub

Before pushing, check if the remote repository has any files (like a README created on GitHub):

```bash
# Fetch remote changes to see what's there
git fetch origin
```

**If you see "Updates were rejected" error**, the remote has files you don't have locally. Choose one:

#### Option A: Merge Remote Changes (Recommended)

This keeps both your local files and any files on GitHub (like README):

```bash
# Pull and merge remote changes
git pull origin main --allow-unrelated-histories

# Resolve any conflicts if they occur (usually just accept both)
# If there are conflicts, Git will mark them. Edit files to resolve, then:
git add .
git commit -m "Merge remote changes"

# Now push
git push -u origin main
```

#### Option B: Rebase (Cleaner History)

This replays your commits on top of remote changes:

```bash
# Pull with rebase
git pull origin main --rebase

# If conflicts occur, resolve them, then:
git add .
git rebase --continue

# Push
git push -u origin main
```

#### Option C: Force Push (⚠️ Use Only If Remote Has Nothing Important)

**Warning**: This overwrites everything on GitHub with your local code. Only use if you're sure the remote has nothing you need.

```bash
# Force push (overwrites remote)
git push -u origin main --force
```

**If no conflicts or errors**, simply push:

```bash
# Push to GitHub (first time)
git push -u origin main
```

**What this does**:
- `git push`: Uploads your commits to GitHub
- `-u origin main`: Sets up tracking so future pushes can just use `git push`
- `origin`: The name of your remote repository
- `main`: The branch you're pushing

**If using HTTPS with Personal Access Token**:
- When prompted for username: Enter your GitHub username (`cryptonightly`)
- When prompted for password: Paste your Personal Access Token (not your GitHub password!)

**If using SSH**:
- No authentication prompt needed (uses your SSH key)

### 2.9 Verify Upload

1. **Refresh your GitHub repository page** in the browser
2. You should see all your project files
3. Verify important files are present:
   - `package.json`
   - `prisma/schema.prisma`
   - `src/` directory
   - `README.md`
   - `.gitignore`

### 2.10 Future Updates

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

## Step 3: Deploy to Vercel

This section provides a complete, step-by-step guide to deploying your Spotify Stats Dashboard to Vercel.

### 3.1 Sign In to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"** or **"Log In"** in the top right
3. Choose **"Continue with GitHub"** (recommended - easiest integration)
4. Authorize Vercel to access your GitHub account
5. You'll be redirected to the Vercel dashboard

### 3.2 Import Your GitHub Repository

1. In the Vercel dashboard, click the **"Add New..."** button (top right)
2. Select **"Project"** from the dropdown
3. You'll see a list of your GitHub repositories
4. Find and click on **"chartguru"** (or your repository name)
5. Click **"Import"** button

### 3.3 Configure Project Settings

Vercel will auto-detect Next.js, but verify these settings:

1. **Project Name**: 
   - Default: `chartguru` (or your repo name)
   - You can change it if desired
   - This becomes part of your URL: `https://chartguru.vercel.app`

2. **Framework Preset**: 
   - Should auto-detect as **"Next.js"**
   - If not, select it manually

3. **Root Directory**: 
   - Leave as `./` (default)
   - Only change if your Next.js app is in a subdirectory

4. **Build and Output Settings** (usually auto-filled, verify):
   - **Build Command**: `npm run build` or `prisma generate && next build`
   - **Output Directory**: `.next` (leave default)
   - **Install Command**: `npm install` (leave default)

5. **Environment Variables** (IMPORTANT - Add these now):
   
   Click **"Environment Variables"** to expand the section, then add:

   **Variable 1: SPOTIFY_CLIENT_ID**
   - Click **"Add"** or the **"+"** button
   - **Key**: `SPOTIFY_CLIENT_ID`
   - **Value**: Paste your Spotify Client ID (from Step 1)
   - **Environment**: Check all three: ☑ Production, ☑ Preview, ☑ Development
   - Click **"Add"** or **"Save"**

   **Variable 2: SPOTIFY_CLIENT_SECRET**
   - Click **"Add"** again
   - **Key**: `SPOTIFY_CLIENT_SECRET`
   - **Value**: Paste your Spotify Client Secret (from Step 1)
   - **Environment**: Check all three: ☑ Production, ☑ Preview, ☑ Development
   - Click **"Add"** or **"Save"**

   **Variable 3: ADMIN_SECRET**
   - Click **"Add"** again
   - **Key**: `ADMIN_SECRET`
   - **Value**: Generate a strong random string:
     ```bash
     # In your terminal, run:
     openssl rand -hex 32
     # Copy the output and paste it here
     ```
     Or use any strong random password (at least 32 characters recommended)
   - **Environment**: Check all three: ☑ Production, ☑ Preview, ☑ Development
   - Click **"Add"** or **"Save"**

   **Variable 4: DATABASE_URL** (Skip for now - add after Step 5)
   - **Leave this empty for now**
   - We'll add it after setting up the database in Step 5
   - The first deployment will fail, but that's expected

### 3.4 Deploy the Project

1. Review all settings one more time
2. Click the **"Deploy"** button (bottom right)
3. Vercel will:
   - Clone your repository
   - Install dependencies (`npm install`)
   - Run the build command
   - Deploy to their CDN

4. **Watch the deployment logs**:
   - You'll see real-time build output
   - The build will likely **fail** because `DATABASE_URL` is missing
   - This is **expected and okay** - we'll fix it after setting up the database

5. **Note the deployment URL**:
   - Even if it fails, you'll see: `https://chartguru-xxxxx.vercel.app`
   - Save this URL for later

### 3.5 Understanding the First Deployment Failure

The build will fail with an error like:
```
Error: P1001: Can't reach database server
```

This is **normal** because:
- We haven't set up the database yet
- `DATABASE_URL` environment variable is missing
- Prisma can't connect to the database

**Don't worry** - we'll fix this in the next steps.

### 3.6 Access Your Project Dashboard

After deployment (even if it failed):

1. Click on your project name in the Vercel dashboard
2. You'll see the **Project Overview** page with:
   - Deployment history
   - Project settings
   - Environment variables
   - Domains
   - Analytics

**Keep this page open** - you'll need it for the next steps.

## Step 4: Set Up Production Database

For production, you need a PostgreSQL database. Vercel requires PostgreSQL (not SQLite) for production deployments.

**Note**: Vercel doesn't offer a native Postgres database. They have a Supabase integration that provides PostgreSQL, or you can use external PostgreSQL providers.

### Option A: Supabase via Vercel Integration (Easiest - Recommended)

1. **In your Vercel project dashboard**:
   - Click on the **"Storage"** tab (left sidebar)
   - Or go to: Your Project → **Storage**

2. **Create a Supabase database**:
   - Click **"Create Database"** button
   - You'll see **"Supabase (Postgres)"** as an option
   - Click on it
   - If you don't have a Supabase account, you'll be prompted to sign up
   - Follow the prompts to create/connect your Supabase project
   - Choose a **database name** (e.g., `spotify-stats-db`)
   - Select a **region** (choose closest to your users)
   - Click **"Create"** or **"Continue"**

3. **Wait for database creation** (takes 1-2 minutes)

4. **Get the connection string**:
   - Once created, Vercel will automatically add `DATABASE_URL` to your environment variables
   - Or you can find it in: **Settings** → **Environment Variables**
   - The connection string will look like: `postgresql://postgres:xxxxx@db.xxxxx.supabase.co:5432/postgres`
   - **Important**: This is your `DATABASE_URL`

5. **Verify it's added**:
   - Go to **Settings** → **Environment Variables**
   - You should see `DATABASE_URL` already added automatically
   - If not, see Option B below for manual setup
   - Make sure it's enabled for all environments: ☑ Production, ☑ Preview, ☑ Development

### Option B: Supabase (Manual Setup - Free Tier Available)

1. **Sign up for Supabase**:
   - Go to [supabase.com](https://supabase.com)
   - Click **"Start your project"**
   - Sign in with GitHub (easiest)

2. **Create a new project**:
   - Click **"New Project"**
   - **Name**: `spotify-stats-dashboard`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to you
   - Click **"Create new project"**
   - Wait 2-3 minutes for setup

3. **Get connection string**:
   - Go to **Project Settings** (gear icon, bottom left)
   - Click **"Database"** in the left menu
   - Scroll to **"Connection string"**
   - Select **"URI"** tab
   - Copy the connection string
   - It looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`
   - Replace `[YOUR-PASSWORD]` with the password you created

4. **Add to Vercel**:
   - Go to Vercel → Your Project → **Settings** → **Environment Variables**
   - Click **"Add New"**
   - **Key**: `DATABASE_URL`
   - **Value**: Paste the Supabase connection string
   - **Environment**: Check all three: ☑ Production, ☑ Preview, ☑ Development
   - Click **"Save"**

### Option C: Neon (Free Tier Available - Recommended Alternative)

1. **Sign up for Neon**:
   - Go to [neon.tech](https://neon.tech)
   - Click **"Sign Up"** and create an account

2. **Create a project**:
   - Click **"Create a project"**
   - **Name**: `spotify-stats-dashboard`
   - **Region**: Choose closest to you
   - Click **"Create Project"**

3. **Get connection string**:
   - After creation, you'll see the connection string on the dashboard
   - It looks like: `postgresql://user:password@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require`
   - Copy it

4. **Add to Vercel**:
   - Go to Vercel → Your Project → **Settings** → **Environment Variables**
   - Click **"Add New"**
   - **Key**: `DATABASE_URL`
   - **Value**: Paste the Neon connection string
   - **Environment**: Check all three: ☑ Production, ☑ Preview, ☑ Development
   - Click **"Save"**

### Option D: Railway (Free Tier Available)

1. **Sign up for Railway**:
   - Go to [railway.app](https://railway.app)
   - Click **"Start a New Project"**
   - Sign in with GitHub

2. **Create PostgreSQL database**:
   - Click **"New"** → **"Database"** → **"Add PostgreSQL"**
   - Wait for provisioning

3. **Get connection string**:
   - Click on the PostgreSQL service
   - Go to **"Variables"** tab
   - Find **"DATABASE_URL"** or **"POSTGRES_URL"**
   - Copy the connection string

4. **Add to Vercel**:
   - Go to Vercel → Your Project → **Settings** → **Environment Variables**
   - Click **"Add New"**
   - **Key**: `DATABASE_URL`
   - **Value**: Paste the Railway connection string
   - **Environment**: Check all three: ☑ Production, ☑ Preview, ☑ Development
   - Click **"Save"**

## Step 5: Update Prisma Schema for PostgreSQL

**Critical**: You must update your Prisma schema to use PostgreSQL instead of SQLite before the deployment will work.

### 5.1 Update the Schema File

1. **Open `prisma/schema.prisma`** in your local project

2. **Find the `datasource db` section** (near the top):

   **Current (SQLite)**:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

3. **Change it to PostgreSQL**:
   ```prisma
   datasource db {
     provider = "postgresql"  // Changed from "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

4. **Save the file**

### 5.2 Commit and Push Changes

1. **Commit the change**:
   ```bash
   git add prisma/schema.prisma
   git commit -m "Update Prisma schema for PostgreSQL production"
   git push
   ```

2. **Vercel will automatically detect the push** and start a new deployment
   - You can watch it in the Vercel dashboard → **Deployments** tab
   - This deployment should succeed now that `DATABASE_URL` is set

## Step 6: Initialize the Database

After the deployment succeeds, you need to create the database tables.

### 6.1 Option A: Using Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```
   - Follow the prompts to authenticate

3. **Link your project**:
   ```bash
   cd /path/to/your/project
   vercel link
   ```
   - Select your project from the list
   - Confirm the settings

4. **Pull environment variables**:
   ```bash
   vercel env pull .env.local
   ```
   - This downloads your environment variables locally
   - Creates `.env.local` file

5. **Push database schema**:
   ```bash
   npx prisma db push
   ```
   - This creates all tables in your production database
   - You should see: "Your database is now in sync with your Prisma schema"

### 6.2 Option B: Using Database UI (Alternative)

If you're using Supabase, Neon, or Railway:

1. **Access your database admin panel**:
   - **Supabase**: Go to your project → **SQL Editor**
   - **Neon**: Go to your project → **SQL Editor**
   - **Railway**: Click on PostgreSQL → **Query** tab

2. **Run Prisma migration manually** (not recommended - use Option A instead)

### 6.3 Option C: Trigger via API (Quick Test)

After deployment, you can trigger the first data refresh which will also initialize tables:

1. **Visit your deployed site**: `https://your-project.vercel.app`
2. **Click "Refresh Now"** button
3. **Enter your `ADMIN_SECRET`** when prompted
4. This will attempt to create tables and fetch initial data

**Note**: This may fail if tables aren't created yet. Use Option A for reliable setup.

## Step 7: Verify Deployment

After the database is initialized and deployment succeeds:

1. **Visit your live site**:
   - Go to: `https://your-project.vercel.app`
   - Or check the **Deployments** tab for the exact URL

2. **Check if the site loads**:
   - You should see the dashboard interface
   - It may show "No data" initially - that's normal

3. **Trigger initial data load**:
   - Click the **"Refresh Now"** button
   - Enter your `ADMIN_SECRET` when prompted
   - Wait for the refresh to complete (may take a few minutes)
   - The page should now show artist and track data

4. **Verify everything works**:
   - ✅ Page loads without errors
   - ✅ Can see the dashboard UI
   - ✅ "Refresh Now" button works
   - ✅ Data appears after refresh
   - ✅ Search and filters work
   - ✅ Artist/track links work

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

