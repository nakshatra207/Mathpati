# DevOps Documentation - Mathpati

Complete DevOps setup for the Mathpati application with AWS deployment, CI/CD, monitoring, and infrastructure as code.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Initial Setup](#initial-setup)
4. [Infrastructure Deployment](#infrastructure-deployment)
5. [Application Deployment](#application-deployment)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [Monitoring and Logging](#monitoring-and-logging)
8. [Scaling and High Availability](#scaling-and-high-availability)
9. [Security Best Practices](#security-best-practices)
10. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### Infrastructure Components

```
┌─────────────────────────────────────────────────────────────┐
│                         AWS Cloud                            │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                    VPC (10.0.0.0/16)                   │ │
│  │                                                         │ │
│  │  ┌──────────────┐         ┌──────────────┐            │ │
│  │  │ Public Subnet│         │ Public Subnet│            │ │
│  │  │   (AZ-1)     │         │   (AZ-2)     │            │ │
│  │  │              │         │              │            │ │
│  │  │  ┌────────┐  │         │  ┌────────┐  │            │ │
│  │  │  │  ALB   │  │         │  │  NAT   │  │            │ │
│  │  │  └────────┘  │         │  └────────┘  │            │ │
│  │  └──────────────┘         └──────────────┘            │ │
│  │                                                         │ │
│  │  ┌──────────────┐         ┌──────────────┐            │ │
│  │  │Private Subnet│         │Private Subnet│            │ │
│  │  │   (AZ-1)     │         │   (AZ-2)     │            │ │
│  │  │              │         │              │            │ │
│  │  │  ┌────────┐  │         │  ┌────────┐  │            │ │
│  │  │  │ECS Task│  │         │  │ECS Task│  │            │ │
│  │  │  └────────┘  │         │  └────────┘  │            │ │
│  │  └──────────────┘         └──────────────┘            │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   ECR    │  │CloudWatch│  │    SNS   │  │  Route53 │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Container Orchestration**: AWS ECS Fargate / Amazon EKS
- **Container Registry**: Amazon ECR
- **Load Balancing**: Application Load Balancer (ALB)
- **Infrastructure as Code**: Terraform
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana + CloudWatch
- **Logging**: CloudWatch Logs
- **Networking**: VPC with public/private subnets across multiple AZs

---

## Prerequisites

### Required Tools

Install the following tools before proceeding:

```bash
# AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Terraform
wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip
unzip terraform_1.6.0_linux_amd64.zip
sudo mv terraform /usr/local/bin/

# Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# kubectl (for Kubernetes deployment)
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# eksctl (for EKS cluster management)
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin
```

### AWS Account Setup

1. **Create AWS Account** (if you don't have one)
2. **Configure AWS CLI**:
   ```bash
   aws configure
   # Enter your AWS Access Key ID
   # Enter your AWS Secret Access Key
   # Default region: us-east-1
   # Default output format: json
   ```

3. **Verify AWS credentials**:
   ```bash
   aws sts get-caller-identity
   ```

### GitHub Secrets

Add the following secrets to your GitHub repository:

- `AWS_ACCESS_KEY_ID`: Your AWS access key
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret key

Go to: **Repository Settings → Secrets and variables → Actions → New repository secret**

---

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/nakshatra207/Mathpati.git
cd Mathpati
```

### 2. Configure Environment Variables

Create a `.env` file (already exists, update if needed):

```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=<your-account-id>

# Application Configuration
NODE_ENV=production
PORT=80

# Monitoring
METRICS_PORT=9090
```

### 3. Make Scripts Executable

```bash
chmod +x scripts/*.sh
```

---

## Infrastructure Deployment

### Option 1: Deploy with Terraform (Recommended)

#### Step 1: Initialize Terraform Backend

First, create the S3 bucket and DynamoDB table for Terraform state:

```bash
# Create S3 bucket for Terraform state
aws s3api create-bucket \
  --bucket mathpati-terraform-state \
  --region us-east-1

# Enable versioning
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

#### Step 2: Deploy Infrastructure

```bash
./scripts/deploy-terraform.sh
```

This will:
- Create VPC with public/private subnets across 2 AZs
- Set up NAT Gateways and Internet Gateway
- Create Application Load Balancer
- Set up ECS Cluster with Fargate
- Create ECR repositories
- Configure CloudWatch logging and alarms
- Set up auto-scaling policies

#### Step 3: Review Outputs

After deployment, Terraform will output important information:

```bash
terraform output
```

Save these values:
- `alb_dns_name`: Your application URL
- `ecr_repository_url`: Docker image repository
- `ecs_cluster_name`: ECS cluster name

### Option 2: Deploy with EKS (Kubernetes)

#### Step 1: Create EKS Cluster

```bash
eksctl create cluster \
  --name mathpati-cluster \
  --region us-east-1 \
  --nodegroup-name mathpati-nodes \
  --node-type t3.medium \
  --nodes 2 \
  --nodes-min 2 \
  --nodes-max 4 \
  --managed
```

This takes about 15-20 minutes.

#### Step 2: Install AWS Load Balancer Controller

```bash
# Download IAM policy
curl -o iam_policy.json https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.6.0/docs/install/iam_policy.json

# Create IAM policy
aws iam create-policy \
  --policy-name AWSLoadBalancerControllerIAMPolicy \
  --policy-document file://iam_policy.json

# Create service account
eksctl create iamserviceaccount \
  --cluster=mathpati-cluster \
  --namespace=kube-system \
  --name=aws-load-balancer-controller \
  --attach-policy-arn=arn:aws:iam::<AWS_ACCOUNT_ID>:policy/AWSLoadBalancerControllerIAMPolicy \
  --approve

# Install controller
kubectl apply -k "github.com/aws/eks-charts/stable/aws-load-balancer-controller//crds?ref=master"
helm repo add eks https://aws.github.io/eks-charts
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=mathpati-cluster \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller
```

---

## Application Deployment

### Step 1: Build and Push Docker Images

```bash
./scripts/build-and-push.sh
```

This will:
- Build the main application Docker image
- Build the metrics server Docker image
- Push both images to ECR

### Step 2: Deploy to ECS

The GitHub Actions pipeline will automatically deploy to ECS when you push to the `main` branch.

**Manual deployment**:

```bash
# Update ECS service with new image
aws ecs update-service \
  --cluster mathpati-cluster \
  --service mathpati-service \
  --force-new-deployment \
  --region us-east-1
```

### Step 3: Deploy to Kubernetes (if using EKS)

```bash
./scripts/deploy-k8s.sh
```

This will:
- Create the production namespace
- Deploy ConfigMaps
- Deploy the application
- Set up services and ingress
- Configure auto-scaling
- Deploy monitoring stack

### Step 4: Verify Deployment

**For ECS**:
```bash
# Check service status
aws ecs describe-services \
  --cluster mathpati-cluster \
  --services mathpati-service \
  --region us-east-1

# Check running tasks
aws ecs list-tasks \
  --cluster mathpati-cluster \
  --service-name mathpati-service \
  --region us-east-1
```

**For Kubernetes**:
```bash
# Check pods
kubectl get pods -n production

# Check services
kubectl get svc -n production

# Check deployment status
kubectl rollout status deployment/mathpati -n production
```

### Step 5: Access the Application

**Get the application URL**:

For ECS:
```bash
terraform output application_url
# or
aws elbv2 describe-load-balancers \
  --names mathpati-alb \
  --query 'LoadBalancers[0].DNSName' \
  --output text
```

For Kubernetes:
```bash
kubectl get svc mathpati-service -n production
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

The CI/CD pipeline (`.github/workflows/ci-cd.yml`) automatically:

1. **On Pull Request**:
   - Runs tests
   - Performs security scanning
   - Builds the application

2. **On Push to Main**:
   - Runs all tests
   - Builds Docker images
   - Pushes to ECR
   - Deploys to ECS/EKS
   - Runs smoke tests

### Pipeline Stages

```
┌─────────────┐
│   Trigger   │
│ (Push/PR)   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    Test     │
│  & Lint     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Security   │
│    Scan     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    Build    │
│   Docker    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Push to    │
│     ECR     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Deploy    │
│  to AWS     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Verify    │
│  & Monitor  │
└─────────────┘
```

### Manual Deployment

To trigger a manual deployment:

```bash
# Tag a new version
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# Or push to main branch
git push origin main
```

---

## Monitoring and Logging

### CloudWatch Dashboards

Access CloudWatch dashboards:
```bash
aws cloudwatch get-dashboard \
  --dashboard-name mathpati-dashboard \
  --region us-east-1
```

### Prometheus & Grafana (Kubernetes)

**Access Grafana**:
```bash
# Port forward to Grafana
kubectl port-forward svc/grafana 3000:3000 -n production

# Open http://localhost:3000
# Username: admin
# Password: admin
```

**Access Prometheus**:
```bash
kubectl port-forward svc/prometheus 9090:9090 -n production
# Open http://localhost:9090
```

### CloudWatch Logs

**View application logs**:
```bash
# Get log streams
aws logs describe-log-streams \
  --log-group-name /ecs/mathpati \
  --order-by LastEventTime \
  --descending \
  --max-items 5

# Tail logs
aws logs tail /ecs/mathpati --follow
```

### Alarms

Configured CloudWatch alarms:
- **High CPU Usage** (>80%)
- **High Memory Usage** (>85%)
- **Unhealthy Targets**
- **High 5XX Error Rate**

Alerts are sent to SNS topic. Update email in `terraform/cloudwatch.tf`:
```hcl
endpoint  = "your-email@example.com"
```

---

## Scaling and High Availability

### Auto-Scaling Configuration

**ECS Auto-Scaling**:
- Min tasks: 2
- Max tasks: 10
- Scale up: CPU > 70% or Memory > 80%
- Scale down: CPU < 40% and Memory < 50%

**Kubernetes HPA**:
```bash
# Check HPA status
kubectl get hpa -n production

# Manually scale
kubectl scale deployment mathpati --replicas=5 -n production
```

### Load Testing

Test auto-scaling with load:

```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Run load test
ab -n 10000 -c 100 http://your-alb-url/
```

### High Availability Features

- **Multi-AZ deployment**: Resources spread across 2+ availability zones
- **Health checks**: Automatic replacement of unhealthy containers
- **Rolling updates**: Zero-downtime deployments
- **Circuit breaker**: Automatic rollback on deployment failures

---

## Security Best Practices

### Implemented Security Measures

1. **Network Security**:
   - Private subnets for application containers
   - Security groups with least privilege
   - NAT Gateways for outbound traffic only

2. **Container Security**:
   - Non-root user in containers
   - Read-only root filesystem where possible
   - Dropped unnecessary capabilities
   - Regular vulnerability scanning with Trivy

3. **Secrets Management**:
   - AWS Secrets Manager for sensitive data
   - GitHub Secrets for CI/CD credentials
   - No hardcoded secrets in code

4. **IAM**:
   - Least privilege IAM roles
   - Separate execution and task roles
   - MFA for AWS console access

5. **Monitoring**:
   - CloudWatch alarms for anomalies
   - CloudTrail for audit logging
   - VPC Flow Logs enabled

### Security Checklist

- [ ] Enable AWS GuardDuty
- [ ] Set up AWS WAF on ALB
- [ ] Enable encryption at rest for EBS volumes
- [ ] Configure AWS Config rules
- [ ] Set up AWS Security Hub
- [ ] Enable MFA for all IAM users
- [ ] Rotate access keys regularly
- [ ] Review security group rules
- [ ] Enable VPC Flow Logs
- [ ] Set up AWS Backup

---

## Troubleshooting

### Common Issues

#### 1. ECS Tasks Not Starting

**Check task logs**:
```bash
aws ecs describe-tasks \
  --cluster mathpati-cluster \
  --tasks <task-id> \
  --region us-east-1
```

**Common causes**:
- Image not found in ECR
- Insufficient memory/CPU
- Failed health checks
- IAM permission issues

#### 2. ALB Health Checks Failing

**Check target health**:
```bash
aws elbv2 describe-target-health \
  --target-group-arn <target-group-arn>
```

**Fix**:
- Ensure `/health` endpoint returns 200
- Check security group rules
- Verify container is listening on correct port

#### 3. High Memory Usage

**Check CloudWatch metrics**:
```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name MemoryUtilization \
  --dimensions Name=ServiceName,Value=mathpati-service \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-02T00:00:00Z \
  --period 300 \
  --statistics Average
```

**Fix**:
- Increase task memory in task definition
- Check for memory leaks
- Optimize application code

#### 4. Deployment Rollback

**ECS**:
```bash
aws ecs update-service \
  --cluster mathpati-cluster \
  --service mathpati-service \
  --task-definition mathpati:previous-revision
```

**Kubernetes**:
```bash
./scripts/rollback.sh
```

### Useful Commands

```bash
# Check ECS service events
aws ecs describe-services \
  --cluster mathpati-cluster \
  --services mathpati-service \
  --query 'services[0].events' \
  --region us-east-1

# Get container logs
aws logs tail /ecs/mathpati --follow

# Check Kubernetes events
kubectl get events -n production --sort-by='.lastTimestamp'

# Describe pod
kubectl describe pod <pod-name> -n production

# Execute command in container
kubectl exec -it <pod-name> -n production -- /bin/sh

# Check resource usage
kubectl top pods -n production
kubectl top nodes
```

---

## Cost Optimization

### Estimated Monthly Costs

- **ECS Fargate**: ~$30-50 (2 tasks, 0.25 vCPU, 0.5GB each)
- **ALB**: ~$20-25
- **NAT Gateway**: ~$30-45 (per AZ)
- **CloudWatch**: ~$5-10
- **ECR**: ~$1-5
- **Data Transfer**: Variable

**Total**: ~$90-140/month

### Cost Saving Tips

1. **Use Spot Instances** for non-production
2. **Right-size containers** based on actual usage
3. **Use single NAT Gateway** for dev/staging
4. **Enable S3 lifecycle policies** for logs
5. **Use CloudWatch Logs Insights** instead of exporting
6. **Delete unused ECR images**
7. **Use AWS Savings Plans**

---

## Maintenance

### Regular Tasks

**Weekly**:
- Review CloudWatch alarms
- Check for security updates
- Review application logs

**Monthly**:
- Update dependencies
- Review and optimize costs
- Backup configurations
- Test disaster recovery

**Quarterly**:
- Security audit
- Performance review
- Capacity planning
- Update documentation

---

## Support and Resources

### Documentation Links

- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

### Getting Help

- **Issues**: Open an issue on GitHub
- **Email**: your-email@example.com
- **AWS Support**: Use AWS Support Center

---

## License

MIT License - See LICENSE file for details
