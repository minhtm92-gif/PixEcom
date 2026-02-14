# PixEcom CDN Deployment Checklist

Use this checklist to ensure a smooth CDN deployment.

## Pre-Deployment

### AWS Account Setup
- [ ] AWS account created and active
- [ ] AWS CLI installed (`aws --version`)
- [ ] AWS credentials configured (`aws sts get-caller-identity`)
- [ ] IAM user/role has required permissions:
  - [ ] CloudFront full access
  - [ ] S3 full access
  - [ ] CloudFormation full access
  - [ ] IAM read/write (for service roles)
  - [ ] CloudWatch full access
  - [ ] WAF full access (if enabling WAF)

### Local Setup
- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Git repository cloned
- [ ] In correct directory: `infrastructure/cdk`

### Environment Configuration
- [ ] `.env` file created from `.env.example`
- [ ] `AWS_ACCOUNT_ID` set (12-digit number)
- [ ] `AWS_REGION` set (e.g., `us-east-1`)
- [ ] `ORIGIN_DOMAIN` set to your server IP/domain
- [ ] `API_ORIGIN_DOMAIN` set (or same as ORIGIN_DOMAIN)
- [ ] Origin server is running and accessible
- [ ] Origin server accepts HTTP traffic on port 80

### Optional Configuration
- [ ] Custom domain certificate created in ACM (if using custom domain)
- [ ] `DOMAIN_NAME` configured (if using custom domain)
- [ ] `CERTIFICATE_ARN` configured (if using custom domain)
- [ ] `PRICE_CLASS` selected based on user geography
- [ ] `ENABLE_WAF` set (`true` for security, `false` to save costs)

## Deployment

### Initial Setup
- [ ] Dependencies installed: `npm install`
- [ ] TypeScript builds successfully: `npm run build`
- [ ] CDK bootstrapped: `cdk bootstrap aws://ACCOUNT-ID/REGION`

### Deploy Stack
- [ ] Preview changes: `npm run diff`
- [ ] Review CloudFormation changes
- [ ] Deploy: `npm run deploy:cdn` or `.\scripts\deploy.ps1`
- [ ] Confirm deployment when prompted
- [ ] Wait for deployment completion (~15-20 minutes)

### Verify Deployment
- [ ] Check CloudFormation stack status: `Deployed`
- [ ] Note Distribution ID from outputs
- [ ] Note CloudFront domain name from outputs
- [ ] Note S3 bucket names from outputs

## Post-Deployment

### Testing
- [ ] Access CloudFront domain in browser
- [ ] Test homepage loads correctly
- [ ] Test API endpoint: `https://DOMAIN/api/health`
- [ ] Check browser console for errors
- [ ] Verify HTTPS is working
- [ ] Test static assets load correctly

### Configuration Updates
- [ ] Update application `.env`:
  - [ ] `NEXT_PUBLIC_CDN_URL` = CloudFront domain
- [ ] Update API CORS settings (if needed):
  - [ ] Add CloudFront domain to allowed origins
- [ ] Update CSP headers (if applicable):
  - [ ] Add CloudFront domain to CSP directives

### DNS Setup (Custom Domain Only)
- [ ] Create CNAME record in DNS provider:
  - Name: Your subdomain (e.g., `cdn`)
  - Value: CloudFront domain (e.g., `d123.cloudfront.net`)
- [ ] Wait for DNS propagation (~5-60 minutes)
- [ ] Test custom domain access

### Security
- [ ] Verify HTTPS redirects are working
- [ ] Check security headers in browser dev tools:
  - [ ] `Strict-Transport-Security`
  - [ ] `X-Content-Type-Options`
  - [ ] `X-Frame-Options`
  - [ ] `X-XSS-Protection`
- [ ] Test WAF (if enabled):
  - [ ] Check CloudWatch WAF metrics
  - [ ] Test rate limiting (optional)

### Monitoring Setup
- [ ] CloudWatch dashboard created (optional)
- [ ] CloudWatch alarms configured:
  - [ ] High error rate (5xx)
  - [ ] Low cache hit ratio
  - [ ] Unusual traffic patterns
- [ ] Log bucket accessible
- [ ] Test log delivery (wait 1-2 hours)

### Documentation
- [ ] Document CloudFront distribution ID
- [ ] Document CloudFront domain name
- [ ] Document S3 bucket names
- [ ] Update team documentation with CDN details
- [ ] Share invalidation scripts with team

## Operations

### Cache Management
- [ ] Test cache invalidation script:
  ```bash
  .\scripts\invalidate-cache.ps1
  ```
- [ ] Verify cache invalidation completes
- [ ] Document cache invalidation process for team

### Cost Optimization
- [ ] Review initial CloudWatch metrics
- [ ] Check cache hit ratio (target >80%)
- [ ] Verify compression is working
- [ ] Adjust cache policies if needed
- [ ] Review AWS Cost Explorer after 24 hours

### Static Assets (Optional)
- [ ] Upload static assets to S3 bucket:
  ```bash
  aws s3 cp ./public/images s3://BUCKET-NAME/static/images --recursive
  ```
- [ ] Update application to reference S3 paths
- [ ] Test static asset loading from S3

## Rollback Plan

In case of issues:

- [ ] Keep old infrastructure running until CDN is verified
- [ ] Document rollback procedure:
  1. Update `.env` to remove CDN URL
  2. Redeploy application
  3. Optionally destroy CDN stack: `cdk destroy`

## Monthly Checklist

After deployment, monthly tasks:

- [ ] Review CloudWatch metrics
- [ ] Check cache hit ratio
- [ ] Review AWS costs
- [ ] Check access logs for anomalies
- [ ] Update cache policies if needed
- [ ] Review WAF logs for blocked requests

## Troubleshooting Reference

If issues occur:

- **Origin not responding**: Check `ORIGIN_DOMAIN` is correct and server is running
- **403 errors**: Verify S3 bucket policy and OAI permissions
- **504 timeout**: Check origin server response time
- **High costs**: Review cache hit ratio and price class
- **Changes not appearing**: Invalidate cache

## Notes

- CloudFront deployments take 15-20 minutes
- Cache invalidations take 5-15 minutes
- DNS changes take 5-60 minutes to propagate
- First request to each edge location is slower (cache miss)
- AWS Free Tier includes 1TB data transfer/month for first 12 months

## Sign-Off

Deployment completed by: ___________________

Date: ___________________

Distribution ID: ___________________

CloudFront Domain: ___________________

Custom Domain (if applicable): ___________________

Issues encountered: ___________________

___________________

___________________

## Emergency Contacts

- AWS Support: [Support Center](https://console.aws.amazon.com/support/)
- DevOps Team: ___________________
- Project Lead: ___________________
