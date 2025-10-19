# 📊 Mathpati Monitoring Setup Guide

Complete monitoring infrastructure for the Mathpati quiz application using **Prometheus**, **Grafana**, and custom metrics collection.

---

## 🏗️ Architecture Overview

```
┌─────────────────┐
│  React Frontend │ ──── Sends metrics ────┐
│   (Mathpati)    │                        │
└─────────────────┘                        ▼
                                   ┌──────────────────┐
                                   │ Metrics Server   │
                                   │ (Express + Prom) │
                                   │  Port: 9090      │
                                   └──────────────────┘
                                            │
                                            │ /metrics endpoint
                                            ▼
                                   ┌──────────────────┐
                                   │   Prometheus     │
                                   │  (Time Series DB)│
                                   │  Port: 9091      │
                                   └──────────────────┘
                                            │
                                            │ Data source
                                            ▼
                                   ┌──────────────────┐
                                   │     Grafana      │
                                   │  (Dashboards)    │
                                   │  Port: 3000      │
                                   └──────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose installed
- Node.js 20+ installed

### 1. Setup Monitoring Stack

```bash
# Make the setup script executable
chmod +x setup_monitoring.sh

# Run the setup script
./setup_monitoring.sh
```

This will:
- ✅ Install metrics server dependencies
- ✅ Start Prometheus (port 9091)
- ✅ Start Grafana (port 3000)
- ✅ Start Metrics Server (port 9090)
- ✅ Auto-provision Grafana dashboards
- ✅ Configure Prometheus data source

### 2. Access Monitoring Tools

| Service | URL | Credentials |
|---------|-----|-------------|
| **Grafana** | http://localhost:3000 | admin / admin |
| **Prometheus** | http://localhost:9091 | - |
| **Metrics Server** | http://localhost:9090 | - |
| **Metrics Endpoint** | http://localhost:9090/metrics | - |

### 3. Start Your App

```bash
# In the main project directory
npm run dev
```

The app will automatically send metrics to the metrics server!

---

## 📈 Available Metrics

### Quiz Metrics
- **`mathpati_quiz_started_total`** - Total quizzes started
- **`mathpati_quiz_completed_total`** - Total quizzes completed
- **`mathpati_quiz_score`** - Distribution of quiz scores (histogram)
- **`mathpati_active_users`** - Currently active users

### Answer Metrics
- **`mathpati_correct_answers_total{difficulty}`** - Correct answers by difficulty
- **`mathpati_wrong_answers_total{difficulty}`** - Wrong answers by difficulty
- **`mathpati_question_time_seconds{question_id, difficulty}`** - Time spent per question

### Lifeline Metrics
- **`mathpati_lifeline_used_total{type}`** - Lifeline usage by type
  - Types: `50-50`, `phone-a-friend`, `audience-poll`, `hint`

### System Metrics (from Node Exporter)
- CPU usage
- Memory usage
- Disk I/O
- Network stats

---

## 🎨 Grafana Dashboard

The **Mathpati Quiz Dashboard** includes:

1. **Overview Stats**
   - Total quizzes started
   - Total quizzes completed
   - Active users count

2. **Performance Charts**
   - Quiz start rate over time
   - Answer accuracy by difficulty
   - Average question time by difficulty

3. **User Behavior**
   - Lifeline usage breakdown (pie chart)
   - Quiz score distribution (histogram)

4. **Real-time Monitoring**
   - Live active users
   - Current quiz completion rate

### Accessing the Dashboard

1. Open Grafana: http://localhost:3000
2. Login with `admin` / `admin`
3. Navigate to **Dashboards** → **Mathpati Quiz Dashboard**

---

## 🔧 Integration with React App

### Using the Metrics Hook

The `useMetrics` hook is already created at `src/hooks/use-metrics.ts`.

#### Example Usage:

```typescript
import { useMetrics } from '@/hooks/use-metrics';

