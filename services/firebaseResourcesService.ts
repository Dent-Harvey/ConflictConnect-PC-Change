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
  serverTimestamp,
  GeoPoint
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { errorHandler } from '@/utils/errorHandler';

export interface Resource {
  id?: string;
  title: string;
  description: string;
  category: 'food' | 'water' | 'medical' | 'shelter' | 'transportation' | 'communication' | 'security' | 'supplies' | 'evacuation' | 'personnel' | 'other';
  type: 'donation' | 'service' | 'facility' | 'equipment' | 'volunteer' | 'expertise';
  quantity: number;
  unit: string;
  location: {
    geopoint: GeoPoint;
    address?: string;
    serviceRadius?: number; // in kilometers
  };
  providerId: string;
  providerProfile: {
    username: string;
    displayName?: string;
    profilePicture?: string;
    verificationStatus: {
      email: boolean;
      identity: boolean;
    };
    organization?: string;
  };
  contactInfo: {
    name: string;
    phone: string;
    email: string;
    preferredContact?: 'phone' | 'email' | 'app';
  };
  availability: {
    status: 'available' | 'limited' | 'reserved' | 'unavailable';
    schedule?: string;
    conditions?: string;
  };
  requirements?: string[];
  tags?: string[];
  priority: 'low' | 'medium' | 'high' | 'emergency';
  matchedNeeds?: Array<{
    needId: string;
    userId: string;
    status: 'pending' | 'accepted' | 'declined' | 'completed';
    quantityAllocated: number;
    matchedAt: any; // Firebase Timestamp
    completedAt?: any; // Firebase Timestamp
  }>;
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'flagged';
  status: 'active' | 'inactive' | 'depleted' | 'expired';
  createdAt?: any; // Firebase Timestamp
  updatedAt?: any; // Firebase Timestamp
}

export interface CreateResourceData {
  title: string;
  description: string;
  category: Resource['category'];
  type: Resource['type'];
  quantity: number;
  unit: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
    serviceRadius?: number;
  };
  contactInfo: Resource['contactInfo'];
  availability: Resource['availability'];
  requirements?: string[];
  tags?: string[];
  priority: Resource['priority'];
}

export interface ResourceMatch {
  needId: string;
  userId: string;
  quantityRequested: number;
  notes?: string;
}

const RESOURCES_COLLECTION = 'resources';

