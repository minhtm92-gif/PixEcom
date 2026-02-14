# Railway API Deployment Guide

## 🎯 Why Railway API Instead of CLI?

After extensive testing, we discovered that Railway CLI (`railway up`) consistently fails in GitLab CI/CD environments with silent errors. The Railway GraphQL API provides a more reliable deployment method.

### Problems with Railway CLI:
- ❌ Fails with `exit code 1` without useful error messages
- ❌ Requires interactive authentication or project context
- ❌ Doesn't work reliably in CI/CD environments
- ❌ Railway's native Git integration only supports GitHub, not GitLab

### Benefits of Railway API:
- ✅ Direct programmatic deployment control
- ✅ Clear error messages from API responses
- ✅ No authentication issues with proper Bearer token
- ✅ Works in any CI/CD environment
- ✅ Triggers Railway's native build process (same as Git integration)

---

## 🔧 How It Works

### Deployment Flow:

```
GitLab CI/CD Pipeline
         ↓
Build backend artifacts (dist/)
         ↓
Run database migrations
         ↓
Call Railway GraphQL API
         ↓
Railway fetches code from GitLab
         ↓
Railway builds using railway.toml config
         ↓
Railway deploys to backend service
         ↓
API live at backend-production-46ad.up.railway.app
```

### GraphQL API Call:

**Endpoint:** `https://backboard.railway.com/graphql/v2`

```graphql
mutation serviceInstanceRedeploy($serviceId: String!, $environmentId: String!) {
  serviceInstanceRedeploy(
    serviceId: $serviceId,
    environmentId: $environmentId
  )
}
```

**Variables:**
- `serviceId`: `ae6dc82f-8a62-4d00-8482-c05175045f69`
- `environmentId`: `87c18c04-b50b-480c-acc5-1b316513030b`

---

## 📋 Required GitLab CI/CD Variables

All variables should be set at: **GitLab → Settings → CI/CD → Variables**

| Variable Name | Value | Masked | Protected |
|---------------|-------|--------|-----------|
| RAILWAY_TOKEN | [Your Railway API token] | ✅ YES | ❌ NO |
| RAILWAY_PROJECT_ID | `9b1325ad-fb34-40e8-9594-6cbbd093ecb3` | ✅ YES | ❌ NO |
| RAILWAY_SERVICE_ID | `ae6dc82f-8a62-4d00-8482-c05175045f69` | ✅ YES | ❌ NO |
| RAILWAY_ENVIRONMENT_ID | `87c18c04-b50b-480c-acc5-1b316513030b` | ✅ YES | ❌ NO |

### New Variable to Add:

**RAILWAY_ENVIRONMENT_ID**
- Key: `RAILWAY_ENVIRONMENT_ID`
- Value: `87c18c04-b50b-480c-acc5-1b316513030b`
- Type: Variable
- Environment scope: All (default)
- Flags:
  - ✅ Masked
  - ❌ Protected
  - ❌ Expanded

---

## 📁 Implementation Files

### 1. `.gitlab/scripts/deploy-railway.sh`

Bash script that:
1. Validates all required environment variables
2. Calls Railway GraphQL API with deployment mutation
3. Parses API response using `jq`
4. Outputs deployment ID and status
5. Provides Railway dashboard link

**Key Features:**
- Clear error messages
- JSON response parsing
- Exit code handling
- Deployment tracking

### 2. `.gitlab-ci.yml` - Updated `deploy_railway_backend` Job

**Changes:**
- ❌ Removed: Railway CLI installation and commands
- ✅ Added: Alpine Linux image with bash, curl, jq
- ✅ Added: Deployment script execution
- ✅ Added: Environment URL for easy access

**Benefits:**
- Faster job execution (no npm/CLI installation)
- More reliable deployment
- Better error reporting
- Simpler maintenance

---

## 🚀 Deployment Process

### What Happens When You Push to GitLab:

1. **GitLab CI/CD Triggered**
   - Detects push to `master` branch
   - Starts pipeline

2. **Build Stage**
   - Compiles TypeScript to JavaScript
   - Generates Prisma Client
   - Creates `dist/` artifacts

3. **Migrate Stage**
   - Runs database migrations (currently skipped)

4. **Deploy Stage**
   - Executes `deploy-railway.sh`
   - Calls Railway GraphQL API
   - Railway receives deployment trigger

5. **Railway Build**
   - Railway fetches latest code from configured source
   - Runs build command: `pnpm install && pnpm prisma generate && pnpm build`
   - Creates deployment

6. **Railway Start**
   - Starts server: `node dist/main.js`
   - Health check: `/api/health`
   - Makes deployment active

7. **Production Live** ✅
   - API available at: `https://backend-production-46ad.up.railway.app`

---

## 🔍 How Railway Gets Your Code

