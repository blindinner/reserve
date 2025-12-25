#!/bin/bash
#
# Security Audit Script
# Checks git repository for exposed secrets and sensitive files
#

echo "🔍 Scanning git repository for exposed secrets..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check 1: Look for .env files in git history
echo "1️⃣ Checking for .env files in git history..."
ENV_FILES=$(git log --all --full-history --source --pretty=format: --name-only -- "*.env*" | sort -u)
if [ -z "$ENV_FILES" ]; then
    echo -e "${GREEN}✓ No .env files found in git history${NC}"
else
    echo -e "${RED}✗ Found .env files in git history:${NC}"
    echo "$ENV_FILES"
fi
echo ""

# Check 2: Search for common API key patterns
echo "2️⃣ Searching for API keys in git history..."
API_KEY_PATTERNS=(
    "ALLPAY_API_KEY"
    "RESEND_API_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "GEOAPIFY_API_KEY"
    "api[_-]?key.*=.*['\"][a-zA-Z0-9]{20,}"
    "secret.*=.*['\"][a-zA-Z0-9]{20,}"
)

FOUND_KEYS=false
for PATTERN in "${API_KEY_PATTERNS[@]}"; do
    RESULTS=$(git log -p --all -S "$PATTERN" 2>/dev/null | head -50)
    if [ ! -z "$RESULTS" ]; then
        echo -e "${YELLOW}⚠ Found potential match for: $PATTERN${NC}"
        FOUND_KEYS=true
    fi
done

if [ "$FOUND_KEYS" = false ]; then
    echo -e "${GREEN}✓ No obvious API key patterns found${NC}"
fi
echo ""

# Check 3: Check current working directory
echo "3️⃣ Checking current directory for sensitive files..."
if [ -f ".env.local" ]; then
    echo -e "${YELLOW}⚠ .env.local exists locally (this is OK, as long as it's not in git)${NC}"
else
    echo -e "${GREEN}✓ No .env.local in current directory${NC}"
fi
echo ""

# Check 4: List all commits that modified sensitive files
echo "4️⃣ Checking commits that touched sensitive files..."
SENSITIVE_COMMITS=$(git log --all --oneline --name-only --pretty=format:"%h %s" -- "*.env*" "*.pem" "*.key" "*secret*" 2>/dev/null | head -20)
if [ -z "$SENSITIVE_COMMITS" ]; then
    echo -e "${GREEN}✓ No commits found touching sensitive file patterns${NC}"
else
    echo -e "${YELLOW}⚠ Commits that touched sensitive files:${NC}"
    echo "$SENSITIVE_COMMITS"
fi
echo ""

# Check 5: Verify .gitignore is working
echo "5️⃣ Checking if sensitive files are tracked by git..."
TRACKED_ENV=$(git ls-files | grep -E "\.env|\.local|\.pem|\.key|secret" 2>/dev/null)
if [ -z "$TRACKED_ENV" ]; then
    echo -e "${GREEN}✓ No sensitive files currently tracked by git${NC}"
else
    echo -e "${RED}✗ Sensitive files are tracked:${NC}"
    echo "$TRACKED_ENV"
fi
echo ""

# Check 6: Search for specific exposed keys (from SECURITY_ISSUE.md)
echo "6️⃣ Checking for known exposed keys..."
EXPOSED_KEYS=(
    "33ED8EA125953055F94180B699503658"
    "re_9eSbzS9j_DoMCHVyV4w89iiM9Tcf35qWM"
)

FOUND_EXPOSED=false
for KEY in "${EXPOSED_KEYS[@]}"; do
    if git log -p --all | grep -q "$KEY" 2>/dev/null; then
        echo -e "${RED}✗ Found exposed key in git history: ${KEY:0:20}...${NC}"
        FOUND_EXPOSED=true
    fi
done

if [ "$FOUND_EXPOSED" = false ]; then
    echo -e "${GREEN}✓ Known exposed keys not found in current history${NC}"
    echo -e "${YELLOW}⚠ Note: Keys may still be in remote repository history${NC}"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Summary:"
echo "  • Run 'git log --all -- .env.local' to see full history"
echo "  • If keys are found, they need to be removed from git history"
echo "  • See SECURITY_ISSUE.md for removal instructions"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

