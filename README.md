# Kaun Banega Mathpati - Math Quiz Challenge

[![CI/CD Pipeline](https://github.com/nakshatra207/Mathpati/actions/workflows/main-ci-cd.yml/badge.svg)](https://github.com/nakshatra207/Mathpati/actions/workflows/main-ci-cd.yml)
[![Docker](https://github.com/nakshatra207/Mathpati/actions/workflows/docker-publish.yml/badge.svg)](https://github.com/nakshatra207/Mathpati/actions/workflows/docker-publish.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 📋 Project Overview

Kaun Banega Mathpati is an interactive math quiz game that tests your mathematical skills with challenging questions. Built with modern web technologies and production-ready DevOps infrastructure.

## ✨ Features

- 🎮 Interactive math quiz game
- 🎨 Modern UI with TailwindCSS and shadcn/ui
- 📊 Real-time metrics and monitoring
- 🐳 Docker containerization
- ☸️ Kubernetes-ready deployment
- 🔄 Automated CI/CD pipeline
- 📈 Prometheus metrics & Grafana dashboards
- 🔒 Security scanning and best practices

## 🚀 Quick Start

### Option 1: Local Development (Fastest)

```bash
# Clone the repository
git clone https://github.com/nakshatra207/Mathpati.git
cd Mathpati

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

### Option 2: Using Make Commands

```bash
# Setup project
make setup

# Start development
make dev

# Run tests
make test

# Build for production
make build
```

### Option 3: Docker Development

```bash
# Start development environment
make docker-dev

# Or manually
docker-compose -f docker-compose.dev.yml up

# Access at http://localhost:5173
```

### Option 4: Production Docker

```bash
# Start all services (app + monitoring)
make docker-up

# Application: http://localhost:3000
# Grafana: http://localhost:3001
# Prometheus: http://localhost:9091
```

## 📚 Documentation

- **[Quick Start Guide](./DEPLOYMENT_QUICKSTART.md)** - Get started in minutes
- **[Complete DevOps Guide](./DEVOPS_GUIDE.md)** - Comprehensive deployment guide
- **[Project Status](./PROJECT_STATUS.md)** - Current implementation status
- **[Deployment Summary](./DEPLOYMENT_SUMMARY.md)** - Deployment overview
- **[Monitoring Guide](./MONITORING.md)** - Monitoring and observability

## 🛠️ Technology Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **shadcn/ui** - UI components
- **React Query** - Data fetching

### DevOps & Infrastructure
- **Docker** - Containerization
- **Kubernetes** - Orchestration
- **GitHub Actions** - CI/CD
- **Prometheus** - Metrics
- **Grafana** - Visualization
- **Terraform** - Infrastructure as Code

## 🏗️ Project Structure

```
Mathpati/
├── .github/workflows/    # CI/CD pipelines
├── k8s/                  # Kubernetes manifests
├── scripts/              # Deployment scripts
├── server/               # Metrics server
├── src/                  # Application source
├── terraform/            # Infrastructure as Code
├── docker-compose.yml    # Production stack
├── Dockerfile            # Production image
├── Makefile             # Command shortcuts
└── README.md            # This file
```

## 🐳 Docker Deployment

### Build Images

```bash
# Build production images
make docker-build

# Or manually
docker build -t mathpati:latest .
```

### Run with Docker Compose

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## ☸️ Kubernetes Deployment

### Prerequisites
- Kubernetes cluster (EKS, GKE, AKS, or local)
- kubectl configured
- Container images in registry

### Deploy

```bash
# Using deployment script
./scripts/deploy.sh production production latest

# Or using make
make k8s-deploy

# Check status
make k8s-status

# View logs
make k8s-logs
```

## 🔄 CI/CD Pipeline

The project includes automated CI/CD with GitHub Actions:

- **Push to `develop`** → Deploy to staging
- **Push to `main`** → Deploy to production
- **Pull Request** → Run tests and security scans
- **Tag `v*.*.*`** → Create release

### Workflows

1. **main-ci-cd.yml** - Complete CI/CD pipeline
2. **docker-publish.yml** - Docker image publishing
3. **pr-check.yml** - Pull request validation
4. **release.yml** - Automated releases
5. **security.yml** - Security scanning

## 📊 Monitoring

### Access Dashboards

- **Grafana**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9091
- **Metrics API**: http://localhost:9090/metrics

### Available Metrics

- HTTP request duration
- Request count by status code
- Active connections
- CPU and memory usage
- Custom application metrics

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
make test-coverage

# Run all CI checks locally
make ci
```

## 🔒 Security

- ✅ Container vulnerability scanning (Trivy)
- ✅ Dependency vulnerability checks
- ✅ Secret scanning (TruffleHog)
- ✅ Non-root container user
- ✅ Network policies
- ✅ Security contexts

## 📦 Available Commands

| Command | Description |
|---------|-------------|
| `make help` | Show all available commands |
| `make dev` | Start development server |
| `make build` | Build for production |
| `make test` | Run tests |
| `make docker-up` | Start Docker stack |
| `make k8s-deploy` | Deploy to Kubernetes |
| `make ci` | Run CI checks locally |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Styled with [TailwindCSS](https://tailwindcss.com/)

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/nakshatra207/Mathpati/issues)
- **Documentation**: Check the docs in this repository
- **Discussions**: [GitHub Discussions](https://github.com/nakshatra207/Mathpati/discussions)

## 🎯 Project Status

✅ **Production Ready** - Complete DevOps infrastructure with CI/CD, monitoring, and security.

For detailed status, see [PROJECT_STATUS.md](./PROJECT_STATUS.md)

---

**Made with ❤️ by the Mathpati Team**
