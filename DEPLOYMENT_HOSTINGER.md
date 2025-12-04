# Deployment Guide: Spotify Stats Dashboard on Hostinger

This guide provides step-by-step instructions for deploying the Spotify Stats Dashboard to Hostinger's Node.js web app hosting service.

## Prerequisites

- ✅ GitHub account (with your project pushed to a repository)
- ✅ Hostinger account (sign up at [hostinger.com](https://www.hostinger.com))
- ✅ Spotify Developer account (for API credentials)
- ✅ Database: External PostgreSQL (recommended) or Hostinger MySQL

## Overview

Hostinger's web app hosting supports:
- ✅ Next.js (auto-detected)
- ✅ Node.js applications
- ✅ GitHub integration
- ✅ Environment variables
- ✅ Free SSL certificates
- ✅ CDN included
- ✅ Unlimited bandwidth

**Reference**: [Hostinger Web App Hosting](https://www.hostinger.com/web-apps-hosting)

## Step 1: Get Spotify API Credentials

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click "Create App"
3. Fill in:
   - **App name**: Spotify Stats Dashboard
   - **App description**: Dashboard for Spotify statistics
   - **Redirect URI**: `http://localhost:3000` (for local testing)
   - Accept terms and create
4. Copy your **Client ID** and **Client Secret**
5. Save these for Step 5

## Step 2: Ensure Your Project is on GitHub

Your project must be pushed to a GitHub repository. If not already done:

```bash
# Check if you have a remote repository
git remote -v

# If not, add your GitHub repository
git remote add origin https://github.com/yourusername/chartguru.git

# Push your code
git push -u origin main
```

**Note**: Hostinger supports both public and private repositories.

## Step 3: Sign Up for Hostinger Web App Hosting

1. Go to [Hostinger Web App Hosting](https://www.hostinger.com/web-apps-hosting)
2. Click **"View plans"** or **"Start with GitHub"**
3. Choose a plan:
   - **Cloud Startup**: $7.45/mo (with discount) - includes 5 Node.js web apps
   - Includes free domain for 1 year
   - Includes free business email for 1 year
   - Includes free managed SSL certificates
4. Click **"Choose plan"** or **"Get started"**
5. Create your Hostinger account or sign in
6. Complete the purchase process

## Step 4: Access Hostinger Control Panel

1. After signing up, log in to your Hostinger account
2. Navigate to the **Control Panel** or **hPanel**
3. Look for **"Web Apps"** or **"Node.js Apps"** section in the sidebar

## Step 5: Create a New Web App

1. In the Hostinger control panel, click **"Web Apps"** or **"Node.js Apps"**
2. Click **"Create New App"** or **"Add App"** button
3. You'll see deployment options:
   - **Connect GitHub** (Recommended)
   - **Upload ZIP file**
   - **Deploy from IDE** (if using Cursor/VS Code with Hostinger integration)

### Option A: Connect GitHub (Recommended)

1. Click **"Connect GitHub"** or **"Deploy from GitHub"**
2. Authorize Hostinger to access your GitHub account
3. Select your repository: `cryptonightly/chartguru` (or your repo name)
4. Select the branch: `production` (we'll create this branch in Step 8)
   - *Note: We'll use a separate `production` branch to keep your `main` branch with SQLite for local development*
5. Hostinger will auto-detect Next.js framework
6. Configure build settings:
   - **Build Command**: `npm run build`
     - *Note: This runs `prisma generate && next build` automatically (as defined in your package.json)*
   - **Output Directory**: `.next`
     - *This is the default Next.js output directory where the built application is stored*
   - **Start Command**: `npm start` or `next start`
   - **Node.js Version**: Select Node.js 18.x or 20.x (recommended: 18.x)
   - **Root Directory**: Leave as `./` (unless your app is in a subdirectory)
7. Click **"Deploy"** or **"Create App"**

### Option B: Upload ZIP File

1. **Prepare your project**:
   ```bash
   # Make sure .env is not included
   # Create a ZIP of your project (excluding node_modules, .next, etc.)
   zip -r chartguru-deploy.zip . -x "node_modules/*" ".next/*" ".git/*" "*.db" ".env*"
   ```

2. In Hostinger control panel:
   - Click **"Upload ZIP"** or **"Upload Files"**
   - Select your ZIP file
   - Hostinger will extract and detect Next.js
   - Configure build settings (same as Option A)
   - Click **"Deploy"**

## Step 6: Configure Environment Variables

After creating the app, you need to add environment variables:

1. In your app's dashboard, find **"Environment Variables"** or **"Config Vars"**
2. Click **"Add Variable"** or **"Add Environment Variable"**
3. Add each variable:

   **Variable 1: SPOTIFY_CLIENT_ID**
   - **Key**: `SPOTIFY_CLIENT_ID`
   - **Value**: Your Spotify Client ID (from Step 1)
   - Click **"Save"**

   **Variable 2: SPOTIFY_CLIENT_SECRET**
   - **Key**: `SPOTIFY_CLIENT_SECRET`
   - **Value**: Your Spotify Client Secret (from Step 1)
   - Click **"Save"**

   **Variable 3: ADMIN_SECRET**
   - **Key**: `ADMIN_SECRET`
   - **Value**: Generate a strong random string:
     ```bash
     openssl rand -hex 32
     ```
     Or use any strong random password (at least 32 characters)
   - Click **"Save"**

   **Variable 4: DATABASE_URL** (Add after Step 7)
   - **Key**: `DATABASE_URL`
   - **Value**: Will be your database connection string (PostgreSQL or MySQL, from Step 7)
   - Click **"Save"**

4. **Important**: After adding variables, you may need to **restart** or **redeploy** your app

## Step 7: Set Up Database

**Important**: Hostinger's web app hosting provides MySQL databases, not PostgreSQL. You have two options:

### Option A: External PostgreSQL (Recommended)

**Why use external PostgreSQL?**
- Your Prisma schema is optimized for PostgreSQL
- Better support for BigInt data types (needed for large stream counts)
- Free tiers available from reliable providers
- No need to modify your schema

Use one of these services (all have free tiers):

#### Supabase (Recommended)

1. Go to [supabase.com](https://supabase.com)
2. Sign up and create a new project
3. Get connection string from **Project Settings** → **Database** → **Connection string**

4. **Choose the correct connection string**:

   **Option A: Session Pooler (Recommended for IPv4 networks)**
   - Use this if you see "Not IPv4 compatible" message
   - Go to **Project Settings** → **Database** → **Connection string**
   - Select **"Session mode"** (not Transaction mode)
   - Select **"URI"** tab
   - Copy the connection string
   - Format: `postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`
   - **Port**: `6543` (Session Pooler port)
   - **Host**: `aws-0-[REGION].pooler.supabase.com` (pooler hostname)

   **Option B: Direct Connection (Requires IPv6 or IPv4 add-on)**
   - Only use if you have IPv6 support or purchased IPv4 add-on
   - Format: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`
   - **Port**: `5432` (Direct connection port)
   - **Host**: `db.[PROJECT-REF].supabase.co`

5. **Important**: Replace `[YOUR-PASSWORD]` with your actual database password
   - If you forgot your password, you can reset it in Supabase project settings

6. Add the connection string to Hostinger environment variables as `DATABASE_URL`

**Troubleshooting Connection String**:
- If you get "invalid port number" error, check the port is correct (6543 for Session Pooler, 5432 for direct)
- If you get "Not IPv4 compatible", use Session Pooler connection string (Option A)
- Make sure there are no extra spaces or line breaks in the connection string
- Special characters in password may need URL encoding

#### Neon

1. Go to [neon.tech](https://neon.tech)
2. Sign up and create a project
3. Copy the connection string from the dashboard
4. Add to Hostinger environment variables as `DATABASE_URL`

#### Railway

1. Go to [railway.app](https://railway.app)
2. Create a new PostgreSQL database
3. Copy the connection string from the Variables tab
4. Add to Hostinger environment variables as `DATABASE_URL`

### Option B: Hostinger MySQL Database (Alternative)

**Note**: This requires modifying your Prisma schema to use MySQL instead of PostgreSQL.

1. In Hostinger control panel, look for **"Databases"** or **"MySQL"**
2. Create a new MySQL database:
   - **Database name**: `spotify_stats_db`
   - **Username**: (auto-generated or choose)
   - **Password**: (save this securely!)
3. Note the connection details:
   - **Host**: Usually `localhost` or provided hostname
   - **Port**: Usually `3306` (MySQL default)
   - **Database name**: The name you created
   - **Username**: The username you set
   - **Password**: The password you set

4. **Connection string format**:
   ```
   mysql://username:password@host:port/database_name
   ```
   Example:
   ```
   mysql://spotify_user:yourpassword@localhost:3306/spotify_stats_db
   ```

5. Add this as `DATABASE_URL` in your environment variables (Step 6)

**Important**: If using MySQL, you must follow Step 8 Option B to update your Prisma schema.

## Step 8: Create Production Branch and Update Prisma Schema

**Why create a separate branch?**
- Keep your `main` branch with SQLite for local development
- Production branch uses PostgreSQL for deployment
- Easy to switch between environments
- No risk of breaking local development

### Option A: Using External PostgreSQL (Recommended)

If you chose **Option A** in Step 7 (external PostgreSQL):

1. **Create a new production branch**:

   ```bash
   # Make sure you're in the project directory
   cd /home/dave/Projects/ChatGuru_cursor
   
   # Ensure you're on main and it's up to date
   git checkout main
   git pull origin main
   
   # Create a new branch called 'production'
   git checkout -b production
   
   # Push the new branch to GitHub
   git push -u origin production
   ```

   **What this does**:
   - Creates a new branch called `production` based on `main`
   - Pushes it to GitHub
   - You're now working on the `production` branch
   - Your `main` branch remains unchanged with SQLite

2. **Locate the `prisma/schema.prisma` file**:

   **File Location**: The file is located at:
   ```
   /home/dave/Projects/ChatGuru_cursor/prisma/schema.prisma
   ```
   
   Or relative to your project root:
   ```
   prisma/schema.prisma
   ```

   **How to open it**:
   - **In VS Code/Cursor**: 
     - Open the file explorer (left sidebar)
     - Navigate to the `prisma` folder
     - Click on `schema.prisma` to open it
     - Or use `Ctrl+P` (or `Cmd+P` on Mac) and type `schema.prisma`
   
   - **In terminal/command line**:
     ```bash
     cd /home/dave/Projects/ChatGuru_cursor
     nano prisma/schema.prisma
     # or
     code prisma/schema.prisma
     # or
     vim prisma/schema.prisma
     ```

2. **Find the `datasource db` section**:

   Look for this section near the **top of the file** (around lines 8-11):
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

   **What you'll see**: The file starts with:
   ```prisma
   // This is your Prisma schema file,
   // learn more about it in the docs: https://pris.ly/d/prisma-schema

   generator client {
     provider = "prisma-client-js"
   }

   datasource db {
     provider = "sqlite"        ← THIS LINE NEEDS TO CHANGE
     url      = env("DATABASE_URL")
   }
   ```

3. **Update the provider**:

   Change **line 9** from:
   ```prisma
   provider = "sqlite"
   ```
   
   To:
   ```prisma
   provider = "postgresql"
   ```

   **Complete updated section should look like**:
   ```prisma
   datasource db {
     provider = "postgresql"  // Changed from "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

   **Visual guide**:
   ```
   BEFORE:
   ┌─────────────────────────┐
   │ datasource db {         │
   │   provider = "sqlite"   │ ← Change this
   │   url      = env(...)   │
   │ }                       │
   └─────────────────────────┘

   AFTER:
   ┌─────────────────────────┐
   │ datasource db {         │
   │   provider = "postgresql"│ ← Changed to this
   │   url      = env(...)   │
   │ }                       │
   └─────────────────────────┘
   ```

4. **Save the file**:
   - **VS Code/Cursor**: `Ctrl+S` (or `Cmd+S` on Mac)
   - **Terminal editors**: 
     - `nano`: `Ctrl+O` then `Enter`, then `Ctrl+X`
     - `vim`: Press `Esc`, type `:wq` then `Enter`

5. **Verify the change**:
   ```bash
   # Check the file was updated correctly
   grep -A 3 "datasource db" prisma/schema.prisma
   ```
   
   You should see:
   ```
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

6. **Commit and push the change to the production branch**:
   ```bash
   # Make sure you're in the project directory
   cd /home/dave/Projects/ChatGuru_cursor
   
   # Verify you're on the production branch
   git branch
   # Should show: * production
   
   # Stage the file
   git add prisma/schema.prisma
   
   # Commit with a descriptive message
   git commit -m "Update Prisma schema for PostgreSQL production"
   
   # Push to GitHub (production branch)
   git push origin production
   ```

7. **Update Hostinger to use the production branch** (if you already created the app):
   - Go to your app settings in Hostinger
   - Find **"Branch"** or **"Deploy Settings"**
   - Change from `main` to `production`
   - Save changes
   - Hostinger will automatically redeploy from the `production` branch

8. **Verify the setup**:
   ```bash
   # Check you're on production branch
   git branch
   
   # Verify the commit was pushed
   git log --oneline -1
   # Should show your commit message
   
   # Verify the schema change
   grep "provider" prisma/schema.prisma
   # Should show: provider = "postgresql"
   ```

**Branch Structure**:
```
main (SQLite - for local development)
  └── production (PostgreSQL - for Hostinger deployment)
```

**Switching between branches**:
```bash
# Work on local development (SQLite)
git checkout main

# Work on production deployment (PostgreSQL)
git checkout production
```

**Keeping branches in sync** (Important):

When you make changes to `main` (new features, bug fixes, etc.), you'll want to merge them into `production`:

```bash
# 1. Make sure main is up to date
git checkout main
git pull origin main

# 2. Switch to production branch
git checkout production

# 3. Merge main into production
git merge main

# 4. Resolve any conflicts if they occur
# (Usually just the schema.prisma file - keep the PostgreSQL/MySQL version)

# 5. Push the updated production branch
git push origin production

# Hostinger will automatically redeploy
```

**Note**: When merging, you'll likely have a conflict in `prisma/schema.prisma`. Always keep the production version (PostgreSQL or MySQL) and discard the SQLite version from main.

### Option B: Using Hostinger MySQL

If you chose **Option B** in Step 7 (Hostinger MySQL):

1. **Create a new production branch** (if you haven't already):

   ```bash
   # Make sure you're in the project directory
   cd /home/dave/Projects/ChatGuru_cursor
   
   # Ensure you're on main and it's up to date
   git checkout main
   git pull origin main
   
   # Create a new branch called 'production'
   git checkout -b production
   
   # Push the new branch to GitHub
   git push -u origin production
   ```

2. **Update `prisma/schema.prisma`**:

   Find this section (around line 8-11):
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

   Change to:
   ```prisma
   datasource db {
     provider = "mysql"  // Changed from "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

3. **Note on BigInt fields**: MySQL supports BigInt, so your `dailyStreams` and `totalStreams` fields should work fine.

4. **Commit and push the change to the production branch**:
   ```bash
   # Verify you're on the production branch
   git branch
   # Should show: * production
   
   # Stage and commit
   git add prisma/schema.prisma
   git commit -m "Update Prisma schema for MySQL production"
   
   # Push to production branch
   git push origin production
   ```

5. **Update Hostinger to use the production branch**:
   - Go to your app settings in Hostinger
   - Find **"Branch"** or **"Deploy Settings"**
   - Change from `main` to `production`
   - Save changes
   - Hostinger will automatically redeploy from the `production` branch

## Step 9: Initialize the Database

After deployment, you need to create the database tables.

### Option A: Using Hostinger SSH/Terminal (If Available)

1. In Hostinger control panel, find **"SSH Access"** or **"Terminal"**
2. Connect via SSH or use the web terminal
3. **Navigate to your app directory**:
   ```bash
   # The app directory is usually the root where package.json is located
   # You should see: package.json, node_modules/, public/, etc.
   cd /path/to/your/app
   # Or if you're already in the app directory, verify with:
   ls -la
   # You should see package.json in the listing
   ```

4. **Verify you're in the correct directory**:
   ```bash
   # Check that package.json exists
   ls package.json
   # Should show: package.json
   
   # Check current directory structure
   ls -la
   # You should see at minimum:
   # - package.json (file)
   # - node_modules/ (folder - may or may not exist yet)
   # - public/ (folder)
   # - src/ (folder - should exist)
   # - prisma/ (folder - should exist)
   ```

5. **Check if npm is available**:
   ```bash
   # Check if Node.js/npm is installed
   which npm
   node --version
   npm --version
   ```

   **If you get "command not found"**:
   - This is **normal** - Hostinger's SSH/terminal may not have npm in the PATH
   - **Hostinger automatically runs `npm install` during deployment** - you don't need to run it manually
   - Dependencies are installed automatically when Hostinger builds your app

6. **If npm is NOT available (most common)**:

   **You don't need to run `npm install` manually!** Hostinger handles this automatically during the build process.

   **To initialize the database, use Option B instead** (run Prisma commands from your local machine).

7. **If npm IS available** (rare), you can run:
   ```bash
   # Install dependencies (usually already done by Hostinger)
   npm install
   
   # Generate Prisma client
   npx prisma generate
   
   # Push schema to database
   npx prisma db push
   ```

**Important Notes**:
- **Hostinger automatically runs `npm install` during deployment** - you typically don't need to run it manually
- If you see `node_modules/` folder exists, dependencies are already installed
- The `server.js` file is added by Hostinger for their hosting setup
- If npm is not available in the terminal, use **Option B** (local machine) to run Prisma commands
- If you're missing the `src/` or `prisma/` folders, the deployment may be incomplete - check your GitHub repository

### Option B: Using Local Machine with Remote Database

1. **Pull environment variables** (if Hostinger provides this feature)
2. Or manually set `DATABASE_URL` in your local `.env` file temporarily
3. Run locally:
   ```bash
   # Set DATABASE_URL to your production database
   # For PostgreSQL: export DATABASE_URL="postgresql://..."
   # For MySQL: export DATABASE_URL="mysql://..."
   export DATABASE_URL="postgresql://..."  # or mysql://... if using MySQL
   
   # Push schema
   npx prisma db push
   ```

### Option C: Using Database Admin Panel

If using Supabase, Neon, or Railway:
1. Access their SQL editor
2. You can manually run Prisma migrations, but Option A or B is recommended

## Step 10: Configure Build and Start Commands

Verify your app's build settings in Hostinger:

1. Go to your app's settings in Hostinger
2. Check **"Build Settings"** or **"Deploy Settings"**:
   - **Build Command**: `npm run build`
     - *This automatically runs `prisma generate && next build` (as defined in package.json)*
   - **Output Directory**: `.next`
     - *This is where Next.js stores the built application files*
   - **Start Command**: `npm start` or `next start`
   - **Node.js Version**: 18.x or 20.x
3. Save changes if modified

## Step 11: Deploy and Verify

1. **Trigger deployment**:
   - If using GitHub: Push a commit or click **"Redeploy"** in Hostinger
   - If using ZIP: Upload a new version

2. **Monitor deployment logs**:
   - Watch the build process in Hostinger dashboard
   - Check for any errors

3. **Access your app**:
   - Hostinger will provide a URL like: `https://your-app-name.hostingerapp.com`
   - Or your custom domain if configured

4. **Test the deployment**:
   - Visit the URL
   - Check if the dashboard loads
   - Click **"Refresh Now"** button (enter `ADMIN_SECRET` when prompted)
   - Verify data appears after refresh

## Step 12: Set Up Custom Domain (Optional)

1. **In Hostinger control panel**:
   - Go to your app's settings
   - Find **"Domains"** or **"Custom Domain"** section
   - Click **"Add Domain"** or **"Connect Domain"**

2. **Enter your domain**:
   - If you have a domain registered with Hostinger, select it
   - If external, enter your domain name (e.g., `spotify-stats.yourdomain.com`)

3. **Configure DNS**:
   - Hostinger will provide DNS records to add
   - Usually a **CNAME** record pointing to your app's hostname
   - Add the record in your domain registrar's DNS settings

4. **Wait for propagation**:
   - DNS changes can take a few minutes to 48 hours
   - Usually completes within 1-2 hours

5. **SSL Certificate**:
   - Hostinger automatically provisions SSL certificates
   - HTTPS will be available once DNS propagates

## Step 13: Set Up Automatic Deployments

If using GitHub integration:

1. **Automatic deployments** should be enabled by default
2. Every push to `main` branch triggers a new deployment
3. Verify in Hostinger settings:
   - **"Auto Deploy"** should be enabled
   - **Branch**: `main`

## Step 14: Configure Cron Jobs for Data Refresh

Hostinger may not have built-in cron jobs. You have several options:

### Option A: External Cron Service (Recommended)

Use a service like [cron-job.org](https://cron-job.org) or [EasyCron](https://www.easycron.com):

1. Sign up for a free cron service
2. Create a new cron job:
   - **URL**: `https://your-app-url.com/api/cron/refresh`
   - **Method**: GET
   - **Headers**: `Authorization: Bearer YOUR_ADMIN_SECRET`
   - **Schedule**: `0 0 * * *` (daily at midnight) and `0 12 * * *` (daily at noon)
3. Save and activate

### Option B: Hostinger Cron Jobs (If Available)

1. Check if Hostinger provides cron job functionality
2. If available, add cron jobs in the control panel:
   - **Command**: `curl -H "Authorization: Bearer YOUR_ADMIN_SECRET" https://your-app-url.com/api/cron/refresh`
   - **Schedule**: `0 0 * * *` and `0 12 * * *`

### Option C: Update API Endpoint for External Triggers

Ensure your `/api/cron/refresh/route.ts` accepts the Authorization header:

```typescript
// Verify it checks for Bearer token
const authHeader = request.headers.get('authorization');
if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
  return new Response('Unauthorized', { status: 401 });
}
```

## Step 15: Monitor and Maintain

### Monitoring

1. **Check app logs**:
   - Access logs in Hostinger dashboard
   - Look for errors or warnings

2. **Monitor performance**:
   - Check response times
   - Monitor database connections
   - Watch for memory/CPU usage

3. **Verify data updates**:
   - Check that cron jobs are running
   - Verify data refreshes twice daily

### Maintenance

1. **Update dependencies**:
   ```bash
   # Locally
   npm update
   git add package.json package-lock.json
   git commit -m "Update dependencies"
   git push
   # Hostinger will auto-deploy
   ```

2. **Database backups**:
   - Set up regular backups if using external database
   - Supabase, Neon, and Railway provide backup options

3. **SSL certificate renewal**:
   - Hostinger manages this automatically
   - No action needed

## Troubleshooting

### Missing Files in App Directory

**Issue**: You only see `node_modules/`, `public/`, `package.json`, and `server.js`, but missing `src/`, `prisma/`, and other folders.

**Possible causes**:
1. **Incomplete deployment**: Not all files were deployed from GitHub
2. **Wrong directory**: You might be looking at a subdirectory
3. **Build artifacts only**: You might be seeing only the built output

**Solutions**:

1. **Verify you're in the correct directory**:
   ```bash
   # Check current directory
   pwd
   
   # List all files (including hidden)
   ls -la
   
   # Check if src/ exists
   ls -d src/
   ```

2. **Check if files are in a different location**:
   ```bash
   # Look for src folder
   find . -type d -name "src" 2>/dev/null
   
   # Look for prisma folder
   find . -type d -name "prisma" 2>/dev/null
   ```

3. **Verify GitHub repository has all files**:
   - Check your GitHub repository online
   - Ensure `src/`, `prisma/`, and other folders are committed and pushed
   - Verify you're deploying from the correct branch (`production`)

4. **Redeploy from Hostinger**:
   - Go to Hostinger dashboard
   - Find your app
   - Click **"Redeploy"** or **"Deploy"** button
   - This will pull fresh files from GitHub

5. **Check deployment logs**:
   - In Hostinger dashboard, check deployment/build logs
   - Look for errors about missing files
   - Verify the build completed successfully

### npm: command not found

**Issue**: When trying to run `npm install` in Hostinger's terminal, you get:
```
-bash: npm: command not found
```

**This is normal!** Here's why and what to do:

**Why this happens**:
- Hostinger's SSH/terminal environment may not have Node.js/npm in the PATH
- The terminal you're accessing might be a basic shell without Node.js tools
- Hostinger uses a separate build environment for running npm commands

**Solution**: **You don't need to run `npm install` manually!**

1. **Hostinger automatically runs `npm install` during deployment**:
   - When you deploy from GitHub, Hostinger's build system:
     - Clones your repository
     - Runs `npm install` automatically
     - Runs your build command (`npm run build`)
     - Deploys the application

2. **Check if dependencies are already installed**:
   ```bash
   # Check if node_modules exists
   ls -la node_modules/
   # If this folder exists and has content, npm install already ran
   ```

3. **To initialize the database, use Option B** (run Prisma from your local machine):
   - See "Step 9: Initialize the Database - Option B" in the guide
   - This runs Prisma commands from your local computer, connecting to the remote database

4. **If you really need to run npm commands**:
   - Check Hostinger's documentation for their specific Node.js/npm setup
   - Some hosting providers have a separate "Node.js" or "App" terminal
   - Contact Hostinger support for access to the build environment

**Bottom line**: If `node_modules/` exists, dependencies are installed. Use your local machine to run Prisma commands for database initialization.

### Build Fails

- **Check build logs** in Hostinger dashboard
- **Verify Node.js version** matches your requirements
- **Ensure all dependencies** are in `package.json`
- **Check for TypeScript errors**: Run `npm run build` locally first

### Database Connection Errors

#### Error: "invalid port number in database URL"

**Common causes**:
1. **Supabase connection string format issue**
2. **Missing or incorrect port number**
3. **Special characters in password not URL-encoded**

**Solutions**:

**For Supabase**:
1. **Use Session Pooler connection string** (recommended for IPv4):
   - Go to Supabase → **Project Settings** → **Database** → **Connection string**
   - Select **"Session mode"** (not Transaction mode)
   - Select **"URI"** tab
   - Copy the connection string
   - Should look like: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`
   - **Port should be `6543`** (Session Pooler) not `5432`

2. **Check your connection string format**:
   ```bash
   # Example of correct Session Pooler format:
   postgresql://postgres.abcdefghijklmnop:yourpassword@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   
   # Common mistakes:
   # ❌ Missing port: postgresql://postgres:pass@host/postgres
   # ❌ Wrong port: postgresql://postgres:pass@host:5432/postgres (use 6543 for pooler)
   # ❌ Extra spaces: postgresql://postgres: pass@host:6543/postgres
   ```

3. **URL-encode special characters in password**:
   - If your password contains special characters (`@`, `#`, `%`, `&`, etc.), they need to be URL-encoded
   - Example: `@` becomes `%40`, `#` becomes `%23`
   - Or change your Supabase database password to one without special characters

4. **Verify connection string**:
   ```bash
   # Test the connection string format
   echo $DATABASE_URL
   # Should show the full connection string without line breaks
   ```

**General troubleshooting**:
- **Verify `DATABASE_URL`** is correct in environment variables
- **Check connection string format**:
  - PostgreSQL: `postgresql://user:pass@host:port/db`
  - MySQL: `mysql://user:pass@host:port/db`
- **Check database allows connections** from your IP (for external databases)
- **For PostgreSQL**: Ensure SSL mode is set if required: `?sslmode=require`
- **For MySQL**: May need to add `?ssl=true` if SSL is required
- **Test connection** using a database client (like `psql` or DBeaver)

### App Not Starting

- **Check start command** is correct: `npm start` or `next start`
- **Verify port** is set correctly (Hostinger usually handles this)
- **Check environment variables** are all set
- **Review application logs** for specific errors

### No Data Showing

- **Trigger manual refresh** using "Refresh Now" button
- **Check API endpoint logs** in Hostinger
- **Verify scraping functions** work (kworb.net structure may have changed)
- **Check database** has data using Prisma Studio or database UI

### Refresh Now Button Fails

**Issue**: Clicking "Refresh Now" shows "Refresh failed" error.

**Common causes and solutions**:

1. **ADMIN_SECRET not set or incorrect (401 Unauthorized error)**:
   
   **Symptoms**: Getting "401 Unauthorized" when clicking "Refresh Now"
   
   **Step-by-step fix**:
   
   a. **Verify ADMIN_SECRET is set in Hostinger**:
      - Go to Hostinger → Your App → **Settings** → **Environment Variables**
      - Look for `ADMIN_SECRET` in the list
      - If it's missing, add it:
        - Click **"Add Variable"** or **"Add Environment Variable"**
        - **Key**: `ADMIN_SECRET`
        - **Value**: Generate a strong random string:
          ```bash
          # On your local machine, run:
          openssl rand -hex 32
          # Copy the output (e.g., a1b2c3d4e5f6...)
          ```
        - **Environment**: Check ☑ Production (and Preview/Development if needed)
        - Click **"Save"**
   
   b. **Copy the exact value**:
      - In Hostinger, click on the `ADMIN_SECRET` variable to view it
      - Copy the entire value (no spaces before/after)
      - Save it securely (you'll need it to refresh data)
   
   c. **Redeploy the app**:
      - After adding/updating `ADMIN_SECRET`, you may need to redeploy
      - Go to Hostinger → Your App → **Deployments**
      - Click **"Redeploy"** or trigger a new deployment
      - Wait for deployment to complete
   
   d. **Test the refresh**:
      - Go to your app: `https://rosybrown-raccoon-221186.hostingersite.com`
      - Click "Refresh Now"
      - Enter the **exact** value you copied from Hostinger
      - Make sure there are no extra spaces
      - The value is case-sensitive
   
   e. **Common mistakes**:
      - ❌ Extra spaces before/after the secret
      - ❌ Using a different value than what's in Hostinger
      - ❌ Case sensitivity (uppercase vs lowercase)
      - ❌ Forgetting to redeploy after updating the variable
      - ❌ Using the secret from `.env` file instead of Hostinger's value
   
   f. **If still not working**:
      - Check Hostinger logs for errors
      - Verify the variable name is exactly `ADMIN_SECRET` (case-sensitive)
      - Try regenerating the secret and updating it in Hostinger

2. **ADMIN_SECRET not configured (500 error with "ADMIN_SECRET not configured" message)**:
   
   **Symptoms**: Getting "500 Internal Server Error" with message "Server configuration error: ADMIN_SECRET not configured"
   
   **This means**: The server cannot read the `ADMIN_SECRET` environment variable at runtime, even though it's set in Hostinger.
   
   **Step-by-step fix**:
   
   a. **Verify ADMIN_SECRET is set correctly in Hostinger**:
      - Go to Hostinger → Your App → **Settings** → **Environment Variables**
      - Find `ADMIN_SECRET` in the list
      - **Check the exact name**: It must be exactly `ADMIN_SECRET` (case-sensitive, no spaces)
      - Click on it to view the value
      - Make sure there are no extra spaces before/after the value
   
   b. **Check environment scope**:
      - In Hostinger, when viewing `ADMIN_SECRET`, check which environments it's enabled for
      - Make sure **Production** is checked ☑
      - If you have multiple environments (Production, Preview, Development), enable it for Production
   
   c. **Redeploy/Restart the app**:
      - **This is critical**: After setting/updating environment variables, you MUST redeploy
      - Go to Hostinger → Your App → **Deployments**
      - Click **"Redeploy"** or **"Restart"**
      - Wait for the deployment to complete (can take 2-5 minutes)
      - Environment variables are loaded when the app starts, so a restart is required
   
   d. **Verify the variable is loaded at runtime**:
      - After redeploying, check Hostinger logs:
        - Go to Hostinger → Your App → **Logs**
        - Look for any errors about environment variables
        - The improved error handler will now log available env vars if ADMIN_SECRET is missing
   
   e. **Common causes**:
      - ❌ Variable name has a typo (e.g., `ADMIN_SECRET ` with trailing space, or `admin_secret` lowercase)
      - ❌ Variable not enabled for Production environment
      - ❌ App not restarted/redeployed after setting the variable
      - ❌ Hostinger platform issue (environment variables not being passed to runtime)
   
   f. **If still not working**:
      - **Check Hostinger logs** for environment variable loading errors
      - **Try deleting and recreating** the `ADMIN_SECRET` variable:
        1. Delete the existing `ADMIN_SECRET` variable
        2. Create a new one with the exact name `ADMIN_SECRET`
        3. Set a new value (generate with `openssl rand -hex 32`)
        4. Enable for Production
        5. Redeploy the app
      - **Contact Hostinger support** if the variable still isn't available:
        - Explain that environment variables set in the dashboard aren't available at runtime
        - Ask if there's a specific way to set environment variables for Next.js apps
        - Provide the error message: "ADMIN_SECRET not configured"
   
   g. **Alternative: Use a different variable name** (if Hostinger has issues with ADMIN_SECRET):
      - Try using `NEXT_PUBLIC_ADMIN_SECRET` (though this exposes it to client-side, not recommended)
      - Or contact Hostinger support for the correct way to set server-side environment variables

3. **Check browser console for detailed error**:
   - Open browser Developer Tools (F12)
   - Go to **Console** tab
   - Click "Refresh Now" again
   - Look for the actual error message (now shows detailed errors with troubleshooting steps)

3. **Database connection issues**:
   - Verify `DATABASE_URL` is set correctly in environment variables
   - Test database connection using Prisma Studio or database client
   - Check if database allows connections from Hostinger's IPs

4. **Timeout issues**:
   - The refresh process can take several minutes
   - Check Hostinger logs for timeout errors
   - Consider using the GET endpoint instead (runs in background)

5. **Check Hostinger application logs**:
   - Go to Hostinger dashboard → Your App → **Logs**
   - Look for errors related to:
     - Database connections
     - Scraping failures
     - API endpoint errors

6. **Verify environment variables are loaded**:
   - All required variables should be set:
     - `SPOTIFY_CLIENT_ID`
     - `SPOTIFY_CLIENT_SECRET`
     - `ADMIN_SECRET`
     - `DATABASE_URL`
   - Make sure they're enabled for **Production** environment

### Page Not Loading in Chrome (400 Bad Request on Static Chunks)

**Issue**: Page loads in Firefox but not in Chrome. Chrome shows "400 Bad Request" error when trying to load Next.js static chunks (e.g., `/_next/static/chunks/app/page-xxx.js`).

**Possible causes**:
1. **Hostinger static file serving configuration**
2. **Content-Type headers not set correctly**
3. **Chrome being more strict about request headers**
4. **Routing/rewrite rules in Hostinger**

**Solutions**:

1. **Check Hostinger static file configuration**:
   - Go to Hostinger → Your App → **Settings**
   - Look for **"Static Files"** or **"Routing"** settings
   - Ensure static files from `/_next/static/` are served correctly
   - Check if there are any rewrite rules that might interfere

2. **Verify Output Directory setting**:
   - In Hostinger → Your App → **Build Settings**
   - Ensure **Output Directory** is set to `.next`
   - This is where Next.js stores built files

3. **Check for routing/rewrite issues**:
   - Hostinger might need specific routing rules for Next.js
   - Contact Hostinger support to ensure `/_next/static/*` paths are properly handled
   - Ask if they need any specific configuration for Next.js static file serving

4. **Try clearing Chrome cache**:
   - Chrome might have cached a bad response
   - Press `Ctrl+Shift+Delete` → Clear cached images and files
   - Or try Incognito mode: `Ctrl+Shift+N`

5. **Check Chrome Developer Tools**:
   - Open Chrome DevTools (F12) → **Network** tab
   - Try loading the page
   - Click on the failed request (400 error)
   - Check **Headers** tab:
     - Request URL
     - Request Method
     - Response Headers (especially `Content-Type`)
   - Check **Response** tab for error details

6. **Contact Hostinger Support**:
   - This appears to be a Hostinger server configuration issue
   - Provide them with:
     - The exact error (400 Bad Request)
     - The URL that fails: `/_next/static/chunks/app/page-xxx.js`
     - That it works in Firefox but not Chrome
     - Ask if they need specific Next.js configuration

7. **Temporary workaround**:
   - Use Firefox for now (if it works)
   - Or try a different browser (Edge, Safari)
   - This is likely a Hostinger configuration issue that needs their support

**Note**: This is typically a hosting provider configuration issue, not a code issue. The fact that it works in Firefox suggests the files are being served, but Chrome's request might be handled differently by Hostinger's server.

### Custom Domain Not Working

- **Verify DNS records** are correct
- **Wait for DNS propagation** (can take up to 48 hours)
- **Check SSL certificate** is provisioned
- **Ensure domain is verified** in Hostinger

### Cron Jobs Not Running

- **Verify cron service** is active (if using external service)
- **Check cron job URL** is correct
- **Verify Authorization header** is set correctly
- **Test manually** by visiting the cron endpoint URL

## Support Resources

- **Hostinger Support**: [hostinger.com/support](https://www.hostinger.com/support)
- **Hostinger Knowledge Base**: Check their documentation for web app hosting
- **Hostinger Community**: Forums and community support

## Next Steps

- Set up monitoring/alerting (optional)
- Configure analytics (optional)
- Add more features as needed
- Scale resources if needed (Hostinger allows upgrading plans)

## Cost Summary

- **Hostinger Web App Hosting**: Starting at $7.45/mo (with discount)
- **Database**: 
  - **Option A (Recommended)**: External PostgreSQL - Free tier available (Supabase, Neon, Railway)
  - **Option B**: Hostinger MySQL - Usually included with hosting plan
- **Cron Service**: Free tier available (cron-job.org, EasyCron)
- **Domain**: Free for 1 year with Hostinger plan, then ~$10-15/year
- **Total**: ~$7.45-10/month (depending on plan and database choice)

---

**Note**: Hostinger's web app hosting is a relatively new service. If you encounter any issues specific to Next.js or Prisma, contact Hostinger support for assistance. The service auto-detects frameworks, but some manual configuration may be needed for complex setups like this one.

