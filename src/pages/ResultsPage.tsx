import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTestStore } from '../hooks/useTestStore';
import { getScoreInterpretation } from '../utils/actScoring';
import './ResultsPage.css';

export default function ResultsPage() {
  const { getSessionAttempts, currentSession, passages, resumeTimer, getACTScores } = useTestStore();
  const [showExplanations, setShowExplanations] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const navigate = useNavigate();

  const sessionAttempts = getSessionAttempts();
  const lastAttempt = sessionAttempts[sessionAttempts.length - 1];
  const actScores = getACTScores();
  
  // Find the passage that matches this attempt (not the current passage!)
  const attemptPassage = lastAttempt ? passages.find(p => p.id === lastAttempt.passageId) : null;

  console.log('Results - Last Attempt:', lastAttempt);
  console.log('Results - Attempt Passage ID:', lastAttempt?.passageId);
  console.log('Results - Attempt Passage Questions:', attemptPassage?.questions.map(q => q.id));
  console.log('Results - Answers:', lastAttempt?.answers);

  if (!lastAttempt || !attemptPassage) {
    return (
      <div className="results-page">
        <div className="error-container">
          <h2>No Results Found</h2>
          <button onClick={() => navigate('/test-selection')} className="btn-primary">
            Back to Test Selection
          </button>
        </div>
      </div>
    );
  }

  const percentage = Math.round((lastAttempt.score / lastAttempt.totalQuestions) * 100);
  
  // Calculate overall session stats
  const totalCorrect = sessionAttempts.reduce((sum, a) => sum + a.score, 0);
  const totalQuestions = sessionAttempts.reduce((sum, a) => sum + a.totalQuestions, 0);
  const overallPercentage = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  const isSessionComplete = currentSession?.completed;
  const currentPassageNumber = sessionAttempts.length;

  // Get wrong questions
  const wrongQuestions = attemptPassage.questions.filter(
    q => lastAttempt.answers[q.id] !== q.correctAnswer
  );

  const handleContinue = () => {
    if (isSessionComplete) {
      navigate('/final-results');
    } else {
      // Resume timer for next passage
      console.log('Resuming timer for next passage...');
      resumeTimer();
      navigate('/test');
    }
  };

  const handleRetakeWrongAnswers = () => {
    // TODO: Implement retake wrong answers only
    navigate('/test');
  };

  return (
    <div className="results-page">
      <div className="results-container">
        <div className="results-header">
          <h1>Passage Results</h1>
          <p>Passage {currentPassageNumber} - {attemptPassage.title}</p>
        </div>

        {/* Results Summary Section */}
        <div className="results-summary">
          <div className="score-circle">
            <div className="score-number">
              {actScores ? actScores.compositeScore : percentage}%
            </div>
            <div className="score-label">
              {actScores ? 'ACT Score' : 'Score'}
            </div>
          </div>
          <div className="results-details">
            <div className="combined-stats">
              <div className="stats-row">
                <div className="stat-item">
                  <span className="stat-label">Raw Score</span>
                  <span className="stat-value">{lastAttempt.rawScore || lastAttempt.score} / {lastAttempt.totalQuestions}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Time Spent</span>
                  <span className="stat-value">{Math.floor(lastAttempt.timeSpent / 60)}m {lastAttempt.timeSpent % 60}s</span>
                </div>
                {lastAttempt.scaledScore && (
                  <>
                    <div className="stat-item">
                      <span className="stat-label">ACT Score</span>
                      <span className="stat-value">{lastAttempt.scaledScore}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Percentile</span>
                      <span className="stat-value">{lastAttempt.percentile}%</span>
                    </div>
                  </>
                )}
                {actScores && (
                  <>
                    <div className="stat-item">
                      <span className="stat-label">ACT Composite</span>
                      <span className="stat-value">{actScores.compositeScore}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Total Correct</span>
                      <span className="stat-value">{totalCorrect}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Passages Done</span>
                      <span className="stat-value">{sessionAttempts.length} / {passages.length}</span>
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
                      <span className="stat-label">Total Correct</span>
                      <span className="stat-value">{totalCorrect}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Total Questions</span>
                      <span className="stat-value">{totalQuestions}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Passages Done</span>
                      <span className="stat-value">{sessionAttempts.length} / {passages.length}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>


        {/* Questions Review Section - Separate from results summary */}
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
            {attemptPassage.questions.map((question) => {
              const userAnswer = lastAttempt.answers[question.id];
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

        <div className="results-actions">
          {wrongQuestions.length > 0 && (
            <button 
              onClick={handleRetakeWrongAnswers} 
              className="btn-secondary retake-btn"
            >
              Retake Wrong Answers ({wrongQuestions.length})
            </button>
          )}
          
          {isSessionComplete ? (
            <button onClick={handleContinue} className="btn-primary">
              View Final Results
            </button>
          ) : (
            <button onClick={handleContinue} className="btn-primary">
              Continue to Next Passage
            </button>
          )}
        </div>
      </div>
    </div>
  );
}