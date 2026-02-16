# 🚀 PixEcom v1.1 - Quick Deployment Checklist

## Pre-Deployment Preparation

### Local Setup
- [ ] Commit all local changes to Git
- [ ] Push to remote repository
- [ ] Tag release version: `git tag v1.1.0`
- [ ] Push tags: `git push --tags`

### VPS Requirements
- [ ] Ubuntu 22.04 LTS server
- [ ] 2GB+ RAM, 2+ CPU cores
- [ ] 20GB+ storage
- [ ] Root or sudo access
- [ ] Domain name configured (A record pointing to VPS IP)

### Credentials Needed
- [ ] VPS SSH access (user + password/key)
- [ ] Domain name
- [ ] Email for SSL certificate
- [ ] Database password (will create)
- [ ] Stripe production keys (optional)
- [ ] PayPal production keys (optional)

---

## Deployment Steps

### 1. Initial VPS Setup ✅
```bash
ssh your-user@your-vps-ip
```

- [ ] Update system: `sudo apt update && sudo apt upgrade -y`
- [ ] Install Node.js 20.x
- [ ] Install PostgreSQL, Redis, Nginx
- [ ] Install pnpm and PM2 globally

### 2. Database Configuration ✅
- [ ] Create PostgreSQL database
- [ ] Create database user with password
- [ ] Grant all privileges
- [ ] Start and enable Redis

### 3. Application Deployment ✅
- [ ] Clone repository to `/var/www/pixecom`
- [ ] Create `.env` from template
- [ ] Generate JWT secrets (3x `openssl rand -hex 32`)
- [ ] Update `.env` with database credentials
- [ ] Update `.env` with domain URLs
- [ ] Install dependencies: `pnpm install`
- [ ] Generate Prisma client
- [ ] Build application: `pnpm build`
- [ ] Run migrations: `npx prisma migrate deploy`

### 4. Process Manager ✅
- [ ] Copy `ecosystem.config.js`
- [ ] Create log directory
- [ ] Start with PM2: `pm2 start ecosystem.config.js`
- [ ] Save PM2 config: `pm2 save`
- [ ] Enable PM2 startup: `pm2 startup`
- [ ] Verify running: `pm2 status`

### 5. Web Server ✅
- [ ] Copy Nginx config to `/etc/nginx/sites-available/pixecom`
- [ ] Update domain name in config
- [ ] Enable site (symlink to sites-enabled)
- [ ] Remove default site
- [ ] Test config: `sudo nginx -t`
- [ ] Restart Nginx: `sudo systemctl restart nginx`

### 6. SSL Certificate ✅
- [ ] Run Certbot: `sudo certbot --nginx -d yourdomain.com`
- [ ] Test auto-renewal: `sudo certbot renew --dry-run`
- [ ] Verify HTTPS works

### 7. Security ✅
- [ ] Configure UFW firewall (ports 22, 80, 443)
- [ ] Enable firewall: `sudo ufw enable`
- [ ] Verify environment secrets are unique
- [ ] Test rate limiting

### 8. Backups ✅
- [ ] Copy backup script to `/usr/local/bin/`
- [ ] Make executable: `chmod +x`
- [ ] Create backup directory
- [ ] Add cron job (daily at 2 AM)
- [ ] Test manual backup

### 9. Monitoring ✅
- [ ] Install PM2 log rotation
- [ ] Configure log retention (7 days)
- [ ] Test PM2 logs: `pm2 logs`
- [ ] Check Nginx logs

---

## Verification Tests

### Application Health
- [ ] API health check: `curl https://yourdomain.com/api/health`
- [ ] Frontend loads: `curl https://yourdomain.com`
- [ ] HTTPS redirect works
- [ ] PM2 shows both apps online: `pm2 status`

### Service Status
- [ ] PostgreSQL running: `sudo systemctl status postgresql`
- [ ] Redis running: `redis-cli ping`
- [ ] Nginx running: `sudo systemctl status nginx`
- [ ] PM2 processes healthy: `pm2 monit`

### Functionality Tests
- [ ] Open app in browser: `https://yourdomain.com`
- [ ] Register new user account
- [ ] Create workspace
- [ ] Go to Settings > Legal
- [ ] Click "Create Default Set" (creates 7 legal policies)
- [ ] Create new store
- [ ] Upload product image
- [ ] Create product
- [ ] Create sellpage
- [ ] Generate QR code
- [ ] Test UTM link generator
- [ ] Test dark mode toggle

