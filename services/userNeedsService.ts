import { project_id } from '@/9gen_config.json';

const DB_API_BASE_URL = 'https://api.9gen.dev/api/entities';

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
    latitude: number;
    longitude: number;
    address?: string;
    landmark?: string;
  };
  conflictZoneId: string;
  userId: string;
  contactInfo?: {
    name?: string;
    phone?: string;
    email?: string;
    preferredContact?: string;
  };
  status: 'open' | 'in_progress' | 'partially_fulfilled' | 'fulfilled' | 'cancelled' | 'expired';
  tags?: string[];
  // Optional funding request block
  fundingRequest?: {
    reason?: string; // human-entered justification
    amount?: number; // requested amount in minor units or float
    currency?: string; // ISO 4217 code, e.g., USD, EUR
    canReceiveVia?: Array<'google_pay' | 'paypal' | 'apple_pay' | 'celo'>;
    canSendVia?: Array<'google_pay' | 'paypal' | 'apple_pay' | 'celo'>;
  };
  fulfillmentRequests?: FulfillmentRequest[];
  verificationStatus?: 'unverified' | 'pending' | 'verified' | 'flagged';
  createdAt?: string;
  updatedAt?: string;
  expiresAt?: string;
}

export interface FulfillmentRequest {
  resourceId: string;
  providerId: string;
  status: string;
  quantity: number;
  estimatedDelivery?: string;
  notes?: string;
}

export interface Resource {
  id?: string;
  title: string;
  description: string;
  category: 'food' | 'water' | 'medical' | 'shelter' | 'transportation' | 'communication' | 'security' | 'supplies' | 'evacuation' | 'personnel' | 'other';
  type: 'donation' | 'service' | 'facility' | 'equipment' | 'volunteer' | 'expertise';
  quantity: number;
  unit?: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
    serviceRadius?: number;
  };
  providerId: string;
  providerInfo?: {
    name?: string;
    organization?: string;
    phone?: string;
    email?: string;
    verified?: boolean;
  };
  availability?: {
    status: 'available' | 'limited' | 'reserved' | 'unavailable';
    schedule?: string;
    conditions?: string;
  };
  requirements?: string[];
  tags?: string[];
  priority?: 'low' | 'medium' | 'high' | 'emergency';
  matchedNeeds?: MatchedNeed[];
  verificationStatus?: 'unverified' | 'pending' | 'verified' | 'flagged';
  status: 'active' | 'inactive' | 'depleted' | 'expired';
  createdAt?: string;
  updatedAt?: string;
  expiresAt?: string;
}

export interface MatchedNeed {
  needId: string;
  status: string;
  quantityAllocated: number;
  matchedAt: string;
}

export interface QueryFilter {
  field: string;
  operator?: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'nin' | 'contains';
  value: any;
}

class UserNeedsService {
  async createNeed(needData: Omit<UserNeed, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserNeed> {
    const response = await fetch(`${DB_API_BASE_URL}/UserNeeds/insert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project_id,
        data: {
          ...needData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: needData.status || 'open',
          verificationStatus: 'unverified'
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create need: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }

  async getNeedsByConflictZone(conflictZoneId: string): Promise<UserNeed[]> {
    const filters = JSON.stringify([
      { field: 'conflictZoneId', operator: 'eq', value: conflictZoneId }
    ]);

    const response = await fetch(
      `${DB_API_BASE_URL}/UserNeeds?project_id=${project_id}&filters=${encodeURIComponent(filters)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch needs: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result.records?.map((record: any) => ({ id: record.id, ...record.data })) || [];
  }

  async getAllNeeds(filters?: QueryFilter[]): Promise<UserNeed[]> {
    let url = `${DB_API_BASE_URL}/UserNeeds?project_id=${project_id}`;
    
    if (filters && filters.length > 0) {
      const filtersParam = JSON.stringify(filters);
      url += `&filters=${encodeURIComponent(filtersParam)}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch needs: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result.records?.map((record: any) => ({ id: record.id, ...record.data })) || [];
  }

  async updateNeed(needId: string, updates: Partial<UserNeed>): Promise<UserNeed> {
    const response = await fetch(`${DB_API_BASE_URL}/UserNeeds/${needId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project_id,
        data: {
          ...updates,
          updatedAt: new Date().toISOString(),
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update need: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }

  async deleteNeed(needId: string): Promise<void> {
    const response = await fetch(
      `${DB_API_BASE_URL}/UserNeeds/${needId}?project_id=${project_id}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete need: ${response.status} ${response.statusText}`);
    }
  }

  async createResource(resourceData: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>): Promise<Resource> {
    const response = await fetch(`${DB_API_BASE_URL}/Resources/insert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project_id,
        data: {
          ...resourceData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: resourceData.status || 'active',
          verificationStatus: 'unverified',
          availability: resourceData.availability || { status: 'available' }
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create resource: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }

  async getAvailableResources(filters?: QueryFilter[]): Promise<Resource[]> {
    let url = `${DB_API_BASE_URL}/Resources?project_id=${project_id}`;
    
    if (filters && filters.length > 0) {
      const filtersParam = JSON.stringify(filters);
      url += `&filters=${encodeURIComponent(filtersParam)}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch resources: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result.records?.map((record: any) => ({ id: record.id, ...record.data })) || [];
  }

  async matchNeedsWithResources(needId: string, category: string, location: { latitude: number; longitude: number }): Promise<Resource[]> {
    // Get resources in the same category
    const categoryFilter: QueryFilter[] = [
      { field: 'category', operator: 'eq', value: category },
      { field: 'status', operator: 'eq', value: 'active' }
    ];

    const resources = await this.getAvailableResources(categoryFilter);
    
    // Simple distance-based matching (within 50km)
    const nearbyResources = resources.filter(resource => {
      const distance = this.calculateDistance(
        location.latitude,
        location.longitude,
        resource.location.latitude,
        resource.location.longitude
      );
      return distance <= 50; // 50km radius
    });

    return nearbyResources.sort((a, b) => {
      // Sort by priority and then by distance
      const priorityOrder = { emergency: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority || 'low'];
      const bPriority = priorityOrder[b.priority || 'low'];
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }

      const aDistance = this.calculateDistance(location.latitude, location.longitude, a.location.latitude, a.location.longitude);
      const bDistance = this.calculateDistance(location.latitude, location.longitude, b.location.latitude, b.location.longitude);
      return aDistance - bDistance;
    });
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  async requestFulfillment(needId: string, resourceId: string, quantity: number, notes?: string): Promise<void> {
    // Get the current need
    const response = await fetch(
      `${DB_API_BASE_URL}/UserNeeds/${needId}?project_id=${project_id}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch need: ${response.status} ${response.statusText}`);
    }

    const needRecord = await response.json();
    const need = { id: needRecord.id, ...needRecord.data };

    // Add fulfillment request
    const fulfillmentRequest: FulfillmentRequest = {
      resourceId,
      providerId: 'current_user', // This should come from auth context
      status: 'pending',
      quantity,
      notes,
    };

    const updatedFulfillmentRequests = [...(need.fulfillmentRequests || []), fulfillmentRequest];

    await this.updateNeed(needId, {
      fulfillmentRequests: updatedFulfillmentRequests,
      status: 'in_progress',
    });
  }
}

export const userNeedsService = new UserNeedsService();