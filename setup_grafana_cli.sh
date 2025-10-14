#!/bin/bash
set -e

echo "=== 📊 Setting up Grafana Monitoring for Mathpati ==="

# 1️⃣ Check for Grafana CLI
if ! command -v grafana-cli >/dev/null 2>&1; then
    echo "❌ Grafana CLI not found. Please install Grafana first."
    exit 1
fi

# 2️⃣ Stop Grafana service if running
echo "Stopping Grafana service..."
sudo systemctl stop grafana-server || true

# 3️⃣ Ensure grafana-cli and grafana-server are symlinked in /usr/local/bin
echo "Setting up symlinks..."
sudo ln -sf /usr/sbin/grafana-cli /usr/local/bin/grafana-cli
sudo ln -sf /usr/sbin/grafana-server /usr/local/bin/grafana

# 4️⃣ Start Grafana service
echo "Starting Grafana service..."
sudo systemctl daemon-reload
sudo systemctl enable grafana-server
sudo systemctl start grafana-server

# 5️⃣ Wait for Grafana to be ready
echo "Waiting for Grafana to start..."
sleep 5

# 6️⃣ Verify installations
echo "Verifying Grafana..."
grafana-cli -v
grafana-server -v
sudo systemctl status grafana-server --no-pager

# 7️⃣ Optional: Install Mathpati dashboards/plugins
echo "Installing Mathpati monitoring dashboards..."
# Example plugin (replace with actual Mathpati plugin if any)
# grafana-cli plugins install <plugin-id>

# 8️⃣ Done
echo "✅ Grafana setup complete! Access dashboards at http://localhost:3000"

