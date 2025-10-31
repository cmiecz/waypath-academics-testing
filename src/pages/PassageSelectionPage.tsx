import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../api/supabase';
import { Passage } from '../types/act';
import { useTestStore } from '../hooks/useTestStore';
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
      const selectedPassageData = passages.filter(p => selectedPassages.includes(p.id));
      setTestPassages(selectedPassageData);

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
            {passages.map(passage => (
              <div 
                key={passage.id} 
                className={`passage-card ${selectedPassages.includes(passage.id) ? 'selected' : ''}`}
                onClick={() => handlePassageToggle(passage.id)}
              >
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
                <div className="selection-indicator">
                  {selectedPassages.includes(passage.id) ? <><i className="fas fa-check"></i> Selected</> : 'Click to select'}
                </div>
              </div>
            ))}
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