**Important:** Railway API triggers a deployment, but Railway still needs access to your code.

### Current Setup:
- Railway service is configured as "Empty Service"
- No Git repository connected
- **Issue:** Railway API can trigger deployment, but needs code source

### Solution Options:

#### Option A: Connect Railway to GitLab Repo (Manual)
1. Go to Railway dashboard
2. Service Settings → Source
3. Connect to GitLab repository: `pixelxlab-group/pixelxlab-project`
4. Set root directory: `apps/api`
5. Railway will fetch code automatically on API trigger

#### Option B: GitHub Mirror (Automated)
1. Set up GitLab → GitHub push mirror
2. Connect Railway to GitHub repository
3. Railway auto-fetches from GitHub
4. Fully automated workflow

#### Option C: Docker Image (Alternative)
1. Build Docker image in GitLab CI/CD
2. Push to Railway's Docker registry
3. Railway deploys from Docker image

---

## ⚠️ Current Limitation

**The Railway API deployment will trigger Railway's build process, but Railway needs a code source configured.**

### To Complete Setup:

**Ask Claude in Chrome to connect Railway service to GitLab:**

1. Go to Railway dashboard
2. Navigate to "backend" service
3. Click "Settings"
4. Under "Source" section, click "Connect to Repo"
5. Select GitLab (if available) or use GitHub mirror
6. Choose repository: `pixelxlab-group/pixelxlab-project`
7. Set root directory: `apps/api`
8. Set branch: `master`

**Once connected:**
- Railway API trigger → Railway fetches latest code → Builds → Deploys ✅

---

## 🧪 Testing the Deployment

### After Pipeline Completes:

1. **Check GitLab Pipeline**
   ```
   ✅ deploy_railway_backend job shows "Deployment triggered successfully"
   ✅ Deployment ID displayed in logs
   ```

2. **Check Railway Dashboard**
   ```
   ✅ New deployment appears in "Deployments" tab
   ✅ Build logs show successful compilation
   ✅ Deployment status shows "Active"
   ```

3. **Test API Endpoints**
   ```bash
   # Health check
   curl https://backend-production-46ad.up.railway.app/api/health

   # Expected response:
   {
     "status": "ok",
     "timestamp": "2026-02-14T...",
     "database": "connected",
     "redis": "connected"
   }
   ```

4. **Test Swagger Documentation**
   ```
   https://backend-production-46ad.up.railway.app/api/docs
   ```

---

## 🐛 Troubleshooting

### API Call Fails with Authentication Error
**Error:** `Unauthorized` or `Invalid token`

**Solution:**
1. Verify `RAILWAY_TOKEN` in GitLab CI/CD variables
2. Check token hasn't expired
3. Regenerate token in Railway dashboard if needed

### API Call Succeeds but No Deployment
**Error:** Deployment triggered but Railway shows no activity

**Solution:**
1. Railway service needs code source configured
2. Connect Railway to GitLab repository manually
3. Or set up GitHub mirror

### Deployment Fails in Railway
**Error:** Railway shows deployment but it fails

**Solution:**
1. Check Railway deployment logs for build errors
2. Verify environment variables in Railway
3. Check `railway.toml` configuration
4. Ensure all dependencies in `package.json`

### Wrong Environment Deployed
**Error:** Deployment goes to wrong environment

**Solution:**
1. Verify `RAILWAY_ENVIRONMENT_ID` matches production
2. Check Railway dashboard for correct environment UUID

---

## 📊 Deployment Monitoring

### GitLab CI/CD Logs:
```
🚀 Railway API Deployment Script
==================================
✅ Environment variables validated
📦 Project: 9b1325ad-fb34-40e8-9594-6cbbd093ecb3
🔧 Service: ae6dc82f-8a62-4d00-8482-c05175045f69
🌍 Environment: 87c18c04-b50b-480c-acc5-1b316513030b

🚂 Triggering deployment via Railway API...
📡 API Response:
{
  "data": {
    "deploymentTrigger": {
      "id": "abc123-def456-...",
      "status": "BUILDING"
    }
  }
}

✅ Deployment triggered successfully!
🆔 Deployment ID: abc123-def456-...
🔗 View deployment: https://railway.app/project/.../service/...
```

### Railway Dashboard:
- Real-time build logs
- Deployment status
- Health check results
- Resource usage

---

## 🎯 Next Steps

1. **Add RAILWAY_ENVIRONMENT_ID to GitLab** (Claude in Chrome can do this)
2. **Connect Railway service to code source** (Claude in Chrome can do this)
3. **Test deployment** by pushing to GitLab master
4. **Monitor Railway dashboard** for build progress
5. **Verify API endpoints** are accessible

---

**Status:** Ready to deploy using Railway GraphQL API! 🚀
**Last Updated:** February 14, 2026
