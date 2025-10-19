#!/bin/bash

# ==========================================
# Local Development Setup Script
# ==========================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Mathpati Local Development Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker is running${NC}"
echo ""

# Stop existing containers
echo -e "${YELLOW}Stopping existing containers...${NC}"
docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
echo -e "${GREEN}✓ Stopped existing containers${NC}"
echo ""

# Build and start development containers
echo -e "${YELLOW}Building and starting development containers...${NC}"
docker-compose -f docker-compose.dev.yml up --build -d

echo -e "${GREEN}✓ Development containers started${NC}"
echo ""

# Wait for services to be ready
echo -e "${YELLOW}Waiting for services to be ready...${NC}"
sleep 5

# Show container status
echo -e "${YELLOW}Container status:${NC}"
docker-compose -f docker-compose.dev.yml ps
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Development environment is ready!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Application: ${BLUE}http://localhost:5173${NC}"
echo -e "Metrics API: ${BLUE}http://localhost:9090${NC}"
echo ""
echo -e "To view logs: ${BLUE}docker-compose -f docker-compose.dev.yml logs -f${NC}"
echo -e "To stop: ${BLUE}docker-compose -f docker-compose.dev.yml down${NC}"
