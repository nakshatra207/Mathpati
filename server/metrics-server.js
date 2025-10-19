const express = require('express');
const cors = require('cors');
const promClient = require('prom-client');

const app = express();
const PORT = process.env.METRICS_PORT || 9090;

// Enable CORS for frontend
app.use(cors());
app.use(express.json());

// Create a Registry to register the metrics
const register = new promClient.Registry();

// Add default metrics (CPU, memory, etc.)
promClient.collectDefaultMetrics({ register });

// Custom metrics for Mathpati app
const quizStartCounter = new promClient.Counter({
  name: 'mathpati_quiz_started_total',
  help: 'Total number of quizzes started',
  registers: [register]
});

const quizCompletedCounter = new promClient.Counter({
  name: 'mathpati_quiz_completed_total',
  help: 'Total number of quizzes completed',
  registers: [register]
});

const correctAnswersCounter = new promClient.Counter({
  name: 'mathpati_correct_answers_total',
  help: 'Total number of correct answers',
  labelNames: ['difficulty'],
  registers: [register]
});

const wrongAnswersCounter = new promClient.Counter({
  name: 'mathpati_wrong_answers_total',
  help: 'Total number of wrong answers',
  labelNames: ['difficulty'],
  registers: [register]
});

const lifelineUsedCounter = new promClient.Counter({
  name: 'mathpati_lifeline_used_total',
  help: 'Total number of lifelines used',
  labelNames: ['type'],
  registers: [register]
});

const quizScoreHistogram = new promClient.Histogram({
  name: 'mathpati_quiz_score',
  help: 'Distribution of quiz scores',
  buckets: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  registers: [register]
});

const questionTimeGauge = new promClient.Gauge({
  name: 'mathpati_question_time_seconds',
  help: 'Time taken to answer questions',
  labelNames: ['question_id', 'difficulty'],
  registers: [register]
});

const activeUsersGauge = new promClient.Gauge({
  name: 'mathpati_active_users',
  help: 'Number of currently active users',
  registers: [register]
});

// Track active users
let activeUsers = 0;

// Metrics endpoint for Prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// API endpoints to receive metrics from frontend
app.post('/api/metrics/quiz-start', (req, res) => {
  quizStartCounter.inc();
  activeUsers++;
  activeUsersGauge.set(activeUsers);
  res.json({ success: true });
});

app.post('/api/metrics/quiz-complete', (req, res) => {
  const { score } = req.body;
  quizCompletedCounter.inc();
  if (score !== undefined) {
    quizScoreHistogram.observe(score);
  }
  activeUsers = Math.max(0, activeUsers - 1);
  activeUsersGauge.set(activeUsers);
  res.json({ success: true });
});

app.post('/api/metrics/answer', (req, res) => {
  const { correct, difficulty, questionId, timeSpent } = req.body;
  
  if (correct) {
    correctAnswersCounter.inc({ difficulty: difficulty || 'unknown' });
  } else {
    wrongAnswersCounter.inc({ difficulty: difficulty || 'unknown' });
  }
  
  if (timeSpent && questionId) {
    questionTimeGauge.set(
      { question_id: questionId, difficulty: difficulty || 'unknown' },
      timeSpent
    );
  }
  
  res.json({ success: true });
});

app.post('/api/metrics/lifeline', (req, res) => {
  const { type } = req.body;
  lifelineUsedCounter.inc({ type: type || 'unknown' });
  res.json({ success: true });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Mathpati Metrics Server',
    version: '1.0.0',
    endpoints: {
      metrics: '/metrics',
      health: '/health',
      api: {
        quizStart: 'POST /api/metrics/quiz-start',
        quizComplete: 'POST /api/metrics/quiz-complete',
        answer: 'POST /api/metrics/answer',
        lifeline: 'POST /api/metrics/lifeline'
      }
    }
  });
});

app.listen(PORT, () => {
  console.log(`📊 Mathpati Metrics Server running on http://localhost:${PORT}`);
  console.log(`📈 Prometheus metrics available at http://localhost:${PORT}/metrics`);
});
