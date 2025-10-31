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

interface SavedSessionState {
  currentQuestionIndex: number;
  answers: Record<string, 'A' | 'B' | 'C' | 'D'>;
  sessionTime: number;
  timerRunning: boolean;
  passageStartTime: number;
  readingStartTime: number;
  questionStartTimes: Record<string, number>;
  questionTimes: Record<string, number>;
  tutorModeUsage: Record<string, boolean>;
  sessionId: string;
}

type Listener = () => void;

const SESSION_STORAGE_KEY = 'act_prep_saved_session';

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

  startTestSession(subject: 'English' | 'Math' | 'Reading' | 'Science'): TestSession {
    if (!this.state.currentUser) {
      throw new Error('No user logged in');
    }

    // Check if there's a saved session we can resume (don't require passages to be loaded yet)
    try {
      const saved = localStorage.getItem(SESSION_STORAGE_KEY);
      if (saved) {
        const savedState: SavedSessionState = JSON.parse(saved);
        console.log('Found saved session state, checking if we can resume:', savedState);
        
        // Reuse the saved session ID to maintain continuity
        // This allows restoration when returning to the page
        const existingSession: TestSession = {
          id: savedState.sessionId,
          userId: this.state.currentUser.id,
          subject,
          startTime: new Date().toISOString(),
          currentPassageIndex: 0,
          completed: false
        };

        // Restore timer state from saved state
        this.state = { 
          ...this.state, 
          currentSession: existingSession, 
          sessionTime: savedState.sessionTime,
          timerRunning: savedState.timerRunning 
        };
        this.notifyListeners();
        console.log('✅ Resuming existing session:', savedState.sessionId);
        return existingSession;
      }
    } catch (error) {
      console.error('Error checking for saved session:', error);
      // Continue to create new session
    }

    // Create new session
    if (!this.state.currentUser) {
      throw new Error('No user logged in');
    }

    const session: TestSession = {
      id: `session_${Date.now()}`,
      userId: this.state.currentUser.id,
      subject,
      startTime: new Date().toISOString(),
      currentPassageIndex: 0,
      completed: false
    };

    this.state = { ...this.state, currentSession: session, sessionTime: 2100, timerRunning: true };
    this.saveSessionState();
    this.notifyListeners();
    console.log('🆕 Created new session:', session.id);
    return session;
  }

  // Save session state to localStorage
  saveSessionState(
    questionIndex?: number,
    answers?: Record<string, 'A' | 'B' | 'C' | 'D'>,
    passageStartTime?: number,
    readingStartTime?: number,
    questionStartTimes?: Record<string, number>,
    questionTimes?: Record<string, number>,
    tutorModeUsage?: Record<string, boolean>
  ) {
    if (!this.state.currentSession || this.state.passages.length === 0) return;

    const savedState: SavedSessionState = {
      currentQuestionIndex: questionIndex ?? (this.state.currentSession.currentPassageIndex || 0),
      answers: answers || {},
      sessionTime: this.state.sessionTime,
      timerRunning: this.state.timerRunning,
      passageStartTime: passageStartTime || Date.now(),
      readingStartTime: readingStartTime || Date.now(),
      questionStartTimes: questionStartTimes || {},
      questionTimes: questionTimes || {},
      tutorModeUsage: tutorModeUsage || {},
      sessionId: this.state.currentSession.id
    };

    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(savedState));
    } catch (error) {
      console.error('Failed to save session state:', error);
    }
  }

  // Restore session state from localStorage
  restoreSessionState(): SavedSessionState | null {
    try {
      const saved = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!saved) {
        console.log('No saved session state found in localStorage');
        return null;
      }

      const savedState: SavedSessionState = JSON.parse(saved);
      console.log('Found saved state:', savedState);
      
      // If we have a current session, verify it matches
      if (this.state.currentSession) {
        if (this.state.currentSession.id !== savedState.sessionId) {
          console.log('Session ID mismatch. Saved:', savedState.sessionId, 'Current:', this.state.currentSession.id);
          return null;
        }
      } else {
        // No current session - we can still return the saved state
        // The TestPage will use it when the session is created
        console.log('No current session, but returning saved state for restoration');
      }

      // Restore timer state if session matches
      if (this.state.currentSession && this.state.currentSession.id === savedState.sessionId) {
        this.state.sessionTime = savedState.sessionTime;
        this.state.timerRunning = savedState.timerRunning;
      }

      return savedState;
    } catch (error) {
      console.error('Failed to restore session state:', error);
      return null;
    }
  }

  // Clear saved session state
  clearSavedSession() {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear saved session:', error);
    }
  }

  pauseTimer() {
    console.log('⏸️ Timer PAUSED - Time remaining:', this.state.sessionTime, 'seconds');
    this.state = { ...this.state, timerRunning: false };
    this.saveSessionState();
    this.notifyListeners();
  }

  resumeTimer() {
    console.log('▶️ Timer RESUMED - Time remaining:', this.state.sessionTime, 'seconds');
    this.state = { ...this.state, timerRunning: true };
    this.saveSessionState();
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
