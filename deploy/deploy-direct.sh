#!/bin/bash

###############################################################################
# PixEcom v1.1 - Direct Deployment (No Git Required)
# Works with code already on VPS
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Config
PROJECT_DIR="/var/www/pixecom"
BACKUP_DIR="/var/backups/pixecom"
UPLOAD_DIR="$PROJECT_DIR/uploads"

print_info() { echo -e "${BLUE}ℹ${NC} $1"; }
print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
print_error() { echo -e "${RED}✗${NC} $1"; }
print_header() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  $1"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

print_header "PixEcom v1.1 Direct Deployment"

# Get database password
read -sp "Enter database password (the one you created earlier): " DB_PASS
echo ""

DB_NAME="pixecom_production"
DB_USER="pixecom_prod"
DOMAIN="pixecom.pixelxlab.com"
SSL_EMAIL="admin@pixelxlab.com"

# Step 1: Create .env files
print_header "Step 1: Creating Environment Files"

JWT_SECRET=$(openssl rand -base64 32)
REFRESH_SECRET=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -hex 32)

mkdir -p $PROJECT_DIR/apps/api
mkdir -p $PROJECT_DIR/apps/web

cat > $PROJECT_DIR/apps/api/.env << EOF
DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}?schema=public"
REDIS_HOST="localhost"
REDIS_PORT=6379
JWT_SECRET="${JWT_SECRET}"
JWT_EXPIRES_IN="7d"
REFRESH_TOKEN_SECRET="${REFRESH_SECRET}"
REFRESH_TOKEN_EXPIRES_IN="30d"
ENCRYPTION_KEY="${ENCRYPTION_KEY}"
NODE_ENV="production"
PORT=3001
API_URL="https://${DOMAIN}/api"
WEB_URL="https://${DOMAIN}"
CORS_ORIGIN="https://${DOMAIN}"
MAX_FILE_SIZE=10485760
UPLOAD_DIR="${UPLOAD_DIR}"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@${DOMAIN}"
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
PAYPAL_CLIENT_ID=""
PAYPAL_CLIENT_SECRET=""
EOF

cat > $PROJECT_DIR/apps/web/.env.production << EOF
NEXT_PUBLIC_API_URL=https://${DOMAIN}/api
NEXT_PUBLIC_WEB_URL=https://${DOMAIN}
EOF

print_success "Environment files created"

# Step 2: Install dependencies
print_header "Step 2: Installing Dependencies"
cd $PROJECT_DIR
npm install -g pnpm pm2
pnpm install
print_success "Dependencies installed"

# Step 3: Build
print_header "Step 3: Building Application"
cd $PROJECT_DIR/apps/api
pnpm prisma generate
pnpm prisma migrate deploy
pnpm build

cd $PROJECT_DIR/apps/web
pnpm build
print_success "Build complete"

# Step 4: PM2
print_header "Step 4: Starting with PM2"
cd $PROJECT_DIR
pm2 delete all 2>/dev/null || true
pm2 start deploy/ecosystem.config.js
pm2 save
pm2 startup | tail -n 1 | bash
print_success "PM2 configured"

# Step 5: Nginx
print_header "Step 5: Configuring Nginx"
cat > /etc/nginx/sites-available/pixecom << 'NGINX_EOF'
server {
    listen 80;
    server_name pixecom.pixelxlab.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads {
        alias /var/www/pixecom/uploads;
        expires 30d;
    }
}
NGINX_EOF

ln -sf /etc/nginx/sites-available/pixecom /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx
print_success "Nginx configured"

# Step 6: SSL
print_header "Step 6: Setting Up SSL"
certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email $SSL_EMAIL
print_success "SSL installed"

# Step 7: Firewall
print_header "Step 7: Configuring Firewall"
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
print_success "Firewall configured"

print_header "Deployment Complete!"
echo ""
echo "🌐 Your app: https://$DOMAIN"
echo "📊 Check status: pm2 status"
echo "📝 View logs: pm2 logs"
echo ""
print_success "Deployment finished!"
