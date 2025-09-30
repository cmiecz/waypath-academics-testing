import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabase';
import { Passage, Question } from '../types/act';
import { signOut } from '../api/auth';
import { useTestStore } from '../hooks/useTestStore';
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
          options: {
            A: fields[2].trim(),
            B: fields[3].trim(),
            C: fields[4].trim(),
            D: fields[5].trim()
          },
          correctAnswer: fields[6].trim().toUpperCase() as 'A' | 'B' | 'C' | 'D',
          explanation: fields[7]?.trim() || 'No explanation provided.'
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

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <div className="header-left">
            <h1>📚 Passage Management</h1>
            <p>Upload new passages and questions to the database</p>
          </div>
          <div className="header-actions">
            <button onClick={handleBackToApp} className="btn-back">
              ← Back to Admin
            </button>
            <button onClick={handleSignOut} className="btn-secondary">
              Sign Out
            </button>
          </div>
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
                <li><code>Question Text</code> - The question text</li>
                <li><code>Option A</code> - Answer choice A</li>
                <li><code>Option B</code> - Answer choice B</li>
                <li><code>Option C</code> - Answer choice C</li>
                <li><code>Option D</code> - Answer choice D</li>
                <li><code>Correct Answer</code> - The correct answer (A, B, C, or D)</li>
                <li><code>Explanation</code> - Explanation for the answer (optional)</li>
              </ol>
              
              <strong>Example CSV:</strong>
              <pre>{`Question Number,Question Text,Option A,Option B,Option C,Option D,Correct Answer,Explanation
1,"[1] For now, I stopped worrying about work and felt everything would be okay. Which transition best introduces this sentence?","No Change","Now and then","Later","Occasionally","A","'For now' signals a temporary emotional shift that fits the context."
2,"[2] The children, whose eyes sparkled with delight, sat quietly in the back seat. Which choice correctly uses a possessive pronoun?","No Change","they have","whom have","who's","A","'Whose' is the correct possessive form of 'who'."`}</pre>
            </div>
          </div>

          <div className="format-card">
            <h3>💡 Tips</h3>
            <ul>
              <li>Use quotes around text that contains commas</li>
              <li>Question numbers should be sequential (1, 2, 3...)</li>
              <li>Correct answers must be exactly A, B, C, or D</li>
              <li>Passage text can reference questions with [1], [2], etc.</li>
              <li>All fields are required except Explanation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
