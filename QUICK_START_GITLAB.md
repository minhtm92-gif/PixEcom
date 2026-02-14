# 🚀 Quick Start: GitLab + Cloudflare + Railway

**Complete your deployment in 30 minutes!**

## Prerequisites

- ✅ GitLab account (free)
- ✅ Cloudflare account (free)
- ✅ Railway account (free $5 credit)
- ✅ Credit card for Railway (required even for free tier)

## Step 1: Push to GitLab (5 minutes)

### 1.1 Create GitLab Project

1. Go to https://gitlab.com
2. Click "New project" → "Create blank project"
3. Project name: `PixEcom`
4. Visibility: Private
5. Click "Create project"

### 1.2 Push Your Code

```bash
# Add GitLab remote
git remote add gitlab https://gitlab.com/YOUR_USERNAME/pixecom.git

# Push code
git push -u gitlab master

# Verify
git remote -v
```

**✅ Done!** Your code is now on GitLab.

---

## Step 2: Deploy Backend to Railway (10 minutes)

### 2.1 Create Railway Project

1. Go to https://railway.app
2. Sign up/Login
3. Click "New Project"
4. Choose "Deploy from GitLab repo"
5. Connect your GitLab account
6. Select `pixecom` repository

### 2.2 Configure API Service

1. **Root Directory:** `apps/api`
2. **Build Command:**
   ```bash
   pnpm install && pnpm db:generate && pnpm build
   ```
3. **Start Command:**
   ```bash
   node dist/main.js
   ```

### 2.3 Add Database

1. Click "+ New" → "Database" → "Add PostgreSQL"
2. Railway automatically creates `DATABASE_URL` variable

### 2.4 Add Redis

1. Click "+ New" → "Database" → "Add Redis"
2. Railway automatically creates `REDIS_URL` variable

### 2.5 Add Environment Variables

Click on API service → Variables → Raw Editor:

```bash
NODE_ENV=production
PORT=3001

# Database (auto-generated)
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}

# Generate these secrets (see below)
JWT_SECRET=your-random-32-char-secret-here
JWT_REFRESH_SECRET=your-different-random-32-char-secret

# CORS
FRONTEND_URL=https://pixecom-web.pages.dev
```

**Generate secrets:**
```bash
# Run this in terminal to generate secrets:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 2.6 Run Database Migration

In Railway API service → Click "..." → Deploy logs

Wait for deployment, then:
1. Railway → API service → "..." → "Open Shell"
2. Run:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

### 2.7 Get Your API URL

Railway generates a URL like:
```
https://pixecom-api-production-XXXX.up.railway.app
```

**Copy this URL!** You'll need it next.

**✅ Done!** Backend is live on Railway.

---

## Step 3: Deploy Frontend to Cloudflare (10 minutes)

### 3.1 Connect GitLab to Cloudflare

1. Go to https://dash.cloudflare.com
2. Workers & Pages → Create application → Pages
3. Click "Connect to Git"
4. Choose "GitLab"
5. Authorize Cloudflare
6. Select your `pixecom` repository

### 3.2 Configure Build

- **Project name:** `pixecom-web`
- **Production branch:** `master` (or `main`)
- **Build command:**
  ```bash
  cd apps/web && pnpm install && pnpm build
  ```
- **Build output directory:** `apps/web/.next`
- **Root directory:** `/` (leave blank)

### 3.3 Environment Variables

Click "Add variable":

```bash
NODE_VERSION=20
NEXT_PUBLIC_API_URL=https://your-railway-url.railway.app/api
```

**Replace** `your-railway-url` with your actual Railway URL from Step 2.7!

### 3.4 Save and Deploy

1. Click "Save and Deploy"
2. Wait 3-5 minutes for build
3. Your site will be live at: `https://pixecom-web.pages.dev`

**✅ Done!** Frontend is live on Cloudflare.

---

## Step 4: Configure GitLab CI/CD (5 minutes)

### 4.1 Add GitLab CI/CD Variables

Go to GitLab: **Settings → CI/CD → Variables**

Add these variables:

| Key | Value | Protected | Masked |
|-----|-------|-----------|--------|
| `CLOUDFLARE_API_TOKEN` | (get from Cloudflare) | ✅ | ✅ |
| `CLOUDFLARE_ACCOUNT_ID` | (get from Cloudflare) | ✅ | ✅ |
| `NEXT_PUBLIC_API_URL` | Your Railway API URL | ❌ | ❌ |

**Get Cloudflare API Token:**
1. Cloudflare → My Profile → API Tokens
2. Create Token → "Edit Cloudflare Workers" template
3. Copy the token

**Get Cloudflare Account ID:**
1. Cloudflare → Workers & Pages
2. Copy Account ID from right sidebar

### 4.2 Test CI/CD

```bash
# Make a small change
echo "# Test" >> README.md
git add .
git commit -m "test: trigger CI/CD"
git push gitlab master

# Watch pipeline
# GitLab → CI/CD → Pipelines
```

**✅ Done!** CI/CD is configured and running.

---

## Step 5: Update Backend CORS (2 minutes)

