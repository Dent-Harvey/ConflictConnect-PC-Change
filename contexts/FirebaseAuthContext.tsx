import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  updateProfile as updateFirebaseProfile,
} from 'firebase/auth';
import { auth } from '@/config/firebase';
import { User } from '@/types/user';
import { userService } from '@/services/userService';
import { errorHandler } from '@/utils/errorHandler';

interface FirebaseAuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: { username: string; displayName?: string }) => Promise<void>;
  signOut: () => Promise<void>;
  sendEmailVerification: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType | undefined>(undefined);

export const FirebaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        console.log('[FIREBASE AUTH] Auth state changed:', firebaseUser?.uid);
        
        if (firebaseUser) {
          // User is signed in, load their profile data
          setFirebaseUser(firebaseUser);
          const userData = await userService.getUserById(firebaseUser.uid);
          
          if (userData) {
            setUser(userData);
            // Update last active timestamp
            await userService.updateLastActive(firebaseUser.uid);
          } else {
            // User exists in Firebase but not in Firestore
            // This shouldn't happen in normal flow, but let's handle it
            console.log('[FIREBASE AUTH] User exists in Firebase but not in Firestore');
            setUser(null);
          }
        } else {
          // User is signed out
          setFirebaseUser(null);
          setUser(null);
        }
      } catch (error) {
        errorHandler({
          filePath: '/contexts/FirebaseAuthContext.tsx',
          functionName: 'onAuthStateChanged',
          error: error as Error
        });
        // Even if we can't load user data, set the Firebase user
        setFirebaseUser(firebaseUser);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('[FIREBASE AUTH] Signing in user:', email);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('[FIREBASE AUTH] Sign in successful:', userCredential.user.uid);
      
      // The onAuthStateChanged listener will handle loading user data
    } catch (error) {
      errorHandler({
        filePath: '/contexts/FirebaseAuthContext.tsx',
        functionName: 'signIn',
        error: error as Error
      });
      throw error;
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    userData: { username: string; displayName?: string }
  ): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('[FIREBASE AUTH] Creating new user:', email);
      
      // Check if username is available
      const isUsernameAvailable = await userService.isUsernameAvailable(userData.username);
      if (!isUsernameAvailable) {
        throw new Error('Username is already taken');
      }
      
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      console.log('[FIREBASE AUTH] Firebase user created:', firebaseUser.uid);
      
      // Update Firebase profile
      if (userData.displayName) {
        await updateFirebaseProfile(firebaseUser, {
          displayName: userData.displayName,
        });
      }
      
      // Create user document in Firestore
      const newUser = await userService.createUser(firebaseUser.uid, {
        email: firebaseUser.email!,
        username: userData.username,
        displayName: userData.displayName,
      });
      
      console.log('[FIREBASE AUTH] User document created in Firestore');
      
      // Send email verification
      await sendEmailVerification(firebaseUser);
      console.log('[FIREBASE AUTH] Email verification sent');
      
      // The onAuthStateChanged listener will handle setting the user state
    } catch (error) {
      errorHandler({
        filePath: '/contexts/FirebaseAuthContext.tsx',
        functionName: 'signUp',
        error: error as Error
      });
      throw error;
    }
  };

  const handleSignOut = async (): Promise<void> => {
    try {
      console.log('[FIREBASE AUTH] Signing out user');
      await signOut(auth);
      console.log('[FIREBASE AUTH] Sign out successful');
    } catch (error) {
      errorHandler({
        filePath: '/contexts/FirebaseAuthContext.tsx',
        functionName: 'handleSignOut',
        error: error as Error
      });
      throw error;
    }
  };

  const handleSendEmailVerification = async (): Promise<void> => {
    try {
      if (!firebaseUser) {
        throw new Error('No user is currently signed in');
      }
      
      console.log('[FIREBASE AUTH] Sending email verification');
      await sendEmailVerification(firebaseUser);
      console.log('[FIREBASE AUTH] Email verification sent successfully');
    } catch (error) {
      errorHandler({
        filePath: '/contexts/FirebaseAuthContext.tsx',
        functionName: 'handleSendEmailVerification',
        error: error as Error
      });
      throw error;
    }
  };

  const updateUserProfile = async (data: Partial<User>): Promise<void> => {
    try {
      if (!firebaseUser || !user) {
        throw new Error('User not authenticated');
      }
      
      console.log('[FIREBASE AUTH] Updating user profile');
      
      // Update Firebase profile if display name changed
      if (data.displayName && data.displayName !== firebaseUser.displayName) {
        await updateFirebaseProfile(firebaseUser, {
          displayName: data.displayName,
        });
      }
      
      // Update Firestore document
      await userService.updateUser(firebaseUser.uid, data);
      
      // Reload user data
      const updatedUser = await userService.getUserById(firebaseUser.uid);
      if (updatedUser) {
        setUser(updatedUser);
      }
      
      console.log('[FIREBASE AUTH] User profile updated successfully');
    } catch (error) {
      errorHandler({
        filePath: '/contexts/FirebaseAuthContext.tsx',
        functionName: 'updateUserProfile',
        error: error as Error
      });
      throw error;
    }
  };

  const value: FirebaseAuthContextType = {
    user,
    firebaseUser,
    isAuthenticated: !!firebaseUser,
    isLoading,
    signIn,
    signUp,
    signOut: handleSignOut,
    sendEmailVerification: handleSendEmailVerification,
    updateUserProfile,
  };

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};

export const useFirebaseAuth = () => {
  const context = useContext(FirebaseAuthContext);
  if (context === undefined) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
};

// Keep the original useAuth export for backward compatibility
export const useAuth = useFirebaseAuth;