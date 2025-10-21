import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTestStore } from '../hooks/useTestStore';
import { signInWithMagicLink } from '../api/auth';
import './LoginPage.css';

type ViewMode = 'magic-link' | 'admin-login';

export default function LoginPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('magic-link');
  const [email, setEmail] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const { setUser } = useTestStore();
  const navigate = useNavigate();

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const result = await signInWithMagicLink(email.trim());
      
      if (result.success) {
        setSuccessMessage('Check your email for your magic link! 🎉');
        setEmail(''); // Clear email field after success
      } else {
        setError(result.error || 'Failed to send magic link');
      }
    } catch (err: any) {
      console.error('Magic link error:', err);
      setError('Failed to send magic link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestingMode = () => {
    const testUser = {
      id: 'test_user',
      name: 'Test User',
      email: 'test@example.com',
      grade: 11,
      registeredAt: new Date().toISOString()
    };
    
    setUser(testUser);
    navigate('/test-selection');
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adminUsername.trim() || !adminPassword) {
      setError('Please enter admin username and password');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      // Check admin credentials
      if (adminUsername.trim() === 'admin' && adminPassword === 'WP4Life') {
        const adminUser = {
          id: 'admin_user',
          name: 'Admin',
          email: 'admin@waypathacademics.com',
          grade: 12,
          registeredAt: new Date().toISOString()
        };
        
        setUser(adminUser);
        setSuccessMessage('Admin access granted!');
        setTimeout(() => {
          navigate('/admin');
        }, 1000);
      } else {
        setError('Invalid admin credentials');
      }
    } catch (err: any) {
      console.error('Admin login error:', err);
      setError('Admin login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setError('');
    setSuccessMessage('');
    setAdminUsername('');
    setAdminPassword('');
  };

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
          <p>
            {viewMode === 'magic-link' && 'Sign in with your email - no password needed!'}
            {viewMode === 'admin-login' && 'Admin access required'}
          </p>
        </div>

        {/* Magic Link Form */}
        {viewMode === 'magic-link' && (
          <form onSubmit={handleMagicLink} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={loading}
                autoComplete="email"
                autoFocus
              />
            </div>

            <p className="help-text" style={{ fontSize: '0.9rem', color: '#666', marginTop: '-0.5rem', marginBottom: '1rem' }}>
              We'll send you a magic link to sign in instantly
            </p>

            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}

            <button type="submit" className="btn-waypath" disabled={loading}>
              {loading ? 'Sending Magic Link...' : 'Send Magic Link'}
            </button>

            <div className="divider">or</div>

            <div className="quick-access-buttons">
              <button 
                type="button" 
                onClick={handleTestingMode} 
                className="btn-waypath"
                style={{background: 'transparent', color: 'var(--waypath-secondary)', border: '2px solid var(--waypath-primary)'}}
                disabled={loading}
              >
                Testing Mode (Skip Login)
              </button>
              
              <button 
                type="button" 
                onClick={() => {
                  setViewMode('admin-login');
                  resetForm();
                }}
                className="btn-admin"
                disabled={loading}
              >
                ⚙️ Admin Access
              </button>
            </div>
          </form>
        )}

        {/* Admin Login Form */}
        {viewMode === 'admin-login' && (
          <form onSubmit={handleAdminLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="adminUsername">Admin Username</label>
              <input
                id="adminUsername"
                type="text"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                placeholder="Enter admin username"
                disabled={loading}
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="adminPassword">Admin Password</label>
              <input
                id="adminPassword"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter admin password"
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}

            <button type="submit" className="btn-admin" disabled={loading}>
              {loading ? 'Signing in...' : '⚙️ Admin Sign In'}
            </button>

            <div className="form-links">
              <button
                type="button"
                onClick={() => {
                  setViewMode('magic-link');
                  resetForm();
                }}
                className="link-button"
                disabled={loading}
              >
                Back to Regular Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}