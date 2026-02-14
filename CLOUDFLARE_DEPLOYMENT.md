# Cloudflare Deployment Guide for PixEcom

## Architecture Overview

- **Frontend (Next.js)**: Cloudflare Pages with automatic global CDN
- **API (NestJS)**: Deploy to Railway/Render/VPS, proxied through Cloudflare
- **Database**: PostgreSQL on managed service (Neon, Supabase, Railway)
- **CDN**: Automatic via Cloudflare Pages + DNS proxy

---

## Prerequisites

1. **Cloudflare Account** (free tier works)
2. **GitHub Repository** (for automatic deployments)
3. **Database** (PostgreSQL - recommend Neon.tech free tier)
4. **API Hosting** (Railway, Render, or any VPS)

---

## Step 1: Setup Cloudflare Pages (Frontend)

### A. Via Cloudflare Dashboard (Easiest)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **Pages**
2. Click **"Create a project"** → **"Connect to Git"**
3. Select your PixEcom repository
4. Configure build settings:
   ```
   Build command:     cd apps/web && pnpm install && pnpm build
   Build output dir:  apps/web/.next
   Root directory:    /
   Framework preset:  Next.js
   ```
5. Add environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://api.yourpixecom.com
   ```
6. Click **"Save and Deploy"**

### B. Via Wrangler CLI (Advanced)

```bash
# Install Wrangler
pnpm add -g wrangler

# Login to Cloudflare
wrangler login

# Deploy from apps/web
cd apps/web
pnpm build
wrangler pages deploy .next --project-name=pixecom-web
```

---

## Step 2: Deploy API to Railway (with Cloudflare Proxy)

### A. Deploy to Railway

1. Go to [Railway.app](https://railway.app)
2. Create new project → **"Deploy from GitHub"**
3. Select your repository
4. Configure service:
   ```
   Root Directory: apps/api
   Build Command:  pnpm install && pnpm build
   Start Command:  pnpm start:prod
   ```
5. Add environment variables:
   ```
   DATABASE_URL=postgresql://...
   JWT_SECRET=your-secret-key
   JWT_REFRESH_SECRET=your-refresh-secret
   ENCRYPTION_KEY=32-character-key
   NODE_ENV=production
   PORT=3001
   FRONTEND_URL=https://pixecom.pages.dev
   ```

6. Get your Railway URL (e.g., `pixecom-api.up.railway.app`)

### B. Proxy API through Cloudflare (for CDN)

1. In Cloudflare Dashboard → **DNS**
2. Add a CNAME record:
   ```
   Type:    CNAME
   Name:    api
   Target:  pixecom-api.up.railway.app
   Proxy:   ✅ Enabled (orange cloud)
   ```

Now your API is accessible at `https://api.yourdomain.com` with Cloudflare CDN!

---

## Step 3: Setup Custom Domain + CDN

### A. Add Your Domain to Cloudflare

1. Cloudflare Dashboard → **Add a Site**
2. Enter your domain (e.g., `pixecom.com`)
3. Update your domain's nameservers to Cloudflare's

### B. Configure DNS Records

```
Type     Name      Target                        Proxy
CNAME    @         pixecom-web.pages.dev         ✅ Enabled
CNAME    www       pixecom-web.pages.dev         ✅ Enabled
CNAME    api       pixecom-api.up.railway.app    ✅ Enabled
```

### C. Setup Custom Domain on Pages

1. Pages → **pixecom-web** → **Custom domains**
2. Add `yourdomain.com` and `www.yourdomain.com`
3. Cloudflare automatically provisions SSL certificates

---

## Step 4: Optimize CDN Settings

### A. Page Rules (Free: 3 rules)

1. **Cache API responses**:
   ```
   URL Pattern: api.yourdomain.com/api/products/*
   Settings:
     - Cache Level: Standard
     - Edge Cache TTL: 2 hours
     - Browser Cache TTL: 30 minutes
   ```

2. **Cache static assets**:
   ```
   URL Pattern: yourdomain.com/_next/static/*
   Settings:
     - Cache Level: Cache Everything
     - Edge Cache TTL: 1 year
   ```

3. **Bypass cache for dynamic routes**:
   ```
   URL Pattern: api.yourdomain.com/api/orders/*
   Settings:
     - Cache Level: Bypass
   ```

### B. Enable Performance Features

