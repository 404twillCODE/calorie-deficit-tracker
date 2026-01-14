# Quick Fix: Set GitHub Secrets

Your workflow is failing because the Supabase secrets are not set. Follow these steps:

## Step 1: Get Your Supabase Credentials

1. Go to https://supabase.com and log in
2. Select your project
3. Go to **Settings** → **API**
4. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

## Step 2: Add Secrets to GitHub

1. Go to your GitHub repository
2. Click **Settings** (top menu)
3. Click **Secrets and variables** → **Actions** (left sidebar)
4. Click **New repository secret** (green button)

### Add First Secret:
- **Name:** `SUPABASE_URL`
- **Secret:** Paste your Supabase Project URL (the full URL like `https://xxxxx.supabase.co`)
- Click **Add secret**

### Add Second Secret:
- Click **New repository secret** again
- **Name:** `SUPABASE_ANON_KEY`
- **Secret:** Paste your Supabase anon/public key (the long string)
- Click **Add secret**

## Step 3: Re-run the Workflow

1. Go to **Actions** tab in your repository
2. Click on the failed workflow run
3. Click **Re-run all jobs** (or **Re-run failed jobs**)
4. Wait for it to complete

## Step 4: Verify It Works

After the workflow completes:
1. Go to **Settings** → **Pages**
2. Your site should be deployed
3. Visit your GitHub Pages URL
4. Open browser console (F12) - should see "✓ Supabase client initialized"

## Important Notes

- **Don't add quotes** around the values
- **Don't add extra spaces** before or after
- The **anon key** is safe to use (it's designed for client-side)
- Secrets are encrypted and only visible during workflow runs

## Still Having Issues?

If the workflow still fails after adding secrets:
1. Double-check the secret names are exactly: `SUPABASE_URL` and `SUPABASE_ANON_KEY`
2. Make sure there are no extra spaces
3. Try deleting and re-adding the secrets
4. Check the workflow logs for any other errors

