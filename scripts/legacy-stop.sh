#!/bin/bash
# Stop Self-Hosted AI Starter Kit + Supabase
# Usage: ./stop-full-stack.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🛑 Stopping Self-Hosted AI Starter Kit + Supabase${NC}"
echo ""

# Step 1: Stop AI Stack
echo -e "${YELLOW}📦 Stopping AI Stack (Docker Compose)...${NC}"
docker compose down

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ AI Stack stopped${NC}"
else
  echo -e "${RED}❌ Failed to stop AI Stack${NC}"
fi

# Step 2: Stop Supabase
echo ""
echo -e "${YELLOW}🗄️  Stopping Supabase...${NC}"

# Check if Supabase is running
if npx supabase status > /dev/null 2>&1; then
  npx supabase stop
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Supabase stopped${NC}"
  else
    echo -e "${RED}❌ Failed to stop Supabase${NC}"
  fi
else
  echo -e "${YELLOW}ℹ️  Supabase is not running${NC}"
fi

echo ""
echo -e "${GREEN}✅ All services stopped${NC}"
echo ""
echo -e "${BLUE}To start again, run:${NC}"
echo -e "${YELLOW}./start-full-stack.sh${NC}"