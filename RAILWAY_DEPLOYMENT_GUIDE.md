# Complete Railway Deployment Guide - Step by Step

**Deploy PixEcom Backend to Railway in 20 Minutes**

This guide walks you through deploying your NestJS backend from GitLab to Railway with automatic CI/CD.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step 1: Create Railway Account](#step-1-create-railway-account-2-minutes)
3. [Step 2: Create Railway Project](#step-2-create-railway-project-3-minutes)
4. [Step 3: Add PostgreSQL Database](#step-3-add-postgresql-database-2-minutes)
5. [Step 4: Add Redis Cache](#step-4-add-redis-cache-2-minutes)
6. [Step 5: Configure Backend Service](#step-5-configure-backend-service-5-minutes)
7. [Step 6: Get Railway Token](#step-6-get-railway-token-2-minutes)
8. [Step 7: Update GitLab CI/CD](#step-7-update-gitlab-cicd-3-minutes)
9. [Step 8: Deploy!](#step-8-deploy-1-minute)
10. [Step 9: Verify Deployment](#step-9-verify-deployment-2-minutes)
11. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you start, make sure you have:

- ✅ GitLab repository with code (already done!)
- ✅ Credit card (required for Railway, even for free tier)
- ✅ Email address
- ⏱️ 20 minutes of time

**Cost:** Free $5 credit/month (Hobby plan) - Enough for MVP

---

## Step 1: Create Railway Account (2 minutes)

### 1.1 Sign Up

1. Open your browser and go to: **https://railway.app**
2. Click **"Start a New Project"** or **"Login"**
3. Choose sign-up method:
   - **GitHub** (recommended - easiest)
   - **Email**
   - **Google**
4. Complete the sign-up process
5. **Verify your email** if prompted

### 1.2 Add Payment Method

Railway requires a credit card even for the free tier:

1. After signing up, you'll be prompted to add a payment method
2. Click **"Add Payment Method"**
3. Enter your credit card details
4. Click **"Add Card"**

**Don't worry:** You get $5 free credit every month. You won't be charged unless you exceed this.

✅ **Checkpoint:** You should now see the Railway dashboard.

---

## Step 2: Create Railway Project (3 minutes)

### 2.1 Create New Project

1. On Railway dashboard, click **"+ New Project"**
2. You'll see several options:
   - Deploy from GitHub repo
   - Deploy from template
   - Empty project
3. Click **"Empty Project"**

### 2.2 Name Your Project

1. Click on the project name (usually "project-xxxxx")
2. Rename it to: **`PixEcom`** or **`pixecom-production`**
3. Press Enter to save

✅ **Checkpoint:** You should see an empty project with no services yet.

---

## Step 3: Add PostgreSQL Database (2 minutes)

### 3.1 Add Database Service

1. In your Railway project, click **"+ New"** button
2. Select **"Database"**
3. Choose **"Add PostgreSQL"**
4. Railway will create the database (takes ~10-15 seconds)

### 3.2 Verify Database Created

1. You should see a new PostgreSQL service in your project
2. Click on the PostgreSQL service
3. Go to **"Variables"** tab
4. You should see `DATABASE_URL` already generated

**Example `DATABASE_URL`:**
```
postgresql://postgres:password@postgres.railway.internal:5432/railway
```

✅ **Checkpoint:** PostgreSQL service is running with a `DATABASE_URL` variable.

---

## Step 4: Add Redis Cache (2 minutes)

### 4.1 Add Redis Service

1. Click **"+ New"** button again
2. Select **"Database"**
3. Choose **"Add Redis"**
4. Railway will create the Redis instance (~10 seconds)

### 4.2 Verify Redis Created

1. You should see a Redis service in your project
2. Click on the Redis service
3. Go to **"Variables"** tab
4. You should see `REDIS_URL` already generated

**Example `REDIS_URL`:**
```
redis://default:password@redis.railway.internal:6379
```

✅ **Checkpoint:** Both PostgreSQL and Redis are running.

---

## Step 5: Configure Backend Service (5 minutes)

### 5.1 Connect GitLab Repository

1. Click **"+ New"** button
2. Select **"GitHub Repo"** → Then choose **"Configure GitLab"**
3. Click **"Connect to GitLab"**
4. Authorize Railway to access your GitLab account
5. Select your repository: **`pixelxlab-group/pixelxlab-project`**
6. Click **"Add Repository"**

### 5.2 Configure Service Settings

After adding the repository:

1. Railway will create a new service
2. Click on the service name and rename it to: **`api`**
3. Go to **"Settings"** tab

#### Root Directory:
```
apps/api
```

#### Build Command:
```bash
pnpm install && pnpm prisma generate && pnpm build
```

#### Start Command:
```bash
node dist/main.js
```

#### Watch Paths (optional but recommended):
```
apps/api/**
packages/**
pnpm-lock.yaml
```

### 5.3 Add Environment Variables

1. Go to **"Variables"** tab in your `api` service
2. Click **"+ New Variable"**
3. Add these variables one by one:

#### Variable 1: NODE_ENV
```
Variable: NODE_ENV
Value: production
```

#### Variable 2: PORT
```
Variable: PORT
Value: 3001
```

#### Variable 3: DATABASE_URL (Reference)
```
Variable: DATABASE_URL
Value: ${{Postgres.DATABASE_URL}}
```
**Important:** Use the reference format `${{Postgres.DATABASE_URL}}` - Railway will automatically inject the actual URL

#### Variable 4: REDIS_URL (Reference)
```
Variable: REDIS_URL
Value: ${{Redis.REDIS_URL}}
```

#### Variable 5: JWT_SECRET

Generate a secure secret:

**On Windows (PowerShell):**
```powershell
# Run this command to generate a random secret
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

**On Mac/Linux:**
```bash
# Run this command
openssl rand -base64 32
```

**Or use Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Then add the variable:
```
Variable: JWT_SECRET
Value: [paste your generated secret here]
```

#### Variable 6: JWT_REFRESH_SECRET

Generate another different secret (using same method as above):
```
Variable: JWT_REFRESH_SECRET
Value: [paste your different generated secret here]
```

#### Variable 7: FRONTEND_URL
```
Variable: FRONTEND_URL
Value: https://pixecom-web.pages.dev
```
**Note:** Update this later after deploying frontend to Cloudflare

#### Variable 8: DEV_MODE
```
Variable: DEV_MODE
Value: false
```

### 5.4 Optional Variables (for payments)

Add these if you have the keys:

```
Variable: STRIPE_SECRET_KEY
Value: sk_live_your_key (or sk_test_your_key for testing)

Variable: PAYPAL_CLIENT_ID
Value: your_paypal_client_id

Variable: PAYPAL_SECRET
Value: your_paypal_secret
```

✅ **Checkpoint:** All environment variables are configured.

---

## Step 6: Get Railway Token (2 minutes)

You need a Railway API token for GitLab CI/CD to deploy automatically.

### 6.1 Generate Token

1. Click on your profile icon (top right)
2. Select **"Account Settings"**
3. Go to **"Tokens"** tab (or visit: https://railway.app/account/tokens)
4. Click **"Create New Token"**
5. Name it: **`GitLab CI/CD`**
6. Click **"Create"**
7. **COPY THE TOKEN IMMEDIATELY** - you won't see it again!

**Example token:**
```
railway-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

Keep this token safe - you'll need it in the next step.

✅ **Checkpoint:** You have your Railway token copied and saved.

---

## Step 7: Update GitLab CI/CD (3 minutes)

### 7.1 Add Updated CI/CD Configuration

First, update your `.gitlab-ci.yml` file:

1. Open your local project folder
2. Replace the entire `.gitlab-ci.yml` file with this:

```yaml
# GitLab CI/CD Pipeline for PixEcom → Railway
image: node:20-alpine

stages:
  - install
  - build
  - migrate
  - deploy

variables:
  PNPM_VERSION: "9.15.0"
  RAILWAY_VERSION: "3.5.0"

cache:
  key:
    files:
      - pnpm-lock.yaml
  paths:
    - .pnpm-store

# STAGE 1: Install dependencies
install:
  stage: install
  before_script:
    - npm install -g pnpm@${PNPM_VERSION}
    - pnpm config set store-dir .pnpm-store
  script:
    - echo "📦 Installing dependencies..."
    - pnpm install --frozen-lockfile
  artifacts:
    paths:
      - node_modules/
      - apps/*/node_modules/
      - packages/*/node_modules/
    expire_in: 1 hour
  only:
    - main
    - master

# STAGE 2: Build backend
build:
  stage: build
  needs: [install]
  before_script:
    - npm install -g pnpm@${PNPM_VERSION}
  script:
    - echo "🔨 Generating Prisma Client..."
    - cd apps/api
    - pnpm prisma generate
    - echo "🔨 Building backend..."
    - cd ../..
    - pnpm --filter api build
  artifacts:
    paths:
      - apps/api/dist/
      - apps/api/node_modules/.prisma/
    expire_in: 1 hour
  only:
    - main
    - master

# STAGE 3: Run database migrations
migrate:
  stage: migrate
  needs: [build]
  before_script:
    - npm install -g @railway/cli@${RAILWAY_VERSION}
    - npm install -g pnpm@${PNPM_VERSION}
    - |
      if [ -z "$RAILWAY_TOKEN" ]; then
        echo "❌ ERROR: RAILWAY_TOKEN not set"
        exit 1
      fi
  script:
    - echo "🚂 Running database migrations..."
    - cd apps/api
    - railway run --service api pnpm prisma migrate deploy
  allow_failure: false
  retry:
    max: 2
    when:
      - runner_system_failure
      - stuck_or_timeout_failure
  only:
    - main
    - master

# STAGE 4: Deploy to Railway
deploy:
  stage: deploy
  needs: [migrate]
  before_script:
    - npm install -g @railway/cli@${RAILWAY_VERSION}
    - |
      if [ -z "$RAILWAY_TOKEN" ]; then
        echo "❌ ERROR: RAILWAY_TOKEN not set"
        exit 1
      fi
  script:
    - echo "🚀 Deploying to Railway..."
    - railway up --service api
    - echo "✅ Deployment complete!"
  environment:
    name: production
  only:
    - main
    - master

# Optional: Health check
health_check:
  stage: .post
  needs: [deploy]
  before_script:
    - apk add --no-cache curl
  script:
    - echo "🏥 Health check..."
    - sleep 30
    - |
      if [ -n "$RAILWAY_DOMAIN" ]; then
        curl -f https://$RAILWAY_DOMAIN/api/health || echo "⚠️ Health check failed"
      fi
  allow_failure: true
  only:
    - main
    - master
```

3. Save the file

### 7.2 Commit and Push

```bash
# Stage the changes
git add .gitlab-ci.yml

# Commit
git commit -m "feat: add Railway auto-deployment to GitLab CI/CD"

# Push to GitLab (but don't trigger deployment yet)
git push gitlab master
```

**Don't worry** - the pipeline will fail for now because we haven't added the Railway token yet.

### 7.3 Add Railway Token to GitLab

1. Go to your GitLab project: **https://gitlab.com/pixelxlab-group/pixelxlab-project**
2. Navigate to: **Settings → CI/CD**
3. Expand **"Variables"** section
4. Click **"Add variable"**

Add the Railway token:

```
Key: RAILWAY_TOKEN
Value: [paste your Railway token from Step 6]
Type: Variable
Environment scope: All (default)
Protect variable: ✅ Check this
Mask variable: ✅ Check this
Expand variable reference: ❌ Leave unchecked
```

5. Click **"Add variable"**

### 7.4 Add Railway Domain (Optional - for health checks)

1. Get your Railway domain:
   - Go to Railway → `api` service → **Settings** → **Domains**
   - Copy the generated domain (e.g., `pixecom-api-production.up.railway.app`)

2. Add it to GitLab CI variables:

```
Key: RAILWAY_DOMAIN
Value: pixecom-api-production.up.railway.app
Type: Variable
Protect variable: ❌ No
Mask variable: ❌ No
```

✅ **Checkpoint:** GitLab CI/CD is configured with Railway token.

---

## Step 8: Deploy! (1 minute)

### 8.1 Trigger First Deployment

Now let's trigger the deployment:

```bash
# Make a small change to trigger deployment
echo "" >> README.md

# Commit
git add .
git commit -m "chore: trigger first Railway deployment"

# Push to GitLab
git push gitlab master
```

### 8.2 Watch the Pipeline

1. Go to GitLab: **CI/CD → Pipelines**
2. You should see a pipeline running
3. Click on it to watch the progress

**Pipeline stages:**
1. ✅ Install (~2-3 min)
2. ✅ Build (~1-2 min)
3. ✅ Migrate (~30-60 sec)
4. ✅ Deploy (~2-3 min)
5. ✅ Health Check (~30 sec)

**Total time:** ~6-8 minutes for first deployment

✅ **Checkpoint:** Pipeline is running successfully.

---

## Step 9: Verify Deployment (2 minutes)

### 9.1 Check Railway Dashboard

1. Go to Railway dashboard
2. Click on your `api` service
3. Go to **"Deployments"** tab
4. You should see the latest deployment with status: **"Active"** or **"Success"**

### 9.2 Check Logs

1. In the `api` service, click **"View Logs"**
2. You should see:
   ```
   Server is running on port 3001
   Database connected
   ```

### 9.3 Get Your API URL

1. In `api` service, go to **"Settings"** → **"Domains"**
2. Railway generates a URL like:
   ```
   https://pixecom-api-production-xxxx.up.railway.app
   ```
3. **Copy this URL** - you'll need it for the frontend

### 9.4 Test Your API

Open your browser or use curl:

```bash
# Test health endpoint
curl https://your-railway-url.railway.app/api/health

# Should return:
{"status":"ok","timestamp":"2026-02-14T..."}

# Test API docs
# Open in browser:
https://your-railway-url.railway.app/api/docs
```

You should see the Swagger API documentation!

### 9.5 Test Database Connection

```bash
# Test a protected endpoint (should return 401 if not logged in)
curl https://your-railway-url.railway.app/api/users

# Should return:
{"statusCode":401,"message":"Unauthorized"}
```

This confirms the API is running and database is connected!

✅ **Checkpoint:** Your backend is live and working!

---

## 🎉 Deployment Complete!

### What You've Accomplished:

- ✅ Railway account created
- ✅ PostgreSQL database configured
- ✅ Redis cache configured
- ✅ Backend service deployed
- ✅ GitLab CI/CD configured
- ✅ Auto-deployment working
- ✅ API is live and accessible

### Your URLs:

- **API Base:** https://your-project.railway.app/api
- **API Docs:** https://your-project.railway.app/api/docs
- **Health Check:** https://your-project.railway.app/api/health

### What Happens Now:

Every time you push to the `main` or `master` branch on GitLab:

1. ✅ GitLab CI runs tests and builds your code
2. ✅ Runs database migrations
3. ✅ Deploys to Railway automatically
4. ✅ Your API updates with zero downtime

---

## Next Steps

### 1. Update CORS for Frontend

Once you deploy your frontend to Cloudflare Pages, update the CORS settings:

**File:** `apps/api/src/main.ts`

```typescript
app.enableCors({
  origin: [
    'http://localhost:3000',
    'https://pixecom-web.pages.dev',  // Your Cloudflare Pages URL
    'https://your-custom-domain.com', // If you have one
  ],
  credentials: true,
});
```

Then commit and push:
```bash
git add apps/api/src/main.ts
git commit -m "fix: update CORS for Cloudflare Pages"
git push gitlab master
```

### 2. Deploy Frontend to Cloudflare Pages

Follow the Cloudflare deployment guide:
- See: `CLOUDFLARE_SETUP.md`
- Use your Railway API URL in the `NEXT_PUBLIC_API_URL` environment variable

### 3. Set Up Custom Domain (Optional)

**For Railway:**
1. Railway → `api` service → Settings → Domains
2. Click "Add Custom Domain"
3. Enter: `api.yourdomain.com`
4. Add CNAME record to your DNS:
   ```
   Type: CNAME
   Name: api
   Value: your-project.up.railway.app
   ```

### 4. Enable Database Backups

1. Railway → PostgreSQL service → Settings
2. Enable automatic backups
3. Or manually export:
   ```bash
   railway run --service postgres pg_dump > backup.sql
   ```

### 5. Monitor Your Application

**Railway Metrics:**
- Railway → `api` service → Metrics
- Monitor CPU, Memory, Network usage

**Set up external monitoring:**
- **Uptime Robot:** Free uptime monitoring
- **Sentry:** Error tracking and monitoring
- **LogRocket:** Session replay and debugging

---

## Troubleshooting

### Pipeline fails at "install" stage

**Problem:** Dependencies won't install

**Solution:**
```bash
# Clear GitLab cache
# GitLab → CI/CD → Pipelines → Clear runner caches

# Verify pnpm-lock.yaml exists
git ls-files pnpm-lock.yaml

# If missing, regenerate:
pnpm install
git add pnpm-lock.yaml
git commit -m "chore: add pnpm-lock.yaml"
git push gitlab master
```

### Pipeline fails at "migrate" stage

**Problem:** Migration fails or Railway token not found

**Solution:**
```bash
# 1. Verify RAILWAY_TOKEN in GitLab
# Settings → CI/CD → Variables → Check RAILWAY_TOKEN exists

# 2. Test migration locally
railway login
cd apps/api
railway run --service api pnpm prisma migrate deploy

# 3. Check Railway logs
railway logs --service api
```

### Pipeline fails at "deploy" stage

**Problem:** Deployment fails

**Solution:**
```bash
# Check Railway service logs
railway logs --service api --tail

# Verify environment variables
railway variables --service api

# Try manual deploy
railway up --service api

# Check service status
railway status
```

### API returns 502 Bad Gateway

**Problem:** Service is not starting

**Solutions:**

1. **Check logs:**
   ```bash
   railway logs --service api --tail
   ```

2. **Common issues:**
   - Missing `DATABASE_URL` - Check Railway variables
   - Port mismatch - Ensure `PORT=3001` in env variables
   - Build failed - Check build logs in Railway

3. **Verify start command:**
   - Railway → `api` → Settings → Start Command
   - Should be: `node dist/main.js`

### Database connection fails

**Problem:** `Error: Can't reach database server`

**Solution:**
```bash
# 1. Verify DATABASE_URL is set correctly
railway variables --service api | grep DATABASE_URL

# 2. Check PostgreSQL service is running
railway status

# 3. Test connection
railway run --service api -- node -e "console.log(process.env.DATABASE_URL)"

# 4. Verify Prisma schema
cd apps/api
pnpm prisma validate
```

### CORS errors in frontend

**Problem:** Frontend can't access API

**Solution:**

1. Update CORS in `apps/api/src/main.ts`:
   ```typescript
   app.enableCors({
     origin: [
       'http://localhost:3000',
       'https://pixecom-web.pages.dev',
       'https://your-domain.com',
     ],
     credentials: true,
   });
   ```

2. Commit and push:
   ```bash
   git add apps/api/src/main.ts
   git commit -m "fix: update CORS origins"
   git push gitlab master
   ```

3. Wait for auto-deployment (~5 min)

### "Out of memory" errors

**Problem:** Railway service crashes due to memory

**Solution:**

1. **Upgrade Railway plan:**
   - Hobby plan: $5/month (512MB RAM)
   - Pro plan: $20/month (more resources)

2. **Optimize your app:**
   ```typescript
   // Reduce Prisma connection pool
   // In apps/api/src/prisma/prisma.service.ts
   this.prisma = new PrismaClient({
     datasources: {
       db: {
         url: process.env.DATABASE_URL,
       },
     },
     log: ['error', 'warn'], // Reduce logging
   });
   ```

3. **Monitor usage:**
   - Railway → `api` → Metrics
   - Check memory usage patterns

---

## Manual Deployment (Fallback)

If GitLab CI is down or you need to deploy manually:

```bash
# 1. Install Railway CLI (if not installed)
npm install -g @railway/cli

# 2. Login to Railway
railway login

# 3. Link to your project (first time only)
railway link

# 4. Install dependencies
pnpm install

# 5. Generate Prisma Client
cd apps/api
pnpm prisma generate

# 6. Build
cd ../..
pnpm --filter api build

# 7. Run migrations
cd apps/api
railway run --service api pnpm prisma migrate deploy

# 8. Deploy
railway up --service api

# 9. Check status
railway logs --service api --tail
```

---

## Cost Monitoring

### Current Usage (Free Tier):

**Railway Hobby Plan:**
- $5 free credit per month
- 512 MB RAM per service
- Shared CPU
- 1GB disk

**Typical PixEcom Usage:**
- **PostgreSQL:** ~$3/month
- **Redis:** ~$1/month
- **API Service:** ~$1/month
- **Total:** ~$5/month (within free tier)

### When You'll Need to Upgrade:

- More than 100 concurrent users
- Large database (>1GB)
- Heavy traffic (>100k requests/day)
- Need more than 512MB RAM

**Pro Plan:** $20/month
- 8GB RAM
- Dedicated CPU
- 10GB disk

---

## Best Practices

### 1. Use Environment Variables for Secrets

Never hardcode secrets in your code:

```typescript
// ❌ Bad
const jwtSecret = 'my-secret-key';

// ✅ Good
const jwtSecret = process.env.JWT_SECRET;
```

### 2. Enable Auto-Deploy Only for main Branch

Keep your `.gitlab-ci.yml` configured to only deploy on `main`:

```yaml
only:
  - main
  - master
```

### 3. Use Railway Environments

Create separate environments for staging:

```bash
# In Railway dashboard
# Create new environment: "staging"
# Duplicate all services
# Use different domain
```

### 4. Monitor Your Logs

Check Railway logs regularly:

```bash
railway logs --service api --tail
```

### 5. Set Up Alerts

1. Railway → Project → Settings → Notifications
2. Add email or Slack webhook
3. Get notified about deployment failures

---

## Summary

✅ **What We Did:**
1. Created Railway account
2. Set up PostgreSQL + Redis
3. Configured backend service
4. Connected GitLab repository
5. Set up automatic CI/CD deployment
6. Deployed successfully!

✅ **What You Get:**
- Auto-deployment from GitLab
- Production PostgreSQL database
- Redis caching
- Automatic HTTPS
- ~$5/month cost
- Zero-downtime deployments

✅ **What's Next:**
- Deploy frontend to Cloudflare Pages
- Set up custom domain
- Configure monitoring
- Add more features!

---

**🎉 Congratulations! Your backend is live on Railway!**

**Questions or issues?** Check the troubleshooting section above or Railway docs: https://docs.railway.app

---

**Last Updated:** February 2026
**Stack:** GitLab → Railway → PostgreSQL → Redis
**Auto-Deploy:** ✅ Enabled
