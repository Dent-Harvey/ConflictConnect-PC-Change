# 🔴 iOS Production Build Crash - Debugging Guide

## Problem
The iOS IPA build completed successfully but **crashes on launch**.

Build URL: https://expo.dev/artifacts/eas/37uf6qBU8AZZzyDThG1LDV.ipa

---

## 🧪 Testing Strategy

### 1. Test in Web (Currently Running)
```
http://localhost:8081
```
- Open in browser
- Check if app loads
- Test all features
- Check browser console for errors

### 2. Test with Expo Go
- **On iPhone**: Open Expo Go app
- **Scan QR code** from terminal
- Test if it loads and works
- Check for any runtime errors

### 3. Compare Results
- ✅ **If both work**: Production build configuration issue
- ❌ **If both crash**: Code issue needs fixing
- ⚠️ **If one works**: Platform-specific issue

---

## 🔍 Common Crash Causes

### 1. Firebase Emulator Configuration ⚠️
**Most Likely Culprit!**

Your `.env` has:
```
EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST
EXPO_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST
```

**Problem**: Production build tries to connect to localhost emulators that don't exist!

**Solution**: These should only be set in development, not production.

Check `config/firebase.ts`:
```typescript
// Connect to emulators in development
if (__DEV__) {
  if (process.env.EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST) {
    connectAuthEmulator(auth, `http://${process.env.EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST}`);
  }
}
```

The `__DEV__` check should prevent this, but verify it's working.

### 2. Missing Production Firebase Config
- Production build might not have Firebase credentials
- Check if environment variables are available in production

### 3. Code Signing / Entitlements
- Push notifications capability disabled
- May need to be enabled if code expects it

### 4. React Native Persistence Import
The fix we made earlier:
```typescript
let getReactNativePersistence: any;
if (Platform.OS !== 'web') {
  const authModule = require('firebase/auth');
  getReactNativePersistence = authModule.getReactNativePersistence;
}
```

This might fail in production if the module structure is different.

### 5. Async Storage
If AsyncStorage isn't properly initialized in production

### 6. Bundle/Metro Issues
- Missing assets
- Incorrect imports
- Tree-shaking removing necessary code

---

## 🔧 Quick Fixes to Try

### Fix 1: Remove Emulator Config from Production

**Update `config/firebase.ts`:**
```typescript
// Only connect to emulators in DEV mode
if (__DEV__ && process.env.NODE_ENV !== 'production') {
  if (process.env.EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST) {
    connectAuthEmulator(auth, `http://${process.env.EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST}`);
    console.log('Firebase Auth Emulator connected');
  }
  if (process.env.EXPO_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST) {
    connectFirestoreEmulator(db, process.env.EXPO_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST, 8080);
    console.log('Firebase Firestore Emulator connected');
  }
}
```

### Fix 2: Use Top-Level Import for React Native Persistence

**Replace the dynamic require with:**
```typescript
import { getReactNativePersistence } from 'firebase/auth';

// Then use it directly
if (Platform.OS !== 'web') {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}
```

Metro bundler should tree-shake this for web automatically.

### Fix 3: Add Error Boundary

Wrap the app in an error boundary to catch and log crashes:
```typescript
import * as ErrorRecovery from 'expo-error-recovery';

// In App.tsx
try {
  // your app code
} catch (error) {
  console.error('App crashed:', error);
  ErrorRecovery.setRecoveryProps({ error: error.message });
}
```

---

## 📊 Debugging Steps

### Step 1: Check Web Version
1. Open http://localhost:8081 in browser
2. Open Developer Console (F12)
3. Look for errors in Console tab
4. Try to reproduce the crash

### Step 2: Check Expo Go
1. Open Expo Go on iPhone
2. Scan QR code from terminal
3. Watch for crash
4. Check Expo Go logs (shake device → Show Developer Menu → Debug)

### Step 3: Get Crash Logs from Production Build
If you installed the IPA:
1. Connect iPhone to Mac
2. Open Xcode → Window → Devices and Simulators
3. Select your device
4. Click "View Device Logs"
5. Find crash log for Conflict Connect

### Step 4: Check EAS Build Logs
```bash
npx eas-cli build:view 111a2532-84d6-4241-a143-fa49563c3887
```

Or visit:
https://expo.dev/accounts/samcat/projects/conflict-connect/builds/111a2532-84d6-4241-a143-fa49563c3887

---

## 🎯 Next Build Strategy

### Option A: Development Build (Recommended)
Build a development version that includes debugging:
```bash
npx eas-cli build --platform ios --profile development
```

This allows:
- Debug logging
- Hot reloading
- Better crash reporting

### Option B: Add Sentry/Crash Reporting
Add crash reporting to see what's failing:
```bash
npx expo install @sentry/react-native
```

### Option C: Simplify Production Config
Create a production-specific config without emulators:
```bash
# In eas.json, add production environment variables
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST": "",
        "EXPO_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST": ""
      }
    }
  }
}
```

---

## 📝 Current Status

✅ **Build Completed**: https://expo.dev/artifacts/eas/37uf6qBU8AZZzyDThG1LDV.ipa  
❌ **Crashes on Launch**: Need to debug  
🔄 **Dev Server Running**: Test in browser and Expo Go  
🎯 **Next Step**: Check web and Expo Go versions for errors  

---

## 🆘 If Nothing Works

1. **Rollback Firebase changes** - Use the old require() method
2. **Disable emulators completely** in production
3. **Build without Firebase** - Comment out Firebase initialization temporarily
4. **Check app.json** - Ensure all required permissions/entitlements
5. **Verify bundle ID** matches Apple Developer Portal

---

**Current Testing**: Web + Expo Go available now at http://localhost:8081

