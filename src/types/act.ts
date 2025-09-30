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
  text: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

export interface Passage {
  id: string;
  title: string;
  content: string;
  questions: Question[];
  subject: 'English' | 'Math' | 'Reading' | 'Science';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  is_active?: boolean;
  created_at?: string;
}

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