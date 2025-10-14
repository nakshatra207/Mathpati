#!/bin/bash
set -e

echo "=== 🚀 Setting up Complete Monitoring Stack for Mathpati ==="

# Check if Docker is installed
if ! command -v docker &>/dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/engine/install/"
    exit 1
fi

if ! command -v docker-compose &>/dev/null && ! docker compose version &>/dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Navigate to project directory
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "📁 Working directory: $PROJECT_DIR"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created. You can customize it if needed."
fi

# Install metrics server dependencies
echo "📦 Installing metrics server dependencies..."
cd server
npm install
cd ..

# Stop any existing monitoring stack
echo "🛑 Stopping existing monitoring stack (if any)..."
docker-compose -f docker-compose.monitoring.yml down 2>/dev/null || true

# Build and start the monitoring stack
echo "🐳 Building and starting monitoring stack..."
docker-compose -f docker-compose.monitoring.yml up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check service health
echo "🔍 Checking service health..."

# Check Metrics Server
if curl -s http://localhost:9090/health > /dev/null; then
    echo "✅ Metrics Server is running on http://localhost:9090"
else
    echo "⚠️  Metrics Server might not be ready yet"
fi

# Check Prometheus
if curl -s http://localhost:9091/-/healthy > /dev/null; then
    echo "✅ Prometheus is running on http://localhost:9091"
else
    echo "⚠️  Prometheus might not be ready yet"
fi

# Check Grafana
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo "✅ Grafana is running on http://localhost:3000"
else
    echo "⚠️  Grafana might not be ready yet"
fi

echo ""
echo "=========================================="
echo "🎉 Monitoring Stack Setup Complete!"
echo "=========================================="
echo ""
echo "📊 Access your monitoring tools:"
echo "  • Metrics Server:  http://localhost:9090"
echo "  • Metrics Endpoint: http://localhost:9090/metrics"
echo "  • Prometheus:      http://localhost:9091"
echo "  • Grafana:         http://localhost:3000"
echo "    - Username: admin"
echo "    - Password: admin"
echo ""
echo "📈 Grafana Dashboard:"
echo "  The Mathpati dashboard should be auto-provisioned."
echo "  Navigate to: Dashboards → Mathpati Quiz Dashboard"
echo ""
echo "🔧 Useful commands:"
echo "  • View logs:       docker-compose -f docker-compose.monitoring.yml logs -f"
echo "  • Stop stack:      docker-compose -f docker-compose.monitoring.yml down"
echo "  • Restart stack:   docker-compose -f docker-compose.monitoring.yml restart"
echo "  • View status:     docker-compose -f docker-compose.monitoring.yml ps"
echo ""
echo "📝 Next steps:"
echo "  1. Start your Mathpati app: npm run dev"
echo "  2. The app will automatically send metrics to the metrics server"
echo "  3. View live metrics in Grafana dashboard"
echo ""

