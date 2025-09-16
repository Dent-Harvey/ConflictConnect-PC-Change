import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
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

export { auth, db };
export default app;
