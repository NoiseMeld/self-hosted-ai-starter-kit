#!/bin/bash
# Self-Hosted AI Starter Kit + Supabase Management Script
# Usage: ./start-full-stack.sh [cpu|gpu-nvidia|gpu-amd] [--with-cloudflare]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
PROFILE="cpu"
USE_CLOUDFLARE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    cpu|gpu-nvidia|gpu-amd)
      PROFILE="$1"
      shift
      ;;
    --with-cloudflare)
      USE_CLOUDFLARE=true
      shift
      ;;
    -h|--help)
      echo "Usage: $0 [cpu|gpu-nvidia|gpu-amd] [--with-cloudflare]"
      echo ""
      echo "Options:"
      echo "  cpu          Use CPU-only inference (default)"
      echo "  gpu-nvidia   Use NVIDIA GPU acceleration"
      echo "  gpu-amd      Use AMD GPU acceleration (Linux only)"
      echo "  --with-cloudflare  Enable global access via Cloudflare Tunnels"
      echo ""
      echo "Examples:"
      echo "  $0                    # Start with CPU profile"
      echo "  $0 gpu-nvidia         # Start with NVIDIA GPU"
      echo "  $0 cpu --with-cloudflare  # CPU + global access"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use -h or --help for usage information"
      exit 1
      ;;
  esac
done

echo -e "${BLUE}🚀 Starting Self-Hosted AI Starter Kit + Supabase${NC}"
echo -e "${BLUE}Profile: ${YELLOW}$PROFILE${NC}"
if [ "$USE_CLOUDFLARE" = true ]; then
  echo -e "${BLUE}Cloudflare: ${GREEN}Enabled${NC}"
fi
echo ""

# Check if required files exist
if [ ! -f ".env" ]; then
  echo -e "${RED}❌ .env file not found!${NC}"
  echo -e "${YELLOW}Please copy .env.example to .env and configure it${NC}"
  echo -e "${YELLOW}cp .env.example .env${NC}"
  exit 1
fi

if [ ! -f "docker-compose.yml" ]; then
  echo -e "${RED}❌ docker-compose.yml not found!${NC}"
  exit 1
fi

# Step 1: Start AI Stack
echo -e "${YELLOW}📦 Starting AI Stack (Docker Compose)...${NC}"

# Build compose command
COMPOSE_CMD="docker compose --profile $PROFILE"
if [ "$USE_CLOUDFLARE" = true ]; then
  COMPOSE_CMD="$COMPOSE_CMD --profile cloudflare"
fi
COMPOSE_CMD="$COMPOSE_CMD up -d"

echo -e "${BLUE}Running: ${COMPOSE_CMD}${NC}"
eval $COMPOSE_CMD

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ AI Stack started successfully${NC}"
else
  echo -e "${RED}❌ Failed to start AI Stack${NC}"
  exit 1
fi

# Step 2: Start Supabase
echo ""
echo -e "${YELLOW}🗄️  Starting Supabase...${NC}"

# Check if Supabase is already running
if npx supabase status > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Supabase is already running${NC}"
else
  echo -e "${BLUE}Initializing Supabase...${NC}"
  npx supabase start
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Supabase started successfully${NC}"
  else
    echo -e "${RED}❌ Failed to start Supabase${NC}"
    echo -e "${YELLOW}Make sure you have Supabase CLI installed: npm i supabase@latest${NC}"
    echo -e "${YELLOW}AI Stack is still running, you can start Supabase manually later${NC}"
  fi
fi

# Step 3: Display access URLs
echo ""
echo -e "${GREEN}🎉 Full Stack is Ready!${NC}"
echo ""
echo -e "${BLUE}📱 Access Your Services:${NC}"
echo -e "${YELLOW}AI Workflow Platform:${NC}    http://localhost:5678 (n8n)"
echo -e "${YELLOW}Chat Interface:${NC}          http://localhost:3000 (Open WebUI)"  
echo -e "${YELLOW}Vector Database:${NC}         http://localhost:6333 (Qdrant)"
echo -e "${YELLOW}Database & Backend:${NC}      http://localhost:54323 (Supabase Studio)"
echo -e "${YELLOW}API Endpoint:${NC}            http://localhost:54321 (Supabase API)"

if [ "$USE_CLOUDFLARE" = true ]; then
  echo ""
  echo -e "${BLUE}🌐 Global Access:${NC} Check your Cloudflare Tunnel dashboard"
fi

echo ""
echo -e "${BLUE}🛑 To stop everything:${NC}"
echo -e "${YELLOW}docker compose down${NC}"
echo -e "${YELLOW}npx supabase stop${NC}"
echo ""
echo -e "${GREEN}Happy building! 🚀${NC}"