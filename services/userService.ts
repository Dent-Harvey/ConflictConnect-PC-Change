import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { User, CreateUserData, UpdateUserData, UserProfile } from '@/types/user';
import { errorHandler } from '@/utils/errorHandler';

const USERS_COLLECTION = 'users';

class UserService {
  /**
   * Create a new user document in Firestore
   */
  async createUser(userId: string, userData: CreateUserData): Promise<User> {
    try {
      const now = new Date().toISOString();
      const defaultPreferences = {
        theme: 'auto' as const,
        language: 'en',
        notifications: {
          push: true,
          email: true,
          sms: false,
          conflictUpdates: true,
          resourceMatches: true,
        },
        privacy: {
          profileVisibility: 'public' as const,
          locationSharing: false,
          activityStatus: true,
        }
      };
      
      const defaultVerificationStatus = {
        email: false,
        phone: false,
        identity: false,
        location: false,
      };

      const newUser: User = {
        id: userId,
        ...userData,
        preferences: defaultPreferences,
        verificationStatus: defaultVerificationStatus,
        roles: ['user'],
        createdAt: now,
        updatedAt: now,
        lastActive: now,
        isActive: true,
      };

      const userRef = doc(db, USERS_COLLECTION, userId);
      await setDoc(userRef, {
        ...newUser,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastActive: serverTimestamp(),
      });

      return newUser;
    } catch (error) {
      errorHandler({
        filePath: '/services/userService.ts',
        functionName: 'createUser',
        error: error as Error
      });
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const data = userSnap.data();
        return {
          ...data,
          id: userSnap.id,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
          lastActive: data.lastActive?.toDate?.()?.toISOString() || data.lastActive,
        } as User;
      }
      
      return null;
    } catch (error) {
      errorHandler({
        filePath: '/services/userService.ts',
        functionName: 'getUserById',
        error: error as Error
      });
      throw error;
    }
  }

  /**
   * Get user by username
   */
  async getUserByUsername(username: string): Promise<User | null> {
    try {
      const usersRef = collection(db, USERS_COLLECTION);
      const q = query(usersRef, where('username', '==', username), limit(1));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
          lastActive: data.lastActive?.toDate?.()?.toISOString() || data.lastActive,
        } as User;
      }
      
      return null;
    } catch (error) {
      errorHandler({
        filePath: '/services/userService.ts',
        functionName: 'getUserByUsername',
        error: error as Error
      });
      throw error;
    }
  }

  /**
   * Check if username is available
   */
  async isUsernameAvailable(username: string): Promise<boolean> {
    try {
      const user = await this.getUserByUsername(username);
      return user === null;
    } catch (error) {
      errorHandler({
        filePath: '/services/userService.ts',
        functionName: 'isUsernameAvailable',
        error: error as Error
      });
      throw error;
    }
  }

  /**
   * Update user data
   */
  async updateUser(userId: string, updateData: UpdateUserData): Promise<void> {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId);
      await updateDoc(userRef, {
        ...updateData,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      errorHandler({
        filePath: '/services/userService.ts',
        functionName: 'updateUser',
        error: error as Error
      });
      throw error;
    }
  }

  /**
   * Update user's last active timestamp
   */
  async updateLastActive(userId: string): Promise<void> {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId);
      await updateDoc(userRef, {
        lastActive: serverTimestamp(),
      });
    } catch (error) {
      errorHandler({
        filePath: '/services/userService.ts',
        functionName: 'updateLastActive',
        error: error as Error
      });
      throw error;
    }
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId);
      await deleteDoc(userRef);
    } catch (error) {
      errorHandler({
        filePath: '/services/userService.ts',
        functionName: 'deleteUser',
        error: error as Error
      });
      throw error;
    }
  }

  /**
   * Search users by display name or username
   */
  async searchUsers(searchTerm: string, limitCount: number = 20): Promise<UserProfile[]> {
    try {
      const usersRef = collection(db, USERS_COLLECTION);
      
      // Search by username (case-insensitive)
      const usernameQuery = query(
        usersRef,
        where('username', '>=', searchTerm.toLowerCase()),
        where('username', '<=', searchTerm.toLowerCase() + '\uf8ff'),
        orderBy('username'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(usernameQuery);
      const users: UserProfile[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const user: UserProfile = {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
          lastActive: data.lastActive?.toDate?.()?.toISOString() || data.lastActive,
          fullName: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
          initials: `${data.firstName?.[0] || ''}${data.lastName?.[0] || ''}` || data.username?.[0]?.toUpperCase(),
        } as UserProfile;
        users.push(user);
      });
      
      return users;
    } catch (error) {
      errorHandler({
        filePath: '/services/userService.ts',
        functionName: 'searchUsers',
        error: error as Error
      });
      throw error;
    }
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: string, limitCount: number = 50): Promise<UserProfile[]> {
    try {
      const usersRef = collection(db, USERS_COLLECTION);
      const q = query(
        usersRef,
        where('roles', 'array-contains', role),
        orderBy('lastActive', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const users: UserProfile[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const user: UserProfile = {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
          lastActive: data.lastActive?.toDate?.()?.toISOString() || data.lastActive,
          fullName: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
          initials: `${data.firstName?.[0] || ''}${data.lastName?.[0] || ''}` || data.username?.[0]?.toUpperCase(),
        } as UserProfile;
        users.push(user);
      });
      
      return users;
    } catch (error) {
      errorHandler({
        filePath: '/services/userService.ts',
        functionName: 'getUsersByRole',
        error: error as Error
      });
      throw error;
    }
  }
}

export const userService = new UserService();
export default userService;