import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
<<<<<<< HEAD
import { connectAuthEmulator, getReactNativePersistence, initializeAuth } from 'firebase/auth';
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
=======
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration - Your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCPFS3FgmMK3hCcfR3eezKXpzTCejWl6vE",
  authDomain: "conflictconnect-9e533.firebaseapp.com",
  projectId: "conflictconnect-9e533",
  storageBucket: "conflictconnect-9e533.firebasestorage.app",
  messagingSenderId: "1038056181745",
  appId: "1:1038056181745:web:3ca03dc4b919ca6d15fe50",
  measurementId: "G-32SPXWQ1VV"
>>>>>>> 013af9f (feat: realtime updates, funding fields, build readiness fixes and Heroku config)
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

<<<<<<< HEAD
export { auth, db };
export default app;
=======
export { app, auth, db, storage };
export default app;
>>>>>>> 013af9f (feat: realtime updates, funding fields, build readiness fixes and Heroku config)
