import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabase';
import { Passage, Question } from '../types/act';
import { signOut } from '../api/auth';
import { useTestStore } from '../hooks/useTestStore';
import './PassageManagementPage.css';

export default function PassageManagementPage() {
  const [passages, setPassages] = useState<Passage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingPassage, setEditingPassage] = useState<Passage | null>(null);
  const [editablePassage, setEditablePassage] = useState<Passage | null>(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useTestStore();

  useEffect(() => {
    loadPassages();
  }, []);

  const loadPassages = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('Loading passages for admin...');
      const { data, error: dbError } = await supabase
        .from('passages')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Admin passages loaded:', { data, error: dbError });
      
      if (data) {
        console.log('Passage IDs and status:', data.map(p => ({ id: p.id, title: p.title, is_active: p.is_active })));
      }

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }

      setPassages(data || []);
    } catch (err: any) {
      console.error('Error loading passages:', err);
      setError(err.message || 'Failed to load passages');
    } finally {
      setLoading(false);
    }
  };

  const togglePassageStatus = async (passageId: string, currentStatus: boolean) => {
    try {
      console.log('Toggling passage status:', { passageId, currentStatus, newStatus: !currentStatus });
      
      // First, let's check if the passage exists
      const { data: checkData, error: checkError } = await supabase
        .from('passages')
        .select('id, title, is_active')
        .eq('id', passageId);
      
      console.log('Passage check result:', { checkData, checkError });
      
      if (!checkData || checkData.length === 0) {
        console.error('Passage not found in database!');
        setError('Passage not found in database');
        return;
      }
      
      console.log('Found passage:', checkData[0]);
      
      // Update the passage (direct update works, .select() is blocked by RLS)
      const { error: updateError } = await supabase
        .from('passages')
        .update({ is_active: !currentStatus })
        .eq('id', passageId);

      console.log('Update result:', { error: updateError });

      if (updateError) {
        throw new Error(`Database error: ${updateError.message}`);
      }

      // Verify the update actually worked by checking the passage again
      const { data: verifyData, error: verifyError } = await supabase
        .from('passages')
        .select('id, title, is_active')
        .eq('id', passageId);
      
      console.log('Verification result:', { verifyData, verifyError });
      
      if (verifyData && verifyData.length > 0) {
        console.log('Passage after update:', verifyData[0]);
        if (verifyData[0].is_active === currentStatus) {
          console.error('Update failed - status did not change!');
          setError('Failed to update passage status');
          return;
        }
      }

      // Update local state
      setPassages(prevPassages =>
        prevPassages.map(passage =>
          passage.id === passageId
            ? { ...passage, is_active: !currentStatus }
            : passage
        )
      );

      setSuccess(`Passage ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error toggling passage status:', err);
      setError(err.message || 'Failed to update passage status');
      setTimeout(() => setError(''), 5000);
    }
  };

  const deletePassage = async (passageId: string, passageTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${passageTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error: dbError } = await supabase
        .from('passages')
        .delete()
        .eq('id', passageId);

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }

      // Update local state
      setPassages(prevPassages =>
        prevPassages.filter(passage => passage.id !== passageId)
      );

      setSuccess(`Passage "${passageTitle}" deleted successfully!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error deleting passage:', err);
      setError(err.message || 'Failed to delete passage');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleBackToAdmin = () => {
    navigate('/admin');
  };

  const handleAddNewPassage = () => {
    navigate('/admin/passage-management');
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

  const handleEditPassage = (passage: Passage) => {
    setEditingPassage(passage);
    setEditablePassage(JSON.parse(JSON.stringify(passage))); // Deep copy for editing
  };

  const handleCancelEdit = () => {
    setEditingPassage(null);
    setEditablePassage(null);
  };

  const updateEditablePassage = (updates: Partial<Passage>) => {
    if (editablePassage) {
      setEditablePassage({ ...editablePassage, ...updates });
    }
  };

  const updateQuestion = (questionIndex: number, questionUpdates: Partial<Question>) => {
    if (editablePassage) {
      const updatedQuestions = [...editablePassage.questions];
      updatedQuestions[questionIndex] = { ...updatedQuestions[questionIndex], ...questionUpdates };
      setEditablePassage({ ...editablePassage, questions: updatedQuestions });
    }
  };

  const updateQuestionOption = (questionIndex: number, option: 'A' | 'B' | 'C' | 'D', value: string) => {
    if (editablePassage) {
      const updatedQuestions = [...editablePassage.questions];
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        options: {
          ...updatedQuestions[questionIndex].options,
          [option]: value
        }
      };
      setEditablePassage({ ...editablePassage, questions: updatedQuestions });
    }
  };

  const handleSaveEditedPassage = async () => {
    if (!editablePassage) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Recalculate word count if content was edited
      const wordCount = editablePassage.content.split(/\s+/).filter(Boolean).length;
      const estimatedReadingTime = Math.ceil(wordCount / 200) * 60;

      const { error: dbError } = await supabase
        .from('passages')
        .update({
          title: editablePassage.title,
          content: editablePassage.content,
          subject: editablePassage.subject,
          difficulty: editablePassage.difficulty,
          questions: editablePassage.questions,
          word_count: wordCount,
          estimated_reading_time: estimatedReadingTime,
          passage_type: editablePassage.passageType,
          topic: editablePassage.topic,
          updated_at: new Date().toISOString()
        })
        .eq('id', editablePassage.id);

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }

      // Update local state
      setPassages(prevPassages =>
        prevPassages.map(passage =>
          passage.id === editablePassage.id
            ? { ...editablePassage, updated_at: new Date().toISOString() }
            : passage
        )
      );

      setSuccess(`Passage "${editablePassage.title}" updated successfully!`);
      setTimeout(() => setSuccess(''), 3000);
      setEditingPassage(null);
      setEditablePassage(null);
    } catch (err: any) {
      console.error('Save error:', err);
      setError(err.message || 'Failed to save passage');
      setTimeout(() => setError(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  // Filter passages based on selected filters
  const filteredPassages = passages.filter(passage => {
    const subjectMatch = filterSubject === 'all' || passage.subject === filterSubject;
    const statusMatch = filterStatus === 'all' || 
      (filterStatus === 'active' && passage.is_active !== false) ||
      (filterStatus === 'inactive' && passage.is_active === false);
    
    return subjectMatch && statusMatch;
  });

  const getStatusBadge = (isActive: boolean | undefined) => {
    const active = isActive !== false; // Default to true if undefined
    return (
      <span className={`status-badge ${active ? 'active' : 'inactive'}`}>
        {active ? 'Active' : 'Inactive'}
      </span>
    );
  };

  const getSubjectBadge = (subject: string) => {
    const colors = {
      'English': 'bg-blue-100 text-blue-800',
      'Math': 'bg-green-100 text-green-800',
      'Reading': 'bg-purple-100 text-purple-800',
      'Science': 'bg-orange-100 text-orange-800'
    };
    
    return (
      <span className={`subject-badge ${colors[subject as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {subject}
      </span>
    );
  };

  const getDifficultyBadge = (difficulty: string) => {
    const colors = {
      'Easy': 'bg-green-100 text-green-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Hard': 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`difficulty-badge ${colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {difficulty}
      </span>
    );
  };

  return (
    <div className="passage-management-page">
      <div className="passage-management-container">
        <div className="passage-management-header">
          <div className="header-left">
            <h1><i className="fas fa-books"></i> Passage Management</h1>
            <p>Manage existing passages and their visibility to students</p>
          </div>
          <div className="header-actions">
            <button onClick={handleAddNewPassage} className="btn-primary">
              <i className="fas fa-plus"></i> Add New Passage
            </button>
            <button onClick={handleBackToAdmin} className="btn-back">
              <i className="fas fa-arrow-left"></i> Back to Admin
            </button>
            <button onClick={handleSignOut} className="btn-secondary">
              <i className="fas fa-sign-out-alt"></i> Sign Out
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filter-group">
            <label htmlFor="subject-filter">Filter by Subject:</label>
            <select
              id="subject-filter"
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
            >
              <option value="all">All Subjects</option>
              <option value="English">English</option>
              <option value="Math">Math</option>
              <option value="Reading">Reading</option>
              <option value="Science">Science</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="status-filter">Filter by Status:</label>
            <select
              id="status-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>

          <div className="filter-stats">
            <span>Showing {filteredPassages.length} of {passages.length} passages</span>
          </div>
        </div>

        {/* Messages */}
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {/* Editing View */}
        {editingPassage && editablePassage && (
          <div style={{
            marginTop: '2rem',
            padding: '1.5rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '2px solid #667eea'
          }}>
            <h2 style={{ marginTop: 0, color: '#667eea' }}>
              <i className="fas fa-edit"></i> Edit Passage: {editablePassage.title}
            </h2>

            {/* Title Editor */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label htmlFor="edit-title"><strong>Title:</strong></label>
              <input
                id="edit-title"
                type="text"
                value={editablePassage.title}
                onChange={(e) => updateEditablePassage({ title: e.target.value })}
                className="form-control"
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: '#666' }}>
              <strong>Subject:</strong> {editablePassage.subject} | 
              <strong> Difficulty:</strong> {editablePassage.difficulty} |
              <strong> Questions:</strong> {editablePassage.questions.length} |
              <strong> Word Count:</strong> {editablePassage.content.split(/\s+/).filter(Boolean).length} |
              <strong> Status:</strong> {editablePassage.is_active !== false ? 'Active' : 'Inactive'}
            </div>

            {/* Full Passage Editor */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="edit-content"><strong>Passage Content (Full Text - Editable):</strong></label>
              <textarea
                id="edit-content"
                value={editablePassage.content}
                onChange={(e) => updateEditablePassage({ content: e.target.value })}
                className="form-control"
                style={{
                  width: '100%',
                  minHeight: '300px',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem',
                  lineHeight: '1.6',
                  padding: '1rem'
                }}
              />
            </div>

            {/* Questions Editor */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ marginBottom: '1rem', color: '#667eea' }}>
                <i className="fas fa-question-circle"></i> Questions ({editablePassage.questions.length})
              </h4>

              <div style={{ maxHeight: '600px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px', padding: '1rem', backgroundColor: 'white' }}>
                {editablePassage.questions.map((question, index) => (
                  <div
                    key={question.id || index}
                    style={{
                      marginBottom: '2rem',
                      padding: '1rem',
                      border: '1px solid #e0e0e0',
                      borderRadius: '4px',
                      backgroundColor: '#fafafa'
                    }}
                  >
                    <div style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#667eea' }}>
                      Question {question.questionNumber}
                    </div>

                    {/* Default Text */}
                    <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Default Text:</label>
                      <input
                        type="text"
                        value={question.text || ''}
                        onChange={(e) => updateQuestion(index, { text: e.target.value })}
                        className="form-control"
                        style={{ fontSize: '0.9rem' }}
                      />
                    </div>

                    {/* Easy Text */}
                    <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#48bb78' }}>Easy Text (Tutor Help):</label>
                      <textarea
                        value={question.easyText || ''}
                        onChange={(e) => updateQuestion(index, { easyText: e.target.value })}
                        className="form-control"
                        style={{ fontSize: '0.9rem', minHeight: '60px' }}
                        placeholder="Explicitly names the grammar rule or concept"
                      />
                    </div>

                    {/* Hard Text */}
                    <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#e53e3e' }}>Hard Text (Actual Question):</label>
                      <textarea
                        value={question.hardText || ''}
                        onChange={(e) => updateQuestion(index, { hardText: e.target.value })}
                        className="form-control"
                        style={{ fontSize: '0.9rem', minHeight: '60px' }}
                        placeholder="Broad/interpretive format like real ACT questions"
                      />
                    </div>

                    {/* Options */}
                    <div style={{ marginBottom: '0.75rem' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Options:</label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                        {(['A', 'B', 'C', 'D'] as const).map(option => (
                          <div key={option} className="form-group" style={{ marginBottom: '0' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Option {option}:</label>
                            <input
                              type="text"
                              value={question.options[option] || ''}
                              onChange={(e) => updateQuestionOption(index, option, e.target.value)}
                              className="form-control"
                              style={{ fontSize: '0.85rem' }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Correct Answer */}
                    <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Correct Answer:</label>
                      <select
                        value={question.correctAnswer}
                        onChange={(e) => updateQuestion(index, { correctAnswer: e.target.value as 'A' | 'B' | 'C' | 'D' })}
                        className="form-control"
                        style={{ width: '100px', fontSize: '0.9rem' }}
                      >
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                      </select>
                    </div>

                    {/* Explanation */}
                    <div className="form-group" style={{ marginBottom: '0' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Explanation:</label>
                      <textarea
                        value={question.explanation || ''}
                        onChange={(e) => updateQuestion(index, { explanation: e.target.value })}
                        className="form-control"
                        style={{ fontSize: '0.9rem', minHeight: '60px' }}
                        placeholder="Why this answer is correct"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
              <button
                onClick={handleSaveEditedPassage}
                className="btn-submit"
                disabled={saving}
                style={{ backgroundColor: '#48bb78' }}
              >
                {saving ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Saving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i> Save Changes
                  </>
                )}
              </button>

              <button
                onClick={handleCancelEdit}
                className="btn-secondary"
                disabled={saving}
              >
                <i className="fas fa-times"></i> Cancel
              </button>
            </div>
          </div>
        )}

        {/* Passages List */}
        {!editingPassage && (
          <div className="passages-section">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading passages...</p>
              </div>
            ) : filteredPassages.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><i className="fas fa-book-open"></i></div>
                <h3>No passages found</h3>
                <p>
                  {passages.length === 0
                    ? "You haven't uploaded any passages yet."
                    : "No passages match your current filters."
                  }
                </p>
                {passages.length === 0 && (
                  <button onClick={handleAddNewPassage} className="btn-primary">
                    Add Your First Passage
                  </button>
                )}
              </div>
            ) : (
              <div className="passages-grid">
                {filteredPassages.map((passage) => (
                  <div
                    key={passage.id}
                    className={`passage-card ${passage.is_active !== false ? 'active' : 'inactive'}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleEditPassage(passage)}
                  >
                    <div className="passage-header">
                      <div className="passage-title">
                        <h3>{passage.title}</h3>
                        <div className="passage-badges">
                          {getSubjectBadge(passage.subject)}
                          {getDifficultyBadge(passage.difficulty)}
                          {getStatusBadge(passage.is_active)}
                        </div>
                      </div>
                      <div className="passage-actions" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => togglePassageStatus(passage.id, passage.is_active !== false)}
                          className={`btn-toggle ${passage.is_active !== false ? 'btn-deactivate' : 'btn-activate'}`}
                          title={passage.is_active !== false ? 'Deactivate for students' : 'Activate for students'}
                        >
                          {passage.is_active !== false ? '👁️‍🗨️ Hide' : '👁️ Show'}
                        </button>
                        <button
                          onClick={() => deletePassage(passage.id, passage.title)}
                          className="btn-delete"
                          title="Delete passage"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>

                    <div className="passage-content">
                      <div className="passage-preview">
                        {passage.content.length > 200
                          ? `${passage.content.substring(0, 200)}...`
                          : passage.content
                        }
                      </div>
                    </div>

                    <div className="passage-footer">
                      <div className="passage-stats">
                        <span className="stat">
                          <strong>{passage.questions?.length || 0}</strong> questions
                        </span>
                        <span className="stat">
                          Created: {new Date(passage.created_at || '').toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#667eea', textAlign: 'center', fontStyle: 'italic' }}>
                      Click to edit
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
