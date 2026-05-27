#!/bin/bash
set -e

# Craq Platform - Seed Sample Data
# Populates the database with sample data for development and demos.
# Requires the backend to be running.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_URL="${API_URL:-http://localhost:4000}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

success() { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
fail() { echo -e "${RED}[FAIL]${NC} $1"; exit 1; }

echo "======================================"
echo "  Craq Platform - Seed Data"
echo "======================================"
echo ""

# Check backend is running
echo "Checking backend availability..."
if ! curl -sf "$API_URL/api/health" > /dev/null 2>&1; then
    fail "Backend is not running at $API_URL. Start it first."
fi
success "Backend is available at $API_URL"
echo ""

# Register sample users
echo "Creating sample users..."

ALICE_RESPONSE=$(curl -sf -X POST "$API_URL/api/auth/register" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "alice@example.com",
        "password": "password123",
        "name": "Alice Johnson"
    }' 2>/dev/null || echo "")

if echo "$ALICE_RESPONSE" | grep -q "accessToken"; then
    ALICE_TOKEN=$(echo "$ALICE_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['tokens']['accessToken'])" 2>/dev/null)
    success "Created user: Alice Johnson (alice@example.com)"
else
    warn "Alice may already exist, attempting login..."
    ALICE_RESPONSE=$(curl -sf -X POST "$API_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"email": "alice@example.com", "password": "password123"}' 2>/dev/null || echo "")
    ALICE_TOKEN=$(echo "$ALICE_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['tokens']['accessToken'])" 2>/dev/null || echo "")
    if [ -n "$ALICE_TOKEN" ]; then
        success "Logged in as Alice"
    else
        fail "Could not create or login as Alice"
    fi
fi

BOB_RESPONSE=$(curl -sf -X POST "$API_URL/api/auth/register" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "bob@example.com",
        "password": "password123",
        "name": "Bob Martinez"
    }' 2>/dev/null || echo "")

if echo "$BOB_RESPONSE" | grep -q "accessToken"; then
    BOB_TOKEN=$(echo "$BOB_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['tokens']['accessToken'])" 2>/dev/null)
    success "Created user: Bob Martinez (bob@example.com)"
else
    warn "Bob may already exist, attempting login..."
    BOB_RESPONSE=$(curl -sf -X POST "$API_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"email": "bob@example.com", "password": "password123"}' 2>/dev/null || echo "")
    BOB_TOKEN=$(echo "$BOB_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['tokens']['accessToken'])" 2>/dev/null || echo "")
    if [ -n "$BOB_TOKEN" ]; then
        success "Logged in as Bob"
    else
        warn "Could not create or login as Bob, continuing..."
    fi
fi

CAROL_RESPONSE=$(curl -sf -X POST "$API_URL/api/auth/register" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "carol@example.com",
        "password": "password123",
        "name": "Carol Chen"
    }' 2>/dev/null || echo "")

if echo "$CAROL_RESPONSE" | grep -q "accessToken"; then
    CAROL_TOKEN=$(echo "$CAROL_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['tokens']['accessToken'])" 2>/dev/null)
    success "Created user: Carol Chen (carol@example.com)"
else
    warn "Carol may already exist, attempting login..."
    CAROL_RESPONSE=$(curl -sf -X POST "$API_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"email": "carol@example.com", "password": "password123"}' 2>/dev/null || echo "")
    CAROL_TOKEN=$(echo "$CAROL_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['tokens']['accessToken'])" 2>/dev/null || echo "")
    if [ -n "$CAROL_TOKEN" ]; then
        success "Logged in as Carol"
    else
        warn "Could not create or login as Carol, continuing..."
    fi
fi

echo ""
echo "Creating sample issues..."

# Issue 1 - Growth
ISSUE1=$(curl -sf -X POST "$API_URL/api/issues" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ALICE_TOKEN" \
    -d '{
        "title": "How to scale customer acquisition beyond paid ads?",
        "description": "We have been relying heavily on Google Ads and Facebook Ads for customer acquisition. Our CAC is increasing quarter over quarter and we need to diversify. What organic channels have worked for B2B SaaS companies in the $10-50M ARR range?",
        "category": "growth",
        "tags": ["acquisition", "marketing", "saas", "organic"],
        "industry": "technology",
        "stage": "growth",
        "type": "strategy"
    }' 2>/dev/null || echo "")
ISSUE1_ID=$(echo "$ISSUE1" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null || echo "")
if [ -n "$ISSUE1_ID" ]; then
    success "Created issue: Scale customer acquisition ($ISSUE1_ID)"
else
    warn "Failed to create issue 1"
fi

# Issue 2 - Retention
ISSUE2=$(curl -sf -X POST "$API_URL/api/issues" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $BOB_TOKEN" \
    -d '{
        "title": "Reducing churn rate from 8% to under 3% monthly",
        "description": "Our monthly churn is at 8% which is unsustainable. We have tried exit surveys and basic email campaigns but nothing seems to work. Looking for proven retention strategies that have worked for subscription businesses.",
        "category": "retention",
        "tags": ["churn", "retention", "subscription"],
        "industry": "technology",
        "stage": "growth",
        "type": "operational"
    }' 2>/dev/null || echo "")
ISSUE2_ID=$(echo "$ISSUE2" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null || echo "")
if [ -n "$ISSUE2_ID" ]; then
    success "Created issue: Reducing churn rate ($ISSUE2_ID)"
else
    warn "Failed to create issue 2"
fi

# Issue 3 - Operations
ISSUE3=$(curl -sf -X POST "$API_URL/api/issues" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $CAROL_TOKEN" \
    -d '{
        "title": "Building an efficient remote engineering team across timezones",
        "description": "We are scaling our engineering team from 10 to 50 engineers across US, Europe, and Asia. What tools, processes, and communication frameworks help maintain velocity and culture with distributed teams?",
        "category": "operations",
        "tags": ["remote", "engineering", "hiring", "culture"],
        "industry": "technology",
        "stage": "scaling",
        "type": "operational"
    }' 2>/dev/null || echo "")
ISSUE3_ID=$(echo "$ISSUE3" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null || echo "")
if [ -n "$ISSUE3_ID" ]; then
    success "Created issue: Remote engineering team ($ISSUE3_ID)"
else
    warn "Failed to create issue 3"
fi

echo ""
echo "Creating sample solutions..."

# Solution for Issue 1
if [ -n "$ISSUE1_ID" ] && [ -n "$BOB_TOKEN" ]; then
    SOL1=$(curl -sf -X POST "$API_URL/api/solutions" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $BOB_TOKEN" \
        -d "{
            \"issueId\": \"$ISSUE1_ID\",
            \"content\": \"We scaled from \\$5M to \\$30M ARR primarily through content-led growth. Here is what worked:\\n\\n1. **SEO-driven blog** - Published 3x/week targeting long-tail keywords our buyers search for.\\n2. **Community building** - Started a Slack community that grew to 5,000 members organically.\\n3. **Partner integrations** - Listed on marketplaces of complementary tools.\\n4. **Referral program** - 20% of new customers now come from referrals with a 2-sided incentive.\\n\\nThe key insight: organic channels compound. It took 6 months to see results but now accounts for 60% of pipeline.\"
        }" 2>/dev/null || echo "")
    if echo "$SOL1" | grep -q "id"; then
        success "Created solution for issue 1"
    fi
fi

# Solution for Issue 2
if [ -n "$ISSUE2_ID" ] && [ -n "$CAROL_TOKEN" ]; then
    SOL2=$(curl -sf -X POST "$API_URL/api/solutions" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $CAROL_TOKEN" \
        -d "{
            \"issueId\": \"$ISSUE2_ID\",
            \"content\": \"We reduced churn from 7% to 2.5% in 6 months with this framework:\\n\\n1. **Customer Health Score** - Built a composite score from login frequency, feature adoption, support tickets, and NPS. Red accounts get proactive outreach.\\n2. **Onboarding overhaul** - Implemented guided tours + milestone emails. Time-to-value dropped from 14 days to 3 days.\\n3. **Quarterly Business Reviews** - For accounts over \\$1k/mo, QBRs show ROI and usage trends.\\n4. **Win-back campaign** - 15% of churned customers returned when offered a personalized plan.\\n\\nThe biggest lever was onboarding. Most churn happened in the first 30 days.\"
        }" 2>/dev/null || echo "")
    if echo "$SOL2" | grep -q "id"; then
        success "Created solution for issue 2"
    fi
fi

echo ""
echo "Creating sample comments..."

# Comment on Issue 1
if [ -n "$ISSUE1_ID" ] && [ -n "$CAROL_TOKEN" ]; then
    curl -sf -X POST "$API_URL/api/comments" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $CAROL_TOKEN" \
        -d "{
            \"parentType\": \"issue\",
            \"parentId\": \"$ISSUE1_ID\",
            \"content\": \"Great question! We found that LinkedIn thought leadership combined with a strong content strategy reduced our CAC by 40%. Happy to share our playbook.\"
        }" > /dev/null 2>&1 && success "Created comment on issue 1"
fi

# Comment on Issue 2
if [ -n "$ISSUE2_ID" ] && [ -n "$ALICE_TOKEN" ]; then
    curl -sf -X POST "$API_URL/api/comments" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ALICE_TOKEN" \
        -d "{
            \"parentType\": \"issue\",
            \"parentId\": \"$ISSUE2_ID\",
            \"content\": \"Have you tried segmenting churn by customer cohort? We found that customers who did not complete onboarding within 7 days had 5x higher churn. Fixing onboarding was 80% of the solution.\"
        }" > /dev/null 2>&1 && success "Created comment on issue 2"
fi

echo ""
echo "Creating sample tools..."

if [ -n "$ALICE_TOKEN" ]; then
    curl -sf -X POST "$API_URL/api/tools" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ALICE_TOKEN" \
        -d '{
            "name": "HubSpot",
            "description": "All-in-one CRM, marketing automation, and sales platform",
            "url": "https://hubspot.com",
            "category": "marketing",
            "linked_issue_types": ["acquisition", "retention"]
        }' > /dev/null 2>&1 && success "Created tool: HubSpot"

    curl -sf -X POST "$API_URL/api/tools" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ALICE_TOKEN" \
        -d '{
            "name": "Notion",
            "description": "All-in-one workspace for notes, docs, wikis, and project management",
            "url": "https://notion.so",
            "category": "productivity",
            "linked_issue_types": ["operations", "collaboration"]
        }' > /dev/null 2>&1 && success "Created tool: Notion"

    curl -sf -X POST "$API_URL/api/tools" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ALICE_TOKEN" \
        -d '{
            "name": "Mixpanel",
            "description": "Product analytics for tracking user behavior and engagement",
            "url": "https://mixpanel.com",
            "category": "analytics",
            "linked_issue_types": ["retention", "product"]
        }' > /dev/null 2>&1 && success "Created tool: Mixpanel"
fi

echo ""
echo "Creating sample votes..."

# Vote on issues
if [ -n "$ISSUE1_ID" ] && [ -n "$BOB_TOKEN" ]; then
    curl -sf -X POST "$API_URL/api/votes" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $BOB_TOKEN" \
        -d "{\"targetType\": \"issue\", \"targetId\": \"$ISSUE1_ID\", \"value\": 1}" > /dev/null 2>&1
fi

if [ -n "$ISSUE1_ID" ] && [ -n "$CAROL_TOKEN" ]; then
    curl -sf -X POST "$API_URL/api/votes" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $CAROL_TOKEN" \
        -d "{\"targetType\": \"issue\", \"targetId\": \"$ISSUE1_ID\", \"value\": 1}" > /dev/null 2>&1
fi

if [ -n "$ISSUE2_ID" ] && [ -n "$ALICE_TOKEN" ]; then
    curl -sf -X POST "$API_URL/api/votes" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ALICE_TOKEN" \
        -d "{\"targetType\": \"issue\", \"targetId\": \"$ISSUE2_ID\", \"value\": 1}" > /dev/null 2>&1
fi

success "Created sample votes"

echo ""
echo "======================================"
echo -e "${GREEN}  Seed Data Complete!${NC}"
echo "======================================"
echo ""
echo "Sample accounts:"
echo "  alice@example.com / password123"
echo "  bob@example.com   / password123"
echo "  carol@example.com / password123"
echo ""
echo "Created:"
echo "  - 3 users"
echo "  - 3 issues (growth, retention, operations)"
echo "  - 2 solutions"
echo "  - 2 comments"
echo "  - 3 tools"
echo "  - 3 votes"
echo ""
