# 🚀 PixEcom v1.1.0 - Quick Deploy Guide

**Version**: 1.1.0
**Status**: ✅ Production Ready
**Repository**: https://github.com/minhtm92-gif/PixEcom.git
**Branch**: deployment/v1.1.0

---

## ⚡ Quick Deploy (15-20 minutes)

### Prerequisites
- Ubuntu 22.04 VPS (2GB+ RAM, 2+ CPU cores)
- Domain name with DNS configured
- Email for SSL certificate

### One-Command Deployment

```bash
# SSH to your VPS
ssh your-user@your-vps-ip

# Clone and deploy
git clone -b deployment/v1.1.0 https://github.com/minhtm92-gif/PixEcom.git /var/www/pixecom && \
cd /var/www/pixecom && \
chmod +x deploy/deploy.sh && \
./deploy/deploy.sh
```

The script will guide you through the rest!

---

## 📋 What You'll Be Prompted For

1. **Database Password** - Type a secure password
2. **Domain Name** - Your domain (e.g., yourdomain.com)
3. **SSL Email** - Your email address
4. **Setup SSL?** - Type `y`
5. **Setup Firewall?** - Type `y`

---

## ✅ After Deployment

Visit: https://yourdomain.com

1. Register first admin user
2. Create workspace
3. Settings > Legal > "Create Default Set"
4. Create store
5. Start selling!

---

## 🔧 Quick Commands

```bash
pm2 status          # Check status
pm2 logs            # View logs
pm2 restart all     # Restart
```

---

**Ready to deploy? Just run the command above!** 🚀
