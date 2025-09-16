# Firebase Authentication & User Profile Setup Guide

This guide explains how to set up and configure Firebase authentication and user profiles for Conflict\Connect.

## Overview

The app now includes a complete Firebase integration that provides:
- **Email-based authentication** with verification codes
- **User profile management** with comprehensive data storage
- **Needs and resources matching** based on user profiles
- **Real-time data synchronization** with Firestore
- **Automatic profile setup flow** after verification

## Authentication Flow

### 1. Role Selection
- Users choose between "Civilian" and "Conflict Controller"
- Conflict controllers use password: "mutual aid"
- Civilians require email verification

### 2. Email Verification
- Verification code sent via Namecheap email service
- 6-digit code with 10-minute expiration
- Firebase user account created after verification

### 3. Profile Setup
- Comprehensive profile form with multiple steps
- Required fields: First name, email, location
- Optional fields: Skills, availability, languages, etc.
- Profile completion required before accessing main app

### 4. Main App Access
- Full access to conflict tracking and resource matching
- User profile data available throughout the app
- Real-time synchronization with Firebase

## Firebase Configuration

### Environment Variables

Create a `.env` file in your project root with these variables:

```bash
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Email Service
EXPO_PUBLIC_BACKEND_API_URL=https://conflictconnect-email.neffcreative.co

# News Service
EXPO_PUBLIC_NEWS_API_URL=https://conflictconnect-news.neffcreative.co

# Firebase Emulators (Development only)
EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
EXPO_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST=localhost:8080
```

### Firebase Project Setup

1. **Create Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create new project: "conflict-connect"
   - Enable Google Analytics (optional)

2. **Enable Authentication**:
   - Go to Authentication → Sign-in method
   - Enable Email/Password authentication
   - Configure authorized domains

3. **Create Firestore Database**:
   - Go to Firestore Database
   - Create database in production mode
   - Set up security rules (see below)

