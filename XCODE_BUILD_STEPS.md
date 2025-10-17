# Xcode Build Steps - Run on macOS

## Prerequisites Check
✅ All code fixes committed
✅ Package.json configured correctly
✅ Babel configured for expo-router
✅ Navigation architecture fixed

## Steps to Run on Mac

### 1. Pull Latest Changes
```bash
cd /path/to/Conflict-Connect
git pull origin feature/live-realtime-funding
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Generate iOS Native Project
```bash
npx expo prebuild --platform ios --clean
```

This will:
- Generate the `ios/` folder
- Create Xcode project files
- Configure native modules
- Set up CocoaPods dependencies

### 4. Install CocoaPods
```bash
cd ios
pod install
cd ..
```

### 5. Open in Xcode
```bash
open ios/ConflictConnect.xcworkspace
```

**IMPORTANT:** Open the `.xcworkspace` file, NOT the `.xcodeproj` file!

### 6. Configure Signing
In Xcode:
1. Select the project in the navigator
2. Select the "ConflictConnect" target
3. Go to "Signing & Capabilities"
4. Select your Team
5. Xcode will automatically create provisioning profile

### 7. Build & Run
- Select your physical device from the device dropdown
- Press Cmd+R or click the Play button
- Watch the console for any crash logs

## Debugging Crashes

### View Crash Logs in Xcode
1. Window → Devices and Simulators
2. Select your device
3. View Device Logs
4. Filter for "ConflictConnect"

### Common Issues to Check

#### 1. Font Loading Issue
If crash mentions fonts, check:
```
app/_layout.tsx line 45-52
```
Fonts are loaded with `useFonts` hook. Make sure fonts exist in:
```
assets/fonts/Inter-*.ttf
```

#### 2. Firebase Initialization
If crash mentions Firebase:
```
config/firebase.ts
```
Check that .env file exists with Firebase config

#### 3. AsyncStorage
If crash mentions AsyncStorage:
```
contexts/FirebaseAuthContext.tsx
```
AsyncStorage operations need to complete before render

#### 4. Expo Modules
If crash mentions missing modules:
```bash
npx expo install --fix
npx expo prebuild --clean
cd ios && pod install
```

### Enable Better Error Logging

Add this to `app/_layout.tsx` at the very top:

```typescript
import { LogBox } from 'react-native';

// Show all errors (don't ignore any)
LogBox.ignoreAllLogs(false);

// Log unhandled promise rejections
if (typeof global !== 'undefined') {
  global.Promise = Promise;
  
  const originalConsoleError = console.error;
  console.error = (...args) => {
    originalConsoleError(...args);
    // This will show in Xcode console
  };
}
```

## Expected Build Output

### Successful Build:
```
✓ Cleared ios code
✓ Config synced
✓ Using ios/ConflictConnect.xcworkspace
✓ Installing CocoaPods
✓ Build succeeded
```

### App Launch Sequence:
```
1. Launch → Show splash image (iOS native)
2. Load React Native bridge
3. Load fonts (Inter family)
4. Initialize Firebase
5. Show custom splash screen (2 seconds)
6. Check authentication
7. Show role selection OR main app
```

## Crash Investigation Priority

If it crashes, check in this order:

### 1. Metro Bundler Errors
Look for red screen errors in the simulator/device

### 2. Native Crash Logs
```
Window → Devices and Simulators → View Device Logs
```

### 3. Console Output
Look for:
- `[ERROR]` tags
- Red error messages
- Stack traces

### 4. Common Crash Points

**Immediate crash (before splash):**
- Native module linking issue
- Podfile problem
- Missing framework

**Crash after splash:**
- Font loading failure
- Firebase initialization failure
- AsyncStorage permission issue

**Crash on role selection:**
- Firebase auth not initialized
- Network permissions

**Crash on profile setup:**
- Location permissions not granted
- Image picker not configured

## Quick Fixes

### If fonts don't load:
```typescript
// In app/_layout.tsx, make font loading optional:
const [loaded, error] = useFonts({...});

if (error) {
  console.error('Font loading error:', error);
  // Continue anyway
}
```

### If Firebase fails:
```typescript
// In config/firebase.ts, add error handling:
try {
  const app = initializeApp(firebaseConfig);
  export const auth = getAuth(app);
  export const db = getFirestore(app);
} catch (error) {
  console.error('Firebase init error:', error);
  // Create mock exports for testing
}
```

### If AsyncStorage fails:
```typescript
// In FirebaseAuthContext.tsx, wrap AsyncStorage calls:
try {
  await AsyncStorage.setItem(key, value);
} catch (error) {
  console.error('AsyncStorage error:', error);
  // Continue without persisting
}
```

## Files to Watch

These are the most likely crash sources:

1. `app/_layout.tsx` - Font loading, provider initialization
2. `app/index.tsx` - Splash screen, authentication check
3. `config/firebase.ts` - Firebase configuration
4. `contexts/FirebaseAuthContext.tsx` - Auth state management
5. `index.js` - Entry point (very simple now, shouldn't crash)

## Success Indicators

You'll know it's working when:
1. ✅ App launches without immediate crash
2. ✅ "CONFLICT CONNECT" text appears
3. ✅ After 2 seconds, shows role selection
4. ✅ Can select "Scanner" role
5. ✅ Main app with map appears

## Need Help?

If it crashes, send me:
1. The Xcode console output
2. The crash log from Devices window
3. What screen it crashes on (launch, splash, role selection, etc.)

I'll debug it immediately!

---

*Generated: October 17, 2025*
*All code fixes already committed*

