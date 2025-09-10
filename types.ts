
export enum Board {
  CBSE = 'CBSE',
  ICSE = 'ICSE',
}

export enum Language {
  ENGLISH = 'English',
  HINDI = 'Hindi',
  BILINGUAL = 'Bilingual (English + Hindi)',
}

export enum Difficulty {
  FOUNDATIONAL = 'Foundational',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
}

export enum RequestType {
  LESSON_PLAN = 'Lesson Plan',
  QUIZ = 'Quiz Questions (with answers)',
  WORKSHEET = 'Worksheet',
  EXPLANATION = 'Simplified Explanation',
  REAL_WORLD_EXAMPLES = 'Real-world Examples',
  PROJECT_IDEAS = 'Project Ideas',
  INTERACTIVE_QUIZ = 'Interactive Quiz',
  BOARD_QUESTION_PAPER = 'Board Question Paper',
}

export interface QuizQuestion {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface FormData {
  board: Board;
  classLevel: string;
  subject: string;
  topic: string;
  requestType: RequestType;
  language: Language;
  difficulty: Difficulty;
  year?: string;
  examType?: string;
}

export type GeneratedContent = 
  | { type: 'markdown'; content: string } 
  | { type: 'quiz'; content: QuizQuestion[] };

export interface SavedQuiz {
  id: string;
  topic: string;
  questions: QuizQuestion[];
  savedAt: string;
}