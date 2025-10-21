import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTestStore } from '../hooks/useTestStore';
import { createUserProfile } from '../api/auth';
import './LoginPage.css';

export default function ProfileCompletionPage() {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState<number>(11);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { currentUser, setUser } = useTestStore();
  const navigate = useNavigate();

  // Redirect if no user or user already has profile
  React.useEffect(() => {
    if (!currentUser) {
      navigate('/');
    } else if (currentUser.name && currentUser.name !== '') {
      navigate('/test-selection');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!currentUser?.id || !currentUser?.email) {
      setError('Invalid user session');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await createUserProfile(
        currentUser.id,
        name.trim(),
        currentUser.email,
        grade
      );

      if (result.success && result.user) {
        setUser(result.user);
        navigate('/test-selection');
      } else {
        setError(result.error || 'Failed to create profile');
      }
    } catch (err: any) {
      console.error('Profile creation error:', err);
      setError('Failed to create profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="logo-waypath">
            <div className="logo-icon">W</div>
            <div className="logo-text">
              <div className="logo-primary">WAYPATH</div>
              <div className="logo-secondary">Academics</div>
            </div>
          </div>
          <h1>ACT Test Prep</h1>
          <p>Complete your profile to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              disabled={loading}
              autoComplete="name"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="grade">Grade Level</label>
            <select
              id="grade"
              value={grade}
              onChange={(e) => setGrade(Number(e.target.value))}
              disabled={loading}
            >
              <option value={9}>9th Grade</option>
              <option value={10}>10th Grade</option>
              <option value={11}>11th Grade</option>
              <option value={12}>12th Grade</option>
            </select>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn-waypath" disabled={loading}>
            {loading ? 'Creating Profile...' : 'Complete Profile'}
          </button>

          <div className="form-links">
            <p style={{ textAlign: 'center', color: '#666', fontSize: '0.9rem' }}>
              Signed in as <strong>{currentUser.email}</strong>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

