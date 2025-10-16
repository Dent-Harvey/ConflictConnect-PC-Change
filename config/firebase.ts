import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, initializeAuth } from 'firebase/auth';
import { getReactNativePersistence } from 'firebase/auth/react-native';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const db = getFirestore(app);

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
