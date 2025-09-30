import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { updatePassword } from '../api/auth';
import './LoginPage.css';

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isValidToken, setIsValidToken] = useState(false);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check for access token in URL (Supabase redirects with it)
    // Tokens can be in query params or hash fragment
    const accessToken = searchParams.get('access_token') || 
                       new URLSearchParams(window.location.hash.substring(1)).get('access_token');
    const refreshToken = searchParams.get('refresh_token') || 
                        new URLSearchParams(window.location.hash.substring(1)).get('refresh_token');
    
    console.log('Reset password page loaded');
    console.log('URL:', window.location.href);
    console.log('Search params:', searchParams.toString());
    console.log('Hash:', window.location.hash);
    console.log('Access token found:', !!accessToken);
    console.log('Refresh token found:', !!refreshToken);
    
    if (accessToken && refreshToken) {
      setIsValidToken(true);
    } else {
      setError('Invalid or expired reset link. Please request a new password reset.');
    }
  }, [searchParams]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidToken) {
      setError('Invalid reset link. Please request a new password reset.');
      return;
    }
    
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const result = await updatePassword(newPassword);
      
      if (result.success) {
        setSuccessMessage('Password updated successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setError(result.error || 'Password update failed');
      }
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError('Password update failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Reset Password</h1>
          <p>Enter your new password</p>
        </div>

        {!isValidToken ? (
          <div className="error-container">
            <p className="error-message">{error}</p>
            <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '8px', fontSize: '12px' }}>
              <strong>Debug Info:</strong><br/>
              URL: {window.location.href}<br/>
              Hash: {window.location.hash}<br/>
              Search: {window.location.search}
            </div>
            <button onClick={() => navigate('/')} className="btn-primary">
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="login-form">
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min 6 characters)"
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
              placeholder="Confirm new password"
              disabled={loading}
              autoComplete="new-password"
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Updating Password...' : 'Update Password'}
          </button>

          <div className="form-links">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="link-button"
              disabled={loading}
            >
              Back to Sign In
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
