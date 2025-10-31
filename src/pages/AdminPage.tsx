import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabase';
import { Passage, Question } from '../types/act';
import { signOut } from '../api/auth';
import { useTestStore } from '../hooks/useTestStore';
import { generatePassageWithQuestions } from '../api/ai';
import './AdminPage.css';

export default function AdminPage() {
  const [passageText, setPassageText] = useState('');
  const [passageTitle, setPassageTitle] = useState('');
  const [passageSubject, setPassageSubject] = useState<'English' | 'Math' | 'Reading' | 'Science'>('English');
  const [passageDifficulty, setPassageDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [csvContent, setCsvContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // AI Generation states
  const [aiSubject, setAiSubject] = useState<'English' | 'Math' | 'Reading' | 'Science'>('English');
  const [aiDifficulty, setAiDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiSuccess, setAiSuccess] = useState('');
  const [generatedPassage, setGeneratedPassage] = useState<Passage | null>(null);
  const [showGeneratedPreview, setShowGeneratedPreview] = useState(false);
  
  const navigate = useNavigate();
  const { setUser } = useTestStore();

  const handlePassageFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setPassageText(content);
      };
      reader.readAsText(file);
    }
  };

  const handleCsvFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCsvContent(content);
      };
      reader.readAsText(file);
    }
  };

  const parseCsvQuestions = (csvText: string): Question[] => {
    const lines = csvText.trim().split('\n');
    const questions: Question[] = [];
    
    // Skip header row
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Parse CSV line (handle commas within quotes)
      const fields = parseCsvLine(line);
      
      if (fields.length >= 7) {
        const question: Question = {
          id: `q${i}`,
          questionNumber: parseInt(fields[0]) || i,
          text: fields[1].trim(),
          // Optional: Easy text (tutoring help) and Hard text (actual question)
          easyText: fields[2]?.trim() || undefined,
          hardText: fields[3]?.trim() || fields[1].trim(), // Use default text if hardText not provided
          options: {
            A: fields[4].trim(),
            B: fields[5].trim(),
            C: fields[6].trim(),
            D: fields[7].trim()
          },
          correctAnswer: fields[8].trim().toUpperCase() as 'A' | 'B' | 'C' | 'D',
          explanation: fields[9]?.trim() || 'No explanation provided.',
          // Optional questionType (defaults to 'detail' if not provided)
          questionType: fields[10]?.trim() as any || 'detail'
        };
        questions.push(question);
      }
    }
    
    return questions;
  };

  const parseCsvLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current);
    return result;
  };

  const handleSubmit = async () => {
    if (!passageText.trim() || !passageTitle.trim() || !csvContent.trim()) {
      setError('Please provide passage text, title, and questions CSV');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Parse questions from CSV
      const questions = parseCsvQuestions(csvContent);
      
      if (questions.length === 0) {
        throw new Error('No valid questions found in CSV');
      }

      // Create passage object
      const passage: Passage = {
        id: `passage_${Date.now()}`,
        title: passageTitle.trim(),
        content: passageText.trim(),
        subject: passageSubject,
        difficulty: passageDifficulty,
        questions: questions,
        is_active: true
      };

      // Save to database
      const { error: dbError } = await supabase
        .from('passages')
        .insert({
          id: passage.id,
          title: passage.title,
          content: passage.content,
          subject: passage.subject,
          difficulty: passage.difficulty,
          questions: passage.questions,
          is_active: passage.is_active
        });

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }

      setSuccess(`Successfully uploaded passage "${passage.title}" with ${questions.length} questions!`);
      
      // Clear form
      setPassageText('');
      setPassageTitle('');
      setCsvContent('');
      
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload passage');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToApp = () => {
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

  const handleGeneratePassage = async () => {
    setAiLoading(true);
    setAiError('');
    setAiSuccess('');
    setGeneratedPassage(null);
    setShowGeneratedPreview(false);

    try {
      const passage = await generatePassageWithQuestions({
        subject: aiSubject,
        difficulty: aiDifficulty
      });

      setGeneratedPassage(passage);
      setShowGeneratedPreview(true);
      
      // Pre-fill the manual upload form with generated content for editing
      setPassageTitle(passage.title);
      setPassageText(passage.content);
      setPassageSubject(passage.subject);
      setPassageDifficulty(passage.difficulty);
      
      // Convert questions to CSV format for editing
      const csvRows = ['Question Number,Default Text,Easy Text (Tutor Help),Hard Text (Actual),Option A,Option B,Option C,Option D,Correct Answer,Explanation,Question Type'];
      passage.questions.forEach(q => {
        const row = [
          q.questionNumber,
          `"${q.text.replace(/"/g, '""')}"`,
          q.easyText ? `"${q.easyText.replace(/"/g, '""')}"` : '',
          q.hardText ? `"${q.hardText.replace(/"/g, '""')}"` : '',
          `"${q.options.A.replace(/"/g, '""')}"`,
          `"${q.options.B.replace(/"/g, '""')}"`,
          `"${q.options.C.replace(/"/g, '""')}"`,
          `"${q.options.D.replace(/"/g, '""')}"`,
          q.correctAnswer,
          `"${q.explanation.replace(/"/g, '""')}"`,
          q.questionType || 'detail'
        ];
        csvRows.push(row.join(','));
      });
      setCsvContent(csvRows.join('\n'));

      setAiSuccess(`Successfully generated passage "${passage.title}" with ${passage.questions.length} questions!`);
    } catch (err: any) {
      console.error('AI generation error:', err);
      setAiError(err.message || 'Failed to generate passage. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveGeneratedPassage = async () => {
    if (!generatedPassage) {
      setAiError('No generated passage to save');
      return;
    }

    setAiLoading(true);
    setAiError('');
    setAiSuccess('');

    try {
      const { error: dbError } = await supabase
        .from('passages')
        .insert({
          id: generatedPassage.id,
          title: generatedPassage.title,
          content: generatedPassage.content,
          subject: generatedPassage.subject,
          difficulty: generatedPassage.difficulty,
          questions: generatedPassage.questions,
          is_active: false, // Default to inactive for admin review
          word_count: generatedPassage.wordCount,
          estimated_reading_time: generatedPassage.estimatedReadingTime,
          passage_type: generatedPassage.passageType,
          topic: generatedPassage.topic
        });

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }

      setAiSuccess(`Passage "${generatedPassage.title}" saved successfully! It is set to inactive - you can activate it in Passage Management.`);
      setGeneratedPassage(null);
      setShowGeneratedPreview(false);
    } catch (err: any) {
      console.error('Save error:', err);
      setAiError(err.message || 'Failed to save passage');
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateAnother = () => {
    setGeneratedPassage(null);
    setShowGeneratedPreview(false);
    setAiSuccess('');
    handleGeneratePassage();
  };

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <div className="header-left">
            <h1><i className="fas fa-books"></i> Passage Management</h1>
            <p>Upload new passages and questions to the database</p>
          </div>
          <div className="header-actions">
            <button onClick={handleBackToApp} className="btn-back">
              <i className="fas fa-arrow-left"></i> Back to Admin
            </button>
            <button onClick={handleSignOut} className="btn-secondary">
              <i className="fas fa-sign-out-alt"></i> Sign Out
            </button>
          </div>
        </div>

        {/* AI Generation Section */}
        <div className="upload-section" style={{ marginBottom: '2rem' }}>
          <h2><i className="fas fa-robot"></i> Generate Passage with AI</h2>
          <p style={{ marginBottom: '1.5rem', color: '#666' }}>
            Use AI to automatically generate a complete passage with questions. The generated passage will be set to inactive so you can review it before making it available to students.
          </p>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="ai-subject">Subject</label>
              <select
                id="ai-subject"
                value={aiSubject}
                onChange={(e) => setAiSubject(e.target.value as any)}
                disabled={aiLoading}
              >
                <option value="English">English</option>
                <option value="Math">Math</option>
                <option value="Reading">Reading</option>
                <option value="Science">Science</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="ai-difficulty">Difficulty</label>
              <select
                id="ai-difficulty"
                value={aiDifficulty}
                onChange={(e) => setAiDifficulty(e.target.value as any)}
                disabled={aiLoading}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          {aiError && <div className="error-message">{aiError}</div>}
          {aiSuccess && <div className="success-message">{aiSuccess}</div>}

          {!showGeneratedPreview && (
            <button 
              onClick={handleGeneratePassage} 
              className="btn-submit"
              disabled={aiLoading}
              style={{ backgroundColor: '#667eea', marginTop: '1rem' }}
            >
              {aiLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Generating Passage...
                </>
              ) : (
                <>
                  <i className="fas fa-magic"></i> Generate Passage
                </>
              )}
            </button>
          )}

          {showGeneratedPreview && generatedPassage && (
            <div style={{ 
              marginTop: '2rem', 
              padding: '1.5rem', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '8px',
              border: '2px solid #667eea'
            }}>
              <h3 style={{ marginTop: 0, color: '#667eea' }}>
                <i className="fas fa-eye"></i> Generated Passage Preview
              </h3>
              
              <div style={{ marginBottom: '1rem' }}>
                <strong>Title:</strong> {generatedPassage.title}
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <strong>Subject:</strong> {generatedPassage.subject} | 
                <strong> Difficulty:</strong> {generatedPassage.difficulty} | 
                <strong> Questions:</strong> {generatedPassage.questions.length}
              </div>

              <div style={{ 
                marginBottom: '1rem',
                padding: '1rem',
                backgroundColor: 'white',
                borderRadius: '4px',
                maxHeight: '200px',
                overflowY: 'auto',
                fontSize: '0.9rem',
                lineHeight: '1.5'
              }}>
                <strong>Passage Content (first 500 chars):</strong>
                <div style={{ marginTop: '0.5rem' }}>
                  {generatedPassage.content.substring(0, 500)}...
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button 
                  onClick={handleSaveGeneratedPassage} 
                  className="btn-submit"
                  disabled={aiLoading}
                  style={{ backgroundColor: '#48bb78' }}
                >
                  {aiLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save"></i> Save Generated Passage
                    </>
                  )}
                </button>

                <button 
                  onClick={handleGenerateAnother} 
                  className="btn-submit"
                  disabled={aiLoading}
                  style={{ backgroundColor: '#667eea' }}
                >
                  <i className="fas fa-redo"></i> Generate Another Passage
                </button>

                <button 
                  onClick={() => {
                    setShowGeneratedPreview(false);
                    setGeneratedPassage(null);
                  }} 
                  className="btn-secondary"
                  disabled={aiLoading}
                >
                  <i className="fas fa-times"></i> Cancel
                </button>
              </div>

              <p style={{ 
                marginTop: '1rem', 
                fontSize: '0.85rem', 
                color: '#666',
                fontStyle: 'italic'
              }}>
                Note: The generated content has been pre-filled in the manual upload form below. You can edit it there before saving, or save the generated version directly above.
              </p>
            </div>
          )}
        </div>

        <div className="upload-section">
          <h2>Upload New Passage</h2>
          
          {/* Passage Details */}
          <div className="form-group">
            <label htmlFor="title">Passage Title</label>
            <input
              id="title"
              type="text"
              value={passageTitle}
              onChange={(e) => setPassageTitle(e.target.value)}
              placeholder="Enter passage title"
              disabled={loading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <select
                id="subject"
                value={passageSubject}
                onChange={(e) => setPassageSubject(e.target.value as any)}
                disabled={loading}
              >
                <option value="English">English</option>
                <option value="Math">Math</option>
                <option value="Reading">Reading</option>
                <option value="Science">Science</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="difficulty">Difficulty</label>
              <select
                id="difficulty"
                value={passageDifficulty}
                onChange={(e) => setPassageDifficulty(e.target.value as any)}
                disabled={loading}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Passage Text Upload */}
          <div className="form-group">
            <label htmlFor="passage-file">Passage Text (.txt file)</label>
            <input
              id="passage-file"
              type="file"
              accept=".txt"
              onChange={handlePassageFileUpload}
              disabled={loading}
            />
            <div className="file-info">
              <small>Upload a .txt file containing the passage text</small>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="passage-text">Passage Text (or paste here)</label>
            <textarea
              id="passage-text"
              value={passageText}
              onChange={(e) => setPassageText(e.target.value)}
              placeholder="Paste passage text here or upload a .txt file"
              rows={8}
              disabled={loading}
            />
          </div>

          {/* Questions CSV Upload */}
          <div className="form-group">
            <label htmlFor="csv-file">Questions CSV (.csv file)</label>
            <input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleCsvFileUpload}
              disabled={loading}
            />
            <div className="file-info">
              <small>Upload a .csv file with questions in the required format</small>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="csv-content">Questions CSV (or paste here)</label>
            <textarea
              id="csv-content"
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              placeholder="Paste CSV content here or upload a .csv file"
              rows={6}
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button 
            onClick={handleSubmit} 
            className="btn-submit"
            disabled={loading}
          >
            {loading ? 'Uploading...' : 'Upload Passage'}
          </button>
        </div>

        {/* Format Instructions */}
        <div className="format-section">
          <h2>📋 Required Formats</h2>
          
          <div className="format-card">
            <h3>Passage Text (.txt)</h3>
            <p>Plain text file containing the passage content. Can include line breaks and formatting.</p>
            <div className="format-example">
              <strong>Example:</strong>
              <pre>{`Driving along Route 66, I felt the vibrations shift beneath my tires as the road began to hum. The melody was faint at first, then grew louder, resonating through the car like a lullaby composed by the desert itself.

[1] For now, I stopped worrying about work and felt everything would be okay. The children in the back seat sat quietly, their eyes wide with wonder.`}</pre>
            </div>
          </div>

          <div className="format-card">
            <h3>Questions CSV (.csv)</h3>
            <p>CSV file with the following columns (in order):</p>
            <div className="format-example">
              <strong>Required columns:</strong>
              <ol>
                <li><code>Question Number</code> - The question number (1, 2, 3...)</li>
                <li><code>Default Question Text</code> - The default question text (fallback)</li>
                <li><code>Easy Text (Tutor Help)</code> - Tutoring help version: explicitly names grammar rule (optional)</li>
                <li><code>Hard Text (Actual Question)</code> - The actual test question: broad/interpretive (optional, defaults to Default Text)</li>
                <li><code>Option A</code> - Answer choice A</li>
                <li><code>Option B</code> - Answer choice B</li>
                <li><code>Option C</code> - Answer choice C</li>
                <li><code>Option D</code> - Answer choice D</li>
                <li><code>Correct Answer</code> - The correct answer (A, B, C, or D)</li>
                <li><code>Explanation</code> - Explanation for the answer (optional)</li>
                <li><code>Question Type</code> - Type like detail, inference, structure, etc. (optional)</li>
              </ol>
              
              <strong>Note:</strong> In Practice Mode, students can toggle between the actual question (Hard Text) and tutoring help (Easy Text) using the "Need Help?" button.
              
              <strong>Example CSV:</strong>
              <pre>{`Question Number,Default Text,Easy Text (Tutor Help),Hard Text (Actual),Option A,Option B,Option C,Option D,Correct Answer,Explanation,Question Type
1,"Which transition best introduces this sentence?","Which transitional phrase correctly indicates a temporary time period?","Which choice is most effective?","No Change","Now and then","Later","Occasionally","A","'For now' signals a temporary emotional shift.","structure"
2,"Which choice uses a possessive pronoun?","Which choice correctly uses a possessive pronoun to show ownership?","Which choice is correct?","No Change","they have","whom have","who's","A","'Whose' is the correct possessive pronoun.","vocabulary"`}</pre>
            </div>
          </div>

          <div className="format-card">
            <h3>💡 Tips</h3>
            <ul>
              <li>Use quotes around text that contains commas</li>
              <li>Question numbers should be sequential (1, 2, 3...)</li>
              <li>Correct answers must be exactly A, B, C, or D</li>
              <li>Passage text can reference questions with [1], [2], etc.</li>
              <li>Only Question Number, Default Text, Options A-D, and Correct Answer are required</li>
              <li><strong>Difficulty versions:</strong> Provide three text versions for adaptive difficulty:
                <ul>
                  <li><strong>Easy:</strong> Explicitly names the grammar rule (e.g., "Which choice maintains subject-verb agreement?")</li>
                  <li><strong>Medium:</strong> Moderately specific (e.g., "Which choice maintains proper grammar?")</li>
                  <li><strong>Hard:</strong> Broad/interpretive (e.g., "Which choice is most effective?")</li>
                </ul>
              </li>
              <li><strong>Question types:</strong> detail, inference, main-idea, author-purpose, vocabulary, tone, structure, comparison, cause-effect, sequence, generalization, evaluation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
