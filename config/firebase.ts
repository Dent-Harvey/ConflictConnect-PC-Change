import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth, initializeAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

console.log('[FIREBASE] Initializing Firebase...');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyCPFS3FgmMK3hCcfR3eezKXpzTCejWl6vE",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "conflictconnect-9e533.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "conflictconnect-9e533",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "conflictconnect-9e533.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1038056181745",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:1038056181745:web:3ca03dc4b919ca6d15fe50",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-32SPXWQ1VV"
};

let app, auth, db;

try {
  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  console.log('[FIREBASE] App initialized');

  // Initialize Auth with AsyncStorage persistence
  // @ts-ignore - Using AsyncStorage directly for React Native
  auth = initializeAuth(app, {
    persistence: AsyncStorage as any
  });
  console.log('[FIREBASE] Auth initialized');

  db = getFirestore(app);
  console.log('[FIREBASE] Firestore initialized');
} catch (error) {
  console.error('[FIREBASE] Initialization error:', error);
  throw error; // Re-throw to make the error visible
}

// Connect to emulators in development
if (__DEV__) {
  if (process.env.EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST) {
    connectAuthEmulator(auth, `http://${process.env.EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST}`);
    console.log('Firebase Auth Emulator connected');
  }
  if (process.env.EXPO_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST) {
    connectFirestoreEmulator(db, process.env.EXPO_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST, 8080);
    console.log('Firebase Firestore Emulator connected');
  }
}

const storage = getStorage(app);

export { app, auth, db, storage };
export default app;
