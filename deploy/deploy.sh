#!/bin/bash

###############################################################################
# PixEcom v1.1 VPS Deployment Script
# This script automates the deployment process to a production VPS
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="pixecom"
PROJECT_DIR="/var/www/pixecom"
BACKUP_DIR="/var/backups/pixecom"
LOG_DIR="$PROJECT_DIR/logs"
UPLOAD_DIR="$PROJECT_DIR/uploads"

# Functions
print_header() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_error "Please do not run this script as root. Use a sudo user instead."
    exit 1
fi

print_header "PixEcom v1.1 Deployment"
echo ""

# Step 1: System Dependencies
print_header "Step 1: Installing System Dependencies"
sudo apt update
sudo apt install -y curl git build-essential postgresql postgresql-contrib redis-server nginx certbot python3-certbot-nginx

# Install Node.js 20.x
if ! command -v node &> /dev/null; then
    print_info "Installing Node.js 20.x..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi

# Install pnpm
if ! command -v pnpm &> /dev/null; then
    print_info "Installing pnpm..."
    sudo npm install -g pnpm
fi

# Install PM2
if ! command -v pm2 &> /dev/null; then
    print_info "Installing PM2..."
    sudo npm install -g pm2
    sudo pm2 install pm2-logrotate
    sudo pm2 set pm2-logrotate:max_size 10M
    sudo pm2 set pm2-logrotate:retain 7
fi

print_success "System dependencies installed"
echo ""

# Step 2: Create Directories
print_header "Step 2: Creating Project Directories"
sudo mkdir -p $PROJECT_DIR
sudo mkdir -p $BACKUP_DIR
sudo mkdir -p $LOG_DIR
sudo mkdir -p $UPLOAD_DIR
sudo mkdir -p /var/www/certbot

sudo chown -R $USER:$USER $PROJECT_DIR
sudo chown -R $USER:$USER $BACKUP_DIR
sudo chmod -R 755 $UPLOAD_DIR

print_success "Directories created"
echo ""

# Step 3: Database Setup
print_header "Step 3: Setting Up PostgreSQL Database"

read -p "Enter PostgreSQL database name [pixecom_production]: " DB_NAME
DB_NAME=${DB_NAME:-pixecom_production}

read -p "Enter PostgreSQL username [pixecom_prod]: " DB_USER
DB_USER=${DB_USER:-pixecom_prod}

read -sp "Enter PostgreSQL password: " DB_PASS
echo ""

sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || print_warning "Database already exists"
sudo -u postgres psql -c "CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASS';" 2>/dev/null || print_warning "User already exists"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
sudo -u postgres psql -c "ALTER DATABASE $DB_NAME OWNER TO $DB_USER;"

print_success "Database configured"
echo ""

# Step 4: Redis Setup
print_header "Step 4: Configuring Redis"
sudo systemctl start redis-server || print_warning "Redis already running"
sudo systemctl enable redis-server || print_warning "Redis already enabled"
print_success "Redis configured"
echo ""

# Step 5: Clone/Update Repository
print_header "Step 5: Deploying Application Code"

if [ -d "$PROJECT_DIR/.git" ]; then
    print_info "Updating existing repository..."
    cd $PROJECT_DIR
    git pull
