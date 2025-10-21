import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTestStore } from '../hooks/useTestStore';
import { handleMagicLinkCallback } from '../api/auth';
import './LoginPage.css';

export default function MagicLinkCallbackPage() {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { setUser } = useTestStore();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyMagicLink = async () => {
      try {
        const tokenHash = searchParams.get('token_hash');
        const type = searchParams.get('type');

        if (!tokenHash || !type) {
          setError('Invalid magic link. Please request a new one.');
          setLoading(false);
          return;
        }

        const result = await handleMagicLinkCallback(tokenHash, type);

        if (result.success && result.user) {
          setUser(result.user);

          // Check if user needs to complete profile
          if (!result.user.name || result.user.name === '') {
            // New user - redirect to profile completion
            navigate('/complete-profile');
          } else {
            // Existing user - redirect to test selection
            navigate('/test-selection');
          }
        } else {
          setError(result.error || 'Verification failed');
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Magic link verification error:', err);
        setError('An error occurred during verification');
        setLoading(false);
      }
    };

    verifyMagicLink();
  }, [searchParams, setUser, navigate]);

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
        </div>

        <div className="login-form">
          {loading ? (
            <>
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div className="loading-spinner" style={{
                  border: '4px solid #f3f3f3',
                  borderTop: '4px solid var(--waypath-primary)',
                  borderRadius: '50%',
                  width: '50px',
                  height: '50px',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 1rem'
                }}></div>
                <p>Verifying your magic link...</p>
              </div>
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </>
          ) : (
            <>
              {error && (
                <>
                  <div className="error-message">{error}</div>
                  <button
                    onClick={() => navigate('/')}
                    className="btn-waypath"
                    style={{ marginTop: '1rem' }}
                  >
                    Back to Sign In
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

