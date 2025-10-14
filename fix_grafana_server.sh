#!/bin/bash
set -e

echo "=== 🧩 Fixing Grafana Server Start Issues ==="

# 1. Ensure Grafana directory exists
if [ ! -d "/usr/local/grafana" ]; then
    echo "❌ Grafana directory not found. Reinstalling..."
    sudo apt update -y
    sudo apt install -y adduser libfontconfig1 musl || true
    GRAFANA_VERSION=$(curl -s https://api.github.com/repos/grafana/grafana/releases/latest | grep tag_name | cut -d '"' -f 4)
    wget "https://dl.grafana.com/oss/release/grafana-${GRAFANA_VERSION:1}.linux-amd64.tar.gz" -O grafana.tar.gz
    tar -zxvf grafana.tar.gz
    sudo mv grafana-* /usr/local/grafana
    rm grafana.tar.gz
fi

# 2. Create all required directories
sudo mkdir -p /usr/local/grafana/data /usr/local/grafana/logs /usr/local/grafana/plugins
sudo chown -R $USER:$USER /usr/local/grafana

# 3. Create a minimal grafana.ini file if not exists
if [ ! -f "/usr/local/grafana/conf/custom.ini" ]; then
    echo "🧾 Creating minimal Grafana config..."
    cat <<EOF > /usr/local/grafana/conf/custom.ini
[paths]
data = /usr/local/grafana/data
logs = /usr/local/grafana/logs
plugins = /usr/local/grafana/plugins
provisioning = /usr/local/grafana/conf/provisioning

[server]
http_port = 3000
http_addr =

[security]
admin_user = admin
admin_password = admin

[log]
mode = console
EOF
fi

# 4. Kill any previous Grafana instance
if pgrep grafana-server >/dev/null; then
    echo "🛑 Stopping old Grafana process..."
    pkill grafana-server
fi

# 5. Check if port 3000 is free
if sudo lsof -i:3000 >/dev/null; then
    echo "⚠️ Port 3000 is already in use. Freeing it..."
    sudo fuser -k 3000/tcp
fi

# 6. Start Grafana server manually
echo "🚀 Starting Grafana Server..."
nohup /usr/local/grafana/bin/grafana-server \
  --homepath=/usr/local/grafana \
  --config=/usr/local/grafana/conf/custom.ini > grafana.log 2>&1 &

sleep 5

# 7. Verify server is running
if pgrep grafana-server >/dev/null; then
    echo "✅ Grafana server is running successfully!"
    echo "🌐 Access it at: http://localhost:3000"
else
    echo "❌ Grafana server still failed to start. Checking logs..."
    tail -n 20 grafana.log
    exit 1
fi

