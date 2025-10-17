/**
 * User Matching Service for Conflict\Connect
 * This service connects users with needs and resources based on their profiles
 */

import { UserProfile } from '@/types/auth';
import { db } from '@/config/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  addDoc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';

export interface UserNeed {
  id?: string;
  userId: string;
  title: string;
  description: string;
  category: 'medical' | 'food' | 'shelter' | 'transportation' | 'communication' | 'security' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  status: 'active' | 'fulfilled' | 'expired';
  createdAt: Date;
  updatedAt: Date;
  fulfilledBy?: string;
  fulfilledAt?: Date;
  tags: string[];
  contactInfo?: {
    phone?: string;
    email?: string;
    preferredContact: 'phone' | 'email' | 'app';
  };
}

export interface UserResource {
  id?: string;
  userId: string;
  title: string;
  description: string;
  category: 'medical' | 'food' | 'shelter' | 'transportation' | 'communication' | 'security' | 'other';
  type: 'service' | 'material' | 'information' | 'expertise';
  availability: 'immediate' | 'scheduled' | 'on_call';
  location: {
    latitude: number;
    longitude: number;
    address?: string;
    radius: number; // km
  };
  status: 'available' | 'in_use' | 'unavailable';
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  contactInfo?: {
    phone?: string;
    email?: string;
    preferredContact: 'phone' | 'email' | 'app';
  };
  requirements?: string[];
  capacity?: number; // How many people can be helped
}

export interface MatchResult {
  need: UserNeed;
  resource: UserResource;
  matchScore: number;
  reasons: string[];
  distance: number; // km
}

export interface MatchRequest {
  id?: string;
  needId: string;
  resourceId: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  requestedBy: string;
  requestedTo: string;
  message?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export class UserMatchingService {
  /**
   * Creates a new user need
   */
  static async createNeed(need: Omit<UserNeed, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const needData = {
        ...need,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'needs'), needData);
      console.log('[USER MATCHING] Need created with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('[USER MATCHING] Error creating need:', error);
      throw error;
    }
  }

