# ✅ Deployment Checklist - Railway + Cloudflare

**Complete checklist for deploying PixEcom to production**

---

## 📋 Pre-Deployment Setup

### ✅ Phase 1: GitLab Setup (DONE)
- [x] Code pushed to GitLab
- [x] `.gitlab-ci.yml` configured
- [x] Pipeline stages defined (install, build, migrate, deploy)
- [x] Repository: https://gitlab.com/pixelxlab-group/pixelxlab-project

### ⏳ Phase 2: Railway Backend (IN PROGRESS)

Follow: **`RAILWAY_DEPLOYMENT_GUIDE.md`**

- [ ] **Step 1:** Create Railway account
- [ ] **Step 2:** Create Railway project
- [ ] **Step 3:** Add PostgreSQL database
- [ ] **Step 4:** Add Redis cache
- [ ] **Step 5:** Configure backend service
  - [ ] Set root directory: `apps/api`
  - [ ] Set build command
  - [ ] Set start command
  - [ ] Add environment variables:
    - [ ] `NODE_ENV=production`
    - [ ] `PORT=3001`
    - [ ] `DATABASE_URL=${{Postgres.DATABASE_URL}}`
    - [ ] `REDIS_URL=${{Redis.REDIS_URL}}`
    - [ ] `JWT_SECRET=[generated]`
    - [ ] `JWT_REFRESH_SECRET=[generated]`
    - [ ] `FRONTEND_URL=https://pixecom-web.pages.dev`
    - [ ] `DEV_MODE=false`
- [ ] **Step 6:** Get Railway API token
- [ ] **Step 7:** Add `RAILWAY_TOKEN` to GitLab CI/CD variables
- [ ] **Step 8:** Push to trigger deployment
- [ ] **Step 9:** Verify deployment works
  - [ ] Check Railway logs
  - [ ] Test API health endpoint
  - [ ] Test Swagger docs

**Time:** ~20 minutes

---

### ⏳ Phase 3: Cloudflare Frontend (NEXT)

Follow: **`CLOUDFLARE_SETUP.md`**

- [ ] **Step 1:** Connect GitLab to Cloudflare Pages
- [ ] **Step 2:** Configure build settings
  - [ ] Project name: `pixecom-web`
  - [ ] Build command: `cd apps/web && pnpm install && pnpm build`
  - [ ] Build output: `apps/web/.next`
- [ ] **Step 3:** Add environment variables
  - [ ] `NODE_VERSION=20`
  - [ ] `NEXT_PUBLIC_API_URL=[Railway URL]/api`
- [ ] **Step 4:** Add Cloudflare secrets to GitLab
  - [ ] `CLOUDFLARE_API_TOKEN`
  - [ ] `CLOUDFLARE_ACCOUNT_ID`
- [ ] **Step 5:** Deploy frontend
- [ ] **Step 6:** Test frontend
  - [ ] Visit: https://pixecom-web.pages.dev
  - [ ] Test login
  - [ ] Test API calls

**Time:** ~15 minutes

---

## 🔧 Post-Deployment Configuration

### Update CORS

After deploying frontend, update backend CORS:

**File:** `apps/api/src/main.ts`

```typescript
app.enableCors({
  origin: [
    'http://localhost:3000',
    'https://pixecom-web.pages.dev',
  ],
  credentials: true,
});
```

Commit and push:
```bash
git add apps/api/src/main.ts
git commit -m "fix: update CORS for Cloudflare Pages"
git push gitlab master
```

### Set Up Custom Domains (Optional)

#### Railway Backend:
- [ ] Add custom domain: `api.yourdomain.com`
- [ ] Update DNS CNAME record
- [ ] Update `NEXT_PUBLIC_API_URL` in Cloudflare

#### Cloudflare Frontend:
- [ ] Add custom domain: `yourdomain.com`
- [ ] Cloudflare auto-configures DNS
- [ ] Update `FRONTEND_URL` in Railway

---

## 🔐 Security Checklist

- [ ] Change default admin password
- [ ] Generate strong JWT secrets
- [ ] Enable 2FA on GitLab
- [ ] Enable 2FA on Railway
- [ ] Enable 2FA on Cloudflare
- [ ] Review environment variables
- [ ] Set up SSL/HTTPS (auto with Railway + Cloudflare)
- [ ] Configure rate limiting
- [ ] Enable database backups on Railway

---

## 📊 Monitoring Setup

### Railway Monitoring:
- [ ] Check deployment logs
- [ ] Monitor CPU/Memory usage
- [ ] Set up deployment notifications

### External Monitoring (Optional):
- [ ] Set up Sentry for error tracking
- [ ] Set up Uptime Robot for uptime monitoring
- [ ] Set up LogRocket for session replay

---

## 🧪 Testing Checklist

### Backend Tests:
```bash
# Health check
curl https://your-railway-url.railway.app/api/health

# API docs
https://your-railway-url.railway.app/api/docs

# Test protected endpoint (should return 401)
curl https://your-railway-url.railway.app/api/users
```

### Frontend Tests:
- [ ] Visit homepage
- [ ] Test login page
- [ ] Test admin dashboard
- [ ] Test product browsing
- [ ] Test cart functionality
- [ ] Check browser console for errors

### Integration Tests:
- [ ] Complete order flow
- [ ] Product creation
- [ ] Sellpage builder
- [ ] Payment processing (if configured)

---

## 📱 GitLab CI/CD Variables Required

