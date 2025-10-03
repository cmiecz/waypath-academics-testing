import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabase';
import { signOut } from '../api/auth';
import { useTestStore } from '../hooks/useTestStore';
import './StudentManagementPage.css';

interface Student {
  id: string;
  name: string;
  email: string;
  grade: number | null;
  registered_at: string;
  created_at: string;
  test_attempts_count: number;
  last_activity: string | null;
}

export default function StudentManagementPage() {
  const navigate = useNavigate();
  const { setUser } = useTestStore();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch students with their test attempt counts and last activity
      const { data: studentsData, error: studentsError } = await supabase
        .from('users')
        .select(`
          id,
          name,
          email,
          grade,
          registered_at,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (studentsError) {
        throw new Error(`Failed to load students: ${studentsError.message}`);
      }

      // Get test attempt counts and last activity for each student
      const studentsWithStats = await Promise.all(
        (studentsData || []).map(async (student) => {
          // Get test attempt count
          const { count: attemptsCount } = await supabase
            .from('test_attempts')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', student.id);

          // Get last activity (most recent test attempt)
          const { data: lastAttempt } = await supabase
            .from('test_attempts')
            .select('completed_at')
            .eq('user_id', student.id)
            .order('completed_at', { ascending: false })
            .limit(1);

          return {
            ...student,
            test_attempts_count: attemptsCount || 0,
            last_activity: lastAttempt?.[0]?.completed_at || null
          };
        })
      );

      setStudents(studentsWithStats);
    } catch (err: any) {
      console.error('Error loading students:', err);
      setError(err.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    setDeleting(studentId);
    setError('');
    setSuccess('');

    try {
      // Delete student and all related data (cascade delete)
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', studentId);

      if (deleteError) {
        throw new Error(`Failed to delete student: ${deleteError.message}`);
      }

      setSuccess('Student deleted successfully');
      setShowDeleteConfirm(null);
      
      // Reload students list
      await loadStudents();
    } catch (err: any) {
      console.error('Error deleting student:', err);
      setError(err.message || 'Failed to delete student');
    } finally {
      setDeleting(null);
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

  const handleBackToAdmin = () => {
    navigate('/admin');
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatLastActivity = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="student-management-page">
      <div className="student-management-container">
        <div className="student-management-header">
          <div className="header-left">
            <h1><i className="fas fa-users"></i> Student Management</h1>
            <p>Manage student accounts and view their activity</p>
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

        {/* Search and Stats */}
        <div className="student-controls">
          <div className="search-section">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search students by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="stats-summary">
            <div className="stat-item">
              <span className="stat-label">Total Students:</span>
              <span className="stat-value">{students.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Active Students:</span>
              <span className="stat-value">
                {students.filter(s => s.test_attempts_count > 0).length}
              </span>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-triangle"></i>
            {error}
          </div>
        )}
        {success && (
          <div className="success-message">
            <i className="fas fa-check-circle"></i>
            {success}
          </div>
        )}

        {/* Students List */}
        <div className="students-section">
          {loading ? (
            <div className="loading-state">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Loading students...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-user-slash"></i>
              <h3>No Students Found</h3>
              <p>
                {searchTerm 
                  ? `No students match "${searchTerm}"`
                  : 'No students have registered yet'
                }
              </p>
            </div>
          ) : (
            <div className="students-list">
              {filteredStudents.map((student) => (
                <div key={student.id} className="student-card">
                  <div className="student-info">
                    <div className="student-avatar">
                      <i className="fas fa-user"></i>
                    </div>
                    <div className="student-details">
                      <h3 className="student-name">{student.name}</h3>
                      <p className="student-email">{student.email}</p>
                      <div className="student-meta">
                        <span className="meta-item">
                          <i className="fas fa-graduation-cap"></i>
                          Grade {student.grade || 'N/A'}
                        </span>
                        <span className="meta-item">
                          <i className="fas fa-calendar"></i>
                          Joined {formatDate(student.registered_at)}
                        </span>
                        <span className="meta-item">
                          <i className="fas fa-chart-bar"></i>
                          {student.test_attempts_count} tests
                        </span>
                        <span className="meta-item">
                          <i className="fas fa-clock"></i>
                          Last active {formatLastActivity(student.last_activity)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="student-actions">
                    <button
                      onClick={() => setShowDeleteConfirm(student.id)}
                      className="btn-delete"
                      disabled={deleting === student.id}
                    >
                      {deleting === student.id ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        <i className="fas fa-trash"></i>
                      )}
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3><i className="fas fa-exclamation-triangle"></i> Confirm Deletion</h3>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to delete this student? This action will:
                </p>
                <ul>
                  <li>Permanently delete the student account</li>
                  <li>Remove all test attempts and progress data</li>
                  <li>Delete all test sessions</li>
                </ul>
                <p className="warning-text">
                  <strong>This action cannot be undone.</strong>
                </p>
              </div>
              <div className="modal-actions">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="btn-cancel"
                  disabled={deleting === showDeleteConfirm}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteStudent(showDeleteConfirm)}
                  className="btn-confirm-delete"
                  disabled={deleting === showDeleteConfirm}
                >
                  {deleting === showDeleteConfirm ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Deleting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-trash"></i> Delete Student
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}