  /**
   * Creates a new user resource
   */
  static async createResource(resource: Omit<UserResource, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const resourceData = {
        ...resource,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'resources'), resourceData);
      console.log('[USER MATCHING] Resource created with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('[USER MATCHING] Error creating resource:', error);
      throw error;
    }
  }

  /**
   * Gets all active needs
   */
  static async getActiveNeeds(limitCount: number = 50): Promise<UserNeed[]> {
    try {
      const needsRef = collection(db, 'needs');
      const q = query(
        needsRef,
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const needs: UserNeed[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        needs.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          fulfilledAt: data.fulfilledAt?.toDate()
        } as UserNeed);
      });

      return needs;
    } catch (error) {
      console.error('[USER MATCHING] Error getting active needs:', error);
      return [];
    }
  }

  /**
   * Gets all available resources
   */
  static async getAvailableResources(limitCount: number = 50): Promise<UserResource[]> {
    try {
      const resourcesRef = collection(db, 'resources');
      const q = query(
        resourcesRef,
        where('status', '==', 'available'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const resources: UserResource[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        resources.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as UserResource);
      });

      return resources;
    } catch (error) {
      console.error('[USER MATCHING] Error getting available resources:', error);
      return [];
    }
  }

  /**
   * Finds matches between needs and resources
   */
  static async findMatches(needId: string, maxDistance: number = 50): Promise<MatchResult[]> {
    try {
      // Get the specific need
      const needDoc = await getDoc(doc(db, 'needs', needId));
      if (!needDoc.exists()) {
        throw new Error('Need not found');
      }

      const needData = needDoc.data();
      const need: UserNeed = {
        id: needDoc.id,
        ...needData,
        createdAt: needData.createdAt?.toDate() || new Date(),
        updatedAt: needData.updatedAt?.toDate() || new Date(),
        fulfilledAt: needData.fulfilledAt?.toDate()
      } as UserNeed;

      // Get available resources
      const resources = await this.getAvailableResources();

      const matches: MatchResult[] = [];

      for (const resource of resources) {
        const matchScore = this.calculateMatchScore(need, resource);
        const distance = this.calculateDistance(
          need.location.latitude, need.location.longitude,
          resource.location.latitude, resource.location.longitude
        );

        // Check if resource is within range
        if (distance <= resource.location.radius && distance <= maxDistance) {
          const reasons = this.getMatchReasons(need, resource, matchScore);
          
          matches.push({
            need,
            resource,
            matchScore,
            reasons,
            distance
          });
        }
      }

      // Sort by match score (highest first)
      matches.sort((a, b) => b.matchScore - a.matchScore);

      return matches;
    } catch (error) {
      console.error('[USER MATCHING] Error finding matches:', error);
      return [];
    }
  }

  /**
   * Calculates match score between need and resource
   */
  private static calculateMatchScore(need: UserNeed, resource: UserResource): number {
    let score = 0;

    // Category match (highest weight)
    if (need.category === resource.category) {
      score += 40;
    }

    // Priority and availability match
    if (need.priority === 'critical' && resource.availability === 'immediate') {
      score += 30;
    } else if (need.priority === 'high' && (resource.availability === 'immediate' || resource.availability === 'scheduled')) {
      score += 25;
    } else if (need.priority === 'medium') {
      score += 20;
    } else if (need.priority === 'low') {
      score += 15;
    }

    // Tag overlap
    const needTags = need.tags.map(tag => tag.toLowerCase());
    const resourceTags = resource.tags.map(tag => tag.toLowerCase());
    const commonTags = needTags.filter(tag => resourceTags.includes(tag));
    score += commonTags.length * 5;

    // Location proximity (closer is better)
    const distance = this.calculateDistance(
      need.location.latitude, need.location.longitude,
      resource.location.latitude, resource.location.longitude
    );
    
    if (distance <= 5) {
      score += 20;
    } else if (distance <= 10) {
      score += 15;
    } else if (distance <= 25) {
      score += 10;
    } else if (distance <= 50) {
      score += 5;
    }

    // Status match
    if (resource.status === 'available') {
      score += 10;
    }

    return Math.min(score, 100); // Cap at 100
  }

  /**
   * Gets reasons for match
   */
  private static getMatchReasons(need: UserNeed, resource: UserResource, score: number): string[] {
    const reasons: string[] = [];

    if (need.category === resource.category) {
      reasons.push(`Same category: ${need.category}`);
    }

    if (need.priority === 'critical' && resource.availability === 'immediate') {
      reasons.push('Critical need with immediate availability');
    }

    const needTags = need.tags.map(tag => tag.toLowerCase());
    const resourceTags = resource.tags.map(tag => tag.toLowerCase());
    const commonTags = needTags.filter(tag => resourceTags.includes(tag));
    
    if (commonTags.length > 0) {
      reasons.push(`Shared expertise: ${commonTags.join(', ')}`);
    }

    const distance = this.calculateDistance(
      need.location.latitude, need.location.longitude,
      resource.location.latitude, resource.location.longitude
    );

    if (distance <= 5) {
      reasons.push('Very close location');
    } else if (distance <= 25) {
      reasons.push('Nearby location');
    }

    if (score >= 80) {
      reasons.push('Excellent match');
    } else if (score >= 60) {
      reasons.push('Good match');
    }

    return reasons;
  }

  /**
   * Calculates distance between two points
   */
  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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
  }

  /**
   * Creates a match request
   */
  static async createMatchRequest(request: Omit<MatchRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const requestData = {
        ...request,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'matchRequests'), requestData);
      console.log('[USER MATCHING] Match request created with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('[USER MATCHING] Error creating match request:', error);
      throw error;
    }
  }

  /**
   * Updates a match request status
   */
  static async updateMatchRequest(requestId: string, status: MatchRequest['status']): Promise<void> {
    try {
      const requestRef = doc(db, 'matchRequests', requestId);
      await updateDoc(requestRef, {
        status,
        updatedAt: serverTimestamp(),
        ...(status === 'completed' && { completedAt: serverTimestamp() })
      });

      console.log('[USER MATCHING] Match request updated:', requestId, status);
    } catch (error) {
      console.error('[USER MATCHING] Error updating match request:', error);
      throw error;
    }
  }

  /**
   * Gets match requests for a user
   */
  static async getMatchRequests(userId: string, type: 'sent' | 'received'): Promise<MatchRequest[]> {
    try {
      const requestsRef = collection(db, 'matchRequests');
      const field = type === 'sent' ? 'requestedBy' : 'requestedTo';
      const q = query(
        requestsRef,
        where(field, '==', userId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const requests: MatchRequest[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        requests.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          completedAt: data.completedAt?.toDate()
        } as MatchRequest);
      });

      return requests;
    } catch (error) {
      console.error('[USER MATCHING] Error getting match requests:', error);
      return [];
    }
  }

  /**
   * Gets user's needs
   */
  static async getUserNeeds(userId: string): Promise<UserNeed[]> {
    try {
      const needsRef = collection(db, 'needs');
      const q = query(
        needsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const needs: UserNeed[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        needs.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          fulfilledAt: data.fulfilledAt?.toDate()
        } as UserNeed);
      });

      return needs;
    } catch (error) {
      console.error('[USER MATCHING] Error getting user needs:', error);
      return [];
    }
  }

  /**
   * Gets user's resources
   */
  static async getUserResources(userId: string): Promise<UserResource[]> {
    try {
      const resourcesRef = collection(db, 'resources');
      const q = query(
        resourcesRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const resources: UserResource[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        resources.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as UserResource);
      });

      return resources;
    } catch (error) {
      console.error('[USER MATCHING] Error getting user resources:', error);
      return [];
    }
  }
}
