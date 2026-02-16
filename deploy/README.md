# 📦 PixEcom v1.1 - Deployment Package

This directory contains all necessary files and scripts for deploying PixEcom v1.1 to a production VPS.

---

## 📁 Files Overview

| File | Description |
|------|-------------|
| `deploy.sh` | **Automated deployment script** - Handles complete VPS setup |
| `DEPLOYMENT.md` | **Complete deployment guide** - Step-by-step manual instructions |
| `DEPLOY_CHECKLIST.md` | **Quick reference checklist** - Use this during deployment |
| `ecosystem.config.js` | **PM2 configuration** - Process manager settings |
| `nginx-config.conf` | **Nginx configuration** - Reverse proxy and SSL setup |
| `.env.production.example` | **Environment template** - Production environment variables |
| `backup-pixecom.sh` | **Backup script** - Automated database and file backups |

---

## 🚀 Quick Start (Recommended)

### Prerequisites
- Ubuntu 22.04 LTS VPS (2GB+ RAM, 2+ CPU cores)
- Domain name with DNS configured
- SSH access to VPS
- Git repository access

### Automated Deployment

**1. SSH into your VPS:**
```bash
ssh your-user@your-vps-ip
```

**2. Clone repository:**
```bash
git clone <your-repo-url> /var/www/pixecom
cd /var/www/pixecom
```

**3. Run deployment script:**
```bash
chmod +x deploy/deploy.sh
./deploy/deploy.sh
```

**4. Follow the prompts:**
- Database name and credentials
- Domain name
- SSL certificate email
- Payment gateway setup

**That's it!** ✨ Your application will be live at `https://yourdomain.com`

---

## 📖 Manual Deployment

If you prefer step-by-step control, follow the comprehensive guide:

👉 **See [DEPLOYMENT.md](./DEPLOYMENT.md)** for detailed manual deployment instructions.

---

## ✅ Deployment Checklist

Use the interactive checklist to track your progress:

👉 **See [DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md)** for the complete checklist.

---

## 🔧 Configuration Files

### PM2 Configuration (`ecosystem.config.js`)

Manages application processes:
- **pixecom-api**: NestJS backend (2 instances, cluster mode)
- **pixecom-web**: Next.js frontend (2 instances, cluster mode)

Features:
- Auto-restart on failure
- Memory limit (500MB API, 1GB Web)
- Log rotation
- Cluster mode for load balancing

### Nginx Configuration (`nginx-config.conf`)

Reverse proxy setup:
- HTTP → HTTPS redirect
- Rate limiting (100 req/min API, 200 req/min Web)
- Gzip compression
- Security headers
- Static file caching
- SSL termination
- Load balancing

### Environment Configuration (`.env.production.example`)

Template for production environment variables:
- Database connection
- JWT secrets
- Payment gateways
- API/Web URLs
- Upload directories
- Email configuration

**⚠️ Important:** Always generate new secrets for production!

```bash
# Generate secure secrets
openssl rand -hex 32  # JWT_SECRET
openssl rand -hex 32  # JWT_REFRESH_SECRET
openssl rand -hex 32  # PAYMENT_ENCRYPTION_KEY
```

---

## 🔄 Backup Strategy

### Automated Backups

The `backup-pixecom.sh` script runs daily (2 AM) via cron:

**What's backed up:**
- PostgreSQL database (compressed)
- Environment configuration (.env)
- Uploaded files (images, documents)

**Retention:**
- Keeps last 7 days of backups
- Automatic cleanup of old backups
- Backup verification

**Location:** `/var/backups/pixecom/`

### Manual Backup

```bash
# Run backup manually
sudo /usr/local/bin/backup-pixecom.sh

# View backups
ls -lh /var/backups/pixecom/

# Restore database
gunzip < /var/backups/pixecom/db_TIMESTAMP.sql.gz | psql pixecom_production
```

---

## 🔐 Security Features

### Built-in Security

✅ **Rate Limiting**
- API: 100 requests/minute
- Web: 200 requests/minute
- Configurable burst limits

✅ **SSL/TLS**
- Automatic HTTPS redirect
- Let's Encrypt certificate
- A+ SSL rating configuration

✅ **Security Headers**
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: enabled
- Referrer-Policy: strict-origin
- Permissions-Policy: restricted

✅ **Firewall**
- UFW configuration
- Only ports 22, 80, 443 open
- Fail2ban compatible

✅ **Application Security**
- JWT authentication
- Password hashing (bcrypt)
- SQL injection protection (Prisma ORM)
- XSS protection
- CSRF protection
- Input validation

---

## 📊 Monitoring & Logs

### Application Logs

```bash
# PM2 logs (all apps)
pm2 logs

# API logs only
pm2 logs pixecom-api

# Web logs only
pm2 logs pixecom-web

# Real-time monitoring
pm2 monit
```

### System Logs

```bash
# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -xe
```

### Health Checks

```bash
# API health
curl https://yourdomain.com/api/health

# PM2 status
pm2 status

# Service status
systemctl status nginx
systemctl status postgresql
systemctl status redis
```

---

## 🔄 Updates & Maintenance

