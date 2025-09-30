import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTestStore } from '../hooks/useTestStore';
import { getUserAttempts } from '../api/supabase';
import { TestAttempt } from '../types/act';
import './SessionResultsPage.css';

export default function SessionResultsPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { currentUser, passages } = useTestStore();
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExplanations, setShowExplanations] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [selectedPassage, setSelectedPassage] = useState<number>(0);
  const navigate = useNavigate();

  const loadSessionAttempts = useCallback(async () => {
    if (!currentUser || !sessionId) {
      navigate('/dashboard');
      return;
    }

    setLoading(true);
    try {
      const result = await getUserAttempts(currentUser.id);
      if (result.data) {
        // Convert snake_case to camelCase and filter by session
        const formattedAttempts = result.data
          .map((a: any) => ({
            id: a.id,
            userId: a.user_id,
            sessionId: a.session_id,
            passageId: a.passage_id,
            answers: a.answers,
            score: a.score,
            totalQuestions: a.total_questions,
            timeSpent: a.time_spent,
            completedAt: a.completed_at
          }))
          .filter((attempt: TestAttempt) => attempt.sessionId === sessionId);
        
        setAttempts(formattedAttempts);
      }
    } catch (error) {
      console.error('Error loading session attempts:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser, sessionId, navigate]);

  useEffect(() => {
    loadSessionAttempts();
  }, [sessionId, currentUser, loadSessionAttempts]);

  if (loading) {
    return (
      <div className="session-results-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading session results...</p>
        </div>
      </div>
    );
  }

  if (attempts.length === 0) {
    return (
      <div className="session-results-page">
        <div className="error-container">
          <h2>No Results Found</h2>
          <p>No test results found for this session.</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Calculate overall session stats
  const totalCorrect = attempts.reduce((sum, a) => sum + a.score, 0);
  const totalQuestions = attempts.reduce((sum, a) => sum + a.totalQuestions, 0);
  const overallPercentage = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const totalTimeSpent = attempts.reduce((sum, a) => sum + a.timeSpent, 0);

  // Get passage details for each attempt
  const passageResults = attempts.map((attempt, index) => {
    const passage = passages.find(p => p.id === attempt.passageId);
    return {
      ...attempt,
      passage,
      passageNumber: index + 1,
      percentage: Math.round((attempt.score / attempt.totalQuestions) * 100)
    };
  });

  const currentPassageResult = passageResults[selectedPassage];

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="session-results-page">
      <div className="session-results-container">
        {/* Header */}
        <div className="session-results-header">
          <h1>Session Results</h1>
          <p>Detailed results for your test session</p>
        </div>

        {/* Overall Score Summary */}
        <div className="overall-summary">
          <div className="overall-score-circle">
            <div className="overall-score-number">{overallPercentage}%</div>
            <div className="overall-score-label">Overall Score</div>
          </div>
          <div className="overall-stats">
            <div className="stat-item">
              <span className="stat-label">Correct Answers</span>
              <span className="stat-value">{totalCorrect}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Questions</span>
              <span className="stat-value">{totalQuestions}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Time</span>
              <span className="stat-value">{Math.floor(totalTimeSpent / 60)}m {totalTimeSpent % 60}s</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Passages</span>
              <span className="stat-value">{attempts.length}</span>
            </div>
          </div>
        </div>

        {/* Overall Progress Section */}
        <div className="overall-progress">
          <h2>Overall Progress</h2>
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-value">{overallPercentage}%</div>
              <div className="stat-label">OVERALL SCORE</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{totalCorrect}</div>
              <div className="stat-label">TOTAL CORRECT</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{totalQuestions}</div>
              <div className="stat-label">TOTAL QUESTIONS</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{attempts.length}/{passageResults.length}</div>
              <div className="stat-label">PASSAGES DONE</div>
            </div>
          </div>
        </div>

        {/* Passage Selection Tabs */}
        <div className="passage-tabs">
          {passageResults.map((result, index) => (
            <button
              key={index}
              className={`passage-tab ${selectedPassage === index ? 'active' : ''}`}
              onClick={() => setSelectedPassage(index)}
            >
              <div className="tab-title">Passage {result.passageNumber}</div>
              <div className="tab-score">{result.percentage}%</div>
              <div className="tab-subtitle">{result.passage?.title}</div>
            </button>
          ))}
        </div>

        {/* Selected Passage Details */}
        {currentPassageResult && currentPassageResult.passage && (
          <div className="passage-details">
            <div className="passage-header">
              <h2>{currentPassageResult.passage.title}</h2>
              <div className="passage-score">
                <span className="score-percentage">{currentPassageResult.percentage}%</span>
                <span className="score-details">
                  {currentPassageResult.score} / {currentPassageResult.totalQuestions} correct
                </span>
              </div>
            </div>

            {/* Question Review */}
            <div className="question-review-section">
              <div className="review-controls">
                <h3>Question Review</h3>
                <div className="toggle-buttons">
                  <button
                    onClick={() => setShowAnswers(!showAnswers)}
                    className={`toggle-btn ${showAnswers ? 'active' : ''}`}
                  >
                    {showAnswers ? 'Hide' : 'Show'} Correct Answers
                  </button>
                  <button
                    onClick={() => setShowExplanations(!showExplanations)}
                    className={`toggle-btn ${showExplanations ? 'active' : ''}`}
                  >
                    {showExplanations ? 'Hide' : 'Show'} Explanations
                  </button>
                </div>
              </div>

              <div className="questions-list">
                {currentPassageResult.passage.questions.map((question) => {
                  const userAnswer = currentPassageResult.answers[question.id];
                  const isCorrect = userAnswer === question.correctAnswer;
                  const isAnswered = userAnswer !== undefined;

                  return (
                    <div key={question.id} className={`question-item ${
                      !isAnswered ? 'unanswered' : isCorrect ? 'correct' : 'incorrect'
                    }`}>
                      <div className="question-header-row">
                        <div className="question-number">Q{question.questionNumber}</div>
                        <div className={`status-badge ${
                          !isAnswered ? 'unanswered' : isCorrect ? 'correct' : 'incorrect'
                        }`}>
                          {!isAnswered ? <><i className="far fa-circle"></i> Unanswered</> : isCorrect ? <><i className="fas fa-check"></i> Correct</> : <><i className="fas fa-times"></i> Incorrect</>}
                        </div>
                      </div>

                      <p className="question-text">{question.text}</p>

                      <div className="answers-grid">
                        {Object.entries(question.options).map(([letter, option]) => {
                          const isUserAnswer = userAnswer === letter;
                          const isCorrectAnswer = letter === question.correctAnswer;
                          const shouldShowCorrect = showAnswers || isCorrect;

                          return (
                            <div 
                              key={letter}
                              className={`answer-option ${
                                isUserAnswer && !isCorrect ? 'wrong' : ''
                              } ${shouldShowCorrect && isCorrectAnswer ? 'correct-answer' : ''}`}
                            >
                              <div className="answer-option-content">
                                <span className="answer-letter">{letter}</span>
                                <span className="answer-text">{option}</span>
                                {isUserAnswer && !isCorrect && <span className="badge wrong-badge">Your Answer</span>}
                                {shouldShowCorrect && isCorrectAnswer && <span className="badge correct-badge">Correct</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {showExplanations && (showAnswers || isCorrect) && (
                        <div className="explanation">
                          <strong>Explanation:</strong> {question.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="session-actions">
          <button onClick={handleBackToDashboard} className="btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
