# GitLab Migration & Setup Guide

Complete guide for migrating PixEcom from GitHub to GitLab with CI/CD, Cloudflare Pages, and Railway.

## Stack Overview

```
┌─────────────────────────────────────────────────┐
│                  GitLab                         │
│  - Git Repository Hosting                      │
│  - CI/CD Pipelines                             │
│  - Issue Tracking                              │
└─────────────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌──────────────┐       ┌──────────────┐
│  Cloudflare  │       │   Railway    │
│    Pages     │       │   (Backend)  │
│  (Frontend)  │       │              │
└──────────────┘       └──────────────┘
```

## Part 1: Migrate to GitLab

### Step 1: Create GitLab Account

1. Go to https://gitlab.com/users/sign_up
2. Sign up with email or use GitHub/Google login
3. Verify your email

### Step 2: Create New Project on GitLab

1. Click "New project" button
2. Choose "Create blank project"
3. Fill in details:
   - **Project name:** `PixEcom`
   - **Project slug:** `pixecom` (or `pixecom-v2`)
   - **Visibility:** Private (or Public if open-source)
   - **Initialize with README:** Uncheck (we'll push existing code)
4. Click "Create project"

### Step 3: Push Code to GitLab

```bash
# 1. Add GitLab as a new remote
git remote add gitlab https://gitlab.com/YOUR_USERNAME/pixecom.git

# Or if you want to replace GitHub:
git remote set-url origin https://gitlab.com/YOUR_USERNAME/pixecom.git

# 2. Push all branches
git push -u gitlab master --force
git push gitlab --all
git push gitlab --tags

# 3. Verify the push
git remote -v
```

**Note:** Replace `YOUR_USERNAME` with your actual GitLab username.

### Step 4: Set Default Branch (Optional)

If you want to use `main` instead of `master`:

```bash
# Rename locally
git branch -m master main

# Push to GitLab
git push -u gitlab main

# On GitLab: Settings → Repository → Default branch → Change to 'main'
```

## Part 2: Set Up GitLab CI/CD

### Step 1: Create GitLab CI Configuration

The pipeline will:
- Run tests and linting
- Build the application
- Deploy frontend to Cloudflare Pages
- Deploy backend to Railway (optional auto-deploy)

**Create:** `.gitlab-ci.yml` in root directory

```yaml
# .gitlab-ci.yml
image: node:20

stages:
  - install
  - test
  - build
  - deploy

variables:
  PNPM_VERSION: "9.15.0"

# Cache for faster builds
cache:
  key: ${CI_COMMIT_REF_SLUG}
  paths:
    - .pnpm-store
    - node_modules/
    - apps/*/node_modules/

# Install dependencies
install:
  stage: install
  before_script:
    - npm install -g pnpm@${PNPM_VERSION}
    - pnpm config set store-dir .pnpm-store
  script:
    - pnpm install --frozen-lockfile
  artifacts:
    paths:
      - node_modules/
      - apps/*/node_modules/
      - packages/*/node_modules/
    expire_in: 1 day

# Lint code
lint:
  stage: test
  needs: [install]
  before_script:
    - npm install -g pnpm@${PNPM_VERSION}
  script:
    - pnpm lint
  rules:
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'
    - if: '$CI_COMMIT_BRANCH == "main" || $CI_COMMIT_BRANCH == "develop"'

# Type check
type-check:
  stage: test
  needs: [install]
  before_script:
    - npm install -g pnpm@${PNPM_VERSION}
  script:
    - pnpm db:generate
    - pnpm turbo run type-check
  rules:
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'
    - if: '$CI_COMMIT_BRANCH == "main" || $CI_COMMIT_BRANCH == "develop"'

# Run tests
test:
  stage: test
  needs: [install]
  services:
    - postgres:16-alpine
    - redis:7-alpine
  variables:
    POSTGRES_DB: pixecom_test
    POSTGRES_USER: pixecom
    POSTGRES_PASSWORD: pixecom_test
    DATABASE_URL: postgresql://pixecom:pixecom_test@postgres:5432/pixecom_test
    REDIS_URL: redis://redis:6379
    JWT_SECRET: test-secret-key
    JWT_REFRESH_SECRET: test-refresh-secret-key
  before_script:
    - npm install -g pnpm@${PNPM_VERSION}
  script:
    - pnpm db:generate
    - pnpm db:push
    - pnpm test
  rules:
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'
    - if: '$CI_COMMIT_BRANCH == "main" || $CI_COMMIT_BRANCH == "develop"'

# Build applications
build:
  stage: build
  needs: [install]
  before_script:
    - npm install -g pnpm@${PNPM_VERSION}
  script:
    - pnpm db:generate
    - pnpm build
  artifacts:
    paths:
      - apps/api/dist/
      - apps/web/.next/
    expire_in: 1 day
  rules:
    - if: '$CI_COMMIT_BRANCH == "main" || $CI_COMMIT_BRANCH == "develop"'

# Deploy to Cloudflare Pages
deploy:cloudflare:
  stage: deploy
  needs: [build]
  image: node:20
  before_script:
    - npm install -g wrangler pnpm@${PNPM_VERSION}
  script:
    - cd apps/web
    - |
      if [ "$CI_COMMIT_BRANCH" == "main" ]; then
        wrangler pages deploy .next --project-name=pixecom-web --branch=main
      else
        wrangler pages deploy .next --project-name=pixecom-web --branch=preview
      fi
  environment:
    name: production
    url: https://pixecom-web.pages.dev
  rules:
    - if: '$CI_COMMIT_BRANCH == "main"'
  only:
    - main

# Security scanning
security:
  stage: test
  before_script:
    - npm install -g pnpm@${PNPM_VERSION}
  script:
    - pnpm audit --audit-level=moderate
  allow_failure: true
  rules:
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'
    - if: '$CI_COMMIT_BRANCH == "main" || $CI_COMMIT_BRANCH == "develop"'
```

### Step 2: Configure GitLab CI/CD Variables

1. Go to: **Settings → CI/CD → Variables**
2. Click **Add variable** and add these:

| Key | Value | Protected | Masked |
|-----|-------|-----------|--------|
| `CLOUDFLARE_API_TOKEN` | Your Cloudflare API token | ✅ | ✅ |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID | ✅ | ✅ |
| `NEXT_PUBLIC_API_URL` | Your API URL | ❌ | ❌ |
| `DATABASE_URL` | PostgreSQL connection string | ✅ | ✅ |
| `JWT_SECRET` | Your JWT secret | ✅ | ✅ |
| `JWT_REFRESH_SECRET` | Your refresh secret | ✅ | ✅ |

**How to get Cloudflare tokens:**
1. Log in to Cloudflare Dashboard
2. My Profile → API Tokens → Create Token
3. Use "Edit Cloudflare Workers" template
4. Copy the token

### Step 3: Enable GitLab Runner

GitLab provides shared runners for free:

1. Go to: **Settings → CI/CD → Runners**
2. Verify "Shared runners" are enabled
3. You get **400 CI/CD minutes/month** on free tier

## Part 3: Deploy Backend to Railway

### Step 1: Create Railway Account

1. Go to https://railway.app/
2. Sign up with email or GitHub
3. Verify your email

### Step 2: Deploy Backend

#### Option A: Using Railway CLI (Recommended)

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login to Railway
railway login

# 3. Initialize project
railway init

# 4. Link to your project
railway link

# 5. Add PostgreSQL database
railway add --database postgres

# 6. Add Redis
railway add --database redis

# 7. Deploy API
cd apps/api
railway up
```

#### Option B: Using Railway Dashboard

1. **Create New Project**
   - Click "New Project"
   - Choose "Deploy from repo" → Connect GitLab
   - Select your repository
   - Choose `apps/api` as root directory

2. **Add PostgreSQL Database**
   - Click "New" → "Database" → "Add PostgreSQL"
   - Railway auto-generates `DATABASE_URL`

3. **Add Redis**
   - Click "New" → "Database" → "Add Redis"
   - Railway auto-generates `REDIS_URL`

4. **Configure Environment Variables**

   Go to your API service → Variables:

   ```bash
   NODE_ENV=production
   PORT=3001

   # Database (auto-generated by Railway)
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   REDIS_URL=${{Redis.REDIS_URL}}

   # Auth
   JWT_SECRET=your-production-jwt-secret
   JWT_REFRESH_SECRET=your-production-refresh-secret

   # CORS
   FRONTEND_URL=https://pixecom-web.pages.dev

   # Optional: Stripe, PayPal, etc.
   STRIPE_SECRET_KEY=sk_live_...
   ```

5. **Configure Build Settings**

   - **Root Directory:** `apps/api`
   - **Build Command:** `pnpm install && pnpm db:generate && pnpm build`
   - **Start Command:** `pnpm start:prod`

6. **Set up Custom Domain (Optional)**
   - Settings → Domains → Add custom domain
   - Example: `api.yourdomain.com`

### Step 3: Run Database Migrations

```bash
# Using Railway CLI
railway run pnpm db:push

# Or from Railway dashboard
# Open terminal in API service and run:
pnpm db:push
pnpm db:seed
```

### Step 4: Get Your API URL

Railway provides:
- Generated URL: `https://your-project.railway.app`
- Or custom domain: `https://api.yourdomain.com`

**Copy this URL** - you'll need it for Cloudflare Pages.

## Part 4: Deploy Frontend to Cloudflare Pages

### Step 1: Connect GitLab to Cloudflare

1. Go to Cloudflare Dashboard
2. Workers & Pages → Create application → Pages
3. Click "Connect to Git"
4. Choose "GitLab"
5. Authorize Cloudflare to access GitLab
6. Select your repository: `pixecom`

### Step 2: Configure Build Settings

- **Project name:** `pixecom-web`
- **Production branch:** `main`
- **Build command:**
  ```bash
  cd apps/web && pnpm install && pnpm build
  ```
- **Build output directory:** `apps/web/.next`
- **Root directory:** `/` (leave as root)

### Step 3: Set Environment Variables

Add these in Cloudflare Pages settings:

```bash
NODE_VERSION=20
NEXT_PUBLIC_API_URL=https://your-project.railway.app/api
```

**Important:** Use your Railway API URL from Part 3!

### Step 4: Deploy

1. Click "Save and Deploy"
2. Wait for first build (3-5 minutes)
3. Your site will be live at: `https://pixecom-web.pages.dev`

## Part 5: Configure CORS

Update your backend CORS settings to allow Cloudflare Pages:

**File:** `apps/api/src/main.ts`

```typescript
app.enableCors({
  origin: [
    'http://localhost:3000',
    'https://pixecom-web.pages.dev',
    'https://your-custom-domain.com', // if you have one
  ],
  credentials: true,
});
```

**Redeploy backend:**
```bash
railway up
# Or push to GitLab and Railway auto-deploys
```

## Part 6: Update Repository Documentation

Update these files with new information:

### Update README.md

```markdown
## 🚀 Deployment

**Current Stack:**
- **Git Hosting:** GitLab
- **CI/CD:** GitLab CI/CD
- **Frontend:** Cloudflare Pages
- **Backend:** Railway
- **Database:** Railway PostgreSQL
- **Cache:** Railway Redis

**Live URLs:**
- Frontend: https://pixecom-web.pages.dev
- Backend API: https://your-project.railway.app/api
- API Docs: https://your-project.railway.app/api/docs
```

## Complete Architecture

```
┌──────────────────────────────────────────────────┐
│               GitLab Repository                  │
│  - Source code                                   │
│  - CI/CD pipelines                              │
│  - Issue tracking                               │
└──────────────────────────────────────────────────┘
                      │
                      │ git push
                      ▼
┌──────────────────────────────────────────────────┐
│             GitLab CI/CD Pipeline                │
│  - Run tests                                     │
│  - Lint & type-check                            │
│  - Build frontend                               │
│  - Deploy to Cloudflare                         │
└──────────────────────────────────────────────────┘
          │                           │
          │                           │
          ▼                           ▼
┌──────────────────┐        ┌──────────────────────┐
│ Cloudflare Pages │        │      Railway         │
│                  │        │                      │
│ • Next.js app    │        │ • NestJS API         │
│ • Global CDN     │        │ • PostgreSQL DB      │
│ • Auto HTTPS     │◄───────┤ • Redis cache        │
│ • Edge caching   │  API   │ • Auto-deploy        │
└──────────────────┘        └──────────────────────┘
```

## Testing the Setup

### 1. Test GitLab CI/CD

```bash
# Make a small change
echo "# Test" >> README.md
git add .
git commit -m "test: trigger CI/CD"
git push gitlab main

# Check pipeline
# Go to: CI/CD → Pipelines on GitLab
```

### 2. Test Railway Deployment

1. Check Railway dashboard
2. View logs in Railway service
3. Test API: `https://your-project.railway.app/api/health`

### 3. Test Cloudflare Pages

1. Check Cloudflare Pages dashboard
2. Visit: `https://pixecom-web.pages.dev`
3. Verify frontend loads correctly

### 4. Test Full Integration

1. Open frontend
2. Try to login
3. Verify API calls work (check browser console)
4. Test a complete flow (browse products, add to cart, etc.)

## Monitoring & Logs

### GitLab CI/CD
- View pipelines: **CI/CD → Pipelines**
- Job logs: Click on any job in pipeline
- Failed jobs: **CI/CD → Pipelines → Failed**

### Railway
- **Deployments** tab: View deployment history
- **Metrics** tab: CPU, Memory, Network usage
- **Logs** tab: Application logs
- **Observability**: Built-in monitoring

### Cloudflare Pages
- **Deployments** tab: Build history
- **Analytics** tab: Traffic and performance
- **Functions** logs: Edge function logs (if using)

## Cost Breakdown

### Free Tier Limits

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| **GitLab** | Free forever (400 CI/CD min/month) | Premium $29/user/month |
| **Railway** | $5 credit/month (Hobby) | $20/month (Pro) |
| **Cloudflare Pages** | Unlimited (500 builds/month) | $20/month for more builds |

**Expected Monthly Cost:** ~$5/month (Railway Hobby plan)

## Troubleshooting

### GitLab CI/CD fails

1. Check pipeline logs
2. Verify CI/CD variables are set
3. Check `.gitlab-ci.yml` syntax
4. Ensure shared runners are enabled

### Railway deployment fails

1. Check deployment logs
2. Verify environment variables
3. Check build command and start command
4. Ensure `package.json` scripts are correct

### Cloudflare Pages build fails

1. Check build logs
2. Verify environment variables
3. Check build command paths
4. Ensure dependencies are in `package.json`

### CORS errors

1. Update CORS origins in backend
2. Redeploy backend
3. Clear browser cache
4. Check Network tab in DevTools

## Next Steps

- [ ] Set up custom domain for Cloudflare Pages
- [ ] Set up custom domain for Railway API
- [ ] Configure SSL certificates
- [ ] Set up error monitoring (Sentry)
- [ ] Configure backups for Railway database
- [ ] Set up GitLab merge request workflows
- [ ] Configure branch protection rules
- [ ] Set up staging environment

## Resources

- [GitLab CI/CD Documentation](https://docs.gitlab.com/ee/ci/)
- [Railway Documentation](https://docs.railway.app/)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [GitLab → Cloudflare Integration](https://developers.cloudflare.com/pages/platform/git-integration/)

---

**Setup completed!** 🎉

Your application is now:
- ✅ Hosted on GitLab
- ✅ Auto-deployed via GitLab CI/CD
- ✅ Frontend on Cloudflare Pages (global CDN)
- ✅ Backend on Railway (with database)
