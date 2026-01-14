# Fixing Supabase on GitHub Pages

If Supabase isn't working on your GitHub Pages site, follow these steps:

## Step 1: Verify GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Verify you have:
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_ANON_KEY` - Your Supabase anon/public key
4. Make sure the values are correct (no extra spaces, no quotes)

## Step 2: Check Workflow Logs

1. Go to **Actions** tab in your repository
2. Click on the latest workflow run
3. Find the "Generate config.js" step
4. Check if it says "✓ config.js verified - contains values"
5. If you see errors, the secrets might not be set correctly

## Step 3: Add GitHub Pages URL to Supabase (IMPORTANT!)

Supabase requires you to add your site URL to allowed redirect URLs:

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Under **Site URL**, add your GitHub Pages URL:
   ```
   https://YOUR-USERNAME.github.io
   ```
4. Under **Redirect URLs**, add:
   ```
   https://YOUR-USERNAME.github.io/**
   https://YOUR-USERNAME.github.io/calorie-deficit-tracker/**
   ```
5. Click **Save**

## Step 4: Verify config.js on Live Site

1. Visit your GitHub Pages site
2. Open browser console (F12)
3. Check for errors:
   - "✗ Supabase credentials missing" = config.js not generated
   - "✗ Supabase library not loaded" = CDN issue
   - Network errors = URL not allowed in Supabase

4. View the source of config.js:
   - Go to: `https://YOUR-USERNAME.github.io/calorie-deficit-tracker/config.js`
   - Should see your Supabase URL and key (not empty strings)

## Step 5: Test Supabase Connection

1. Open your GitHub Pages site
2. Open browser console (F12)
3. Look for: "✓ Supabase client initialized"
4. If you see errors, check:
   - CORS errors = URL not in Supabase allowed list
   - 401/403 errors = Wrong credentials
   - Network errors = Supabase project might be paused

## Common Issues

### Issue: "config.js is empty"
**Solution:**
- Check GitHub Secrets are set
- Re-run the workflow manually
- Check workflow logs for errors

### Issue: "CORS error" or "Blocked by CORS policy"
**Solution:**
- Add your GitHub Pages URL to Supabase allowed URLs (Step 3)
- Make sure you added both the base URL and with wildcard `/**`

### Issue: "Invalid API key"
**Solution:**
- Verify your `SUPABASE_ANON_KEY` secret is correct
- Check for extra spaces or quotes in the secret value
- Make sure you're using the **anon/public** key, not the service role key

### Issue: "Project not found"
**Solution:**
- Verify your `SUPABASE_URL` is correct
- Make sure your Supabase project is active (not paused)
- Check the URL format: `https://xxxxx.supabase.co`

## Quick Debug Checklist

- [ ] GitHub Secrets are set (`SUPABASE_URL` and `SUPABASE_ANON_KEY`)
- [ ] Workflow completed successfully
- [ ] config.js exists on the live site and has values
- [ ] GitHub Pages URL added to Supabase allowed URLs
- [ ] Browser console shows "✓ Supabase client initialized"
- [ ] No CORS errors in console
- [ ] Supabase project is active

## Still Not Working?

1. **Check the workflow logs:**
   - Actions tab → Latest run → Check all steps

2. **Test locally first:**
   ```bash
   # Generate config.js locally
   npm run build-config
   
   # Open index.html in browser
   # Check console for Supabase errors
   ```

3. **Verify Supabase project:**
   - Go to Supabase Dashboard
   - Check project status (should be "Active")
   - Test API connection in Supabase dashboard

4. **Check browser console:**
   - Open your GitHub Pages site
   - Press F12 → Console tab
   - Look for any red error messages
   - Share the error message for further help


