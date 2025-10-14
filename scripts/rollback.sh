#!/bin/bash
set -e

echo "=== Rolling Back Mathpati Deployment ==="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

NAMESPACE=${NAMESPACE:-production}
DEPLOYMENT=${DEPLOYMENT:-mathpati}

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}❌ kubectl is not installed.${NC}"
    exit 1
fi

# Show deployment history
echo -e "${YELLOW}📜 Deployment History:${NC}"
kubectl rollout history deployment/$DEPLOYMENT -n $NAMESPACE

# Ask for revision number
read -p "Enter revision number to rollback to (or press Enter for previous): " revision

# Perform rollback
if [ -z "$revision" ]; then
    echo -e "${YELLOW}⏪ Rolling back to previous revision...${NC}"
    kubectl rollout undo deployment/$DEPLOYMENT -n $NAMESPACE
else
    echo -e "${YELLOW}⏪ Rolling back to revision $revision...${NC}"
    kubectl rollout undo deployment/$DEPLOYMENT -n $NAMESPACE --to-revision=$revision
fi

# Wait for rollback to complete
echo -e "${YELLOW}⏳ Waiting for rollback to complete...${NC}"
kubectl rollout status deployment/$DEPLOYMENT -n $NAMESPACE

echo -e "${GREEN}✅ Rollback complete!${NC}"

# Show current status
echo ""
echo -e "${YELLOW}📊 Current Status:${NC}"
kubectl get pods -n $NAMESPACE -l app=$DEPLOYMENT
