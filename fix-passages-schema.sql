-- Fix passages table schema - add missing is_active column
-- Run this in your Supabase SQL Editor

-- Add is_active column to passages table if it doesn't exist
ALTER TABLE passages 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update existing passages to be active by default
UPDATE passages 
SET is_active = true 
WHERE is_active IS NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_passages_is_active ON passages(is_active);

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'passages' 
AND column_name = 'is_active';

-- Show current passages with their status
SELECT id, title, subject, is_active, created_at 
FROM passages 
ORDER BY created_at DESC;

-- Fix RLS policies for passages table
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read passages" ON passages;
DROP POLICY IF EXISTS "Only authenticated users can insert passages" ON passages;
DROP POLICY IF EXISTS "Allow updates to passages" ON passages;

-- Create new policies
CREATE POLICY "Anyone can read passages" ON passages
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert passages" ON passages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update passages" ON passages
  FOR UPDATE USING (true);

-- Show current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'passages';
