# PixEcom CDN - Quick Start Guide

Get your CDN up and running in 5 minutes!

## 🚀 Quick Setup

### Step 1: Configure AWS Credentials

If you haven't already, configure AWS CLI:

```bash
aws configure
```

Enter:
- **AWS Access Key ID**: Your AWS access key
- **AWS Secret Access Key**: Your AWS secret key
- **Default region**: `us-east-1` (recommended)
- **Default output format**: `json`

### Step 2: Set Up Environment

```bash
cd infrastructure/cdk

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### Step 3: Edit Configuration

Open `.env` and update these required fields:

```bash
# Your AWS account ID (find in AWS Console top-right)
AWS_ACCOUNT_ID=123456789012

# Your server's public IP or domain
ORIGIN_DOMAIN=YOUR_SERVER_IP_HERE  # e.g., 54.123.45.67 or app.example.com

# Copy for API origin (unless different)
API_ORIGIN_DOMAIN=YOUR_SERVER_IP_HERE
```

### Step 4: Deploy

**On Windows (PowerShell):**
```powershell
.\scripts\deploy.ps1
```

**On Linux/Mac:**
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

When prompted, type `yes` to confirm deployment.

### Step 5: Get Your CDN URL

After deployment (takes ~15-20 minutes), you'll see:

```
Outputs:
PixEcomCdnStack-production.DistributionDomainName = d1234567890abc.cloudfront.net
```

**This is your CDN URL!** ☝️

### Step 6: Update Your Application

Update your `.env` files to use the CDN:

**In `Rebuild/.env`:**
```bash
NEXT_PUBLIC_CDN_URL=https://d1234567890abc.cloudfront.net
```

**In your Nginx config** (optional - for production):
```nginx
# Update API and Web upstream to use CloudFront
# Or keep as-is and use CDN for static assets only
```

### Step 7: Test It

Open your browser to:
```
https://d1234567890abc.cloudfront.net
```

You should see your PixEcom application! 🎉

## 📊 What You Get

✅ **Global CDN** with edge locations worldwide
✅ **HTTPS** enabled automatically
✅ **Caching** for faster load times
✅ **S3 bucket** for static assets
✅ **Security headers** (XSS protection, CSP, etc.)
✅ **WAF protection** against common attacks
✅ **Access logs** for analytics

## 🔄 Common Tasks

### Upload Static Assets to S3

```bash
# Get bucket name from outputs
aws s3 ls | grep pixecom-static-assets

# Upload files
aws s3 cp ./public/images s3://pixecom-static-assets-123456789012/static/images --recursive
```

### Update After Code Changes

After deploying new code:

```powershell
# Invalidate cache (Windows)
.\scripts\invalidate-cache.ps1

# Or Linux/Mac
./scripts/invalidate-cache.sh
```

### Check Distribution Status

```bash
aws cloudfront list-distributions --query 'DistributionList.Items[0].[Id,Status,DomainName]'
```

### View Logs

```bash
aws s3 ls s3://pixecom-cdn-logs-123456789012/cloudfront-logs/
```

## 💰 Expected Costs

For a small-to-medium traffic site:
- **~$90-100/month** for 1TB data transfer
- **First 1TB free** in first 12 months (AWS Free Tier)

## 🔧 Troubleshooting

### "Origin is not responding"

**Fix**: Check your `ORIGIN_DOMAIN` is accessible:
```bash
curl http://YOUR_ORIGIN_DOMAIN
```

### "Access Denied" to S3

**Fix**: The CDK creates proper permissions automatically. Wait for deployment to complete.

### Changes Not Appearing

**Fix**: Invalidate the cache:
```powershell
.\scripts\invalidate-cache.ps1
```

### Distribution Taking Long to Deploy

**Normal**: CloudFront distributions take 15-20 minutes to fully deploy. Be patient! ⏳

## 🎯 Next Steps

1. **Set up custom domain**: See [README.md](README.md#custom-domain)
2. **Configure monitoring**: Set up CloudWatch alarms
3. **Optimize caching**: Review cache hit ratio in CloudWatch
4. **Upload assets to S3**: Move static files to S3 bucket

## 📚 Full Documentation

For detailed configuration, monitoring, and advanced features, see [README.md](README.md).

## ❓ Need Help?

- Check [README.md Troubleshooting](README.md#troubleshooting)
- Review CloudWatch logs in AWS Console
- Check CloudFormation stack events for errors

---

**🎉 Congratulations!** Your CDN is now serving your PixEcom application globally with improved performance and security!
