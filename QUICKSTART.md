# Quick Start Guide - Mathpati DevOps

Get your Mathpati application deployed to AWS in under 30 minutes!

## Prerequisites

- AWS Account with admin access
- GitHub account
- Basic terminal knowledge

## Step-by-Step Deployment

### 1. Install Required Tools (5 minutes)

```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Install Terraform
wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip
unzip terraform_1.6.0_linux_amd64.zip
sudo mv terraform /usr/local/bin/

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### 2. Configure AWS (2 minutes)

```bash
# Configure AWS credentials
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Region: us-east-1
# Output: json

# Verify
aws sts get-caller-identity
```

### 3. Setup GitHub Secrets (2 minutes)

1. Go to your GitHub repository: https://github.com/nakshatra207/Mathpati
2. Navigate to **Settings → Secrets and variables → Actions**
3. Add these secrets:
   - `AWS_ACCESS_KEY_ID`: Your AWS access key
   - `AWS_SECRET_ACCESS_KEY`: Your AWS secret key

### 4. Initialize Terraform Backend (3 minutes)

```bash
# Get your AWS account ID
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "Your AWS Account ID: $AWS_ACCOUNT_ID"

# Create S3 bucket for Terraform state
aws s3api create-bucket \
  --bucket mathpati-terraform-state \
  --region us-east-1

aws s3api put-bucket-versioning \
  --bucket mathpati-terraform-state \
  --versioning-configuration Status=Enabled

# Create DynamoDB table for state locking
aws dynamodb create-table \
  --table-name mathpati-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --region us-east-1
```

### 5. Deploy Infrastructure (10 minutes)

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Deploy with Terraform
./scripts/deploy-terraform.sh
```

When prompted, type `yes` to confirm.

**Save the outputs!** You'll see:
- ALB DNS name (your application URL)
- ECR repository URL
- ECS cluster name

### 6. Build and Deploy Application (8 minutes)

```bash
# Build and push Docker images
./scripts/build-and-push.sh

# Wait for ECS service to stabilize
aws ecs wait services-stable \
  --cluster mathpati-cluster \
  --services mathpati-service \
  --region us-east-1
```

### 7. Access Your Application

```bash
# Get your application URL
terraform -chdir=terraform output application_url
```

Open the URL in your browser! 🎉

---

## Automated Deployment (CI/CD)

After initial setup, every push to `main` branch automatically:
1. Runs tests
2. Builds Docker images
3. Deploys to AWS
4. Runs health checks

Just commit and push:
```bash
git add .
git commit -m "Update application"
git push origin main
```

---

## Monitoring

### View Logs

```bash
# Tail application logs
aws logs tail /ecs/mathpati --follow
```

### Check Service Health

```bash
# ECS service status
aws ecs describe-services \
  --cluster mathpati-cluster \
  --services mathpati-service \
  --region us-east-1 \
  --query 'services[0].{Status:status,Running:runningCount,Desired:desiredCount}'
```

### CloudWatch Dashboard

```bash
# Open CloudWatch console
echo "https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=mathpati-dashboard"
```

---

## Common Commands

### Scale Application

```bash
# Scale to 5 tasks
aws ecs update-service \
  --cluster mathpati-cluster \
  --service mathpati-service \
  --desired-count 5 \
  --region us-east-1
```

### Rollback Deployment

```bash
# List task definitions
aws ecs list-task-definitions --family-prefix mathpati

# Update to previous version
aws ecs update-service \
  --cluster mathpati-cluster \
  --service mathpati-service \
  --task-definition mathpati:PREVIOUS_REVISION
```

### View Metrics

```bash
# CPU utilization
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name CPUUtilization \
  --dimensions Name=ServiceName,Value=mathpati-service Name=ClusterName,Value=mathpati-cluster \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average
```

---

## Cleanup (Remove Everything)

**Warning**: This will delete all resources and data!

```bash
# Destroy infrastructure
cd terraform
terraform destroy -auto-approve

# Delete ECR images
aws ecr delete-repository --repository-name mathpati --force --region us-east-1
aws ecr delete-repository --repository-name mathpati-metrics --force --region us-east-1

# Delete S3 bucket
aws s3 rb s3://mathpati-terraform-state --force

# Delete DynamoDB table
aws dynamodb delete-table --table-name mathpati-terraform-locks --region us-east-1
```

---

## Troubleshooting

### Issue: Tasks keep restarting

**Check logs**:
```bash
aws logs tail /ecs/mathpati --follow
```

**Common fixes**:
- Ensure health check endpoint `/health` returns 200
- Check if image exists in ECR
- Verify security group allows traffic on port 80

### Issue: Can't access application

**Check ALB target health**:
```bash
# Get target group ARN
TG_ARN=$(aws elbv2 describe-target-groups --names mathpati-tg --query 'TargetGroups[0].TargetGroupArn' --output text)

# Check health
aws elbv2 describe-target-health --target-group-arn $TG_ARN
```

**Fix**: Wait 2-3 minutes for targets to become healthy

### Issue: Deployment failed

**Check service events**:
```bash
aws ecs describe-services \
  --cluster mathpati-cluster \
  --services mathpati-service \
  --query 'services[0].events[0:5]'
```

---

## Next Steps

1. **Set up custom domain**: Configure Route53 and SSL certificate
2. **Enable HTTPS**: Add ACM certificate to ALB
3. **Set up alerts**: Configure SNS email notifications
4. **Add database**: Deploy RDS if needed
5. **Configure backups**: Set up AWS Backup

See [DEVOPS.md](DEVOPS.md) for detailed documentation.

---

## Cost Estimate

**Monthly cost**: ~$90-140

Breakdown:
- ECS Fargate: $30-50
- ALB: $20-25
- NAT Gateway: $30-45
- CloudWatch: $5-10
- Other: $5-10

**Free tier eligible** for first 12 months (partial costs covered)

---

## Support

- **Documentation**: See [DEVOPS.md](DEVOPS.md)
- **Issues**: https://github.com/nakshatra207/Mathpati/issues
- **AWS Support**: https://console.aws.amazon.com/support/

---

**Happy Deploying! 🚀**
