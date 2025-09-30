# Database Setup Instructions

## Step 1: Access Supabase SQL Editor

1. Go to https://glhwxyhhycqytfrsjzyz.supabase.co
2. Navigate to the **SQL Editor** in the left sidebar
3. Click **New Query**

## Step 2: Run the Database Setup Script

1. Open the `database-setup.sql` file in this directory
2. Copy the entire SQL script
3. Paste it into the Supabase SQL Editor
4. Click **Run** to execute the script

This will:
- Create all necessary tables (users, test_sessions, test_attempts, passages)
- Set up proper indexes for performance
- Configure Row Level Security (RLS) policies
- Add foreign key relationships
- Create sample test user (optional)

## Step 3: Verify Setup

After running the script, you should see:
```
Database setup complete!
Tables created: users, test_sessions, test_attempts, passages
```

## Step 4: Test the Application

1. Make sure the local dev server is running: `npm start`
2. Open http://localhost:3000
3. Click "Testing Mode" to skip registration
4. Start the English test
5. Answer all 16 questions in Passage 1
6. Submit the passage
7. Check the Results page - all questions should now show as answered/unanswered correctly
8. Open browser DevTools console (F12) to see detailed logging

## Troubleshooting

### If you see "unanswered" for questions you answered:

1. Check browser console for logs:
   - "Answer selected:" logs when you click an answer
   - "=== SUBMITTING PASSAGE ===" logs when you submit
   - "Results - Answers:" logs on the results page

2. Verify the question IDs match:
   - Question IDs should be: 'q1', 'q2', 'q3', etc.
   - The answers object keys should match these IDs

3. Check Supabase for saved data:
   - Go to Supabase → Table Editor
   - Check `test_attempts` table
   - Look at the `answers` column (should be a JSON object)

### If you see database errors:

1. Make sure you ran the `database-setup.sql` script
2. Check that all tables exist in Supabase
3. Verify RLS policies are enabled but not blocking inserts

## Table Structures

### users
- id (TEXT, primary key)
- name (TEXT)
- email (TEXT, unique)
- grade (INTEGER)
- registered_at (TEXT)
- created_at (TIMESTAMP)

### test_sessions
- id (TEXT, primary key)
- user_id (TEXT, foreign key → users.id)
- subject (TEXT: 'English', 'Math', 'Reading', 'Science')
- current_passage_index (INTEGER)
- started_at (TEXT)
- ended_at (TEXT, nullable)
- is_active (BOOLEAN)
- completed (BOOLEAN)
- created_at (TIMESTAMP)

### test_attempts
- id (TEXT, primary key)
- user_id (TEXT, foreign key → users.id)
- session_id (TEXT, foreign key → test_sessions.id)
- passage_id (TEXT)
- answers (JSONB - stores question_id → answer mapping)
- score (INTEGER)
- total_questions (INTEGER)
- time_spent (INTEGER)
- completed_at (TEXT)
- created_at (TIMESTAMP)

### passages
- id (TEXT, primary key)
- title (TEXT)
- content (TEXT)
- subject (TEXT)
- difficulty (TEXT)
- questions (JSONB - array of question objects)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