class FirebaseResourcesService {
  /**
   * Create a new resource with user profile integration
   */
  async createResource(
    userId: string, 
    resourceData: CreateResourceData, 
    userProfile: Resource['providerProfile']
  ): Promise<Resource> {
    try {
      console.log('[FIREBASE RESOURCES] Creating resource for user:', userId);
      
      const resourceDoc = {
        ...resourceData,
        location: {
          geopoint: new GeoPoint(resourceData.location.latitude, resourceData.location.longitude),
          address: resourceData.location.address,
          serviceRadius: resourceData.location.serviceRadius || 10, // Default 10km
        },
        providerId: userId,
        providerProfile: userProfile,
        matchedNeeds: [],
        verificationStatus: 'unverified' as const,
        status: 'active' as const,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, RESOURCES_COLLECTION), resourceDoc);
      
      console.log('[FIREBASE RESOURCES] Resource created with ID:', docRef.id);
      
      return {
        ...resourceDoc,
        id: docRef.id,
        location: {
          ...resourceDoc.location,
          geopoint: new GeoPoint(resourceData.location.latitude, resourceData.location.longitude),
        }
      } as Resource;
    } catch (error) {
      errorHandler({
        filePath: '/services/firebaseResourcesService.ts',
        functionName: 'createResource',
        error: error as Error
      });
      throw error;
    }
  }

  /**
   * Get resources by provider ID
   */
  async getProviderResources(providerId: string, limitCount: number = 20): Promise<Resource[]> {
    try {
      const resourcesRef = collection(db, RESOURCES_COLLECTION);
      const q = query(
        resourcesRef,
        where('providerId', '==', providerId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const resources: Resource[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        resources.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        } as Resource);
      });
      
      return resources;
    } catch (error) {
      errorHandler({
        filePath: '/services/firebaseResourcesService.ts',
        functionName: 'getProviderResources',
        error: error as Error
      });
      throw error;
    }
  }

  /**
   * Get available resources by category
   */
  async getResourcesByCategory(
    category: Resource['category'], 
    limitCount: number = 50
  ): Promise<Resource[]> {
    try {
      const resourcesRef = collection(db, RESOURCES_COLLECTION);
      const q = query(
        resourcesRef,
        where('category', '==', category),
        where('status', '==', 'active'),
        where('availability.status', 'in', ['available', 'limited']),
        orderBy('priority', 'desc'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const resources: Resource[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        resources.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        } as Resource);
      });
      
      return resources;
    } catch (error) {
      errorHandler({
        filePath: '/services/firebaseResourcesService.ts',
        functionName: 'getResourcesByCategory',
        error: error as Error
      });
      throw error;
    }
  }

  /**
   * Get resource by ID
   */
  async getResourceById(resourceId: string): Promise<Resource | null> {
    try {
      const resourceRef = doc(db, RESOURCES_COLLECTION, resourceId);
      const resourceSnap = await getDoc(resourceRef);
      
      if (resourceSnap.exists()) {
        const data = resourceSnap.data();
        return {
          ...data,
          id: resourceSnap.id,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        } as Resource;
      }
      
      return null;
    } catch (error) {
      errorHandler({
        filePath: '/services/firebaseResourcesService.ts',
        functionName: 'getResourceById',
        error: error as Error
      });
      throw error;
    }
  }

  /**
   * Update resource
   */
  async updateResource(resourceId: string, updateData: Partial<Resource>): Promise<void> {
    try {
      const resourceRef = doc(db, RESOURCES_COLLECTION, resourceId);
      
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
      
      await updateDoc(resourceRef, {
        ...processedUpdateData,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      errorHandler({
        filePath: '/services/firebaseResourcesService.ts',
        functionName: 'updateResource',
        error: error as Error
      });
      throw error;
    }
  }

  /**
   * Match resource to a need
   */
  async matchResourceToNeed(
    resourceId: string,
    needMatch: ResourceMatch
  ): Promise<void> {
    try {
      const resourceRef = doc(db, RESOURCES_COLLECTION, resourceId);
      const resourceSnap = await getDoc(resourceRef);
      
      if (!resourceSnap.exists()) {
        throw new Error('Resource not found');
      }
      
      const resourceData = resourceSnap.data() as Resource;
      const existingMatches = resourceData.matchedNeeds || [];
      
      // Check if this need is already matched
      const existingMatch = existingMatches.find(match => match.needId === needMatch.needId);
      if (existingMatch) {
        throw new Error('This need is already matched to this resource');
      }
      
      // Check if we have enough quantity
      const totalAllocated = existingMatches.reduce((sum, match) => 
        match.status !== 'declined' ? sum + match.quantityAllocated : sum, 0
      );
      
      if (totalAllocated + needMatch.quantityRequested > resourceData.quantity) {
        throw new Error('Insufficient quantity available');
      }
      
      const newMatch = {
        ...needMatch,
        status: 'pending' as const,
        quantityAllocated: needMatch.quantityRequested,
        matchedAt: serverTimestamp(),
      };
      
      const updatedMatches = [...existingMatches, newMatch];
      
      // Update availability status based on remaining quantity
      const remainingQuantity = resourceData.quantity - totalAllocated - needMatch.quantityRequested;
      let availabilityStatus = resourceData.availability.status;
      
      if (remainingQuantity <= 0) {
        availabilityStatus = 'reserved';
      } else if (remainingQuantity < resourceData.quantity * 0.2) { // Less than 20% remaining
        availabilityStatus = 'limited';
      }
      
      await updateDoc(resourceRef, {
        matchedNeeds: updatedMatches,
        'availability.status': availabilityStatus,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      errorHandler({
        filePath: '/services/firebaseResourcesService.ts',
        functionName: 'matchResourceToNeed',
        error: error as Error
      });
      throw error;
    }
  }

  /**
   * Update match status
   */
  async updateMatchStatus(
    resourceId: string,
    needId: string,
    newStatus: 'accepted' | 'declined' | 'completed'
  ): Promise<void> {
    try {
      const resourceRef = doc(db, RESOURCES_COLLECTION, resourceId);
      const resourceSnap = await getDoc(resourceRef);
      
      if (!resourceSnap.exists()) {
        throw new Error('Resource not found');
      }
      
      const resourceData = resourceSnap.data() as Resource;
      const matches = resourceData.matchedNeeds || [];
      
      const updatedMatches = matches.map(match => 
        match.needId === needId
          ? { 
              ...match, 
              status: newStatus,
              ...(newStatus === 'completed' ? { completedAt: serverTimestamp() } : {})
            }
          : match
      );
      
      // Update availability and resource status based on matches
      const acceptedMatches = updatedMatches.filter(m => m.status === 'accepted' || m.status === 'completed');
      const completedMatches = updatedMatches.filter(m => m.status === 'completed');
      const totalAllocated = acceptedMatches.reduce((sum, m) => sum + m.quantityAllocated, 0);
      const totalCompleted = completedMatches.reduce((sum, m) => sum + m.quantityAllocated, 0);
      
      let availabilityStatus = resourceData.availability.status;
      let resourceStatus = resourceData.status;
      
      if (totalCompleted >= resourceData.quantity) {
        resourceStatus = 'depleted';
        availabilityStatus = 'unavailable';
      } else if (totalAllocated >= resourceData.quantity) {
        availabilityStatus = 'reserved';
      } else if (totalAllocated > resourceData.quantity * 0.8) {
        availabilityStatus = 'limited';
      } else if (newStatus === 'declined') {
        availabilityStatus = 'available';
      }
      
      await updateDoc(resourceRef, {
        matchedNeeds: updatedMatches,
        'availability.status': availabilityStatus,
        status: resourceStatus,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      errorHandler({
        filePath: '/services/firebaseResourcesService.ts',
        functionName: 'updateMatchStatus',
        error: error as Error
      });
      throw error;
    }
  }

  /**
   * Search resources
   */
  async searchResources(filters: {
    category?: Resource['category'];
    type?: Resource['type'];
    priority?: Resource['priority'];
    status?: Resource['status'];
    availabilityStatus?: Resource['availability']['status'];
  }, limitCount: number = 50): Promise<Resource[]> {
    try {
      const resourcesRef = collection(db, RESOURCES_COLLECTION);
      let q = query(resourcesRef);
      
      // Add filters
      if (filters.category) {
        q = query(q, where('category', '==', filters.category));
      }
      if (filters.type) {
        q = query(q, where('type', '==', filters.type));
      }
      if (filters.priority) {
        q = query(q, where('priority', '==', filters.priority));
      }
      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }
      if (filters.availabilityStatus) {
        q = query(q, where('availability.status', '==', filters.availabilityStatus));
      }
      
      q = query(q, orderBy('createdAt', 'desc'), limit(limitCount));
      
      const querySnapshot = await getDocs(q);
      const resources: Resource[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        resources.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        } as Resource);
      });
      
      return resources;
    } catch (error) {
      errorHandler({
        filePath: '/services/firebaseResourcesService.ts',
        functionName: 'searchResources',
        error: error as Error
      });
      throw error;
    }
  }

  /**
   * Delete resource
   */
  async deleteResource(resourceId: string): Promise<void> {
    try {
      const resourceRef = doc(db, RESOURCES_COLLECTION, resourceId);
      await deleteDoc(resourceRef);
    } catch (error) {
      errorHandler({
        filePath: '/services/firebaseResourcesService.ts',
        functionName: 'deleteResource',
        error: error as Error
      });
      throw error;
    }
  }

  /**
   * Get all available resources (for browsing)
   */
  async getAllAvailableResources(limitCount: number = 100): Promise<Resource[]> {
    try {
      const resourcesRef = collection(db, RESOURCES_COLLECTION);
      const q = query(
        resourcesRef,
        where('status', '==', 'active'),
        where('availability.status', 'in', ['available', 'limited']),
        orderBy('priority', 'desc'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const resources: Resource[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        resources.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        } as Resource);
      });
      
      return resources;
    } catch (error) {
      errorHandler({
        filePath: '/services/firebaseResourcesService.ts',
        functionName: 'getAllAvailableResources',
        error: error as Error
      });
      throw error;
    }
  }
}

export const firebaseResourcesService = new FirebaseResourcesService();
export default firebaseResourcesService;