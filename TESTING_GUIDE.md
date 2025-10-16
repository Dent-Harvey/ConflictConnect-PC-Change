# Testing Guide - Complete Flow Verification

This guide helps you test the complete user flow from role selection to Firebase storage.

## 🧪 Test Checklist

### Pre-Testing Setup
- [ ] Backend deployed to Heroku
- [ ] Backend URL updated in `services/backendEmailService.ts`
- [ ] Firebase project configured
- [ ] Mobile app running (`npx expo start`)

## Test 1: Email Backend Service

### 1.1 Health Check
```bash
# Test backend is alive
curl https://your-app-name.herokuapp.com/health

# Expected response:
{
  "status": "OK",
  "service": "Crisis Connect Email Service",
  "timestamp": "2024-..."
}
```

### 1.2 SMTP Connection
```bash
# Test SMTP connection
curl https://your-app-name.herokuapp.com/api/email/test-connection

# Expected response:
{
  "success": true,
  "message": "SMTP connection verified successfully"
}
```

## Test 2: Scanner Role (No Email/Profile Required)

1. Open the app
2. Select "Scanner" role
3. **Expected**: Immediate access to main map
4. **Expected**: No email verification screen
5. **Expected**: No profile setup screen

**Result**: ✅ Pass / ❌ Fail

## Test 3: Conflict Controller Role (Password Only)

1. Open the app
2. Select "Conflict Controller" role
3. Enter password: `mutual aid`
4. **Expected**: Immediate access to admin dashboard
5. **Expected**: No email verification
6. **Expected**: No profile setup

**Result**: ✅ Pass / ❌ Fail

## Test 4: OTG Role (Full Flow - Email + Profile)

### 4.1 Role Selection
1. Open the app (or logout first)
2. Select "On The Ground (OTG)" role
3. Enter your email address
4. Tap "Continue" or "Login"

**Expected**: App shows "Email Verification Screen"

### 4.2 Email Verification
1. Check your email inbox (and spam folder)
2. **Expected**: Email from `conflictconnect@neffcreative.co`
3. **Expected**: Subject: "Crisis Connect - Verify Your Email"
4. **Expected**: Email contains a 6-digit code
5. Note the code

**Troubleshooting if no email**:
- Check Heroku logs: `heroku logs --tail`
- Verify SMTP test passed in Test 1.2
- Check spam folder

### 4.3 Code Entry
1. Enter the 6-digit code in the app
2. Tap "Verify Code"

**Expected**: 
- ✅ Success message (or auto-advance)
- Location permission request (grant it)
- **Profile Setup Screen appears**

### 4.4 Profile Setup Screen Verification
**Expected UI elements**:
- ✅ "Create Your Profile" title
- ✅ Verified email and location displayed (green box at top)
- ✅ First Name field (required, red asterisk)
- ✅ Last Name field (required, red asterisk)
- ✅ Organization field (optional)
- ✅ Phone Number field (optional)
- ✅ Availability options:
  - Emergency Only
  - Weekends
  - Part Time (default selected)
  - Full Time
- ✅ Expertise areas (chips/tags):
  - Medical/Healthcare
  - Emergency Response
  - Logistics/Supply Chain
  - Transportation
  - Communication/Tech
  - Security/Safety
  - Mental Health Support
  - Language Translation
  - Legal/Administrative
  - Construction/Engineering
  - Food/Nutrition
  - Education/Training
- ✅ Bio text area (optional)
- ✅ "Create Profile" button
- ✅ "Skip for now" link at bottom

### 4.5 Fill Out Profile
1. Enter First Name: "Test"
2. Enter Last Name: "User"
3. Enter Organization: "Test Organization" (optional)
4. Enter Phone: "+1 (555) 123-4567" (optional)
5. Select Availability: "Part Time"
6. Select expertise: "Medical/Healthcare" and "Emergency Response"
7. Enter Bio: "This is a test user for verification"
8. Tap "Create Profile"

**Expected**:
- ✅ Loading indicator appears
- ✅ Profile is created
- ✅ User is redirected to main app

### 4.6 Verify Firebase Storage

1. Go to Firebase Console: https://console.firebase.google.com
2. Select project: `conflictconnect-9e533`
3. Go to "Firestore Database"
4. Look for `users` collection
5. Find your user document (starts with `user_`)

**Expected Document Structure**:
```javascript
{
  id: "user_1234567890",
  email: "your-test-email@example.com",
  role: "otg",
  location: {
    latitude: [number],
    longitude: [number],
    address: "City, State"
  },
  isLocationVerified: true,
  isEmailVerified: true,
  profile: {
    firstName: "Test",
    lastName: "User",
    organization: "Test Organization",
    phoneNumber: "+1 (555) 123-4567",
    expertise: ["Medical/Healthcare", "Emergency Response"],
    availability: "part_time",
    bio: "This is a test user for verification"
  },
  hasCompletedProfile: true,
  createdAt: [Timestamp],
  updatedAt: [Timestamp]
}
```

