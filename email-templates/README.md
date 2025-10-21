# Email Templates

This directory contains custom email templates for the ACT Test Prep application.

## Magic Link Template

The `magic-link.html` file contains a branded email template for magic link authentication.

### Features
- ✨ WayPath Academics branding with logo and colors
- 🎨 Professional gradient styling
- 📱 Mobile-responsive design
- 🔒 Security notes and best practices
- ⏱️ Clear expiration notice
- 🔗 Multiple ways to access the link (button + copy-paste)

### Brand Colors Used
- **Primary Blue**: `#2D5A8C` - Main WayPath brand color
- **Secondary Blue**: `#4A90E2` - Lighter accent color
- **Dark Blue**: `#1E3A5F` - Deep contrast color
- **Background**: `#F8F9FA` - Light neutral background
- **Text**: `#333333` - Primary text color

## How to Deploy to Supabase

### Step 1: Navigate to Supabase Dashboard
1. Go to your Supabase project: https://glhwxyhhycqytfrsjzyz.supabase.co
2. Click on **Authentication** in the left sidebar
3. Click on **Email Templates** tab

### Step 2: Select Magic Link Template
1. Find **Magic Link** in the list of templates
2. Click on it to open the editor

### Step 3: Upload the Template
1. Open `magic-link.html` in a text editor
2. Copy the entire contents (Ctrl+A, Ctrl+C)
3. Paste into the **HTML Body** field in Supabase
4. Update the **Subject** field to: `Sign in to WayPath ACT Prep`

### Step 4: Save and Test
1. Click **Save** at the bottom of the page
2. Test the magic link flow:
   - Go to http://localhost:3000
   - Enter your email
   - Click "Send Magic Link"
   - Check your inbox for the branded email!

## Template Variables

The template uses Supabase Auth's Go template syntax:

- `{{ .ConfirmationURL }}` - The full magic link URL with token
- `{{ .Email }}` - The user's email address (if needed)
- `{{ .SiteURL }}` - Your app's site URL
- `{{ .Token }}` - 6-digit OTP (not used in magic link, but available)

## Customization

To further customize the template:

1. **Logo**: Update the `.logo-icon` styling to add an actual image
2. **Colors**: Change the color variables in the `<style>` section
3. **Content**: Modify the text in the main content area
4. **Footer**: Add your organization's information

### Example: Add a Custom Logo Image

Replace this:
```html
<div class="logo-icon">W</div>
```

With this:
```html
<img src="https://your-domain.com/logo.png" alt="WayPath" style="width: 50px; height: 50px;" />
```

## Testing Locally

You can test the email template appearance locally:

1. Open `magic-link.html` in a web browser
2. Replace `{{ .ConfirmationURL }}` with a dummy URL like `https://example.com/auth/callback?token=123`
3. View in different screen sizes to check mobile responsiveness

## Notes

- Emails may look different across email clients (Gmail, Outlook, Apple Mail, etc.)
- Always test in multiple email clients before production deployment
- Avoid using too much JavaScript or advanced CSS - many email clients strip these out
- Keep the email under 102KB to avoid Gmail clipping
- Inline CSS is generally more reliable than external stylesheets in emails

## Support

If the email template isn't working:
1. Check that you saved the template in Supabase
2. Verify the Magic Link provider is enabled in Auth settings
3. Check your spam/junk folder
4. Review Supabase logs for any email sending errors
5. Make sure redirect URLs are configured correctly