### Deploying Updates

```bash
cd /var/www/pixecom

# Pull latest code
git pull

# Install dependencies
pnpm install

# Run migrations
cd apps/api && npx prisma migrate deploy && cd ../..

# Rebuild
pnpm build

# Restart services
pm2 restart all
```

### Database Migrations

```bash
# Generate migration (development)
cd apps/api
npx prisma migrate dev --name migration_name

# Deploy migration (production)
npx prisma migrate deploy

# Verify schema
npx prisma db pull
```

### PM2 Management

```bash
# Restart all
pm2 restart all

# Restart specific app
pm2 restart pixecom-api

# Reload (zero-downtime)
pm2 reload all

# Stop all
pm2 stop all

# Delete all
pm2 delete all

# View details
pm2 show pixecom-api
```

---

## 🚨 Troubleshooting

### Common Issues

#### 1. Application Won't Start
```bash
# Check logs
pm2 logs --err

# Verify environment
cat .env | grep DATABASE_URL

# Check Node version
node --version  # Should be v20.x

# Restart
pm2 restart all
```

#### 2. Database Connection Failed
```bash
# Test connection
psql -h localhost -U pixecom_prod -d pixecom_production

# Check PostgreSQL
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql
```

#### 3. Nginx 502 Bad Gateway
```bash
# Check if apps are running
pm2 status

# Test upstream
curl http://localhost:3001/health
curl http://localhost:3000

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

#### 4. SSL Certificate Issues
```bash
# Renew certificate
sudo certbot renew

# Check certificate
sudo certbot certificates

# Force renewal
sudo certbot renew --force-renewal
```

#### 5. Out of Memory
```bash
# Check memory usage
free -h
pm2 monit

# Reduce PM2 instances
# Edit ecosystem.config.js, change instances to 1
pm2 restart all
```

---

## 📈 Performance Optimization

### Recommended for Production

**1. PostgreSQL Tuning** (for 4GB RAM server)
```sql
-- Edit /etc/postgresql/14/main/postgresql.conf
shared_buffers = 1GB
effective_cache_size = 3GB
maintenance_work_mem = 256MB
work_mem = 5MB
```

**2. Redis Configuration**
```conf
# Edit /etc/redis/redis.conf
maxmemory 256mb
maxmemory-policy allkeys-lru
```

**3. PM2 Cluster Mode**
- Already configured in ecosystem.config.js
- 2 instances per app for load balancing
- Automatic restart on crashes

**4. Nginx Caching**
- Static files cached for 30 days
- Gzip compression enabled
- Keep-alive connections

---

## 📞 Support Resources

### Documentation
- **Deployment Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Checklist**: [DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md)
- **Main README**: [../README.md](../README.md)

### Tools Documentation
- **PM2**: https://pm2.keymetrics.io/docs/
- **Nginx**: https://nginx.org/en/docs/
- **Prisma**: https://www.prisma.io/docs/
- **Next.js**: https://nextjs.org/docs
- **NestJS**: https://docs.nestjs.com/

### Useful Commands Reference

```bash
# PM2
pm2 status          # Check status
pm2 logs            # View logs
pm2 restart all     # Restart all apps

# Nginx
sudo nginx -t       # Test config
sudo systemctl restart nginx

# Database
psql -U pixecom_prod -d pixecom_production

# Backup
sudo /usr/local/bin/backup-pixecom.sh

# Logs
tail -f /var/log/pixecom-backup.log
```

---

## 🎯 Deployment Scenarios

### Scenario 1: Fresh Installation
Use the automated `deploy.sh` script for quickest setup.

### Scenario 2: Migration from Development
Follow [DEPLOYMENT.md](./DEPLOYMENT.md) manual steps for full control.

### Scenario 3: Production Update
See "Updates & Maintenance" section above.

### Scenario 4: Disaster Recovery
1. Restore database from `/var/backups/pixecom/`
2. Restore uploads: `tar -xzf uploads_*.tar.gz`
3. Restore `.env` configuration
4. Rebuild and restart

---

## ✨ Post-Deployment

### First Steps After Deployment

1. **Access Application**
   - Open `https://yourdomain.com`
   - Register first admin user

2. **Initial Setup**
   - Create workspace
   - Go to Settings > Legal
   - Click "Create Default Set" (creates 7 legal policies)
   - Create your first store

3. **Configure Payments**
   - Update `.env` with production payment keys
   - Restart apps: `pm2 restart all`
   - Test payment flow

4. **Setup Monitoring**
   - Configure uptime monitoring (UptimeRobot, Pingdom)
   - Setup error tracking (Sentry - optional)
   - Enable analytics (Google Analytics, Meta Pixel)

5. **Team Onboarding**
   - Create user accounts
   - Assign roles and permissions
   - Train on key features

---

## 🎉 Success!

Your PixEcom v1.1 is now deployed and ready for production!

**Application**: https://yourdomain.com
**API**: https://yourdomain.com/api
**Health**: https://yourdomain.com/api/health

Happy selling! 🚀

---

**Last Updated**: 2024
**Version**: 1.1.0
**Author**: PixEcom Team
