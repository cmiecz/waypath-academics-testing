import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTestStore } from '../hooks/useTestStore';
import { saveTestResult } from '../api/supabase';
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
  
  const navigate = useNavigate();
  const location = useLocation();
  const currentPassage = getCurrentPassage();
  
  // Get test mode from location state, default to practice
  const testMode = location.state?.testMode || 'practice';

  // Timer
  useEffect(() => {
    if (currentPassage) {
      console.log('TestPage mounted - Timer running for passage:', currentPassage.title);
      console.log('Current session time:', sessionTime, 'seconds');
    }
    
    const timer = setInterval(() => {
      incrementTime();
    }, 1000);
    return () => {
      console.log('TestPage unmounting - Timer stopped');
      clearInterval(timer);
    };
  }, [incrementTime, currentPassage, sessionTime]);

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

  const currentQuestion = currentPassage.questions[currentQuestionIndex];
  
  if (!currentQuestion) {
    return (
      <div className="test-page">
        <div className="error-container">
          <h2>Question Not Found</h2>
          <p>Question index: {currentQuestionIndex}</p>
          <p>Total questions: {currentPassage.questions.length}</p>
        </div>
      </div>
    );
  }

  const isComplete = currentPassage.questions.every(q => answers[q.id]);
  const isLastQuestion = currentQuestionIndex === currentPassage.questions.length - 1;
  const currentPassageNumber = (currentSession.currentPassageIndex || 0) + 1;
  const totalPassages = passages.length;

  const handleAnswerSelect = (questionId: string, answer: 'A' | 'B' | 'C' | 'D') => {
    console.log('Answer selected:', { questionId, answer });
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
    if (currentQuestionIndex < currentPassage.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitPassage = async () => {
    console.log('=== SUBMITTING PASSAGE ===');
    console.log('Answers being submitted:', answers);
    console.log('Current passage ID:', currentPassage.id);
    console.log('Current passage questions:', currentPassage.questions.map(q => ({ id: q.id, number: q.questionNumber })));
    
    if (!isComplete) {
      alert('Please answer all questions before submitting.');
      return;
    }

    try {
      // Pause timer when submitting
      pauseTimer();
      
      // Calculate time spent in seconds
      const timeSpent = Math.floor((Date.now() - passageStartTime) / 1000);
      console.log('Passage start time:', new Date(passageStartTime).toLocaleTimeString());
      console.log('Current time:', new Date().toLocaleTimeString());
      console.log('Time spent (seconds):', timeSpent);
      
      const attempt = submitAnswers(currentPassage.id, answers, timeSpent);
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
        <p>Question {currentQuestionIndex + 1} of {currentPassage.questions.length}</p>
        <div className="progress-dots">
          {currentPassage.questions.map((_, index) => (
            <div
              key={index}
              className={`dot ${
                index === currentQuestionIndex
                  ? 'current'
                  : answers[currentPassage.questions[index].id]
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
            {currentPassage.content}
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