function QuizGame() {
  const { trackQuizStart, trackQuizComplete, trackAnswer, trackLifeline } = useMetrics();

  // When quiz starts
  useEffect(() => {
    trackQuizStart();
  }, []);

  // When user answers a question
  const handleAnswer = (correct: boolean, difficulty: string, questionId: number, timeSpent: number) => {
    trackAnswer({ correct, difficulty, questionId, timeSpent });
  };

  // When quiz completes
  const handleQuizComplete = (score: number) => {
    trackQuizComplete({ score });
  };

  // When lifeline is used
  const handleLifeline = (type: '50-50' | 'phone-a-friend' | 'audience-poll' | 'hint') => {
    trackLifeline({ type });
  };
}
```

---

## 🐳 Docker Commands

### Start the monitoring stack
```bash
docker-compose -f docker-compose.monitoring.yml up -d
```

### Stop the monitoring stack
```bash
docker-compose -f docker-compose.monitoring.yml down
```

### View logs
```bash
# All services
docker-compose -f docker-compose.monitoring.yml logs -f

# Specific service
docker-compose -f docker-compose.monitoring.yml logs -f grafana
docker-compose -f docker-compose.monitoring.yml logs -f prometheus
docker-compose -f docker-compose.monitoring.yml logs -f metrics-server
```

### Restart services
```bash
docker-compose -f docker-compose.monitoring.yml restart
```

### Check service status
```bash
docker-compose -f docker-compose.monitoring.yml ps
```

---

## 🔍 Troubleshooting

### Grafana shows "No Data"

1. **Check Prometheus is scraping metrics:**
   - Visit: http://localhost:9091/targets
   - Ensure `mathpati-app` target is **UP**

2. **Check metrics are being generated:**
   - Visit: http://localhost:9090/metrics
   - You should see metrics like `mathpati_quiz_started_total`

3. **Verify data source in Grafana:**
   - Go to Configuration → Data Sources
   - Ensure Prometheus is configured with URL: `http://prometheus:9091`

### Metrics Server not responding

```bash
# Check if container is running
docker ps | grep metrics-server

# View logs
docker-compose -f docker-compose.monitoring.yml logs metrics-server

# Restart the service
docker-compose -f docker-compose.monitoring.yml restart metrics-server
```

### Port conflicts

If ports 3000, 9090, or 9091 are already in use:

1. Edit `docker-compose.monitoring.yml`
2. Change the port mappings (e.g., `3001:3000` instead of `3000:3000`)
3. Restart the stack

---

## 📊 Custom Queries in Prometheus

Access Prometheus at http://localhost:9091 and try these queries:

```promql
# Total quizzes started
mathpati_quiz_started_total

# Quiz completion rate (%)
(mathpati_quiz_completed_total / mathpati_quiz_started_total) * 100

# Average correct answers per minute
rate(mathpati_correct_answers_total[1m])

# Most used lifeline
topk(1, mathpati_lifeline_used_total)

# Accuracy rate by difficulty
sum(mathpati_correct_answers_total) by (difficulty) / 
(sum(mathpati_correct_answers_total) by (difficulty) + sum(mathpati_wrong_answers_total) by (difficulty))
```

---

## 🔐 Security Notes

**Default Credentials:**
- Grafana: `admin` / `admin`

**⚠️ For Production:**
1. Change default Grafana password
2. Enable authentication on Prometheus
3. Use HTTPS/TLS
4. Restrict network access
5. Set up proper firewall rules

---

## 📁 File Structure

```
mathpati/
├── server/
│   ├── metrics-server.js      # Express metrics server
│   └── package.json            # Server dependencies
├── monitoring/
│   ├── prometheus.yml          # Prometheus config
│   └── grafana/
│       ├── dashboards/
│       │   └── mathpati-dashboard.json
│       └── provisioning/
│           ├── datasources/
│           │   └── prometheus.yml
│           └── dashboards/
│               └── dashboard.yml
├── docker-compose.monitoring.yml
├── Dockerfile.metrics
├── setup_monitoring.sh
└── MONITORING.md (this file)
```

---

## 🆘 Support

If you encounter issues:

1. Check the logs: `docker-compose -f docker-compose.monitoring.yml logs -f`
2. Verify all services are running: `docker-compose -f docker-compose.monitoring.yml ps`
3. Test endpoints manually:
   - http://localhost:9090/health
   - http://localhost:9090/metrics
   - http://localhost:9091/-/healthy
   - http://localhost:3000/api/health

---

## 📝 Next Steps

1. ✅ Run `./setup_monitoring.sh`
2. ✅ Access Grafana at http://localhost:3000
3. ✅ Integrate metrics hooks in your React components
4. ✅ Start your app and watch live metrics!
5. 🎯 Customize dashboards for your specific needs

Happy Monitoring! 📊🚀
