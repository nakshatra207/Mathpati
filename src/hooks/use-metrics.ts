import { useCallback } from 'react';

const METRICS_SERVER_URL = import.meta.env.VITE_METRICS_URL || 'http://localhost:9090';

interface AnswerMetric {
  correct: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  questionId: number;
  timeSpent: number;
}

interface LifelineMetric {
  type: '50-50' | 'phone-a-friend' | 'audience-poll' | 'hint';
}

interface QuizCompleteMetric {
  score: number;
}

export const useMetrics = () => {
  const sendMetric = useCallback(async (endpoint: string, data?: unknown) => {
    try {
      const body = data === undefined ? '{}' : JSON.stringify(data, (_key, value) => {
        // Avoid serializing functions or DOM nodes
        if (typeof value === 'function') return undefined;
        if (typeof value === 'object' && value !== null) {
          // If it's a DOM node, skip it
          if ((value as unknown as { nodeType?: number }).nodeType) return undefined;
        }
        return value;
      });

      await fetch(`${METRICS_SERVER_URL}/api/metrics/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      });
    } catch (error) {
      // Silently fail - don't break the app if metrics server is down
      console.debug('Metrics error:', error);
    }
  }, []);

  const trackQuizStart = useCallback(() => {
    sendMetric('quiz-start');
  }, [sendMetric]);

  const trackQuizComplete = useCallback((metric: QuizCompleteMetric) => {
    sendMetric('quiz-complete', metric);
  }, [sendMetric]);

  const trackAnswer = useCallback((metric: AnswerMetric) => {
    sendMetric('answer', metric);
  }, [sendMetric]);

  const trackLifeline = useCallback((metric: LifelineMetric) => {
    sendMetric('lifeline', metric);
  }, [sendMetric]);

  return {
    trackQuizStart,
    trackQuizComplete,
    trackAnswer,
    trackLifeline,
  };
};
