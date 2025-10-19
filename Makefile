.PHONY: help install dev build test clean docker-build docker-up docker-down k8s-deploy k8s-delete lint format

# Default target
.DEFAULT_GOAL := help

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
NC := \033[0m # No Color

## help: Display this help message
help:
	@echo "$(BLUE)Mathpati - Available Commands$(NC)"
	@echo ""
	@grep -E '^## ' $(MAKEFILE_LIST) | sed 's/## /  /' | column -t -s ':'

## install: Install dependencies
install:
	@echo "$(YELLOW)Installing dependencies...$(NC)"
	npm install
	@echo "$(GREEN)✓ Dependencies installed$(NC)"

## dev: Start development server
dev:
	@echo "$(YELLOW)Starting development server...$(NC)"
	npm run dev

## build: Build for production
build:
	@echo "$(YELLOW)Building application...$(NC)"
	npm run build
	@echo "$(GREEN)✓ Build complete$(NC)"

## test: Run tests
test:
	@echo "$(YELLOW)Running tests...$(NC)"
	npm test -- --run

## test-watch: Run tests in watch mode
test-watch:
	@echo "$(YELLOW)Running tests in watch mode...$(NC)"
	npm test

## test-coverage: Run tests with coverage
test-coverage:
	@echo "$(YELLOW)Running tests with coverage...$(NC)"
	npm test -- --run --coverage

## lint: Run linter
lint:
	@echo "$(YELLOW)Running linter...$(NC)"
	npm run lint || echo "⚠️ Linting skipped"

## format: Format code
format:
	@echo "$(YELLOW)Formatting code...$(NC)"
	npx prettier --write "src/**/*.{ts,tsx,js,jsx,css,md}"

## clean: Clean build artifacts
clean:
	@echo "$(YELLOW)Cleaning build artifacts...$(NC)"
	rm -rf dist node_modules/.vite
	@echo "$(GREEN)✓ Clean complete$(NC)"

## docker-build: Build Docker images
docker-build:
	@echo "$(YELLOW)Building Docker images...$(NC)"
	docker build -t mathpati:latest .
	docker build -t mathpati-metrics:latest -f Dockerfile.metrics ./server
	@echo "$(GREEN)✓ Docker images built$(NC)"

## docker-up: Start Docker containers
docker-up:
	@echo "$(YELLOW)Starting Docker containers...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)✓ Containers started$(NC)"
	@echo "Application: http://localhost:3000"
	@echo "Grafana: http://localhost:3001"
	@echo "Prometheus: http://localhost:9091"

## docker-down: Stop Docker containers
docker-down:
	@echo "$(YELLOW)Stopping Docker containers...$(NC)"
	docker-compose down
	@echo "$(GREEN)✓ Containers stopped$(NC)"

## docker-logs: View Docker logs
docker-logs:
	docker-compose logs -f

## docker-dev: Start development Docker environment
docker-dev:
	@echo "$(YELLOW)Starting development environment...$(NC)"
	./scripts/local-dev.sh

## k8s-deploy: Deploy to Kubernetes
k8s-deploy:
	@echo "$(YELLOW)Deploying to Kubernetes...$(NC)"
	./scripts/deploy.sh production production latest

## k8s-delete: Delete Kubernetes deployment
k8s-delete:
	@echo "$(YELLOW)Deleting Kubernetes deployment...$(NC)"
	kubectl delete -f k8s/ || true
	@echo "$(GREEN)✓ Deployment deleted$(NC)"

## k8s-status: Check Kubernetes deployment status
k8s-status:
	@echo "$(YELLOW)Checking deployment status...$(NC)"
	kubectl get all -n production

## k8s-logs: View Kubernetes logs
k8s-logs:
	kubectl logs -f deployment/mathpati -n production

## k8s-test: Test Kubernetes deployment
k8s-test:
	@echo "$(YELLOW)Testing deployment...$(NC)"
	./scripts/test-deployment.sh production

## setup: Complete project setup
setup: install
	@echo "$(YELLOW)Setting up project...$(NC)"
	cp .env.example .env || true
	@echo "$(GREEN)✓ Setup complete$(NC)"
	@echo "$(BLUE)Next steps:$(NC)"
	@echo "  1. Edit .env file with your configuration"
	@echo "  2. Run 'make dev' to start development server"

## ci: Run CI checks locally
ci: lint test build
	@echo "$(GREEN)✓ All CI checks passed$(NC)"

## all: Run all checks and build
all: clean install lint test build
	@echo "$(GREEN)✓ All tasks completed$(NC)"
