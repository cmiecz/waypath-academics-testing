# ACT Test Prep Web Application

A beautiful, minimalist web application for ACT test preparation with secure authentication, timed tests, and comprehensive results tracking.

## ✨ Features

### 🔐 Authentication
- **Sign Up**: Create new accounts with email and password
- **Sign In**: Secure login for existing users
- **Password Reset**: Recover forgotten passwords via email
- **Testing Mode**: Skip authentication for development

### 📝 Test Experience
- **Timed Tests**: 35-minute countdown timer
- **English Passages**: Two passages with 16 questions each
- **One Question at a Time**: Clean, focused interface
- **75/25 Layout**: Passage (75%) and questions (25%) side-by-side
- **Progress Tracking**: See current question and completion status

### 📊 Results & Review
- **Instant Scoring**: See your score immediately after submission
- **Question Review**: Review all questions with your answers
- **Show/Hide Answers**: Toggle correct answers visibility
- **Explanations**: Detailed explanations for each question
- **Overall Stats**: Track progress across passages
- **Retake Wrong Answers**: Focus on questions you got wrong

### 🎨 Design
- **Apple Tahoe Theme**: Minimalist, professional design
- **Glassmorphism**: Modern blur effects and transparency
- **Smooth Animations**: Polished transitions and interactions
- **Responsive**: Works on all screen sizes

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Supabase account (free tier works)

### Installation

```bash
# Navigate to project directory
cd act-prep-web

# Install dependencies
npm install

# Start development server
npm start
```

The app will open at `http://localhost:3000`

## ⚙️ Supabase Setup

### Step 1: Enable Authentication

1. Go to https://glhwxyhhycqytfrsjzyz.supabase.co
2. Navigate to **Authentication** → **Providers**
3. Enable **Email** provider
4. (Optional) Disable email confirmations for faster testing

### Step 2: Create Database Tables

1. Go to **SQL Editor**
2. Copy contents of `database-setup.sql`
3. Paste and click **Run**

This creates:
- `users` table
- `test_sessions` table
- `test_attempts` table
- `passages` table
- Row Level Security policies
- Indexes for performance

### Step 3: Test the Setup

Open `http://localhost:3000` and:
1. Click "Create Account"
2. Fill in the form
3. You should be redirected to test selection

## 📖 User Guide

### Creating an Account

1. Go to `http://localhost:3000`
2. Click **"Create Account"**
3. Enter:
   - Full Name
   - Email (use a real email for password reset)
   - Password (min 6 characters)
   - Confirm Password
   - Grade Level
4. Click **"Create Account"**

### Taking a Test

1. **Sign in** to your account
2. Click **"Start English Test"**
3. Read the passage on the left
4. Answer the question on the right
5. Click **"Next"** to move to the next question
6. Click **"Submit Passage"** when done
7. Review your results

### Reviewing Results

After completing a passage:
- See your overall score and stats
- Review all questions
- Click **"Show Correct Answers"** to reveal answers
- Click **"Show Explanations"** to see detailed explanations
- Click **"Retake Wrong Answers"** to practice mistakes
- Click **"Continue to Next Passage"** to keep going

### Resetting Your Password

1. Click **"Forgot Password?"** on sign-in page
2. Enter your email
3. Click **"Send Reset Link"**
4. Check your email for the reset link
5. Click the link and enter your new password
6. Sign in with your new password

## 📁 Project Structure

