# Mathpati - Quick Deployment Guide

Get your Mathpati application up and running in minutes!

## 🚀 Quick Start Options

### Option 1: Local Development (Fastest)

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

### Option 2: Docker Development

```bash
# Start with Docker Compose
./scripts/local-dev.sh

# Or manually
docker-compose -f docker-compose.dev.yml up

# Access at http://localhost:5173
```

### Option 3: Production Docker

```bash
# Build and start all services
docker-compose up -d

# Application: http://localhost:3000
# Grafana: http://localhost:3001
# Prometheus: http://localhost:9091
```

### Option 4: Kubernetes Deployment

```bash
# Deploy to Kubernetes
./scripts/deploy.sh production production latest

# Test deployment
./scripts/test-deployment.sh production
```

## 📋 Prerequisites

Choose based on your deployment method:

**Local Development:**
- Node.js 20.x
- npm

**Docker:**
- Docker 20.x+
- Docker Compose 2.x+

**Kubernetes:**
- kubectl
- Access to a Kubernetes cluster
- Container registry access

## 🔧 Configuration

### Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Edit with your settings
nano .env
```

### Docker Registry

For Kubernetes deployment, update image references in `k8s/deployment.yaml`:

```yaml
image: ghcr.io/nakshatra207/mathpati:latest
```

## 📊 Monitoring

### Access Monitoring Tools

**Grafana Dashboard:**
- URL: http://localhost:3001
- Username: admin
- Password: admin

**Prometheus:**
- URL: http://localhost:9091

**Application Metrics:**
- URL: http://localhost:9090/metrics

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Test Docker deployment
./scripts/test-deployment.sh production
```

## 🔄 CI/CD Pipeline

The project includes automated CI/CD with GitHub Actions:

1. **Push to `develop`** → Deploys to staging
2. **Push to `main`** → Deploys to production
3. **Pull Request** → Runs tests and security scans

### Required GitHub Secrets

```
GITHUB_TOKEN (automatic)
AWS_ACCESS_KEY_ID (if using AWS)
AWS_SECRET_ACCESS_KEY (if using AWS)
```

## 📦 Build for Production

```bash
# Build application
npm run build

# Output in dist/ directory
```

## 🐳 Docker Commands

```bash
# Build images
docker build -t mathpati:latest .

# Run container
docker run -p 3000:80 mathpati:latest

# View logs
docker logs -f mathpati-app

# Stop containers
docker-compose down
```

## ☸️ Kubernetes Commands

```bash
# Apply manifests
kubectl apply -f k8s/

# Check status
kubectl get pods -n production

# View logs
kubectl logs -f deployment/mathpati -n production

# Scale deployment
kubectl scale deployment mathpati --replicas=5 -n production

# Rollback
kubectl rollout undo deployment/mathpati -n production
```

## 🔍 Troubleshooting

### Build Issues

```bash
# Clear cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Docker Issues

```bash
# Restart Docker
docker-compose restart

# View logs
docker-compose logs -f

# Rebuild
docker-compose up --build
```

### Kubernetes Issues

```bash
# Check pod status
kubectl describe pod <pod-name> -n production

# View events
kubectl get events -n production

# Port forward for testing
kubectl port-forward svc/mathpati-service 8080:80 -n production
```

## 📚 Documentation

- **Complete DevOps Guide**: [DEVOPS_GUIDE.md](./DEVOPS_GUIDE.md)
- **Deployment Summary**: [DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md)
- **Monitoring Guide**: [MONITORING.md](./MONITORING.md)

## 🆘 Getting Help

1. Check the [DEVOPS_GUIDE.md](./DEVOPS_GUIDE.md) for detailed instructions
2. Review logs: `docker-compose logs -f` or `kubectl logs -f deployment/mathpati`
3. Check GitHub Issues
4. Review existing documentation

## 🎯 Next Steps

1. ✅ Get the app running locally
2. ✅ Set up monitoring with Grafana
3. ✅ Configure CI/CD pipeline
4. ✅ Deploy to staging environment
5. ✅ Run tests and verify
6. ✅ Deploy to production

## 📝 Quick Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm test` | Run tests |
| `npm run build` | Build for production |
| `docker-compose up` | Start with Docker |
| `./scripts/deploy.sh` | Deploy to Kubernetes |
| `./scripts/test-deployment.sh` | Test deployment |

---

**Need more details?** Check the [complete DevOps guide](./DEVOPS_GUIDE.md)
