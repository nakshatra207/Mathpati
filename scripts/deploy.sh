#!/bin/bash

# ==========================================
# Mathpati Deployment Script
# ==========================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
NAMESPACE=${2:-production}
IMAGE_TAG=${3:-latest}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Mathpati Deployment Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "Environment: ${GREEN}${ENVIRONMENT}${NC}"
echo -e "Namespace: ${GREEN}${NAMESPACE}${NC}"
echo -e "Image Tag: ${GREEN}${IMAGE_TAG}${NC}"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"
if ! command_exists kubectl; then
    echo -e "${RED}Error: kubectl is not installed${NC}"
    exit 1
fi

if ! command_exists docker; then
    echo -e "${RED}Error: docker is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Prerequisites check passed${NC}"
echo ""

# Create namespace if it doesn't exist
echo -e "${YELLOW}Creating namespace if not exists...${NC}"
kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -
echo -e "${GREEN}✓ Namespace ready${NC}"
echo ""

# Apply Kubernetes manifests
echo -e "${YELLOW}Applying Kubernetes manifests...${NC}"
cd k8s

# Apply in order
kubectl apply -f namespace.yaml
kubectl apply -f configmap.yaml
kubectl apply -f secrets.env.example || echo "Skipping secrets (use secrets.env)"
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f ingress.yaml
kubectl apply -f hpa.yaml
kubectl apply -f networkpolicy.yaml
kubectl apply -f poddisruptionbudget.yaml

cd ..
echo -e "${GREEN}✓ Manifests applied${NC}"
echo ""

# Wait for deployment to be ready
echo -e "${YELLOW}Waiting for deployment to be ready...${NC}"
kubectl rollout status deployment/mathpati -n ${NAMESPACE} --timeout=5m
echo -e "${GREEN}✓ Deployment ready${NC}"
echo ""

# Get service information
echo -e "${YELLOW}Getting service information...${NC}"
kubectl get svc mathpati-service -n ${NAMESPACE}
echo ""

# Get pod status
echo -e "${YELLOW}Pod status:${NC}"
kubectl get pods -n ${NAMESPACE} -l app=mathpati
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "To check logs: ${BLUE}kubectl logs -f deployment/mathpati -n ${NAMESPACE}${NC}"
echo -e "To port-forward: ${BLUE}kubectl port-forward svc/mathpati-service 8080:80 -n ${NAMESPACE}${NC}"
