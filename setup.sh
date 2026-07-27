#!/bin/bash

# AI Agent Fleet Platform - Setup Script
# This script sets up the development environment

set -e

echo "🚀 Setting up AI Agent Fleet Platform..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."
    
    # Check for Docker
    if command -v docker &> /dev/null; then
        print_success "Docker is installed"
    else
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check for Docker Compose
    if command -v docker-compose &> /dev/null; then
        print_success "Docker Compose is installed"
    else
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check for Python
    if command -v python3 &> /dev/null; then
        print_success "Python 3 is installed"
    else
        print_error "Python 3 is not installed. Please install Python 3.11 or higher."
        exit 1
    fi
    
    # Check for Node.js
    if command -v node &> /dev/null; then
        print_success "Node.js is installed"
    else
        print_error "Node.js is not installed. Please install Node.js 18 or higher."
        exit 1
    fi
}

# Setup backend
setup_backend() {
    print_info "Setting up backend..."
    
    cd backend
    
    # Create virtual environment
    if [ ! -d "venv" ]; then
        python3 -m venv venv
        print_success "Created virtual environment"
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Install dependencies
    pip install --upgrade pip
    pip install -r requirements.txt
    print_success "Installed Python dependencies"
    
    # Create .env file if it doesn't exist
    if [ ! -f ".env" ]; then
        cat > .env << EOF
# Application Configuration
ENVIRONMENT=development
DEBUG=true
SECRET_KEY=your-development-secret-key-change-in-production

# Database
DATABASE_URL=postgresql://agent_admin:agent_password@localhost:5432/agent_fleet

# Redis
REDIS_URL=redis://localhost:6379/0

# API Configuration
API_PREFIX=/api/v1
CORS_ORIGINS=["http://localhost:3000","http://localhost:8000"]

# AI Providers (optional)
# OPENAI_API_KEY=your-openai-api-key
# ANTHROPIC_API_KEY=your-anthropic-api-key

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60
RATE_LIMIT_PER_HOUR=1000

# Agent Configuration
DEFAULT_AGENT_CONCURRENCY=5
MAX_AGENTS_PER_USER=100
MAX_TOOLS_PER_AGENT=20

# Monitoring
ENABLE_TELEMETRY=true
METRICS_PORT=9091
LOG_LEVEL=INFO

# Billing (optional)
# STRIPE_API_KEY=your-stripe-api-key
# STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
EOF
        print_success "Created .env file"
    fi
    
    cd ..
}

# Setup frontend
setup_frontend() {
    print_info "Setting up frontend..."
    
    cd frontend
    
    # Install dependencies
    npm install
    print_success "Installed Node.js dependencies"
    
    # Create .env.local file if it doesn't exist
    if [ ! -f ".env.local" ]; then
        cat > .env.local << EOF
# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_NAME="AI Agent Fleet Platform"
NEXT_PUBLIC_ENVIRONMENT=development
EOF
        print_success "Created .env.local file"
    fi
    
    cd ..
}

# Start services
start_services() {
    print_info "Starting services with Docker Compose..."
    
    cd backend
    
    # Start Docker services
    docker-compose up -d
    
    # Wait for services to be ready
    print_info "Waiting for services to be ready..."
    sleep 10
    
    # Check if services are running
    if docker-compose ps | grep -q "Up"; then
        print_success "Docker services are running"
    else
        print_error "Failed to start Docker services"
        docker-compose logs
        exit 1
    fi
    
    cd ..
}

# Initialize database
initialize_database() {
    print_info "Initializing database..."
    
    cd backend
    
    # Run database initialization
    docker-compose exec backend python -c "
from app.database import init_db, create_sample_data
from app.config import settings

print('Initializing database...')
init_db()
print('Database initialized successfully')

if settings.environment == 'development':
    print('Creating sample data...')
    create_sample_data()
    print('Sample data created successfully')
"
    
    cd ..
}

# Display setup information
display_info() {
    echo ""
    echo "🎉 AI Agent Fleet Platform setup complete!"
    echo ""
    echo "📊 Services Status:"
    echo "   Backend API:     http://localhost:8000"
    echo "   Frontend:        http://localhost:3000"
    echo "   API Docs:        http://localhost:8000/docs"
    echo "   PostgreSQL:      localhost:5432"
    echo "   Redis:           localhost:6379"
    echo "   Prometheus:      http://localhost:9090"
    echo "   Grafana:         http://localhost:3001 (admin/admin)"
    echo ""
    echo "🚀 Quick Start:"
    echo "   1. Access the dashboard: http://localhost:3000"
    echo "   2. Use the API: http://localhost:8000/docs"
    echo "   3. Create your first agent using the templates"
    echo ""
    echo "🔧 Management Commands:"
    echo "   Start services:    docker-compose up -d"
    echo "   Stop services:     docker-compose down"
    echo "   View logs:         docker-compose logs -f"
    echo "   Rebuild:           docker-compose build --no-cache"
    echo ""
    echo "📚 Documentation:"
    echo "   Architecture:      docs/architecture.md"
    echo "   API Reference:     http://localhost:8000/docs"
    echo "   Agent Templates:   examples/agent_templates.yaml"
    echo ""
    echo "👥 Default Credentials:"
    echo "   Email:    admin@sample.com"
    echo "   Username: admin"
    echo "   Password: (check the sample data creation)"
    echo ""
    echo "⚠️  Important:"
    echo "   - Change default credentials in production"
    echo "   - Configure API keys for AI providers"
    echo "   - Set up proper SSL/TLS for production"
}

# Main setup process
main() {
    echo "=========================================="
    echo " AI Agent Fleet Platform Setup"
    echo "=========================================="
    
    check_prerequisites
    setup_backend
    setup_frontend
    start_services
    initialize_database
    display_info
}

# Run main function
main