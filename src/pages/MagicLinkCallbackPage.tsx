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

        // Check if profile exists in database
        if (userData) {
          // Existing user - load from database
          const user = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            grade: userData.grade,
            registeredAt: userData.registered_at
          };
          setUser(user);
          navigate('/test-selection');
        } else {
          // New user - check if we have user_metadata from sign up
          const userMetadata = session.user.user_metadata;
          
          if (userMetadata?.name && userMetadata?.grade) {
            // User signed up with name/grade - create profile automatically
            // Use upsert to handle case where user already exists
            const { error: createError } = await supabase
              .from('users')
              .upsert({
                id: session.user.id,
                name: userMetadata.name,
                email: session.user.email,
                grade: userMetadata.grade,
                registered_at: new Date().toISOString()
              }, {
                onConflict: 'id', // Update if user already exists
                ignoreDuplicates: false // Always update the record
              });

            if (createError) {
              console.error('Failed to create profile:', createError);
              setError('Failed to create your account. Please try again.');
              setLoading(false);
              return;
            }

            // Set user and redirect to test selection
            const newUser = {
              id: session.user.id,
              email: session.user.email || '',
              name: userMetadata.name,
              grade: userMetadata.grade,
              registeredAt: new Date().toISOString()
            };
            setUser(newUser);
            navigate('/test-selection');
          } else {
            // Old flow: User signed in without providing name/grade
            // Redirect to profile completion
            const partialUser = {
              id: session.user.id,
              email: session.user.email || '',
              name: '',
              grade: 11,
              registeredAt: new Date().toISOString()
            };
            setUser(partialUser);
            navigate('/complete-profile');
          }
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

