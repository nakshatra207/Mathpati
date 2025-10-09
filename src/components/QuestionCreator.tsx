import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Eye,
  Clock,
  Copy,
  Download,
  Upload,
} from "lucide-react";
import { type Question } from "@/data/questions";
import { useToast } from "@/hooks/use-toast";

interface QuestionCreatorProps {
  onBack: () => void;
  onSaveQuestions: (questions: Question[]) => void;
  existingQuestions?: Question[];
}

export function QuestionCreator({
  onBack,
  onSaveQuestions,
  existingQuestions = [],
}: QuestionCreatorProps) {
  const [questions, setQuestions] = useState<Question[]>(existingQuestions);
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    difficulty: "easy" as "easy" | "medium" | "hard",
    friendHint: "",
    timeLimit: 30,
  });
  const [bulkQuestions, setBulkQuestions] = useState("");
  const [activeTab, setActiveTab] = useState("single");
  const { toast } = useToast();

  const addQuestion = () => {
    if (
      !newQuestion.question.trim() ||
      newQuestion.options.some((opt) => !opt.trim())
    ) {
      toast({
        title: "Incomplete Question",
        description: "Please fill in all fields before adding the question.",
        variant: "destructive",
      });
      return;
    }

    const question: Question = {
      id: Math.max(0, ...questions.map((q) => q.id)) + 1,
      ...newQuestion,
    };

    setQuestions([...questions, question]);
    setNewQuestion({
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      difficulty: "easy",
      friendHint: "",
      timeLimit: 30,
    });

    toast({
      title: "Question Added! ✅",
      description: `Question ${questions.length + 1} has been added successfully.`,
    });
  };

  const addBulkQuestions = () => {
    if (!bulkQuestions.trim()) {
      toast({
        title: "No Questions Found",
        description: "Please paste your questions in the text area.",
        variant: "destructive",
      });
      return;
    }

    try {
      const parsedQuestions = JSON.parse(bulkQuestions);
      if (!Array.isArray(parsedQuestions)) {
        throw new Error("Questions must be an array");
      }

      const validQuestions = parsedQuestions.map((q, index) => ({
        id: Math.max(0, ...questions.map((q) => q.id)) + index + 1,
        question: q.question || `Question ${index + 1}`,
        options: q.options || ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: q.correctAnswer || 0,
        difficulty: q.difficulty || "medium",
        friendHint: q.friendHint || "",
        timeLimit: q.timeLimit || 30,
      }));

      setQuestions([...questions, ...validQuestions]);
      setBulkQuestions("");

      toast({
        title: "Bulk Questions Added! 🎉",
        description: `${validQuestions.length} questions have been added successfully.`,
      });
    } catch (error) {
      toast({
        title: "Invalid Format",
        description: "Please check your JSON format and try again.",
        variant: "destructive",
      });
    }
  };

  const exportQuestions = () => {
    const dataStr = JSON.stringify(questions, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = "quiz-questions.json";

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    toast({
      title: "Questions Exported! 📄",
      description: "Your questions have been downloaded as a JSON file.",
    });
  };

  const copyQuestionsToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(questions, null, 2));
    toast({
      title: "Copied to Clipboard! 📋",
      description: "All questions have been copied to your clipboard.",
    });
  };

  const removeQuestion = (id: number) => {
    setQuestions(questions.filter((q) => q.id !== id));
    toast({
      title: "Question Removed",
      description: "The question has been deleted.",
    });
  };

  const handleSave = () => {
    if (questions.length < 5) {
      toast({
        title: "Need More Questions",
        description: "Please create at least 5 questions for a proper quiz.",
        variant: "destructive",
      });
      return;
    }

    // Auto-save these questions as a quiz to ensure they are permanently stored
    const autoQuiz = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title: `Custom Questions Set - ${new Date().toLocaleDateString()}`,
      description: "Auto-saved quiz from question creator",
      category: "Custom",
      difficulty: "mixed" as const,
      questions: questions,
      tags: ["auto-saved", "custom"],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save to localStorage to ensure permanent storage
    const existingQuizzes = JSON.parse(
      localStorage.getItem("savedQuizzes") || "[]",
    );
    const updatedQuizzes = [...existingQuizzes, autoQuiz];
    localStorage.setItem("savedQuizzes", JSON.stringify(updatedQuizzes));

    onSaveQuestions(questions);

    toast({
      title: "Questions Saved!",
      description: "Your questions have been saved and added to Quiz Library.",
    });
  };

  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between slide-in-up">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Welcome
          </Button>

          <h1 className="text-3xl font-bold brand-gradient">
            Question Creator 📝
          </h1>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-accent text-accent">
              {questions.length} Questions
            </Badge>
            <Button
              variant="outline"
              onClick={copyQuestionsToClipboard}
              className="flex items-center gap-2"
              disabled={questions.length === 0}
            >
              <Copy className="w-4 h-4" />
              Copy
            </Button>
            <Button
              variant="outline"
              onClick={exportQuestions}
              className="flex items-center gap-2"
              disabled={questions.length === 0}
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button
              onClick={handleSave}
              disabled={questions.length === 0}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Questions
            </Button>
          </div>
        </div>

        {/* Question Creation Tabs */}
        <Card className="card-gradient border-accent/30 p-6 fade-in">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single">Single Question</TabsTrigger>
              <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
            </TabsList>

            <TabsContent value="single" className="space-y-6 mt-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add New Question
              </h2>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="question">Question</Label>
                  <Textarea
                    id="question"
                    placeholder="Enter your math question here..."
                    value={newQuestion.question}
                    onChange={(e) =>
                      setNewQuestion({
                        ...newQuestion,
                        question: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Answer Options</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    {newQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                          <span className="font-bold text-accent text-sm">
                            {String.fromCharCode(65 + index)}
                          </span>
                        </div>
                        <Input
                          placeholder={`Option ${String.fromCharCode(65 + index)}`}
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...newQuestion.options];
                            newOptions[index] = e.target.value;
                            setNewQuestion({
                              ...newQuestion,
                              options: newOptions,
                            });
                          }}
                          className="flex-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="difficulty">Difficulty Level</Label>
                    <Select
                      value={newQuestion.difficulty}
                      onValueChange={(value: "easy" | "medium" | "hard") =>
                        setNewQuestion({ ...newQuestion, difficulty: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="correctAnswer">Correct Answer</Label>
                    <Select
                      value={newQuestion.correctAnswer.toString()}
                      onValueChange={(value) =>
                        setNewQuestion({
                          ...newQuestion,
                          correctAnswer: parseInt(value),
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">A</SelectItem>
                        <SelectItem value="1">B</SelectItem>
                        <SelectItem value="2">C</SelectItem>
                        <SelectItem value="3">D</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label
                      htmlFor="timeLimit"
                      className="flex items-center gap-2"
                    >
                      <Clock className="w-4 h-4" />
                      Time Limit (seconds)
                    </Label>
                    <Input
                      id="timeLimit"
                      type="number"
                      min="10"
                      max="120"
                      value={newQuestion.timeLimit}
                      onChange={(e) =>
                        setNewQuestion({
                          ...newQuestion,
                          timeLimit: parseInt(e.target.value) || 30,
                        })
                      }
                      placeholder="30"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="friendHint">Friend Hint (Optional)</Label>
                  <Textarea
                    id="friendHint"
                    placeholder="What would your friend say to help you solve this?"
                    value={newQuestion.friendHint}
                    onChange={(e) =>
                      setNewQuestion({
                        ...newQuestion,
                        friendHint: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                </div>

                <Button
                  onClick={addQuestion}
                  className="w-full flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Question
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="bulk" className="space-y-6 mt-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Bulk Import Questions
                </h2>
                <p className="text-sm text-muted-foreground">
                  Paste JSON format questions below. Each question should have:
                  question, options (array), correctAnswer (0-3), difficulty,
                  friendHint, and timeLimit.
                </p>

                <div className="space-y-4">
                  <Label htmlFor="bulkQuestions">JSON Questions Data</Label>
                  <Textarea
                    id="bulkQuestions"
                    value={bulkQuestions}
                    onChange={(e) => setBulkQuestions(e.target.value)}
                    placeholder={`[
  {
    "question": "What is 2 + 2?",
    "options": ["3", "4", "5", "6"],
    "correctAnswer": 1,
    "difficulty": "easy",
    "friendHint": "It's the simplest addition",
    "timeLimit": 30
  }
]`}
                    className="min-h-[200px] font-mono text-sm"
                  />

                  <Button
                    onClick={addBulkQuestions}
                    className="w-full flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Import Questions
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Questions List */}
        {questions.length > 0 && (
          <Card className="card-gradient border-accent/30 p-6 bounce-in">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Your Questions ({questions.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {questions.map((question, index) => (
                <div
                  key={question.id}
                  className="quiz-option border-2 border-border p-4 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{question.question}</h3>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {question.difficulty}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Answer:{" "}
                          {String.fromCharCode(65 + question.correctAnswer)}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-xs flex items-center gap-1"
                        >
                          <Clock className="w-3 h-3" />
                          {question.timeLimit || 30}s
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQuestion(question.id)}
                      className="text-destructive hover:text-destructive ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                    {question.options.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className={`p-2 rounded text-xs ${
                          optIndex === question.correctAnswer
                            ? "bg-accent/20 text-accent border border-accent/30"
                            : "bg-muted/20 text-muted-foreground"
                        }`}
                      >
                        {String.fromCharCode(65 + optIndex)}. {option}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
