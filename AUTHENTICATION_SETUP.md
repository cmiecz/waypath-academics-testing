# Authentication Setup Guide

## Overview
The ACT Test Prep app uses **passwordless magic link authentication** for a seamless user experience:
- ✅ **Magic Link Sign In**: One-click sign in via email link - no password needed!
- ✅ **Auto-Registration**: New users are automatically created on first sign-in
- ✅ **Profile Completion**: New users complete their profile (name/grade) after first login
- ✅ **Testing Mode**: Skip authentication for development
- ✅ **Admin Access**: Separate admin login with username/password

## Step 1: Enable Magic Link Authentication in Supabase

1. Go to https://glhwxyhhycqytfrsjzyz.supabase.co
2. Navigate to **Authentication** in the left sidebar
3. Go to **Providers** tab
4. Make sure **Email** provider is **enabled**
5. Configure Email settings:
   - **Enable Email Confirmations**: **Disabled** (magic links don't need confirmation)
   - **Secure Email Change**: Enable (recommended)

### Configure Magic Link Email Template

1. Go to **Authentication** → **Email Templates**
2. Select **Magic Link** template
3. Copy the contents from `email-templates/magic-link.html` in this project
4. Paste into the template editor
5. Set the subject line: **"Sign in to WayPath ACT Prep"**
6. Save the template

The custom template includes:
- ✨ WayPath Academics branding
- 🎨 Professional styling matching your app
- 🔒 Security notes and best practices
- 📱 Mobile-responsive design

## Step 2: Run Database Setup

If you haven't already:

1. Go to **SQL Editor** in Supabase
2. Open `database-setup.sql` from this project
3. Copy and paste the entire SQL script
4. Click **Run**

This creates all necessary tables and sets up Row Level Security policies.

## Step 3: Configure Redirect URLs

1. In Supabase Dashboard, go to **Authentication** → **URL Configuration**
2. Add the following redirect URLs:
   - **Production**: `https://act-prep-web.vercel.app/auth/callback`
   - **Development**: `http://localhost:3000/auth/callback`
3. Set the **Site URL** to your production URL
4. Save the configuration

## Step 4: Test the Magic Link Flow

The app is running at `http://localhost:3000`. Test these flows:

### A. New User Sign In (First Time)
1. Open http://localhost:3000
2. Enter your email address (use a real email)
3. Click **"Send Magic Link"**
4. You'll see: "Check your email for your magic link! 🎉"
5. Check your email inbox
6. Click the **"Sign In to ACT Prep"** button in the email
7. You'll be redirected to `/auth/callback` (processing...)
8. Then redirected to `/complete-profile`
9. Enter your name and select your grade level
10. Click **"Complete Profile"**
11. You're now signed in and redirected to test selection!

### B. Existing User Sign In (Return Visit)
1. Open http://localhost:3000
2. Enter your email address
3. Click **"Send Magic Link"**
4. Check your email and click the sign-in link
5. You'll be automatically signed in and redirected to test selection
6. No profile completion needed - you're already set up!

### C. Testing Mode (Skip Authentication)
1. Open http://localhost:3000
2. Click **"Testing Mode (Skip Login)"**
3. You'll be logged in as a test user immediately

### D. Admin Access
1. Open http://localhost:3000
2. Click **"⚙️ Admin Access"**
3. Enter admin credentials:
   - Username: `admin`
   - Password: `WP4Life`
4. Click **"⚙️ Admin Sign In"**
5. You'll be redirected to the admin dashboard

## Features

### 1. Magic Link Sign In Screen
- Email input field only - no password required!
- Clear instructions: "Sign in with your email - no password needed!"
- "Send Magic Link" button
- Success message after sending
- "Testing Mode" button (for development)
- "Admin Access" button (for administrators)

### 2. Magic Link Callback Page
- Automatic verification of the magic link token
- Loading state while processing
- Error handling with clear messages
- Automatic routing:
  - New users → Profile completion
  - Existing users → Test selection

### 3. Profile Completion Screen (New Users Only)
- Full name field
- Grade level selector (9th-12th grade)
- "Complete Profile" button
- Shows the email you're signed in with
- Only appears for first-time sign-ins

### 4. Admin Login Screen
- Username field
- Password field
- "Admin Sign In" button
- "Back to Regular Login" link
- Separate from student authentication

## Security Features

✅ **No passwords to remember or leak** - passwordless authentication  
✅ **One-time use links** - magic links expire after use or after 1 hour  
✅ **Email verification built-in** - only the email owner can sign in  
✅ **Row Level Security (RLS)** - policies protect user data in database  
✅ **Automatic user creation** - seamless onboarding for new users  
✅ **Secure token verification** - uses Supabase Auth's token hashing

## API Functions

All authentication functions are in `src/api/auth.ts`:

```typescript
// Send magic link to user's email
signInWithMagicLink(email)

// Handle the magic link callback and verify token
handleMagicLinkCallback(tokenHash, type)

// Create user profile for new users
createUserProfile(userId, name, email, grade)

// Sign out the current user
signOut()

// Get current session
getCurrentSession()

// Check if user is authenticated
isAuthenticated()

// Legacy password functions (kept for admin/backward compatibility)
signUp(email, password, name, grade)
signIn(email, password)
sendPasswordResetEmail(email)
updatePassword(newPassword)
```

## Troubleshooting

### Magic link email not received
- Check your spam/junk folder
- Verify the email address is correct
- Ensure Email provider is enabled in Supabase Dashboard
- Check Supabase logs for email sending errors
- Wait a minute and try requesting a new link

### "Invalid magic link" or "Token expired" error
- Magic links expire after 1 hour
- Magic links are one-time use only
- Request a new magic link from the login page
- Make sure you're clicking the latest link if you requested multiple

### Stuck on loading/callback page
- Check browser console for errors
- Verify redirect URLs are configured correctly in Supabase
- Ensure the URL matches: `/auth/callback` with `token_hash` and `type` parameters
- Try clearing browser cache and cookies

### Profile completion page not showing
- This only appears for first-time users
- If you already have a profile, you skip directly to test selection
- Check that the user record exists in the `users` table

### Email template not updating
- Make sure you saved the template in Supabase Dashboard
- Clear email cache (try a different email address)
- Check that you selected the correct template type (Magic Link)
- Verify the HTML is valid with proper Go template syntax

## Email Configuration (Production)

For production use, you should set up custom SMTP:

1. Go to **Authentication** → **Email Auth**
2. Click **SMTP Settings**
3. Configure your SMTP provider (Gmail, SendGrid, Mailgun, etc.)
4. Test the connection

This ensures emails are delivered reliably and don't go to spam.

## User Flow Diagram

```
New User:
1. Enter email → 2. Receive magic link → 3. Click link → 
4. Auto verification → 5. Complete profile → 6. Test selection

Returning User:
1. Enter email → 2. Receive magic link → 3. Click link → 
4. Auto verification → 5. Test selection (skip profile)
```

## Next Steps

After magic link authentication is working:

1. ✅ Test the complete user flow (magic link → profile → test → results)
2. ✅ Verify data is being saved to Supabase
3. ✅ Test with multiple email addresses
4. ✅ Customize the email template branding further if needed
5. Consider adding:
   - Social login (Google, Apple) for even faster sign-in
   - Session persistence optimization
   - User profile editing
   - Email preferences

## Benefits of Magic Link Authentication

🚀 **Better User Experience**
- No passwords to remember
- Faster sign-in process
- One-click access from email

🔒 **Enhanced Security**
- No password breaches possible
- Email-verified by default
- Time-limited access tokens

💰 **Reduced Support Burden**
- No "forgot password" requests
- No password complexity requirements
- Fewer authentication issues

📱 **Mobile-Friendly**
- Easy to use on mobile devices
- No typing long passwords
- Seamless cross-device experience
