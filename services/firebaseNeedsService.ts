import { 
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
  serverTimestamp,
  GeoPoint
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { errorHandler } from '@/utils/errorHandler';

export interface UserNeed {
  id?: string;
  title: string;
  description: string;
  category: 'food' | 'water' | 'medical' | 'shelter' | 'transportation' | 'communication' | 'security' | 'supplies' | 'evacuation' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical' | 'emergency';
  urgency: 'immediate' | 'within_hours' | 'within_days' | 'within_weeks' | 'not_urgent';
  quantity: number;
  unit?: string;
  location: {
    geopoint: GeoPoint;
    address?: string;
    landmark?: string;
  };
  conflictZoneId: string;
  userId: string;
  userProfile?: {
    username: string;
    displayName?: string;
    profilePicture?: string;
    verificationStatus: {
      email: boolean;
      identity: boolean;
    };
  };
  contactInfo?: {
    name?: string;
    phone?: string;
    email?: string;
    preferredContact?: string;
  };
  status: 'open' | 'in_progress' | 'partially_fulfilled' | 'fulfilled' | 'cancelled' | 'expired';
  tags?: string[];
  fulfillmentRequests?: FulfillmentRequest[];
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'flagged';
  createdAt?: any; // Firebase Timestamp
  updatedAt?: any; // Firebase Timestamp
  expiresAt?: any; // Firebase Timestamp
}

export interface FulfillmentRequest {
  resourceId: string;
  providerId: string;
  providerProfile: {
    username: string;
    displayName?: string;
    profilePicture?: string;
  };
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';
  quantity: number;
  estimatedDelivery?: string;
  notes?: string;
  createdAt: any;
}

export interface CreateNeedData {
  title: string;
  description: string;
  category: UserNeed['category'];
  priority: UserNeed['priority'];
  urgency: UserNeed['urgency'];
  quantity: number;
  unit?: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
    landmark?: string;
  };
  conflictZoneId: string;
  contactInfo?: UserNeed['contactInfo'];
  tags?: string[];
  expiresAt?: Date;
}

const NEEDS_COLLECTION = 'needs';

class FirebaseNeedsService {
  /**
   * Create a new need with user profile integration
   */
  async createNeed(userId: string, needData: CreateNeedData, userProfile: UserNeed['userProfile']): Promise<UserNeed> {
    try {
      console.log('[FIREBASE NEEDS] Creating need for user:', userId);
      
      const needDoc = {
        ...needData,
        location: {
          geopoint: new GeoPoint(needData.location.latitude, needData.location.longitude),
          address: needData.location.address,
          landmark: needData.location.landmark,
        },
        userId,
        userProfile,
        status: 'open' as const,
        verificationStatus: 'unverified' as const,
        fulfillmentRequests: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        expiresAt: needData.expiresAt ? needData.expiresAt : null,
      };

      const docRef = await addDoc(collection(db, NEEDS_COLLECTION), needDoc);
      
      console.log('[FIREBASE NEEDS] Need created with ID:', docRef.id);
      
      return {
        ...needDoc,
        id: docRef.id,
        location: {
          ...needDoc.location,
          geopoint: new GeoPoint(needData.location.latitude, needData.location.longitude),
        }
      } as UserNeed;
    } catch (error) {
      errorHandler({
        filePath: '/services/firebaseNeedsService.ts',
        functionName: 'createNeed',
        error: error as Error
      });
      throw error;
    }
  }

  /**
   * Get needs by user ID
   */
  async getUserNeeds(userId: string, limitCount: number = 20): Promise<UserNeed[]> {
    try {
      const needsRef = collection(db, NEEDS_COLLECTION);
      const q = query(
        needsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const needs: UserNeed[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        needs.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
          expiresAt: data.expiresAt?.toDate?.()?.toISOString() || data.expiresAt,
        } as UserNeed);
      });
      
