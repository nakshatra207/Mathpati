export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  category: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'easy' | 'medium' | 'hard';
  friendHint?: string;
  timeLimit?: number;
}

export interface QuizFilters {
  category: string;
  difficulty: string;
  searchTerm: string;
  tags: string[];
}