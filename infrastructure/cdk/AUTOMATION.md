# PixEcom CDN - Automation Guide

Complete guide for setting up automated deployments and cache management.

## 📋 Table of Contents

- [GitHub Actions Setup](#github-actions-setup)
- [AWS Credentials Configuration](#aws-credentials-configuration)
- [Automated Deployment](#automated-deployment)
- [Automated Cache Invalidation](#automated-cache-invalidation)
- [Manual Triggers](#manual-triggers)
- [Monitoring & Notifications](#monitoring--notifications)
- [Troubleshooting](#troubleshooting)

## 🚀 GitHub Actions Setup

### Prerequisites

1. GitHub repository for your PixEcom project
2. AWS account with appropriate permissions
3. Repository admin access to configure secrets

### Workflows Created

Two GitHub Actions workflows are included:

1. **`deploy-cdn.yml`** - Deploys CloudFront infrastructure
2. **`invalidate-cdn-cache.yml`** - Invalidates cache after app deployments

## 🔐 AWS Credentials Configuration

### Step 1: Create IAM User for GitHub Actions

Create an IAM user with programmatic access:

```bash
aws iam create-user --user-name github-actions-pixecom-cdn
```

### Step 2: Attach Required Policies

Create a custom policy with minimal required permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CloudFormationAccess",
      "Effect": "Allow",
      "Action": [
        "cloudformation:*"
      ],
      "Resource": "*"
    },
    {
      "Sid": "CloudFrontAccess",
      "Effect": "Allow",
      "Action": [
        "cloudfront:*"
      ],
      "Resource": "*"
    },
    {
      "Sid": "S3Access",
      "Effect": "Allow",
      "Action": [
        "s3:*"
      ],
      "Resource": "*"
    },
    {
      "Sid": "IAMAccess",
      "Effect": "Allow",
      "Action": [
        "iam:CreateRole",
        "iam:DeleteRole",
        "iam:AttachRolePolicy",
        "iam:DetachRolePolicy",
        "iam:PutRolePolicy",
        "iam:DeleteRolePolicy",
        "iam:GetRole",
        "iam:GetRolePolicy",
        "iam:PassRole",
        "iam:TagRole",
        "iam:UntagRole"
      ],
      "Resource": "arn:aws:iam::*:role/PixEcom*"
    },
    {
      "Sid": "WAFAccess",
      "Effect": "Allow",
      "Action": [
        "wafv2:*"
      ],
      "Resource": "*"
    },
    {
      "Sid": "STSAccess",
      "Effect": "Allow",
      "Action": [
        "sts:GetCallerIdentity"
      ],
      "Resource": "*"
    }
  ]
}
```

Save this as `github-actions-policy.json` and apply:

```bash
aws iam put-user-policy \
  --user-name github-actions-pixecom-cdn \
  --policy-name PixEcomCDNDeploymentPolicy \
  --policy-document file://github-actions-policy.json
```

### Step 3: Create Access Keys

```bash
aws iam create-access-key --user-name github-actions-pixecom-cdn
```

**Save the output securely!** You'll need:
- `AccessKeyId`
- `SecretAccessKey`

### Step 4: Configure GitHub Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**

Add the following secrets:

#### Required Secrets

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `AWS_ACCESS_KEY_ID` | IAM user access key | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `AWS_ACCOUNT_ID` | Your AWS account ID | `123456789012` |
| `ORIGIN_DOMAIN` | Your server IP/domain | `54.123.45.67` or `app.example.com` |

#### Optional Secrets

| Secret Name | Description | Default Value |
|-------------|-------------|---------------|
| `API_ORIGIN_DOMAIN` | API server domain (if different) | Same as `ORIGIN_DOMAIN` |
| `PRICE_CLASS` | CloudFront price class | `PriceClass_100` |
| `ENABLE_WAF` | Enable WAF protection | `true` |
| `ENABLE_ACCESS_LOGS` | Enable access logging | `true` |
| `DOMAIN_NAME` | Custom domain (optional) | - |
| `CERTIFICATE_ARN` | ACM certificate ARN (if using custom domain) | - |

### Secrets Configuration Screenshot Guide

1. Navigate to repository **Settings**
2. Click **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret one by one

## 🤖 Automated Deployment

### Trigger Conditions

The CDN deployment workflow runs automatically when:

1. **Push to main/production branch** with changes in:
   - `infrastructure/cdk/**`
   - `.github/workflows/deploy-cdn.yml`

2. **Manual trigger** via GitHub Actions UI

### Deployment Process

```
┌─────────────────────────────────────────────┐
│  1. Code pushed to main/production          │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│  2. GitHub Actions triggered                │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│  3. Setup Node.js & AWS credentials         │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│  4. Install dependencies & build CDK        │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│  5. CDK Bootstrap (if needed)               │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│  6. CDK Synth & Diff                        │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│  7. Deploy CloudFront stack                 │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│  8. Get distribution ID & domain            │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│  9. Invalidate cache (if enabled)           │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│  10. Deployment summary & notification      │
└─────────────────────────────────────────────┘
```

### Viewing Deployment Status

1. Go to your repository → **Actions** tab
2. Click on the running workflow
3. View real-time logs for each step
4. Check the **Summary** tab for deployment details

## 🔄 Automated Cache Invalidation

### How It Works

The cache invalidation workflow:

1. **Triggers automatically** after successful application deployments
2. **Gets CloudFront distribution ID** from CloudFormation stack
3. **Creates invalidation** for specified paths
4. **Monitors status** and reports back

### Default Behavior

- Invalidates all paths (`/*`) after app deployment
- Only runs if the main deployment succeeds
- Doesn't wait for completion (can take 5-15 minutes)

### Customizing Paths

To invalidate specific paths only, modify the workflow:

```yaml
paths:
  description: 'Paths to invalidate'
  default: '/_next/static/*'  # Only Next.js static files
```

Common path patterns:
- `/*` - All content (full invalidation)
- `/_next/static/*` - Next.js static assets
- `/api/*` - API routes (not recommended - no cache)
- `/static/*` - S3 static assets
- `/products/*` - Specific routes

## 🎮 Manual Triggers

### Deploy CDN Manually

1. Go to **Actions** → **Deploy AWS CDN**
2. Click **Run workflow**
3. Select options:
   - **Environment**: production or staging
   - **Invalidate cache**: true/false
4. Click **Run workflow**

### Invalidate Cache Manually

1. Go to **Actions** → **Invalidate CDN Cache**
2. Click **Run workflow**
3. Select options:
   - **Environment**: production or staging
   - **Paths**: `/*` or specific paths
4. Click **Run workflow**

## 📊 Monitoring & Notifications

### Deployment Summaries

Each workflow run generates a summary with:
- Environment details
- Distribution ID and domain
- Stack outputs
- Success/failure status

Access summaries:
1. Go to **Actions** → Select workflow run
2. Scroll down to **Summary** section

### Email Notifications

Enable GitHub notifications:
1. Go to GitHub **Settings** → **Notifications**
2. Enable **Actions** notifications
3. Choose email or web notifications

### Slack Integration (Optional)

Add Slack notifications to workflows:

```yaml
- name: Notify Slack
  if: always()
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
    payload: |
      {
        "text": "CDN Deployment ${{ job.status }}",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "CloudFront CDN deployment *${{ job.status }}*\nEnvironment: ${{ github.event.inputs.environment }}"
            }
          }
        ]
      }
```

## 🔧 Advanced Configuration

### Multi-Environment Setup

Create separate workflows for staging and production:

**`.github/workflows/deploy-cdn-staging.yml`:**
```yaml
on:
  push:
    branches:
      - staging
env:
  ENVIRONMENT: staging
```

**`.github/workflows/deploy-cdn-production.yml`:**
```yaml
on:
  push:
    branches:
      - main
      - production
env:
  ENVIRONMENT: production
```

### Approval Gates

Add manual approval for production:

```yaml
jobs:
  deploy-cdn:
    environment:
      name: production
      url: https://${{ steps.get-domain-name.outputs.domain_name }}
    # GitHub will require manual approval before deployment
```

Configure in **Settings** → **Environments** → **production** → **Required reviewers**

### Scheduled Deployments

Deploy on a schedule:

```yaml
on:
  schedule:
    - cron: '0 2 * * 0'  # Every Sunday at 2 AM UTC
```

## 🚨 Troubleshooting

### Authentication Errors

**Error:** `Unable to locate credentials`

**Solution:**
- Verify `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are set
- Check IAM user has required permissions
- Ensure secrets don't have leading/trailing spaces

### Permission Denied Errors

**Error:** `User is not authorized to perform: cloudformation:CreateStack`

**Solution:**
- Review IAM policy attached to user
- Ensure all required permissions are granted
- Check resource ARNs in policy

### Stack Already Exists

**Error:** `Stack already exists`

**Solution:**
- This is normal for updates
- CDK will update existing stack
- Check for drift: `aws cloudformation detect-stack-drift`

### Cache Invalidation Timeout

**Error:** Workflow times out waiting for invalidation

**Solution:**
- Invalidations can take 15+ minutes
- Don't wait for completion in workflow
- Check status manually:
  ```bash
  aws cloudfront get-invalidation --distribution-id ID --id INVALIDATION_ID
  ```

### Rate Limiting

**Error:** `TooManyRequests` or `Throttling`

**Solution:**
- AWS has rate limits for CloudFront API
- Space out deployments
- Use exponential backoff for retries

## 📝 Best Practices

### 1. Use Branch Protection

Protect your main branches:
- Settings → Branches → Add rule
- Require pull request reviews
- Require status checks to pass

### 2. Test in Staging First

Always deploy to staging before production:
```
feature → staging → production
```

### 3. Monitor Costs

Set up AWS budget alerts:
```bash
aws budgets create-budget \
  --account-id 123456789012 \
  --budget file://budget.json
```

### 4. Rotate Access Keys

Rotate IAM access keys every 90 days:
```bash
aws iam create-access-key --user-name github-actions-pixecom-cdn
aws iam delete-access-key --user-name github-actions-pixecom-cdn --access-key-id OLD_KEY
```

### 5. Use Deployment Freeze Windows

Disable deployments during critical periods:
```yaml
if: github.event.schedule != '0 2 * * 0'  # Skip scheduled Sunday runs
```

## 🔗 Integration with Application Deployment

### Combined Workflow Example

Deploy app and CDN together:

**`.github/workflows/deploy-all.yml`:**
```yaml
name: Deploy Application & CDN

on:
  push:
    branches:
      - main

jobs:
  deploy-backend:
    # Deploy NestJS backend

  deploy-frontend:
    needs: deploy-backend
    # Deploy Next.js frontend

  deploy-cdn:
    needs: deploy-frontend
    uses: ./.github/workflows/deploy-cdn.yml
    secrets: inherit

  invalidate-cache:
    needs: deploy-cdn
    uses: ./.github/workflows/invalidate-cdn-cache.yml
    secrets: inherit
```

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [AWS CDK GitHub Actions](https://github.com/aws-actions)
- [CloudFormation Best Practices](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/best-practices.html)
- [GitHub Environments](https://docs.github.com/en/actions/deployment/targeting-different-environments)

## 🎓 Quick Reference

### Common Commands

```bash
# View workflow runs
gh run list --workflow=deploy-cdn.yml

# View specific run
gh run view RUN_ID

# Manually trigger workflow
gh workflow run deploy-cdn.yml -f environment=production -f invalidate_cache=true

# Cancel running workflow
gh run cancel RUN_ID

# Download workflow logs
gh run download RUN_ID
```

### Useful GitHub Actions

- `actions/checkout@v4` - Checkout code
- `actions/setup-node@v4` - Setup Node.js
- `aws-actions/configure-aws-credentials@v4` - Configure AWS
- `slackapi/slack-github-action@v1` - Slack notifications

---

**Need help?** Check [TROUBLESHOOTING](README.md#troubleshooting) or review workflow logs in GitHub Actions.