else
    print_info "Please enter your repository URL:"
    read -p "Git Repository URL: " REPO_URL

    if [ -z "$REPO_URL" ]; then
        print_error "Repository URL is required"
        exit 1
    fi

    sudo rm -rf $PROJECT_DIR/*
    git clone $REPO_URL $PROJECT_DIR
    cd $PROJECT_DIR
fi

print_success "Code deployed"
echo ""

# Step 6: Environment Configuration
print_header "Step 6: Configuring Environment Variables"

if [ ! -f ".env" ]; then
    print_info "Creating .env file from template..."
    cp deploy/.env.production.example .env

    # Generate secure secrets
    JWT_SECRET=$(openssl rand -hex 32)
    JWT_REFRESH_SECRET=$(openssl rand -hex 32)
    PAYMENT_KEY=$(openssl rand -hex 32)

    # Update .env with generated values
    sed -i "s|DATABASE_URL=.*|DATABASE_URL=postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME|" .env
    sed -i "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" .env
    sed -i "s|JWT_REFRESH_SECRET=.*|JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET|" .env
    sed -i "s|PAYMENT_ENCRYPTION_KEY=.*|PAYMENT_ENCRYPTION_KEY=$PAYMENT_KEY|" .env
    sed -i "s|UPLOAD_DIR=.*|UPLOAD_DIR=$UPLOAD_DIR|" .env
    sed -i "s|LOG_DIR=.*|LOG_DIR=$LOG_DIR|" .env

    print_warning "Please edit .env file and update:"
    print_warning "  - API_URL and NEXT_PUBLIC_API_URL with your domain"
    print_warning "  - NEXT_PUBLIC_APP_URL with your domain"
    print_warning "  - Payment gateway credentials (Stripe, PayPal, etc.)"

    read -p "Press Enter after editing .env file..."
else
    print_info ".env file already exists"
fi

print_success "Environment configured"
echo ""

# Step 7: Install Dependencies
print_header "Step 7: Installing Project Dependencies"
pnpm install --frozen-lockfile
print_success "Dependencies installed"
echo ""

# Step 8: Build Application
print_header "Step 8: Building Application"

# Generate Prisma Client
cd apps/api
npx prisma generate
cd ../..

# Build all apps
pnpm build

print_success "Application built"
echo ""

# Step 9: Database Migration
print_header "Step 9: Running Database Migrations"
cd apps/api
npx prisma migrate deploy
cd ../..
print_success "Migrations completed"
echo ""

# Step 10: PM2 Setup
print_header "Step 10: Configuring PM2 Process Manager"

# Copy ecosystem config
cp deploy/ecosystem.config.js .

# Stop existing processes
pm2 delete all 2>/dev/null || true

# Start applications
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp /home/$USER

print_success "PM2 configured"
echo ""

# Step 11: Nginx Setup
print_header "Step 11: Configuring Nginx"

read -p "Enter your domain name (e.g., example.com): " DOMAIN

if [ -z "$DOMAIN" ]; then
    print_error "Domain name is required"
    exit 1
fi

# Update nginx config with domain
sudo cp deploy/nginx-config.conf /etc/nginx/sites-available/pixecom
sudo sed -i "s|yourdomain.com|$DOMAIN|g" /etc/nginx/sites-available/pixecom

# Enable site
sudo ln -sf /etc/nginx/sites-available/pixecom /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx config
sudo nginx -t

if [ $? -eq 0 ]; then
    sudo systemctl restart nginx
    print_success "Nginx configured"
else
    print_error "Nginx configuration error. Please check the config."
    exit 1
fi

echo ""

# Step 12: SSL Certificate
print_header "Step 12: Setting Up SSL Certificate"

read -p "Do you want to setup SSL with Let's Encrypt? (y/n): " SETUP_SSL

if [ "$SETUP_SSL" = "y" ] || [ "$SETUP_SSL" = "Y" ]; then
    read -p "Enter your email for Let's Encrypt: " EMAIL

    sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $EMAIL

    if [ $? -eq 0 ]; then
        print_success "SSL certificate installed"
    else
        print_warning "SSL setup failed. You can run 'sudo certbot --nginx' manually later."
    fi
fi

echo ""

# Step 13: Firewall Setup
print_header "Step 13: Configuring Firewall"

read -p "Do you want to configure UFW firewall? (y/n): " SETUP_FW

if [ "$SETUP_FW" = "y" ] || [ "$SETUP_FW" = "Y" ]; then
    sudo ufw allow 22/tcp
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw --force enable
    print_success "Firewall configured"
fi

echo ""

# Step 14: Setup Backup Cron
print_header "Step 14: Setting Up Automated Backups"

# Create backup script
cat > /tmp/backup-pixecom.sh << 'BACKUP_SCRIPT'
#!/bin/bash
BACKUP_DIR="/var/backups/pixecom"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Database backup
pg_dump pixecom_production > $BACKUP_DIR/db_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "db_*.sql" -mtime +7 -delete

echo "Backup completed: $DATE"
BACKUP_SCRIPT

sudo mv /tmp/backup-pixecom.sh /usr/local/bin/backup-pixecom.sh
sudo chmod +x /usr/local/bin/backup-pixecom.sh

# Update database name in backup script
sudo sed -i "s|pixecom_production|$DB_NAME|" /usr/local/bin/backup-pixecom.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-pixecom.sh >> /var/log/pixecom-backup.log 2>&1") | crontab -

print_success "Backup cron configured (runs daily at 2 AM)"
echo ""

# Final Status Check
print_header "Deployment Status"

echo ""
print_info "Checking services..."

# Check PM2
if pm2 status | grep -q "online"; then
    print_success "PM2 processes running"
else
    print_error "PM2 processes not running properly"
fi

# Check Nginx
if sudo systemctl is-active --quiet nginx; then
    print_success "Nginx is running"
else
    print_error "Nginx is not running"
fi

# Check PostgreSQL
if sudo systemctl is-active --quiet postgresql; then
    print_success "PostgreSQL is running"
else
    print_error "PostgreSQL is not running"
fi

# Check Redis
if sudo systemctl is-active --quiet redis; then
    print_success "Redis is running"
else
    print_error "Redis is not running"
fi

echo ""
print_header "Deployment Complete!"

echo ""
print_success "PixEcom v1.1 has been deployed successfully!"
echo ""
print_info "Access your application:"
echo "  🌐 Frontend: https://$DOMAIN"
echo "  🔌 API: https://$DOMAIN/api"
echo "  📊 PM2 Dashboard: pm2 monit"
echo ""
print_info "Useful commands:"
echo "  • View logs: pm2 logs"
echo "  • Restart apps: pm2 restart all"
echo "  • Check status: pm2 status"
echo "  • Nginx logs: sudo tail -f /var/log/nginx/error.log"
echo ""
print_warning "Next steps:"
echo "  1. Update payment gateway credentials in .env"
echo "  2. Test the application thoroughly"
echo "  3. Create your first workspace and store"
echo "  4. Setup monitoring (optional)"
echo ""

exit 0
