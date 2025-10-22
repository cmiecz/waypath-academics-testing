import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTestStore } from '../hooks/useTestStore';
import { testStore } from '../store/testStore';
import { saveTestResult } from '../api/supabase';
import { parsePassageWithHighlighting, extractAnchorReference } from '../utils/passageUtils';
import './TestPage.css';

export default function TestPage() {
  const {
    getCurrentPassage,
    currentSession,
    submitAnswers,
    passages,
    sessionTime,
    incrementTime,
    pauseTimer
  } = useTestStore();

  const [answers, setAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [passageStartTime] = useState(Date.now());
  const [timerVisible, setTimerVisible] = useState(true);
  const highlightedAnchorRef = useRef<HTMLSpanElement>(null);
  
  // Analytics tracking
  const [questionStartTimes, setQuestionStartTimes] = useState<Record<string, number>>({});
  const [readingStartTime] = useState(Date.now());
  const [questionTimes, setQuestionTimes] = useState<Record<string, number>>({});
  
  const navigate = useNavigate();
  const location = useLocation();
  const currentPassage = getCurrentPassage();
  
  // Get test mode and difficulty filter from location state
  const testMode = location.state?.testMode || 'practice';
  const difficultyFilter = currentSession?.difficultyFilter || 'all';
  
  // Filter questions by difficulty
  const filteredQuestions = currentPassage?.questions.filter(q => {
    if (difficultyFilter === 'all' || !q.difficulty) return true;
    return q.difficulty === difficultyFilter;
  }) || [];

  // Timer
  useEffect(() => {
    if (currentPassage && filteredQuestions.length > 0) {
      console.log('TestPage mounted - Timer running for passage:', currentPassage.title);
      console.log('Current session time:', sessionTime, 'seconds');
      console.log('Timer running state:', testStore.getState().timerRunning);
      console.log('Difficulty filter:', difficultyFilter, '- Showing', filteredQuestions.length, 'questions');
      
      // Start timing for the first question
      const firstQuestion = filteredQuestions[0];
      if (firstQuestion) {
        setQuestionStartTimes(prev => ({
          ...prev,
          [firstQuestion.id]: Date.now()
        }));
      }
    }
    
    const timer = setInterval(() => {
      console.log('Timer tick - sessionTime:', sessionTime, 'timerRunning:', testStore.getState().timerRunning);
      testStore.incrementTime();
    }, 1000);
    return () => {
      console.log('TestPage unmounting - Timer stopped');
      clearInterval(timer);
    };
  }, [currentPassage]);

  // Auto-scroll to highlighted anchor when question changes
  useEffect(() => {
    if (highlightedAnchorRef.current && filteredQuestions.length > 0) {
      const currentQuestion = filteredQuestions[currentQuestionIndex];
      const currentAnchorReference = extractAnchorReference(currentQuestion?.text);
      
      if (currentAnchorReference) {
        // Small delay to ensure the DOM has updated with the highlighting
        setTimeout(() => {
          highlightedAnchorRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });
        }, 100);
      }
    }
  }, [currentQuestionIndex, filteredQuestions]);

  if (!currentPassage || !currentSession) {
    return (
      <div className="test-page">
        <div className="error-container">
          <h2>No Test Session Active</h2>
          <p>Please return to test selection to begin.</p>
          <button onClick={() => navigate('/test-selection')} className="btn-primary">
            Go to Test Selection
          </button>
        </div>
      </div>
    );
  }

  if (filteredQuestions.length === 0) {
    return (
      <div className="test-page">
        <div className="error-container">
          <h2>No Questions Available</h2>
          <p>No questions match the selected difficulty level for this passage.</p>
          <button onClick={() => navigate('/test-selection')} className="btn-primary">
            Back to Test Selection
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = filteredQuestions[currentQuestionIndex];
  
  // Extract anchor reference for highlighting
  const currentAnchorReference = extractAnchorReference(currentQuestion?.text);
  
  // Debug logging
  console.log('Current question text:', currentQuestion?.text);
  console.log('Extracted anchor reference:', currentAnchorReference);
  
  if (!currentQuestion) {
    return (
      <div className="test-page">
        <div className="error-container">
          <h2>Question Not Found</h2>
          <p>Question index: {currentQuestionIndex}</p>
          <p>Total questions: {filteredQuestions.length}</p>
        </div>
      </div>
    );
  }

  const isComplete = filteredQuestions.every(q => answers[q.id]);
  const isLastQuestion = currentQuestionIndex === filteredQuestions.length - 1;
  const currentPassageNumber = (currentSession.currentPassageIndex || 0) + 1;
  const totalPassages = passages.length;

  const handleAnswerSelect = (questionId: string, answer: 'A' | 'B' | 'C' | 'D') => {
    console.log('Answer selected:', { questionId, answer });
    
    // Track time spent on this question
    const questionStartTime = questionStartTimes[questionId];
    if (questionStartTime) {
      const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
      setQuestionTimes(prev => ({
        ...prev,
        [questionId]: timeSpent
      }));
    }
    
    setAnswers(prev => {
      const newAnswers = {
        ...prev,
        [questionId]: answer
      };
      console.log('Updated answers:', newAnswers);
      return newAnswers;
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      // Track time for current question before moving
      const currentQuestion = filteredQuestions[currentQuestionIndex];
      if (currentQuestion) {
        const questionStartTime = questionStartTimes[currentQuestion.id];
        if (questionStartTime) {
          const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
          setQuestionTimes(prev => ({
            ...prev,
            [currentQuestion.id]: timeSpent
          }));
        }
      }
      
      setCurrentQuestionIndex(prev => prev + 1);
      
      // Start timing for next question
      const nextQuestion = filteredQuestions[currentQuestionIndex + 1];
      if (nextQuestion) {
        setQuestionStartTimes(prev => ({
          ...prev,
          [nextQuestion.id]: Date.now()
        }));
      }
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      // Track time for current question before moving
      const currentQuestion = filteredQuestions[currentQuestionIndex];
      if (currentQuestion) {
        const questionStartTime = questionStartTimes[currentQuestion.id];
        if (questionStartTime) {
          const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
          setQuestionTimes(prev => ({
            ...prev,
            [currentQuestion.id]: timeSpent
          }));
        }
      }
      
      setCurrentQuestionIndex(prev => prev - 1);
      
      // Start timing for previous question
      const prevQuestion = filteredQuestions[currentQuestionIndex - 1];
      if (prevQuestion) {
        setQuestionStartTimes(prev => ({
          ...prev,
          [prevQuestion.id]: Date.now()
        }));
      }
    }
  };

  const handleSubmitPassage = async () => {
    console.log('=== SUBMITTING PASSAGE ===');
    console.log('Answers being submitted:', answers);
    console.log('Current passage ID:', currentPassage.id);
    console.log('Filtered questions:', filteredQuestions.map(q => ({ id: q.id, number: q.questionNumber })));
    
    if (!isComplete) {
      alert('Please answer all questions before submitting.');
      return;
    }

    try {
      // Pause timer when submitting
      pauseTimer();
      
      // Calculate time spent in seconds
      const timeSpent = Math.floor((Date.now() - passageStartTime) / 1000);
      const readingTime = Math.floor((Date.now() - readingStartTime) / 1000);
      const answeringTime = timeSpent - readingTime;
      
      console.log('Passage start time:', new Date(passageStartTime).toLocaleTimeString());
      console.log('Current time:', new Date().toLocaleTimeString());
      console.log('Time spent (seconds):', timeSpent);
      console.log('Reading time:', readingTime);
      console.log('Answering time:', answeringTime);
      console.log('Question times:', questionTimes);
      
      // Create enhanced attempt with analytics data
      const attempt = submitAnswers(currentPassage.id, answers, timeSpent);
      
      // Add analytics data to the attempt
      if (attempt) {
        attempt.questionTimes = questionTimes;
        attempt.questionTypes = filteredQuestions.reduce((acc, q) => {
          acc[q.id] = (q.questionType || 'detail') as any;
          return acc;
        }, {} as Record<string, any>);
        attempt.passageType = currentPassage.passageType || 'informational';
        attempt.readingTime = readingTime;
        attempt.answeringTime = answeringTime;
      }
      console.log('Attempt created:', attempt);

      // Save test result to Supabase
      if (attempt && currentSession) {
        await saveTestResult(attempt);
      }

      // Check if this is the last passage
      const currentPassageIndex = currentSession?.currentPassageIndex || 0;
      const isLastPassage = currentPassageIndex >= passages.length - 1;
      
      if (testMode === 'practice') {
        // Practice mode: go to results after each passage
        navigate('/results');
      } else if (testMode === 'test') {
        // Test mode: continue to next passage or go to final results
        if (isLastPassage) {
          navigate('/final-results');
        } else {
          // Reset for next passage
          setAnswers({});
          setCurrentQuestionIndex(0);
          // Timer continues running
        }
      }
    } catch (error) {
      console.error('Error submitting passage:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="test-page">
      {/* Header */}
      <div className="test-header">
        <div className="header-left">
          <button onClick={() => navigate('/test-selection')} className="back-button">
            ← Back
          </button>
          <div className="header-info">
            <h2>{currentSession.subject} Test</h2>
            <p>Passage {currentPassageNumber} of {totalPassages}</p>
          </div>
        </div>
        <div className="timer-container">
          {timerVisible && (
            <div className="timer">⏱ {formatTime(sessionTime)}</div>
          )}
          <button 
            className="timer-toggle"
            onClick={() => setTimerVisible(!timerVisible)}
            title={timerVisible ? "Hide timer" : "Show timer"}
          >
            <i className={`fas ${timerVisible ? 'fa-eye-slash' : 'fa-eye'}`}></i>
          </button>
        </div>
      </div>

      {/* Question Navigation */}
      <div className="question-nav">
        <p>Question {currentQuestionIndex + 1} of {filteredQuestions.length}</p>
        {difficultyFilter !== 'all' && (
          <span className="difficulty-filter-badge">
            Showing: {difficultyFilter} Questions
          </span>
        )}
        <div className="progress-dots">
          {filteredQuestions.map((_, index) => (
            <div
              key={index}
              className={`dot ${
                index === currentQuestionIndex
                  ? 'current'
                  : answers[filteredQuestions[index].id]
                  ? 'answered'
                  : 'unanswered'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="test-content">
        {/* Passage - Left Side (50%) */}
        <div className="passage-side">
          <h1 className="passage-title">{currentPassage.title}</h1>
          <div className="passage-content">
            {parsePassageWithHighlighting(currentPassage.content, currentAnchorReference, highlightedAnchorRef)}
          </div>
        </div>

        {/* Question - Right Side (50%) */}
        <div className="question-side">
          <h3 className="question-text">
            {currentQuestion.questionNumber}. {currentQuestion.text}
          </h3>

          <div className="options">
            {Object.entries(currentQuestion.options).map(([letter, option]) => (
              <button
                key={letter}
                onClick={() => handleAnswerSelect(currentQuestion.id, letter as 'A' | 'B' | 'C' | 'D')}
                className={`option ${answers[currentQuestion.id] === letter ? 'selected' : ''}`}
              >
                <div className="option-letter">{letter}</div>
                <div className="option-text">{option}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="test-footer">
        <button
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
          className="btn-secondary"
        >
          Previous
        </button>

        {isLastQuestion ? (
          <button
            onClick={handleSubmitPassage}
            disabled={!isComplete}
            className="btn-primary"
          >
            Submit Passage
          </button>
        ) : (
          <button
            onClick={handleNextQuestion}
            className="btn-primary"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
