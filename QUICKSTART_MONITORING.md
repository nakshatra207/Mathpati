# 🚀 Quick Start - Mathpati Monitoring

## Run This One Command:

```bash
chmod +x setup_monitoring.sh && ./setup_monitoring.sh
```

## Then Access:

- **Grafana Dashboard**: http://localhost:3000 (admin/admin)
- **Prometheus**: http://localhost:9091
- **Metrics**: http://localhost:9090/metrics

## Start Your App:

```bash
npm run dev
```

## That's It! 🎉

Your metrics will automatically flow:
- **React App** → **Metrics Server** → **Prometheus** → **Grafana Dashboard**

See `MONITORING.md` for detailed documentation.
