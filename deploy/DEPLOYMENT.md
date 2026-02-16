# PixEcom v1.1 - VPS Deployment Guide

Complete guide for deploying PixEcom v1.1 to a production VPS.

---

## 📋 Prerequisites

### VPS Requirements
- **OS**: Ubuntu 22.04 LTS or later
- **RAM**: Minimum 2GB (4GB recommended)
- **CPU**: 2+ cores
- **Storage**: 20GB+ SSD
- **Network**: Public IP address with domain pointed to it

### Local Requirements
- Git access to your repository
- SSH access to your VPS
- Domain name with DNS configured

---

## 🚀 Quick Deployment (Automated)

### Option 1: Automated Script

1. **SSH into your VPS**:
```bash
ssh your-user@your-vps-ip
```

2. **Download and run deployment script**:
```bash
# Clone repository (or upload deployment files)
git clone <your-repo-url> /var/www/pixecom
cd /var/www/pixecom

# Make script executable
chmod +x deploy/deploy.sh

# Run deployment
./deploy/deploy.sh
```

The script will:
- ✅ Install all system dependencies
- ✅ Setup PostgreSQL and Redis
- ✅ Configure environment variables
- ✅ Build the application
- ✅ Run database migrations
- ✅ Setup PM2 process manager
- ✅ Configure Nginx reverse proxy
- ✅ Setup SSL with Let's Encrypt
- ✅ Configure automated backups

---

## 🔧 Manual Deployment (Step by Step)

### Step 1: Prepare VPS

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install dependencies
sudo apt install -y git build-essential postgresql postgresql-contrib redis-server nginx certbot python3-certbot-nginx

# Install pnpm
sudo npm install -g pnpm

# Install PM2
sudo npm install -g pm2
```

### Step 2: Setup PostgreSQL

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user (in psql shell)
CREATE DATABASE pixecom_production;
CREATE USER pixecom_prod WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE pixecom_production TO pixecom_prod;
ALTER DATABASE pixecom_production OWNER TO pixecom_prod;
\q
```

### Step 3: Setup Redis

```bash
# Start and enable Redis
sudo systemctl start redis
sudo systemctl enable redis

# Test Redis
redis-cli ping
# Should return: PONG
```

### Step 4: Clone Repository

```bash
# Create project directory
sudo mkdir -p /var/www/pixecom
sudo chown -R $USER:$USER /var/www/pixecom

# Clone repository
git clone <your-repo-url> /var/www/pixecom
cd /var/www/pixecom
```

### Step 5: Configure Environment

```bash
# Copy environment template
cp deploy/.env.production.example .env

# Generate secure secrets
openssl rand -hex 32  # For JWT_SECRET
openssl rand -hex 32  # For JWT_REFRESH_SECRET
openssl rand -hex 32  # For PAYMENT_ENCRYPTION_KEY

# Edit .env file
nano .env
```

**Update these critical values**:
```env
DATABASE_URL=postgresql://pixecom_prod:your_password@localhost:5432/pixecom_production
JWT_SECRET=<generated-secret-1>
JWT_REFRESH_SECRET=<generated-secret-2>
PAYMENT_ENCRYPTION_KEY=<generated-secret-3>
API_URL=https://api.yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Step 6: Install Dependencies & Build

```bash
# Install dependencies
pnpm install --frozen-lockfile

# Generate Prisma Client
cd apps/api
npx prisma generate
cd ../..

# Build application
pnpm build
```

### Step 7: Run Database Migrations

```bash
cd apps/api
npx prisma migrate deploy
cd ../..
```

### Step 8: Setup PM2

```bash
# Copy PM2 config
cp deploy/ecosystem.config.js .

# Create log directory
mkdir -p logs

# Start applications
pm2 start ecosystem.config.js

# Save PM2 config
pm2 save

# Enable PM2 on startup
pm2 startup
# Run the command that PM2 outputs
```

### Step 9: Configure Nginx

```bash
# Copy nginx config
sudo cp deploy/nginx-config.conf /etc/nginx/sites-available/pixecom

# Update domain name in config
sudo nano /etc/nginx/sites-available/pixecom
# Replace 'yourdomain.com' with your actual domain

# Enable site
sudo ln -s /etc/nginx/sites-available/pixecom /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 10: Setup SSL Certificate

```bash
# Get SSL certificate from Let's Encrypt
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### Step 11: Configure Firewall

```bash
# Setup UFW firewall
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### Step 12: Setup Automated Backups

```bash
# Copy backup script
sudo cp deploy/backup-pixecom.sh /usr/local/bin/
sudo chmod +x /usr/local/bin/backup-pixecom.sh

# Create backup directory
sudo mkdir -p /var/backups/pixecom

# Add to crontab (daily at 2 AM)
crontab -e
# Add this line:
0 2 * * * /usr/local/bin/backup-pixecom.sh >> /var/log/pixecom-backup.log 2>&1
```

