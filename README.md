# Calorie Deficit Tracker

A modern, dark-themed web app for tracking your daily calorie deficit. Built with vanilla JavaScript and Supabase for authentication and data storage.

## Features

- 📱 **iPhone Web App Ready** - Add to home screen for native app experience
- 🌙 **Dark Theme** - Beautiful dark UI optimized for mobile
- 🔐 **User Authentication** - Secure sign up and login with email verification
- 📊 **Daily Tracking** - Track calories eaten and burned
- 📈 **Statistics** - View daily, weekly, monthly, and yearly deficit totals
- 📅 **History** - See your recent tracking history
- ☁️ **Cloud Storage** - Data synced across devices with Supabase

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR-USERNAME/calorie-deficit-tracker.git
   cd calorie-deficit-tracker
   ```

2. **Set up Supabase**
   - Create a free account at [supabase.com](https://supabase.com)
   - Create a new project
   - Run the SQL script in `supabase-setup.sql`
   - Get your API credentials from Settings > API

3. **Configure locally**
   - Create a `.env` file with your Supabase credentials
   - Run `npm run build-config` to generate `config.js`

4. **Deploy to GitHub Pages**
   - See `GITHUB-DEPLOYMENT.md` for detailed instructions
   - Add GitHub Secrets for automatic deployment

## Documentation

- **SETUP.txt** - Complete setup instructions
- **GITHUB-DEPLOYMENT.md** - GitHub Pages deployment guide
- **EMAIL-CUSTOMIZATION.md** - How to customize email templates

## Tech Stack

- Vanilla JavaScript
- Supabase (Authentication & Database)
- GitHub Pages (Hosting)
- PWA Support

## License

MIT