1. **Speed** → **Optimization**:
   - ✅ Auto Minify (JS, CSS, HTML)
   - ✅ Brotli compression
   - ✅ Early Hints
   - ✅ HTTP/3 (QUIC)

2. **Caching** → **Configuration**:
   - Browser Cache TTL: Respect Existing Headers
   - ✅ Always Online
   - ✅ Development Mode (toggle off for production)

---

## Step 5: Setup Automatic Deployments

### Option A: GitHub Actions (Already configured)

The `.github/workflows/deploy-cloudflare-pages.yml` will auto-deploy on push to `main`.

**Required GitHub Secrets:**
```
CLOUDFLARE_API_TOKEN     = Your Cloudflare API token
CLOUDFLARE_ACCOUNT_ID    = Your Cloudflare account ID
NEXT_PUBLIC_API_URL      = https://api.yourdomain.com
```

### Option B: Cloudflare's Git Integration (Easiest)

Already set up if you used Cloudflare Dashboard method!

---

## Step 6: Setup Database

### Recommended: Neon (PostgreSQL with edge)

1. Go to [Neon.tech](https://neon.tech)
2. Create a new project → Get connection string
3. Add to Railway environment variables:
   ```
   DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/pixecom?sslmode=require
   ```

4. Run migrations:
   ```bash
   # From local machine with Railway DATABASE_URL
   pnpm db:push
   pnpm db:seed
   ```

---

## Alternative: Full Cloudflare Stack

If you want to go all-in on Cloudflare:

### Frontend: Cloudflare Pages (Done ✅)

### Backend: Cloudflare Workers

**⚠️ Limitations:**
- NestJS doesn't run natively on Workers
- Need to rewrite API using Hono.js or plain Workers

### Database: Cloudflare D1

**⚠️ Limitations:**
- SQLite (not PostgreSQL)
- Prisma support is experimental
- Would need to rewrite schema

### Storage: Cloudflare R2

For product images instead of local filesystem.

---

## Quick Start Commands

```bash
# 1. Install Wrangler globally
pnpm add -g wrangler

# 2. Login to Cloudflare
wrangler login

# 3. Deploy frontend
cd apps/web
pnpm build
wrangler pages deploy .next --project-name=pixecom-web

# 4. Deploy API (using Railway CLI)
cd ../api
# Push to GitHub, Railway will auto-deploy

# 5. Check deployment
curl https://pixecom-web.pages.dev
curl https://api.yourdomain.com/health
```

---

## Monitoring & Cache Purge

### Purge Cache
```bash
# Via Wrangler
wrangler pages deployment tail

# Via Dashboard
Caching → Configuration → Purge Everything
```

### Analytics
- Pages → Analytics (automatic)
- Enable Web Analytics for detailed insights

---

## Cost Estimate (Monthly)

| Service | Free Tier | Typical Usage |
|---------|-----------|---------------|
| Cloudflare Pages | 500 builds, Unlimited bandwidth | ✅ FREE |
| Cloudflare CDN | Unlimited | ✅ FREE |
| Railway | 512MB RAM, 500 hrs | ✅ FREE (or $5/mo) |
| Neon PostgreSQL | 512MB DB | ✅ FREE |
| **Total** | | **$0-5/month** |

---

## Troubleshooting

### Issue: "Build failed on Cloudflare Pages"
- Ensure `pnpm` version matches (9.15.0)
- Check build output directory is correct
- Add `NODE_VERSION=20` environment variable

### Issue: "API CORS errors"
- Add your Pages domain to API CORS whitelist
- In `apps/api/src/main.ts`, update `origin` array

### Issue: "Slow API responses"
- Check Railway region (should match your users)
- Verify Cloudflare proxy is enabled (orange cloud)
- Add caching headers to API responses

---

## Next Steps

1. ✅ Set up Cloudflare account
2. ✅ Deploy frontend to Pages
3. ✅ Deploy API to Railway
4. ✅ Configure DNS records
5. ✅ Add custom domain
6. ✅ Enable CDN optimizations
7. ✅ Set up automatic deployments
8. 🔄 Monitor and optimize cache hit rates

---

## Resources

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages)
- [Next.js on Cloudflare](https://developers.cloudflare.com/pages/framework-guides/nextjs)
- [Railway Docs](https://docs.railway.app)
- [Cloudflare Cache Rules](https://developers.cloudflare.com/cache)