```
act-prep-web/
├── src/
│   ├── api/
│   │   ├── auth.ts           # Authentication service
│   │   └── supabase.ts       # Database operations
│   ├── data/
│   │   └── mockData.ts       # Sample passages and questions
│   ├── hooks/
│   │   └── useTestStore.ts   # Global state management hook
│   ├── pages/
│   │   ├── LoginPage.tsx           # Sign in/up/forgot password
│   │   ├── ResetPasswordPage.tsx   # Password reset
│   │   ├── TestSelectionPage.tsx   # Test overview
│   │   ├── TestPage.tsx            # Take the test
│   │   └── ResultsPage.tsx         # Review results
│   ├── store/
│   │   └── testStore.ts      # Global state management
│   ├── types/
│   │   └── act.ts            # TypeScript interfaces
│   ├── App.tsx               # Main app component
│   └── index.tsx             # Entry point
├── database-setup.sql        # Supabase database schema
├── AUTHENTICATION_SETUP.md   # Authentication guide
├── DATABASE_SETUP.md         # Database guide
└── README.md                 # This file
```

## 🔧 Configuration

### Environment Variables

The Supabase credentials are currently hardcoded in `src/api/supabase.ts`. For production, move them to `.env`:

```env
REACT_APP_SUPABASE_URL=https://glhwxyhhycqytfrsjzyz.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
```

Then update `supabase.ts`:

```typescript
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;
```

## 🧪 Testing Mode

For development, you can skip authentication:

1. Click **"Testing Mode (Skip Login)"** on the sign-in page
2. You'll be logged in as a test user
3. All features work except data won't be saved to Supabase

## 📊 Database Schema

### users
- `id` (TEXT, PK) - User UUID from Supabase Auth
- `name` (TEXT) - Full name
- `email` (TEXT, unique) - Email address
- `grade` (INTEGER) - Grade level (9-12)
- `registered_at` (TEXT) - Registration timestamp

### test_sessions
- `id` (TEXT, PK) - Session UUID
- `user_id` (TEXT, FK) - References users.id
- `subject` (TEXT) - Test subject (English, Math, etc.)
- `current_passage_index` (INTEGER) - Current passage number
- `started_at` (TEXT) - Session start time
- `ended_at` (TEXT, nullable) - Session end time
- `is_active` (BOOLEAN) - Whether session is active
- `completed` (BOOLEAN) - Whether session is complete

### test_attempts
- `id` (TEXT, PK) - Attempt UUID
- `user_id` (TEXT, FK) - References users.id
- `session_id` (TEXT, FK) - References test_sessions.id
- `passage_id` (TEXT) - Passage identifier
- `answers` (JSONB) - User's answers (question_id → answer)
- `score` (INTEGER) - Number of correct answers
- `total_questions` (INTEGER) - Total questions in passage
- `time_spent` (INTEGER) - Time spent in seconds
- `completed_at` (TEXT) - Completion timestamp

## 🐛 Troubleshooting

### "Email not sent" error
- Enable Email provider in Supabase
- Check spam folder
- Disable email confirmations for testing

### "Invalid login credentials" error
- Check email and password
- Use "Forgot Password?" to reset
- Create a new account if needed

### Questions show as "unanswered" on results
- Check browser console (F12) for logs
- Verify database has `session_id` column in `test_attempts`
- Re-run `database-setup.sql` if needed

### App not loading
- Check that `npm start` is running
- Clear browser cache
- Check console for errors

## 🚢 Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd act-prep-web
vercel
```

### Deploy to Netlify

```bash
# Build the app
npm run build

# Deploy the build folder
# Drag and drop the 'build' folder to Netlify
```

## 📝 Future Enhancements

- [ ] Math, Reading, and Science sections
- [ ] Social login (Google, Apple)
- [ ] Performance analytics dashboard
- [ ] Study recommendations based on results
- [ ] Export results as PDF
- [ ] Mobile app version
- [ ] Adaptive difficulty
- [ ] Streak tracking
- [ ] Leaderboards

## 📄 License

Private project for educational use.

## 🤝 Support

For issues or questions, check:
- `AUTHENTICATION_SETUP.md` - Auth setup and troubleshooting
- `DATABASE_SETUP.md` - Database setup and schema
- Browser console (F12) - Error logs and debugging

---

**Built with ❤️ using React, TypeScript, and Supabase**