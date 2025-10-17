# Conflict Connect - Firebase Cloud Functions

This directory contains Firebase Cloud Functions for the Conflict Connect app, primarily for email services.

## Setup

### 1. Install Dependencies

```bash
cd functions
npm install
```

### 2. Set SMTP Password

You need to configure the SMTP password in Firebase:

```bash
firebase functions:config:set smtp.password="MutualAid13"
```

To verify the configuration:

```bash
firebase functions:config:get
```

### 3. Build TypeScript

```bash
cd functions
npm run build
```

## Available Functions

### `sendVerificationEmail`

Sends verification code emails to users during registration.

**Parameters:**
- `email` (string): Recipient email address
- `code` (string): 6-digit verification code

**Usage in app:**
```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const sendVerificationEmail = httpsCallable(functions, 'sendVerificationEmail');

const result = await sendVerificationEmail({ 
  email: 'user@example.com', 
  code: '123456' 
});
```

### `sendEmail`

General purpose email sending function.

**Parameters:**
- `to` (string): Recipient email
- `subject` (string): Email subject
- `html` (string): HTML content
- `text` (string): Plain text content

### `testSmtpConnection`

Tests the SMTP connection configuration.

## Development

### Local Testing with Emulator

```bash
# Start Firebase emulators
firebase emulators:start

# In another terminal, test the function
curl -X POST http://localhost:5001/conflictconnect-9e533/us-central1/sendVerificationEmail \
  -H "Content-Type: application/json" \
  -d '{"data": {"email": "test@example.com", "code": "123456"}}'
```

### Deploy to Firebase

```bash
# Deploy only functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:sendVerificationEmail
```

## Monitoring

View function logs:

```bash
firebase functions:log
```

View logs for specific function:

```bash
firebase functions:log --only sendVerificationEmail
```

## Environment Variables

The following configuration is required:

- `smtp.password`: SMTP server password (set via `firebase functions:config:set`)

## Security

- Functions use HTTPS callable format for automatic Firebase Auth integration
- Input validation on all parameters
- Rate limiting handled by Firebase
- SMTP credentials stored in Firebase config (not in code)

## Cost Optimization

- Functions use Node.js 18 runtime
- Memory: 256MB (default)
- Timeout: 60s (default)
- Cold start optimization included

## Troubleshooting

### "Permission denied" errors
- Ensure Firebase project is correctly initialized
- Check that you're logged in: `firebase login`

### SMTP connection failures
- Verify SMTP password is set correctly
- Test with: `firebase functions:shell` then call `testSmtpConnection()`

### Function not deploying
- Check functions/package.json dependencies
- Ensure TypeScript compiles: `npm run build`
- Check Firebase project quota/billing

