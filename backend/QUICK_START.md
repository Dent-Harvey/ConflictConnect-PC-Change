# Quick Start - Deploy to Heroku in 5 Minutes

## Option 1: Using Heroku CLI (Recommended)

### Step 1: Install Heroku CLI
- Windows: Download from https://devcenter.heroku.com/articles/heroku-cli
- Mac: `brew tap heroku/brew && brew install heroku`
- Linux: `curl https://cli-assets.heroku.com/install.sh | sh`

### Step 2: Login and Deploy
```bash
cd backend
heroku login
heroku create
git init
git add .
git commit -m "Deploy email service"
heroku git:remote -a your-app-name
git push heroku main
```

### Step 3: Get Your URL
```bash
heroku open
# Your URL will be: https://your-app-name.herokuapp.com
```

## Option 2: Using Heroku Dashboard (No CLI needed)

1. Go to https://dashboard.heroku.com/
2. Click "New" → "Create new app"
3. Choose app name: `crisis-connect-email-service`
4. Click "Create app"
5. Go to "Deploy" tab
6. Choose "GitHub" and connect your repository
7. Select the `backend` folder (or create a separate repo for it)
8. Click "Deploy Branch"
9. Once deployed, go to "Settings" → Copy the "App URL"

## Step 4: Update Mobile App

Edit `services/backendEmailService.ts`:

```typescript
const BACKEND_API_BASE = 'https://your-app-name.herokuapp.com/api';
```

Replace `your-app-name` with your actual Heroku app name.

## Done! 🎉

Test your deployment:
- Health check: Visit `https://your-app-name.herokuapp.com/health`
- You should see: `{"status":"OK","service":"Crisis Connect Email Service",...}`

## Need Help?
- Check logs: `heroku logs --tail`
- View full guide: See `HEROKU_DEPLOY.md`

