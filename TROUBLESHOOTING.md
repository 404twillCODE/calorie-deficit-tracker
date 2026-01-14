# GitHub Pages Deployment Troubleshooting

## Common Errors and Solutions

### Error: "Workflow run failed" or "Permission denied"

**Solution:**
1. Go to your repository **Settings** → **Actions** → **General**
2. Scroll to **Workflow permissions**
3. Select **Read and write permissions**
4. Check **Allow GitHub Actions to create and approve pull requests**
5. Click **Save**

### Error: "config.js is empty" or Supabase not connecting

**Solution:**
1. Verify GitHub Secrets are set:
   - Go to **Settings** → **Secrets and variables** → **Actions**
   - Check that `SUPABASE_URL` and `SUPABASE_ANON_KEY` exist
   - Make sure values don't have quotes or extra spaces
2. Check the workflow logs:
   - Go to **Actions** tab
   - Click on the latest workflow run
   - Check the "Generate config.js" step
   - Look for any error messages

### Error: "No workflow runs found"

**Solution:**
1. Make sure you've pushed code to GitHub
2. Check that `.github/workflows/deploy.yml` file exists
3. Verify you're on the `main` or `master` branch
4. Try manually triggering:
   - Go to **Actions** tab
   - Click **Deploy to GitHub Pages**
   - Click **Run workflow** → **Run workflow**

### Error: "Pages build failed" or "Deployment failed"

**Solution:**
1. Check the workflow logs in the **Actions** tab
2. Look for specific error messages
3. Common causes:
   - Missing files (make sure all files are committed)
   - Invalid YAML syntax in workflow file
   - GitHub Secrets not set
4. Try the backup workflow:
   - Disable the main workflow temporarily
   - The `static.yml` workflow will run instead

### Site shows "404 Not Found"

**Solution:**
1. Wait 1-2 minutes after deployment completes
2. Check **Settings** → **Pages**:
   - Source should be **GitHub Actions**
   - Not "Deploy from a branch"
3. Clear your browser cache
4. Try accessing: `https://YOUR-USERNAME.github.io/calorie-deficit-tracker/`

### Supabase works locally but not on GitHub Pages

**Solution:**
1. Check browser console on the deployed site (F12)
2. Verify config.js was generated correctly:
   - View source on GitHub Pages
   - Check that `config.js` contains your Supabase URL and key
3. Check Supabase project settings:
   - Go to **Settings** → **API**
   - Make sure your site URL is allowed (if using URL restrictions)

## Step-by-Step Debugging

1. **Check GitHub Secrets:**
   ```
   Settings → Secrets and variables → Actions
   Should see: SUPABASE_URL and SUPABASE_ANON_KEY
   ```

2. **Check Workflow Status:**
   ```
   Actions tab → Look for green checkmark or red X
   Click on workflow to see detailed logs
   ```

3. **Check Generated Files:**
   ```
   In workflow logs, find "Generate config.js" step
   Should see: "✓ config.js generated"
   ```

4. **Check GitHub Pages Settings:**
   ```
   Settings → Pages
   Source: GitHub Actions (not "Deploy from a branch")
   ```

5. **Test Locally:**
   ```bash
   # Generate config.js locally
   npm run build-config
   
   # Check that config.js has your values
   cat config.js
   ```

## Still Having Issues?

1. Check the **Actions** tab for detailed error logs
2. Verify all steps in GITHUB-DEPLOYMENT.md were followed
3. Make sure your repository is public (required for free GitHub Pages)
4. Try deleting and recreating the GitHub Secrets

