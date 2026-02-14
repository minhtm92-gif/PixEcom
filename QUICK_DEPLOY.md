# ✨ Quick Deploy to Cloudflare (5 Minutes)

This guide gets your PixEcom app live on Cloudflare with automatic CDN in under 5 minutes.

---

## 🚀 One-Click Deploy (Recommended)

### Step 1: Deploy Frontend to Cloudflare Pages

1. **Go to Cloudflare Dashboard**: https://dash.cloudflare.com
2. Click **Pages** → **Create a project** → **Connect to Git**
3. Select your GitHub repository
4. Configure build:
   ```
   Framework preset:    Next.js
   Build command:       cd apps/web && pnpm install && pnpm build
   Build output dir:    apps/web/.next
   Root directory:      /
   Node version:        20
   ```
5. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL = https://pixecom-api.up.railway.app
   ```
6. Click **Save and Deploy** ✅

**Done!** Frontend will be live at `https://pixecom-web.pages.dev` in ~2 minutes.

---

### Step 2: Deploy API to Railway

1. **Go to Railway**: https://railway.app
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your repository
4. Configure:
   ```
   Root Directory:  apps/api
   Build Command:   pnpm install && pnpm build
   Start Command:   pnpm start:prod
   ```
5. Add environment variables (click "Variables" tab):
   ```bash
   DATABASE_URL=postgresql://user:pass@host:5432/pixecom
   JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
   ENCRYPTION_KEY=12345678901234567890123456789012
   NODE_ENV=production
   PORT=3001
   FRONTEND_URL=https://pixecom-web.pages.dev
   ```

6. Click **Deploy** ✅

**Done!** API will be live at `https://pixecom-api.up.railway.app` in ~3 minutes.

---

### Step 3: Connect Everything

1. **Update Frontend Environment**:
   - Go back to Cloudflare Pages → **Settings** → **Environment variables**
   - Update `NEXT_PUBLIC_API_URL` to your Railway API URL
   - Redeploy: **Deployments** → **Retry deployment**

