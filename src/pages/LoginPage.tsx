import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTestStore } from '../hooks/useTestStore';
import { signUp, signIn, sendPasswordResetEmail } from '../api/auth';
import './LoginPage.css';

type ViewMode = 'signin' | 'signup' | 'forgot-password' | 'admin-login';

export default function LoginPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [grade, setGrade] = useState<number>(11);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const { setUser } = useTestStore();
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password) {
      setError('Please enter email and password');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const result = await signIn(email.trim(), password);
      
      if (result.success && result.user) {
        setUser(result.user);
        navigate('/test-selection');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const result = await signUp(email.trim(), password, name.trim(), grade);
      
      if (result.success && result.user) {
        setUser(result.user);
        setSuccessMessage('Account created successfully!');
        setTimeout(() => {
          navigate('/test-selection');
        }, 1000);
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const result = await sendPasswordResetEmail(email.trim());
      
      if (result.success) {
        setSuccessMessage('Password reset email sent! Check your inbox.');
        setTimeout(() => {
          setViewMode('signin');
          setSuccessMessage('');
        }, 3000);
      } else {
        setError(result.error || 'Failed to send reset email');
      }
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError('Failed to send reset email. Please try again.');
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
    setPassword('');
    setConfirmPassword('');
    setAdminUsername('');
    setAdminPassword('');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>ACT Test Prep</h1>
          <p>
            {viewMode === 'signin' && 'Sign in to continue your practice'}
            {viewMode === 'signup' && 'Create an account to get started'}
            {viewMode === 'forgot-password' && 'Reset your password'}
            {viewMode === 'admin-login' && 'Admin access required'}
          </p>
        </div>

        {/* Sign In Form */}
        {viewMode === 'signin' && (
          <form onSubmit={handleSignIn} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="form-links">
              <button
                type="button"
                onClick={() => {
                  setViewMode('forgot-password');
                  resetForm();
                }}
                className="link-button"
                disabled={loading}
              >
                Forgot Password?
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode('signup');
                  resetForm();
                }}
                className="link-button"
                disabled={loading}
              >
                Create Account
              </button>
            </div>

            <div className="divider">or</div>

            <div className="quick-access-buttons">
              <button 
                type="button" 
                onClick={handleTestingMode} 
                className="btn-secondary"
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

        {/* Sign Up Form */}
        {viewMode === 'signup' && (
          <form onSubmit={handleSignUp} className="login-form">
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
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password (min 6 characters)"
                disabled={loading}
                autoComplete="new-password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                disabled={loading}
                autoComplete="new-password"
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
            {successMessage && <div className="success-message">{successMessage}</div>}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            <div className="form-links">
              <button
                type="button"
                onClick={() => {
                  setViewMode('signin');
                  resetForm();
                }}
                className="link-button"
                disabled={loading}
              >
                Already have an account? Sign In
              </button>
            </div>
          </form>
        )}

        {/* Forgot Password Form */}
        {viewMode === 'forgot-password' && (
          <form onSubmit={handleForgotPassword} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <p className="help-text">
              We'll send you a link to reset your password.
            </p>

            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <div className="form-links">
              <button
                type="button"
                onClick={() => {
                  setViewMode('signin');
                  resetForm();
                }}
                className="link-button"
                disabled={loading}
              >
                Back to Sign In
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
                  setViewMode('signin');
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