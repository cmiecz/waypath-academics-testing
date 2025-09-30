import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from '../api/auth';
import { useTestStore } from '../hooks/useTestStore';
import { supabase } from '../api/supabase';
import './AdminMainPage.css';

interface AdminStats {
  totalPassages: number;
  activeStudents: number;
  testsCompleted: number;
  avgScore: number;
}

export default function AdminMainPage() {
  const navigate = useNavigate();
  const { setUser } = useTestStore();
  const [stats, setStats] = useState<AdminStats>({
    totalPassages: 0,
    activeStudents: 0,
    testsCompleted: 0,
    avgScore: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminStats();
  }, []);

  const loadAdminStats = async () => {
    setLoading(true);
    try {
      // Fetch all stats in parallel
      const [passagesResult, usersResult, attemptsResult] = await Promise.all([
        supabase.from('passages').select('id', { count: 'exact' }),
        supabase.from('users').select('id', { count: 'exact' }),
        supabase.from('test_attempts').select('score, total_questions')
      ]);

      const totalPassages = passagesResult.count || 0;
      const activeStudents = usersResult.count || 0;
      const testsCompleted = attemptsResult.data?.length || 0;
      
      // Calculate average score
      let avgScore = 0;
      if (attemptsResult.data && attemptsResult.data.length > 0) {
        const totalScore = attemptsResult.data.reduce((sum, attempt) => {
          const percentage = attempt.total_questions > 0 ? 
            (attempt.score / attempt.total_questions) * 100 : 0;
          return sum + percentage;
        }, 0);
        avgScore = Math.round(totalScore / attemptsResult.data.length);
      }

      setStats({
        totalPassages,
        activeStudents,
        testsCompleted,
        avgScore
      });
    } catch (error) {
      console.error('Error loading admin stats:', error);
    } finally {
      setLoading(false);
    }
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

  const handlePassageManagement = () => {
    navigate('/admin/passage-list');
  };

  const handleAddPassage = () => {
    navigate('/admin/passage-management');
  };

  const handleTestHistory = () => {
    navigate('/admin/test-history');
  };

  const handleBackToApp = () => {
    navigate('/test-selection');
  };

  return (
    <div className="admin-main-page">
      <div className="admin-main-container">
        <div className="admin-main-header">
          <div className="header-left">
            <h1>🔧 Admin Dashboard</h1>
            <p>Manage passages and view test analytics</p>
          </div>
          <div className="header-actions">
            <button onClick={handleBackToApp} className="btn-back">
              ← Back to App
            </button>
            <button onClick={handleSignOut} className="btn-secondary">
              Sign Out
            </button>
          </div>
        </div>

        <div className="admin-navigation">
          <div className="nav-cards">
            <div className="nav-card" onClick={handleAddPassage}>
              <div className="nav-icon">➕</div>
              <div className="nav-content">
                <h3>Add New Passage</h3>
                <p>Upload new reading passages and questions</p>
              </div>
              <div className="nav-arrow">→</div>
            </div>

            <div className="nav-card" onClick={handlePassageManagement}>
              <div className="nav-icon">📚</div>
              <div className="nav-content">
                <h3>Passage Management</h3>
                <p>View, edit, and manage passage visibility</p>
              </div>
              <div className="nav-arrow">→</div>
            </div>

            <div className="nav-card" onClick={handleTestHistory}>
              <div className="nav-icon">📊</div>
              <div className="nav-content">
                <h3>Test History Report</h3>
                <p>View detailed analytics and student performance data</p>
              </div>
              <div className="nav-arrow">→</div>
            </div>
          </div>
        </div>

        <div className="admin-stats">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📖</div>
              <div className="stat-content">
                <div className="stat-value">
                  {loading ? '...' : stats.totalPassages.toLocaleString()}
                </div>
                <div className="stat-label">Total Passages</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <div className="stat-value">
                  {loading ? '...' : stats.activeStudents.toLocaleString()}
                </div>
                <div className="stat-label">Active Students</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <div className="stat-content">
                <div className="stat-value">
                  {loading ? '...' : stats.testsCompleted.toLocaleString()}
                </div>
                <div className="stat-label">Tests Completed</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-content">
                <div className="stat-value">
                  {loading ? '...' : `${stats.avgScore}%`}
                </div>
                <div className="stat-label">Avg Score</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
