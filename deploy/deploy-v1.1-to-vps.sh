#!/bin/bash

###############################################################################
# PixEcom v1.1 - Complete VPS Deployment Script
# Domain: pixecom.pixelxlab.com
# This script will backup existing deployment and deploy fresh v1.1
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="pixecom.pixelxlab.com"
SSL_EMAIL="admin@pixelxlab.com"
REPO_URL="https://github.com/minhtm92-gif/PixEcom.git"
REPO_BRANCH="deployment/v1.1.0"
INSTALL_PATH="/var/www/pixecom"
BACKUP_DIR="/var/backups/pixecom-old"
DB_NAME="pixecom_production"
DB_USER="pixecom_prod"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo ""
    echo "=========================================="
    echo "$1"
    echo "=========================================="
    echo ""
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    log_error "Please run as root (use sudo)"
    exit 1
fi

print_header "PixEcom v1.1 Deployment Started"

log_info "Domain: $DOMAIN"
log_info "Repository: $REPO_URL"
log_info "Branch: $REPO_BRANCH"
log_info "Installation Path: $INSTALL_PATH"

echo ""
read -p "Continue with deployment? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_warning "Deployment cancelled"
    exit 0
fi

###############################################################################
# STEP 1: BACKUP EXISTING DEPLOYMENT
###############################################################################

print_header "STEP 1: Backup Existing Deployment"

log_info "Creating backup directory..."
mkdir -p "$BACKUP_DIR"

if [ -d "$INSTALL_PATH" ]; then
    BACKUP_TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_PATH="$BACKUP_DIR/pixecom-backup-$BACKUP_TIMESTAMP"

    log_info "Backing up existing deployment to $BACKUP_PATH..."
    cp -r "$INSTALL_PATH" "$BACKUP_PATH"
    log_success "Code backup completed"

    # Backup database
    log_info "Backing up database..."
    if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
        sudo -u postgres pg_dump "$DB_NAME" > "$BACKUP_DIR/db-backup-$BACKUP_TIMESTAMP.sql"
        gzip "$BACKUP_DIR/db-backup-$BACKUP_TIMESTAMP.sql"
        log_success "Database backup completed"
    else
        log_warning "No existing database found to backup"
    fi

    # List backups
    log_info "Backup contents:"
    ls -lh "$BACKUP_DIR"
else
    log_warning "No existing deployment found at $INSTALL_PATH"
fi

###############################################################################
# STEP 2: STOP EXISTING SERVICES
###############################################################################

print_header "STEP 2: Stop Existing Services"

log_info "Stopping PM2 processes..."
pm2 stop all 2>/dev/null || log_warning "No PM2 processes running"
pm2 delete all 2>/dev/null || log_warning "No PM2 processes to delete"
log_success "PM2 processes stopped"

###############################################################################
# STEP 3: REMOVE OLD DEPLOYMENT
###############################################################################

print_header "STEP 3: Remove Old Deployment"

if [ -d "$INSTALL_PATH" ]; then
    log_info "Removing old deployment directory..."
    rm -rf "$INSTALL_PATH"
    log_success "Old deployment removed"
fi

###############################################################################
# STEP 4: CLONE FRESH V1.1
###############################################################################

print_header "STEP 4: Clone Fresh v1.1 from GitHub"

log_info "Cloning repository..."
git clone -b "$REPO_BRANCH" "$REPO_URL" "$INSTALL_PATH"
log_success "Repository cloned successfully"

cd "$INSTALL_PATH"
log_info "Current directory: $(pwd)"
log_info "Branch: $(git branch --show-current)"

###############################################################################
# STEP 5: RUN AUTOMATED DEPLOYMENT SCRIPT
###############################################################################

print_header "STEP 5: Run Automated Deployment Script"

log_info "Making deployment script executable..."
chmod +x deploy/deploy.sh

log_warning "The deployment script will now prompt you for:"
log_warning "1. Database Password (create a new secure password)"
log_warning "2. Domain Name (will suggest: $DOMAIN)"
log_warning "3. SSL Email (will suggest: $SSL_EMAIL)"
log_warning "4. Setup SSL? (type 'y')"
log_warning "5. Setup Firewall? (type 'y')"

echo ""
read -p "Ready to start automated deployment? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_warning "Deployment paused. To continue manually, run:"
    log_warning "cd $INSTALL_PATH && ./deploy/deploy.sh"
    exit 0
fi

log_info "Starting automated deployment..."
./deploy/deploy.sh

###############################################################################
# STEP 6: VERIFY DEPLOYMENT
###############################################################################

print_header "STEP 6: Verify Deployment"

log_info "Checking PM2 processes..."
pm2 status

log_info "Checking services..."
systemctl status nginx --no-pager | head -5
systemctl status postgresql --no-pager | head -5

log_info "Testing API health..."
sleep 3
API_HEALTH=$(curl -s http://localhost:3001/api/health || echo "FAILED")
if [[ $API_HEALTH == *"ok"* ]] || [[ $API_HEALTH == *"healthy"* ]]; then
    log_success "API is healthy"
else
    log_warning "API health check returned: $API_HEALTH"
fi

log_info "Testing frontend..."
FRONTEND_TEST=$(curl -s http://localhost:3000 | head -1)
if [[ -n "$FRONTEND_TEST" ]]; then
    log_success "Frontend is responding"
else
    log_warning "Frontend is not responding"
fi

###############################################################################
# DEPLOYMENT COMPLETE
###############################################################################

print_header "Deployment Complete!"

echo ""
log_success "PixEcom v1.1 has been deployed successfully!"
echo ""
echo "🌐 Your application should be available at:"
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
echo "   $(ls -lh $BACKUP_DIR 2>/dev/null | tail -n +2 | wc -l) backup(s) available"
echo ""
echo "✅ Next Steps:"
echo "   1. Visit https://$DOMAIN"
echo "   2. Register first admin user"
echo "   3. Create workspace"
echo "   4. Go to Settings > Legal > Click 'Create Default Set'"
echo "   5. Create store"
echo "   6. Start selling!"
echo ""
echo "📚 Documentation:"
echo "   - Full Guide: $INSTALL_PATH/deploy/DEPLOYMENT.md"
echo "   - Troubleshooting: $INSTALL_PATH/deploy/README.md"
echo ""
log_success "Deployment completed at $(date)"
echo ""
