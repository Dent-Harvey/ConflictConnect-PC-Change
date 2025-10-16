# Complete Setup Guide - Crisis Connect

This guide covers the complete setup for your Crisis Connect app with email verification, profile creation, and Firebase storage.

## ✅ What's Already Configured

### 1. Profile Setup Flow
- ✅ Email verification screen exists
- ✅ Profile setup screen exists  
- ✅ Flow: Role Selection → Email Verification → **Profile Setup** → Main App
- ✅ Profiles include: name, organization, phone, expertise, availability, bio

### 2. Firebase Integration
- ✅ Firebase configured (`config/firebase.ts`)
- ✅ Firestore database ready
- ✅ User profiles now save to Firebase Firestore
- ✅ Also maintains local AsyncStorage for offline support

### 3. Email Service
- ✅ Backend email service created (`backend/emailService.js`)
- ✅ Uses Nodemailer with your Namecheap SMTP server
- ✅ Server: `mail.privateemail.com`
- ✅ Email: `conflictconnect@neffcreative.co`

## 🚀 What You Need to Do

### Step 1: Deploy Email Backend to Heroku (5 minutes)

#### Option A: Quick Deploy with CLI
```bash
# Install Heroku CLI if not already installed
# Windows: Download from https://devcenter.heroku.com/articles/heroku-cli
# Mac: brew tap heroku/brew && brew install heroku

cd backend
heroku login
heroku create crisis-connect-email-service
git init
git add .
git commit -m "Deploy email service"
heroku git:remote -a crisis-connect-email-service
git push heroku main
```

#### Option B: Deploy via Dashboard (No CLI needed)
1. Go to https://dashboard.heroku.com/
2. Click "New" → "Create new app"
3. Name: `crisis-connect-email-service`
4. Go to "Deploy" tab
5. Connect GitHub and select your repo
6. Click "Deploy Branch"

**Result**: You'll get a URL like `https://crisis-connect-email-service.herokuapp.com`

### Step 2: Update Mobile App with Backend URL

Edit `services/backendEmailService.ts`, line 25:

**Change from:**
```typescript
const BACKEND_API_BASE = process.env.EXPO_PUBLIC_BACKEND_API_URL || 'http://localhost:3001/api';
```

**Change to:**
```typescript
const BACKEND_API_BASE = process.env.EXPO_PUBLIC_BACKEND_API_URL || 'https://your-app-name.herokuapp.com/api';
```

Replace `your-app-name` with your actual Heroku app name.

### Step 3: Test the Complete Flow

1. **Start your mobile app**
   ```bash
   npm start
   # or
   npx expo start
   ```

2. **Test as OTG or Hand user** (roles that require email verification)
   - Choose "On The Ground (OTG)" or "Hand" role
   - Enter your email address
   - You should receive a verification code email
   - Enter the 6-digit code
   - **Complete the profile setup form** with your information
   - Your user profile will be saved to both Firebase Firestore and local storage

3. **Verify Firebase Storage**
   - Go to Firebase Console: https://console.firebase.google.com
   - Select your project: `conflictconnect-9e533`
   - Go to "Firestore Database"
   - You should see a `users` collection with your user document

## 📊 What Happens Now

### User Creation Flow (OTG/Hand roles):

1. **Role Selection**: User selects OTG or Hand role
2. **Email Entry**: User enters email address
3. **Email Sent**: Backend sends verification code via Namecheap SMTP
4. **Code Verification**: User enters 6-digit code
5. **Location Capture**: App gets user's location (with permission)
6. **Profile Setup Screen**: User fills out:
   - First Name (required)
   - Last Name (required)
   - Organization (optional)
   - Phone Number (optional)
   - Availability: Emergency Only, Weekends, Part Time, or Full Time
   - Expertise Areas: Medical, Emergency Response, Logistics, etc. (optional)
   - Bio (optional)
7. **Firebase Storage**: User saved to Firestore `users` collection
8. **Local Storage**: User also saved to AsyncStorage for offline access
9. **Main App**: User proceeds to the main app

### User Data Storage:

**Firebase Firestore** (`users` collection):
```javascript
{
  id: "user_1234567890",
  email: "user@example.com",
  role: "otg", // or "hand"
  location: {
    latitude: 40.7128,
    longitude: -74.0060,
    address: "New York, NY"
  },
  isLocationVerified: true,
  isEmailVerified: true,
  profile: {
    firstName: "John",
    lastName: "Doe",
    organization: "Red Cross",
    phoneNumber: "+1 (555) 123-4567",
    expertise: ["Medical/Healthcare", "Emergency Response"],
    availability: "part_time",
    bio: "5 years of emergency response experience..."
  },
  hasCompletedProfile: true,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Local AsyncStorage**: Same data, for offline support

## 🔧 Troubleshooting

### Email not being sent?
1. Check Heroku logs: `heroku logs --tail`
2. Verify backend is running: Visit `https://your-app-name.herokuapp.com/health`
3. Test SMTP: Visit `https://your-app-name.herokuapp.com/api/email/test-connection`

### Profile not showing?
- Make sure you're logged in as OTG or Hand role (not Scanner or Conflict Controller)
- Scanner and Conflict Controller skip profile setup by design

### Firebase not saving?
1. Check Firebase Console for errors
2. Verify Firebase config in `config/firebase.ts`
3. Check app logs for Firebase errors (they'll be logged but won't stop the flow)

### Backend URL issues?
- Make sure the URL ends with `/api` (not just `.herokuapp.com`)
- Restart Expo after changing the URL: `npx expo start --clear`

## 📱 Testing Different Roles

### Scanner Role
- No email verification
- No profile setup
- Direct access to map

### Conflict Controller
- Password: "mutual aid"
- No email verification
- No profile setup
- Full admin access

### OTG (On The Ground)
- **Requires email verification** ✅
- **Requires profile setup** ✅
- Can request resources
- Can submit conflict reports

### Hand (Helper)
- **Requires email verification** ✅
- **Requires profile setup** ✅
- Can provide resources
- Can fulfill requests

## 🎉 You're All Set!

Your app now has:
- ✅ Email verification with Namecheap SMTP via Heroku
- ✅ Profile creation screen
- ✅ Firebase Firestore user storage
- ✅ Local storage for offline support
- ✅ Complete user onboarding flow

## 📚 Additional Resources

- **Backend Deployment**: See `backend/HEROKU_DEPLOY.md`
- **Quick Start**: See `backend/QUICK_START.md`
- **Firebase Setup**: See `FIREBASE_SETUP_GUIDE.md`
- **Backend Email Service**: See `BACKEND_SETUP_GUIDE.md`

## 🆘 Need Help?

If you encounter any issues:
1. Check the logs: `heroku logs --tail` (backend) or Expo console (mobile)
2. Verify your Heroku app is running: `heroku ps`
3. Test the health endpoint in your browser
4. Check Firebase Console for any errors

Happy coding! 🚀

