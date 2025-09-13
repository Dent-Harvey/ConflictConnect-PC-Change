# Crisis Connect Backend Setup Guide

This guide walks you through setting up the backend email service for Crisis Connect.

## 🏗️ Architecture Overview

The Crisis Connect app uses a **hybrid architecture**:

1. **Mobile App** (React Native/Expo) - Handles UI and user interactions
2. **9gen Database API** - Manages data storage and retrieval
3. **Backend Email Service** - Handles email sending (SMTP)

## 📁 Files Created

### Backend Service Files
- `backend/emailService.js` - Main Express server for email handling
- `backend/package.json` - Dependencies and scripts
- `backend/test.js` - Testing utilities
- `backend/README.md` - Backend-specific documentation

### Mobile App Updates
- `services/backendEmailService.ts` - React Native service for API calls
- Updated `contexts/AuthContext.tsx` - Uses new backend email service
- Updated `components/EmailDiagnostics.tsx` - Tests new backend service
- `.env.example` - Environment variables template

## 🚀 Deployment Steps

### Step 1: Deploy the Backend Service

Choose one of these deployment options:

#### Option A: Heroku (Recommended)
```bash
cd backend
git init
git add .
git commit -m "Initial backend setup"
heroku create crisis-connect-email-api
git push heroku main
```

#### Option B: Railway
1. Connect your GitHub repo to Railway
2. Create a new project from the `backend` folder
3. Deploy automatically

#### Option C: DigitalOcean App Platform
1. Create a new app from GitHub
2. Select Node.js environment
3. Set build/run commands:
   - Build: `npm install`
   - Run: `npm start`

### Step 2: Update Mobile App Configuration

After deploying your backend, update the mobile app:

1. **Set Backend URL**: Update `services/backendEmailService.ts`:
```typescript
const BACKEND_API_BASE = 'https://your-deployed-backend.herokuapp.com/api';
```

2. **Create .env file** (optional):
```bash
cp .env.example .env
# Edit .env with your backend URL
```

### Step 3: Test the Integration

1. **Test Backend Health**:
```bash
curl https://your-deployed-backend.com/health
```

2. **Test from Mobile App**:
   - Open Crisis Connect app
   - Navigate to `/email-test` route
   - Run SMTP connection test
   - Send test verification email

## 🔧 Environment Variables

### Backend Service (.env for backend)
```bash
PORT=3001
SMTP_HOST=mail.privateemail.com
SMTP_PORT=465
SMTP_USER=conflictconnect@neffcreative.co
SMTP_PASS=MutualAid13
NODE_ENV=production
```

### Mobile App (.env for Expo)
```bash
EXPO_PUBLIC_BACKEND_API_URL=https://your-backend.herokuapp.com/api
```

## 📝 API Endpoints

Your deployed backend will provide these endpoints:

- `GET /health` - Service health check
- `GET /api/email/test-connection` - Test SMTP connection
- `POST /api/email/send-verification` - Send verification emails
- `POST /api/email/send` - Send general emails

## 🧪 Testing

### Local Testing
```bash
cd backend
npm install
npm run dev

# In another terminal
npm test
```

### Production Testing
```bash
# Health check
curl https://your-backend.com/health

# SMTP test
curl https://your-backend.com/api/email/test-connection
```

## 🔒 Security Considerations

1. **Environment Variables**: Store sensitive data in environment variables
2. **CORS**: Configure CORS for your mobile app domains only
3. **Rate Limiting**: Consider implementing rate limiting for production
4. **API Keys**: Don't expose SMTP credentials in client-side code

## 🛠️ Troubleshooting

### Common Issues

1. **"SMTP Connection Failed"**
   - Verify SMTP credentials
   - Check firewall/network settings
   - Ensure correct port (465 for SSL)

2. **"Backend API Error"**
   - Check backend deployment logs
   - Verify backend URL in mobile app
   - Test health endpoint manually

3. **"Email Not Received"**
   - Check spam folder
   - Verify email address format
   - Review backend logs for send status

### Debug Mode

Enable debug logging:

**Backend:**
```bash
NODE_ENV=development npm start
```

**Mobile App:**
```typescript
// In services/backendEmailService.ts
const DEBUG = __DEV__;
if (DEBUG) console.log('API Request:', requestData);
```

## 📞 Support

If you encounter issues:

1. Check backend deployment logs
2. Test SMTP connection manually
3. Verify all environment variables are set
4. Review the email diagnostic results in the mobile app

## 🔄 Migration from Old Service

The old `services/emailService.ts` used nodemailer directly in React Native, which doesn't work. The new architecture:

- **Before**: Mobile App → nodemailer (❌ doesn't work)
- **After**: Mobile App → Backend API → nodemailer (✅ works)

This separation ensures:
- Security (credentials on backend only)
- Reliability (proper Node.js environment for nodemailer)  
- Scalability (backend can handle multiple clients)

## 📈 Next Steps

After successful deployment:

1. **Monitor email delivery** - Track success/failure rates
2. **Add more email templates** - Welcome emails, notifications, etc.
3. **Implement rate limiting** - Prevent spam/abuse
4. **Add email analytics** - Track open rates, etc.
5. **Set up monitoring** - Health checks, error alerts