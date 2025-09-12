import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Play, Brain, Star, Plus, Zap, Timer, HelpCircle, Users, Library } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: (useCustomQuestions?: boolean) => void;
  onCreateQuestions: () => void;
  onManageQuizzes: () => void;
  hasCustomQuestions: boolean;
  hasSavedQuizzes: boolean;
}

export function WelcomeScreen({ onStart, onCreateQuestions, onManageQuizzes, hasCustomQuestions, hasSavedQuizzes }: WelcomeScreenProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Play KBC entrance sound only once per session
    const playAudio = async () => {
      if (audioRef.current && !sessionStorage.getItem('kbc-audio-played')) {
        try {
          audioRef.current.volume = 0.6; // Set moderate volume
          await audioRef.current.play();
          sessionStorage.setItem('kbc-audio-played', 'true');
        } catch (error) {
          console.log('Audio autoplay prevented by browser:', error);
          // If autoplay fails, try to play on first user interaction
          const playOnInteraction = () => {
            if (audioRef.current && !sessionStorage.getItem('kbc-audio-played')) {
              audioRef.current.play().catch(console.error);
              sessionStorage.setItem('kbc-audio-played', 'true');
            }
            document.removeEventListener('click', playOnInteraction);
            document.removeEventListener('touchstart', playOnInteraction);
          };
          document.addEventListener('click', playOnInteraction);
          document.addEventListener('touchstart', playOnInteraction);
        }
      }
    };
    
    playAudio();
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Elegant Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/80 to-background">
        <div className="absolute inset-0 bg-mesh-gradient opacity-30"></div>
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-accent/8 rounded-full blur-3xl"></div>
      </div>

      {/* Hidden audio element for KBC entrance sound */}
      <audio ref={audioRef} preload="auto">
        <source src="/kbc-entrance.mp3" type="audio/mpeg" />
      </audio>
      
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        <div className="max-w-7xl w-full space-y-12 text-center">
          {/* Hero Section */}
          <div className="space-y-8 slide-in-up">
            <div className="flex items-center justify-center gap-4 mb-8">
              <Trophy className="w-12 h-12 text-accent floating" />
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold brand-gradient">
                Kaun Banega Mathpati
              </h1>
              <Trophy className="w-12 h-12 text-accent floating" />
            </div>
            
            <div className="text-center space-y-6 max-w-4xl mx-auto">
              <p className="text-xl md:text-2xl text-muted-foreground font-medium leading-relaxed">
                🚀 Create unlimited custom quizzes with 40+ questions, set custom timers, and share audience polls!
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 stagger-children">
                <div className="glass-card p-4 hover:shadow-soft transition-all duration-300">
                  <Trophy className="w-6 h-6 text-accent mx-auto mb-2" />
                  <div className="text-sm font-medium">Unlimited Questions</div>
                </div>
                <div className="glass-card p-4 hover:shadow-soft transition-all duration-300">
                  <Timer className="w-6 h-6 text-primary mx-auto mb-2" />
                  <div className="text-sm font-medium">Custom Timers</div>
                </div>
                <div className="glass-card p-4 hover:shadow-soft transition-all duration-300">
                  <HelpCircle className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                  <div className="text-sm font-medium">4 Lifelines</div>
                </div>
                <div className="glass-card p-4 hover:shadow-soft transition-all duration-300">
                  <Users className="w-6 h-6 text-accent mx-auto mb-2" />
                  <div className="text-sm font-medium">Shareable Polls</div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 fade-in">
            <Card className="glass-card p-6 hover:shadow-elevated transition-all duration-300 group">
              <CardHeader className="text-center pb-4">
                <Brain className="w-12 h-12 mx-auto text-primary mb-3" />
                <CardTitle className="text-xl font-semibold text-foreground">
                  Math Challenges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                  Solve engaging math questions from beginner to expert level with customizable time limits and hints
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="glass-card p-6 hover:shadow-elevated transition-all duration-300 group">
              <CardHeader className="text-center pb-4">
                <Star className="w-12 h-12 mx-auto text-accent mb-3" />
                <CardTitle className="text-xl font-semibold text-foreground">
                  Lifelines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                  Use strategic lifelines: 50-50, Audience Poll, Flip Question, and Ask a Friend to boost your success rate
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="glass-card p-6 hover:shadow-elevated transition-all duration-300 group">
              <CardHeader className="text-center pb-4">
                <Trophy className="w-12 h-12 mx-auto text-primary mb-3" />
                <CardTitle className="text-xl font-semibold text-foreground">
                  Win Big
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                  Master all questions to become the ultimate Mathpati Champion and unlock exclusive achievements!
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="space-y-8 bounce-in">
            <div className="flex flex-col lg:flex-row gap-6 justify-center items-center">
              <Button 
                onClick={() => onStart(false)}
                size="lg"
                className="px-10 py-6 text-xl font-semibold hero-button text-white transition-all duration-300 rounded-xl"
              >
                <Play className="w-6 h-6 mr-3" />
                Start Default Challenge
              </Button>
              
              {hasCustomQuestions && (
                <Button 
                  onClick={() => onStart(true)}
                  size="lg"
                  className="px-10 py-6 text-xl font-semibold glass-card transition-all duration-300 rounded-xl border border-accent/50 text-accent hover:bg-accent/10"
                >
                  <Zap className="w-6 h-6 mr-3" />
                  Play Your Quiz
                  <Badge className="ml-3 bg-accent/20 text-accent px-2 py-1 rounded-full text-sm" variant="secondary">
                    {hasCustomQuestions ? 'Ready!' : '0'}
                  </Badge>
                </Button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                onClick={onCreateQuestions}
                variant="outline"
                size="lg"
                className="px-6 py-3 text-base font-medium glass-card border border-muted-foreground/30 text-muted-foreground hover:bg-muted-foreground/10 transition-all duration-300 rounded-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Questions
              </Button>
              <Button 
                onClick={onManageQuizzes}
                variant="outline"
                size="lg"
                className="px-6 py-3 text-base font-medium glass-card border border-accent/30 text-accent hover:bg-accent/10 transition-all duration-300 rounded-lg"
              >
                <Library className="w-5 h-5 mr-2" />
                Manage Quizzes
                {hasSavedQuizzes && (
                  <Badge className="ml-2 bg-accent/20 text-accent px-2 py-1 rounded-full text-xs" variant="secondary">
                    New!
                  </Badge>
                )}
              </Button>
            </div>
            
            <div className="glass-card p-4 max-w-xl mx-auto rounded-lg">
              <p className="text-base font-medium text-muted-foreground text-center">
                Ready to test your mathematical prowess? Choose your adventure and let's begin!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}