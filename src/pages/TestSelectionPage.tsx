import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTestStore } from '../hooks/useTestStore';
import { signOut } from '../api/auth';
import './TestSelectionPage.css';

export default function TestSelectionPage() {
  const { currentUser, setUser } = useTestStore();
  const navigate = useNavigate();
  const [selectedTestMode, setSelectedTestMode] = useState<'practice' | 'test'>('practice');

  const handleSubjectSelect = async (subject: 'English' | 'Math' | 'Reading' | 'Science') => {
    try {
      // Navigate to passage selection with subject and test mode
      navigate('/passage-selection', { 
        state: { 
          subject, 
          testMode: selectedTestMode 
        } 
      });
    } catch (error) {
      console.error('Error starting test session:', error);
    }
  };

  const handleViewReports = () => {
    navigate('/dashboard');
  };

  const handleAdmin = () => {
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

  return (
    <div className="test-selection-page">
      <div className="test-selection-container">
        <div className="selection-header">
          <div className="header-content">
            <h1>Welcome, {currentUser?.name}!</h1>
            <p>Select a subject and test mode to begin</p>
          </div>
          <div className="header-actions">
            <button onClick={handleViewReports} className="btn-reports">
              📊 View Reports
            </button>
            {currentUser?.email === 'admin@waypathacademics.com' && (
              <button onClick={handleAdmin} className="btn-admin">
                ⚙️ Admin
              </button>
            )}
            <button onClick={handleSignOut} className="btn-secondary">
              Sign Out
            </button>
          </div>
        </div>

        {/* Test Mode Toggle */}
        <div className="test-mode-selection">
          <div className="test-mode-labels">
            <div className="mode-label-container">
              <span className={`mode-label ${selectedTestMode === 'practice' ? 'active' : ''}`}>Practice</span>
              <div className="tooltip">
                <div className="tooltip-content">
                  <strong>Practice Mode</strong><br />
                  • Pause between passages<br />
                  • See results after each passage<br />
                  • Review answers and explanations<br />
                  • Retake passages if needed
                </div>
              </div>
            </div>
            <div className="toggle-switch-container">
              <input
                type="checkbox"
                id="testModeToggle"
                className="toggle-switch-checkbox"
                checked={selectedTestMode === 'test'}
                onChange={() => setSelectedTestMode(selectedTestMode === 'practice' ? 'test' : 'practice')}
              />
              <label htmlFor="testModeToggle" className="toggle-switch-label">
                <span className="toggle-switch-inner" />
                <span className="toggle-switch-switch" />
              </label>
            </div>
            <div className="mode-label-container">
              <span className={`mode-label ${selectedTestMode === 'test' ? 'active' : ''}`}>Test</span>
              <div className="tooltip">
                <div className="tooltip-content">
                  <strong>Test Mode</strong><br />
                  • Continuous testing<br />
                  • No pauses between passages<br />
                  • Final results at the end<br />
                  • Simulates real test conditions
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="subjects-grid">
          <div className="subject-card disabled">
            <div className="subject-icon">📚</div>
            <h3>English</h3>
            <p>Grammar, punctuation, and rhetorical skills</p>
            <div className="subject-badge coming-soon">Coming Soon</div>
          </div>

          <div className="subject-card disabled">
            <div className="subject-icon">🔢</div>
            <h3>Math</h3>
            <p>Algebra, geometry, and trigonometry</p>
            <div className="subject-badge coming-soon">Coming Soon</div>
          </div>

          <div className="subject-card available" onClick={() => handleSubjectSelect('Reading')}>
            <div className="subject-icon">📖</div>
            <h3>Reading</h3>
            <p>Comprehension and analysis of prose</p>
            <div className="subject-badge">Available</div>
          </div>

          <div className="subject-card disabled">
            <div className="subject-icon">🔬</div>
            <h3>Science</h3>
            <p>Scientific reasoning and data interpretation</p>
            <div className="subject-badge coming-soon">Coming Soon</div>
          </div>
        </div>
      </div>
    </div>
  );
}
