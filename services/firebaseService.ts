import {
    createUserWithEmailAndPassword,
    sendEmailVerification,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
    updateProfile as updateFirebaseProfile
} from 'firebase/auth';
import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    setDoc,
    updateDoc,
    where
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User, UserProfile, UserRole } from '../types/auth';
import { errorHandler } from '../utils/errorHandler';

export class FirebaseUserService {
  private static readonly USERS_COLLECTION = 'users';

  // Create a new user in Firebase Auth and Firestore
  static async createUser(
    email: string, 
    password: string, 
    role: UserRole,
    profileData: Partial<UserProfile>
  ): Promise<User> {
    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Create user document in Firestore
      const user: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || email,
        role,
        isLocationVerified: false,
        isEmailVerified: false,
        hasCompletedProfile: false,
        createdAt: new Date().toISOString(),
      };

      // Save to Firestore
      await setDoc(doc(db, this.USERS_COLLECTION, firebaseUser.uid), user);

      // Send email verification
      await sendEmailVerification(firebaseUser);

      return user;
    } catch (error) {
      errorHandler({
        filePath: 'services/firebaseService.ts',
        functionName: 'createUser',
        error: error as Error
      });
      throw error;
    }
  }

  // Sign in user
  static async signInUser(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, this.USERS_COLLECTION, firebaseUser.uid));
      
      if (!userDoc.exists()) {
        throw new Error('User data not found');
      }

      return userDoc.data() as User;
    } catch (error) {
      errorHandler({
        filePath: 'services/firebaseService.ts',
        functionName: 'signInUser',
        error: error as Error
      });
      throw error;
    }
  }

  // Sign out user
  static async signOutUser(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      errorHandler({
        filePath: 'services/firebaseService.ts',
        functionName: 'signOutUser',
        error: error as Error
      });
      throw error;
    }
  }

  // Get current user data
  static async getCurrentUser(): Promise<User | null> {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return null;

      const userDoc = await getDoc(doc(db, this.USERS_COLLECTION, firebaseUser.uid));
      
      if (!userDoc.exists()) {
        return null;
      }

      return userDoc.data() as User;
    } catch (error) {
      errorHandler({
        filePath: 'services/firebaseService.ts',
        functionName: 'getCurrentUser',
        error: error as Error
      });
      return null;
    }
  }

  // Update user profile
  static async updateUserProfile(userId: string, profile: UserProfile): Promise<void> {
    try {
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      await updateDoc(userRef, {
        profile,
        hasCompletedProfile: true,
        updatedAt: new Date().toISOString()
      });

      // Update Firebase Auth profile if needed
      const firebaseUser = auth.currentUser;
      if (firebaseUser && firebaseUser.uid === userId) {
        await updateFirebaseProfile(firebaseUser, {
          displayName: `${profile.firstName} ${profile.lastName}`
        });
      }
    } catch (error) {
      errorHandler({
        filePath: 'services/firebaseService.ts',
        functionName: 'updateUserProfile',
        error: error as Error
      });
      throw error;
    }
  }

  // Update user location
  static async updateUserLocation(
    userId: string, 
    location: { latitude: number; longitude: number; address?: string }
  ): Promise<void> {
    try {
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      await updateDoc(userRef, {
        location,
        isLocationVerified: true,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      errorHandler({
        filePath: 'services/firebaseService.ts',
        functionName: 'updateUserLocation',
        error: error as Error
      });
      throw error;
    }
  }

  // Get users by role
  static async getUsersByRole(role: UserRole, limitCount: number = 50): Promise<User[]> {
    try {
      const q = query(
        collection(db, this.USERS_COLLECTION),
        where('role', '==', role),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as User);
    } catch (error) {
      errorHandler({
        filePath: 'services/firebaseService.ts',
        functionName: 'getUsersByRole',
        error: error as Error
      });
      throw error;
    }
  }

  // Get users near a location
  static async getUsersNearLocation(
    latitude: number, 
    longitude: number, 
    radiusKm: number = 50
  ): Promise<User[]> {
    try {
      // Note: This is a simplified implementation
      // For production, consider using GeoFirestore or similar for proper geo queries
      const q = query(
        collection(db, this.USERS_COLLECTION),
        where('isLocationVerified', '==', true)
      );

      const querySnapshot = await getDocs(q);
      const users = querySnapshot.docs.map(doc => doc.data() as User);
      
      // Filter users within radius (simplified calculation)
      return users.filter(user => {
        if (!user.location) return false;
        
        const distance = this.calculateDistance(
          latitude, longitude,
          user.location.latitude, user.location.longitude
        );
        
        return distance <= radiusKm;
      });
    } catch (error) {
      errorHandler({
        filePath: 'services/firebaseService.ts',
        functionName: 'getUsersNearLocation',
        error: error as Error
      });
      throw error;
    }
  }

  // Send password reset email
  static async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      errorHandler({
        filePath: 'services/firebaseService.ts',
        functionName: 'sendPasswordResetEmail',
        error: error as Error
      });
      throw error;
    }
  }

  // Delete user account
  static async deleteUser(userId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.USERS_COLLECTION, userId));
    } catch (error) {
      errorHandler({
        filePath: 'services/firebaseService.ts',
        functionName: 'deleteUser',
        error: error as Error
      });
      throw error;
    }
  }

  // Helper function to calculate distance between two coordinates
  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
