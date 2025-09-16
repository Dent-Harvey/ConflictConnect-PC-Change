# Xcode Build Guide for Conflict\Connect

This guide will help you build your Conflict\Connect app locally in Xcode and generate an IPA file.

## Prerequisites

- macOS with Xcode installed (latest version recommended)
- Apple Developer account with valid certificates
- All dependencies already installed (CocoaPods setup complete)

## Project Configuration Status

✅ **iOS Project Structure**: Renamed from CrisisConnect to ConflictConnect  
✅ **CocoaPods Dependencies**: Installed successfully  
✅ **Deployment Target**: Set to iOS 15.1 (compatible with SDK 54)  
✅ **App Name**: Updated to "Conflict\Connect" throughout  
✅ **Bundle Identifier**: com.crisisconnect.app  

## Step-by-Step Build Process

### 1. Open the Project in Xcode

```bash
# Navigate to the iOS directory
cd ios

# Open the workspace (NOT the .xcodeproj file)
open ConflictConnect.xcworkspace
```

**Important**: Always open the `.xcworkspace` file, not the `.xcodeproj` file, since we're using CocoaPods.

### 2. Configure Build Settings

1. **Select the ConflictConnect target** in the project navigator
2. **Go to "Signing & Capabilities" tab**
3. **Set your Apple Developer Team**:
   - Team: Select your Apple Developer account
   - Bundle Identifier: `com.crisisconnect.app` (should already be set)
   - Provisioning Profile: Should auto-select based on your team

### 3. Configure Build Scheme

1. **Click on the scheme dropdown** (next to the device selector)
2. **Select "Edit Scheme..."**
3. **In the "Archive" section**:
   - Build Configuration: **Release**
   - Archive Name: ConflictConnect
4. **Click "Close"**

### 4. Build and Archive

#### Option A: Archive for App Store Distribution

1. **Select "Any iOS Device (arm64)"** from the device dropdown
2. **Go to Product → Archive**
3. **Wait for the build to complete** (this may take several minutes)

#### Option B: Build for Development

1. **Select a connected iOS device** or **iOS Simulator**
2. **Press Cmd+R** or go to **Product → Run**

### 5. Export IPA from Archive

After archiving successfully:

1. **Xcode Organizer will open automatically**
2. **Select your archive** (ConflictConnect with today's date)
3. **Click "Distribute App"**
4. **Choose distribution method**:
   - **App Store Connect**: For App Store submission
   - **Ad Hoc**: For testing on specific devices
   - **Enterprise**: For enterprise distribution
   - **Development**: For development testing

5. **Select "Export"** and choose a location to save the IPA

## Build Configuration Details

### Current Settings

- **Deployment Target**: iOS 15.1
- **Bundle Identifier**: com.crisisconnect.app
- **App Name**: Conflict\Connect
- **Version**: 1.0.0
- **Build Number**: 1

### Key Files Modified

- `ios/ConflictConnect.xcodeproj/project.pbxproj` - Project configuration
- `ios/ConflictConnect/Info.plist` - App metadata
- `ios/ConflictConnect.xcodeproj/xcshareddata/xcschemes/ConflictConnect.xcscheme` - Build scheme
- `ios/Podfile` - CocoaPods configuration
- `ios/Podfile.properties.json` - Pod properties

## Troubleshooting

### Common Issues

1. **"Code signing error"**:
   - Ensure you have valid certificates and provisioning profiles
   - Check that your Apple Developer account is properly configured

2. **"Build failed"**:
   - Clean the build folder: **Product → Clean Build Folder**
   - Try building again

3. **"CocoaPods issues"**:
   - If you encounter pod-related errors, run:
     ```bash
     cd ios
     pod install --repo-update
     ```

4. **"Deployment target mismatch"**:
   - Ensure all targets have iOS 15.1 as the deployment target

### Build Commands (if needed)

```bash
# Clean and reinstall pods
cd ios
rm -rf Pods Podfile.lock
pod install

# Clean Xcode build folder
# (Do this in Xcode: Product → Clean Build Folder)
```

## App Store Submission

If you're planning to submit to the App Store:

1. **Archive with Release configuration**
2. **Export as "App Store Connect"**
3. **Upload via Xcode Organizer** or **Transporter app**
4. **Complete App Store Connect configuration**:
   - App information
   - Screenshots
   - App description
   - Privacy policy
   - Age rating

## Notes

- The app is configured for **Expo SDK 54** with **New Architecture enabled**
- All dependencies are properly linked and configured
- The project uses **Hermes** as the JavaScript engine
- **React Native 0.81.4** is the base version

## Support

If you encounter any issues:
1. Check the Xcode console for detailed error messages
2. Ensure all certificates and provisioning profiles are valid
3. Verify that your Apple Developer account has the necessary permissions
4. Try cleaning and rebuilding the project

---

**Last Updated**: September 14, 2025  
**Project Version**: Conflict\Connect 1.0.0  
**Expo SDK**: 54.0.7