**Result**: ✅ Pass / ❌ Fail

### 4.7 Verify Local Storage

1. In your app, check AsyncStorage
2. Use React Native Debugger or:
   ```javascript
   // In your app code temporarily
   import AsyncStorage from '@react-native-async-storage/async-storage';
   AsyncStorage.getItem('@crisis_compass_auth').then(console.log);
   ```

**Expected**: Same user data as Firebase

**Result**: ✅ Pass / ❌ Fail

## Test 5: Hand Role (Should be identical to OTG)

Repeat Test 4 with "Hand" role instead of "OTG"

**Expected**: Same flow and results

**Result**: ✅ Pass / ❌ Fail

## Test 6: Profile Skip Feature

### 6.1 Start Fresh
1. Logout or clear app data
2. Select "OTG" or "Hand" role
3. Complete email verification
4. **Wait for Profile Setup Screen**

### 6.2 Test Skip
1. Tap "Skip for now" at bottom
2. **Expected**: Alert/confirmation dialog appears
3. **Expected**: Dialog message mentions profile is required for resources
4. Tap "Skip for Now" in dialog

**Expected**:
- ✅ User is taken to main app
- ✅ hasCompletedProfile is set to true in Firebase
- ✅ profile field is undefined/empty

**Result**: ✅ Pass / ❌ Fail

## Test 7: Profile Edit (After Creation)

1. Login as a user with completed profile
2. Go to Profile tab (if exists)
3. Try to edit profile

**Expected**: Profile update should also save to Firebase

**Result**: ✅ Pass / ❌ Fail

## 🐛 Common Issues & Solutions

### Issue: Email not received
**Solution**:
1. Check spam folder
2. Verify Heroku backend is running: `heroku ps`
3. Check logs: `heroku logs --tail`
4. Test SMTP connection endpoint
5. Verify email credentials are correct in backend

### Issue: "Invalid verification code"
**Solution**:
- Make sure you're entering the exact 6-digit code
- Code expires in 10 minutes
- Check if code was typed correctly (no spaces)
- Request a new code using "Resend Code"

### Issue: Location permission denied
**Solution**:
- OTG and Hand roles require location
- Grant location permission in device settings
- Restart the app

### Issue: Profile screen not appearing
**Solution**:
- Only OTG and Hand roles see profile screen
- Scanner and Conflict Controller skip it
- Make sure you completed email verification first

### Issue: Firebase not saving
**Solution**:
1. Check Firebase Console for errors
2. Verify Firebase config in `config/firebase.ts`
3. Check Firestore rules (should allow authenticated writes)
4. Even if Firebase fails, local storage should work

### Issue: Backend URL not working
**Solution**:
- Ensure URL includes `/api` suffix
- Clear Expo cache: `npx expo start --clear`
- Restart backend: `heroku restart`

## 📊 Success Criteria

✅ **All tests pass if**:
1. Scanner and Conflict Controller skip email/profile
2. OTG and Hand receive verification emails
3. Email verification code works
4. Profile setup screen appears after verification
5. Profile data is collected correctly
6. User data is saved to Firebase Firestore
7. User data is also saved to AsyncStorage
8. User can access main app after profile setup
9. Skip profile option works (with warning)

## 🎯 Performance Checks

- [ ] Email delivery time: < 30 seconds
- [ ] Code verification: < 2 seconds
- [ ] Profile creation: < 3 seconds
- [ ] Firebase save: < 2 seconds
- [ ] Total onboarding time: < 2 minutes

## 📝 Test Report Template

```
Date: [Date]
Tester: [Name]
Device: [iOS/Android]
App Version: [Version]

Test Results:
- Backend Health: ✅/❌
- SMTP Connection: ✅/❌
- Scanner Role: ✅/❌
- Conflict Controller: ✅/❌
- OTG Email Verification: ✅/❌
- Profile Setup UI: ✅/❌
- Profile Creation: ✅/❌
- Firebase Storage: ✅/❌
- Local Storage: ✅/❌
- Hand Role: ✅/❌
- Profile Skip: ✅/❌

Issues Found:
1. [List any issues]

Notes:
[Any additional observations]
```

## 🔄 Regression Testing

After any changes to authentication or profile code, re-run:
1. Test 4 (OTG full flow)
2. Test 6 (Profile skip)
3. Verify Firebase storage

## ✅ Sign-off

Once all tests pass:
- [ ] Email verification working
- [ ] Profile setup screen functional
- [ ] Firebase integration confirmed
- [ ] All user roles tested
- [ ] Documentation reviewed

**Status**: Ready for Production / Needs Fixes

