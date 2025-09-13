# How to Build an IPA File for Your Conflict Map App

## Prerequisites
1. **Expo CLI**: Make sure you have Expo CLI installed globally
   ```bash
   npm install -g @expo/cli
   ```

2. **EAS CLI**: Install EAS CLI for building
   ```bash
   npm install -g eas-cli
   ```

3. **Expo Account**: You'll need a free Expo account
   - Sign up at https://expo.dev
   - Or create one via CLI: `eas login`

## Step-by-Step Process

### 1. Login to Expo
```bash
eas login
```
Enter your Expo credentials when prompted.

### 2. Configure the Project
```bash
eas build:configure
```
This will set up your project for EAS Build (if not already done).

### 3. Build Your IPA

#### Option A: Production Build (for App Store)
```bash
npm run build:ios
```
or
```bash
eas build --platform ios
```

#### Option B: Development/Testing Build (for TestFlight or direct install)
```bash
npm run build:ios-simulator
```
or
```bash
eas build --platform ios --profile preview
```

### 4. Download Your IPA
After the build completes (takes 10-20 minutes):
1. You'll get a URL in the terminal
2. Or visit https://expo.dev and go to your project
3. Click on "Builds" tab
4. Download the `.ipa` file when ready

## Build Profiles Explained

- **Production**: For App Store submission
- **Preview**: For TestFlight, internal testing, or direct installation
- **Development**: For development with Expo Go (not needed for IPA)

## Important Notes

1. **Apple Developer Account**: For App Store submission, you'll need a paid Apple Developer account ($99/year)
2. **Code Signing**: EAS Build handles code signing automatically for you
3. **Build Time**: First builds take longer (15-20 minutes), subsequent builds are faster
4. **Free Tier**: Expo provides limited free builds per month

## Alternative: Local Build (Advanced)

If you prefer to build locally with Xcode:
```bash
npx expo prebuild --platform ios
```
This generates the `ios/` folder, then open the `.xcworkspace` file in Xcode.

## Troubleshooting

- **Build Fails**: Check the build logs in the Expo dashboard
- **Signing Issues**: Make sure your bundle identifier is unique
- **Native Dependencies**: All your packages (react-native-maps, etc.) are supported

## Next Steps

Once you have your IPA:
- **TestFlight**: Upload to App Store Connect for beta testing
- **Direct Install**: Install on devices via Apple Configurator or similar tools
- **App Store**: Submit for review and publication

The IPA file will be a complete, standalone iOS application that can be installed on iPhones and iPads.