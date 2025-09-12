import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { XCircle, RotateCcw, Home } from 'lucide-react';

interface GameOverScreenProps {
  score: number;
  totalQuestions: number;
  onRestart: () => void;
}

export function GameOverScreen({ score, totalQuestions, onRestart }: GameOverScreenProps) {
  const getScoreMessage = () => {
    if (score === 0) return "Better luck next time! 📚";
    if (score <= 3) return "Keep practicing! 💪";
    if (score <= 6) return "Good effort! 👍";
    if (score <= 8) return "Great job! 🎉";
    return "Almost perfect! 🌟";
  };

  const getScoreColor = () => {
    if (score <= 3) return "text-destructive";
    if (score <= 6) return "text-yellow-400";
    return "text-green-400";
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl kbc-card-gradient border-accent/30 p-8 text-center space-y-8 kbc-slide-in">
        <div className="space-y-4">
          <XCircle className="w-16 h-16 text-destructive mx-auto" />
          
          <h1 className="text-4xl font-bold text-destructive">
            Game Over!
          </h1>
          
          <p className="text-xl text-muted-foreground">
            Your mathematical journey ends here
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-primary/20 rounded-lg p-6 space-y-4">
            <h2 className="text-2xl font-semibold text-accent">Final Score</h2>
            
            <div className="flex items-center justify-center gap-4">
              <Badge variant="outline" className={`text-2xl px-4 py-2 border-2 ${getScoreColor()}`}>
                {score} / {totalQuestions}
              </Badge>
              <span className="text-lg">{getScoreMessage()}</span>
            </div>

            <div className="w-full bg-primary/30 rounded-full h-4">
              <div 
                className={`h-4 rounded-full transition-all duration-1000 ${
                  score <= 3 ? 'bg-destructive' : 
                  score <= 6 ? 'bg-yellow-400' : 
                  'bg-green-400'
                }`}
                style={{ width: `${(score / totalQuestions) * 100}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="text-sm text-muted-foreground space-y-2">
              <p>💡 <strong>Pro Tip:</strong> Practice more to improve your math skills!</p>
              {score < totalQuestions && (
                <p>🎯 You were just {totalQuestions - score} question{totalQuestions - score !== 1 ? 's' : ''} away from victory!</p>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <Button 
              size="lg" 
              onClick={onRestart}
              className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 kbc-button-glow"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Try Again
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => window.location.reload()}
              className="flex-1 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
            >
              <Home className="w-5 h-5 mr-2" />
              Main Menu
            </Button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          "Mathematics is not about numbers, equations, computations, or algorithms: it is about understanding." - William Paul Thurston
        </div>
      </Card>
    </div>
  );
}