### 5.1 Update CORS Settings

**File:** `apps/api/src/main.ts`

Find the CORS configuration and update:

```typescript
app.enableCors({
  origin: [
    'http://localhost:3000',
    'https://pixecom-web.pages.dev', // Add this
  ],
  credentials: true,
});
```

### 5.2 Commit and Push

```bash
git add apps/api/src/main.ts
git commit -m "fix: update CORS for Cloudflare Pages"
git push gitlab master
```

Railway will auto-deploy the change.

**✅ Done!** Your app is fully deployed and functional!

---

## 🎉 You're Live!

### Your URLs

- **Frontend:** https://pixecom-web.pages.dev
- **Backend API:** https://your-project.railway.app/api
- **API Docs:** https://your-project.railway.app/api/docs
- **Admin Panel:** https://pixecom-web.pages.dev/admin

### Default Login

- **Email:** `admin@pixecom.io`
- **Password:** `Admin123!`

---

## Test Your Deployment

### 1. Test Frontend
```bash
# Visit your Cloudflare Pages URL
https://pixecom-web.pages.dev

# Should see the homepage
```

### 2. Test API
```bash
# Test health endpoint
curl https://your-project.railway.app/api/health

# Should return: {"status":"ok"}
```

### 3. Test Login
1. Go to: https://pixecom-web.pages.dev/login
2. Login with default credentials
3. Should redirect to admin dashboard

### 4. Test Complete Flow
1. Browse products
2. Add to cart
3. View orders in admin panel

---

## What Happens Now?

### Automatic Deployments

**When you push to GitLab:**
1. ✅ GitLab CI/CD runs tests
2. ✅ Builds frontend
3. ✅ Deploys to Cloudflare Pages (if tests pass)
4. ✅ Railway auto-deploys backend (on `main` branch)

**Workflow:**
```bash
# Make changes
git add .
git commit -m "feat: add new feature"
git push gitlab master

# Auto-deploys to production!
```

### Monitoring

- **GitLab Pipelines:** Settings → CI/CD → Pipelines
- **Railway Logs:** Railway → API Service → Deployments
- **Cloudflare Analytics:** Workers & Pages → pixecom-web → Analytics

---

## Next Steps

### 1. Custom Domain (Optional)

**Cloudflare Pages:**
1. Workers & Pages → pixecom-web → Custom domains
2. Add: `yourdomain.com`
3. Cloudflare auto-configures DNS

**Railway API:**
1. API Service → Settings → Domains
2. Add: `api.yourdomain.com`
3. Update CNAME in your DNS

### 2. Environment Separation

Create staging environment:

```bash
# Create develop branch
git checkout -b develop
git push gitlab develop

# Configure in Railway:
# - Create new environment "staging"
# - Separate database for staging
```

### 3. Monitoring & Alerts

**Recommended tools:**
- **Sentry:** Error tracking ($0-26/month)
- **Uptime Robot:** Uptime monitoring (free)
- **LogRocket:** Session replay (free tier)

### 4. Backups

**Railway Database:**
1. Railway → PostgreSQL → Backups
2. Enable automatic backups
3. Or use `pg_dump` for manual backups

### 5. Security

- [ ] Enable 2FA on GitLab
- [ ] Enable 2FA on Railway
- [ ] Enable 2FA on Cloudflare
- [ ] Rotate JWT secrets monthly
- [ ] Monitor security advisories

---

## Costs

### Current Setup (Monthly)

| Service | Cost | Tier |
|---------|------|------|
| GitLab | $0 | Free (400 CI/CD min) |
| Railway | ~$5 | Hobby ($5 credit) |
| Cloudflare Pages | $0 | Free (unlimited) |
| **Total** | **~$5/month** | |

### If You Exceed Free Tier

- **Railway Pro:** $20/month (more resources)
- **GitLab Premium:** $29/user/month (unlimited CI/CD)
- **Cloudflare Pages Pro:** $20/month (more builds)

---

## Troubleshooting

### Pipeline Fails
```bash
# Check logs
GitLab → CI/CD → Pipelines → Failed job → View logs
```

### Railway Deployment Fails
```bash
# Check logs
Railway → API Service → Deployments → Failed → View logs

# Common fix: Clear build cache
Railway → API Service → Settings → Clear build cache
```

### Cloudflare Build Fails
```bash
# Check logs
Cloudflare → Workers & Pages → pixecom-web → Deployments → Failed

# Common fix: Check environment variables
```

### CORS Errors
```bash
# Update backend CORS
# Redeploy backend
# Clear browser cache
```

---

## Support

- **GitLab:** https://forum.gitlab.com/
- **Railway:** https://railway.app/discord
- **Cloudflare:** https://community.cloudflare.com/

---

## Summary

✅ **GitLab** - Code hosting + CI/CD
✅ **Railway** - Backend API + PostgreSQL + Redis
✅ **Cloudflare Pages** - Frontend with global CDN
✅ **Auto-deploy** - Push and deploy automatically
✅ **Cost** - ~$5/month total

**You're ready to build! 🚀**
