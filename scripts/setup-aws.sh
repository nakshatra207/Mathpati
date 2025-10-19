#!/bin/bash
set -e

echo "=== AWS Initial Setup for Mathpati ==="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed.${NC}"
    echo "Installing AWS CLI..."
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip awscliv2.zip
    sudo ./aws/install
    rm -rf aws awscliv2.zip
fi

# Configure AWS if not already configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${YELLOW}🔐 AWS credentials not configured. Let's set them up...${NC}"
    aws configure
fi

# Get AWS Account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=${AWS_REGION:-us-east-1}

echo -e "${GREEN}✅ AWS Account ID: $AWS_ACCOUNT_ID${NC}"
echo -e "${GREEN}✅ AWS Region: $AWS_REGION${NC}"

# Create S3 bucket for Terraform state
echo -e "${YELLOW}📦 Creating S3 bucket for Terraform state...${NC}"
if aws s3 ls s3://mathpati-terraform-state 2>/dev/null; then
    echo -e "${GREEN}✅ S3 bucket already exists${NC}"
else
    aws s3api create-bucket \
      --bucket mathpati-terraform-state \
      --region $AWS_REGION
    
    aws s3api put-bucket-versioning \
      --bucket mathpati-terraform-state \
      --versioning-configuration Status=Enabled
    
    echo -e "${GREEN}✅ S3 bucket created${NC}"
fi

# Create DynamoDB table for state locking
echo -e "${YELLOW}🔒 Creating DynamoDB table for state locking...${NC}"
if aws dynamodb describe-table --table-name mathpati-terraform-locks --region $AWS_REGION 2>/dev/null; then
    echo -e "${GREEN}✅ DynamoDB table already exists${NC}"
else
    aws dynamodb create-table \
      --table-name mathpati-terraform-locks \
      --attribute-definitions AttributeName=LockID,AttributeType=S \
      --key-schema AttributeName=LockID,KeyType=HASH \
      --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
      --region $AWS_REGION
    
    echo -e "${GREEN}✅ DynamoDB table created${NC}"
fi

# Create ECR repositories
echo -e "${YELLOW}📦 Creating ECR repositories...${NC}"
for repo in mathpati mathpati-metrics; do
    if aws ecr describe-repositories --repository-names $repo --region $AWS_REGION 2>/dev/null; then
        echo -e "${GREEN}✅ ECR repository $repo already exists${NC}"
    else
        aws ecr create-repository \
          --repository-name $repo \
          --region $AWS_REGION \
          --image-scanning-configuration scanOnPush=true
        echo -e "${GREEN}✅ ECR repository $repo created${NC}"
    fi
done

echo ""
echo -e "${GREEN}✅ AWS setup complete!${NC}"
echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "1. Run: ./scripts/deploy-terraform.sh"
echo "2. Run: ./scripts/build-and-push.sh"
echo ""
echo -e "${YELLOW}💡 Save these values:${NC}"
echo "AWS_ACCOUNT_ID=$AWS_ACCOUNT_ID"
echo "AWS_REGION=$AWS_REGION"
