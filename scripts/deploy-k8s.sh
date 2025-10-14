#!/bin/bash
set -e

echo "=== Deploying Mathpati to Kubernetes ==="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}❌ kubectl is not installed. Please install it first.${NC}"
    exit 1
fi

# Get AWS Account ID and Region
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=${AWS_REGION:-us-east-1}
CLUSTER_NAME=${CLUSTER_NAME:-mathpati-cluster}

echo -e "${GREEN}✅ AWS Account ID: $AWS_ACCOUNT_ID${NC}"
echo -e "${GREEN}✅ AWS Region: $AWS_REGION${NC}"
echo -e "${GREEN}✅ Cluster Name: $CLUSTER_NAME${NC}"

# Update kubeconfig
echo -e "${YELLOW}🔧 Updating kubeconfig...${NC}"
aws eks update-kubeconfig --name $CLUSTER_NAME --region $AWS_REGION

# Replace placeholders in K8s manifests
echo -e "${YELLOW}📝 Updating Kubernetes manifests with AWS Account ID...${NC}"
find k8s -name "*.yaml" -type f -exec sed -i "s/<AWS_ACCOUNT_ID>/$AWS_ACCOUNT_ID/g" {} \;

# Create namespace
echo -e "${YELLOW}📦 Creating namespace...${NC}"
kubectl apply -f k8s/namespace.yaml

# Deploy ConfigMap
echo -e "${YELLOW}⚙️  Deploying ConfigMap...${NC}"
kubectl apply -f k8s/configmap.yaml

# Deploy application
echo -e "${YELLOW}🚀 Deploying application...${NC}"
kubectl apply -f k8s/deployment.yaml

# Deploy service
echo -e "${YELLOW}🌐 Deploying service...${NC}"
kubectl apply -f k8s/service.yaml

# Deploy HPA
echo -e "${YELLOW}📊 Deploying Horizontal Pod Autoscaler...${NC}"
kubectl apply -f k8s/hpa.yaml

# Deploy Ingress (optional)
if [ -f k8s/ingress.yaml ]; then
    echo -e "${YELLOW}🔗 Deploying Ingress...${NC}"
    kubectl apply -f k8s/ingress.yaml
fi

# Deploy monitoring
echo -e "${YELLOW}📈 Deploying monitoring stack...${NC}"
kubectl apply -f k8s/monitoring/

# Wait for deployment to be ready
echo -e "${YELLOW}⏳ Waiting for deployment to be ready...${NC}"
kubectl rollout status deployment/mathpati -n production --timeout=5m

# Get service URL
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo -e "${YELLOW}📊 Deployment Status:${NC}"
kubectl get pods -n production
echo ""
echo -e "${YELLOW}🌐 Service Information:${NC}"
kubectl get svc -n production

# Get LoadBalancer URL
LB_URL=$(kubectl get svc mathpati-service -n production -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
if [ -n "$LB_URL" ]; then
    echo ""
    echo -e "${GREEN}✅ Application URL: http://$LB_URL${NC}"
else
    echo ""
    echo -e "${YELLOW}⏳ LoadBalancer URL is being provisioned. Run this command to get it:${NC}"
    echo "kubectl get svc mathpati-service -n production"
fi