2. **Setup Database** (if you don't have one):
   - Go to [Neon.tech](https://neon.tech) (free PostgreSQL)
   - Create project → Copy connection string
   - Add to Railway `DATABASE_URL`

3. **Run Database Migrations**:
   ```bash
   # Set DATABASE_URL from Railway
   export DATABASE_URL="postgresql://..."

   # Generate Prisma client and push schema
   pnpm db:generate
   pnpm db:push
   pnpm db:seed
   ```

---

## 🌐 Setup Custom Domain + CDN

### Add Your Domain to Cloudflare

1. **Cloudflare Dashboard** → **Add a Site**
2. Enter your domain (e.g., `pixecom.com`)
3. Choose Free plan
4. Update your domain nameservers to Cloudflare's (copy from dashboard)

### Configure DNS

Go to **DNS** → **Records** and add:

| Type  | Name | Target | Proxy Status |
|-------|------|--------|--------------|
| CNAME | @    | pixecom-web.pages.dev | ✅ Proxied (Orange) |
| CNAME | www  | pixecom-web.pages.dev | ✅ Proxied (Orange) |
| CNAME | api  | pixecom-api.up.railway.app | ✅ Proxied (Orange) |

### Add Custom Domain to Pages

1. **Pages** → **pixecom-web** → **Custom domains**
2. Click **Set up a custom domain**
3. Enter: `yourdomain.com`
4. Cloudflare auto-configures SSL ✅

### Update Environment Variables

Update both services to use your custom domain:

**Cloudflare Pages:**
```
NEXT_PUBLIC_API_URL = https://api.yourdomain.com
```

**Railway:**
```
FRONTEND_URL = https://yourdomain.com
```

---

## ⚡ Enable CDN Optimizations

### 1. Cache Rules (Pages → Speed → Optimization)

- ✅ Auto Minify (JS, CSS, HTML)
- ✅ Brotli
- ✅ Early Hints
- ✅ HTTP/3

### 2. Page Rules (free tier: 3 rules)

**Rule 1: Cache Static Assets**
```
URL: yourdomain.com/_next/static/*
Settings:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 year
  - Browser Cache TTL: 1 year
```

**Rule 2: Cache API Products**
```
URL: api.yourdomain.com/api/public/products/*
Settings:
  - Cache Level: Standard
  - Edge Cache TTL: 2 hours
  - Browser Cache TTL: 30 minutes
```

**Rule 3: Bypass Cache for Admin**
```
URL: api.yourdomain.com/api/admin/*
Settings:
  - Cache Level: Bypass
```

---

## 🔄 Automatic Deployments

### GitHub Actions (Already Configured!)

The `.github/workflows/deploy-cloudflare-pages.yml` auto-deploys on push to `main`.

**Add GitHub Secrets**:

1. Go to GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Add these secrets:

```
CLOUDFLARE_API_TOKEN
  └─ Get from: Cloudflare Dashboard → My Profile → API Tokens
     Create token with "Cloudflare Pages — Edit" permission

CLOUDFLARE_ACCOUNT_ID
  └─ Get from: Cloudflare Dashboard → Pages → Account ID (in URL)

NEXT_PUBLIC_API_URL
  └─ Your API URL: https://api.yourdomain.com
```

Now every push to `main` auto-deploys! 🎉

---

## 📊 Verify Everything Works

```bash
# Check frontend
curl https://yourdomain.com

# Check API health
curl https://api.yourdomain.com/api/health

# Check CDN headers
curl -I https://yourdomain.com

# Should see:
# cf-cache-status: HIT
# cf-ray: ...
```

---

## 🐛 Troubleshooting

### Issue: "CORS Error"

**Fix**: Update Railway `FRONTEND_URL` to match your Cloudflare domain.

### Issue: "Build Failed on Cloudflare"

**Fix**:
1. Ensure `NODE_VERSION=20` environment variable
2. Check build command includes `cd apps/web`
3. Verify `pnpm` version in `package.json`

### Issue: "Database Connection Failed"

**Fix**:
1. Verify `DATABASE_URL` in Railway
2. Check database allows connections from Railway IPs
3. Use `?sslmode=require` in connection string

### Issue: "Images Not Loading"

**Fix**:
1. Use Cloudflare R2 for production file uploads
2. Or configure Railway persistent storage
3. Update `UPLOAD_DIR` environment variable

---

## 💰 Cost Breakdown

| Service | Plan | Cost |
|---------|------|------|
| Cloudflare Pages | Unlimited bandwidth, 500 builds/mo | **FREE** |
| Cloudflare CDN | Unlimited bandwidth | **FREE** |
| Railway API | 512MB RAM, $5 credit/mo | **FREE** (or $5/mo) |
| Neon PostgreSQL | 512MB DB, 3GB storage | **FREE** |
| **Total** | | **$0-5/month** |

---

## 🎯 Next Steps

- [ ] ✅ Deploy frontend to Cloudflare Pages
- [ ] ✅ Deploy API to Railway
- [ ] ✅ Setup custom domain
- [ ] ✅ Configure DNS with CDN proxy
- [ ] ✅ Enable cache optimizations
- [ ] ✅ Setup automatic deployments
- [ ] 🔄 Monitor analytics & cache hit rates
- [ ] 🔄 Configure Cloudflare R2 for file uploads
- [ ] 🔄 Setup email notifications (via Resend/SendGrid)

---

## 📚 Resources

- **Full Guide**: See `CLOUDFLARE_DEPLOYMENT.md`
- **Cloudflare Pages**: https://developers.cloudflare.com/pages
- **Railway**: https://docs.railway.app
- **Support**: Open an issue on GitHub

---

**🎉 Congrats! Your PixEcom store is now live with global CDN!**

Check your site: `https://yourdomain.com`
