# Email Template Setup Instructions

## How to Enable Custom Magic Link Email

### Step 1: Access Supabase Dashboard
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your ACT Prep project
3. Navigate to **Authentication** → **Email Templates** (left sidebar)

### Step 2: Edit Magic Link Template
1. Find and click on **"Magic Link"** in the template list
2. You'll see a code editor with the default template

### Step 3: Replace with Custom Template
1. Delete all existing code
2. Copy the entire contents of `magic-link.html` from this directory
3. Paste it into the Supabase editor
4. Click **"Save"** at the bottom

### Step 4: Test It
1. Go to your app: https://act-prep-web.vercel.app
2. Sign in with your email
3. Check your inbox - you should now see the beautiful WayPath-branded email!

---

## What the Custom Template Includes:

✅ **WayPath Branding**: Logo and color scheme matching the app  
✅ **Professional Design**: Clean, modern layout with gradients  
✅ **Clear Call-to-Action**: Big, obvious "Sign In to ACT Prep" button  
✅ **Security Notes**: Clear expiration time and security tips  
✅ **Mobile Responsive**: Looks great on all devices  
✅ **Fallback Link**: Copy-paste option if button doesn't work  

---

## Preview

The email will include:
- WayPath Academics logo with the "W" icon
- Blue gradient header (matching app theme)
- "Your Sign-In Link is Ready! 🎉" heading
- Clear sign-in button
- 1-hour expiration notice
- Security warning for unrecognized requests
- Professional footer with branding

---

## Troubleshooting

**Q: I saved the template but still see the old email**  
A: Clear your cache and try signing in again. The new template should apply immediately to new sign-in requests.

**Q: The styling looks broken in the email**  
A: Make sure you copied the ENTIRE template including all the `<style>` tags at the top.

**Q: Can I customize it further?**  
A: Yes! Edit `magic-link.html` and re-upload. Just keep the `{{ .ConfirmationURL }}` variable intact.

