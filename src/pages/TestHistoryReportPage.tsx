import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabase';
import { signOut } from '../api/auth';
import { useTestStore } from '../hooks/useTestStore';
import './TestHistoryReportPage.css';

interface TestAttempt {
  id: string;
  user_id: string;
  session_id: string;
  passage_id: string;
  answers: Record<string, string>;
  score: number;
  total_questions: number;
  time_spent: number;
  completed_at: string;
  raw_score?: number;
  scaled_score?: number;
  percentile?: number;
  user_name?: string;
  user_email?: string;
  passage_title?: string;
  passage_subject?: string;
}

interface GroupedData {
  [testType: string]: {
    [studentId: string]: {
      studentName: string;
      studentEmail: string;
      tests: TestAttempt[];
    };
  };
}

export default function TestHistoryReportPage() {
  const navigate = useNavigate();
  const { setUser } = useTestStore();
  const [groupedData, setGroupedData] = useState<GroupedData>({});
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [expandedStudents, setExpandedStudents] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadTestHistory();
  }, []);

  const loadTestHistory = async () => {
    setLoading(true);
    try {
      console.log('Loading test history...');
      
      // Get test attempts
      const { data: attemptsData, error: attemptsError } = await supabase
        .from('test_attempts')
        .select('*')
        .order('completed_at', { ascending: false });

      if (attemptsError) {
        console.error('Error loading test attempts:', attemptsError);
        return;
      }

      if (!attemptsData || attemptsData.length === 0) {
        console.log('No test attempts found');
        setGroupedData({});
        return;
      }

      console.log('Test attempts found:', attemptsData.length);

      // Get users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, name, email');

      if (usersError) {
        console.error('Error loading users:', usersError);
      }

      // Get passages
      const { data: passagesData, error: passagesError } = await supabase
        .from('passages')
        .select('id, title, subject');

      if (passagesError) {
        console.error('Error loading passages:', passagesError);
      }

      console.log('Users found:', usersData?.length || 0);
      console.log('Passages found:', passagesData?.length || 0);

      // Create lookup maps
      const usersMap = new Map(usersData?.map(u => [u.id, u]) || []);
      const passagesMap = new Map(passagesData?.map(p => [p.id, p]) || []);

      console.log('Users map:', Array.from(usersMap.entries()));
      console.log('Passages map:', Array.from(passagesMap.entries()));

      // Combine the data
      const data = attemptsData.map(attempt => {
        const user = usersMap.get(attempt.user_id);
        const passage = passagesMap.get(attempt.passage_id);
        
        console.log(`Attempt ${attempt.id}: user_id=${attempt.user_id}, passage_id=${attempt.passage_id}`);
        console.log(`  User found:`, user);
        console.log(`  Passage found:`, passage);
        
        return {
          ...attempt,
          users: user,
          passages: passage
        };
      });

      console.log('Combined data:', data);

      // Group data by test type (subject) and then by student
      const grouped: GroupedData = {};
      
      data?.forEach((attempt: any) => {
        console.log('Processing attempt:', attempt);
        
        const testType = attempt.passages?.subject || 'Reading';
        const studentId = attempt.user_id;
        const studentName = attempt.users?.name || 'Unknown Student';
        const studentEmail = attempt.users?.email || 'unknown@email.com';
        
        console.log('Extracted data:', { testType, studentId, studentName, studentEmail });
        
        if (!grouped[testType]) {
          grouped[testType] = {};
        }
        
        if (!grouped[testType][studentId]) {
          grouped[testType][studentId] = {
            studentName,
            studentEmail,
            tests: []
          };
        }
        
        grouped[testType][studentId].tests.push({
          ...attempt,
          user_name: studentName,
          user_email: studentEmail,
          passage_title: attempt.passages?.title || 'Unknown Passage',
          passage_subject: testType
        });
      });

      console.log('Final grouped data:', grouped);
      setGroupedData(grouped);
    } catch (error) {
      console.error('Error loading test history:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleGroup = (testType: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(testType)) {
      newExpanded.delete(testType);
    } else {
      newExpanded.add(testType);
    }
    setExpandedGroups(newExpanded);
  };

  const toggleStudent = (studentKey: string) => {
    const newExpanded = new Set(expandedStudents);
    if (newExpanded.has(studentKey)) {
      newExpanded.delete(studentKey);
    } else {
      newExpanded.add(studentKey);
    }
    setExpandedStudents(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const calculatePercentage = (score: number, total: number) => {
    return total > 0 ? Math.round((score / total) * 100) : 0;
  };

  const handleBackToAdmin = () => {
    navigate('/admin');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (loading) {
    return (
      <div className="test-history-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading test history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="test-history-page">
      <div className="test-history-container">
        <div className="test-history-header">
          <div className="header-left">
            <h1><i className="fas fa-chart-bar"></i> Test History Report</h1>
            <p>Detailed analytics and student performance data</p>
          </div>
          <div className="header-actions">
            <button onClick={handleBackToAdmin} className="btn-back">
              <i className="fas fa-arrow-left"></i> Back to Admin
            </button>
            <button onClick={handleSignOut} className="btn-secondary">
              <i className="fas fa-sign-out-alt"></i> Sign Out
            </button>
          </div>
        </div>

        <div className="report-content">
          {Object.keys(groupedData).length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><i className="fas fa-chart-bar"></i></div>
              <h2>No Test Data Available</h2>
              <p>No test attempts have been recorded yet.</p>
            </div>
          ) : (
            <div className="test-groups">
              {Object.entries(groupedData).map(([testType, students]) => {
                const totalTests = Object.values(students).reduce(
                  (sum, student) => sum + student.tests.length, 0
                );
                const totalStudents = Object.keys(students).length;
                const avgScore = Object.values(students).reduce((sum, student) => {
                  const studentAvg = student.tests.reduce((s, test) => 
                    s + calculatePercentage(test.score, test.total_questions), 0
                  ) / student.tests.length;
                  return sum + studentAvg;
                }, 0) / totalStudents;

                return (
                  <div key={testType} className="test-group">
                    <div 
                      className="group-header"
                      onClick={() => toggleGroup(testType)}
                    >
                      <div className="group-info">
                        <h3>{testType} Tests</h3>
                        <div className="group-stats">
                          <span>{totalStudents} students</span>
                          <span>•</span>
                          <span>{totalTests} tests</span>
                          <span>•</span>
                          <span>{Math.round(avgScore)}% avg score</span>
                        </div>
                      </div>
                      <div className={`expand-icon ${expandedGroups.has(testType) ? 'expanded' : ''}`}>
                        ▼
                      </div>
                    </div>

                    {expandedGroups.has(testType) && (
                      <div className="students-list">
                        {Object.entries(students).map(([studentId, studentData]) => {
                          const studentKey = `${testType}-${studentId}`;
                          const studentAvg = studentData.tests.reduce((sum, test) => 
                            sum + calculatePercentage(test.score, test.total_questions), 0
                          ) / studentData.tests.length;

                          return (
                            <div key={studentId} className="student-group">
                              <div 
                                className="student-header"
                                onClick={() => toggleStudent(studentKey)}
                              >
                                <div className="student-info">
                                  <h4>{studentData.studentName}</h4>
                                  <div className="student-stats">
                                    <span>{studentData.tests.length} tests</span>
                                    <span>•</span>
                                    <span>{Math.round(studentAvg)}% avg score</span>
                                    <span>•</span>
                                    <span>{studentData.studentEmail}</span>
                                  </div>
                                </div>
                                <div className={`expand-icon ${expandedStudents.has(studentKey) ? 'expanded' : ''}`}>
                                  ▼
                                </div>
                              </div>

                              {expandedStudents.has(studentKey) && (
                                <div className="tests-table">
                                  <table>
                                    <thead>
                                      <tr>
                                        <th>Test</th>
                                        <th>Raw Score</th>
                                        <th>ACT Score</th>
                                        <th>Percentile</th>
                                        <th>Time</th>
                                        <th>Date</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {studentData.tests.map((test) => (
                                        <tr key={test.id}>
                                          <td className="test-name">
                                            {test.passage_title}
                                          </td>
                                          <td>{test.raw_score || test.score}/{test.total_questions}</td>
                                          <td className="score-cell">
                                            <span className={`score-badge ${
                                              (test.scaled_score || calculatePercentage(test.score, test.total_questions)) >= 30 ? 'excellent' :
                                              (test.scaled_score || calculatePercentage(test.score, test.total_questions)) >= 20 ? 'good' : 'needs-work'
                                            }`}>
                                              {test.scaled_score || 'N/A'}
                                            </span>
                                          </td>
                                          <td>{test.percentile ? `${test.percentile}%` : 'N/A'}</td>
                                          <td>{formatTime(test.time_spent)}</td>
                                          <td>{formatDate(test.completed_at)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
