#!/bin/bash
set -e

echo "=== Building and Pushing Docker Images ==="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get AWS Account ID and Region
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=${AWS_REGION:-us-east-1}
ECR_REGISTRY="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
IMAGE_TAG=${IMAGE_TAG:-latest}

echo -e "${GREEN}✅ AWS Account ID: $AWS_ACCOUNT_ID${NC}"
echo -e "${GREEN}✅ AWS Region: $AWS_REGION${NC}"
echo -e "${GREEN}✅ ECR Registry: $ECR_REGISTRY${NC}"

# Login to ECR
echo -e "${YELLOW}🔐 Logging in to Amazon ECR...${NC}"
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY

# Create ECR repository if it doesn't exist
echo -e "${YELLOW}📦 Ensuring ECR repositories exist...${NC}"
aws ecr describe-repositories --repository-names mathpati --region $AWS_REGION 2>/dev/null || \
    aws ecr create-repository --repository-name mathpati --region $AWS_REGION

aws ecr describe-repositories --repository-names mathpati-metrics --region $AWS_REGION 2>/dev/null || \
    aws ecr create-repository --repository-name mathpati-metrics --region $AWS_REGION

# Build main application image
echo -e "${YELLOW}🔨 Building main application image...${NC}"
docker build -t mathpati:$IMAGE_TAG .

# Tag and push main application image
echo -e "${YELLOW}📤 Pushing main application image...${NC}"
docker tag mathpati:$IMAGE_TAG $ECR_REGISTRY/mathpati:$IMAGE_TAG
docker tag mathpati:$IMAGE_TAG $ECR_REGISTRY/mathpati:latest
docker push $ECR_REGISTRY/mathpati:$IMAGE_TAG
docker push $ECR_REGISTRY/mathpati:latest

# Build metrics server image
echo -e "${YELLOW}🔨 Building metrics server image...${NC}"
docker build -t mathpati-metrics:$IMAGE_TAG -f Dockerfile.metrics ./server

# Tag and push metrics server image
echo -e "${YELLOW}📤 Pushing metrics server image...${NC}"
docker tag mathpati-metrics:$IMAGE_TAG $ECR_REGISTRY/mathpati-metrics:$IMAGE_TAG
docker tag mathpati-metrics:$IMAGE_TAG $ECR_REGISTRY/mathpati-metrics:latest
docker push $ECR_REGISTRY/mathpati-metrics:$IMAGE_TAG
docker push $ECR_REGISTRY/mathpati-metrics:latest

echo -e "${GREEN}✅ Docker images built and pushed successfully!${NC}"
echo ""
echo -e "${YELLOW}📝 Images:${NC}"
echo "  - $ECR_REGISTRY/mathpati:$IMAGE_TAG"
echo "  - $ECR_REGISTRY/mathpati-metrics:$IMAGE_TAG"
