#!/bin/bash

# ==========================================
# Test Deployment Script
# ==========================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

NAMESPACE=${1:-production}
SERVICE_NAME="mathpati-service"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Testing Mathpati Deployment${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Get service endpoint
echo -e "${YELLOW}Getting service endpoint...${NC}"
SERVICE_IP=$(kubectl get svc ${SERVICE_NAME} -n ${NAMESPACE} -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")
SERVICE_HOSTNAME=$(kubectl get svc ${SERVICE_NAME} -n ${NAMESPACE} -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "")

ENDPOINT=""
if [ -n "$SERVICE_IP" ]; then
    ENDPOINT="http://${SERVICE_IP}"
elif [ -n "$SERVICE_HOSTNAME" ]; then
    ENDPOINT="http://${SERVICE_HOSTNAME}"
else
    echo -e "${YELLOW}No external endpoint found, using port-forward...${NC}"
    kubectl port-forward svc/${SERVICE_NAME} 8080:80 -n ${NAMESPACE} &
    PORT_FORWARD_PID=$!
    sleep 3
    ENDPOINT="http://localhost:8080"
fi

echo -e "${GREEN}✓ Endpoint: ${ENDPOINT}${NC}"
echo ""

# Test health endpoint
echo -e "${YELLOW}Testing health endpoint...${NC}"
if curl -f -s "${ENDPOINT}/health" > /dev/null; then
    echo -e "${GREEN}✓ Health check passed${NC}"
else
    echo -e "${RED}✗ Health check failed${NC}"
    [ -n "$PORT_FORWARD_PID" ] && kill $PORT_FORWARD_PID 2>/dev/null || true
    exit 1
fi
echo ""

# Test main page
echo -e "${YELLOW}Testing main page...${NC}"
if curl -f -s "${ENDPOINT}/" > /dev/null; then
    echo -e "${GREEN}✓ Main page accessible${NC}"
else
    echo -e "${RED}✗ Main page not accessible${NC}"
    [ -n "$PORT_FORWARD_PID" ] && kill $PORT_FORWARD_PID 2>/dev/null || true
    exit 1
fi
echo ""

# Test metrics endpoint
echo -e "${YELLOW}Testing metrics endpoint...${NC}"
if curl -f -s "${ENDPOINT}:9090/metrics" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Metrics endpoint accessible${NC}"
else
    echo -e "${YELLOW}⚠ Metrics endpoint not accessible (may be internal only)${NC}"
fi
echo ""

# Check pod status
echo -e "${YELLOW}Checking pod status...${NC}"
READY_PODS=$(kubectl get pods -n ${NAMESPACE} -l app=mathpati --field-selector=status.phase=Running --no-headers 2>/dev/null | wc -l)
TOTAL_PODS=$(kubectl get pods -n ${NAMESPACE} -l app=mathpati --no-headers 2>/dev/null | wc -l)
echo -e "Ready pods: ${GREEN}${READY_PODS}/${TOTAL_PODS}${NC}"
echo ""

# Cleanup port-forward if used
[ -n "$PORT_FORWARD_PID" ] && kill $PORT_FORWARD_PID 2>/dev/null || true

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}All tests passed!${NC}"
echo -e "${GREEN}========================================${NC}"
