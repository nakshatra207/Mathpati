import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Quiz, QuizFilters, Question } from "@/types/quiz";
import {
  Search,
  Plus,
  Play,
  Edit,
  Trash2,
  Calendar,
  Tag,
  BookOpen,
  Filter,
  Download,
  Upload,
  FileText,
  Code,
} from "lucide-react";

interface QuizLibraryProps {
  onCreateQuiz: () => void;
  onEditQuiz: (quiz: Quiz) => void;
  onPlayQuiz: (quiz: Quiz) => void;
  onCreateFromQuestions: (questions: Question[]) => void;
  onBack: () => void;
}

export function QuizLibrary({
  onCreateQuiz,
  onEditQuiz,
  onPlayQuiz,
  onCreateFromQuestions,
  onBack,
}: QuizLibraryProps) {
  const { toast } = useToast();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [jsonInput, setJsonInput] = useState("");
  const [showJsonInput, setShowJsonInput] = useState(false);
  const [filters, setFilters] = useState<QuizFilters>({
    category: "all",
    difficulty: "all",
    searchTerm: "",
    tags: [],
  });

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = () => {
    const savedQuizzes = localStorage.getItem("savedQuizzes");
    if (savedQuizzes) {
      const parsed = JSON.parse(savedQuizzes) as unknown[];
      const normalized = parsed.map((q) => {
        const quiz = q as Record<string, unknown>;
        return {
          ...quiz,
          createdAt: new Date(quiz['createdAt'] as string),
          updatedAt: new Date(quiz['updatedAt'] as string),
        } as Quiz;
      });
      setQuizzes(normalized);
    }
  };

  const saveQuizzes = (newQuizzes: Quiz[]) => {
    localStorage.setItem("savedQuizzes", JSON.stringify(newQuizzes));
    setQuizzes(newQuizzes);
  };

  // Quiz deletion disabled to ensure all quizzes are permanently saved
  const deleteQuiz = (quizId: string) => {
    toast({
      title: "Delete Disabled",
      description: "Quizzes cannot be deleted to ensure permanent storage.",
      variant: "destructive",
    });
  };

  const duplicateQuiz = (quiz: Quiz) => {
    const newQuiz: Quiz = {
      ...quiz,
      id: Date.now().toString(),
      title: `${quiz.title} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const updatedQuizzes = [...quizzes, newQuiz];
    saveQuizzes(updatedQuizzes);
    toast({
      title: "Quiz Duplicated",
      description: "A copy of the quiz has been created.",
    });
  };

  const exportQuizzes = () => {
    const dataStr = JSON.stringify(quizzes, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "my-quizzes.json";
    link.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Quizzes Exported",
      description: "All quizzes have been exported to a JSON file.",
    });
  };

  const importQuizzes = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedQuizzes = JSON.parse(e.target?.result as string) as unknown[];
        const validQuizzes = (importedQuizzes || []).filter((q) => {
          const quiz = q as Record<string, unknown>;
          return quiz && quiz.title && quiz.questions && Array.isArray(quiz.questions as unknown);
        });

        const newQuizzes = validQuizzes.map((q) => {
          const quiz = q as Record<string, unknown>;
          return {
            ...quiz,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            createdAt: new Date(),
            updatedAt: new Date(),
          } as Quiz;
        });

        const updatedQuizzes = [...quizzes, ...newQuizzes];
        saveQuizzes(updatedQuizzes);
        toast({
          title: "Quizzes Imported",
          description: `${newQuizzes.length} quizzes have been imported successfully.`,
        });
      } catch (error) {
        toast({
          title: "Import Failed",
          description:
            "The file format is invalid. Please check your JSON file.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const importQuestions = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);

        // Check if it's an array of questions or a single quiz with questions
        let questions: unknown[] = [];
        if (Array.isArray(importedData)) {
          // Direct array of questions
          questions = importedData.filter((q) => {
            const x = q as unknown as Record<string, unknown>;
            return (
              x !== null &&
              typeof x === 'object' &&
              'question' in x &&
              'options' in x &&
              Array.isArray(x['options']) &&
              typeof x['correctAnswer'] === 'number'
            );
          });
        } else if (
          importedData.questions &&
          Array.isArray(importedData.questions)
        ) {
          // Quiz object with questions property
          questions = importedData.questions.filter((q) => {
            const x = q as unknown as Record<string, unknown>;
            return (
              x !== null &&
              typeof x === 'object' &&
              'question' in x &&
              'options' in x &&
              Array.isArray(x['options']) &&
              typeof x['correctAnswer'] === 'number'
            );
          });
        }

        if (questions.length === 0) {
          toast({
            title: "No Valid Questions Found",
            description: "The file doesn't contain any valid questions.",
            variant: "destructive",
          });
          return;
        }

        // Process questions to ensure they have proper structure
        const processedQuestions = questions.map((q, index) => {
          const x = q as Record<string, unknown>;
          return {
            id: index + 1,
            question: x['question'] as string,
            options: Array.isArray(x['options']) ? (x['options'] as string[]).slice(0, 4) : [],
            correctAnswer: x['correctAnswer'] as number,
            difficulty: (x['difficulty'] as string) || "medium",
            friendHint: (x['friendHint'] as string) || "",
            timeLimit: (x['timeLimit'] as number) || 30,
          } as Question;
        });

        onCreateFromQuestions(processedQuestions);
        toast({
          title: "Questions Imported",
          description: `${processedQuestions.length} questions imported. Create a new quiz with these questions.`,
        });
      } catch (error) {
        toast({
          title: "Import Failed",
          description:
            "The file format is invalid. Please check your JSON file.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);

    // Reset the input
    event.target.value = "";
  };

  const createQuizFromJson = () => {
    if (!jsonInput.trim()) {
      toast({
        title: "No JSON Data",
        description: "Please enter JSON data in the text area.",
        variant: "destructive",
      });
      return;
    }

    try {
      const importedData = JSON.parse(jsonInput);

      // Check if it's an array of questions or a single quiz with questions
      let questions: unknown[] = [];
      if (Array.isArray(importedData)) {
        // Direct array of questions
        questions = importedData.filter((q) => {
          const x = q as unknown as Record<string, unknown>;
          return (
            x !== null &&
            typeof x === 'object' &&
            'question' in x &&
            'options' in x &&
            Array.isArray(x['options']) &&
            typeof x['correctAnswer'] === 'number'
          );
        });
      } else if (
        importedData.questions &&
        Array.isArray(importedData.questions)
      ) {
        // Quiz object with questions property
        questions = importedData.questions.filter((q) => {
          const x = q as unknown as Record<string, unknown>;
          return (
            x !== null &&
            typeof x === 'object' &&
            'question' in x &&
            'options' in x &&
            Array.isArray(x['options']) &&
            typeof x['correctAnswer'] === 'number'
          );
        });
      }

      if (questions.length === 0) {
        toast({
          title: "No Valid Questions Found",
          description: "The JSON doesn't contain any valid questions.",
          variant: "destructive",
        });
        return;
      }

      // Process questions to ensure they have proper structure
      const processedQuestions = questions.map((q, index) => ({
        id: index + 1,
        question: q.question,
        options: Array.isArray(q.options) ? q.options.slice(0, 4) : [],
        correctAnswer: q.correctAnswer,
        difficulty: q.difficulty || "medium",
        friendHint: q.friendHint || "",
        timeLimit: q.timeLimit || 30,
      }));

      onCreateFromQuestions(processedQuestions);
      setJsonInput("");
      setShowJsonInput(false);
      toast({
        title: "Questions Imported from JSON",
        description: `${processedQuestions.length} questions imported. Create a new quiz with these questions.`,
      });
    } catch (error) {
      toast({
        title: "Invalid JSON Format",
        description: "Please check your JSON format and try again.",
        variant: "destructive",
      });
    }
  };

  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSearch =
      quiz.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      quiz.description.toLowerCase().includes(filters.searchTerm.toLowerCase());
    const matchesCategory =
      filters.category === "all" || quiz.category === filters.category;
    const matchesDifficulty =
      filters.difficulty === "all" || quiz.difficulty === filters.difficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const categories = [...new Set(quizzes.map((quiz) => quiz.category))];
  const allTags = [...new Set(quizzes.flatMap((quiz) => quiz.tags))];

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold brand-gradient">Quiz Library</h1>
            <p className="text-muted-foreground">
              Organize and manage your quiz collection
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={onBack} variant="outline">
              Back to Game
            </Button>
            <Button
              onClick={() => setShowJsonInput(!showJsonInput)}
              variant="outline"
              className="mr-2"
            >
              <Code className="w-4 h-4 mr-2" />
              {showJsonInput ? "Hide" : "Write"} JSON
            </Button>
            <Button
              onClick={onCreateQuiz}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Quiz
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="card-gradient border-accent/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search quizzes..."
                    value={filters.searchTerm}
                    onChange={(e) =>
                      setFilters({ ...filters, searchTerm: e.target.value })
                    }
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={filters.category}
                  onValueChange={(value) =>
                    setFilters({ ...filters, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Difficulty</label>
                <Select
                  value={filters.difficulty}
                  onValueChange={(value) =>
                    setFilters({ ...filters, difficulty: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Difficulties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Difficulties</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Actions</label>
                <div className="flex gap-2">
                  <Button onClick={exportQuizzes} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-1" />
                    Export
                  </Button>
                  <label htmlFor="import-file">
                    <Button variant="outline" size="sm" asChild>
                      <span>
                        <Upload className="w-4 h-4 mr-1" />
                        Import
                      </span>
                    </Button>
                    <input
                      id="import-file"
                      type="file"
                      accept=".json"
                      onChange={importQuizzes}
                      className="hidden"
                    />
                  </label>
                  <label htmlFor="import-questions">
                    <Button variant="outline" size="sm" asChild>
                      <span>
                        <FileText className="w-4 h-4 mr-1" />
                        Questions
                      </span>
                    </Button>
                    <input
                      id="import-questions"
                      type="file"
                      accept=".json"
                      onChange={importQuestions}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* JSON Input Section */}
        {showJsonInput && (
          <Card className="card-gradient border-accent/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Write Questions in JSON Format
              </CardTitle>
              <CardDescription>
                Write your questions in JSON format and create a quiz directly
                from them.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  JSON Questions Data
                </label>
                <Textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder={`[
  {
    "question": "What is 2 + 2?",
    "options": ["3", "4", "5", "6"],
    "correctAnswer": 1,
    "difficulty": "easy",
    "friendHint": "It's the simplest addition",
    "timeLimit": 30
  },
  {
    "question": "What is 5 × 3?",
    "options": ["12", "15", "18", "20"],
    "correctAnswer": 1,
    "difficulty": "medium",
    "friendHint": "Multiply 5 by 3",
    "timeLimit": 45
  }
]`}
                  className="min-h-[300px] font-mono text-sm"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={createQuizFromJson}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Quiz from JSON
                </Button>
                <Button onClick={() => setJsonInput("")} variant="outline">
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quiz Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Quizzes Found</h3>
              <p className="text-muted-foreground mb-6">
                {quizzes.length === 0
                  ? "Create your first quiz to get started!"
                  : "No quizzes match your current filters."}
              </p>
              <Button onClick={onCreateQuiz}>
                <Plus className="w-4 h-4 mr-2" />
                Create New Quiz
              </Button>
            </div>
          ) : (
            filteredQuizzes.map((quiz) => (
              <Card
                key={quiz.id}
                className="card-gradient border-accent/30 hover:scale-105 transition-all"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">
                        {quiz.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {quiz.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge
                      variant="outline"
                      className="border-accent text-accent"
                    >
                      {quiz.category}
                    </Badge>
                    <Badge
                      variant={
                        quiz.difficulty === "easy"
                          ? "default"
                          : quiz.difficulty === "medium"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {quiz.difficulty}
                    </Badge>
                    <Badge variant="outline">
                      {quiz.questions.length} questions
                    </Badge>
                  </div>
                  {quiz.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {quiz.tags.slice(0, 3).map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                      {quiz.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{quiz.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                    <Calendar className="w-3 h-3" />
                    Created {quiz.createdAt.toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => onPlayQuiz(quiz)}
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                      size="sm"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Play
                    </Button>
                    <Button
                      onClick={() => onEditQuiz(quiz)}
                      variant="outline"
                      size="sm"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => duplicateQuiz(quiz)}
                      variant="outline"
                      size="sm"
                    >
                      <BookOpen className="w-4 h-4" />
                    </Button>
                    {/* Delete functionality disabled to ensure permanent quiz storage */}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
