import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTestStore } from '../hooks/useTestStore';
import { getUserAttempts } from '../api/supabase';
import { signOut } from '../api/auth';
import { TestAttempt } from '../types/act';
import './DashboardPage.css';

export default function DashboardPage() {
  const { currentUser } = useTestStore();
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadUserAttempts = useCallback(async () => {
    if (!currentUser) {
      navigate('/');
      return;
    }

    setLoading(true);
    try {
      const result = await getUserAttempts(currentUser.id);
      if (result.data) {
        // Convert snake_case to camelCase
        const formattedAttempts = result.data.map((a: any) => ({
          id: a.id,
          userId: a.user_id,
          sessionId: a.session_id,
          passageId: a.passage_id,
          answers: a.answers,
          score: a.score,
          totalQuestions: a.total_questions,
          timeSpent: a.time_spent,
          completedAt: a.completed_at
        }));
        setAttempts(formattedAttempts);
      }
    } catch (error) {
      console.error('Error loading attempts:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    loadUserAttempts();
  }, [currentUser, loadUserAttempts]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleStartTest = () => {
    navigate('/test-selection');
  };

  const handleViewSessionResults = (sessionId: string) => {
    // Navigate to a session results page with the session ID
    navigate(`/session-results/${sessionId}`);
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Calculate KPIs
  const totalAttempts = attempts.length;
  const totalQuestions = attempts.reduce((sum, a) => sum + a.totalQuestions, 0);
  const totalCorrect = attempts.reduce((sum, a) => sum + a.score, 0);
  const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const totalTimeSpent = attempts.reduce((sum, a) => sum + a.timeSpent, 0);
  const avgTimePerQuestion = totalQuestions > 0 ? Math.round(totalTimeSpent / totalQuestions) : 0;

  // Group attempts by session
  const sessionGroups = attempts.reduce((groups: Record<string, TestAttempt[]>, attempt) => {
    if (!groups[attempt.sessionId]) {
      groups[attempt.sessionId] = [];
    }
    groups[attempt.sessionId].push(attempt);
    return groups;
  }, {});

  const sessions = Object.entries(sessionGroups).map(([sessionId, sessionAttempts]) => {
    const totalScore = sessionAttempts.reduce((sum, a) => sum + a.score, 0);
    const totalQs = sessionAttempts.reduce((sum, a) => sum + a.totalQuestions, 0);
    const percentage = totalQs > 0 ? Math.round((totalScore / totalQs) * 100) : 0;
    const totalTime = sessionAttempts.reduce((sum, a) => sum + a.timeSpent, 0);
    const latestAttempt = sessionAttempts[sessionAttempts.length - 1];
    
    return {
      sessionId,
      attempts: sessionAttempts,
      totalScore,
      totalQuestions: totalQs,
      percentage,
      totalTime,
      completedAt: latestAttempt.completedAt,
      passagesCompleted: sessionAttempts.length
    };
  }).sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

  // Calculate trend data (last 5 sessions)
  const recentSessions = sessions.slice(0, 5).reverse();
  const trendData = recentSessions.map(s => s.percentage);

  // Calculate accuracy by question type (mock data for now - would need question types in real data)
  // const accuracyByType = [
  //   { type: 'Grammar', correct: 0, total: 0 },
  //   { type: 'Punctuation', correct: 0, total: 0 },
  //   { type: 'Style', correct: 0, total: 0 },
  //   { type: 'Organization', correct: 0, total: 0 }
  // ];

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <div className="logo-waypath">
            <div className="logo-icon">W</div>
            <div className="logo-text">
              <div className="logo-primary">WAYPATH</div>
              <div className="logo-secondary">Academics</div>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button onClick={handleStartTest} className="btn-waypath">
            Start New Test
          </button>
          <button onClick={() => navigate('/analytics')} className="btn-waypath" style={{background: 'transparent', color: 'var(--waypath-secondary)', border: '2px solid var(--waypath-primary)'}}>
            View Analytics
          </button>
          <button onClick={handleSignOut} className="btn-waypath" style={{background: 'transparent', color: 'var(--waypath-secondary)', border: '2px solid var(--waypath-primary)'}}>
            Sign Out
          </button>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="welcome-section">
        <h1>Welcome back, {currentUser?.name}! <i className="fas fa-hand-wave"></i></h1>
        <p className="subtitle">Track your progress and continue improving</p>
      </div>

      {totalAttempts === 0 ? (
        // Empty State
        <div className="empty-state">
          <div className="empty-icon"><i className="fas fa-books"></i></div>
          <h2>No Tests Yet</h2>
          <p>Start your first ACT practice test to see your progress here!</p>
          <button onClick={handleStartTest} className="btn-primary large">
            Take Your First Test
          </button>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="kpi-section">
            <div className="kpi-card">
              <div className="kpi-icon"><i className="fas fa-chart-bar"></i></div>
              <div className="kpi-content">
                <div className="kpi-value">{overallAccuracy}%</div>
                <div className="kpi-label">Overall Accuracy</div>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon"><i className="fas fa-check-circle"></i></div>
              <div className="kpi-content">
                <div className="kpi-value">{totalCorrect}/{totalQuestions}</div>
                <div className="kpi-label">Questions Correct</div>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon"><i className="fas fa-file-alt"></i></div>
              <div className="kpi-content">
                <div className="kpi-value">{totalAttempts}</div>
                <div className="kpi-label">Passages Completed</div>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon"><i className="fas fa-stopwatch"></i></div>
              <div className="kpi-content">
                <div className="kpi-value">{avgTimePerQuestion}s</div>
                <div className="kpi-label">Avg Time/Question</div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="charts-section">
            {/* Performance Trend */}
            <div className="chart-card">
              <h3>Performance Trend</h3>
              <p className="chart-subtitle">Last 5 test sessions</p>
              <div className="line-chart">
                {recentSessions.length > 0 ? (
                  <>
                    <div className="chart-grid">
                      <div className="y-axis">
                        <span>100%</span>
                        <span>75%</span>
                        <span>50%</span>
                        <span>25%</span>
                        <span>0%</span>
                      </div>
                      <div className="chart-area">
                        {/* Grid lines */}
                        <div className="grid-lines">
                          <div className="grid-line"></div>
                          <div className="grid-line"></div>
                          <div className="grid-line"></div>
                          <div className="grid-line"></div>
                        </div>
                        {/* Line chart */}
                        <svg className="chart-svg" viewBox="0 0 400 200" preserveAspectRatio="none">
                          <polyline
                            fill="none"
                            stroke="#007aff"
                            strokeWidth="3"
                            points={trendData.map((val, idx) => 
                              `${(idx / (trendData.length - 1)) * 400},${200 - (val / 100) * 200}`
                            ).join(' ')}
                          />
                          {trendData.map((val, idx) => (
                            <circle
                              key={idx}
                              cx={(idx / (trendData.length - 1)) * 400}
                              cy={200 - (val / 100) * 200}
                              r="5"
                              fill="#007aff"
                            />
                          ))}
                        </svg>
                      </div>
                    </div>
                    <div className="x-axis">
                      {recentSessions.map((s, idx) => (
                        <span key={idx}>Test {idx + 1}</span>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="chart-empty">Complete more tests to see trends</div>
                )}
              </div>
            </div>

            {/* Accuracy Breakdown */}
            <div className="chart-card">
              <h3>Accuracy by Category</h3>
              <p className="chart-subtitle">Overall performance breakdown</p>
              <div className="bar-chart">
                <div className="bar-item">
                  <div className="bar-info">
                    <span className="bar-label">All Questions</span>
                    <span className="bar-value">{overallAccuracy}%</span>
                  </div>
                  <div className="bar-track">
                    <div 
                      className="bar-fill" 
                      style={{ width: `${overallAccuracy}%` }}
                    ></div>
                  </div>
                </div>
                <div className="bar-info-text">
                  Complete more passages to see detailed category breakdowns
                </div>
              </div>
            </div>
          </div>

          {/* Test History */}
          <div className="history-section">
            <h2>Test History</h2>
            <div className="history-list">
              {sessions.map((session, idx) => (
                <div 
                  key={session.sessionId} 
                  className="history-item clickable"
                  onClick={() => handleViewSessionResults(session.sessionId)}
                >
                  <div className="history-rank">#{idx + 1}</div>
                  <div className="history-content">
                    <div className="history-header">
                      <h4>Test Session</h4>
                      <span className="history-date">
                        {new Date(session.completedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="history-stats">
                      <div className="stat">
                        <span className="stat-label">Score</span>
                        <span className="stat-value">{session.percentage}%</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Correct</span>
                        <span className="stat-value">{session.totalScore}/{session.totalQuestions}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Passages</span>
                        <span className="stat-value">{session.passagesCompleted}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Time</span>
                        <span className="stat-value">
                          {Math.floor(session.totalTime / 60)}m {session.totalTime % 60}s
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={`history-score ${
                    session.percentage >= 80 ? 'excellent' : 
                    session.percentage >= 60 ? 'good' : 'needs-work'
                  }`}>
                    {session.percentage}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
