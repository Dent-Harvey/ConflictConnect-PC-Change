import { initializeApp } from 'firebase/app';
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
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Firebase Storage
const storage = getStorage(app);

// Connect to emulators in development (optional)
if (__DEV__) {
  // Uncomment these lines if you want to use Firebase emulators in development
  // connectFirestoreEmulator(db, 'localhost', 8080);
  // connectAuthEmulator(auth, 'http://localhost:9099');
}

export { app, auth, db, storage };
export default app;