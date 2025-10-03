-- Add analytics fields to existing test_attempts table
-- Run this in your Supabase SQL Editor

-- Add analytics fields to test_attempts table
ALTER TABLE test_attempts 
ADD COLUMN IF NOT EXISTS question_times JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS question_types JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS passage_type TEXT,
ADD COLUMN IF NOT EXISTS reading_time INTEGER,
ADD COLUMN IF NOT EXISTS answering_time INTEGER;

-- Add analytics fields to passages table
ALTER TABLE passages 
ADD COLUMN IF NOT EXISTS passage_type TEXT,
ADD COLUMN IF NOT EXISTS word_count INTEGER,
ADD COLUMN IF NOT EXISTS estimated_reading_time INTEGER,
ADD COLUMN IF NOT EXISTS topic TEXT,
ADD COLUMN IF NOT EXISTS genre TEXT;

-- Create indexes for better query performance on new fields
CREATE INDEX IF NOT EXISTS idx_test_attempts_passage_type ON test_attempts(passage_type);
CREATE INDEX IF NOT EXISTS idx_passages_passage_type ON passages(passage_type);
CREATE INDEX IF NOT EXISTS idx_passages_topic ON passages(topic);





