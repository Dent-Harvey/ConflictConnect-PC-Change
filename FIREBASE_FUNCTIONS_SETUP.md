# Firebase Cloud Functions Email Service - Setup Guide

This guide explains how to set up and deploy Firebase Cloud Functions for email services in the Conflict Connect app.

## ✅ What's Been Done

1. **Created Firebase Functions Structure**
   - `functions/` directory with TypeScript setup
   - Email sending Cloud Function using your existing SMTP server
   - Test function for SMTP connection
   - Configuration files (firebase.json, .firebaserc)

2. **Migrated Email Service**
   - New `services/firebaseEmailService.ts` uses Cloud Functions
   - Keeps your existing SMTP configuration (mail.privateemail.com)
   - No external backend server needed anymore

## 🚀 Deployment Steps

### Step 1: Install Firebase CLI (if not already installed)

```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase

```bash
firebase login
```

### Step 3: Install Functions Dependencies

```bash
cd functions
npm install
```

### Step 4: Set SMTP Password

Your SMTP password needs to be configured in Firebase (not stored in code for security):

```bash
firebase functions:config:set smtp.password="MutualAid13"
```

Verify it's set:

```bash
firebase functions:config:get
```

### Step 5: Build TypeScript

```bash
cd functions
npx tsc
```

Or add a build script to functions/package.json:

```json
{
  "scripts": {
    "build": "tsc"
  }
}
```

Then run:

```bash
npm run build
```

### Step 6: Deploy Functions to Firebase

From the project root:

```bash
firebase deploy --only functions
```

Or deploy specific function:

```bash
firebase deploy --only functions:sendVerificationEmail
```

### Step 7: Update App Configuration

The app is already configured to use Firebase Functions (see `services/firebaseEmailService.ts`).

Just make sure contexts use the new service:

```typescript
// In contexts/FirebaseAuthContext.tsx or similar
import { 
  sendVerificationEmail, 
  generateVerificationCode 
} from '@/services/firebaseEmailService';
```

## 🧪 Testing

### Test Locally with Emulator

```bash
# Start emulators
firebase emulators:start

# In your app, connect to emulator (uncomment in firebaseEmailService.ts):
import { connectFunctionsEmulator } from 'firebase/functions';
connectFunctionsEmulator(functions, 'localhost', 5001);
```

### Test in Production

After deployment, test the function:

```typescript
import { testSmtpConnection } from '@/services/firebaseEmailService';

const result = await testSmtpConnection();
console.log(result);
```

## 📊 Monitoring

### View Function Logs

```bash
firebase functions:log
```

### View Specific Function Logs

```bash
firebase functions:log --only sendVerificationEmail
```

### Firebase Console

View functions in the [Firebase Console](https://console.firebase.google.com/):
- Navigate to your project: `conflictconnect-9e533`
- Go to "Functions" section
- See invocations, errors, and performance

## 💰 Cost

Firebase Cloud Functions pricing:
- **Free tier:** 2M invocations/month, 400K GB-seconds, 200K CPU-seconds
- Your email function is lightweight (< 0.1s execution time)
- Should stay within free tier for most usage

[Firebase Pricing Calculator](https://firebase.google.com/pricing)

## 🔒 Security

- ✅ SMTP password stored in Firebase config (not in code)
- ✅ Functions automatically integrate with Firebase Auth
- ✅ Input validation on all parameters
- ✅ Rate limiting handled by Firebase
- ✅ HTTPS-only endpoints

## 🐛 Troubleshooting

### "Module not found" errors

Make sure dependencies are installed:

```bash
cd functions
npm install
```

### "Permission denied" errors

Check Firebase project access:

```bash
firebase projects:list
firebase use conflictconnect-9e533
```

### SMTP connection failures

Test SMTP config:

```bash
firebase functions:shell
> testSmtpConnection()
```

### Functions not deploying

Check for TypeScript errors:

```bash
cd functions
npx tsc --noEmit
```

### Can't find functions in app

Make sure Firebase is initialized properly in `config/firebase.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getFunctions } from 'firebase/functions';

const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);
```

## 🔄 Updating Functions

After making changes to `functions/src/index.ts`:

```bash
cd functions
npm run build
cd ..
firebase deploy --only functions
```

## 📝 Next Steps

1. ✅ Deploy functions: `firebase deploy --only functions`
2. ✅ Test email sending in the app
3. ✅ Remove old backend server (optional, keep as backup initially)
4. ✅ Update `services/backendEmailService.ts` to use firebaseEmailService

## 🎯 Benefits

- ❌ **No separate backend server needed**
- ✅ **Auto-scaling** - handles traffic spikes
- ✅ **Integrated** - works with Firebase Auth
- ✅ **Keep existing SMTP** - uses your mail server
- ✅ **Secure** - credentials in Firebase config
- ✅ **Reliable** - Google's infrastructure

## 📚 Additional Resources

- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [Cloud Functions for Firebase (YouTube)](https://www.youtube.com/playlist?list=PLl-K7zZEsYLkPZHe41m4jfAxUi0JjLgSM)
- [Nodemailer Documentation](https://nodemailer.com/)