Add these in: **GitLab → Settings → CI/CD → Variables**

### Required:
| Variable | Value | Protect | Mask |
|----------|-------|---------|------|
| `RAILWAY_TOKEN` | Your Railway API token | ✅ | ✅ |
| `CLOUDFLARE_API_TOKEN` | Your Cloudflare API token | ✅ | ✅ |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID | ✅ | ✅ |
| `NEXT_PUBLIC_API_URL` | Railway API URL | ❌ | ❌ |

### Optional:
| Variable | Value | Protect | Mask |
|----------|-------|---------|------|
| `RAILWAY_DOMAIN` | Railway domain for health checks | ❌ | ❌ |
| `JWT_SECRET` | For CI tests | ✅ | ✅ |
| `JWT_REFRESH_SECRET` | For CI tests | ✅ | ✅ |

---

## 🚀 Deployment Workflow

### Automatic Deployment:

```bash
# Make changes
git add .
git commit -m "feat: new feature"
git push gitlab master
```

**What happens:**
1. ✅ GitLab CI runs tests
2. ✅ Builds backend and frontend
3. ✅ Runs database migrations
4. ✅ Deploys backend to Railway
5. ✅ Deploys frontend to Cloudflare
6. ✅ Runs health checks

**Total time:** ~6-8 minutes

### Manual Deployment (Fallback):

If CI/CD is down:

```bash
# Backend
railway login
cd apps/api
railway run --service api pnpm prisma migrate deploy
railway up --service api

# Frontend
cd ../web
pnpm build
wrangler pages deploy .next --project-name=pixecom-web
```

---

## 💰 Cost Breakdown

### Current Setup:
| Service | Cost | Details |
|---------|------|---------|
| GitLab | Free | 400 CI/CD min/month |
| Railway | $5/month | Hobby plan with $5 credit |
| Cloudflare | Free | Unlimited bandwidth, 500 builds/month |
| **Total** | **~$5/month** | |

### When to Upgrade:
- **Railway Pro ($20/month):** >100 concurrent users, need more RAM
- **Cloudflare Pro ($20/month):** Need more builds (rare)
- **GitLab Premium ($29/month):** Need unlimited CI/CD minutes

---

## 📚 Documentation Quick Links

### Deployment Guides:
- **Railway:** `RAILWAY_DEPLOYMENT_GUIDE.md` ⭐ Start here
- **Cloudflare:** `CLOUDFLARE_SETUP.md`
- **GitLab Migration:** `GITLAB_MIGRATION.md`
- **Quick Start:** `QUICK_START_GITLAB.md`

### Repository Links:
- **GitLab:** https://gitlab.com/pixelxlab-group/pixelxlab-project
- **GitHub (Backup):** https://github.com/minhtm92-gif/PixEcom

### Service Dashboards:
- **Railway:** https://railway.app
- **Cloudflare:** https://dash.cloudflare.com
- **GitLab CI/CD:** https://gitlab.com/pixelxlab-group/pixelxlab-project/-/pipelines

---

## 🎯 Current Status

### Completed:
- ✅ GitLab repository setup
- ✅ GitLab CI/CD pipeline configured
- ✅ Railway deployment configuration
- ✅ Cloudflare deployment configuration
- ✅ Complete documentation written

### In Progress:
- ⏳ Railway account setup
- ⏳ Backend deployment
- ⏳ Frontend deployment
- ⏳ Custom domain configuration

### Next Steps:
1. **Follow RAILWAY_DEPLOYMENT_GUIDE.md** (20 min)
2. **Follow CLOUDFLARE_SETUP.md** (15 min)
3. **Test deployment** (5 min)
4. **Set up monitoring** (10 min)

**Total time to production:** ~50 minutes

---

## ✨ Success Criteria

Your deployment is successful when:

- ✅ Backend API is accessible at Railway URL
- ✅ Frontend is accessible at Cloudflare Pages URL
- ✅ Login works
- ✅ Admin dashboard loads
- ✅ Products display correctly
- ✅ Cart functionality works
- ✅ API calls succeed (check browser console)
- ✅ Database is connected
- ✅ Redis is connected
- ✅ GitLab pipeline passes
- ✅ No errors in Railway logs
- ✅ No errors in browser console

---

## 🆘 Need Help?

### Troubleshooting Guides:
- **Railway issues:** See RAILWAY_DEPLOYMENT_GUIDE.md → Troubleshooting section
- **Cloudflare issues:** See CLOUDFLARE_SETUP.md → Troubleshooting section
- **CI/CD issues:** Check GitLab pipeline logs

### Support Resources:
- **Railway Discord:** https://railway.app/discord
- **Cloudflare Community:** https://community.cloudflare.com
- **GitLab Forum:** https://forum.gitlab.com

---

## 📅 Maintenance Tasks

### Weekly:
- [ ] Check Railway logs for errors
- [ ] Monitor resource usage
- [ ] Review deployment metrics

### Monthly:
- [ ] Update dependencies
- [ ] Review security alerts
- [ ] Rotate JWT secrets
- [ ] Check cost usage
- [ ] Review and archive old logs

### Quarterly:
- [ ] Database backup verification
- [ ] Performance optimization review
- [ ] Security audit

---

**🎉 Ready to deploy? Start with `RAILWAY_DEPLOYMENT_GUIDE.md`!**

**Last Updated:** February 2026
**Stack:** GitLab → Railway (Backend) + Cloudflare Pages (Frontend)
**Status:** Ready for deployment ✅
