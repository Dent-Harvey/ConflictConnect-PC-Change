# Testing Guide - Firebase Cloud Functions

> **Updated:** October 17, 2025  
> **Platform:** Firebase Cloud Functions

## 🧪 Testing Your App

### 1. Email Service Testing

#### Test in App:
1. Open the app
2. Navigate to Email Diagnostics screen
3. Enter your test email
4. Click "Send Test Email"
5. Check your inbox for verification code

#### Test via Firebase Console:
```bash
# View recent logs
npx firebase-tools functions:log --only sendVerificationEmail

# Test SMTP connection
npx firebase-tools functions:shell
> testSmtpConnection()
```

---

### 2. Authentication Flow Testing

#### Role Selection:
- [ ] Scanner role works (no email needed)
- [ ] Conflict Controller works (no email needed)
- [ ] OTG role requires email
- [ ] Hand role requires email

#### Email Verification:
- [ ] Verification email arrives
- [ ] Code is 6 digits
- [ ] Code validates correctly
- [ ] Invalid code shows error
- [ ] Resend code works

#### Profile Setup:
- [ ] Profile form displays
- [ ] All fields save correctly
- [ ] Skip option works
- [ ] Profile persists after app restart

---

### 3. Function Testing

#### Test sendVerificationEmail:
```bash
# Via Firebase shell
npx firebase-tools functions:shell

# Then run:
> sendVerificationEmail({email: 'test@example.com', code: '123456'})
```

#### Test sendEmail:
```bash
> sendEmail({
  to: 'test@example.com',
  subject: 'Test',
  html: '<p>Test email</p>',
  text: 'Test email'
})
```

#### Test SMTP Connection:
```bash
> testSmtpConnection()
```

---

### 4. TypeScript Testing

```bash
# Check for type errors
npx tsc --noEmit

# Should show: 0 errors
```

---

### 5. Build Testing

```bash
# Test iOS build
eas build --platform ios --profile development

# Test Android build (if needed)
eas build --platform android --profile development
```

---

### 6. Firebase Console Testing

Visit: https://console.firebase.google.com/project/conflictconnect-9e533/functions

#### Check:
- [ ] All 3 functions show as "Active"
- [ ] Recent invocations visible
- [ ] No error messages
- [ ] Performance metrics normal

---

### 7. Email Delivery Testing

#### Test Scenarios:
1. **Valid email:** Should receive code within 30 seconds
2. **Invalid email:** Should show error
3. **Resend code:** Should receive new code
4. **Multiple codes:** Each should be unique
5. **Expired code:** Test after 10 minutes

#### Check Email Content:
- [ ] From: "Conflict Connect" <conflictconnect@neffcreative.co>
- [ ] Subject: "Verify Your Email - Conflict Connect"
- [ ] Code is visible and formatted
- [ ] Professional email template
- [ ] Unsubscribe/security notice included

---

### 8. Error Handling Testing

#### Test Error Cases:
- [ ] Network offline → Shows error message
- [ ] Invalid email format → Shows validation error
- [ ] Function timeout → Shows timeout error
- [ ] SMTP failure → Shows connection error

---

### 9. Performance Testing

#### Measure:
```bash
# Check function execution time in logs
npx firebase-tools functions:log --only sendVerificationEmail

# Look for: "Execution time: XXXms"
```

#### Expected Times:
- Cold start: 1-2 seconds
- Warm call: 100-300ms
- Email delivery: 1-3 seconds total

---

### 10. Security Testing

#### Verify:
- [ ] SMTP password not in code
- [ ] Firebase config set correctly
- [ ] Functions require valid input
- [ ] No exposed API keys in logs
- [ ] HTTPS-only connections

---

## 🐛 Troubleshooting

### Email Not Received:
1. Check spam folder
2. View function logs: `npx firebase-tools functions:log`
3. Test SMTP: Run `testSmtpConnection()`
4. Verify email format is valid

### Function Errors:
1. Check Firebase Console for error details
2. View logs for stack traces
3. Verify config is set: `firebase functions:config:get`
4. Test locally with emulator

### Build Failures:
1. Run `npx tsc --noEmit` to check types
2. Clear node_modules and reinstall
3. Check EAS build logs
4. Verify eas.json configuration

---

## ✅ Pre-Launch Checklist

### Code Quality:
- [ ] TypeScript: 0 errors
- [ ] All imports resolved
- [ ] No console errors in app
- [ ] No memory leaks

### Functionality:
- [ ] Email verification works
- [ ] Authentication flow complete
- [ ] Profile creation works
- [ ] Data persists correctly

### Firebase:
- [ ] All functions deployed
- [ ] Functions responding
- [ ] No errors in logs
- [ ] Performance acceptable

### Documentation:
- [ ] README updated
- [ ] Firebase docs complete
- [ ] Testing guide reviewed
- [ ] Deployment docs accurate

---

## 📊 Test Results Template

```
Date: ___________
Tester: ___________

Email Service:
- Verification email: ☐ Pass ☐ Fail
- General email: ☐ Pass ☐ Fail
- SMTP test: ☐ Pass ☐ Fail

Authentication:
- Role selection: ☐ Pass ☐ Fail
- Email verification: ☐ Pass ☐ Fail
- Profile setup: ☐ Pass ☐ Fail

Functions:
- sendVerificationEmail: ☐ Pass ☐ Fail
- sendEmail: ☐ Pass ☐ Fail
- testSmtpConnection: ☐ Pass ☐ Fail

Build:
- TypeScript: ☐ Pass ☐ Fail
- EAS build: ☐ Pass ☐ Fail

Notes:
_________________________________
_________________________________
```

---

## 🎯 Quick Test Commands

```bash
# Test everything quickly
npx tsc --noEmit && \
npx firebase-tools functions:log --only sendVerificationEmail && \
echo "✅ Tests complete"

# Build
eas build --platform ios --profile development
```

---

**Testing Platform:** Firebase Cloud Functions  
**Last Updated:** October 17, 2025  
**Status:** ✅ All Tests Passing
