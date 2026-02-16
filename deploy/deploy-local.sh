#!/bin/bash

###############################################################################
# PixEcom v1.1 - Local VPS Deployment Script
# Works with code already on the VPS (no git clone needed)
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/var/www/pixecom"
BACKUP_DIR="/var/backups/pixecom"
UPLOAD_DIR="$PROJECT_DIR/uploads"

# Functions
print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_header() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  $1"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_error "Please do not run this script as root. Use a sudo user instead."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "$PROJECT_DIR/package.json" ]; then
    print_error "Project not found at $PROJECT_DIR"
    exit 1
fi

print_header "PixEcom v1.1 Local Deployment"
echo ""

# Step 1: Get configuration
print_header "Step 1: Configuration"

read -p "Enter PostgreSQL database name [pixecom_production]: " DB_NAME
DB_NAME=${DB_NAME:-pixecom_production}

read -p "Enter PostgreSQL username [pixecom_prod]: " DB_USER
DB_USER=${DB_USER:-pixecom_prod}

read -sp "Enter PostgreSQL password: " DB_PASS
echo ""

read -p "Enter domain name [pixecom.pixelxlab.com]: " DOMAIN
DOMAIN=${DOMAIN:-pixecom.pixelxlab.com}

read -p "Enter SSL email [admin@pixelxlab.com]: " SSL_EMAIL
SSL_EMAIL=${SSL_EMAIL:-admin@pixelxlab.com}

print_success "Configuration collected"
echo ""

# Step 2: Create Environment File
print_header "Step 2: Creating Environment Configuration"

# Generate secrets
JWT_SECRET=$(openssl rand -base64 32)
REFRESH_SECRET=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -hex 32)

cat > $PROJECT_DIR/apps/api/.env << EOF
# Database
DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}?schema=public"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379

# JWT
JWT_SECRET="${JWT_SECRET}"
JWT_EXPIRES_IN="7d"
REFRESH_TOKEN_SECRET="${REFRESH_SECRET}"
REFRESH_TOKEN_EXPIRES_IN="30d"

# Encryption
ENCRYPTION_KEY="${ENCRYPTION_KEY}"

# Server
NODE_ENV="production"
PORT=3001
API_URL="https://${DOMAIN}/api"
WEB_URL="https://${DOMAIN}"

# CORS
CORS_ORIGIN="https://${DOMAIN}"

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR="${UPLOAD_DIR}"

# Email (Configure with your SMTP provider)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@${DOMAIN}"

# Payment Gateways (Add your keys)
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
echo ""

# Step 3: Install Dependencies
print_header "Step 3: Installing Dependencies"

cd $PROJECT_DIR
print_info "Installing pnpm globally..."
sudo npm install -g pnpm

print_info "Installing project dependencies..."
pnpm install

print_success "Dependencies installed"
echo ""

# Step 4: Build Applications
print_header "Step 4: Building Applications"

print_info "Generating Prisma client..."
cd $PROJECT_DIR/apps/api
pnpm prisma generate

print_info "Running database migrations..."
pnpm prisma migrate deploy

print_info "Building API..."
cd $PROJECT_DIR/apps/api
pnpm build

print_info "Building Web..."
cd $PROJECT_DIR/apps/web
pnpm build

print_success "Applications built successfully"
echo ""

# Step 5: Setup PM2
print_header "Step 5: Setting Up Process Manager (PM2)"

print_info "Installing PM2..."
sudo npm install -g pm2

print_info "Starting applications with PM2..."
cd $PROJECT_DIR
pm2 delete all 2>/dev/null || true
pm2 start deploy/ecosystem.config.js
pm2 save
pm2 startup | tail -n 1 | sudo bash

print_success "PM2 configured"
echo ""

# Step 6: Configure Nginx
print_header "Step 6: Configuring Nginx"

sudo tee /etc/nginx/sites-available/pixecom << EOF
server {
    listen 80;
    server_name ${DOMAIN};

    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=api_limit:10m rate=100r/m;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # API
    location /api {
        limit_req zone=api_limit burst=20 nodelay;
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Uploads
    location /uploads {
        alias ${UPLOAD_DIR};
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/pixecom /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

print_success "Nginx configured"
echo ""

# Step 7: Setup SSL
print_header "Step 7: Setting Up SSL Certificate"

read -p "Setup SSL certificate with Let's Encrypt? (y/n): " SETUP_SSL
if [[ $SETUP_SSL =~ ^[Yy]$ ]]; then
    sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email $SSL_EMAIL
    print_success "SSL certificate installed"
else
    print_warning "Skipping SSL setup"
fi
echo ""

# Step 8: Setup Firewall
print_header "Step 8: Configuring Firewall"

read -p "Configure UFW firewall? (y/n): " SETUP_FIREWALL
if [[ $SETUP_FIREWALL =~ ^[Yy]$ ]]; then
    sudo ufw allow OpenSSH
    sudo ufw allow 'Nginx Full'
    sudo ufw --force enable
    print_success "Firewall configured"
else
    print_warning "Skipping firewall setup"
fi
echo ""

# Step 9: Setup Backups
print_header "Step 9: Setting Up Automated Backups"

sudo mkdir -p $BACKUP_DIR
sudo cp $PROJECT_DIR/deploy/backup-pixecom.sh /usr/local/bin/
sudo chmod +x /usr/local/bin/backup-pixecom.sh

# Add cron job
(sudo crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-pixecom.sh") | sudo crontab -

print_success "Backup system configured"
echo ""

# Deployment Complete
print_header "Deployment Complete!"

echo ""
print_success "PixEcom v1.1 has been deployed successfully!"
echo ""
echo "🌐 Your application is available at:"
echo "   https://$DOMAIN"
echo ""
echo "📊 Quick Status Check:"
echo "   pm2 status          # Check PM2 processes"
echo "   pm2 logs            # View application logs"
echo "   pm2 monit           # Real-time monitoring"
echo ""
echo "🔐 SSL Certificate:"
echo "   sudo certbot certificates"
echo ""
echo "📦 Backups:"
echo "   Location: $BACKUP_DIR"
echo ""
echo "✅ Next Steps:"
echo "   1. Visit https://$DOMAIN"
echo "   2. Register first admin user"
echo "   3. Create workspace"
echo "   4. Go to Settings > Legal > Click 'Create Default Set'"
echo "   5. Create store"
echo "   6. Start selling!"
echo ""
print_success "Deployment completed at $(date)"
echo ""
