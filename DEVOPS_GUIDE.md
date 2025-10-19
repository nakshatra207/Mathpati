# Mathpati DevOps Guide

Complete guide for deploying and managing the Mathpati application.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Docker Deployment](#docker-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring & Logging](#monitoring--logging)
- [Troubleshooting](#troubleshooting)

## Overview

Mathpati is a modern web application built with:
- **Frontend**: React + Vite + TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **Metrics**: Express.js metrics server
- **Container**: Docker + Kubernetes
- **CI/CD**: GitHub Actions

## Prerequisites

### Required Tools

- **Node.js** 20.x or higher
- **Docker** 20.x or higher
- **Docker Compose** 2.x or higher
- **kubectl** (for Kubernetes deployments)
- **Git**

### Optional Tools

- **Helm** (for advanced Kubernetes deployments)
- **k9s** (Kubernetes CLI UI)
- **Terraform** (for infrastructure as code)

## Local Development

### Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Docker Development Environment

```bash
# Start development containers
./scripts/local-dev.sh

# Or manually
docker-compose -f docker-compose.dev.yml up

# Access the application
# Frontend: http://localhost:5173
# Metrics: http://localhost:9090
```

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
# Edit .env with your configuration
```

## Docker Deployment

### Build Docker Images

```bash
# Build production images
docker build -t mathpati:latest .
docker build -t mathpati-metrics:latest -f Dockerfile.metrics ./server
```

### Run with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Services

- **mathpati-app**: Main application (port 3000)
- **metrics-server**: Metrics API (port 9090)
- **prometheus**: Monitoring (port 9091)
- **grafana**: Dashboards (port 3001)

## Kubernetes Deployment

### Prerequisites

1. A Kubernetes cluster (EKS, GKE, AKS, or local with minikube/kind)
2. kubectl configured to access your cluster
3. Container images pushed to a registry

### Deploy to Kubernetes

```bash
# Using the deployment script
./scripts/deploy.sh production production latest

# Or manually
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml
```

### Using Kustomize

```bash
# Deploy with kustomize
kubectl apply -k k8s/

# Or with kubectl kustomize
kubectl kustomize k8s/ | kubectl apply -f -
```

### Verify Deployment

```bash
# Check deployment status
kubectl get deployments -n production

# Check pods
kubectl get pods -n production

# Check services
kubectl get svc -n production

# View logs
kubectl logs -f deployment/mathpati -n production
```

### Test Deployment

```bash
# Run automated tests
./scripts/test-deployment.sh production
```

## CI/CD Pipeline

### GitHub Actions Workflows

The project includes several GitHub Actions workflows:

1. **main-ci-cd.yml**: Complete CI/CD pipeline
   - Lint and test
   - Security scanning
   - Build application
   - Build and push Docker images
   - Deploy to staging/production

2. **docker-publish.yml**: Docker image publishing
   - Multi-platform builds (amd64, arm64)
   - Push to GitHub Container Registry

3. **build-and-test.yml**: Quick build and test
   - Runs on every push and PR

### Required Secrets

Configure these secrets in your GitHub repository:

```
# GitHub Container Registry (automatic)
GITHUB_TOKEN (automatically provided)

# AWS (if using AWS)
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY

# Optional
CODECOV_TOKEN (for code coverage)
```

### Triggering Deployments

```bash
# Push to main branch triggers production deployment
git push origin main

# Push to develop branch triggers staging deployment
git push origin develop

# Manual trigger via GitHub UI
# Go to Actions → Select workflow → Run workflow
```

## Monitoring & Logging

### Prometheus Metrics

Access Prometheus at `http://localhost:9091` (Docker) or via Kubernetes service.

**Available Metrics:**
- HTTP request duration
- Request count by status code
- Active connections
- System metrics (CPU, memory)

### Grafana Dashboards

Access Grafana at `http://localhost:3001` (Docker) or via Kubernetes service.

**Default Credentials:**
- Username: `admin`
- Password: `admin`

### Application Logs

```bash
# Docker
docker-compose logs -f mathpati-app

# Kubernetes
kubectl logs -f deployment/mathpati -n production

# Follow logs for all pods
kubectl logs -f -l app=mathpati -n production
```

### Health Checks

```bash
# Application health
curl http://localhost:3000/health

# Metrics health
curl http://localhost:9090/health

# Kubernetes health
kubectl get pods -n production
```

## Troubleshooting

### Common Issues

#### 1. Build Failures

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Docker build cache
docker builder prune -a
```

#### 2. Container Won't Start

```bash
# Check container logs
docker logs mathpati-app

# Check container status
docker ps -a

# Inspect container
docker inspect mathpati-app
```

#### 3. Kubernetes Pod Crashes

```bash
# Check pod status
kubectl describe pod <pod-name> -n production

# View pod logs
kubectl logs <pod-name> -n production

# Check events
kubectl get events -n production --sort-by='.lastTimestamp'
```

#### 4. Service Not Accessible

```bash
# Check service
kubectl get svc -n production

# Port forward for testing
kubectl port-forward svc/mathpati-service 8080:80 -n production

# Check ingress
kubectl get ingress -n production
kubectl describe ingress mathpati-ingress -n production
```

### Debug Mode

```bash
# Enable debug logging
export LOG_LEVEL=debug

# Run with verbose output
npm run dev -- --debug

# Docker debug
docker-compose --verbose up
```

### Performance Issues

```bash
# Check resource usage
kubectl top pods -n production
kubectl top nodes

# Scale deployment
kubectl scale deployment mathpati --replicas=5 -n production

# Check HPA status
kubectl get hpa -n production
```

## Security Best Practices

1. **Never commit secrets** - Use environment variables and secret management
2. **Regular updates** - Keep dependencies updated
3. **Security scanning** - Automated with Trivy in CI/CD
4. **HTTPS only** - Use TLS certificates in production
5. **Network policies** - Restrict pod-to-pod communication
6. **RBAC** - Use proper Kubernetes role-based access control

## Backup and Recovery

### Database Backups (if applicable)

```bash
# Backup
kubectl exec -n production <pod-name> -- backup-script.sh

# Restore
kubectl exec -n production <pod-name> -- restore-script.sh
```

### Configuration Backups

```bash
# Export all Kubernetes resources
kubectl get all -n production -o yaml > backup.yaml

# Export specific resources
kubectl get configmap -n production -o yaml > configmaps-backup.yaml
```

## Scaling

### Manual Scaling

```bash
# Scale deployment
kubectl scale deployment mathpati --replicas=5 -n production
```

### Auto-scaling (HPA)

The Horizontal Pod Autoscaler is configured to scale based on CPU usage:

```yaml
minReplicas: 2
maxReplicas: 10
targetCPUUtilizationPercentage: 70
```

## Rollback

### Kubernetes Rollback

```bash
# View rollout history
kubectl rollout history deployment/mathpati -n production

# Rollback to previous version
kubectl rollout undo deployment/mathpati -n production

# Rollback to specific revision
kubectl rollout undo deployment/mathpati --to-revision=2 -n production
```

### Docker Rollback

```bash
# Stop current version
docker-compose down

# Pull previous version
docker pull mathpati:previous-tag

# Start with previous version
docker-compose up -d
```

## Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)

## Support

For issues and questions:
- Create an issue on GitHub
- Check existing documentation
- Review logs and metrics

---

**Last Updated**: 2024
**Version**: 1.0.0
