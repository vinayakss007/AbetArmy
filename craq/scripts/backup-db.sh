#!/bin/bash
set -e

# Craq Platform - Database Backup Script
# Creates timestamped PostgreSQL backups with automatic cleanup.
#
# Usage:
#   ./backup-db.sh                    # Use defaults
#   BACKUP_DIR=/mnt/backups ./backup-db.sh  # Custom backup directory
#
# Environment variables:
#   BACKUP_DIR      - Directory to store backups (default: ./backups)
#   RETENTION_DAYS  - Days to keep backups (default: 7)
#   DB_HOST         - PostgreSQL host (default: localhost)
#   DB_PORT         - PostgreSQL port (default: 5432)
#   DB_USER         - PostgreSQL user (default: craq)
#   DB_NAME         - PostgreSQL database (default: craq_db)
#   S3_BUCKET       - S3 bucket for offsite backup (optional)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Configuration
BACKUP_DIR="${BACKUP_DIR:-$PROJECT_DIR/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-craq}"
DB_NAME="${DB_NAME:-craq_db}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="craq_backup_${TIMESTAMP}.sql.gz"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

success() { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
fail() { echo -e "${RED}[FAIL]${NC} $1"; exit 1; }

echo "======================================"
echo "  Craq Database Backup"
echo "  $(date)"
echo "======================================"
echo ""

# Create backup directory
mkdir -p "$BACKUP_DIR"
success "Backup directory: $BACKUP_DIR"

# Check if pg_dump is available
if command -v pg_dump &> /dev/null; then
    PG_DUMP="pg_dump"
elif docker compose ps postgres 2>/dev/null | grep -q "running"; then
    # Use pg_dump from Docker container
    PG_DUMP="docker compose exec -T postgres pg_dump"
    cd "$PROJECT_DIR"
else
    fail "pg_dump not found and PostgreSQL container is not running"
fi

# Perform backup
echo "Creating backup..."
echo "  Host: $DB_HOST"
echo "  Database: $DB_NAME"
echo "  File: $BACKUP_FILE"

if [ "$PG_DUMP" = "pg_dump" ]; then
    PGPASSWORD="${DB_PASSWORD:-craq_password}" pg_dump \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --no-owner \
        --no-privileges \
        --format=plain \
        | gzip > "$BACKUP_DIR/$BACKUP_FILE"
else
    docker compose exec -T postgres pg_dump \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --no-owner \
        --no-privileges \
        --format=plain \
        | gzip > "$BACKUP_DIR/$BACKUP_FILE"
fi

BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)
success "Backup created: $BACKUP_FILE ($BACKUP_SIZE)"

# Cleanup old backups
echo ""
echo "Cleaning up backups older than $RETENTION_DAYS days..."
DELETED=$(find "$BACKUP_DIR" -name "craq_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete -print | wc -l)
if [ "$DELETED" -gt 0 ]; then
    success "Deleted $DELETED old backup(s)"
else
    echo "  No old backups to delete"
fi

# Optional S3 upload
if [ -n "$S3_BUCKET" ]; then
    echo ""
    echo "Uploading to S3..."
    if command -v aws &> /dev/null; then
        aws s3 cp "$BACKUP_DIR/$BACKUP_FILE" "s3://$S3_BUCKET/craq-backups/$BACKUP_FILE"
        success "Uploaded to s3://$S3_BUCKET/craq-backups/$BACKUP_FILE"
    else
        warn "AWS CLI not installed. Skipping S3 upload."
    fi
fi

# Summary
echo ""
echo "======================================"
echo "  Backup Summary"
echo "======================================"
echo "  File: $BACKUP_DIR/$BACKUP_FILE"
echo "  Size: $BACKUP_SIZE"
echo "  Retained: $(find "$BACKUP_DIR" -name "craq_backup_*.sql.gz" | wc -l) backup(s)"
echo ""
