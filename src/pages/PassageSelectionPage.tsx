import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../api/supabase';
import { Passage } from '../types/act';
import { useTestStore } from '../hooks/useTestStore';
import { testStore } from '../store/testStore';
import './PassageSelectionPage.css';

interface LocationState {
  subject: 'English' | 'Math' | 'Reading' | 'Science';
  testMode: 'practice' | 'test';
}

export default function PassageSelectionPage() {
  const [passages, setPassages] = useState<Passage[]>([]);
  const [selectedPassages, setSelectedPassages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savedSessionInfo, setSavedSessionInfo] = useState<{
    passageId: string;
    questionIndex: number;
    answersCount: number;
  } | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { startTestSession, setPassages: setTestPassages, currentUser } = useTestStore();

  const { subject, testMode } = location.state as LocationState || { subject: 'Reading', testMode: 'practice' };

  const loadPassages = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Loading passages for subject:', subject);
      
      const { data, error } = await supabase
        .from('passages')
        .select('*')
        .eq('subject', subject)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      console.log('Supabase response:', { data, error });

      if (error) {
        console.error('Error loading passages:', error);
        setError('Failed to load passages');
        return;
      }

      if (data && data.length > 0) {
        console.log('Found passages:', data.length);
        const formattedPassages: Passage[] = data.map(p => ({
          id: p.id,
          title: p.title,
          content: p.content,
          subject: p.subject,
          difficulty: p.difficulty,
          questions: p.questions || [],
          is_active: p.is_active
        }));
        setPassages(formattedPassages);
        setError(''); // Clear any previous errors
      } else {
        console.log('No passages found for subject:', subject);
        setError('No passages available for this subject');
      }
    } catch (err) {
      console.error('Error loading passages:', err);
      setError('Failed to load passages');
    } finally {
      setLoading(false);
    }
  }, [subject]);

  // Check for saved session matching this subject
  useEffect(() => {
    try {
      const saved = localStorage.getItem('act_prep_saved_session');
      if (saved) {
        const savedState = JSON.parse(saved);
        // Check if saved session is for this subject and has a passage ID
        if (savedState.subject === subject && savedState.passageId) {
          setSavedSessionInfo({
            passageId: savedState.passageId,
            questionIndex: savedState.currentQuestionIndex || 0,
            answersCount: Object.keys(savedState.answers || {}).length
          });
        } else {
          setSavedSessionInfo(null);
        }
      } else {
        setSavedSessionInfo(null);
      }
    } catch (error) {
      console.error('Error checking saved session:', error);
      setSavedSessionInfo(null);
    }
  }, [subject, passages]);

  useEffect(() => {
    // Check if user is logged in
    if (!currentUser) {
      navigate('/');
      return;
    }
    loadPassages();
  }, [subject, currentUser, navigate, loadPassages]);

  const handlePassageToggle = (passageId: string) => {
    setSelectedPassages(prev => 
      prev.includes(passageId) 
        ? prev.filter(id => id !== passageId)
        : [...prev, passageId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPassages.length === passages.length) {
      setSelectedPassages([]);
    } else {
      setSelectedPassages(passages.map(p => p.id));
    }
  };

  const handleResumeTest = async () => {
    if (!currentUser) {
      setError('Please log in to resume test');
      return;
    }

    try {
      // Resume existing session - use saved passages if available
      const saved = localStorage.getItem('act_prep_saved_session');
      if (saved) {
        const savedState = JSON.parse(saved);
        
        // Try to restore passages from saved state or use selected passages
        if (passages.length > 0) {
          // For now, use all passages (or we could save passage IDs in the future)
          setTestPassages(passages);
        }

        // Resume session (will reuse session ID from saved state)
        startTestSession(subject);
        
        // Navigate to test with mode information
        navigate('/test', { state: { testMode } });
      }
    } catch (error) {
      console.error('Error resuming test:', error);
      setError('Failed to resume test');
    }
  };

  const handleStartOver = (passageId?: string) => {
    // Clear saved session
    testStore.clearSavedSession();
    if (passageId === savedSessionInfo?.passageId) {
      setSavedSessionInfo(null);
    }
    setError('');
  };

  const handleStartTest = async () => {
    if (selectedPassages.length === 0) {
      setError('Please select at least one passage');
      return;
    }

    if (!currentUser) {
      setError('Please log in to start a test');
      return;
    }

    try {
      // Clear any existing saved session when starting new
      testStore.clearSavedSession();
      
      const selectedPassageData = passages.filter(p => selectedPassages.includes(p.id));
      setTestPassages(selectedPassageData);

      // Start new session (cleared saved state, so will create new session ID)
      startTestSession(subject);
      
      // Navigate to test with mode information
      navigate('/test', { state: { testMode } });
    } catch (error) {
      console.error('Error starting test:', error);
      setError('Failed to start test');
    }
  };

  const handleBack = () => {
    navigate('/test-selection');
  };

  if (loading) {
    return (
      <div className="passage-selection-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading passages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="passage-selection-page">
      <div className="passage-selection-container">
        <div className="selection-header">
          <button onClick={handleBack} className="btn-back">
            ← Back
          </button>
          <div className="header-content">
            <h1>Select Passages</h1>
            <p>{subject} - {testMode === 'practice' ? 'Practice Mode' : 'Test Mode'}</p>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="passage-selection-content">
          <div className="selection-controls">
            <div className="selection-info">
              <span>{selectedPassages.length} of {passages.length} passages selected</span>
            </div>
            <button 
              onClick={handleSelectAll}
              className="btn-select-all"
            >
              {selectedPassages.length === passages.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="passages-grid">
            {passages.map(passage => {
              const hasIncompleteSession = savedSessionInfo?.passageId === passage.id;
              return (
                <div 
                  key={passage.id} 
                  className={`passage-card ${selectedPassages.includes(passage.id) ? 'selected' : ''} ${hasIncompleteSession ? 'has-incomplete' : ''}`}
                  onClick={() => !hasIncompleteSession && handlePassageToggle(passage.id)}
                >
                  {hasIncompleteSession && (
                    <div className="incomplete-ribbon">
                      <span className="ribbon-icon"><i className="fas fa-clock"></i></span>
                      <span className="ribbon-text">Incomplete Session</span>
                    </div>
                  )}
                  <div className="passage-header">
                    <h3>{passage.title}</h3>
                    <div className="passage-meta">
                      <span className="difficulty-badge">{passage.difficulty}</span>
                      <span className="questions-count">{passage.questions.length} questions</span>
                    </div>
                  </div>
                  <div className="passage-preview">
                    {passage.content.substring(0, 150)}...
                  </div>
                  {hasIncompleteSession ? (
                    <div className="incomplete-actions">
                      <div className="incomplete-info">
                        <span>{savedSessionInfo.answersCount} answered</span>
                        {savedSessionInfo.questionIndex > 0 && (
                          <span>• Question {savedSessionInfo.questionIndex + 1}</span>
                        )}
                      </div>
                      <div className="incomplete-buttons">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResumeTest();
                          }}
                          className="btn-resume-small"
                        >
                          <i className="fas fa-play"></i> Resume
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartOver(passage.id);
                          }}
                          className="btn-start-over-small"
                        >
                          <i className="fas fa-redo"></i> Start Over
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="selection-indicator">
                      {selectedPassages.includes(passage.id) ? <><i className="fas fa-check"></i> Selected</> : 'Click to select'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {passages.length === 0 && !loading && (
            <div className="empty-state">
              <div className="empty-icon"><i className="fas fa-books"></i></div>
              <h2>No Passages Available</h2>
              <p>No passages have been uploaded for {subject} yet.</p>
            </div>
          )}
        </div>

        <div className="selection-footer">
          <button 
            onClick={handleStartTest}
            disabled={selectedPassages.length === 0}
            className="btn-start-test"
          >
            Start {testMode === 'practice' ? 'Practice' : 'Test'} ({selectedPassages.length} passages)
          </button>
        </div>
      </div>
    </div>
  );
}
