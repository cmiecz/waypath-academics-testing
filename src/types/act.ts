export interface User {
  id: string;
  name: string;
  email: string;
  grade?: number;
  registeredAt: string;
}

export interface Question {
  id: string;
  questionNumber: number;
  text: string; // Kept for backward compatibility
  easyText?: string; // Tutoring help version: explicitly names grammar rule
  hardText?: string; // Actual question: broad/interpretive
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  // Analytics fields
  questionType?: QuestionType;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  estimatedTime?: number; // in seconds
}

export type QuestionType = 
  | 'detail'           // Specific detail from passage
  | 'inference'        // Implied information
  | 'main-idea'        // Main idea or theme
  | 'author-purpose'   // Author's intent or purpose
  | 'vocabulary'       // Word meaning in context
  | 'tone'            // Author's tone or attitude
  | 'structure'       // Passage organization
  | 'comparison'      // Compare/contrast elements
  | 'cause-effect'    // Cause and effect relationships
  | 'sequence'        // Chronological order
  | 'generalization'  // Broad conclusions
  | 'evaluation'      // Judge or assess information

export interface Passage {
  id: string;
  title: string;
  content: string;
  questions: Question[];
  subject: 'English' | 'Math' | 'Reading' | 'Science';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  is_active?: boolean;
  created_at?: string;
  // Analytics fields
  passageType?: PassageType;
  wordCount?: number;
  estimatedReadingTime?: number; // in seconds
  topic?: string;
  genre?: string;
}

export type PassageType = 
  | 'prose-fiction'     // Literary narrative
  | 'social-science'    // History, psychology, sociology
  | 'humanities'        // Art, music, philosophy
  | 'natural-science'   // Biology, chemistry, physics
  | 'paired-passages'   // Two related passages
  | 'informational'     // General informational text

export interface TestAttempt {
  id: string;
  userId: string;
  sessionId: string;
  passageId: string;
  answers: Record<string, 'A' | 'B' | 'C' | 'D'>;
  score: number;
  totalQuestions: number;
  timeSpent: number; // in seconds
  completedAt: string;
  // ACT scoring fields
  rawScore?: number;
  scaledScore?: number;
  percentile?: number;
  // Analytics fields
  questionTimes?: Record<string, number>; // questionId -> time in seconds
  questionTypes?: Record<string, QuestionType>; // questionId -> questionType
  passageType?: PassageType;
  readingTime?: number; // time spent reading passage
  answeringTime?: number; // time spent answering questions
  tutorModeUsage?: Record<string, boolean>; // questionId -> whether tutor mode was used
}

export interface QuestionAttempt {
  questionId: string;
  questionNumber: number;
  questionType: QuestionType;
  userAnswer: 'A' | 'B' | 'C' | 'D' | null;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  isCorrect: boolean;
  timeSpent: number; // in seconds
  difficulty: 'Easy' | 'Medium' | 'Hard';
  passageType: PassageType;
  tutorModeUsed?: boolean; // whether student used tutor mode for this question
}

export interface TestSession {
  id: string;
  userId: string;
  subject: 'English' | 'Math' | 'Reading' | 'Science';
  currentPassageIndex: number;
  startTime: string;
  endTime?: string;
  completed: boolean;
}

export interface TestState {
  currentUser: User | null;
  currentSession: TestSession | null;
  passages: Passage[];
  sessionTime: number; // in seconds
}

export interface AdminState {
  isAdmin: boolean;
  uploadedPassages: Passage[];
}

// Analytics Interfaces
export interface PerformanceAnalytics {
  overall: OverallPerformance;
  questionTypes: QuestionTypePerformance[];
  passageTypes: PassageTypePerformance[];
  difficultyLevels: DifficultyPerformance[];
  timeAnalysis: TimeAnalysis;
  progress: ProgressTracking;
  weaknesses: WeaknessAnalysis;
}

export interface OverallPerformance {
  totalAttempts: number;
  averageScore: number;
  averageTime: number;
  improvement: number; // percentage change over time
  currentStreak: number;
  bestStreak: number;
}

export interface QuestionTypePerformance {
  questionType: QuestionType;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  averageTime: number;
  trend: 'improving' | 'declining' | 'stable';
}

export interface PassageTypePerformance {
  passageType: PassageType;
  totalPassages: number;
  averageScore: number;
  averageTime: number;
  accuracy: number;
  trend: 'improving' | 'declining' | 'stable';
}

export interface DifficultyPerformance {
  difficulty: 'Easy' | 'Medium' | 'Hard';
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  averageTime: number;
  trend: 'improving' | 'declining' | 'stable';
}

export interface TimeAnalysis {
  averageTimePerQuestion: number;
  averageReadingTime: number;
  averageAnsweringTime: number;
  timeDistribution: {
    fast: number;    // < 30 seconds
    medium: number;  // 30-60 seconds
    slow: number;    // > 60 seconds
  };
  timeByQuestionType: Record<QuestionType, number>;
  timeByPassageType: Record<PassageType, number>;
}

export interface ProgressTracking {
  dailyProgress: DailyProgress[];
  weeklyProgress: WeeklyProgress[];
  monthlyProgress: MonthlyProgress[];
  scoreTrend: number[]; // scores over time
  timeTrend: number[];  // times over time
}

export interface DailyProgress {
  date: string;
  attempts: number;
  averageScore: number;
  totalTime: number;
}

export interface WeeklyProgress {
  week: string;
  attempts: number;
  averageScore: number;
  improvement: number;
}

export interface MonthlyProgress {
  month: string;
  attempts: number;
  averageScore: number;
  improvement: number;
}

export interface WeaknessAnalysis {
  topWeaknesses: Weakness[];
  recommendations: string[];
  focusAreas: string[];
}

export interface Weakness {
  category: 'questionType' | 'passageType' | 'timeManagement' | 'difficulty';
  name: string;
  severity: 'low' | 'medium' | 'high';
  accuracy: number;
  averageTime: number;
  improvement: number;
  description: string;
}