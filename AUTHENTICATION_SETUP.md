# Authentication Setup Guide

## Overview
The ACT Test Prep app now includes a complete authentication system with:
- ✅ **Sign Up**: Create new accounts with email and password
- ✅ **Sign In**: Login with existing credentials
- ✅ **Password Reset**: Recover forgotten passwords via email
- ✅ **Testing Mode**: Skip authentication for development

## Step 1: Enable Supabase Authentication

1. Go to https://glhwxyhhycqytfrsjzyz.supabase.co
2. Navigate to **Authentication** in the left sidebar
3. Go to **Providers** tab
4. Make sure **Email** provider is **enabled**
5. Configure Email settings:
   - **Enable Email Confirmations**: Optional (disable for faster testing)
   - **Secure Email Change**: Enable (recommended)
   - **Secure Password Change**: Enable (recommended)

### Email Settings (Optional but Recommended)

1. Go to **Authentication** → **Email Templates**
2. Customize the following templates:
   - **Confirm signup**: Email sent when users sign up
   - **Reset password**: Email sent for password reset
   - **Magic Link**: (Optional) For passwordless login

## Step 2: Run Database Setup

If you haven't already:

1. Go to **SQL Editor** in Supabase
2. Open `database-setup.sql` from this project
3. Copy and paste the entire SQL script
4. Click **Run**

This creates all necessary tables and sets up Row Level Security policies.

## Step 3: Test the Authentication Flow

The app is running at `http://localhost:3000`. Test these flows:

### A. Sign Up (New User)
1. Open http://localhost:3000
2. Click **"Create Account"**
3. Fill in:
   - Full Name: `John Doe`
   - Email: `john@example.com` (use a real email if you want to test password reset)
   - Password: `password123` (min 6 characters)
   - Confirm Password: `password123`
   - Grade: `11th Grade`
4. Click **"Create Account"**
5. You should be redirected to the test selection page

### B. Sign In (Existing User)
1. Open http://localhost:3000
2. Enter your email and password
3. Click **"Sign In"**
4. You should be redirected to the test selection page

### C. Forgot Password
1. Open http://localhost:3000
2. Click **"Forgot Password?"**
3. Enter your email address
4. Click **"Send Reset Link"**
5. Check your email for the password reset link
6. Click the link in the email (redirects to `/reset-password`)
7. Enter a new password (twice)
8. Click **"Update Password"**
9. You'll be redirected back to the sign-in page

### D. Testing Mode (Skip Authentication)
1. Open http://localhost:3000
2. Click **"Testing Mode (Skip Login)"**
3. You'll be logged in as a test user immediately

## Features

### 1. Sign In Screen
- Email and password fields
- "Forgot Password?" link
- "Create Account" link
- "Testing Mode" button (for development)

### 2. Sign Up Screen
- Full name field
- Email field
- Password field (min 6 characters)
- Confirm password field
- Grade level selector
- Password validation (must match and meet requirements)
- "Already have an account? Sign In" link

### 3. Forgot Password Screen
- Email field
- Instructions text
- "Send Reset Link" button
- "Back to Sign In" link

### 4. Reset Password Screen
- New password field (min 6 characters)
- Confirm password field
- Password validation
- "Update Password" button
- "Back to Sign In" link

## Security Features

✅ Passwords are hashed and stored securely by Supabase Auth  
✅ Row Level Security (RLS) policies protect user data  
✅ Password reset requires email verification  
✅ Minimum password length of 6 characters  
✅ Password confirmation on sign up and reset

## API Functions

All authentication functions are in `src/api/auth.ts`:

```typescript
// Sign up a new user
signUp(email, password, name, grade)

// Sign in an existing user
signIn(email, password)

// Sign out the current user
signOut()

// Send password reset email
sendPasswordResetEmail(email)

// Update password (for reset flow)
updatePassword(newPassword)

// Get current session
getCurrentSession()

// Check if user is authenticated
isAuthenticated()
```

## Troubleshooting

### "Email not sent" error
- Check that Email provider is enabled in Supabase
- Verify your email address is correct
- Check spam folder
- For development, you can disable email confirmations in Supabase settings

### "Invalid login credentials" error
- Double-check email and password
- Use "Forgot Password?" to reset if needed
- Try creating a new account with a different email

### "Password must be at least 6 characters" error
- Make sure your password is 6+ characters long
- This is enforced by Supabase Auth

### User can't sign in after sign up
- If email confirmations are enabled, check your email
- Click the confirmation link before signing in
- Or disable email confirmations in Supabase for testing

## Email Configuration (Production)

For production use, you should set up custom SMTP:

1. Go to **Authentication** → **Email Auth**
2. Click **SMTP Settings**
3. Configure your SMTP provider (Gmail, SendGrid, Mailgun, etc.)
4. Test the connection

This ensures emails are delivered reliably and don't go to spam.

## Next Steps

After authentication is working:

1. ✅ Test the complete user flow (sign up → test → results)
2. ✅ Verify data is being saved to Supabase
3. ✅ Test password reset flow with a real email
4. Consider adding:
   - Social login (Google, Apple)
   - Two-factor authentication
   - Session persistence (remember me)
   - User profile settings
