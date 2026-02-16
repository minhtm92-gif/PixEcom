#!/bin/bash

###############################################################################
# PixEcom Automated Backup Script
# Runs daily via cron to backup database and files
###############################################################################

set -e

# Configuration
BACKUP_DIR="/var/backups/pixecom"
PROJECT_DIR="/var/www/pixecom"
DB_NAME="pixecom_production"
RETENTION_DAYS=7
DATE=$(date +%Y%m%d_%H%M%S)
LOG_FILE="/var/log/pixecom-backup.log"

# Functions
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

error_exit() {
    log "ERROR: $1"
    exit 1
}

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR" || error_exit "Failed to create backup directory"

log "Starting backup process..."

# Backup Database
log "Backing up database: $DB_NAME"
pg_dump "$DB_NAME" > "$BACKUP_DIR/db_$DATE.sql" 2>> "$LOG_FILE" || error_exit "Database backup failed"
log "Database backup completed: db_$DATE.sql"

# Compress database backup
log "Compressing database backup..."
gzip "$BACKUP_DIR/db_$DATE.sql" || error_exit "Compression failed"
log "Compression completed: db_$DATE.sql.gz"

# Backup .env file (contains important configuration)
log "Backing up environment configuration..."
cp "$PROJECT_DIR/.env" "$BACKUP_DIR/env_$DATE.backup" || log "WARNING: .env backup failed"

# Backup uploads directory
log "Backing up uploaded files..."
if [ -d "$PROJECT_DIR/uploads" ]; then
    tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" -C "$PROJECT_DIR" uploads || log "WARNING: Uploads backup failed"
    log "Uploads backup completed: uploads_$DATE.tar.gz"
else
    log "WARNING: Uploads directory not found"
fi

# Calculate backup size
BACKUP_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
log "Current backup directory size: $BACKUP_SIZE"

# Clean up old backups (keep only last RETENTION_DAYS days)
log "Cleaning up old backups (keeping last $RETENTION_DAYS days)..."
find "$BACKUP_DIR" -name "db_*.sql.gz" -mtime +$RETENTION_DAYS -delete 2>> "$LOG_FILE"
find "$BACKUP_DIR" -name "env_*.backup" -mtime +$RETENTION_DAYS -delete 2>> "$LOG_FILE"
find "$BACKUP_DIR" -name "uploads_*.tar.gz" -mtime +$RETENTION_DAYS -delete 2>> "$LOG_FILE"

# Count remaining backups
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/db_*.sql.gz 2>/dev/null | wc -l)
log "Cleanup completed. Current backup count: $BACKUP_COUNT"

# Verify backup integrity
log "Verifying backup integrity..."
if [ -f "$BACKUP_DIR/db_$DATE.sql.gz" ]; then
    gunzip -t "$BACKUP_DIR/db_$DATE.sql.gz" 2>> "$LOG_FILE" && log "Backup verification successful" || log "WARNING: Backup verification failed"
else
    error_exit "Backup file not found"
fi

# Optional: Upload to remote storage (uncomment and configure as needed)
# log "Uploading to remote storage..."
# scp "$BACKUP_DIR/db_$DATE.sql.gz" user@remote-server:/backups/ || log "WARNING: Remote upload failed"

log "Backup process completed successfully!"
log "Latest backup: db_$DATE.sql.gz"
log "----------------------------------------"

exit 0
