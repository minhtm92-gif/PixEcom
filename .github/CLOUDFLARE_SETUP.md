# Complete Cloudflare Deployment Setup Guide

This comprehensive guide walks you through deploying PixEcom to Cloudflare Pages with automatic CI/CD.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Step-by-Step Setup](#step-by-step-setup)
- [Environment Variables](#environment-variables)
- [Custom Domain Setup](#custom-domain-setup)
- [Troubleshooting](#troubleshooting)
- [Performance Optimization](#performance-optimization)

## Prerequisites

Before you begin, ensure you have:

- ✅ Cloudflare account (free tier works)
- ✅ GitHub repository set up
- ✅ Project code pushed to GitHub
- ✅ Backend API deployed (Railway, Render, or your choice)

## Quick Start

### Option 1: Automatic Deployment (Recommended)

1. **Set up GitHub Secrets** (see `GITHUB_SECRETS_SETUP.md`)
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
   - `NEXT_PUBLIC_API_URL`

2. **Push to main branch**
   ```bash
   git push origin main
   ```

3. **GitHub Actions will automatically:**
   - Build your Next.js app
   - Deploy to Cloudflare Pages
   - Your site will be live at `https://pixecom-web.pages.dev`

### Option 2: Manual Deployment

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Build the project
pnpm install
pnpm db:generate
pnpm --filter @pixecom/web build

# Deploy to Cloudflare Pages
cd apps/web
wrangler pages deploy .next --project-name=pixecom-web
```

## Step-by-Step Setup

### Step 1: Create Cloudflare Pages Project

#### Method A: Through Dashboard (Easier)

1. **Log in to Cloudflare Dashboard**
   - Go to: https://dash.cloudflare.com

2. **Navigate to Pages**
   - Click on "Workers & Pages" in the sidebar
   - Click "Create application"
   - Choose "Pages"

3. **Connect to GitHub**
   - Click "Connect to Git"
   - Authorize Cloudflare to access your GitHub
   - Select your repository: `minhtm92-gif/PixEcom`

4. **Configure Build Settings**
   - **Project name:** `pixecom-web`
   - **Production branch:** `main`
   - **Build command:** `cd apps/web && pnpm install && pnpm build`
   - **Build output directory:** `apps/web/.next`
   - **Root directory:** `/`

5. **Add Environment Variables** (click "Add variable")
   ```
   NODE_VERSION=20
   NEXT_PUBLIC_API_URL=https://your-api.railway.app/api
   ```

6. **Save and Deploy**
   - Click "Save and Deploy"
   - Wait for the first build to complete

#### Method B: Using Wrangler CLI

```bash
# 1. Install Wrangler globally
npm install -g wrangler

# 2. Login to Cloudflare
wrangler login

# 3. Create Pages project
wrangler pages project create pixecom-web

# 4. Configure deployment
# Edit apps/web/wrangler.toml (already exists in repo)

# 5. Deploy
cd apps/web
pnpm build
wrangler pages deploy .next --project-name=pixecom-web
```

### Step 2: Configure Environment Variables

1. **Go to Pages Project Settings**
   - Dashboard → Workers & Pages → pixecom-web → Settings

2. **Navigate to Environment Variables**
   - Click "Environment variables" tab

3. **Add Required Variables**

   **Production Environment:**
   | Variable Name | Value | Description |
   |--------------|-------|-------------|
   | `NODE_VERSION` | `20` | Node.js version |
   | `NEXT_PUBLIC_API_URL` | `https://your-api.com/api` | Your production API URL |

   **Preview Environment (optional):**
   | Variable Name | Value | Description |
   |--------------|-------|-------------|
   | `NODE_VERSION` | `20` | Node.js version |
   | `NEXT_PUBLIC_API_URL` | `https://staging-api.com/api` | Staging API URL |

4. **Save and Redeploy**
   - After adding variables, trigger a new deployment

### Step 3: Set Up GitHub Actions Auto-Deploy

Already configured! The workflow file `.github/workflows/deploy-cloudflare.yml` handles this.

**What it does:**
- Triggers on push to `main` branch
- Builds Next.js app with optimizations
- Deploys to Cloudflare Pages
- Uses secrets from GitHub

**To enable:**
1. Set up GitHub Secrets (see `GITHUB_SECRETS_SETUP.md`)
2. Push to `main` branch
3. Check Actions tab to monitor deployment

### Step 4: Verify Deployment

1. **Check Deployment Status**
   - GitHub: Actions tab → Latest workflow run
   - Cloudflare: Workers & Pages → pixecom-web → Deployments

2. **Visit Your Site**
   - Default URL: `https://pixecom-web.pages.dev`
   - Test all pages and functionality

3. **Check Browser Console**
   - Verify no errors
   - Confirm API calls work

## Environment Variables

### Required Variables

#### `NEXT_PUBLIC_API_URL`
**Purpose:** Backend API endpoint for the frontend

**Format:** `https://your-api-domain.com/api`

**Examples:**
```bash
# Production
NEXT_PUBLIC_API_URL=https://pixecom-api.railway.app/api

# Staging
NEXT_PUBLIC_API_URL=https://pixecom-staging.railway.app/api

# Local development
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

**How to set:**
- Cloudflare Dashboard → Project Settings → Environment variables
- Or in `.env.local` for local development

#### `NODE_VERSION`
**Purpose:** Specifies Node.js version for build

**Value:** `20` or `20.10.0`

### Optional Variables

#### `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
**Purpose:** Stripe payment integration

**Example:**
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
```

#### `NEXT_PUBLIC_SITE_URL`
**Purpose:** Your site's canonical URL

**Example:**
```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## Custom Domain Setup

### Step 1: Add Custom Domain

1. **Go to Custom Domains**
   - Workers & Pages → pixecom-web → Custom domains

2. **Click "Set up a custom domain"**

3. **Enter Your Domain**
   - Example: `pixecom.com` or `www.pixecom.com`

4. **Choose DNS Configuration**

   **Option A: If domain is on Cloudflare** (Recommended)
   - Cloudflare will automatically add DNS records
   - SSL certificate will be issued automatically
   - ✅ Done!

   **Option B: If domain is elsewhere**
   - Add CNAME record to your DNS provider:
     ```
     Type: CNAME
     Name: www (or @)
     Value: pixecom-web.pages.dev
     TTL: Auto or 3600
     ```
   - Wait for DNS propagation (5-60 minutes)
   - Cloudflare will verify and issue SSL

### Step 2: Configure SSL/TLS

1. **Go to SSL/TLS Settings**
   - If domain on Cloudflare: SSL → Overview
   - Encryption mode: **Full (strict)** recommended

2. **Enable Always Use HTTPS**
   - SSL/TLS → Edge Certificates
   - Toggle "Always Use HTTPS"

3. **Enable HSTS** (Optional but recommended)
   - SSL/TLS → Edge Certificates
   - Enable "HTTP Strict Transport Security (HSTS)"
   - Max Age: 6 months (15768000 seconds)

### Step 3: Configure Redirects

Create `apps/web/public/_redirects` file (already exists):

```
# Redirect www to non-www
https://www.pixecom.com/* https://pixecom.com/:splat 301!

# Redirect http to https
http://pixecom.com/* https://pixecom.com/:splat 301!

# API proxy (if needed)
/api/* https://your-api.railway.app/api/:splat 200
```

### Step 4: Update Environment Variables

Update `NEXT_PUBLIC_API_URL` if your API domain changed:

```bash
# Before
NEXT_PUBLIC_API_URL=https://pixecom-api.railway.app/api

# After (if using custom domain)
NEXT_PUBLIC_API_URL=https://api.pixecom.com/api
```

## Performance Optimization

### 1. Enable Caching

Create `apps/web/public/_headers` file (already exists):

```
# Cache static assets
/*.js
  Cache-Control: public, max-age=31536000, immutable

/*.css
  Cache-Control: public, max-age=31536000, immutable

/images/*
  Cache-Control: public, max-age=31536000, immutable

# Cache HTML with revalidation
/*.html
  Cache-Control: public, max-age=3600, must-revalidate

# API responses
/api/*
  Cache-Control: public, max-age=60, s-maxage=300
```

### 2. Enable Image Optimization

Already configured in `next.config.js`:

```javascript
module.exports = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
}
```

### 3. Enable Compression

Cloudflare automatically compresses responses with:
- Brotli compression
- Gzip compression

**Verify:**
- Dashboard → Speed → Optimization
- Ensure "Auto Minify" is enabled for JS, CSS, HTML

### 4. Configure CDN Caching

1. **Go to Caching**
   - Dashboard → Caching → Configuration

2. **Set Caching Level**
   - Choose "Standard" or "Aggressive"

3. **Browser Cache TTL**
   - Set to "Respect Existing Headers"

### 5. Enable Argo Smart Routing (Optional, Paid)

- Reduces latency by 30% on average
- Routes traffic through Cloudflare's optimized network
- $5/month base + $0.10/GB

## Monitoring and Analytics

### 1. Enable Web Analytics

1. **Go to Analytics**
   - Workers & Pages → pixecom-web → Analytics

2. **View Metrics:**
   - Page views
   - Unique visitors
   - Top pages
   - Geographic distribution
   - Performance metrics

### 2. Set Up Real User Monitoring (RUM)

Add to your site (optional):

```javascript
// In apps/web/src/app/layout.tsx
if (process.env.NODE_ENV === 'production') {
  // Cloudflare Web Analytics beacon
  const script = document.createElement('script');
  script.defer = true;
  script.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  script.setAttribute('data-cf-beacon', '{"token": "YOUR_TOKEN"}');
  document.head.appendChild(script);
}
```

### 3. Configure Alerts

1. **Go to Notifications**
   - Dashboard → Notifications

2. **Create Alert:**
   - Deployment failure
   - Traffic spike
   - Error rate threshold

## Troubleshooting

### Issue: Build Fails

**Symptoms:**
```
Error: Command failed with exit code 1
```

**Solutions:**

1. **Check build logs:**
   - Dashboard → Deployments → Failed deployment → View logs

2. **Common fixes:**
   ```bash
   # Missing Prisma client
   # Add to build command:
   pnpm db:generate && pnpm build

   # Node version mismatch
   # Set NODE_VERSION=20 in environment variables

   # Missing dependencies
   # Check package.json and pnpm-lock.yaml are committed
   ```

3. **Test build locally:**
   ```bash
   pnpm install
   pnpm db:generate
   pnpm build
   ```

### Issue: API Calls Fail (CORS)

**Symptoms:**
```
Access to fetch at 'https://api...' from origin 'https://pixecom-web.pages.dev' has been blocked by CORS policy
```

**Solution:**

1. **Update API CORS settings:**

   In `apps/api/src/main.ts`:
   ```typescript
   app.enableCors({
     origin: [
       'http://localhost:3000',
       'https://pixecom-web.pages.dev',
       'https://your-custom-domain.com',
     ],
     credentials: true,
   });
   ```

2. **Redeploy your API**

### Issue: Environment Variables Not Loading

**Symptoms:**
```
NEXT_PUBLIC_API_URL is undefined
```

**Solution:**

1. **Check variable name:**
   - Must start with `NEXT_PUBLIC_` to be exposed to browser
   - Case-sensitive

2. **Redeploy after adding:**
   - Environment variables require a new deployment
   - Trigger a redeploy in Cloudflare Dashboard

3. **Verify in build logs:**
   - Check if variable is set during build

### Issue: 404 on Dynamic Routes

**Symptoms:**
- `/admin/products/[id]` returns 404

**Solution:**

Already configured in `apps/web/public/_redirects`:
```
/* /index.html 200
```

This ensures Next.js handles routing for all pages.

### Issue: Slow Initial Load

**Solutions:**

1. **Enable HTTP/3:**
   - Dashboard → Speed → Optimization
   - Enable HTTP/3 (with QUIC)

2. **Optimize images:**
   - Use Next.js Image component
   - Serve WebP/AVIF formats

3. **Reduce bundle size:**
   ```bash
   # Analyze bundle
   pnpm --filter @pixecom/web build
   pnpm --filter @pixecom/web analyze
   ```

4. **Enable Early Hints:**
   - Dashboard → Speed → Optimization
   - Enable Early Hints

## Production Checklist

Before going live:

- [ ] Custom domain configured and SSL enabled
- [ ] All environment variables set correctly
- [ ] API CORS configured for production domain
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Analytics enabled
- [ ] Cache headers configured
- [ ] 404/500 error pages customized
- [ ] Redirects configured (www → non-www)
- [ ] Security headers enabled
- [ ] Performance tested (Lighthouse score > 90)
- [ ] Mobile responsiveness verified
- [ ] SEO meta tags added
- [ ] Favicon and manifest configured
- [ ] robots.txt and sitemap.xml added

## Advanced Configuration

### Using Cloudflare Workers for API Proxy

Create `apps/web/functions/api/[[path]].ts`:

```typescript
export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const apiUrl = `https://your-api.railway.app${url.pathname}`;

  return fetch(apiUrl, context.request);
};
```

This allows you to use `/api/*` paths instead of full API URL.

### Configuring Rate Limiting

Dashboard → Security → WAF → Rate limiting rules

Example rule:
```
If: Hostname equals pixecom.com
AND Path starts with /api/
Then: Block when rate exceeds 100 requests per minute
```

## Cost Estimation

### Cloudflare Pages Free Tier

- ✅ Unlimited requests
- ✅ Unlimited bandwidth
- ✅ 500 builds per month
- ✅ 1 build at a time
- ✅ SSL included
- ✅ DDoS protection

### Paid Plans (if needed)

**Pages Pro ($20/month):**
- 5,000 builds per month
- 5 concurrent builds
- Advanced analytics

## Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Next.js on Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/deploy-a-nextjs-site/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [Cloudflare Dashboard](https://dash.cloudflare.com)

## Support

- Cloudflare Community: https://community.cloudflare.com/
- Cloudflare Discord: https://discord.cloudflare.com/
- Documentation: https://developers.cloudflare.com/

---

**Last Updated:** February 2026
**Repository:** https://github.com/minhtm92-gif/PixEcom
