import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Users, MessageCircle } from 'lucide-react';
import { type Question } from '@/data/questions';

type LifelineType = '50-50' | 'audience' | 'flip' | 'hint';

interface LifelineModalProps {
  type: LifelineType | null;
  isOpen: boolean;
  onClose: () => void;
  question: Question;
  audiencePoll?: number[];
}

export function LifelineModal({ type, isOpen, onClose, question, audiencePoll = [] }: LifelineModalProps) {
  if (type === 'audience') {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="kbc-card-gradient border-accent/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-accent">
              <Users className="w-5 h-5" />
              Audience Poll Results
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Here's what our studio audience thinks:
            </p>
            
            <div className="space-y-3">
              {question?.options.map((option, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      {String.fromCharCode(65 + index)}. {option}
                    </span>
                    <span className="text-sm font-bold text-accent">
                      {audiencePoll[index]}%
                    </span>
                  </div>
                  <Progress 
                    value={audiencePoll[index]} 
                    className="h-2"
                  />
                </div>
              ))}
            </div>
            
            <div className="text-xs text-center text-muted-foreground">
              💡 The audience has spoken! Use this wisdom carefully.
            </div>
            
            <Button 
              onClick={onClose} 
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Continue with Question
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return null;
}