---

## ✅ Post-Deployment Verification

### Check Services Status

```bash
# Check PM2 processes
pm2 status

# Check Nginx
sudo systemctl status nginx

# Check PostgreSQL
sudo systemctl status postgresql

# Check Redis
redis-cli ping
```

### Test Application

```bash
# Test API health endpoint
curl https://yourdomain.com/api/health

# Test frontend
curl https://yourdomain.com

# View application logs
pm2 logs
```

### Access Application

1. **Open Browser**: `https://yourdomain.com`
2. **Create Account**: Register your first user
3. **Create Workspace**: Setup your workspace
4. **Create Legal Set**: Go to Settings > Legal > Create Default Set
5. **Create Store**: Setup your first store
6. **Create Products**: Add products and sellpages

---

## 🔍 Monitoring & Maintenance

### View Logs

```bash
# PM2 logs (all apps)
pm2 logs

# API logs only
pm2 logs pixecom-api

# Web logs only
pm2 logs pixecom-web

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Nginx access logs
sudo tail -f /var/log/nginx/access.log
```

### PM2 Commands

```bash
# Status
pm2 status

# Restart all
pm2 restart all

# Restart specific app
pm2 restart pixecom-api

# Stop all
pm2 stop all

# Delete all processes
pm2 delete all

# Monitor resources
pm2 monit

# View details
pm2 show pixecom-api
```

### Database Backups

```bash
# Manual backup
sudo /usr/local/bin/backup-pixecom.sh

# View backups
ls -lh /var/backups/pixecom/

# Restore from backup
pg_dump pixecom_production < /var/backups/pixecom/db_TIMESTAMP.sql
```

### Update Application

```bash
cd /var/www/pixecom

# Pull latest changes
git pull

# Install new dependencies
pnpm install

# Run migrations
cd apps/api && npx prisma migrate deploy && cd ../..

# Rebuild
pnpm build

# Restart services
pm2 restart all
```

---

## 🛡️ Security Checklist

- ✅ Strong passwords for database
- ✅ Unique JWT secrets generated
- ✅ SSL certificate installed
- ✅ Firewall configured (UFW)
- ✅ Rate limiting enabled in Nginx
- ✅ Security headers configured
- ✅ Regular backups automated
- ⚠️ Setup fail2ban (optional)
- ⚠️ Enable 2FA for SSH (optional)
- ⚠️ Regular security updates

---

## 🚨 Troubleshooting

### Application Won't Start

```bash
# Check PM2 logs
pm2 logs --err

# Check environment variables
cat .env

# Verify database connection
cd apps/api && npx prisma db pull
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -h localhost -U pixecom_prod -d pixecom_production
```

### Nginx 502 Bad Gateway

```bash
# Check if apps are running
pm2 status

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Test upstream connections
curl http://localhost:3001/health
curl http://localhost:3000
```

### SSL Certificate Issues

```bash
# Renew certificate
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

### High Memory Usage

```bash
# Check memory usage
pm2 monit

# Reduce PM2 instances in ecosystem.config.js
# Change instances from 2 to 1 for each app

# Restart with new config
pm2 delete all
pm2 start ecosystem.config.js
pm2 save
```

---

## 📊 Performance Optimization

### Enable PM2 Log Rotation

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### PostgreSQL Optimization

```bash
sudo nano /etc/postgresql/14/main/postgresql.conf

# Recommended settings for 4GB RAM:
shared_buffers = 1GB
effective_cache_size = 3GB
maintenance_work_mem = 256MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 5242kB
min_wal_size = 1GB
max_wal_size = 4GB

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Redis Optimization

```bash
sudo nano /etc/redis/redis.conf

# Set max memory
maxmemory 256mb
maxmemory-policy allkeys-lru

# Restart Redis
sudo systemctl restart redis
```

---

## 🔄 Rollback Procedure

If deployment fails:

```bash
# Stop current version
pm2 stop all

# Restore database from backup
pg_restore -d pixecom_production /var/backups/pixecom/db_LATEST.sql

# Checkout previous version
git checkout <previous-commit>

# Rebuild
pnpm install
pnpm build

# Restart
pm2 restart all
```

---

## 📞 Support & Resources

- **Documentation**: Check `/docs` folder
- **Logs**: `/var/www/pixecom/logs`
- **Backups**: `/var/backups/pixecom`
- **Nginx Config**: `/etc/nginx/sites-available/pixecom`

---

## 🎉 Success!

Your PixEcom v1.1 application should now be running at:
- **Frontend**: https://yourdomain.com
- **API**: https://yourdomain.com/api
- **Health Check**: https://yourdomain.com/api/health

Enjoy your deployment! 🚀