### Security Checks
- [ ] HTTP redirects to HTTPS
- [ ] SSL certificate valid
- [ ] Security headers present (inspect network tab)
- [ ] Rate limiting works (test with rapid requests)
- [ ] CORS configured properly

---

## Post-Deployment Tasks

### Configuration
- [ ] Update payment gateway credentials in `.env`
- [ ] Configure SMTP for emails (if needed)
- [ ] Set up Google Analytics (optional)
- [ ] Set up Meta Pixel (optional)

### Documentation
- [ ] Document server IP and credentials
- [ ] Save database password securely
- [ ] Note SSL renewal date
- [ ] Document any custom configurations

### Team Setup
- [ ] Share production URL with team
- [ ] Create admin user accounts
- [ ] Configure workspace permissions
- [ ] Set up stores and products

### Monitoring
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
- [ ] Configure error tracking (Sentry, optional)
- [ ] Set up log aggregation (optional)

---

## Common Issues & Quick Fixes

### App Won't Start
```bash
# Check logs
pm2 logs --err

# Verify .env file
cat .env | grep -E 'DATABASE_URL|JWT_SECRET'

# Restart
pm2 restart all
```

### Database Connection Failed
```bash
# Test connection
psql -h localhost -U pixecom_prod -d pixecom_production

# Check PostgreSQL is running
sudo systemctl status postgresql
```

### 502 Bad Gateway
```bash
# Check if apps are running
pm2 status

# Test upstream
curl http://localhost:3001/health
curl http://localhost:3000

# Restart apps
pm2 restart all
```

### SSL Issues
```bash
# Renew certificate
sudo certbot renew

# Check status
sudo certbot certificates
```

---

## Useful Commands Reference

### PM2
```bash
pm2 status              # Check status
pm2 logs                # View logs
pm2 monit               # Monitor resources
pm2 restart all         # Restart all apps
pm2 restart pixecom-api # Restart API only
pm2 stop all            # Stop all
```

### Nginx
```bash
sudo nginx -t                          # Test config
sudo systemctl restart nginx           # Restart
sudo tail -f /var/log/nginx/error.log # View errors
```

### Database
```bash
# Backup
sudo -u postgres pg_dump pixecom_production > backup.sql

# Restore
sudo -u postgres psql pixecom_production < backup.sql

# Access database
psql -h localhost -U pixecom_prod -d pixecom_production
```

### Logs
```bash
# Application logs
pm2 logs

# Nginx access
sudo tail -f /var/log/nginx/access.log

# Nginx errors
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -xe
```

---

## Rollback Procedure

If something goes wrong:

1. **Stop current version**
```bash
pm2 stop all
```

2. **Restore database**
```bash
psql -U pixecom_prod pixecom_production < /var/backups/pixecom/db_LATEST.sql
```

3. **Checkout previous version**
```bash
cd /var/www/pixecom
git checkout <previous-commit>
pnpm install
pnpm build
```

4. **Restart**
```bash
pm2 restart all
```

---

## Success Criteria

✅ All services running (PM2, Nginx, PostgreSQL, Redis)
✅ Application accessible via HTTPS
✅ SSL certificate valid
✅ Database migrations completed
✅ Legal sets created successfully
✅ Product images upload working
✅ Backups configured
✅ Logs accessible
✅ No errors in PM2 logs
✅ Frontend and API both responsive

---

## Next Steps After Deployment

1. **Test thoroughly** - Create test orders, products, sellpages
2. **Configure payments** - Add Stripe/PayPal production keys
3. **Setup monitoring** - UptimeRobot, error tracking
4. **Train team** - Onboard users, create documentation
5. **Go live** - Announce to customers!

---

## 📞 Emergency Contacts

- **VPS Provider**: [Your hosting provider support]
- **Domain Registrar**: [Your domain registrar]
- **Developer**: [Your contact info]

---

**Deployment Date**: _______________
**Deployed By**: _______________
**Version**: v1.1.0
**Server IP**: _______________
**Domain**: _______________

---

## 🎉 Deployment Complete!

Your PixEcom v1.1 is now live and ready to process orders!

**Access your store at**: https://yourdomain.com
**API endpoint**: https://yourdomain.com/api
**Admin panel**: https://yourdomain.com/admin

Happy selling! 🚀
