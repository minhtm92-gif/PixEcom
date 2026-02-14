# Railway CLI Deployment Debugging Guide

## 🔍 Issue Analysis

The Railway CLI deployment from GitLab CI/CD is failing with `exit code 1` despite:
- ✅ All environment variables configured correctly in Railway
- ✅ RAILWAY_TOKEN, RAILWAY_PROJECT_ID, RAILWAY_SERVICE_ID set in GitLab CI/CD
- ✅ Backend build succeeding
- ✅ Database migration succeeding

## 🎯 Root Cause

Railway CLI (`railway up`) requires interactive authentication or a project context that's difficult to establish in CI/CD environments. The command fails because:

1. **No Project Context**: Railway CLI needs to be "linked" to a project
2. **Service Selection**: The `--service=$RAILWAY_SERVICE_ID` flag may not work without project context
3. **Authentication Flow**: Even with `RAILWAY_TOKEN`, the CLI may require additional setup

## 🛠️ Solutions

### Solution 1: Use Railway API Directly (RECOMMENDED)

Instead of using `railway up`, use Railway's REST API to trigger deployments:

```bash
# Trigger deployment using Railway API
curl -X POST "https://backboard.railway.app/graphql" \
  -H "Authorization: Bearer $RAILWAY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { deploymentTrigger(input: { projectId: \"'$RAILWAY_PROJECT_ID'\", serviceId: \"'$RAILWAY_SERVICE_ID'\", environmentId: \"'$RAILWAY_ENVIRONMENT_ID'\" }) { id } }"
  }'
```

**Requirements:**
- Need to get `RAILWAY_ENVIRONMENT_ID` from Railway dashboard

### Solution 2: Fix Railway CLI Context (CURRENT ATTEMPT)

Create proper Railway project context before deploying:

```yaml
script:
  - cd apps/api
  - railway link $RAILWAY_PROJECT_ID
  - railway up --service=$RAILWAY_SERVICE_ID --detach
```

**Status:** Updated in `.gitlab-ci.yml` with better error handling

### Solution 3: Use Docker Deployment to Railway

Build Docker image and push to Railway's registry:

```yaml
script:
  - docker build -t pixecom-backend apps/api
  - docker tag pixecom-backend registry.railway.app/$RAILWAY_PROJECT_ID/$RAILWAY_SERVICE_ID
  - docker push registry.railway.app/$RAILWAY_PROJECT_ID/$RAILWAY_SERVICE_ID
```

**Requirements:**
- Docker-in-Docker support in GitLab CI/CD
- Railway Docker registry credentials

### Solution 4: GitHub Mirror (EASIEST BUT REQUIRES GITHUB)

Set up automatic GitLab → GitHub mirroring:

1. Create GitHub repository
2. Configure GitLab push mirror to GitHub
3. Connect Railway to GitHub repo
4. Railway auto-deploys on every GitLab push

**Pros:** Uses Railway's native Git integration
**Cons:** Requires GitHub account

## 🧪 Testing Commands

### Test Railway CLI Authentication
```bash
export RAILWAY_TOKEN="your-token"
railway whoami
```

### Test Project Linking
```bash
railway link 9b1325ad-fb34-40e8-9594-6cbbd093ecb3
```

### Test Service Deployment
```bash
railway up --service=ae6dc82f-8a62-4d00-8482-c05175045f69
```

## 📋 Current GitLab CI/CD Updates

**File:** `.gitlab-ci.yml`

Changes made:
1. ✅ Added `build_backend` job dependency with artifacts
2. ✅ Added error handling with exit code capture
3. ✅ Added `--detach` flag to `railway up`
4. ✅ Added build artifact verification (`ls -la dist/`)
5. ✅ Added Railway status check on failure

**Files Added:**
- `apps/api/railway.toml` - Railway build configuration
- `apps/api/.railwayignore` - Files to exclude from Railway deployment

## 🎯 Next Steps

### Option A: Get Railway Environment ID for API Solution
Ask Claude in Chrome to:
1. Go to Railway dashboard
2. Navigate to backend service
3. Click "Settings" → find "Environment ID"
4. Report the Environment ID
5. We'll use Railway's GraphQL API instead of CLI

### Option B: Test Updated Railway CLI
1. Commit and push the updated `.gitlab-ci.yml`
2. Trigger new GitLab pipeline
3. Monitor `deploy_railway_backend` job logs
4. Check if `railway link` and `railway up` work now

### Option C: Switch to GitHub Mirror
1. Create GitHub repository
2. Set up GitLab → GitHub push mirror
3. Connect Railway to GitHub
4. Remove Railway deployment from GitLab CI/CD

## 💡 Recommendation

**Try Option B first** (updated Railway CLI) since the changes are already committed.

If that fails again, **switch to Option A** (Railway API) which is more reliable for CI/CD environments.

---

**Last Updated:** February 14, 2026
