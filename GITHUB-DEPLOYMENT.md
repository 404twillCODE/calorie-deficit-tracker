# GitHub Deployment Guide

This guide will help you deploy the Calorie Deficit Tracker to GitHub Pages.

## Prerequisites

1. A GitHub account
2. A Supabase project (already set up)
3. Your Supabase URL and anon key

## Step 1: Create GitHub Repository

1. Go to GitHub and create a new repository
2. Name it `calorie-deficit-tracker` (or any name you prefer)
3. Make it public (required for free GitHub Pages)
4. Don't initialize with README, .gitignore, or license (we already have these)

## Step 2: Push Your Code

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR-USERNAME/calorie-deficit-tracker.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Set Up GitHub Secrets

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add two secrets:

   **Secret 1:**
   - Name: `SUPABASE_URL`
   - Value: Your Supabase project URL (from Supabase dashboard → Settings → API)

   **Secret 2:**
   - Name: `SUPABASE_ANON_KEY`
   - Value: Your Supabase anon/public key (from Supabase dashboard → Settings → API)

## Step 3.5: Configure Supabase for GitHub Pages (IMPORTANT!)

**This step is critical - Supabase won't work without it!**

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Under **Site URL**, add your GitHub Pages URL:
   ```
   https://YOUR-USERNAME.github.io
   ```
4. Under **Redirect URLs**, add (one per line):
   ```
   https://YOUR-USERNAME.github.io/**
   https://YOUR-USERNAME.github.io/calorie-deficit-tracker/**
   ```
5. Click **Save**

⚠️ **Without this step, you'll get CORS errors and Supabase won't work!**

## Step 4: Enable GitHub Pages

1. Go to your repository **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. Save

## Step 5: Trigger Deployment

The deployment will automatically trigger when you push to the `main` branch. You can also:

1. Go to **Actions** tab in your repository
2. Click **Deploy to GitHub Pages** workflow
3. Click **Run workflow** → **Run workflow**

## Step 6: Access Your Site

After deployment completes (usually 1-2 minutes):

1. Go to **Settings** → **Pages**
2. Your site URL will be: `https://YOUR-USERNAME.github.io/calorie-deficit-tracker/`

## Manual Deployment (Alternative)

If you prefer to deploy manually without GitHub Actions:

1. Create a `.env` file locally with your Supabase credentials
2. Run `npm run build-config` to generate `config.js`
3. Commit and push `config.js` to GitHub
4. Enable GitHub Pages with source: `main` branch, `/` (root) folder

⚠️ **Warning**: This method will expose your Supabase keys in the repository. Use GitHub Secrets method instead for security.

## Updating Your Site

After making changes:

```bash
git add .
git commit -m "Your commit message"
git push
```

GitHub Actions will automatically rebuild and deploy your site.

## Troubleshooting

### Site not loading
- Check the **Actions** tab for any errors
- Verify GitHub Secrets are set correctly
- Make sure GitHub Pages is enabled with **GitHub Actions** as the source
- Wait 1-2 minutes after deployment completes

### Workflow fails with "Permission denied" or "403"
- Go to **Settings** → **Actions** → **General**
- Under **Workflow permissions**, select **Read and write permissions**
- Check **Allow GitHub Actions to create and approve pull requests**
- Save the changes

### "config.js is empty" or Supabase not working
- Verify your GitHub Secrets are set:
  - Go to **Settings** → **Secrets and variables** → **Actions**
  - Make sure `SUPABASE_URL` and `SUPABASE_ANON_KEY` exist
  - Check that the values are correct (no extra spaces)
- Check the Actions log to see if config.js was generated
- Verify your Supabase project is active

### Build fails
- Check the **Actions** tab → Click on the failed workflow → View logs
- Common issues:
  - Missing GitHub Secrets (add them in Settings → Secrets)
  - Wrong branch name (should be `main` or `master`)
  - GitHub Pages not enabled
- Try running the workflow manually: **Actions** → **Deploy to GitHub Pages** → **Run workflow**

### "No workflow runs found"
- Make sure you've pushed code to the `main` or `master` branch
- Check that `.github/workflows/deploy.yml` exists in your repository
- Try pushing again or manually trigger the workflow

## Security Notes

- Never commit `.env` file to GitHub
- Never commit `config.js` if it contains real credentials (use GitHub Secrets instead)
- The GitHub Actions workflow uses secrets securely
- Your Supabase anon key is safe to expose (it's designed for client-side use)

## Custom Domain (Optional)

To use a custom domain:

1. Add a `CNAME` file to your repository root with your domain
2. Configure DNS settings with your domain provider
3. Update GitHub Pages settings with your custom domain

