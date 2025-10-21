import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTestStore } from '../hooks/useTestStore';
import { supabase } from '../api/supabase';
import './LoginPage.css';

export default function MagicLinkCallbackPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { setUser } = useTestStore();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyMagicLink = async () => {
      try {
        // Supabase automatically handles the magic link from the URL hash
        // We just need to check if there's a session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Session error:', sessionError);
          setError('Failed to verify magic link. Please try again.');
          setLoading(false);
          return;
        }

        if (!session || !session.user) {
          setError('Invalid magic link. Please request a new one.');
          setLoading(false);
          return;
        }

        // Got a valid session! Now check if user profile exists
        const { data: userData, error: dbError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (dbError && dbError.code !== 'PGRST116') {
          console.error('Database error:', dbError);
          setError('Failed to load user profile. Please try again.');
          setLoading(false);
          return;
        }

        // Create user object
        const user = userData ? {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          grade: userData.grade,
          registeredAt: userData.registered_at
        } : {
          id: session.user.id,
          email: session.user.email || '',
          name: '',
          grade: 11,
          registeredAt: new Date().toISOString()
        };

        setUser(user);

        // Route based on profile completion
        if (!user.name || user.name === '') {
          navigate('/complete-profile');
        } else {
          navigate('/test-selection');
        }

      } catch (err: any) {
        console.error('Magic link verification error:', err);
        setError('An error occurred during verification');
        setLoading(false);
      }
    };

    verifyMagicLink();
  }, [setUser, navigate]);

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

