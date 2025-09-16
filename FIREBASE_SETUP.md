# Firebase Setup Guide

This guide will help you set up Firebase for the Crisis Connect app to enable cloud-based user data storage and authentication.

## Prerequisites

- A Google account
- Node.js installed on your system
- The Crisis Connect app project

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `crisis-connect` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable "Email/Password" authentication
5. Optionally enable other providers like Google, Apple, etc.

## Step 3: Create Firestore Database

1. Go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" for development (you can secure it later)
4. Select a location closest to your users
5. Click "Done"

## Step 4: Get Firebase Configuration

1. Go to Project Settings (gear icon next to "Project Overview")
2. Scroll down to "Your apps" section
3. Click "Add app" and select the web icon (</>) 
4. Register your app with a nickname (e.g., "Crisis Connect Web")
5. Copy the Firebase configuration object

## Step 5: Update Firebase Configuration

1. Open `config/firebase.ts` in your project
2. Replace the placeholder configuration with your actual Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-actual-app-id"
};
```

## Step 6: Set Up Firestore Security Rules

1. Go to "Firestore Database" → "Rules"
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow read access to all users for networking features
    match /users/{userId} {
      allow read: if request.auth != null;
    }
  }
}
```

## Step 7: Configure Authentication Context

The app includes both the original `AuthContext` and a new `FirebaseAuthContext`. To use Firebase authentication:

1. In your main app file (usually `app/_layout.tsx`), replace:
   ```typescript
   import { AuthProvider } from '@/contexts/AuthContext';
   ```
   with:
   ```typescript
   import { FirebaseAuthProvider as AuthProvider } from '@/contexts/FirebaseAuthContext';
   ```

## Step 8: Test the Setup

1. Run your app: `npm start`
2. Try creating a new user account
3. Check the Firebase Console to see if user data appears in Firestore
4. Verify that authentication works correctly

## Optional: Set Up Firebase Emulators (Development)

For local development, you can use Firebase emulators:

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize emulators: `firebase init emulators`
4. Start emulators: `firebase emulators:start`

The app is configured to automatically connect to emulators when running in development mode.

## Security Considerations

- **Production**: Update Firestore security rules to be more restrictive
- **API Keys**: Never commit real API keys to version control
- **Environment Variables**: Use environment variables for sensitive configuration
- **User Data**: Implement proper data validation and sanitization

## Troubleshooting

### Common Issues:

1. **"Firebase not initialized"**: Check that your configuration is correct
2. **"Permission denied"**: Verify your Firestore security rules
3. **"Network request failed"**: Ensure your app has internet connectivity
4. **"User not found"**: Check if the user was created successfully in Firebase Console

### Getting Help:

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Support](https://firebase.google.com/support)
- Check the browser console for detailed error messages

## Next Steps

After setting up Firebase:

1. Customize the user profile schema in `types/auth.ts`
2. Add additional Firebase services like Storage for profile pictures
3. Implement push notifications using Firebase Cloud Messaging
4. Set up analytics and crash reporting
5. Configure proper production security rules
