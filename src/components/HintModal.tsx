import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Brain, Lightbulb, Clock, CheckCircle } from "lucide-react";
import { type Question } from "@/data/questions";

interface HintModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question;
}

interface Judge {
  id: string;
  name: string;
  avatar?: string;
  expertise: string;
  status: "available" | "busy";
}

export function HintModal({ isOpen, onClose, question }: HintModalProps) {
  const [judges] = useState<Judge[]>([
    {
      id: "1",
      name: "Mr. Nakshatra Mudgil",
      expertise: "Mathematics Expert",
      status: "available",
      avatar: "/placeholder.svg",
    },
    {
      id: "2",
      name: "Parth Aggarwal",
      expertise: "Problem Solving Specialist",
      status: "available",
      avatar: "/placeholder.svg",
    },
  ]);

  const [selectedJudge, setSelectedJudge] = useState<Judge | null>(null);
  const [callStatus, setCallStatus] = useState<"idle" | "asking" | "received">(
    "idle",
  );
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (callStatus === "asking" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && callStatus === "asking") {
      // Simulate receiving hint
      setCallStatus("received");
    }
  }, [timeLeft, callStatus]);

  useEffect(() => {
    if (isOpen) {
      setSelectedJudge(null);
      setCallStatus("idle");
      setTimeLeft(0);
    }
  }, [isOpen]);

  const askJudge = (judge: Judge) => {
    if (judge.status === "busy") return;

    setSelectedJudge(judge);
    setCallStatus("asking");
    setTimeLeft(15); // 15 seconds for judge to respond
  };

  const getHint = (): string => {
    if (!question?.friendHint) {
      // Generate a generic hint based on the question
      const questionText = question.question.toLowerCase();
      if (questionText.includes("prime")) {
        return "Think about numbers that are only divisible by 1 and themselves.";
      } else if (
        questionText.includes("area") ||
        questionText.includes("perimeter")
      ) {
        return "Remember the basic formulas for geometric shapes.";
      } else if (questionText.includes("probability")) {
        return "Consider the ratio of favorable outcomes to total possible outcomes.";
      } else if (questionText.includes("equation")) {
        return "Try to isolate the variable by performing the same operation on both sides.";
      } else {
        return "Break down the problem into smaller, manageable steps.";
      }
    }
    return question.friendHint;
  };

  const useHint = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Ask for a Hint
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Question */}
          <Card className="p-4 bg-muted/50">
            <h3 className="font-semibold mb-2">Current Question:</h3>
            <p className="text-sm text-muted-foreground mb-3">
              {question?.question}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {question?.options.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-background rounded text-sm"
                >
                  <Badge
                    variant="outline"
                    className="w-6 h-6 p-0 flex items-center justify-center"
                  >
                    {String.fromCharCode(65 + index)}
                  </Badge>
                  <span>{option}</span>
                </div>
              ))}
            </div>
          </Card>

          {callStatus === "idle" && (
            <>
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-accent" />
                  Available Judges
                </h3>
                <div className="grid gap-3">
                  {judges.map((judge) => (
                    <Card
                      key={judge.id}
                      className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                        judge.status === "busy"
                          ? "opacity-60"
                          : "hover:border-primary"
                      }`}
                      onClick={() => askJudge(judge)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={judge.avatar} alt={judge.name} />
                          <AvatarFallback>
                            {judge.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{judge.name}</h4>
                            <Badge
                              variant={
                                judge.status === "available"
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {judge.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {judge.expertise}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    setCallStatus("received");
                    setSelectedJudge(judges[0]); // Use first available judge
                  }}
                  className="bg-accent hover:bg-accent/90"
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Get Quick Hint
                </Button>
              </div>
            </>
          )}

          {callStatus === "asking" && selectedJudge && (
            <div className="text-center space-y-4">
              <Avatar className="w-20 h-20 mx-auto">
                <AvatarImage
                  src={selectedJudge.avatar}
                  alt={selectedJudge.name}
                />
                <AvatarFallback className="text-lg">
                  {selectedJudge.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <div>
                <h3 className="font-semibold text-lg">{selectedJudge.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedJudge.expertise}
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 text-primary">
                <Clock className="w-5 h-5" />
                <span className="font-medium">Thinking... {timeLeft}s</span>
              </div>

              <div className="space-y-2">
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${((15 - timeLeft) / 15) * 100}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Judge is analyzing the question...
                </p>
              </div>

              <Button variant="outline" onClick={onClose} className="mt-4">
                Cancel Request
              </Button>
            </div>
          )}

          {callStatus === "received" && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>

              <div>
                <h3 className="font-semibold text-lg text-green-700">
                  Hint Received!
                </h3>
                {selectedJudge && (
                  <p className="text-sm text-muted-foreground">
                    From {selectedJudge.name}
                  </p>
                )}
              </div>

              <Card className="p-4 bg-green-50 border-green-200">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <p className="font-medium text-green-800 mb-1">
                      Judge's Hint:
                    </p>
                    <p className="text-green-700">{getHint()}</p>
                  </div>
                </div>
              </Card>

              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose}>
                  Thanks, I'll figure it out
                </Button>
                <Button
                  onClick={useHint}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Use This Hint
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
