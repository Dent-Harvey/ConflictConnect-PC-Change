# Crisis Connect Email Service Backend

This is a Node.js/Express backend service that handles email sending for the Crisis Connect mobile app.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Start the Service

```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

The service will start on `http://localhost:3001`

### 3. Test the Service

```bash
# Run health check and connection tests
npm test
```

## 📧 Email Configuration

The service is configured to use:
- **SMTP Host**: mail.privateemail.com
- **Port**: 465 (SSL)
- **Email**: conflictconnect@neffcreative.co
- **Password**: MutualAid13

## 🛠 API Endpoints

### Health Check
```bash
GET /health
```

### Test SMTP Connection
```bash
GET /api/email/test-connection
```

### Send Verification Email
```bash
POST /api/email/send-verification
Content-Type: application/json

{
  "email": {
    "to": "user@example.com",
    "subject": "Crisis Connect - Verify Your Email",
    "html": "<html>...",
    "text": "Plain text version..."
  },
  "from": {
    "name": "Crisis Connect",
    "email": "conflictconnect@neffcreative.co"
  },
  "project_id": "4e5617ee-08cd-4dcb-be30-a0923ebd5e6c"
}
```

### Send General Email
```bash
POST /api/email/send
Content-Type: application/json

{
  "to": "user@example.com",
  "subject": "Your Subject",
  "html": "<html>...",
  "text": "Plain text version...",
  "from": {
    "name": "Crisis Connect",
    "email": "conflictconnect@neffcreative.co"
  },
  "project_id": "4e5617ee-08cd-4dcb-be30-a0923ebd5e6c"
}
```

## 🌐 Deployment Options

### Option 1: Heroku
1. Create a Heroku app: `heroku create crisis-connect-email-api`
2. Deploy: `git push heroku main`
3. Set environment variables if needed

### Option 2: Railway
1. Connect your GitHub repo to Railway
2. Deploy automatically
3. Note your app URL

### Option 3: DigitalOcean App Platform
1. Create a new app from GitHub
2. Select Node.js environment
3. Deploy

### Option 4: AWS/Google Cloud
1. Use container services or serverless functions
2. Deploy using their respective CLIs

## 🔧 Environment Variables (Optional)

You can override default settings with environment variables:

```bash
PORT=3001                    # Server port
SMTP_HOST=mail.privateemail.com
SMTP_PORT=465
SMTP_USER=conflictconnect@neffcreative.co
SMTP_PASS=MutualAid13
```

## 🔗 Mobile App Integration

After deploying your backend, update the React Native app:

1. Set your backend URL in the mobile app:
```typescript
// In services/backendEmailService.ts
const BACKEND_API_BASE = 'https://your-deployed-backend.herokuapp.com/api';
```

2. Use the backend email service in your app:
```typescript
import { sendVerificationEmail } from '@/services/backendEmailService';

const result = await sendVerificationEmail(email, code);
```

## 🧪 Testing

### Local Testing
```bash
# Start the server
npm run dev

# In another terminal, run tests
npm test
```

### Production Testing
```bash
curl https://your-deployed-backend.com/health
```

## 📝 Logs

The service logs all email operations:
- Email send attempts
- SMTP connection status  
- Error details
- Success confirmations

## 🔐 Security Notes

- Keep SMTP credentials secure
- Use environment variables in production
- Enable CORS only for your mobile app domains
- Consider rate limiting for production use

## 🆘 Troubleshooting

### Common Issues

1. **SMTP Connection Failed**
   - Check credentials
   - Verify SMTP server settings
   - Check firewall/network access

2. **Email Not Received**
   - Check spam folder
   - Verify email address format
   - Check SMTP logs

3. **Port Already in Use**
   - Change the PORT environment variable
   - Kill existing processes on port 3001

### Debug Mode
Set `NODE_ENV=development` for detailed logging.

## 📞 Support

For issues with the Crisis Connect Email Service, check the logs and verify your SMTP configuration.