#!/bin/bash
set -e

echo "=== Deploying Mathpati Infrastructure with Terraform ==="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if Terraform is installed
if ! command -v terraform &> /dev/null; then
    echo -e "${RED}❌ Terraform is not installed. Please install it first.${NC}"
    exit 1
fi

# Check AWS credentials
echo -e "${YELLOW}🔐 Checking AWS credentials...${NC}"
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials are not configured properly.${NC}"
    exit 1
fi

AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=${AWS_REGION:-us-east-1}

echo -e "${GREEN}✅ AWS Account ID: $AWS_ACCOUNT_ID${NC}"
echo -e "${GREEN}✅ AWS Region: $AWS_REGION${NC}"

# Navigate to terraform directory
cd terraform

# Initialize Terraform
echo -e "${YELLOW}📦 Initializing Terraform...${NC}"
terraform init

# Validate Terraform configuration
echo -e "${YELLOW}✅ Validating Terraform configuration...${NC}"
terraform validate

# Plan Terraform changes
echo -e "${YELLOW}📋 Planning Terraform changes...${NC}"
terraform plan -out=tfplan

# Ask for confirmation
read -p "Do you want to apply these changes? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo -e "${RED}❌ Deployment cancelled.${NC}"
    exit 0
fi

# Apply Terraform changes
echo -e "${YELLOW}🚀 Applying Terraform changes...${NC}"
terraform apply tfplan

# Get outputs
echo -e "${GREEN}✅ Infrastructure deployed successfully!${NC}"
echo ""
echo -e "${YELLOW}📊 Outputs:${NC}"
terraform output

# Save outputs to file
terraform output -json > ../outputs.json

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "1. Build and push Docker image: ./scripts/build-and-push.sh"
echo "2. Deploy to ECS: ./scripts/deploy-ecs.sh"
