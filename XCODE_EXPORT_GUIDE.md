# Xcode Export Guide

This guide explains how to export your React Native Expo app for use in Xcode.

## Prerequisites

1. **macOS with Xcode installed** (latest version recommended)
2. **Expo CLI** installed globally: `npm install -g @expo/cli`
3. **iOS Simulator or physical iOS device** for testing

## Steps to Export for Xcode

### 1. Generate Native iOS Project

Run the following command to generate the native iOS project files:

```bash
npx expo prebuild --platform ios
```

Or if you want to clean and regenerate:

```bash
npx expo prebuild --clean --platform ios
```

This will create an `ios/` folder with the Xcode project files.

### 2. Open in Xcode

After prebuild completes, you can open the project in Xcode:

```bash
npx expo run:ios
```

Or manually open the `.xcworkspace` file:

```bash
open ios/YourAppName.xcworkspace
```

### 3. Xcode Project Structure

After prebuild, you'll have:
- `ios/YourAppName.xcworkspace` - Main Xcode workspace (use this, not .xcodeproj)
- `ios/YourAppName/` - Main app target
- `ios/Pods/` - CocoaPods dependencies

### 4. Building and Running

1. **Select Target Device**: Choose iOS Simulator or connected device
2. **Select Scheme**: Choose your app scheme
3. **Build**: Press Cmd+B or Product → Build
4. **Run**: Press Cmd+R or Product → Run

### 5. Development Workflow

For ongoing development with native iOS code:

1. **Start Metro Bundler**: `npx expo start --dev-client`
2. **Run iOS**: Use Xcode or `npx expo run:ios`
3. **Make Changes**: Edit React Native code, changes will reload automatically
4. **Native Changes**: Edit native iOS code in Xcode, rebuild as needed

### 6. Important Notes

- **Bundle Identifier**: Set to `com.ninegen.conflictmap`
- **Location Permissions**: Already configured for map functionality
- **Maps**: Using React Native Maps (requires Google Maps API key for full functionality)
- **Development Build**: This creates a development build, not for App Store distribution

### 7. Troubleshooting

**If prebuild fails:**
- Ensure you have latest Xcode and command line tools
- Run `npx expo doctor` to check for issues
- Clear cache: `npx expo prebuild --clean`

**If build fails in Xcode:**
- Clean build folder: Product → Clean Build Folder
- Reset simulator: Device → Erase All Content and Settings
- Check iOS deployment target matches your device/simulator

### 8. Production Builds

For App Store distribution, you'll need to:
1. Configure signing certificates in Xcode
2. Set up provisioning profiles
3. Build for release configuration
4. Archive and upload to App Store Connect

## Files Created

After running prebuild, these key files will be generated:
- `ios/` - Complete iOS project
- `.expo/` - Expo configuration cache
- `metro.config.js` - Metro bundler configuration (if not exists)

The generated iOS project includes all necessary native dependencies for your React Native modules like Maps, Location, etc.