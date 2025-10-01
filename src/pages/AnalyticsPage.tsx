import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTestStore } from '../hooks/useTestStore';
import { getUserAttempts } from '../api/supabase';
import { signOut } from '../api/auth';
import { 
  calculatePerformanceAnalytics, 
  formatQuestionType, 
  formatPassageType,
  getSeverityColor,
  getTrendIcon,
  getTrendColor
} from '../utils/analytics';
import { TestAttempt, QuestionAttempt, PerformanceAnalytics } from '../types/act';
import './AnalyticsPage.css';

export default function AnalyticsPage() {
  const { currentUser } = useTestStore();
  const [analytics, setAnalytics] = useState<PerformanceAnalytics | null>(null);
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'overview' | 'question-types' | 'passage-types' | 'time-analysis' | 'progress' | 'weaknesses'>('dashboard');
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
      return;
    }

    loadAnalytics();
  }, [currentUser, navigate]);

  const handleStartTest = () => {
    navigate('/test-selection');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleViewSessionResults = (sessionId: string) => {
    navigate(`/session-results/${sessionId}`);
  };

  const loadAnalytics = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const result = await getUserAttempts(currentUser.id);
      if (result.data) {
        // Convert snake_case to camelCase
        const formattedAttempts: TestAttempt[] = result.data.map((a: any) => ({
          id: a.id,
          userId: a.user_id,
          sessionId: a.session_id,
          passageId: a.passage_id,
          answers: a.answers,
          score: a.score,
          totalQuestions: a.total_questions,
          timeSpent: a.time_spent,
          completedAt: a.completed_at,
          questionTimes: a.question_times,
          questionTypes: a.question_types,
          passageType: a.passage_type,
          readingTime: a.reading_time,
          answeringTime: a.answering_time
        }));
        
        setAttempts(formattedAttempts);

        // For now, create mock question attempts from test attempts
        // In a real implementation, this would come from a separate table
        const questionAttempts: QuestionAttempt[] = formattedAttempts.flatMap(attempt => 
          Object.entries(attempt.answers || {}).map(([questionId, userAnswer]) => ({
            questionId,
            questionNumber: parseInt(questionId),
            questionType: (attempt.questionTypes?.[questionId] as any) || 'detail',
            userAnswer,
            correctAnswer: 'A' as const, // This would come from the question data
            isCorrect: userAnswer === 'A', // This would be calculated properly
            timeSpent: attempt.questionTimes?.[questionId] || 30,
            difficulty: 'Medium' as const,
            passageType: attempt.passageType || 'informational'
          }))
        );

        const performanceAnalytics = calculatePerformanceAnalytics(formattedAttempts, questionAttempts);
        setAnalytics(performanceAnalytics);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="analytics-page">
        <div className="empty-state">
          <div className="empty-icon"><i className="fas fa-chart-bar"></i></div>
          <h2>No Analytics Available</h2>
          <p>Complete some tests to see your performance analytics.</p>
          <button onClick={() => navigate('/test-selection')} className="btn-waypath">
            Start Practicing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      {/* Header */}
      <div className="analytics-header">
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

      {/* Navigation Tabs */}
      <div className="analytics-nav">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-home' },
          { id: 'overview', label: 'Overview', icon: 'fas fa-chart-pie' },
          { id: 'question-types', label: 'Question Types', icon: 'fas fa-question-circle' },
          { id: 'passage-types', label: 'Passage Types', icon: 'fas fa-book' },
          { id: 'time-analysis', label: 'Time Analysis', icon: 'fas fa-clock' },
          { id: 'progress', label: 'Progress', icon: 'fas fa-trending-up' },
          { id: 'weaknesses', label: 'Weaknesses', icon: 'fas fa-exclamation-triangle' }
        ].map(tab => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id as any)}
          >
            <i className={tab.icon}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="analytics-content">
        {activeTab === 'dashboard' && <DashboardTab analytics={analytics} attempts={attempts} onStartTest={handleStartTest} onViewSession={handleViewSessionResults} />}
        {activeTab === 'overview' && <OverviewTab analytics={analytics} />}
        {activeTab === 'question-types' && <QuestionTypesTab analytics={analytics} />}
        {activeTab === 'passage-types' && <PassageTypesTab analytics={analytics} />}
        {activeTab === 'time-analysis' && <TimeAnalysisTab analytics={analytics} />}
        {activeTab === 'progress' && <ProgressTab analytics={analytics} />}
        {activeTab === 'weaknesses' && <WeaknessesTab analytics={analytics} />}
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ analytics }: { analytics: PerformanceAnalytics }) {
  return (
    <div className="overview-tab">
      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">
            <i className="fas fa-chart-bar"></i>
          </div>
          <div className="metric-content">
            <div className="metric-value">{analytics.overall.averageScore}%</div>
            <div className="metric-label">Average Score</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <i className="fas fa-clock"></i>
          </div>
          <div className="metric-content">
            <div className="metric-value">{Math.round(analytics.overall.averageTime / 60)}m</div>
            <div className="metric-label">Average Time</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <i className="fas fa-trophy"></i>
          </div>
          <div className="metric-content">
            <div className="metric-value">{analytics.overall.currentStreak}</div>
            <div className="metric-label">Current Streak</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <i className="fas fa-trending-up"></i>
          </div>
          <div className="metric-content">
            <div className="metric-value">{analytics.overall.improvement > 0 ? '+' : ''}{analytics.overall.improvement}%</div>
            <div className="metric-label">Improvement</div>
          </div>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="insights-section">
        <h3>Quick Insights</h3>
        <div className="insights-grid">
          <div className="insight-card">
            <h4>Best Question Type</h4>
            <p>
              {analytics.questionTypes.length > 0 
                ? formatQuestionType(analytics.questionTypes.sort((a, b) => b.accuracy - a.accuracy)[0].questionType)
                : 'N/A'
              }
            </p>
          </div>

          <div className="insight-card">
            <h4>Best Passage Type</h4>
            <p>
              {analytics.passageTypes.length > 0 
                ? formatPassageType(analytics.passageTypes.sort((a, b) => b.accuracy - a.accuracy)[0].passageType)
                : 'N/A'
              }
            </p>
          </div>

          <div className="insight-card">
            <h4>Time Management</h4>
            <p>
              {analytics.timeAnalysis.averageTimePerQuestion <= 45 
                ? 'Good pace - keep it up!'
                : 'Consider practicing with timed exercises'
              }
            </p>
          </div>

          <div className="insight-card">
            <h4>Focus Area</h4>
            <p>
              {analytics.weaknesses.topWeaknesses.length > 0 
                ? analytics.weaknesses.topWeaknesses[0].name
                : 'No major weaknesses identified'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Question Types Tab Component
function QuestionTypesTab({ analytics }: { analytics: PerformanceAnalytics }) {
  return (
    <div className="question-types-tab">
      <div className="section-header">
        <h3>Question Type Performance</h3>
        <p>How you perform on different types of reading questions</p>
      </div>

      <div className="performance-grid">
        {analytics.questionTypes.map((perf, index) => (
          <div key={perf.questionType} className="performance-card">
            <div className="performance-header">
              <h4>{formatQuestionType(perf.questionType)}</h4>
              <div className={`trend-indicator ${perf.trend}`}>
                <i className={getTrendIcon(perf.trend)}></i>
              </div>
            </div>
            
            <div className="performance-metrics">
              <div className="metric">
                <span className="metric-label">Accuracy</span>
                <span className="metric-value">{perf.accuracy}%</span>
              </div>
              <div className="metric">
                <span className="metric-label">Avg Time</span>
                <span className="metric-value">{perf.averageTime}s</span>
              </div>
              <div className="metric">
                <span className="metric-label">Questions</span>
                <span className="metric-value">{perf.totalQuestions}</span>
              </div>
            </div>

            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${perf.accuracy}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Passage Types Tab Component
function PassageTypesTab({ analytics }: { analytics: PerformanceAnalytics }) {
  return (
    <div className="passage-types-tab">
      <div className="section-header">
        <h3>Passage Type Performance</h3>
        <p>How you perform on different types of reading passages</p>
      </div>

      <div className="performance-grid">
        {analytics.passageTypes.map((perf, index) => (
          <div key={perf.passageType} className="performance-card">
            <div className="performance-header">
              <h4>{formatPassageType(perf.passageType)}</h4>
              <div className={`trend-indicator ${perf.trend}`}>
                <i className={getTrendIcon(perf.trend)}></i>
              </div>
            </div>
            
            <div className="performance-metrics">
              <div className="metric">
                <span className="metric-label">Accuracy</span>
                <span className="metric-value">{perf.accuracy}%</span>
              </div>
              <div className="metric">
                <span className="metric-label">Avg Time</span>
                <span className="metric-value">{Math.round(perf.averageTime / 60)}m</span>
              </div>
              <div className="metric">
                <span className="metric-label">Passages</span>
                <span className="metric-value">{perf.totalPassages}</span>
              </div>
            </div>

            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${perf.accuracy}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Time Analysis Tab Component
function TimeAnalysisTab({ analytics }: { analytics: PerformanceAnalytics }) {
  return (
    <div className="time-analysis-tab">
      <div className="section-header">
        <h3>Time Analysis</h3>
        <p>Understanding your pacing and time management</p>
      </div>

      <div className="time-metrics-grid">
        <div className="time-metric-card">
          <h4>Average Time per Question</h4>
          <div className="time-value">{analytics.timeAnalysis.averageTimePerQuestion}s</div>
          <div className="time-context">
            {analytics.timeAnalysis.averageTimePerQuestion <= 45 
              ? 'Good pace for ACT reading'
              : 'Consider practicing with timed exercises'
            }
          </div>
        </div>

        <div className="time-metric-card">
          <h4>Reading Time</h4>
          <div className="time-value">{Math.round(analytics.timeAnalysis.averageReadingTime / 60)}m</div>
          <div className="time-context">Time spent reading passages</div>
        </div>

        <div className="time-metric-card">
          <h4>Answering Time</h4>
          <div className="time-value">{Math.round(analytics.timeAnalysis.averageAnsweringTime / 60)}m</div>
          <div className="time-context">Time spent answering questions</div>
        </div>
      </div>

      <div className="time-distribution">
        <h4>Time Distribution</h4>
        <div className="distribution-chart">
          <div className="distribution-item">
            <div className="distribution-bar fast"></div>
            <span>Fast (&lt;30s): {analytics.timeAnalysis.timeDistribution.fast}</span>
          </div>
          <div className="distribution-item">
            <div className="distribution-bar medium"></div>
            <span>Medium (30-60s): {analytics.timeAnalysis.timeDistribution.medium}</span>
          </div>
          <div className="distribution-item">
            <div className="distribution-bar slow"></div>
            <span>Slow (&gt;60s): {analytics.timeAnalysis.timeDistribution.slow}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Progress Tab Component
function ProgressTab({ analytics }: { analytics: PerformanceAnalytics }) {
  return (
    <div className="progress-tab">
      <div className="section-header">
        <h3>Progress Tracking</h3>
        <p>Your improvement over time</p>
      </div>

      <div className="progress-charts">
        <div className="chart-card">
          <h4>Score Trend</h4>
          <div className="chart-placeholder">
            <p>Score trend chart would be displayed here</p>
            <div className="trend-summary">
              {analytics.overall.improvement > 0 
                ? `Improving by ${analytics.overall.improvement}%`
                : analytics.overall.improvement < 0 
                ? `Declining by ${Math.abs(analytics.overall.improvement)}%`
                : 'Stable performance'
              }
            </div>
          </div>
        </div>

        <div className="chart-card">
          <h4>Time Trend</h4>
          <div className="chart-placeholder">
            <p>Time trend chart would be displayed here</p>
            <div className="trend-summary">
              {analytics.timeAnalysis.averageTimePerQuestion <= 45 
                ? 'Good time management'
                : 'Room for improvement in pacing'
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Weaknesses Tab Component
function WeaknessesTab({ analytics }: { analytics: PerformanceAnalytics }) {
  return (
    <div className="weaknesses-tab">
      <div className="section-header">
        <h3>Weakness Analysis</h3>
        <p>Areas that need attention and improvement</p>
      </div>

      {analytics.weaknesses.topWeaknesses.length === 0 ? (
        <div className="no-weaknesses">
          <div className="success-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <h4>No Major Weaknesses Identified</h4>
          <p>Keep up the great work! Continue practicing to maintain your performance.</p>
        </div>
      ) : (
        <>
          <div className="weaknesses-list">
            {analytics.weaknesses.topWeaknesses.map((weakness, index) => (
              <div key={index} className="weakness-card">
                <div className="weakness-header">
                  <h4>{weakness.name}</h4>
                  <div 
                    className="severity-badge"
                    style={{ backgroundColor: getSeverityColor(weakness.severity) }}
                  >
                    {weakness.severity.toUpperCase()}
                  </div>
                </div>
                <p className="weakness-description">{weakness.description}</p>
                <div className="weakness-metrics">
                  <div className="metric">
                    <span className="metric-label">Accuracy</span>
                    <span className="metric-value">{weakness.accuracy}%</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Avg Time</span>
                    <span className="metric-value">{weakness.averageTime}s</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="recommendations-section">
            <h4>Recommendations</h4>
            <ul className="recommendations-list">
              {analytics.weaknesses.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

// Dashboard Tab Component
function DashboardTab({ 
  analytics, 
  attempts, 
  onStartTest, 
  onViewSession 
}: { 
  analytics: PerformanceAnalytics | null;
  attempts: TestAttempt[];
  onStartTest: () => void;
  onViewSession: (sessionId: string) => void;
}) {
  if (!analytics) {
    return (
      <div className="dashboard-tab">
        <div className="empty-state">
          <div className="empty-icon"><i className="fas fa-books"></i></div>
          <h2>No Tests Yet</h2>
          <p>Start your first ACT practice test to see your progress here!</p>
          <button onClick={onStartTest} className="btn-waypath large">
            Take Your First Test
          </button>
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

  // Create session summaries
  const sessions = Object.entries(sessionGroups).map(([sessionId, sessionAttempts]) => {
    const totalScore = sessionAttempts.reduce((sum, a) => sum + a.score, 0);
    const totalQuestions = sessionAttempts.reduce((sum, a) => sum + a.totalQuestions, 0);
    const totalTime = sessionAttempts.reduce((sum, a) => sum + a.timeSpent, 0);
    const percentage = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;
    const completedAt = sessionAttempts[0]?.completedAt || '';

    return {
      sessionId,
      totalScore,
      totalQuestions,
      totalTime,
      percentage,
      passagesCompleted: sessionAttempts.length,
      completedAt
    };
  }).sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

  // Get recent sessions for trend
  const recentSessions = sessions.slice(0, 5);
  const trendData = recentSessions.map(s => s.percentage);

  return (
    <div className="dashboard-tab">
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
                        stroke="var(--waypath-primary)"
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
                          fill="var(--waypath-primary)"
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
              onClick={() => onViewSession(session.sessionId)}
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
    </div>
  );
}