      return needs;
    } catch (error) {
      errorHandler({
        filePath: '/services/firebaseNeedsService.ts',
        functionName: 'getUserNeeds',
        error: error as Error
      });
      throw error;
    }
  }

  /**
   * Get needs by conflict zone
   */
  async getNeedsByConflictZone(conflictZoneId: string, limitCount: number = 50): Promise<UserNeed[]> {
    try {
      const needsRef = collection(db, NEEDS_COLLECTION);
      const q = query(
        needsRef,
        where('conflictZoneId', '==', conflictZoneId),
        where('status', 'in', ['open', 'in_progress', 'partially_fulfilled']),
        orderBy('priority', 'desc'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const needs: UserNeed[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        needs.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
          expiresAt: data.expiresAt?.toDate?.()?.toISOString() || data.expiresAt,
        } as UserNeed);
      });
      
      return needs;
    } catch (error) {
      errorHandler({
        filePath: '/services/firebaseNeedsService.ts',
        functionName: 'getNeedsByConflictZone',
        error: error as Error
      });
      throw error;
    }
  }

  /**
   * Get need by ID
   */
  async getNeedById(needId: string): Promise<UserNeed | null> {
    try {
      const needRef = doc(db, NEEDS_COLLECTION, needId);
      const needSnap = await getDoc(needRef);
      
      if (needSnap.exists()) {
        const data = needSnap.data();
        return {
          ...data,
          id: needSnap.id,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
          expiresAt: data.expiresAt?.toDate?.()?.toISOString() || data.expiresAt,
        } as UserNeed;
      }
      
      return null;
    } catch (error) {
      errorHandler({
        filePath: '/services/firebaseNeedsService.ts',
        functionName: 'getNeedById',
        error: error as Error
      });
      throw error;
    }
  }

  /**
   * Update need
   */
  async updateNeed(needId: string, updateData: Partial<UserNeed>): Promise<void> {
    try {
      const needRef = doc(db, NEEDS_COLLECTION, needId);
      
      // Convert location coordinates to GeoPoint if provided
      const processedUpdateData = { ...updateData };
      if (updateData.location && 'latitude' in updateData.location && 'longitude' in updateData.location) {
        processedUpdateData.location = {
          ...updateData.location,
          geopoint: new GeoPoint(
            (updateData.location as any).latitude,
            (updateData.location as any).longitude
          ),
        };
      }
      
      await updateDoc(needRef, {
        ...processedUpdateData,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      errorHandler({
        filePath: '/services/firebaseNeedsService.ts',
        functionName: 'updateNeed',
        error: error as Error
      });
      throw error;
    }
  }

  /**
   * Add fulfillment request to a need
   */
  async addFulfillmentRequest(
    needId: string,
    request: Omit<FulfillmentRequest, 'createdAt'>
  ): Promise<void> {
    try {
      const needRef = doc(db, NEEDS_COLLECTION, needId);
      const needSnap = await getDoc(needRef);
      
      if (!needSnap.exists()) {
        throw new Error('Need not found');
      }
      
      const needData = needSnap.data() as UserNeed;
      const existingRequests = needData.fulfillmentRequests || [];
      
      const newRequest: FulfillmentRequest = {
        ...request,
        createdAt: serverTimestamp(),
      };
      
      await updateDoc(needRef, {
        fulfillmentRequests: [...existingRequests, newRequest],
        status: existingRequests.length === 0 ? 'in_progress' : needData.status,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      errorHandler({
        filePath: '/services/firebaseNeedsService.ts',
        functionName: 'addFulfillmentRequest',
        error: error as Error
      });
      throw error;
    }
  }

  /**
   * Update fulfillment request status
   */
  async updateFulfillmentRequestStatus(
    needId: string,
    resourceId: string,
    newStatus: FulfillmentRequest['status']
  ): Promise<void> {
    try {
      const needRef = doc(db, NEEDS_COLLECTION, needId);
      const needSnap = await getDoc(needRef);
      
      if (!needSnap.exists()) {
        throw new Error('Need not found');
      }
      
      const needData = needSnap.data() as UserNeed;
      const requests = needData.fulfillmentRequests || [];
      
      const updatedRequests = requests.map(request => 
        request.resourceId === resourceId
          ? { ...request, status: newStatus }
          : request
      );
      
      // Update overall need status based on fulfillment requests
      let needStatus = needData.status;
      const acceptedRequests = updatedRequests.filter(r => r.status === 'accepted' || r.status === 'completed');
      const completedRequests = updatedRequests.filter(r => r.status === 'completed');
      
      if (completedRequests.length > 0) {
        const totalFulfilled = completedRequests.reduce((sum, r) => sum + r.quantity, 0);
        if (totalFulfilled >= needData.quantity) {
          needStatus = 'fulfilled';
        } else {
          needStatus = 'partially_fulfilled';
        }
      } else if (acceptedRequests.length > 0) {
        needStatus = 'in_progress';
      } else if (updatedRequests.length === 0) {
        needStatus = 'open';
      }
      
      await updateDoc(needRef, {
        fulfillmentRequests: updatedRequests,
        status: needStatus,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      errorHandler({
        filePath: '/services/firebaseNeedsService.ts',
        functionName: 'updateFulfillmentRequestStatus',
        error: error as Error
      });
      throw error;
    }
  }

  /**
   * Delete need
   */
  async deleteNeed(needId: string): Promise<void> {
    try {
      const needRef = doc(db, NEEDS_COLLECTION, needId);
      await deleteDoc(needRef);
    } catch (error) {
      errorHandler({
        filePath: '/services/firebaseNeedsService.ts',
        functionName: 'deleteNeed',
        error: error as Error
      });
      throw error;
    }
  }

  /**
   * Search needs by criteria
   */
  async searchNeeds(filters: {
    category?: UserNeed['category'];
    priority?: UserNeed['priority'];
    status?: UserNeed['status'];
    conflictZoneId?: string;
  }, limitCount: number = 50): Promise<UserNeed[]> {
    try {
      const needsRef = collection(db, NEEDS_COLLECTION);
      let q = query(needsRef);
      
      // Add filters
      if (filters.category) {
        q = query(q, where('category', '==', filters.category));
      }
      if (filters.priority) {
        q = query(q, where('priority', '==', filters.priority));
      }
      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }
      if (filters.conflictZoneId) {
        q = query(q, where('conflictZoneId', '==', filters.conflictZoneId));
      }
      
      q = query(q, orderBy('createdAt', 'desc'), limit(limitCount));
      
      const querySnapshot = await getDocs(q);
      const needs: UserNeed[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        needs.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
          expiresAt: data.expiresAt?.toDate?.()?.toISOString() || data.expiresAt,
        } as UserNeed);
      });
      
      return needs;
    } catch (error) {
      errorHandler({
        filePath: '/services/firebaseNeedsService.ts',
        functionName: 'searchNeeds',
        error: error as Error
      });
      throw error;
    }
  }
}

export const firebaseNeedsService = new FirebaseNeedsService();
export default firebaseNeedsService;