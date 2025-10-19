#!/bin/bash

echo "=== Cleanup Mathpati Infrastructure ==="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

AWS_REGION=${AWS_REGION:-us-east-1}

echo -e "${RED}⚠️  WARNING: This will delete ALL Mathpati infrastructure!${NC}"
echo -e "${RED}This action cannot be undone.${NC}"
echo ""
read -p "Are you sure you want to continue? Type 'DELETE' to confirm: " confirm

if [ "$confirm" != "DELETE" ]; then
    echo -e "${GREEN}Cleanup cancelled.${NC}"
    exit 0
fi

echo ""
echo -e "${YELLOW}🗑️  Starting cleanup...${NC}"

# Delete ECS Service
echo -e "${YELLOW}Deleting ECS service...${NC}"
aws ecs update-service \
  --cluster mathpati-cluster \
  --service mathpati-service \
  --desired-count 0 \
  --region $AWS_REGION 2>/dev/null || true

aws ecs delete-service \
  --cluster mathpati-cluster \
  --service mathpati-service \
  --force \
  --region $AWS_REGION 2>/dev/null || true

# Delete ECR images
echo -e "${YELLOW}Deleting ECR repositories...${NC}"
for repo in mathpati mathpati-metrics; do
    aws ecr delete-repository \
      --repository-name $repo \
      --force \
      --region $AWS_REGION 2>/dev/null || true
done

# Destroy Terraform infrastructure
echo -e "${YELLOW}Destroying Terraform infrastructure...${NC}"
cd terraform
terraform destroy -auto-approve || true
cd ..

# Delete S3 bucket
echo -e "${YELLOW}Deleting S3 bucket...${NC}"
aws s3 rm s3://mathpati-terraform-state --recursive 2>/dev/null || true
aws s3 rb s3://mathpati-terraform-state --force 2>/dev/null || true

# Delete DynamoDB table
echo -e "${YELLOW}Deleting DynamoDB table...${NC}"
aws dynamodb delete-table \
  --table-name mathpati-terraform-locks \
  --region $AWS_REGION 2>/dev/null || true

# Delete CloudWatch log groups
echo -e "${YELLOW}Deleting CloudWatch log groups...${NC}"
aws logs delete-log-group \
  --log-group-name /ecs/mathpati \
  --region $AWS_REGION 2>/dev/null || true

# Delete SNS topics
echo -e "${YELLOW}Deleting SNS topics...${NC}"
TOPIC_ARN=$(aws sns list-topics --region $AWS_REGION --query 'Topics[?contains(TopicArn, `mathpati-alerts`)].TopicArn' --output text)
if [ -n "$TOPIC_ARN" ]; then
    aws sns delete-topic --topic-arn $TOPIC_ARN --region $AWS_REGION 2>/dev/null || true
fi

echo ""
echo -e "${GREEN}✅ Cleanup complete!${NC}"
echo ""
echo -e "${YELLOW}Note: Some resources may take a few minutes to fully delete.${NC}"
echo -e "${YELLOW}Check AWS Console to verify all resources are removed.${NC}"
