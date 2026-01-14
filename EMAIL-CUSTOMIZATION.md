# Customizing Supabase Email Templates

Supabase allows you to customize the email templates for authentication emails (signup confirmation, password reset, etc.).

## How to Customize Email Templates

### Step 1: Access Email Templates
1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Email Templates**
3. You'll see templates for:
   - Confirm signup
   - Magic Link
   - Change Email Address
   - Reset Password
   - Invite user

### Step 2: Customize a Template
1. Click on the template you want to customize (e.g., "Confirm signup")
2. You can edit:
   - **Subject**: The email subject line
   - **Body**: The email content (HTML supported)

### Step 3: Use Template Variables
Supabase provides variables you can use in templates:

- `{{ .ConfirmationURL }}` - The confirmation link
- `{{ .Email }}` - User's email address
- `{{ .Token }}` - The confirmation token
- `{{ .TokenHash }}` - Hashed token
- `{{ .SiteURL }}` - Your site URL
- `{{ .RedirectTo }}` - Redirect URL after confirmation

### Example: Custom Confirm Signup Email

**Subject:**
```
Welcome to Calorie Deficit Tracker - Verify Your Email
```

**Body (HTML):**
```html
<h2>Welcome to Calorie Deficit Tracker!</h2>
<p>Thanks for signing up. Please click the link below to verify your email address:</p>
<p><a href="{{ .ConfirmationURL }}">Verify Email Address</a></p>
<p>Or copy and paste this link into your browser:</p>
<p>{{ .ConfirmationURL }}</p>
<p>This link will expire in 24 hours.</p>
<p>If you didn't create an account, you can safely ignore this email.</p>
```

### Step 4: Preview and Save
1. Use the preview feature to see how your email will look
2. Click **Save** to apply your changes
3. Test by signing up a new account

## Email Provider Settings

### Change Email Provider
1. Go to **Settings** → **Auth**
2. Scroll to **SMTP Settings**
3. You can:
   - Use Supabase's default email service (limited)
   - Configure custom SMTP (Gmail, SendGrid, etc.)

### Custom SMTP Setup
For production apps, it's recommended to use a custom SMTP provider:

1. **SendGrid** (Recommended)
   - Free tier: 100 emails/day
   - Go to Settings → Auth → SMTP Settings
   - Enter your SendGrid credentials

2. **Gmail SMTP**
   - Requires app-specific password
   - Limited to 500 emails/day

3. **Other Providers**
   - AWS SES
   - Mailgun
   - Postmark

## Disable Email Confirmation (Development Only)

⚠️ **Warning**: Only disable for development/testing!

1. Go to **Authentication** → **Settings**
2. Under **User Signups**, toggle **"Enable email confirmations"** OFF
3. Users will be automatically confirmed (not recommended for production)

## Redirect URL After Confirmation

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to your app URL (e.g., `https://your-app.com`)
3. Add **Redirect URLs** for allowed redirect destinations:
   - `https://your-app.com/auth/callback`
   - `http://localhost:3000/auth/callback` (for development)

## Testing Email Templates

1. Use the **Preview** feature in the email template editor
2. Sign up with a test email
3. Check your email inbox (and spam folder)
4. Click the confirmation link to test the flow

## Best Practices

1. **Keep it simple**: Clear, concise messages work best
2. **Include your branding**: Add your app name and logo
3. **Mobile-friendly**: Test on mobile devices
4. **Clear call-to-action**: Make the confirmation button obvious
5. **Security note**: Remind users to verify if they didn't sign up

## Current App Behavior

- When users sign up, they receive a confirmation email
- They must click the link in the email to verify their account
- After verification, they can sign in
- The app shows a message: "Please check your email to verify your account"

