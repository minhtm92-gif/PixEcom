# 🚀 Deployment Commands Cheatsheet

Quick reference for deploying PixEcom to Cloudflare.

---

## 📦 Install Wrangler CLI

```bash
# Install globally
pnpm add -g wrangler

# Or use via npx (no install needed)
npx wrangler --version
```

---

## 🔐 Login to Cloudflare

```bash
# Login via browser
wrangler login

# Or use API token
wrangler login --api-token YOUR_TOKEN

# Verify login
wrangler whoami
```

---

## 🌐 Deploy Frontend (Cloudflare Pages)

```bash
# Quick deploy (one command)
pnpm deploy:cloudflare

# Or manual steps:
cd apps/web
pnpm install
pnpm build
wrangler pages deploy .next --project-name=pixecom-web

# Deploy to preview branch
pnpm deploy:preview
```

---

## 📊 Check Deployment Status

```bash
# List all deployments
wrangler pages deployments list --project-name=pixecom-web

# Get deployment details
wrangler pages deployment tail

# View logs
wrangler pages deployment logs
```

---

## 🗑️ Purge Cache

```bash
# Via Wrangler (requires zone ID)
wrangler purge everything --zone-id YOUR_ZONE_ID

# Or use the script
bash scripts/purge-cache.sh

# Or via API
curl -X POST "https://api.cloudflare.com/client/v4/zones/ZONE_ID/purge_cache" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

---

## 🔧 Environment Variables

```bash
# List all environment variables
wrangler pages secret list --project-name=pixecom-web

# Add a secret
wrangler pages secret put NEXT_PUBLIC_API_URL --project-name=pixecom-web
# Then enter: https://api.yourdomain.com

# Delete a secret
wrangler pages secret delete NEXT_PUBLIC_API_URL --project-name=pixecom-web
```

---

## 🗄️ Database Commands

```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database (no migrations)
pnpm db:push

# Run seed data
pnpm db:seed

# Open Prisma Studio
pnpm db:studio

# Create migration (development)
pnpm db:migrate

# Production migration (manual)
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

---

## 🚂 Railway CLI (API Deployment)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to project
railway link

# Deploy
railway up

# View logs
railway logs

# Open dashboard
railway open

# Add environment variable
railway variables set JWT_SECRET=your-secret-here

# Run command on Railway
railway run pnpm db:push
```

---

## 🧪 Test Deployments

```bash
# Test frontend
curl https://pixecom-web.pages.dev
curl https://yourdomain.com

# Test API health
curl https://pixecom-api.up.railway.app/api/health
curl https://api.yourdomain.com/api/health

# Test API endpoint
curl https://api.yourdomain.com/api/public/products

# Check cache headers
curl -I https://yourdomain.com | grep -i cache
curl -I https://yourdomain.com | grep -i cf-

# Expected headers:
# cf-cache-status: HIT
# cf-ray: ...
# cache-control: public, max-age=...
```

---

## 🔄 Rollback Deployment

```bash
# List deployments
wrangler pages deployments list --project-name=pixecom-web

# Rollback to previous deployment (via dashboard)
# 1. Go to Cloudflare Dashboard → Pages → pixecom-web
# 2. Click "Deployments"
# 3. Find stable deployment → Click "..." → "Rollback to this deployment"

# Or promote a specific deployment
wrangler pages deployments promote DEPLOYMENT_ID --project-name=pixecom-web
```

---

## 📈 View Analytics

```bash
# Via Dashboard (easier)
# Cloudflare Dashboard → Pages → pixecom-web → Analytics

# Or via API
curl "https://api.cloudflare.com/client/v4/accounts/ACCOUNT_ID/analytics/web_analytics" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🛠️ Local Development

```bash
# Start both frontend and API
pnpm dev

# Start only frontend
pnpm --filter web dev

# Start only API
pnpm --filter api dev

# Test production build locally
cd apps/web
pnpm build
pnpm start

# Or use Wrangler Pages dev server
wrangler pages dev .next --port 3000
```

---

## 🔍 Debugging

```bash
# Check Cloudflare status
curl https://www.cloudflarestatus.com/api/v2/status.json

# Check DNS propagation
nslookup yourdomain.com
dig yourdomain.com

# Check SSL certificate
curl -vI https://yourdomain.com 2>&1 | grep -i "SSL\|TLS"

# View Cloudflare headers
curl -I https://yourdomain.com | grep -i "cf-"

# Test from different locations
curl -H "CF-IPCountry: US" https://yourdomain.com
curl -H "CF-IPCountry: EU" https://yourdomain.com
```

---

## 📦 Update Dependencies

```bash
# Update all packages
pnpm update

# Update specific package
pnpm update next

# Check outdated packages
pnpm outdated

# Update Wrangler
pnpm add -g wrangler@latest
```

---

## 🔐 Get Cloudflare Credentials

### API Token
1. Cloudflare Dashboard → My Profile → API Tokens
2. Create Token → Use template "Edit Cloudflare Pages"
3. Copy token (only shown once!)

### Account ID
1. Cloudflare Dashboard → Pages
2. Look in URL: `dash.cloudflare.com/YOUR_ACCOUNT_ID/pages`

### Zone ID (for custom domain)
1. Cloudflare Dashboard → Your Domain → Overview
2. Scroll down → Zone ID in right sidebar

---

## 🎯 Quick Deploy Checklist

```bash
# 1. Build and test locally
pnpm install
pnpm build
pnpm dev  # Test at http://localhost:3000

# 2. Setup environment variables
# Create .env files or add to Railway/Cloudflare dashboard

# 3. Deploy API to Railway
git push origin main
# Or: railway up

# 4. Deploy frontend to Cloudflare
pnpm deploy:cloudflare

# 5. Verify deployment
curl https://yourdomain.com
curl https://api.yourdomain.com/api/health

# 6. Check CDN is working
curl -I https://yourdomain.com | grep cf-cache-status

# 7. Test critical flows
# - User registration
# - Product creation
# - Order placement

# ✅ Done!
```

---

## 📚 Useful Links

- **Wrangler Docs**: https://developers.cloudflare.com/workers/wrangler/
- **Pages Docs**: https://developers.cloudflare.com/pages/
- **Railway Docs**: https://docs.railway.app/
- **Prisma Docs**: https://www.prisma.io/docs/

---

## 💡 Tips

1. **Use preview deployments** for testing before production
2. **Enable Cloudflare Analytics** for traffic insights
3. **Set up error tracking** (Sentry, LogRocket)
4. **Configure alerts** for downtime monitoring
5. **Use Cloudflare Workers** for edge functions (advanced)

---

**Need help?** Check `QUICK_DEPLOY.md` or `CLOUDFLARE_DEPLOYMENT.md`
