import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTestStore } from '../hooks/useTestStore';
import { getScoreInterpretation } from '../utils/actScoring';
import './ResultsPage.css';

export default function FinalResultsPage() {
  const { getSessionAttempts, passages, currentUser, getACTScores } = useTestStore();
  const [showExplanations, setShowExplanations] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [selectedPassage, setSelectedPassage] = useState<number>(0);
  const navigate = useNavigate();

  const sessionAttempts = getSessionAttempts();
  const actScores = getACTScores();

  if (sessionAttempts.length === 0) {
    return (
      <div className="results-page">
        <div className="error-container">
          <h2>No Test Results Found</h2>
          <button onClick={() => navigate('/test-selection')} className="btn-primary">
            Back to Test Selection
          </button>
        </div>
      </div>
    );
  }

  // Calculate overall session stats
  const totalCorrect = sessionAttempts.reduce((sum, a) => sum + a.score, 0);
  const totalQuestions = sessionAttempts.reduce((sum, a) => sum + a.totalQuestions, 0);
  const overallPercentage = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const totalTimeSpent = sessionAttempts.reduce((sum, a) => sum + a.timeSpent, 0);

  // Get passage details for each attempt
  const passageResults = sessionAttempts.map((attempt, index) => {
    const passage = passages.find(p => p.id === attempt.passageId);
    return {
      ...attempt,
      passage,
      passageNumber: index + 1,
      percentage: Math.round((attempt.score / attempt.totalQuestions) * 100)
    };
  });

  const currentPassageResult = passageResults[selectedPassage];

  const handleStartNewTest = () => {
    navigate('/test-selection');
  };

  const handleViewDashboard = () => {
    navigate('/dashboard');
  };

  const handleRetakeWrongAnswers = (passageIndex: number) => {
    // TODO: Implement retake wrong answers for specific passage
    navigate('/test');
  };

  return (
    <div className="results-page">
      <div className="results-container">
        <div className="results-header">
          <h1>Test Complete! <i className="fas fa-trophy"></i></h1>
          <p>Great job, {currentUser?.name}! Here's your overall performance.</p>
        </div>

        {/* Results Summary Section */}
        <div className="results-summary">
          <div className="score-circle">
            <div className="score-number">
              {actScores ? actScores.compositeScore : overallPercentage}%
            </div>
            <div className="score-label">
              {actScores ? 'ACT Score' : 'Overall Score'}
            </div>
          </div>
          <div className="results-details">
            <div className="combined-stats">
              <div className="stats-row">
                <div className="stat-item">
                  <span className="stat-label">Total Correct</span>
                  <span className="stat-value">{totalCorrect} / {totalQuestions}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Total Time</span>
                  <span className="stat-value">{Math.floor(totalTimeSpent / 60)}m {totalTimeSpent % 60}s</span>
                </div>
                {actScores && (
                  <>
                    <div className="stat-item">
                      <span className="stat-label">ACT Composite</span>
                      <span className="stat-value">{actScores.compositeScore}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Passages Completed</span>
                      <span className="stat-value">{sessionAttempts.length}</span>
                    </div>
                  </>
                )}
                {!actScores && (
                  <>
                    <div className="stat-item">
                      <span className="stat-label">Overall Score</span>
                      <span className="stat-value">{overallPercentage}%</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Passages Completed</span>
                      <span className="stat-value">{sessionAttempts.length}</span>
                    </div>
                  </>
                )}
              </div>
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

        {/* Questions Review Section - Direct layout like Passage Results */}
        {currentPassageResult && currentPassageResult.passage && (
          <div className="questions-review">
              <div className="review-header">
                <h2>Question Review</h2>
                <div className="toggle-buttons">
                  <button 
                    onClick={() => setShowAnswers(!showAnswers)}
                    className="toggle-btn"
                  >
                    {showAnswers ? 'Hide' : 'Show'} Correct Answers
                  </button>
                  <button 
                    onClick={() => setShowExplanations(!showExplanations)}
                    className="toggle-btn secondary"
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

                      {showExplanations && showAnswers && (
                        <div className="explanation">
                          <strong>Explanation:</strong> {question.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="results-actions">
          <button onClick={handleStartNewTest} className="btn-primary">
            Start New Test
          </button>
          <button onClick={handleViewDashboard} className="btn-secondary">
            View Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
