#!/bin/bash
# setup_grafana_dashboard_fast.sh
# 🚀 Ultra-fast Grafana setup for Mathpati

set -e
GRAFANA_URL="http://localhost:3000"
ADMIN_USER="admin"
ADMIN_PASS="admin"

echo "=== 🚀 Setting up Grafana Dashboard for Mathpati (FAST) ==="

# 1️⃣ Create Prometheus data source (fast, idempotent)
curl -s -X POST -u $ADMIN_USER:$ADMIN_PASS \
  -H "Content-Type: application/json" \
  -d '{
        "name":"Prometheus",
        "type":"prometheus",
        "access":"proxy",
        "url":"http://localhost:9090",
        "isDefault":true
      }' \
  $GRAFANA_URL/api/datasources || echo "⚠️ Data source may already exist"

# 2️⃣ Prepare minimal dashboard JSON if not exists
DASHBOARD_FILE="./infra/mathpati_dashboard.json"
mkdir -p ./infra
if [ ! -f "$DASHBOARD_FILE" ]; then
  echo "⚡ Creating minimal dashboard JSON..."
  cat > "$DASHBOARD_FILE" <<EOF
{
  "id": null,
  "uid": "mathpati_dashboard",
  "title": "Mathpati Dashboard",
  "tags": ["mathpati"],
  "timezone": "browser",
  "schemaVersion": 41,
  "version": 1,
  "panels": [
    {
      "type": "text",
      "title": "Welcome",
      "gridPos": {"x":0,"y":0,"w":24,"h":4},
      "options": {"content": "Mathpati Monitoring Active!"}
    }
  ]
}
EOF
fi

# 3️⃣ Import dashboard (fast)
curl -s -X POST -u $ADMIN_USER:$ADMIN_PASS \
  -H "Content-Type: application/json" \
  -d "{
        \"dashboard\": $(cat $DASHBOARD_FILE),
        \"overwrite\": true,
        \"inputs\": [
          {\"name\": \"DS_PROMETHEUS\", \"type\": \"datasource\", \"pluginId\": \"prometheus\", \"value\": \"Prometheus\"}
        ]
      }" \
  $GRAFANA_URL/api/dashboards/import

echo "✅ Fast Grafana dashboards setup complete!"
echo "🌐 Access at $GRAFANA_URL (login: admin/admin)"

