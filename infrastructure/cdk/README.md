# PixEcom v2.0 - AWS CDN Infrastructure

This directory contains AWS CDK (Cloud Development Kit) infrastructure code for deploying a CloudFront CDN distribution for PixEcom v2.0.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Deployment](#deployment)
- [Configuration](#configuration)
- [Cache Management](#cache-management)
- [Monitoring](#monitoring)
- [Cost Optimization](#cost-optimization)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

The CDN infrastructure provides:

- **Global Content Delivery**: CloudFront edge locations worldwide for low-latency access
- **Static Asset Caching**: S3-backed storage for images, CSS, and JavaScript files
- **API Acceleration**: Optimized routing for API requests
- **Security**: WAF (Web Application Firewall) integration, security headers, and HTTPS
- **Cost Optimization**: Intelligent caching policies to reduce origin load
- **Monitoring**: CloudWatch metrics and access logs

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CloudFront Distribution                  │
│                    (Global Edge Locations)                  │
└─────────────────┬───────────────────┬──────────────────────┘
                  │                   │
         ┌────────▼────────┐  ┌──────▼───────┐
         │   Web Origin    │  │  API Origin  │
         │   (Next.js)     │  │  (NestJS)    │
         │   Port 3000     │  │  Port 3001   │
         └─────────────────┘  └──────────────┘
                  │
         ┌────────▼────────┐
         │  S3 Bucket      │
         │  Static Assets  │
         └─────────────────┘
```

### Cache Behaviors

1. **Default Behavior** (`/*`):
   - Origin: Next.js web application
   - Cache: 5 minutes default, 24 hours max
   - Forwards: `cart_session`, `next-auth.session-token` cookies

2. **API Routes** (`/api/*`):
   - Origin: NestJS backend
   - Cache: Disabled (0 seconds)
   - Forwards: All headers, cookies, query strings
   - Special headers: `Authorization`, `X-Workspace-Id`

3. **Static Assets** (`/static/*`, `/_next/static/*`):
   - Origin: S3 bucket / Next.js
   - Cache: 30 days default, 365 days max
   - Compression: Gzip and Brotli enabled

4. **Next.js Images** (`/_next/image*`):
   - Origin: Next.js image optimizer
   - Cache: 30 days
   - Compression: Enabled

## 📦 Prerequisites

### Required Software

- **Node.js** 18+ and npm
- **AWS CLI** v2 configured with credentials
- **AWS CDK** v2.115.0+
- **TypeScript** 5.3+

### AWS Account Setup

1. **AWS Account**: Active AWS account with appropriate permissions
2. **IAM Permissions**: User/role with permissions for:
   - CloudFront
   - S3
   - CloudFormation
   - IAM (for creating service roles)
   - CloudWatch (for logs and metrics)
   - WAF (optional, if enabling)

3. **AWS CLI Configuration**:
   ```bash
   aws configure
   ```
   Enter your:
   - AWS Access Key ID
   - AWS Secret Access Key
   - Default region (e.g., `us-east-1`)
   - Default output format (e.g., `json`)

## 🚀 Setup

### 1. Install Dependencies

```bash
cd infrastructure/cdk
npm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```bash
# AWS Configuration
AWS_ACCOUNT_ID=123456789012
AWS_REGION=us-east-1

# Origin Configuration
ORIGIN_DOMAIN=your-server-ip-or-lb.example.com
API_ORIGIN_DOMAIN=your-server-ip-or-lb.example.com

# Environment
ENVIRONMENT=production

# CloudFront Settings
PRICE_CLASS=PriceClass_100  # US, Canada, Europe only
ENABLE_WAF=true
ENABLE_ACCESS_LOGS=true
```

### 3. Bootstrap CDK (First Time Only)

```bash
npm run cdk bootstrap aws://ACCOUNT-ID/REGION
```

Replace `ACCOUNT-ID` and `REGION` with your values.

## 📤 Deployment

### Option 1: Automated Deployment (Recommended)

**On Linux/Mac:**
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

**On Windows (PowerShell):**
```powershell
.\scripts\deploy.ps1
```

### Option 2: Manual Deployment

```bash
# Build TypeScript
npm run build

# Preview changes
npm run diff

# Deploy
npm run deploy:cdn
```

### Post-Deployment

After deployment completes, you'll see outputs:

```
Outputs:
PixEcomCdnStack-production.DistributionId = E1234567890ABC
PixEcomCdnStack-production.DistributionDomainName = d1234567890abc.cloudfront.net
PixEcomCdnStack-production.StaticAssetsBucketName = pixecom-static-assets-123456789012
```

**Update your application to use the CloudFront URL:**

```bash
# In your .env file
NEXT_PUBLIC_CDN_URL=https://d1234567890abc.cloudfront.net
```

## ⚙️ Configuration

### Price Classes

Control which edge locations are used (affects cost):

- **PriceClass_100**: US, Canada, Europe (lowest cost)
- **PriceClass_200**: Adds Asia, Middle East, Africa
- **PriceClass_All**: All edge locations worldwide (highest performance)

### Custom Domain

To use your own domain (e.g., `cdn.pixecom.com`):

1. **Create ACM Certificate** in `us-east-1`:
   ```bash
   aws acm request-certificate \
     --domain-name cdn.pixecom.com \
     --validation-method DNS \
     --region us-east-1
   ```

2. **Add to `.env`**:
   ```bash
   DOMAIN_NAME=cdn.pixecom.com
   CERTIFICATE_ARN=arn:aws:acm:us-east-1:123456789012:certificate/xxxxx
   ```

3. **Redeploy**:
   ```bash
   npm run deploy:cdn
   ```

4. **Create DNS Record** (Route 53 or your DNS provider):
   - Type: `CNAME`
   - Name: `cdn`
   - Value: `d1234567890abc.cloudfront.net`

### WAF (Web Application Firewall)

The stack includes optional WAF protection:

- **Rate limiting**: 2000 requests per 5 minutes per IP
- **AWS Managed Rules**:
  - Common Rule Set (OWASP Top 10)
  - Known Bad Inputs

To disable WAF (reduce costs):
```bash
ENABLE_WAF=false
```

## 🔄 Cache Management

### Invalidate Cache

When you deploy new code or update content:

**On Linux/Mac:**
```bash
./scripts/invalidate-cache.sh
```

**On Windows (PowerShell):**
```powershell
.\scripts\invalidate-cache.ps1
```

**Invalidate specific paths:**
```bash
./scripts/invalidate-cache.sh "/api/*"
./scripts/invalidate-cache.sh "/_next/static/*"
```

**Manual invalidation:**
```bash
aws cloudfront create-invalidation \
  --distribution-id E1234567890ABC \
  --paths "/*"
```

### Cache Headers

The application can control caching with headers:

```javascript
// In your Next.js pages/API routes
export async function GET() {
  return new Response(data, {
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
```

## 📊 Monitoring

### CloudWatch Metrics

View in AWS Console: **CloudFront** → **Monitoring**

Key metrics:
- **Requests**: Total request count
- **Bytes Downloaded**: Data transferred
- **Error Rate**: 4xx and 5xx errors
- **Cache Hit Rate**: Percentage of requests served from cache

### Access Logs

Logs are stored in S3 bucket: `pixecom-cdn-logs-{account-id}`

**Download logs:**
```bash
aws s3 sync s3://pixecom-cdn-logs-123456789012/cloudfront-logs/ ./logs/
```

**Analyze with Amazon Athena:**
1. Create Athena table from CloudFront logs
2. Query patterns, top URLs, error rates

### Alarms (Optional)

Create CloudWatch alarms for:

```bash
aws cloudwatch put-metric-alarm \
  --alarm-name pixecom-cdn-error-rate \
  --alarm-description "Alert on high error rate" \
  --metric-name 5xxErrorRate \
  --namespace AWS/CloudFront \
  --statistic Average \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 5.0 \
  --comparison-operator GreaterThanThreshold
```

## 💰 Cost Optimization

### Expected Costs (Approximate)

Based on PriceClass_100 (US, Canada, Europe):

| Component | Monthly Cost (Est.) |
|-----------|---------------------|
| CloudFront (1TB data transfer) | $85 |
| CloudFront (10M requests) | $1 |
| S3 Storage (100GB) | $2.30 |
| S3 Requests (1M GET) | $0.40 |
| WAF (enabled) | $5 + $1/million requests |
| **Total (typical usage)** | **~$90-100/month** |

### Cost Reduction Tips

1. **Optimize Cache Hit Ratio**:
   - Longer TTLs for static assets
   - Consistent URLs (avoid dynamic query params)
   - Use versioned filenames

2. **Compress Assets**:
   - Enable Gzip/Brotli compression
   - Minify CSS/JS before upload

3. **Use S3 for Static Assets**:
   - Upload images, fonts to S3
   - Reference from `/static/*` path

4. **Reduce Price Class**:
   - Use PriceClass_100 if users are primarily in US/EU

5. **Disable WAF** (if not needed):
   ```bash
   ENABLE_WAF=false
   ```

## 🔧 Troubleshooting

### Common Issues

#### 1. Distribution Not Updating

**Problem**: Changes not reflected after deployment.

**Solution**:
```bash
# Invalidate cache
./scripts/invalidate-cache.sh

# Check distribution status
aws cloudfront get-distribution --id E1234567890ABC
```

Wait for status: `Deployed` (can take 15-20 minutes).

#### 2. 403 Forbidden Errors

**Problem**: S3 bucket denying access.

**Solution**: Check Origin Access Identity permissions:
```bash
aws s3api get-bucket-policy --bucket pixecom-static-assets-123456789012
```

#### 3. API Requests Failing

**Problem**: CORS errors or API not responding.

**Solution**:
- Verify origin domain is correct in `.env`
- Check security groups allow traffic from CloudFront
- Review CloudFront response headers policy

#### 4. High Costs

**Problem**: Unexpected AWS bill.

**Solution**:
- Check CloudWatch metrics for traffic patterns
- Review cache hit ratio (should be >80%)
- Consider reducing price class
- Disable WAF if not needed

### Debugging Commands

```bash
# Check distribution configuration
aws cloudfront get-distribution-config --id E1234567890ABC

# View recent access logs
aws s3 ls s3://pixecom-cdn-logs-123456789012/cloudfront-logs/ --recursive | tail -20

# Test cache headers
curl -I https://d1234567890abc.cloudfront.net/

# View CloudFormation stack events
aws cloudformation describe-stack-events --stack-name pixecom-cdn-production
```

## 🗑️ Cleanup

To delete the CDN infrastructure:

```bash
npm run cdk destroy
```

**Note**: S3 buckets are retained by default to prevent data loss. To delete them:

```bash
# Empty buckets first
aws s3 rm s3://pixecom-static-assets-123456789012 --recursive
aws s3 rm s3://pixecom-cdn-logs-123456789012 --recursive

# Delete buckets
aws s3 rb s3://pixecom-static-assets-123456789012
aws s3 rb s3://pixecom-cdn-logs-123456789012
```

## 📚 Additional Resources

- [AWS CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [CloudFront Pricing](https://aws.amazon.com/cloudfront/pricing/)
- [Best Practices for CloudFront](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/best-practices.html)

## 🤝 Support

For issues or questions:
1. Check [Troubleshooting](#troubleshooting) section
2. Review CloudWatch logs and metrics
3. Contact your DevOps team
