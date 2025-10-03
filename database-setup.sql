-- ACT Test Prep Database Setup
-- Run this SQL in your Supabase SQL Editor

-- IMPORTANT: Make sure Authentication is enabled in Supabase
-- Go to Authentication > Settings and enable Email provider

-- Drop existing tables if they exist (be careful in production!)
DROP TABLE IF EXISTS test_attempts CASCADE;
DROP TABLE IF EXISTS test_sessions CASCADE;
DROP TABLE IF EXISTS passages CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  grade INTEGER,
  registered_at TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test sessions table  
CREATE TABLE test_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL CHECK (subject IN ('English', 'Math', 'Reading', 'Science')),
  current_passage_index INTEGER DEFAULT 0,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  is_active BOOLEAN DEFAULT true,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test attempts table (with session_id field!)
CREATE TABLE test_attempts (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  session_id TEXT REFERENCES test_sessions(id) ON DELETE CASCADE,
  passage_id TEXT NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}',
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL,
  time_spent INTEGER NOT NULL DEFAULT 0,
  completed_at TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- ACT scoring fields
  raw_score INTEGER,
  scaled_score INTEGER,
  percentile INTEGER,
  -- Analytics fields
  question_times JSONB DEFAULT '{}', -- questionId -> time in seconds
  question_types JSONB DEFAULT '{}', -- questionId -> questionType
  passage_type TEXT, -- PassageType enum
  reading_time INTEGER, -- time spent reading passage in seconds
  answering_time INTEGER -- time spent answering questions in seconds
);

-- Passages table (for admin-uploaded content)
CREATE TABLE passages (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  subject TEXT NOT NULL CHECK (subject IN ('English', 'Math', 'Reading', 'Science')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  questions JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Analytics fields
  passage_type TEXT, -- PassageType enum
  word_count INTEGER,
  estimated_reading_time INTEGER, -- in seconds
  topic TEXT,
  genre TEXT
);

-- Create indexes for better query performance
CREATE INDEX idx_test_sessions_user_id ON test_sessions(user_id);
CREATE INDEX idx_test_sessions_subject ON test_sessions(subject);
CREATE INDEX idx_test_attempts_user_id ON test_attempts(user_id);
CREATE INDEX idx_test_attempts_session_id ON test_attempts(session_id);
CREATE INDEX idx_test_attempts_passage_id ON test_attempts(passage_id);
CREATE INDEX idx_passages_subject ON passages(subject);
CREATE INDEX idx_passages_is_active ON passages(is_active);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE passages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read their own data" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (true);

-- RLS Policies for test_sessions table
CREATE POLICY "Users can read their own sessions" ON test_sessions
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own sessions" ON test_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own sessions" ON test_sessions
  FOR UPDATE USING (true);

-- RLS Policies for test_attempts table
CREATE POLICY "Users can read their own attempts" ON test_attempts
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own attempts" ON test_attempts
  FOR INSERT WITH CHECK (true);

-- RLS Policies for passages table (read-only for all users)
CREATE POLICY "Anyone can read passages" ON passages
  FOR SELECT USING (true);

CREATE POLICY "Only authenticated users can insert passages" ON passages
  FOR INSERT WITH CHECK (true);

-- Insert sample test data (optional - for testing)
INSERT INTO users (id, name, email, grade, registered_at) VALUES
  ('test_user_1', 'Test Student', 'test@example.com', 11, NOW()::TEXT)
ON CONFLICT (id) DO NOTHING;

-- Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for passages table
CREATE TRIGGER update_passages_updated_at BEFORE UPDATE ON passages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (if needed)
GRANT ALL ON users TO anon, authenticated;
GRANT ALL ON test_sessions TO anon, authenticated;
GRANT ALL ON test_attempts TO anon, authenticated;
GRANT ALL ON passages TO anon, authenticated;

-- Show table structures for verification
SELECT 'Database setup complete!' as status;
SELECT 'Tables created: users, test_sessions, test_attempts, passages' as info;
