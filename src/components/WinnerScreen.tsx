import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trophy, Crown, Star, RotateCcw, Home } from 'lucide-react';

interface WinnerScreenProps {
  onRestart: () => void;
}

export function WinnerScreen({ onRestart }: WinnerScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl kbc-card-gradient border-accent/30 p-8 text-center space-y-8 kbc-slide-in">
        <div className="space-y-4">
          <div className="relative">
            <Crown className="w-20 h-20 text-accent mx-auto kbc-pulse" />
            <div className="absolute -top-2 -right-2">
              <Star className="w-8 h-8 text-yellow-300 animate-pulse" />
            </div>
            <div className="absolute -top-2 -left-2">
              <Star className="w-6 h-6 text-yellow-300 animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>
          </div>
          
          <h1 className="text-5xl font-bold kbc-gold-text">
            🎉 CONGRATULATIONS! 🎉
          </h1>
          
          <h2 className="text-3xl font-semibold text-accent">
            You are the Mathpati Winner! 🏆
          </h2>
          
          <p className="text-xl text-muted-foreground">
            You've conquered all 10 mathematical challenges!
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-r from-accent/20 to-primary/20 rounded-lg p-6 space-y-4">
            <Trophy className="w-12 h-12 text-accent mx-auto" />
            
            <div className="space-y-2">
              <h3 className="text-2xl font-bold kbc-gold-text">PERFECT SCORE!</h3>
              <p className="text-lg font-semibold text-accent">10/10 Questions Correct</p>
              <p className="text-sm text-muted-foreground">
                You've demonstrated exceptional mathematical prowess!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-primary/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-accent">🧮</div>
              <p className="text-sm text-muted-foreground">Math</p>
              <p className="text-sm text-muted-foreground">Expert</p>
            </div>
            <div className="bg-primary/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-accent">⚡</div>
              <p className="text-sm text-muted-foreground">Quick</p>
              <p className="text-sm text-muted-foreground">Thinker</p>
            </div>
            <div className="bg-primary/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-accent">🏆</div>
              <p className="text-sm text-muted-foreground">Quiz</p>
              <p className="text-sm text-muted-foreground">Champion</p>
            </div>
          </div>

          <div className="bg-primary/10 rounded-lg p-4">
            <p className="text-lg font-semibold text-accent mb-2">🌟 Achievement Unlocked!</p>
            <p className="text-sm text-muted-foreground">
              "Ultimate Mathpati" - You've proven yourself as a true mathematical genius! 
              Share your victory with friends and challenge them to beat your perfect score!
            </p>
          </div>

          <div className="flex gap-4">
            <Button 
              size="lg" 
              onClick={onRestart}
              className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 text-lg py-6 kbc-button-glow"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Play Again
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => window.location.reload()}
              className="flex-1 border-accent text-accent hover:bg-accent hover:text-accent-foreground text-lg py-6"
            >
              <Home className="w-5 h-5 mr-2" />
              Main Menu
            </Button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          "The only way to learn mathematics is to do mathematics." - Paul Halmos
        </div>
      </Card>
    </div>
  );
}