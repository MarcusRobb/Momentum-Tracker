# How to Test Your Momentum Tracker App

## Quick Local Testing (Easiest)

### Option 1: Using Python (if you have Python installed)
1. Download/clone your repository to your computer
2. Open terminal/command prompt in the project folder
3. Run one of these commands:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2 (if you have older Python)
   python -m SimpleHTTPServer 8000
   ```
4. Open your browser and go to: `http://localhost:8000`

### Option 2: Using Node.js (if you have Node.js installed)
1. Install a simple server globally:
   ```bash
   npm install -g http-server
   ```
2. In your project folder, run:
   ```bash
   http-server
   ```
3. Open the URL it shows you (usually `http://localhost:8080`)

### Option 3: Using VS Code Live Server Extension
1. Install VS Code (free code editor)
2. Install the "Live Server" extension
3. Right-click on `index.html` and select "Open with Live Server"

## What to Look For When Testing

✅ **Good Signs:**
- You see the "Momentum Tracker" header
- You can add tasks to the Brain Dump
- You can promote tasks to Top 3 Priorities
- No error messages in the browser console (F12 → Console)

❌ **Bad Signs (White Screen Issues):**
- Blank white page
- Only the title shows but no content
- Error messages in the browser console
- Features don't work (can't add tasks, etc.)

## Checking for Errors
1. Press F12 in your browser
2. Click the "Console" tab
3. Look for red error messages
4. If you see errors, copy them and share for help

## Publishing/Deployment Options

### GitHub Pages (Free & Easy)
1. Go to your GitHub repository
2. Click "Settings" tab
3. Scroll down to "Pages" section
4. Under "Source", select "Deploy from a branch"
5. Choose "main" branch and "/ (root)" folder
6. Click "Save"
7. Your app will be available at: `https://yourusername.github.io/repository-name`

### Other Free Options
- **Netlify**: Drag and drop your files
- **Vercel**: Connect your GitHub repo
- **GitHub Codespaces**: Test directly in GitHub

## Troubleshooting Common Issues

**White Screen:**
- Check browser console for errors
- Make sure all files are in the right place
- Try a different browser

**Features Not Working:**
- Check if JavaScript is enabled
- Look for console errors
- Make sure you're using a modern browser

**Can't Add Tasks:**
- This might be a localStorage issue
- Try clearing browser cache
- Check console for errors
