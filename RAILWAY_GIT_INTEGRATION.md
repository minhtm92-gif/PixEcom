# Railway Git Integration Setup (Recommended)

**Simpler, More Reliable Alternative to Railway CLI in CI/CD**

Instead of using Railway CLI in GitLab CI/CD, connect Railway directly to your GitLab repository. This is Railway's recommended approach!

---

## Why Git Integration is Better

✅ **Pros:**
- Railway builds and deploys automatically on git push
- No CLI authentication issues
- No environment variable complexity
- Built-in build caching
- Automatic rollbacks
- Deployment previews
- Railway handles everything

❌ **CLI in CI/CD Issues:**
- Silent failures
- Authentication complexity
- Requires multiple environment variables
- Not Railway's recommended CI/CD approach

---

## Setup Steps (5 Minutes)

### Step 1: Delete Current API Service

1. Go to Railway: https://railway.app
2. Open your **PixEcom** project
3. Click on the **api** service (the empty one we created)
4. Go to **Settings** tab (bottom left)
5. Scroll down to **Danger Zone**
6. Click **Delete Service** → Confirm

### Step 2: Connect GitLab Repository

1. In your PixEcom project, click **"+ New"**
2. Select **"GitHub Repo"** → **"Configure GitLab"**
3. Click **"Connect to GitLab"**
4. Authorize Railway to access your GitLab
5. Select repository: **pixelxlab-group/pixelxlab-project**
6. Click **"Add Repository"**

### Step 3: Configure Service

Railway will create a new service. Configure it:

1. **Rename service to:** `api`

2. **Go to Settings tab:**

   **Root Directory:**
   ```
   apps/api
   ```

   **Build Command:**
   ```bash
   pnpm install && pnpm prisma generate && pnpm build
   ```

   **Start Command:**
   ```bash
   node dist/main.js
   ```

   **Watch Paths:**
   ```
   apps/api/**
   packages/**
   pnpm-lock.yaml
   ```

3. **Set Deploy Triggers:**
   - **Branch:** `master`
   - **Auto-deploy:** ✅ Enable
   - Railway will deploy automatically when you push to master!

### Step 4: Add Environment Variables

Go to **Variables** tab and add all 8 variables:

```bash
NODE_ENV=production
PORT=3001
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
DEV_MODE=false
FRONTEND_URL=https://pixecom-web.pages.dev
JWT_SECRET=[your generated secret]
JWT_REFRESH_SECRET=[your other generated secret]
```

### Step 5: Deploy!

Two options:

**Option A: Trigger from Railway**
- Click **"Deploy"** button in Railway dashboard
- Railway will pull from GitLab and deploy

**Option B: Push to GitLab**
```bash
git push gitlab master
```
- Railway automatically detects the push and deploys!

### Step 6: Verify Deployment

1. Railway will show build logs in real-time
2. Watch for:
   - ✅ Cloning repository
   - ✅ Installing dependencies
   - ✅ Generating Prisma Client
   - ✅ Building application
   - ✅ Starting server

3. After deployment succeeds:
   - Go to **Settings** → **Domains**
   - Copy your Railway domain
   - Test: `https://[domain]/api/health`

---

## Update GitLab CI/CD

Since Railway now handles deployment automatically, simplify your `.gitlab-ci.yml`:

### Option 1: Remove Railway Deployment Stage Entirely

Railway deploys automatically on push to master, so you don't need GitLab to trigger it!

**Keep only:**
- `install_dependencies` - For testing
- `lint`, `type_check`, `test` - For code quality
- `build_backend`, `build_frontend` - For validation
- `deploy_cloudflare_production` - For frontend

**Remove:**
- `migrate_database` - Railway runs migrations automatically
- `deploy_railway_backend` - Railway deploys automatically

### Option 2: Keep GitLab CI for Testing Only

Update `.gitlab-ci.yml`:

```yaml
# Remove these stages from deployment
stages:
  - install
  - test
  - build
  # Remove: migrate, deploy for backend

# Keep all test and build jobs
# Remove: migrate_database, deploy_railway_backend
```

---

## How It Works

