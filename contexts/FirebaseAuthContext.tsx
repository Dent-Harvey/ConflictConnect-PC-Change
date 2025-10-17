import { auth, db } from '@/config/firebase';
import { generateVerificationCode, sendVerificationEmail } from '@/services/firebaseEmailService';
import { AuthContextType, User, UserProfile, UserRole } from '@/types/auth';
import { errorHandler } from '@/utils/errorHandler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    User as FirebaseUser,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    sendEmailVerification,
    signOut,
    updateProfile
} from 'firebase/auth';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where
} from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';

const FirebaseAuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = '@conflict_connect_auth';
const PROFILE_STORAGE_KEY = '@conflict_connect_profile';

export const FirebaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('[AUTH] FirebaseAuthProvider initializing...');
  
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingVerification, setPendingVerification] = useState<{ email: string; role: UserRole } | null>(null);
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);

  // Listen to Firebase auth state changes
  useEffect(() => {
    console.log('[AUTH] Setting up auth state listener...');
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        console.log('[AUTH] Auth state changed:', firebaseUser ? 'User logged in' : 'No user');
        
        if (firebaseUser) {
          setFirebaseUser(firebaseUser);
          await loadUserProfile(firebaseUser);
        } else {
          setFirebaseUser(null);
          setUser(null);
          setNeedsProfileSetup(false);
          
          try {
            await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
            await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
            console.log('[AUTH] Cleared stored auth data');
          } catch (storageError) {
            console.error('[AUTH] Error clearing AsyncStorage:', storageError);
          }
        }
      } catch (error) {
        console.error('[AUTH] Error in auth state change handler:', error);
      } finally {
        setIsLoading(false);
      }
    });

    return () => {
      console.log('[AUTH] Cleaning up auth listener');
      unsubscribe();
    };
  }, []);

  const loadUserProfile = async (firebaseUser: FirebaseUser) => {
    try {
      // Check if user has a profile in Firestore
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data() as UserProfile;
        
        // Check if profile is complete
        const isProfileComplete = userData.firstName && 
                                 userData.email && 
                                 userData.location;

        if (isProfileComplete) {
          // User has complete profile
          const user: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            role: 'civilian', // Default role for now
            profile: userData,
            verified: firebaseUser.emailVerified,
            createdAt: (userData as any).createdAt?.toDate?.() || new Date(),
            lastActive: new Date()
          };

          setUser(user);
          setNeedsProfileSetup(false);
          await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        } else {
          // User needs to complete profile setup
          setNeedsProfileSetup(true);
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            role: 'civilian',
            verified: firebaseUser.emailVerified,
            createdAt: (userData as any).createdAt?.toDate?.() || new Date(),
            lastActive: new Date()
          });
        }
      } else {
        // New user - needs profile setup
        setNeedsProfileSetup(true);
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          role: 'civilian', // Default role
          verified: firebaseUser.emailVerified,
          createdAt: new Date(),
          lastActive: new Date()
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      errorHandler({
        filePath: 'contexts/FirebaseAuthContext.tsx',
        functionName: 'loadUserProfile',
        error: error as Error
      });
    }
  };

  const login = async (role: UserRole, email?: string, password?: string) => {
    try {
      setIsLoading(true);

      // Handle scanner (guest) authentication
      if (role === 'scanner') {
        const tempUser: User = {
          id: 'scanner_' + Date.now(),
          email: 'guest@conflictconnect.app',
          role: 'scanner',
          verified: false,
          createdAt: new Date(),
          lastActive: new Date()
        };

        setUser(tempUser);
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(tempUser));
        setIsLoading(false);
        return tempUser;
      }

      // Handle conflict controller authentication
      if (role === 'conflict_controller') {
        if (password !== 'mutual aid') {
          throw new Error('Invalid password for conflict controller access');
        }
        
        // For conflict controllers, create a temporary user session
        const tempUser: User = {
          id: 'conflict_controller_' + Date.now(),
          email: email || 'conflict.controller@conflictconnect.app',
          role: 'conflict_controller',
          verified: true,
          createdAt: new Date(),
          lastActive: new Date()
        };

        setUser(tempUser);
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(tempUser));
        setIsLoading(false);
        return tempUser;
      }

      // Handle civilian authentication with email verification
      if (!email) {
        throw new Error('Email is required for civilian authentication');
      }

      // Generate verification code
      const verificationCode = generateVerificationCode();
      
      // Send verification email
      const emailResult = await sendVerificationEmail(email, verificationCode);
      
      if (!emailResult.success) {
        throw new Error('Failed to send verification email');
      }

      // Store pending verification
      setPendingVerification({ email, role });
      setIsLoading(false);

      return { email, verificationCode };
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const verifyEmailAndCreateUser = async (email: string, code: string, role: UserRole = 'civilian') => {
    try {
      setIsLoading(true);

      // For now, we'll create the Firebase user directly
      // In production, you might want to verify the code first
      const userCredential = await createUserWithEmailAndPassword(auth, email, `temp_${Date.now()}`);
      const firebaseUser = userCredential.user;

      // Create initial user document in Firestore
      const initialProfile: any = {
        role,
        email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isProfileComplete: false
      };

      const userDocRef = doc(db, 'users', firebaseUser.uid);
      await setDoc(userDocRef, initialProfile);

      // Update Firebase user profile
      await updateProfile(firebaseUser, {
        displayName: role
      });

      // Send email verification
      await sendEmailVerification(firebaseUser);

      setPendingVerification(null);
      setNeedsProfileSetup(true);
      setIsLoading(false);

      return firebaseUser;
    } catch (error) {
      setIsLoading(false);
      console.error('Error creating user:', error);
      throw error;
    }
  };

  const completeProfileSetup = async (profileData: UserProfile) => {
    try {
      if (!firebaseUser) {
        throw new Error('No authenticated user');
      }

      setIsLoading(true);

      // Update user document in Firestore
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const completeProfile = {
        ...profileData,
        updatedAt: serverTimestamp(),
        isProfileComplete: true
      };

      await updateDoc(userDocRef, completeProfile);

      // Update local user state
      const updatedUser: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        role: (profileData as any).role || 'civilian',
        profile: completeProfile as UserProfile,
        verified: firebaseUser.emailVerified,
        createdAt: (profileData as any).createdAt?.toDate?.() || new Date(),
        lastActive: new Date()
      };

      setUser(updatedUser);
      setNeedsProfileSetup(false);
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
      await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(completeProfile));

      setIsLoading(false);
      return updatedUser;
    } catch (error) {
      setIsLoading(false);
      console.error('Error completing profile setup:', error);
      throw error;
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!firebaseUser || !user) {
        throw new Error('No authenticated user');
      }

      setIsLoading(true);

      // Update user document in Firestore
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      await updateDoc(userDocRef, updateData);

      // Update local user state
      const updatedProfile = { ...user.profile, ...updates };
      const updatedUser = { ...user, profile: updatedProfile };

      setUser(updatedUser);
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
      await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile));

      setIsLoading(false);
      return updatedUser;
    } catch (error) {
      setIsLoading(false);
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await signOut(auth);
      // Auth state change will handle the rest
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateLocation = async (location: any) => {
    try {
      if (!user) return;

      const locationData = {
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address || '',
        city: location.city || '',
        country: location.country || ''
      };

      await updateUserProfile({ location: locationData });
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  const updateUserRole = async (role: UserRole) => {
    try {
      if (!user) return;
      await updateUserProfile({ role } as any);
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  };

  // Get users by role for matching needs and resources
  const getUsersByRole = async (role: UserRole, limit: number = 50) => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef, 
        where('role', '==', role),
        where('isProfileComplete', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      const users: UserProfile[] = [];
      
      querySnapshot.forEach((doc) => {
        const userData = doc.data() as UserProfile;
        users.push({ ...userData, id: doc.id });
      });

      return users;
    } catch (error) {
      console.error('Error getting users by role:', error);
      return [];
    }
  };

  // Get users by location for local matching
  const getUsersByLocation = async (latitude: number, longitude: number, radiusKm: number = 50) => {
    try {
      // This is a simplified version - in production you'd use GeoFirestore
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('isProfileComplete', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      const nearbyUsers: UserProfile[] = [];
      
      querySnapshot.forEach((doc) => {
        const userData = doc.data() as UserProfile;
        if (userData.location) {
          // Simple distance calculation (not optimized for large datasets)
          const distance = calculateDistance(
            latitude, longitude,
            userData.location.latitude, userData.location.longitude
          );
          
          if (distance <= radiusKm) {
            nearbyUsers.push({ ...userData, id: doc.id });
          }
        }
      });

      return nearbyUsers;
    } catch (error) {
      console.error('Error getting users by location:', error);
      return [];
    }
  };

  const resetVerification = () => {
    setPendingVerification(null);
  };

  // Helper function to calculate distance between two points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  };

  const value: AuthContextType = {
    user,
    isLoading,
    pendingVerification,
    needsProfileSetup,
    login,
    verifyEmailAndCreateUser,
    completeProfileSetup,
    updateUserProfile,
    logout,
    updateLocation,
    updateUserRole,
    getUsersByRole,
    getUsersByLocation,
    resetVerification
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

// Alias for compatibility
export const useAuth = useFirebaseAuth;