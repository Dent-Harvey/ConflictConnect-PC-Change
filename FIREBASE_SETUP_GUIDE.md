# Firebase Setup Guide for Conflict Connect

This guide walks you through setting up Firebase for your Conflict Connect app.

## 🏗️ Firebase Services Used

Your app uses the following Firebase services:
- **Firebase Authentication** - User login and registration
- **Firestore Database** - Data storage and retrieval
- **Firebase Storage** - File storage (images, documents)

## 📋 Prerequisites

1. **Firebase Account**: Create a free account at [firebase.google.com](https://firebase.google.com)
2. **Node.js**: Version 18+ installed
3. **Expo CLI**: `npm install -g @expo/cli`

## 🚀 Step-by-Step Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project" or "Add project"
3. Enter project name: `conflictconnect-project` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

### Step 2: Add Firebase to Your App

1. In Firebase Console, click "Add app" and select the web icon (</>)
2. Register your app with nickname: `Conflict Connect Web`
3. **Copy the Firebase configuration object** - you'll need this for the next step

### Step 3: Configure Firebase in Your App

1. Open `config/firebase.ts` in your project
2. Replace the placeholder configuration with your actual Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id",
  measurementId: "your-measurement-id" // Optional
};
```

### Step 4: Enable Authentication

1. In Firebase Console, go to "Authentication" → "Sign-in method"
2. Enable the following providers:
   - **Email/Password** (for basic auth)
   - **Google** (optional, for social login)
   - **Anonymous** (optional, for guest users)

### Step 5: Set Up Firestore Database

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location close to your users
5. Click "Done"

### Step 6: Configure Firestore Security Rules

1. In Firestore Database, go to "Rules" tab
2. Replace the default rules with these (adjust as needed):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Conflicts are readable by all authenticated users
    match /conflicts/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Resources are readable by all authenticated users
    match /resources/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // User needs are private to each user
    match /userNeeds/{document} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
  }
}
```

### Step 7: Set Up Firebase Storage

1. In Firebase Console, go to "Storage"
2. Click "Get started"
3. Choose "Start in test mode" (for development)
4. Select the same location as your Firestore database
5. Click "Done"

### Step 8: Configure Storage Security Rules

1. In Storage, go to "Rules" tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can upload files to their own folder
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Public images (like conflict photos) are readable by all
    match /public/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

## 🔧 Environment Variables (Optional)

For better security, you can use environment variables:

1. Create a `.env` file in your project root:
```bash
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
```

2. Update `config/firebase.ts` to use environment variables:
```typescript
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};
```

## 🧪 Testing Your Setup

1. **Install dependencies**:
```bash
npm install
```

2. **Start your app**:
```bash
npx expo start
```

3. **Test authentication**: Try creating an account and logging in
4. **Test Firestore**: Check if data is being saved/retrieved
5. **Test Storage**: Try uploading an image

## 🔒 Security Best Practices

1. **Never commit your Firebase config** with real API keys to public repositories
2. **Use environment variables** for production
3. **Review and tighten security rules** before going to production
4. **Enable App Check** for additional security (optional)
5. **Set up proper user roles** and permissions

## 🚨 Troubleshooting

### Common Issues:

1. **"Firebase App named '[DEFAULT]' already exists"**
   - Solution: Make sure you're only initializing Firebase once

2. **"Permission denied" errors**
   - Solution: Check your Firestore/Storage security rules

3. **Authentication not working**
   - Solution: Verify your Firebase config and enabled sign-in methods

4. **Build errors**
   - Solution: Make sure all Firebase packages are installed:
   ```bash
   npm install firebase
   ```

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Expo Firebase Integration](https://docs.expo.dev/guides/using-firebase/)

## 🎯 Next Steps

After setting up Firebase:
1. Test all authentication flows
2. Verify data is saving to Firestore
3. Test file uploads to Storage
4. Review and customize security rules
5. Set up monitoring and analytics (optional)

