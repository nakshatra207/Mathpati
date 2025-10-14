import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Quiz, Question } from "@/types/quiz";
import { Save, ArrowLeft, Plus, Trash2, Edit, Tag, X } from "lucide-react";

interface QuizEditorProps {
  quiz?: Quiz;
  onSave: (quiz: Quiz) => void;
  onBack: () => void;
}

export function QuizEditor({ quiz, onSave, onBack }: QuizEditorProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState(quiz?.title || "");
  const [description, setDescription] = useState(quiz?.description || "");
  const [category, setCategory] = useState(quiz?.category || "Math");
  const [difficulty, setDifficulty] = useState<
    "easy" | "medium" | "hard" | "mixed"
  >(quiz?.difficulty || "mixed");
  const [tags, setTags] = useState<string[]>(quiz?.tags || []);
  const [newTag, setNewTag] = useState("");
  const [questions, setQuestions] = useState<Question[]>(quiz?.questions || []);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showQuestionEditor, setShowQuestionEditor] = useState(false);

  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    difficulty: "easy",
    friendHint: "",
    timeLimit: 30,
  });

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const addQuestion = () => {
    if (
      !newQuestion.question ||
      newQuestion.options?.some((opt) => !opt.trim())
    ) {
      toast({
        title: "Incomplete Question",
        description: "Please fill in the question and all options.",
        variant: "destructive",
      });
      return;
    }

    const question: Question = {
      id: Date.now(),
      question: newQuestion.question!,
      options: newQuestion.options!,
      correctAnswer: newQuestion.correctAnswer!,
      difficulty: newQuestion.difficulty!,
      friendHint: newQuestion.friendHint,
      timeLimit: newQuestion.timeLimit,
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
    setShowQuestionEditor(false);
    toast({
      title: "Question Added",
      description: "The question has been added to your quiz.",
    });
  };

  const editQuestion = (question: Question) => {
    setEditingQuestion(question);
    setNewQuestion({
      question: question.question,
      options: [...question.options],
      correctAnswer: question.correctAnswer,
      difficulty: question.difficulty,
      friendHint: question.friendHint,
      timeLimit: question.timeLimit,
    });
    setShowQuestionEditor(true);
  };

  const updateQuestion = () => {
    if (
      !editingQuestion ||
      !newQuestion.question ||
      newQuestion.options?.some((opt) => !opt.trim())
    ) {
      toast({
        title: "Incomplete Question",
        description: "Please fill in the question and all options.",
        variant: "destructive",
      });
      return;
    }

    const updatedQuestions = questions.map((q) =>
      q.id === editingQuestion.id
        ? {
            ...q,
            question: newQuestion.question!,
            options: newQuestion.options!,
            correctAnswer: newQuestion.correctAnswer!,
            difficulty: newQuestion.difficulty!,
            friendHint: newQuestion.friendHint,
            timeLimit: newQuestion.timeLimit,
          }
        : q,
    );

    setQuestions(updatedQuestions);
    setEditingQuestion(null);
    setNewQuestion({
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      difficulty: "easy",
      friendHint: "",
      timeLimit: 30,
    });
    setShowQuestionEditor(false);
    toast({
      title: "Question Updated",
      description: "The question has been updated.",
    });
  };

  const deleteQuestion = (questionId: number) => {
    setQuestions(questions.filter((q) => q.id !== questionId));
    toast({
      title: "Question Deleted",
      description: "The question has been removed from your quiz.",
    });
  };

  const saveQuiz = () => {
    if (!title.trim()) {
      toast({
        title: "Missing Title",
        description: "Please enter a title for your quiz.",
        variant: "destructive",
      });
      return;
    }

    if (questions.length < 5) {
      toast({
        title: "Not Enough Questions",
        description: "You need at least 5 questions to save your quiz.",
        variant: "destructive",
      });
      return;
    }

    const savedQuiz: Quiz = {
      id: quiz?.id || Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      category,
      difficulty,
      questions,
      tags,
      createdAt: quiz?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    // Always save to localStorage to ensure permanent storage
    const existingQuizzes = JSON.parse(
      localStorage.getItem("savedQuizzes") || "[]",
    );
    const quizIndex = existingQuizzes.findIndex(
      (q: Quiz) => q.id === savedQuiz.id,
    );

    if (quizIndex >= 0) {
      // Update existing quiz
      existingQuizzes[quizIndex] = savedQuiz;
    } else {
      // Add new quiz
      existingQuizzes.push(savedQuiz);
    }

    localStorage.setItem("savedQuizzes", JSON.stringify(existingQuizzes));

    toast({
      title: "Quiz Saved Successfully! ✅",
      description: "Your quiz has been saved to the Quiz Library.",
    });

    onSave(savedQuiz);
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold brand-gradient">
              {quiz ? "Edit Quiz" : "Create New Quiz"}
            </h1>
            <p className="text-muted-foreground">
              Build your custom quiz with detailed questions
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={onBack} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={saveQuiz}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Quiz
            </Button>
          </div>
        </div>

        {/* Quiz Details */}
        <Card className="card-gradient border-accent/30">
          <CardHeader>
            <CardTitle>Quiz Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title *</label>
                <Input
                  placeholder="Enter quiz title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Input
                  placeholder="e.g., Math, Science, History..."
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Describe your quiz..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Overall Difficulty
                </label>
                <Select
                  value={difficulty}
                  onValueChange={(value: any) => setDifficulty(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tags</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addTag()}
                  />
                  <Button onClick={addTag} size="sm">
                    <Tag className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer"
                    >
                      {tag}
                      <X
                        className="w-3 h-3 ml-1 hover:text-destructive"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <Card className="card-gradient border-accent/30">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Questions ({questions.length})</CardTitle>
              <Button onClick={() => setShowQuestionEditor(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {questions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  No questions added yet
                </p>
                <Button onClick={() => setShowQuestionEditor(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Question
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <Card key={question.id} className="border-2">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium mb-2">
                            Q{index + 1}: {question.question}
                          </h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {question.options.map((option, optIndex) => (
                              <div
                                key={optIndex}
                                className={`p-2 rounded ${optIndex === question.correctAnswer ? "bg-success/20 border border-success" : "bg-muted"}`}
                              >
                                {String.fromCharCode(65 + optIndex)}: {option}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            onClick={() => editQuestion(question)}
                            size="sm"
                            variant="outline"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => deleteQuestion(question.id)}
                            size="sm"
                            variant="destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex gap-2 text-xs">
                        <Badge variant="outline">{question.difficulty}</Badge>
                        <Badge variant="outline">{question.timeLimit}s</Badge>
                        {question.friendHint && (
                          <Badge variant="outline">Has Hint</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Question Editor Modal */}
        {showQuestionEditor && (
          <Card className="card-gradient border-accent/30">
            <CardHeader>
              <CardTitle>
                {editingQuestion ? "Edit Question" : "Add New Question"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Question *</label>
                <Textarea
                  placeholder="Enter your question..."
                  value={newQuestion.question}
                  onChange={(e) =>
                    setNewQuestion({ ...newQuestion, question: e.target.value })
                  }
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Options *</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {newQuestion.options?.map((option, index) => (
                    <div key={index} className="space-y-1">
                      <label className="text-xs text-muted-foreground">
                        Option {String.fromCharCode(65 + index)}
                      </label>
                      <Input
                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...(newQuestion.options || [])];
                          newOptions[index] = e.target.value;
                          setNewQuestion({
                            ...newQuestion,
                            options: newOptions,
                          });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Correct Answer</label>
                  <Select
                    value={newQuestion.correctAnswer?.toString()}
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
                <div className="space-y-2">
                  <label className="text-sm font-medium">Difficulty</label>
                  <Select
                    value={newQuestion.difficulty}
                    onValueChange={(value: any) =>
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
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Time Limit (seconds)
                  </label>
                  <Input
                    type="number"
                    min="10"
                    max="300"
                    value={newQuestion.timeLimit}
                    onChange={(e) =>
                      setNewQuestion({
                        ...newQuestion,
                        timeLimit: parseInt(e.target.value) || 30,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Friend Hint (Optional)
                </label>
                <Textarea
                  placeholder="What would a friend say to help with this question?"
                  value={newQuestion.friendHint}
                  onChange={(e) =>
                    setNewQuestion({
                      ...newQuestion,
                      friendHint: e.target.value,
                    })
                  }
                  rows={2}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={editingQuestion ? updateQuestion : addQuestion}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {editingQuestion ? "Update Question" : "Add Question"}
                </Button>
                <Button
                  onClick={() => {
                    setShowQuestionEditor(false);
                    setEditingQuestion(null);
                    setNewQuestion({
                      question: "",
                      options: ["", "", "", ""],
                      correctAnswer: 0,
                      difficulty: "easy",
                      friendHint: "",
                      timeLimit: 30,
                    });
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
