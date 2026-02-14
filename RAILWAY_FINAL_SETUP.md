# Railway Final Setup Instructions for Claude in Chrome

**Service Name:** backend
**Service ID:** ae6dc82f-8a62-4d00-8482-c05175045f69
**Project ID:** 9b1325ad-fb34-40e8-9594-6cbbd093ecb3

---

## ✅ Already Completed

- Service created and renamed to "backend"
- Build command configured: `pnpm install && pnpm prisma generate && pnpm build`
- Start command configured: `node dist/main.js`
- Root directory: `apps/api`
- 2 variables added:
  - ✅ NODE_ENV=production
  - ✅ FRONTEND_URL=https://pixecom-web.pages.dev

---

## 📋 Add Remaining 6 Environment Variables

Go to the **Variables** tab in Railway "backend" service and add:

### 1. PORT
```
PORT=3001
```

### 2. DATABASE_URL
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

### 3. REDIS_URL
```
REDIS_URL=${{Redis.REDIS_URL}}
```

### 4. DEV_MODE
```
DEV_MODE=false
```

### 5. JWT_SECRET
```
JWT_SECRET=13df89a0b7838d2301558fcb68216f7399b640dec1e4d33c69719d0fc87969fced550d8097d2c877384f52827c237c1ddae2cdb3bbd578a63f5cbb87681188be
```

### 6. JWT_REFRESH_SECRET
```
JWT_REFRESH_SECRET=4c1c6fde71b33395e71d4161262acdded7c706d35677592544a76292cae3b141d8b277cf0d3dae82077d1d50d9b887515d88fb033f7e0b7defa2cceb078b6a47
```

---

## 🚀 After Adding Variables

### Step 1: Deploy from Railway Dashboard
Click the **"Deploy"** button in Railway to trigger the first deployment.

### Step 2: Monitor Deployment
Watch the deployment logs for:
- ✅ Installing dependencies (pnpm install)
- ✅ Generating Prisma Client
- ✅ Building application
- ✅ Starting server on port 3001

### Step 3: Get Public URL
1. Go to **Settings** → **Networking** → **Public Networking**
2. Click **"Generate Domain"**
3. Copy the Railway domain (e.g., `backend-production-xxxx.up.railway.app`)

### Step 4: Test API
Test these endpoints:
- `https://[domain]/api/health`
- `https://[domain]/api/docs` (Swagger documentation)

### Step 5: Report Results
Report back:
1. ✅ Deployment status (success/failed)
2. 🌐 Public Railway domain URL
3. 📊 Any errors from deployment logs

---

## 🔧 Troubleshooting

### If Deployment Fails:

**Check Build Logs:**
- Missing dependencies? Ensure pnpm-lock.yaml is committed
- Prisma errors? Check DATABASE_URL reference
- Build errors? Review build command

**Common Issues:**
- Port mismatch → Ensure PORT=3001
- Database connection → Check Postgres service is running
- Missing Prisma Client → Ensure `pnpm prisma generate` in build command

---

## 📝 Summary of All 8 Variables

After completion, you should have:

| Variable | Value | Description |
|----------|-------|-------------|
| NODE_ENV | production | Environment mode |
| PORT | 3001 | Server port |
| DATABASE_URL | ${{Postgres.DATABASE_URL}} | PostgreSQL connection |
| REDIS_URL | ${{Redis.REDIS_URL}} | Redis connection |
| DEV_MODE | false | Disable development features |
| FRONTEND_URL | https://pixecom-web.pages.dev | CORS allowed origin |
| JWT_SECRET | [128-char hex] | Access token secret |
| JWT_REFRESH_SECRET | [128-char hex] | Refresh token secret |

---

**Ready to proceed?** Add the 6 variables, click Deploy, and report the results!
