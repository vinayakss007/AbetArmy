#!/bin/bash
set -e

# Craq Platform - Local Development Setup
# This script sets up the complete local development environment.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "======================================"
echo "  Craq Platform - Local Setup"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

success() { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
fail() { echo -e "${RED}[FAIL]${NC} $1"; exit 1; }

# Check Node.js version
echo "Checking prerequisites..."
if ! command -v node &> /dev/null; then
    fail "Node.js is not installed. Please install Node.js 22+ from https://nodejs.org"
fi

NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 22 ]; then
    fail "Node.js 22+ required. Current version: $(node -v)"
fi
success "Node.js $(node -v)"

# Check npm
if ! command -v npm &> /dev/null; then
    fail "npm is not installed"
fi
success "npm $(npm -v)"

# Check Docker
if ! command -v docker &> /dev/null; then
    fail "Docker is not installed. Please install Docker from https://docker.com"
fi
success "Docker $(docker --version | cut -d' ' -f3 | tr -d ',')"

# Check Docker Compose
if docker compose version &> /dev/null; then
    success "Docker Compose $(docker compose version --short)"
elif command -v docker-compose &> /dev/null; then
    success "Docker Compose (legacy: $(docker-compose --version | cut -d' ' -f4))"
    warn "Consider upgrading to Docker Compose v2 (docker compose)"
else
    fail "Docker Compose is not installed"
fi

echo ""
echo "Setting up environment..."

# Copy .env.example to .env if not exists
if [ ! -f "$PROJECT_DIR/.env" ]; then
    cp "$PROJECT_DIR/.env.example" "$PROJECT_DIR/.env"
    success "Created .env from .env.example"
else
    warn ".env already exists, skipping copy"
fi

echo ""
echo "Installing dependencies..."

# Install backend dependencies
echo "  Installing backend dependencies..."
cd "$PROJECT_DIR/backend"
npm install --silent
success "Backend dependencies installed"

# Install frontend dependencies
echo "  Installing frontend dependencies..."
cd "$PROJECT_DIR/frontend"
npm install --silent
success "Frontend dependencies installed"

echo ""
echo "Starting infrastructure services..."

# Start Docker services
cd "$PROJECT_DIR"
docker compose up postgres redis meilisearch -d

# Wait for PostgreSQL to be ready
echo "  Waiting for PostgreSQL to be ready..."
RETRIES=30
until docker compose exec -T postgres pg_isready -U craq -d craq_db &> /dev/null; do
    RETRIES=$((RETRIES - 1))
    if [ $RETRIES -le 0 ]; then
        fail "PostgreSQL failed to start within 30 seconds"
    fi
    sleep 1
done
success "PostgreSQL is ready"

# Wait for Redis to be ready
echo "  Waiting for Redis to be ready..."
RETRIES=10
until docker compose exec -T redis redis-cli ping &> /dev/null; do
    RETRIES=$((RETRIES - 1))
    if [ $RETRIES -le 0 ]; then
        fail "Redis failed to start within 10 seconds"
    fi
    sleep 1
done
success "Redis is ready"

echo ""
echo "Initializing database..."

# Initialize database schema
cd "$PROJECT_DIR/backend"
npm run db:init
success "Database schema initialized"

echo ""
echo "======================================"
echo -e "${GREEN}  Setup Complete!${NC}"
echo "======================================"
echo ""
echo "Start the development servers:"
echo ""
echo "  Backend (Terminal 1):"
echo "    cd backend && npm run dev"
echo ""
echo "  Frontend (Terminal 2):"
echo "    cd frontend && npm run dev"
echo ""
echo "Access the application:"
echo "  Frontend:   http://localhost:3000"
echo "  Backend:    http://localhost:4000"
echo "  API Health: http://localhost:4000/api/health"
echo ""
