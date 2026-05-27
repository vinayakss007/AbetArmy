#!/bin/bash
set -e

# Craq Platform - Production Deployment Script
# Validates environment, builds, and deploys all services via Docker Compose.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "======================================"
echo "  Craq Platform - Production Deploy"
echo "======================================"
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

success() { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
fail() { echo -e "${RED}[FAIL]${NC} $1"; exit 1; }

# Validate required environment variables
echo "Validating configuration..."

cd "$PROJECT_DIR"

if [ ! -f ".env" ]; then
    fail ".env file not found. Copy .env.example and configure production values."
fi

# Load environment variables safely (only KEY=value lines)
if [ -f .env ]; then
  while IFS='=' read -r key value; do
    # Skip comments and empty lines
    [[ -z "$key" || "$key" == \#* ]] && continue
    # Only export valid variable names
    if [[ "$key" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]]; then
      export "$key=$value"
    fi
  done < .env
fi

# Check critical secrets
if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" = "your-jwt-secret-key-change-in-production" ]; then
    fail "JWT_SECRET must be set to a secure production value"
fi

if [ -z "$JWT_REFRESH_SECRET" ] || [ "$JWT_REFRESH_SECRET" = "your-jwt-refresh-secret-key-change-in-production" ]; then
    fail "JWT_REFRESH_SECRET must be set to a secure production value"
fi

if [ -z "$DB_PASSWORD" ] || [ "$DB_PASSWORD" = "craq_password" ]; then
    warn "DB_PASSWORD is set to the default value. Consider changing for production."
fi

success "Environment configuration validated"

# Check Docker
if ! command -v docker &> /dev/null; then
    fail "Docker is not installed"
fi

if ! docker compose version &> /dev/null; then
    fail "Docker Compose v2 is not available"
fi

success "Docker and Docker Compose available"

echo ""
echo "Pulling latest images..."
docker compose pull 2>/dev/null || warn "Some images could not be pulled (may be local builds)"

echo ""
echo "Building and starting services..."
docker compose up --build -d

echo ""
echo "Waiting for services to be healthy..."

# Wait for backend health check
RETRIES=60
echo "  Waiting for backend..."
until curl -sf http://localhost:${PORT:-4000}/api/health > /dev/null 2>&1; do
    RETRIES=$((RETRIES - 1))
    if [ $RETRIES -le 0 ]; then
        echo ""
        warn "Backend health check timed out. Checking logs..."
        docker compose logs --tail=20 backend
        fail "Backend failed to become healthy within 60 seconds"
    fi
    sleep 1
done
success "Backend is healthy"

# Check frontend
RETRIES=30
echo "  Waiting for frontend..."
until curl -sf http://localhost:3000 > /dev/null 2>&1; do
    RETRIES=$((RETRIES - 1))
    if [ $RETRIES -le 0 ]; then
        warn "Frontend health check timed out (may still be building)"
        break
    fi
    sleep 1
done
if [ $RETRIES -gt 0 ]; then
    success "Frontend is responding"
fi

echo ""
echo "======================================"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo "======================================"
echo ""
echo "Service Status:"
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "Health check:"
curl -s http://localhost:${PORT:-4000}/api/health | python3 -m json.tool 2>/dev/null || \
    curl -s http://localhost:${PORT:-4000}/api/health
echo ""