```
┌──────────────────────────────────────┐
│  You: git push gitlab master        │
└────────────┬─────────────────────────┘
             │
             ├────────────────────────────┐
             │                            │
             ▼                            ▼
┌─────────────────────┐      ┌──────────────────────┐
│   GitLab CI/CD      │      │  Railway (via webhook)│
│                     │      │                       │
│ • Run tests         │      │ • Pull from GitLab   │
│ • Build validation  │      │ • Install deps       │
│ • Deploy frontend   │      │ • Build backend      │
│   to Cloudflare     │      │ • Run migrations     │
│                     │      │ • Deploy & start     │
└─────────────────────┘      └──────────────────────┘
```

**Result:** Backend deployed automatically by Railway! ✅

---

## Advantages

✅ **Simpler:**
- No Railway CLI needed
- No Railway tokens in GitLab
- No complex authentication

✅ **More Reliable:**
- Railway's native integration
- Proven deployment pipeline
- Better error messages

✅ **Better DX:**
- Real-time build logs in Railway
- Deployment previews
- Easy rollbacks
- Automatic HTTPS

✅ **Separation of Concerns:**
- GitLab CI/CD: Testing & frontend deployment
- Railway: Backend deployment
- Each does what it's best at!

---

## Monitoring

### Railway Dashboard
- **Deployments tab:** See all deployments
- **Logs tab:** Real-time application logs
- **Metrics tab:** CPU, Memory, Network usage

### Railway Notifications
1. Go to: Project Settings → Notifications
2. Add webhook for Slack/Discord (optional)
3. Get notified on:
   - Deployment success
   - Deployment failure
   - Service crashes

---

## Troubleshooting

### Railway Build Fails

**Check Railway build logs:**
1. Railway → api service → Deployments
2. Click failed deployment
3. View build logs

**Common issues:**
- Missing pnpm-lock.yaml → Commit it
- Wrong build command → Check Settings
- Missing environment variables → Check Variables tab

### Railway Service Crashes

**Check application logs:**
1. Railway → api service → Logs
2. Look for error stack traces

**Common issues:**
- Port mismatch → Ensure `PORT=3001`
- Database connection → Check `DATABASE_URL`
- Missing Prisma Client → Ensure `pnpm prisma generate` in build

### Deployments Not Triggering

**Check:**
1. Railway → Settings → Deploy triggers
2. Ensure branch is `master`
3. Ensure auto-deploy is enabled
4. Check GitLab webhook: GitLab → Settings → Webhooks

---

## Migration Checklist

- [ ] Delete old empty "api" service in Railway
- [ ] Connect Railway to GitLab repository
- [ ] Configure new api service (root, build, start commands)
- [ ] Set deploy trigger to master branch
- [ ] Enable auto-deploy
- [ ] Add all 8 environment variables
- [ ] Trigger first deployment (click Deploy or push to gitlab)
- [ ] Verify deployment succeeds
- [ ] Test API endpoints
- [ ] Update `.gitlab-ci.yml` (remove Railway deployment stage)
- [ ] Remove Railway CI/CD variables from GitLab (optional cleanup)

---

## Next Steps After Setup

1. **Test auto-deployment:**
   ```bash
   git commit --allow-empty -m "test: Railway auto-deploy"
   git push gitlab master
   ```
   Watch Railway automatically deploy!

2. **Get your API URL:**
   - Railway → api service → Settings → Domains
   - Copy domain
   - Update `NEXT_PUBLIC_API_URL` in Cloudflare

3. **Deploy frontend to Cloudflare:**
   - Follow `CLOUDFLARE_SETUP.md`
   - Use your Railway API URL

---

## Cost

Same as before: ~$5/month Railway Hobby plan

---

## Summary

**Old Approach (Not Working):**
- GitLab CI/CD → Railway CLI → Railway API
- Complex, fragile, many failure points

**New Approach (Recommended):**
- GitLab push → Railway Git Integration → Automatic deployment
- Simple, reliable, Railway's best practice

**Result:** Backend deploys automatically every time you push to master! 🚀

---

**Ready to switch?** Follow Step 1 and delete the current empty api service!
