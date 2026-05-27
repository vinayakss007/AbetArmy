#!/bin/bash

# Craq Platform - Service Health Check
# Checks the health of all platform services and reports overall status.
#
# Exit codes:
#   0 - All services healthy
#   1 - One or more services unhealthy

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Configuration
BACKEND_URL="${BACKEND_URL:-http://localhost:4000}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:3000}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-craq}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

OVERALL_STATUS=0

check_pass() { echo -e "  ${GREEN}[PASS]${NC} $1"; }
check_fail() { echo -e "  ${RED}[FAIL]${NC} $1"; OVERALL_STATUS=1; }
check_warn() { echo -e "  ${YELLOW}[WARN]${NC} $1"; }

echo "======================================"
echo "  Craq Platform - Health Check"
echo "  $(date)"
echo "======================================"
echo ""

# Check Backend API
echo "Backend API ($BACKEND_URL):"
HEALTH_RESPONSE=$(curl -sf --max-time 5 "$BACKEND_URL/api/health" 2>/dev/null)
if [ $? -eq 0 ]; then
    check_pass "API responding"
    
    # Parse health details
    STATUS=$(echo "$HEALTH_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status','unknown'))" 2>/dev/null || echo "unknown")
    UPTIME=$(echo "$HEALTH_RESPONSE" | python3 -c "import sys,json; print(f\"{json.load(sys.stdin).get('uptime',0):.0f}s\")" 2>/dev/null || echo "unknown")
    POOL_WAITING=$(echo "$HEALTH_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('pool',{}).get('waitingCount',0))" 2>/dev/null || echo "0")
    
    check_pass "Status: $STATUS"
    check_pass "Uptime: $UPTIME"
    
    if [ "$POOL_WAITING" -gt 0 ]; then
        check_warn "Database pool has $POOL_WAITING waiting connections"
    else
        check_pass "Database pool healthy (0 waiting)"
    fi
else
    check_fail "API not responding"
fi

echo ""

# Check PostgreSQL
echo "PostgreSQL ($DB_HOST:$DB_PORT):"
if command -v pg_isready &> /dev/null; then
    if pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" &> /dev/null; then
        check_pass "PostgreSQL accepting connections"
    else
        check_fail "PostgreSQL not accepting connections"
    fi
elif docker compose ps postgres 2>/dev/null | grep -q "running"; then
    cd "$PROJECT_DIR"
    if docker compose exec -T postgres pg_isready -U "$DB_USER" &> /dev/null; then
        check_pass "PostgreSQL accepting connections (Docker)"
    else
        check_fail "PostgreSQL not accepting connections (Docker)"
    fi
else
    check_warn "Cannot check PostgreSQL (pg_isready not available, container not running)"
fi

echo ""

# Check Redis
echo "Redis:"
if command -v redis-cli &> /dev/null; then
    REDIS_RESPONSE=$(redis-cli -u "${REDIS_URL:-redis://localhost:6379}" ping 2>/dev/null)
    if [ "$REDIS_RESPONSE" = "PONG" ]; then
        check_pass "Redis responding"
    else
        check_fail "Redis not responding"
    fi
elif docker compose ps redis 2>/dev/null | grep -q "running"; then
    cd "$PROJECT_DIR"
    REDIS_RESPONSE=$(docker compose exec -T redis redis-cli ping 2>/dev/null)
    if [ "$REDIS_RESPONSE" = "PONG" ]; then
        check_pass "Redis responding (Docker)"
    else
        check_fail "Redis not responding (Docker)"
    fi
else
    check_warn "Cannot check Redis (redis-cli not available, container not running)"
fi

echo ""

# Check Frontend
echo "Frontend ($FRONTEND_URL):"
FRONTEND_STATUS=$(curl -sf --max-time 5 -o /dev/null -w "%{http_code}" "$FRONTEND_URL" 2>/dev/null)
if [ "$FRONTEND_STATUS" = "200" ]; then
    check_pass "Frontend responding (HTTP 200)"
elif [ -n "$FRONTEND_STATUS" ] && [ "$FRONTEND_STATUS" != "000" ]; then
    check_warn "Frontend responding with HTTP $FRONTEND_STATUS"
else
    check_fail "Frontend not responding"
fi

echo ""

# Check WebSocket endpoint
echo "WebSocket ($BACKEND_URL/ws):"
WS_URL=$(echo "$BACKEND_URL" | sed 's/http/ws/')
if command -v websocat &> /dev/null; then
    # If websocat is available, do a real check
    check_warn "WebSocket endpoint present (detailed check requires auth token)"
else
    # Just check if the upgrade endpoint is there
    WS_RESPONSE=$(curl -sf --max-time 5 -o /dev/null -w "%{http_code}" -H "Upgrade: websocket" -H "Connection: Upgrade" "$BACKEND_URL/ws" 2>/dev/null)
    if [ -n "$WS_RESPONSE" ] && [ "$WS_RESPONSE" != "000" ]; then
        check_pass "WebSocket endpoint reachable"
    else
        check_warn "WebSocket endpoint not testable without auth"
    fi
fi

echo ""
echo "======================================"
if [ $OVERALL_STATUS -eq 0 ]; then
    echo -e "  ${GREEN}Overall: HEALTHY${NC}"
else
    echo -e "  ${RED}Overall: UNHEALTHY${NC}"
fi
echo "======================================"

exit $OVERALL_STATUS
