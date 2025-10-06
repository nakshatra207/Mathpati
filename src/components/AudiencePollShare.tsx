import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Users, Share2, Copy, Check, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { type Question } from "@/data/questions";

interface AudiencePollShareProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question;
  onPollComplete: (results: number[]) => void;
}

export function AudiencePollShare({
  isOpen,
  onClose,
  question,
  onPollComplete,
}: AudiencePollShareProps) {
  const [pollResults, setPollResults] = useState<number[]>([0, 0, 0, 0]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      // Generate a shareable poll URL (in a real app, this would be a unique poll ID)
      const pollId = Math.random().toString(36).substring(7);
      const url = `${window.location.origin}?poll=${pollId}&q=${encodeURIComponent(question.question)}`;
      setShareUrl(url);
      setPollResults([0, 0, 0, 0]);
      setTotalVotes(0);
      setTimeLeft(60);
      setIsActive(true);
    }
  }, [isOpen, question]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      finalizePoll();
    }
  }, [timeLeft, isActive]);

  // Simulate incoming votes (in a real app, this would be WebSocket updates)
  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        if (Math.random() > 0.7) {
          // 30% chance of new vote every 2 seconds
          const randomOption = Math.floor(Math.random() * 4);
          setPollResults((prev) => {
            const newResults = [...prev];
            newResults[randomOption]++;
            return newResults;
          });
          setTotalVotes((prev) => prev + 1);
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isActive]);

  const copyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Link Copied! 📋",
        description: "Share this with your audience to let them vote!",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  const finalizePoll = () => {
    setIsActive(false);

    // Convert votes to percentages
    const percentages =
      totalVotes > 0
        ? pollResults.map((votes) => Math.round((votes / totalVotes) * 100))
        : [25, 25, 25, 25]; // Default if no votes

    onPollComplete(percentages);

    toast({
      title: "Poll Completed! 🗳️",
      description: `${totalVotes} people voted. Here are the results!`,
    });
  };

  const getPercentage = (votes: number) => {
    return totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="card-gradient border-accent/30 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-accent">
            <Users className="w-5 h-5" />
            Live Audience Poll
            {isActive && (
              <Badge variant="outline" className="ml-auto">
                {timeLeft}s remaining
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Question Display */}
          <Card className="p-4 border-primary/20">
            <h3 className="font-semibold text-lg mb-4 text-center">
              {question.question}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {question.options.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
                >
                  <span className="text-sm">
                    <strong>{String.fromCharCode(65 + index)}.</strong> {option}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Share Section */}
          {isActive && (
            <Card className="p-4 border-accent/20">
              <div className="flex items-center gap-2 mb-3">
                <Share2 className="w-4 h-4" />
                <span className="font-medium">Share with Your Audience</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 text-sm bg-background border rounded-lg"
                />
                <Button
                  size="sm"
                  onClick={copyShareUrl}
                  className="flex items-center gap-2"
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <Smartphone className="w-3 h-3" />
                <span>Anyone with this link can vote from their phone!</span>
              </div>
            </Card>
          )}

          {/* Live Results */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Live Results</h4>
              <Badge variant="outline">
                {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
              </Badge>
            </div>

            <div className="space-y-3">
              {question.options.map((option, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      {String.fromCharCode(65 + index)}. {option}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {pollResults[index]} votes
                      </span>
                      <span className="text-sm font-bold text-accent">
                        {getPercentage(pollResults[index])}%
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={getPercentage(pollResults[index])}
                    className="h-3"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {isActive ? (
              <Button onClick={finalizePoll} className="flex-1">
                Finish Poll Early
              </Button>
            ) : (
              <Button onClick={onClose} className="flex-1">
                Use These Results
              </Button>
            )}

            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
