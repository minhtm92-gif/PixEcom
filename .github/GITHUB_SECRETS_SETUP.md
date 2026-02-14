# GitHub Secrets Setup Guide

This guide explains how to configure GitHub Secrets for CI/CD automation in the PixEcom project.

## Table of Contents

- [Overview](#overview)
- [Required Secrets](#required-secrets)
- [How to Add Secrets](#how-to-add-secrets)
- [Secret Categories](#secret-categories)
- [Testing Your Setup](#testing-your-setup)

## Overview

GitHub Secrets are encrypted environment variables that you create in a repository. They're used by GitHub Actions workflows for deployment and automation.

**Security Note:** Secrets are encrypted and only exposed to the workflows that need them. Never commit secrets to your repository.

## How to Add Secrets

1. **Navigate to Repository Settings:**
   - Go to: `https://github.com/minhtm92-gif/PixEcom/settings/secrets/actions`
   - Or: Repository → Settings → Secrets and variables → Actions

2. **Click "New repository secret"**

3. **Enter the secret details:**
   - Name: Secret name (use the exact names below)
   - Value: The secret value
   - Click "Add secret"

4. **Repeat for all required secrets**

## Required Secrets

### 🌐 Cloudflare Deployment Secrets

#### `CLOUDFLARE_API_TOKEN`
**Required for:** Cloudflare Pages deployment

**How to get:**
1. Log in to Cloudflare Dashboard: https://dash.cloudflare.com
2. Go to: My Profile → API Tokens
3. Click "Create Token"
4. Use template: "Edit Cloudflare Workers" or create custom token with:
   - Permissions:
     - Account → Cloudflare Pages → Edit
     - Account → Account Settings → Read
   - Account Resources: Include → Your Account
5. Click "Continue to summary" → "Create Token"
6. **Copy the token immediately** (you won't see it again!)

**Example:**
```
Name: CLOUDFLARE_API_TOKEN
Value: AbCdEf123456_your_actual_token_here
```

---

#### `CLOUDFLARE_ACCOUNT_ID`
**Required for:** Cloudflare Pages deployment

**How to get:**
1. Log in to Cloudflare Dashboard
2. Go to any Cloudflare Pages project, or:
3. Navigate to: Workers & Pages → Overview
4. Copy your Account ID from the right sidebar
5. Or find it in the URL: `dash.cloudflare.com/YOUR_ACCOUNT_ID/...`

**Example:**
```
Name: CLOUDFLARE_ACCOUNT_ID
Value: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

---

### 🔐 API Configuration Secrets

#### `NEXT_PUBLIC_API_URL`
**Required for:** Frontend build process

**Value (Production):**
```
Name: NEXT_PUBLIC_API_URL
Value: https://your-api-domain.com/api
```

**Value (Staging/Testing):**
```
Value: https://staging-api.your-domain.com/api
```

**Note:** This should be your production API URL once deployed. During initial setup, you can use a placeholder.

---

### 🔑 Authentication Secrets (Optional for CI/CD)

These are only needed if your CI/CD tests require database access:

#### `DATABASE_URL`
**Required for:** Running tests in CI

**Example:**
```
Name: DATABASE_URL
Value: postgresql://username:password@host:5432/dbname
```

**Recommendation:** Use a separate test database, not production!

---

#### `JWT_SECRET`
**Required for:** Running tests in CI

**How to generate:**
```bash
# Option 1: OpenSSL
openssl rand -base64 32

# Option 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Example:**
```
Name: JWT_SECRET
Value: your-generated-secret-here-32-chars-min
```

---

#### `JWT_REFRESH_SECRET`
**Required for:** Running tests in CI

**How to generate:** (same as JWT_SECRET)

**Example:**
```
Name: JWT_REFRESH_SECRET
Value: your-different-generated-secret-here
```

---

### 🔔 Optional Notification Secrets

#### `SLACK_WEBHOOK_URL` (Optional)
**Required for:** Deployment notifications to Slack

**How to get:**
1. Go to: https://api.slack.com/apps
2. Create a new app or select existing
3. Go to: Incoming Webhooks
4. Activate Incoming Webhooks
5. Click "Add New Webhook to Workspace"
6. Select channel and authorize
7. Copy the Webhook URL

**Example:**
```
Name: SLACK_WEBHOOK_URL
Value: https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX
```

---

#### `DISCORD_WEBHOOK_URL` (Optional)
**Required for:** Deployment notifications to Discord

**How to get:**
1. Go to your Discord server
2. Server Settings → Integrations → Webhooks
3. Click "New Webhook"
4. Configure channel and copy the webhook URL

**Example:**
```
Name: DISCORD_WEBHOOK_URL
Value: https://discord.com/api/webhooks/123456789/abcdefg-webhook-url
```

---

### 🚀 AWS CDN Secrets (Optional - only if using AWS CloudFront)

#### `AWS_ACCESS_KEY_ID`
**Required for:** AWS CDN deployment

**How to get:**
1. AWS Console → IAM → Users
2. Select your user → Security credentials
3. Create access key → Application running outside AWS
4. Copy Access Key ID

---

#### `AWS_SECRET_ACCESS_KEY`
**Required for:** AWS CDN deployment

**How to get:**
(Same process as AWS_ACCESS_KEY_ID - copy the secret key)

**Important:** This is only shown once! Save it immediately.

---

#### `AWS_REGION`
**Required for:** AWS CDN deployment

**Example:**
```
Name: AWS_REGION
Value: us-east-1
```

Common regions:
- `us-east-1` - US East (N. Virginia)
- `us-west-2` - US West (Oregon)
- `eu-west-1` - Europe (Ireland)
- `ap-southeast-1` - Asia Pacific (Singapore)

---

## Secret Categories by Priority

### ✅ Essential (Required for Basic CI/CD)
1. `CLOUDFLARE_API_TOKEN`
2. `CLOUDFLARE_ACCOUNT_ID`
3. `NEXT_PUBLIC_API_URL`

### ⚡ Recommended (For Full CI/CD)
4. `JWT_SECRET`
5. `JWT_REFRESH_SECRET`
6. `DATABASE_URL` (test database)

### 🎯 Optional (Enhanced Features)
7. `SLACK_WEBHOOK_URL` or `DISCORD_WEBHOOK_URL`
8. AWS secrets (if using CloudFront CDN)

## Testing Your Setup

### 1. Verify Secrets Are Added

Go to: `https://github.com/minhtm92-gif/PixEcom/settings/secrets/actions`

You should see all your secrets listed (values are hidden).

### 2. Test CI/CD Pipeline

**Option 1: Create a test branch and PR**
```bash
git checkout -b test/ci-cd-setup
git commit --allow-empty -m "test: trigger CI/CD pipeline"
git push origin test/ci-cd-setup
```

Then create a PR on GitHub. The workflows should run automatically.

**Option 2: Manual workflow trigger**
1. Go to: Actions tab
2. Select "Deploy to Cloudflare" workflow
3. Click "Run workflow"
4. Select branch and run

### 3. Check Workflow Logs

1. Go to: Actions tab
2. Click on the running workflow
3. Expand each job to see logs
4. Look for any errors related to missing secrets

## Common Issues & Solutions

### ❌ "Secret not found" error

**Solution:** Check that:
- Secret name matches exactly (case-sensitive)
- Secret is added to repository (not organization)
- Workflow has permission to access secrets

### ❌ Cloudflare deployment fails

**Solution:** Verify:
- API token has correct permissions
- Account ID is correct (32 characters)
- Project name matches in workflow file

### ❌ API URL not working

**Solution:**
- Ensure URL includes protocol (`https://`)
- Verify URL ends with `/api` path
- Test URL is accessible

## Security Best Practices

1. **Never commit secrets to Git**
   - Always use GitHub Secrets
   - Add `.env` to `.gitignore`

2. **Use different secrets for different environments**
   - Production vs Development
   - Separate database credentials

3. **Rotate secrets regularly**
   - Update API tokens every 90 days
   - Change secrets if exposed

4. **Limit permissions**
   - API tokens should have minimum required permissions
   - Don't use admin/root credentials

5. **Monitor secret usage**
   - Check GitHub Actions logs
   - Review Cloudflare audit logs

## Next Steps

After setting up secrets:

1. ✅ **Test the CI/CD pipeline** - Push code or create a PR
2. ✅ **Deploy to Cloudflare** - Run the deployment workflow
3. ✅ **Configure branch protection** - See `BRANCH_PROTECTION.md`
4. ✅ **Set up monitoring** - Configure error tracking

## Need Help?

- Check workflow logs in the Actions tab
- Review Cloudflare deployment logs
- Consult the [GitHub Actions documentation](https://docs.github.com/en/actions)
- Check the [Cloudflare Pages documentation](https://developers.cloudflare.com/pages/)

---

**Last Updated:** February 2026
**Repository:** https://github.com/minhtm92-gif/PixEcom
