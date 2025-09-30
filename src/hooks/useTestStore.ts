import { useState, useEffect } from 'react';
import { testStore } from '../store/testStore';

export function useTestStore() {
  const [state, setState] = useState(testStore.getState());

  useEffect(() => {
    const unsubscribe = testStore.subscribe(() => {
      setState(testStore.getState());
    });
    return () => unsubscribe();
  }, []);

  return {
    ...state,
    setUser: testStore.setUser.bind(testStore),
    setPassages: testStore.setPassages.bind(testStore),
    startTestSession: testStore.startTestSession.bind(testStore),
    getCurrentPassage: testStore.getCurrentPassage.bind(testStore),
    submitAnswers: testStore.submitAnswers.bind(testStore),
    getSessionAttempts: testStore.getSessionAttempts.bind(testStore),
    incrementTime: testStore.incrementTime.bind(testStore),
    pauseTimer: testStore.pauseTimer.bind(testStore),
    resumeTimer: testStore.resumeTimer.bind(testStore),
    getACTScores: testStore.getACTScores.bind(testStore)
  };
}