4. **Configure Web App**:
   - Go to Project Settings → General
   - Add web app: "Conflict Connect"
   - Copy configuration values to `.env` file

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Needs are readable by all authenticated users, writable by owner
    match /needs/{needId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (resource == null || resource.data.userId == request.auth.uid);
    }
    
    // Resources are readable by all authenticated users, writable by owner
    match /resources/{resourceId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (resource == null || resource.data.userId == request.auth.uid);
    }
    
    // Match requests are readable by participants only
    match /matchRequests/{requestId} {
      allow read, write: if request.auth != null && 
        (resource.data.requestedBy == request.auth.uid || 
         resource.data.requestedTo == request.auth.uid);
    }
  }
}
```

## Database Schema

### Users Collection (`users/{userId}`)
```typescript
{
  // Basic Info
  firstName: string;
  lastName?: string;
  email: string;
  role: 'civilian' | 'conflict_controller' | 'otg' | 'hand';
  
  // Location
  location: {
    latitude: number;
    longitude: number;
    address?: string;
    accuracy?: number;
    timestamp: string;
  };
  
  // Profile Details
  skills: string[];
  languages: string[];
  availability: 'full_time' | 'part_time' | 'weekends' | 'emergency_only';
  
  // Contact & Social
  phone?: string;
  socialMedia?: {
    twitter?: string;
    linkedin?: string;
    telegram?: string;
  };
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isProfileComplete: boolean;
}
```

### Needs Collection (`needs/{needId}`)
```typescript
{
  userId: string;
  title: string;
  description: string;
  category: 'medical' | 'food' | 'shelter' | 'transportation' | 'communication' | 'security' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  status: 'active' | 'fulfilled' | 'expired';
  tags: string[];
  contactInfo?: {
    phone?: string;
    email?: string;
    preferredContact: 'phone' | 'email' | 'app';
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  fulfilledBy?: string;
  fulfilledAt?: Timestamp;
}
```

### Resources Collection (`resources/{resourceId}`)
```typescript
{
  userId: string;
  title: string;
  description: string;
  category: 'medical' | 'food' | 'shelter' | 'transportation' | 'communication' | 'security' | 'other';
  type: 'service' | 'material' | 'information' | 'expertise';
  availability: 'immediate' | 'scheduled' | 'on_call';
  location: {
    latitude: number;
    longitude: number;
    address?: string;
    radius: number; // km
  };
  status: 'available' | 'in_use' | 'unavailable';
  tags: string[];
  contactInfo?: {
    phone?: string;
    email?: string;
    preferredContact: 'phone' | 'email' | 'app';
  };
  requirements?: string[];
  capacity?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Match Requests Collection (`matchRequests/{requestId}`)
```typescript
{
  needId: string;
  resourceId: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  requestedBy: string;
  requestedTo: string;
  message?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
}
```

## User Matching System

### How It Works

1. **Need Creation**: Users create needs with location, category, and priority
2. **Resource Registration**: Users register available resources with location and radius
3. **Automatic Matching**: System finds compatible resources within range
4. **Match Scoring**: Algorithm scores matches based on:
   - Category compatibility (40 points)
   - Priority and availability (30 points)
   - Tag overlap (5 points per tag)
   - Location proximity (5-20 points)
   - Resource status (10 points)

5. **Match Requests**: Users can request connections with high-scoring matches
6. **Communication**: Matched users can communicate through the app

### Matching Algorithm

```typescript
// Example match scoring
const matchScore = calculateMatchScore(need, resource);

// Categories: medical, food, shelter, transportation, communication, security, other
// Priorities: low, medium, high, critical
// Availability: immediate, scheduled, on_call
// Status: available, in_use, unavailable
```

## API Usage Examples

### Authentication
```typescript
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';

const { user, login, verifyEmailAndCreateUser, completeProfileSetup } = useFirebaseAuth();

// Login
await login('civilian', 'user@example.com');

// Verify email and create user
await verifyEmailAndCreateUser('user@example.com', '123456', 'civilian');

// Complete profile setup
await completeProfileSetup({
  firstName: 'John',
  email: 'user@example.com',
  location: { latitude: 40.7128, longitude: -74.0060 },
  role: 'civilian'
});
```

### Needs and Resources
```typescript
import { UserMatchingService } from '@/services/userMatchingService';

// Create a need
const needId = await UserMatchingService.createNeed({
  userId: 'user123',
  title: 'Medical Assistance',
  description: 'Need medical help for injured person',
  category: 'medical',
  priority: 'critical',
  location: { latitude: 40.7128, longitude: -74.0060 },
  status: 'active',
  tags: ['emergency', 'medical', 'urgent']
});

// Find matches
const matches = await UserMatchingService.findMatches(needId, 50); // 50km radius

// Create match request
await UserMatchingService.createMatchRequest({
  needId: 'need123',
  resourceId: 'resource456',
  requestedBy: 'user123',
  requestedTo: 'user456',
  message: 'Can you help with this medical emergency?'
});
```

## Development Setup

### 1. Install Dependencies
```bash
npm install firebase
```

### 2. Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Add your Firebase configuration
# Edit .env with your Firebase project details
```

### 3. Start Firebase Emulators (Optional)
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in project
firebase init

# Start emulators
firebase emulators:start
```

### 4. Test Authentication Flow
1. Start the app: `npm start`
2. Select "Civilian" role
3. Enter email address
4. Check email for verification code
5. Enter verification code
6. Complete profile setup
7. Access main app

## Production Deployment

### 1. Firebase Hosting (Optional)
```bash
# Build the app
npm run build

# Deploy to Firebase Hosting
firebase deploy
```

### 2. Environment Variables
Ensure all environment variables are set in your production environment:
- Firebase configuration
- Email service URL
- News service URL

### 3. Security Rules
Deploy updated security rules to production:
```bash
firebase deploy --only firestore:rules
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**:
   - Check Firebase configuration
   - Verify email service is running
   - Check network connectivity

2. **Profile Setup Issues**:
   - Ensure required fields are filled
   - Check location permissions
   - Verify Firestore security rules

3. **Matching Problems**:
   - Check user location data
   - Verify resource availability
   - Review match scoring algorithm

### Debug Mode

Enable debug logging:
```typescript
// In your app
console.log('[FIREBASE AUTH] Debug mode enabled');

// Check authentication state
console.log('User:', user);
console.log('Needs Profile Setup:', needsProfileSetup);
```

## Security Considerations

1. **Data Validation**: All user input is validated before storing
2. **Access Control**: Users can only access their own data
3. **Location Privacy**: Location data is encrypted and access-controlled
4. **Email Verification**: Required for all civilian accounts
5. **Rate Limiting**: Implemented for authentication attempts

## Performance Optimization

1. **Caching**: User profiles cached locally
2. **Pagination**: Large datasets loaded in pages
3. **Offline Support**: Basic offline functionality
4. **Real-time Updates**: Efficient Firestore listeners
5. **Image Optimization**: Compressed profile images

---

**Last Updated**: September 14, 2025  
**Firebase Version**: 10.x  
**Conflict\Connect Version**: 1.0.0


