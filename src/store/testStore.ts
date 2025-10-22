import { User, TestSession, Passage, TestAttempt } from '../types/act';
import { calculateACTScoresFromAttempts, ACTScoreResult, convertRawToScaled, getPercentile } from '../utils/actScoring';

interface TestState {
  currentUser: User | null;
  currentSession: TestSession | null;
  passages: Passage[];
  attempts: TestAttempt[];
  sessionTime: number;
  timerRunning: boolean;
  actScores: ACTScoreResult | null;
}

type Listener = () => void;

class Store {
  private state: TestState = {
    currentUser: null,
    currentSession: null,
    passages: [],
    attempts: [],
    sessionTime: 2100, // 35 minutes in seconds
    timerRunning: false,
    actScores: null
  };

  private listeners: Set<Listener> = new Set();

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getState() {
    return this.state;
  }

  setUser(user: User | null) {
    this.state = { ...this.state, currentUser: user };
    this.notifyListeners();
  }

  setPassages(passages: Passage[]) {
    this.state = { ...this.state, passages };
    this.notifyListeners();
  }

  startTestSession(subject: 'English' | 'Math' | 'Reading' | 'Science', difficultyFilter?: 'all' | 'Easy' | 'Medium' | 'Hard'): TestSession {
    if (!this.state.currentUser) {
      throw new Error('No user logged in');
    }

    const session: TestSession = {
      id: `session_${Date.now()}`,
      userId: this.state.currentUser.id,
      subject,
      startTime: new Date().toISOString(),
      currentPassageIndex: 0,
      completed: false,
      difficultyFilter: difficultyFilter || 'all'
    };

    this.state = { ...this.state, currentSession: session, sessionTime: 2100, timerRunning: true };
    this.notifyListeners();
    return session;
  }

  pauseTimer() {
    console.log('⏸️ Timer PAUSED - Time remaining:', this.state.sessionTime, 'seconds');
    this.state = { ...this.state, timerRunning: false };
    this.notifyListeners();
  }

  resumeTimer() {
    console.log('▶️ Timer RESUMED - Time remaining:', this.state.sessionTime, 'seconds');
    this.state = { ...this.state, timerRunning: true };
    this.notifyListeners();
  }

  getCurrentPassage(): Passage | null {
    if (!this.state.currentSession) return null;
    return this.state.passages[this.state.currentSession.currentPassageIndex || 0] || null;
  }

  submitAnswers(passageId: string, answers: Record<string, 'A' | 'B' | 'C' | 'D'>, timeSpent: number): TestAttempt {
    if (!this.state.currentUser || !this.state.currentSession) {
      throw new Error('No active session');
    }

    const passage = this.state.passages.find(p => p.id === passageId);
    if (!passage) {
      throw new Error('Passage not found');
    }

    const correctAnswers = passage.questions.filter(
      q => answers[q.id] === q.correctAnswer
    ).length;

    // Calculate ACT scores for this individual attempt
    const rawScore = correctAnswers;
    const scaledScore = convertRawToScaled(rawScore, passage.subject.toLowerCase() as 'english' | 'math' | 'reading' | 'science');
    const percentile = getPercentile(scaledScore);

    const attempt: TestAttempt = {
      id: `attempt_${Date.now()}`,
      userId: this.state.currentUser.id,
      sessionId: this.state.currentSession.id,
      passageId,
      answers,
      score: correctAnswers,
      totalQuestions: passage.questions.length,
      timeSpent,
      completedAt: new Date().toISOString(),
      // ACT scoring fields
      rawScore,
      scaledScore,
      percentile
    };

    this.state = {
      ...this.state,
      attempts: [...this.state.attempts, attempt]
    };

    // Calculate ACT scores
    this.calculateACTScores();

    // Move to next passage
    if (!this.state.currentSession) return attempt;
    
    const currentIndex = this.state.currentSession.currentPassageIndex || 0;
    if (currentIndex < this.state.passages.length - 1) {
      const updatedSession: TestSession = {
        ...this.state.currentSession,
        currentPassageIndex: currentIndex + 1
      };
      this.state.currentSession = updatedSession;
    } else {
      // Complete session
      const completedSession: TestSession = {
        ...this.state.currentSession,
        completed: true,
        endTime: new Date().toISOString()
      };
      this.state.currentSession = completedSession;
    }

    this.notifyListeners();
    return attempt;
  }

  getSessionAttempts(): TestAttempt[] {
    if (!this.state.currentSession) return [];
    return this.state.attempts.filter(a => a.sessionId === this.state.currentSession!.id);
  }

  incrementTime() {
    if (this.state.timerRunning && this.state.sessionTime > 0) {
      this.state = { ...this.state, sessionTime: this.state.sessionTime - 1 };
      this.notifyListeners();
    }
  }

  calculateACTScores() {
    if (!this.state.currentSession) return;
    
    const sessionAttempts = this.getSessionAttempts();
    if (sessionAttempts.length === 0) return;

    const actScores = calculateACTScoresFromAttempts(sessionAttempts, this.state.passages);
    this.state = { ...this.state, actScores };
  }

  getACTScores(): ACTScoreResult | null {
    return this.state.actScores;
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }
}

export const testStore = new Store();
