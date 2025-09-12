export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'easy' | 'medium' | 'hard';
  friendHint?: string;
  timeLimit?: number; // Custom time limit in seconds
}

export const mathQuestions: Question[] = [
  // Easy Questions (1-4)
  {
    id: 1,
    question: "What is 15 + 27?",
    options: ["40", "42", "44", "41"],
    correctAnswer: 1,
    difficulty: 'easy',
    friendHint: "I think it's 42. Just add them step by step: 15 + 27 = 42."
  },
  {
    id: 2,
    question: "What is 8 × 7?",
    options: ["54", "56", "58", "52"],
    correctAnswer: 1,
    difficulty: 'easy',
    friendHint: "Remember the multiplication table: 8 × 7 = 56."
  },
  {
    id: 3,
    question: "What is 144 ÷ 12?",
    options: ["11", "12", "13", "14"],
    correctAnswer: 1,
    difficulty: 'easy',
    friendHint: "Think of it as: how many 12s go into 144? It's 12."
  },
  {
    id: 4,
    question: "What is 25% of 80?",
    options: ["15", "20", "25", "30"],
    correctAnswer: 1,
    difficulty: 'easy',
    friendHint: "25% is 1/4, so 80 ÷ 4 = 20."
  },
  
  // Medium Questions (5-7)
  {
    id: 5,
    question: "What is the square root of 169?",
    options: ["11", "12", "13", "14"],
    correctAnswer: 2,
    difficulty: 'medium',
    friendHint: "I remember 13 × 13 = 169, so the square root is 13."
  },
  {
    id: 6,
    question: "If a = 5 and b = 3, what is a² + b²?",
    options: ["28", "30", "32", "34"],
    correctAnswer: 3,
    difficulty: 'medium',
    friendHint: "a² = 25, b² = 9, so 25 + 9 = 34."
  },
  {
    id: 7,
    question: "What is 15% of 240?",
    options: ["32", "34", "36", "38"],
    correctAnswer: 2,
    difficulty: 'medium',
    friendHint: "15% = 0.15, so 240 × 0.15 = 36."
  },
  
  // Hard Questions (8-10)
  {
    id: 8,
    question: "What is the value of 2³ + 3² - 4?",
    options: ["11", "12", "13", "14"],
    correctAnswer: 2,
    difficulty: 'hard',
    friendHint: "2³ = 8, 3² = 9, so 8 + 9 - 4 = 13."
  },
  {
    id: 9,
    question: "If 3x + 7 = 22, what is x?",
    options: ["4", "5", "6", "7"],
    correctAnswer: 1,
    difficulty: 'hard',
    friendHint: "Subtract 7 from both sides: 3x = 15, then divide by 3: x = 5."
  },
  {
    id: 10,
    question: "What is the area of a circle with radius 7? (Use π ≈ 3.14)",
    options: ["153.86", "148.24", "150.36", "151.78"],
    correctAnswer: 0,
    difficulty: 'hard',
    friendHint: "Area = π × r². So 3.14 × 7² = 3.14 × 49 = 153.86."
  },

  // Additional questions for variety
  {
    id: 11,
    question: "What is 9 × 8?",
    options: ["70", "72", "74", "76"],
    correctAnswer: 1,
    difficulty: 'easy',
    friendHint: "9 × 8 = 72. Think of it as (10 × 8) - 8 = 80 - 8 = 72."
  },
  {
    id: 12,
    question: "What is 100 - 37?",
    options: ["61", "62", "63", "64"],
    correctAnswer: 2,
    difficulty: 'easy',
    friendHint: "100 - 37 = 63. Just subtract step by step."
  },
  {
    id: 13,
    question: "What is 6²?",
    options: ["34", "35", "36", "37"],
    correctAnswer: 2,
    difficulty: 'easy',
    friendHint: "6² means 6 × 6 = 36."
  },
  {
    id: 14,
    question: "What is 50% of 180?",
    options: ["80", "85", "90", "95"],
    correctAnswer: 2,
    difficulty: 'medium',
    friendHint: "50% is half, so 180 ÷ 2 = 90."
  },
  {
    id: 15,
    question: "What is 7 × 9?",
    options: ["61", "63", "65", "67"],
    correctAnswer: 1,
    difficulty: 'medium',
    friendHint: "7 × 9 = 63. Remember your multiplication tables!"
  },
  {
    id: 16,
    question: "If y = 4x and x = 3, what is y?",
    options: ["10", "11", "12", "13"],
    correctAnswer: 2,
    difficulty: 'medium',
    friendHint: "Substitute x = 3 into y = 4x: y = 4 × 3 = 12."
  },
  {
    id: 17,
    question: "What is the cube of 4?",
    options: ["62", "63", "64", "65"],
    correctAnswer: 2,
    difficulty: 'hard',
    friendHint: "4³ = 4 × 4 × 4 = 16 × 4 = 64."
  },
  {
    id: 18,
    question: "What is 20% of 250?",
    options: ["45", "50", "55", "60"],
    correctAnswer: 1,
    difficulty: 'hard',
    friendHint: "20% = 0.20, so 250 × 0.20 = 50."
  },
  {
    id: 19,
    question: "If the perimeter of a square is 28, what is its area?",
    options: ["47", "48", "49", "50"],
    correctAnswer: 2,
    difficulty: 'hard',
    friendHint: "Perimeter = 4 × side, so side = 28 ÷ 4 = 7. Area = 7² = 49."
  },
  {
    id: 20,
    question: "What is log₂(8)?",
    options: ["2", "3", "4", "5"],
    correctAnswer: 1,
    difficulty: 'hard',
    friendHint: "Think: 2 to what power equals 8? 2³ = 8, so log₂(8) = 3."
  }
];

export function getRandomQuestions(count: number = 10): Question[] {
  const shuffled = [...mathQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getAudiencePoll(): number[] {
  // Generate random percentages that add up to 100
  const percentages = [0, 0, 0, 0];
  let remaining = 100;
  
  for (let i = 0; i < 3; i++) {
    percentages[i] = Math.floor(Math.random() * remaining);
    remaining -= percentages[i];
  }
  percentages[3] = remaining;
  
  // Shuffle the percentages
  return percentages.sort(() => Math.random() - 0.5);
}