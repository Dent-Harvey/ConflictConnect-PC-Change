# Certificate Troubleshooting Guide

## Common Certificate Issues and Solutions

### **Issue: "Code signing error" or "Provisioning profile doesn't match"**

This happens when the certificate used to sign the app doesn't match the provisioning profile.

### **Solutions:**

#### **1. Automatic Signing (Recommended)**
```bash
# In Xcode:
# 1. Select your project → ConflictConnect target
# 2. Go to "Signing & Capabilities" tab
# 3. Check "Automatically manage signing"
# 4. Select your Apple Developer team
# 5. Xcode will automatically handle certificates
```

#### **2. Manual Certificate Management**
```bash
# If you need specific certificates:
# 1. Uncheck "Automatically manage signing"
# 2. Select your provisioning profile
# 3. Make sure the certificate matches the profile
```

### **Issue: "Untrusted Developer" on Device**

This happens when the device doesn't trust your developer certificate.

#### **Solution:**
```bash
# On your iOS device:
# 1. Go to Settings → General → VPN & Device Management
# 2. Find your developer profile
# 3. Tap "Trust [Your Name]"
# 4. Confirm by tapping "Trust"
```

### **Issue: App Crashes Immediately After Installation**

This can happen with certificate mismatches or missing entitlements.

#### **Solution:**
```bash
# 1. Check device logs in Xcode:
#    Window → Devices and Simulators → Select device → View Device Logs
# 2. Look for crash logs
# 3. Check if it's a certificate or code signing issue
```

## **Certificate Types and When to Use Them:**

### **Development Certificate**
- Used for testing on your own devices
- Allows up to 100 devices
- Valid for 1 year

### **Distribution Certificate**
- Used for App Store submissions
- Used for Ad Hoc distribution
- Valid for 1 year

### **Enterprise Certificate**
- Used for internal enterprise distribution
- Requires Apple Developer Enterprise Program
- Valid for 1 year

## **Step-by-Step Certificate Setup:**

### **1. Check Your Apple Developer Account**
```bash
# Go to: https://developer.apple.com/account/
# 1. Sign in with your Apple ID
# 2. Go to "Certificates, Identifiers & Profiles"
# 3. Check if you have valid certificates
```

### **2. Create New Certificate (if needed)**
```bash
# In Apple Developer Portal:
# 1. Go to "Certificates" → "+" button
# 2. Choose certificate type:
#    - iOS App Development (for testing)
#    - iOS Distribution (for App Store)
# 3. Follow the instructions to create CSR
# 4. Download and install the certificate
```

### **3. Create Provisioning Profile**
```bash
# In Apple Developer Portal:
# 1. Go to "Profiles" → "+" button
# 2. Choose profile type:
#    - iOS App Development (for testing)
#    - iOS App Store (for App Store)
# 3. Select your app ID: com.crisisconnect.app
# 4. Select your certificate
# 5. Select devices (for development)
# 6. Download and install the profile
```

### **4. Update Xcode Settings**
```bash
# In Xcode:
# 1. Select project → ConflictConnect target
# 2. Go to "Signing & Capabilities"
# 3. Set:
#    - Team: Your Apple Developer team
#    - Bundle Identifier: com.crisisconnect.app
#    - Provisioning Profile: Your profile
```

## **Troubleshooting Commands:**

### **Clean Build**
```bash
cd ios
xcodebuild clean -workspace ConflictConnect.xcworkspace -scheme ConflictConnect
```

### **Check Certificates**
```bash
# List all certificates in keychain
security find-identity -v -p codesigning
```

### **Check Provisioning Profiles**
```bash
# List all provisioning profiles
ls ~/Library/MobileDevice/Provisioning\ Profiles/
```

### **Reset Xcode Signing**
```bash
# In Xcode:
# 1. Product → Clean Build Folder
# 2. Delete derived data: ~/Library/Developer/Xcode/DerivedData
# 3. Restart Xcode
# 4. Reconfigure signing settings
```

## **Common Error Messages and Solutions:**

### **"No matching provisioning profiles found"**
```bash
# Solution:
# 1. Check bundle identifier matches
# 2. Create new provisioning profile
# 3. Download and install profile
```

### **"Certificate not found"**
```bash
# Solution:
# 1. Check certificate is installed in keychain
# 2. Create new certificate if expired
# 3. Download and install certificate
```

### **"App installation failed"**
```bash
# Solution:
# 1. Check device is registered in provisioning profile
# 2. Trust developer certificate on device
# 3. Check app entitlements
```

## **Best Practices:**

1. **Use Automatic Signing** when possible
2. **Keep certificates up to date** (renew before expiration)
3. **Use separate certificates** for development and distribution
4. **Test on multiple devices** to ensure compatibility
5. **Keep provisioning profiles updated** when adding new devices

## **Emergency Solutions:**

### **If All Else Fails:**
```bash
# 1. Delete all certificates and profiles
# 2. Create new ones from scratch
# 3. Use automatic signing in Xcode
# 4. Let Xcode handle everything
```

### **Quick Fix for Testing:**
```bash
# 1. Use iOS Simulator (no signing required)
# 2. Use Expo Go app for development
# 3. Use EAS Build for cloud building
```

---

**Need Help?**
- Check Xcode console for detailed error messages
- Verify your Apple Developer account status
- Ensure all certificates are valid and not expired
- Contact Apple Developer Support if issues persist

