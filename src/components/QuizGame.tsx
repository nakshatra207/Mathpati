import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  mathQuestions,
  getRandomQuestions,
  getAudiencePoll,
  type Question,
} from "@/data/questions";
import { WelcomeScreen } from "./WelcomeScreen";
import { GameOverScreen } from "./GameOverScreen";
import { WinnerScreen } from "./WinnerScreen";
import { LifelineModal } from "./LifelineModal";
import { QuestionCreator } from "./QuestionCreator";
import { QuizLibrary } from "./QuizLibrary";
import { QuizEditor } from "./QuizEditor";
import { AudiencePollShare } from "./AudiencePollShare";
import { HintModal } from "./HintModal";

import { Quiz } from "@/types/quiz";
import {
  Timer,
  HelpCircle,
  Users,
  RotateCcw,
  Plus,
  Clock,
  Brain,
} from "lucide-react";

type GameState =
  | "welcome"
  | "playing"
  | "gameOver"
  | "winner"
  | "creator"
  | "library"
  | "editor";
type LifelineType = "50-50" | "audience" | "flip" | "hint";

interface Lifelines {
  "50-50": boolean;
  audience: boolean;
  flip: boolean;
  hint: boolean;
}

export function QuizGame() {
  const [gameState, setGameState] = useState<GameState>("welcome");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [customQuestions, setCustomQuestions] = useState<Question[]>([]);
  const [savedQuizzes, setSavedQuizzes] = useState<Quiz[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | undefined>(undefined);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [defaultTimeLimit, setDefaultTimeLimit] = useState(30);
  const [lifelines, setLifelines] = useState<Lifelines>({
    "50-50": true,
    audience: true,
    flip: true,
    hint: true,
  });
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);
  const [showLifelineModal, setShowLifelineModal] =
    useState<LifelineType | null>(null);
  const [showAudiencePoll, setShowAudiencePoll] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const [audiencePoll, setAudiencePoll] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isLifelineActive, setIsLifelineActive] = useState(false);
  const [lifelineTimeLeft, setLifelineTimeLeft] = useState(0);
  const [activeLifelineType, setActiveLifelineType] =
    useState<LifelineType | null>(null);

  const currentQuestion = questions[currentQuestionIndex];

  const handleLifelineTimeout = useCallback(() => {
    setIsLifelineActive(false);
    setActiveLifelineType(null);
    if (activeLifelineType === "audience") {
      setShowAudiencePoll(false);
    }
  }, [activeLifelineType]);



  

  // Main question timer - pauses when lifeline is active
  useEffect(() => {
    if (
      gameState === "playing" &&
      timeLeft > 0 &&
      !showResult &&
      !isLifelineActive
    ) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameState === "playing") {
      handleGameOver();
    }
  }, [timeLeft, gameState, showResult, isLifelineActive]);

  // Lifeline timer - runs separately from main timer
  useEffect(() => {
    if (isLifelineActive && lifelineTimeLeft > 0) {
      const timer = setTimeout(
        () => setLifelineTimeLeft(lifelineTimeLeft - 1),
        1000,
      );
      return () => clearTimeout(timer);
    } else if (lifelineTimeLeft === 0 && isLifelineActive) {
      handleLifelineTimeout();
    }
  }, [lifelineTimeLeft, isLifelineActive, handleLifelineTimeout]);

  const startGame = (useCustomQuestions = false) => {
    const gameQuestions =
      useCustomQuestions && customQuestions.length >= 10
        ? customQuestions.slice(0, 10)
        : getRandomQuestions(10);
    setQuestions(gameQuestions);
    setCurrentQuestionIndex(0);
    setScore(0);
    const initialTime = gameQuestions[0]?.timeLimit || 30;
    setTimeLeft(initialTime);
    setDefaultTimeLimit(initialTime);
    setLifelines({ "50-50": true, audience: true, flip: true, hint: true });
    setEliminatedOptions([]);
    setSelectedAnswer(null);
    setShowResult(false);
    setIsLifelineActive(false);
    setActiveLifelineType(null);
    setGameState("playing");
  };

  // Load saved quizzes on component mount
  useEffect(() => {
    const savedQuizzesData = localStorage.getItem("savedQuizzes");
    if (savedQuizzesData) {
      const parsed = JSON.parse(savedQuizzesData) as unknown[];
      const normalized = parsed.map((q) => {
        const quiz = q as Record<string, unknown>;
        return {
          ...quiz,
          createdAt: new Date(quiz['createdAt'] as string),
          updatedAt: new Date(quiz['updatedAt'] as string),
        } as Quiz;
      });
      setSavedQuizzes(normalized);
    }
  }, []);

  const goToCreator = () => {
    setGameState("creator");
  };

  const goToLibrary = () => {
    setGameState("library");
  };

  const goToEditor = (quiz?: Quiz, importedQuestions?: unknown[]) => {
    if (importedQuestions) {
      // Create a new quiz with imported questions
      const processedQuestions = (importedQuestions as unknown[]).map((q) => q as Question);
      const newQuiz: Quiz = {
        id: "",
        title: "Imported Quiz",
        description: "Quiz created from imported questions",
        questions: processedQuestions,
        category: "General",
        difficulty: "mixed",
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [],
      };
      setEditingQuiz(newQuiz);
    } else {
      setEditingQuiz(quiz);
    }
    setGameState("editor");
  };

  const saveCustomQuestions = (newQuestions: Question[]) => {
    setCustomQuestions(newQuestions);
    setGameState("welcome");
  };

  const saveQuiz = (quiz: Quiz) => {
    const existingQuizzes = JSON.parse(
      localStorage.getItem("savedQuizzes") || "[]",
    );
    const existingIndex = existingQuizzes.findIndex(
      (q: Quiz) => q.id === quiz.id,
    );

    let updatedQuizzes;
    if (existingIndex >= 0) {
      // Update existing quiz
      updatedQuizzes = [...existingQuizzes];
      updatedQuizzes[existingIndex] = { ...quiz, updatedAt: new Date() };
    } else {
      // Add new quiz with unique ID
      const newQuiz = {
        ...quiz,
        id:
          quiz.id ||
          Date.now().toString() + Math.random().toString(36).substr(2, 9),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      updatedQuizzes = [...existingQuizzes, newQuiz];
    }

    // Always persist to localStorage to ensure quizzes are permanently saved
    localStorage.setItem("savedQuizzes", JSON.stringify(updatedQuizzes));
    setSavedQuizzes(updatedQuizzes);
    setGameState("library");
  };

  const playQuiz = (quiz: Quiz) => {
    setCurrentQuiz(quiz);
    setQuestions(quiz.questions.slice(0, 10)); // Limit to 10 questions for gameplay
    setCurrentQuestionIndex(0);
    setScore(0);
    const initialTime = quiz.questions[0]?.timeLimit || 30;
    setTimeLeft(initialTime);
    setDefaultTimeLimit(initialTime);
    setLifelines({ "50-50": true, audience: true, flip: true, hint: true });
    setEliminatedOptions([]);
    setSelectedAnswer(null);
    setShowResult(false);
    setIsLifelineActive(false);
    setActiveLifelineType(null);
    setGameState("playing");
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;

    setSelectedAnswer(answerIndex);
    setShowResult(true);

    setTimeout(() => {
      if (answerIndex === currentQuestion.correctAnswer) {
        const newScore = score + 1;
        setScore(newScore);

        if (currentQuestionIndex === questions.length - 1) {
          setGameState("winner");
        } else {
          nextQuestion();
        }
      } else {
        handleGameOver();
      }
    }, 2000);
  };

  const nextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(nextIndex);
    const nextTimeLimit = questions[nextIndex]?.timeLimit || 30;
    setTimeLeft(nextTimeLimit);
    setDefaultTimeLimit(nextTimeLimit);
    setEliminatedOptions([]);
    setSelectedAnswer(null);
    setShowResult(false);
    setIsLifelineActive(false);
    setActiveLifelineType(null);
  };

  const handleGameOver = () => {
    setGameState("gameOver");
  };
  const applyLifeline = (type: LifelineType) => {
    if (!lifelines[type]) return;

    setLifelines({ ...lifelines, [type]: false });

    // Set up lifeline timer for interactive lifelines
    if (type === "audience") {
      setIsLifelineActive(true);
      setActiveLifelineType(type);
      setLifelineTimeLeft(60); // 60s for audience
    }

    switch (type) {
      case "50-50": {
        const wrongOptions = [0, 1, 2, 3].filter(
          (i) => i !== currentQuestion.correctAnswer,
        );
        const toEliminate = wrongOptions
          .sort(() => Math.random() - 0.5)
          .slice(0, 2);
        setEliminatedOptions(toEliminate);
        break;
      }
      case "audience": {
        setShowAudiencePoll(true);
        break;
      }
      case "flip": {
        const availableQuestions = mathQuestions.filter(
          (q) => !questions.includes(q),
        );
        if (availableQuestions.length > 0) {
          const newQuestion =
            availableQuestions[
              Math.floor(Math.random() * availableQuestions.length)
            ];
          const newQuestions = [...questions];
          newQuestions[currentQuestionIndex] = newQuestion;
          setQuestions(newQuestions);
          setEliminatedOptions([]);
        }
        break;
      }
      case "hint": {
        setShowHint(true);
        break;
      }
    }
  };

  const getOptionClass = (index: number) => {
    if (eliminatedOptions.includes(index)) {
      return "opacity-30 cursor-not-allowed";
    }
    if (showResult && selectedAnswer !== null) {
      if (index === currentQuestion.correctAnswer) {
        return "success-gradient text-white border-green-400 button-glow";
      }
      if (
        index === selectedAnswer &&
        selectedAnswer !== currentQuestion.correctAnswer
      ) {
        return "error-gradient text-white border-red-400";
      }
    }
    return "quiz-option border-2 border-border";
  };

  const handleAudiencePollComplete = (results: number[]) => {
    setAudiencePoll(results);
    setShowAudiencePoll(false);
    setIsLifelineActive(false);
    setActiveLifelineType(null);
    setShowLifelineModal("audience");
  };

  const handleHintComplete = () => {
    setShowHint(false);
  };

  if (gameState === "welcome") {
    return (
      <WelcomeScreen
        onStart={startGame}
        onCreateQuestions={goToCreator}
        onManageQuizzes={goToLibrary}
        hasCustomQuestions={customQuestions.length > 0}
        hasSavedQuizzes={savedQuizzes.length > 0}
      />
    );
  }

  if (gameState === "creator") {
    return (
      <QuestionCreator
        onBack={() => setGameState("welcome")}
        onSaveQuestions={saveCustomQuestions}
        existingQuestions={customQuestions}
      />
    );
  }

  if (gameState === "library") {
    return (
      <QuizLibrary
        onCreateQuiz={() => goToEditor()}
        onEditQuiz={(quiz) => goToEditor(quiz)}
        onPlayQuiz={playQuiz}
        onBack={() => setGameState("welcome")}
        onCreateFromQuestions={(questions) => goToEditor(undefined, questions)}
      />
    );
  }

  if (gameState === "editor") {
    return (
      <QuizEditor
        quiz={editingQuiz}
        onSave={saveQuiz}
        onBack={() => setGameState("library")}
      />
    );
  }

  if (gameState === "gameOver") {
    return (
      <GameOverScreen
        score={score}
        totalQuestions={questions.length}
        onRestart={startGame}
      />
    );
  }

  if (gameState === "winner") {
    return <WinnerScreen onRestart={startGame} />;
  }

  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-4 slide-in-up">
          <h1 className="text-4xl font-bold brand-gradient floating">
            Kaun Banega Mathpati 🏆
          </h1>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Badge
              variant="outline"
              className="border-accent text-accent px-4 py-2"
            >
              Question {currentQuestionIndex + 1} of {questions.length}
            </Badge>
            <Badge
              variant="outline"
              className="border-primary text-primary px-4 py-2"
            >
              Score: {score}
            </Badge>
            <Badge
              variant="outline"
              className="border-muted-foreground text-muted-foreground px-4 py-2"
            >
              Difficulty: {currentQuestion?.difficulty}
            </Badge>
          </div>
        </div>

        {/* Timer - Main and Lifeline */}
        <div className="space-y-4">
          {/* Main Timer */}
          <Card
            className={`card-gradient border-accent/30 p-6 fade-in ${isLifelineActive ? "opacity-60" : ""}`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-full ${timeLeft <= 10 ? "bg-destructive/20" : "bg-accent/20"}`}
              >
                <Timer
                  className={`w-6 h-6 ${timeLeft <= 10 ? "text-destructive" : "text-accent"}`}
                />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    {isLifelineActive
                      ? "Question Timer (Paused)"
                      : "Time Remaining"}
                  </span>
                  <span
                    className={`text-xl font-bold ${timeLeft <= 10 ? "text-destructive" : "text-accent"}`}
                  >
                    {timeLeft}s
                  </span>
                </div>
                <Progress
                  value={(timeLeft / defaultTimeLimit) * 100}
                  className={`h-3 ${timeLeft <= 10 ? "timer-warning" : ""}`}
                />
              </div>
            </div>
          </Card>

          {/* Lifeline Timer */}
          {isLifelineActive && (
            <Card className="card-gradient border-primary/30 p-6 pulse-ring">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/20">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Audience Poll Timer
                    </span>
                    <span className="text-xl font-bold text-primary">
                      {lifelineTimeLeft}s
                    </span>
                  </div>
                  <Progress
                    value={(lifelineTimeLeft / 60) * 100}
                    className="h-3"
                  />
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Question */}
        <Card className="card-gradient border-accent/30 p-8 slide-in-up">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-4 text-foreground">
              {currentQuestion?.question}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentQuestion?.options.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                size="lg"
                className={`p-6 text-left justify-start min-h-[80px] text-base ${getOptionClass(index)}`}
                onClick={() => handleAnswerSelect(index)}
                disabled={eliminatedOptions.includes(index) || showResult}
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-accent">
                      {String.fromCharCode(65 + index)}
                    </span>
                  </div>
                  <span className="flex-1">{option}</span>
                </div>
              </Button>
            ))}
          </div>
        </Card>

        {/* Lifelines */}
        <Card className="card-gradient border-accent/30 p-6 bounce-in">
          <h3 className="text-lg font-semibold text-center mb-4">Lifelines</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={() => applyLifeline("50-50")}
              disabled={!lifelines["50-50"] || showResult || isLifelineActive}
              className="flex flex-col items-center gap-2 p-6 h-auto border-2 hover:scale-105 transition-all disabled:opacity-50"
            >
              <HelpCircle className="w-6 h-6" />
              <span className="text-sm font-medium">50-50</span>
              {!lifelines["50-50"] && (
                <span className="text-xs text-muted-foreground">Used</span>
              )}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => applyLifeline("audience")}
              disabled={!lifelines.audience || showResult || isLifelineActive}
              className="flex flex-col items-center gap-2 p-6 h-auto border-2 hover:scale-105 transition-all disabled:opacity-50"
            >
              <Users className="w-6 h-6" />
              <span className="text-sm font-medium">Audience</span>
              {!lifelines.audience && (
                <span className="text-xs text-muted-foreground">Used</span>
              )}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => applyLifeline("flip")}
              disabled={!lifelines.flip || showResult || isLifelineActive}
              className="flex flex-col items-center gap-2 p-6 h-auto border-2 hover:scale-105 transition-all disabled:opacity-50"
            >
              <RotateCcw className="w-6 h-6" />
              <span className="text-sm font-medium">Flip</span>
              {!lifelines.flip && (
                <span className="text-xs text-muted-foreground">Used</span>
              )}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => applyLifeline("hint")}
              disabled={!lifelines.hint || showResult || isLifelineActive}
              className="flex flex-col items-center gap-2 p-6 h-auto border-2 hover:scale-105 transition-all disabled:opacity-50"
            >
              <Brain className="w-6 h-6" />
              <span className="text-sm font-medium">Hint</span>
              {!lifelines.hint && (
                <span className="text-xs text-muted-foreground">Used</span>
              )}
            </Button>
          </div>
        </Card>
      </div>

      {/* Lifeline Modals */}
      <LifelineModal
        type={showLifelineModal}
        isOpen={showLifelineModal !== null}
        onClose={() => setShowLifelineModal(null)}
        question={currentQuestion}
        audiencePoll={audiencePoll}
      />

      <AudiencePollShare
        isOpen={showAudiencePoll}
        onClose={() => setShowAudiencePoll(false)}
        question={currentQuestion}
        onPollComplete={handleAudiencePollComplete}
      />

      <HintModal
        isOpen={showHint}
        onClose={handleHintComplete}
        question={currentQuestion}
      />
    </div>
  );
}
