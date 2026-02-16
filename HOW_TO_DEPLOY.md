# 🚀 How to Deploy PixEcom v1.1 to VPS

## Quick Instructions

### Step 1: Copy the deployment script to your VPS

Open a terminal on your local machine and run:

```bash
scp deploy/deploy-v1.1-to-vps.sh root@178.128.222.100:/root/
```

**Password**: Use the VPS root password you have

---

### Step 2: SSH to your VPS

```bash
ssh root@178.128.222.100
```

---

### Step 3: Run the deployment script

```bash
chmod +x /root/deploy-v1.1-to-vps.sh
/root/deploy-v1.1-to-vps.sh
```

---

### Step 4: Answer the prompts

The script will automatically:
- ✅ Backup existing deployment
- ✅ Clone fresh v1.1 from GitHub
- ✅ Run automated deployment

You'll be prompted for:
1. **Database Password**: Create a new secure password (save it!)
2. **Domain**: `pixecom.pixelxlab.com` (press Enter)
3. **SSL Email**: `admin@pixelxlab.com` (or your email)
4. **Setup SSL?**: `y`
5. **Setup Firewall?**: `y`

---

### Step 5: Wait for completion

The deployment takes **15-20 minutes**.

---

### Step 6: Verify deployment

After completion:

```bash
pm2 status              # Check if apps are running
pm2 logs                # View logs
```

Visit: **https://pixecom.pixelxlab.com**

---

## Post-Deployment Steps

1. ✅ Register first admin user
2. ✅ Create workspace
3. ✅ Go to **Settings > Legal**
4. ✅ Click **"Create Default Set"** (creates 7 legal policies)
5. ✅ Create store
6. ✅ Create product
7. ✅ Create sellpage
8. ✅ Test QR code
9. ✅ Toggle dark mode

---

## Troubleshooting

If anything goes wrong:

```bash
# View error logs
pm2 logs --err

# Restart services
pm2 restart all

# Check Nginx
sudo systemctl status nginx

# Check database
sudo systemctl status postgresql

# Restore from backup
ls -lh /var/backups/pixecom-old/
```

---

## ⚡ Alternative: One-Command Deployment

If you prefer to run commands manually instead of using the script:

```bash
ssh root@178.128.222.100

# Then run this single command:
git clone -b deployment/v1.1.0 https://github.com/minhtm92-gif/PixEcom.git /var/www/pixecom && \
cd /var/www/pixecom && \
chmod +x deploy/deploy.sh && \
./deploy/deploy.sh
```

Answer the prompts as described in Step 4 above.

---

**That's it! Your PixEcom v1.1 will be deployed automatically.** 🎉
