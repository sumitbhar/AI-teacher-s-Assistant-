
import { Board, Language, Difficulty, RequestType } from './types';

export const BOARDS: Board[] = [Board.CBSE, Board.ICSE];

export const CLASS_LEVELS: string[] = [
  '1st', '2nd', '3rd', '4th', '5th', '6th', 
  '7th', '8th', '9th', '10th', '11th', '12th'
];

export const LANGUAGES: Language[] = [
  Language.ENGLISH,
  Language.HINDI,
  Language.BILINGUAL,
];

export const DIFFICULTIES: Difficulty[] = [
  Difficulty.FOUNDATIONAL,
  Difficulty.INTERMEDIATE,
  Difficulty.ADVANCED,
];

export const REQUEST_TYPES: RequestType[] = [
  RequestType.LESSON_PLAN,
  RequestType.QUIZ,
  RequestType.INTERACTIVE_QUIZ,
  RequestType.BOARD_QUESTION_PAPER,
  RequestType.WORKSHEET,
  RequestType.EXPLANATION,
  RequestType.REAL_WORLD_EXAMPLES,
  RequestType.PROJECT_IDEAS,
];

export const EXAM_TYPES: string[] = ['Main Exam', 'Compartment Exam', 'Sample Paper'];
