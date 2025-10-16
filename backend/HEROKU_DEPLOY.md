# Heroku Deployment Guide for Crisis Connect Email Service

## Quick Deploy to Heroku

### Prerequisites
- Heroku account (sign up at https://heroku.com)
- Heroku CLI installed (https://devcenter.heroku.com/articles/heroku-cli)
- Git installed

### Step 1: Login to Heroku
```bash
heroku login
```

### Step 2: Create Heroku App
```bash
cd backend
heroku create crisis-connect-email-service
# Or use your own app name:
# heroku create your-custom-name
```

### Step 3: Set Environment Variables
```bash
# SMTP Configuration (already set in code, but can override)
heroku config:set SMTP_HOST=mail.privateemail.com
heroku config:set SMTP_PORT=465
heroku config:set SMTP_USER=conflictconnect@neffcreative.co
heroku config:set SMTP_PASS=MutualAid13

# Node environment
heroku config:set NODE_ENV=production
```

### Step 4: Initialize Git (if not already done)
```bash
git init
git add .
git commit -m "Initial commit for Heroku deployment"
```

### Step 5: Deploy to Heroku
```bash
# Add Heroku remote
heroku git:remote -a crisis-connect-email-service

# Push to Heroku
git push heroku main
# Or if your branch is named master:
# git push heroku master
```

### Step 6: Verify Deployment
```bash
# Check if app is running
heroku ps

# View logs
heroku logs --tail

# Open app in browser
heroku open

# Test health endpoint
curl https://your-app-name.herokuapp.com/health
```

### Step 7: Get Your Backend URL
After successful deployment, your backend will be available at:
```
https://your-app-name.herokuapp.com
```

Your API endpoints will be:
- Health check: `https://your-app-name.herokuapp.com/health`
- Test connection: `https://your-app-name.herokuapp.com/api/email/test-connection`
- Send verification: `https://your-app-name.herokuapp.com/api/email/send-verification`

### Step 8: Update Mobile App
Copy your Heroku URL and update `services/backendEmailService.ts`:

```typescript
const BACKEND_API_BASE = 'https://your-app-name.herokuapp.com/api';
```

## Troubleshooting

### View Logs
```bash
heroku logs --tail
```

### Restart App
```bash
heroku restart
```

### Check Environment Variables
```bash
heroku config
```

### SSH into Container
```bash
heroku run bash
```

## Alternative: Deploy via GitHub

1. Connect your GitHub repo to Heroku
2. Go to Heroku Dashboard → Your App → Deploy
3. Choose "GitHub" as deployment method
4. Connect your repository
5. Enable automatic deploys (optional)
6. Click "Deploy Branch"

## Monitoring

### View App Status
```bash
heroku ps
```

### View Metrics
```bash
heroku logs --tail
```

### Set up Alerts (optional)
- Go to Heroku Dashboard
- Navigate to your app
- Go to "Metrics" tab
- Set up alerts for errors, memory, etc.

## Scaling (if needed)

### View current dynos
```bash
heroku ps
```

### Scale up (paid plans only)
```bash
heroku ps:scale web=2
```

## Cost
- Free tier: Sufficient for development and testing
- Hobby: $7/month (no sleeping, custom domain)
- Production: $25+/month (better performance)

## Notes
- Free tier apps sleep after 30 minutes of inactivity
- First request after sleep takes ~10-20 seconds
- For production, consider upgrading to Hobby or higher
- SMTP credentials are hardcoded but can be overridden with config vars

