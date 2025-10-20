import { project_id } from '@/9gen_config.json';

const DB_API_BASE_URL = process.env.EXPO_PUBLIC_DB_API_BASE?.replace(/\/$/, '') || 'https://api.9gen.dev';

export interface Resource {
  id: string;
  project_id: string;
  entity: string;
  data: ResourceData;
  created_at: string;
  updated_at: string;
}

export interface ResourceData {
  title: string;
  description: string;
  category: 'food' | 'water' | 'medical' | 'shelter' | 'transportation' | 'communication' | 'security' | 'supplies' | 'evacuation' | 'personnel' | 'other';
  type: 'donation' | 'service' | 'facility' | 'equipment' | 'volunteer' | 'expertise';
  quantity: number;
  unit: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
    serviceRadius?: number;
  };
  providerId: string;
  providerInfo: {
    name: string;
    organization?: string;
    phone: string;
    email: string;
    verified?: boolean;
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
    status: string;
    quantityAllocated: number;
    matchedAt: string;
  }>;
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'flagged';
  status: 'active' | 'inactive' | 'depleted' | 'expired';
  createdAt?: string;
  updatedAt?: string;
  expiresAt?: string;
}

export interface CreateResourceRequest {
  title: string;
  description: string;
  category: ResourceData['category'];
  type: ResourceData['type'];
  quantity: number;
  unit: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
    serviceRadius?: number;
  };
  providerInfo: {
    name: string;
    organization?: string;
    phone: string;
    email: string;
  };
  availability: {
    status: ResourceData['availability']['status'];
    schedule?: string;
    conditions?: string;
  };
  requirements?: string[];
  tags?: string[];
  priority: ResourceData['priority'];
  expiresAt?: string;
}

class ResourcesService {
  private baseUrl = `${DB_API_BASE_URL}/api/entities/Resources`;

  async getAllResources(): Promise<Resource[]> {
    console.log('[RESOURCES] Fetching all available resources...');
    
    try {
      const response = await fetch(`${this.baseUrl}?project_id=${project_id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch resources: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('[RESOURCES] Successfully fetched resources:', result.records?.length || 0);
      
      return result.records || [];
    } catch (error) {
      console.error('[RESOURCES] Error fetching resources:', error);
      throw error;
    }
  }

  async getResourceById(id: string): Promise<Resource> {
    console.log('[RESOURCES] Fetching resource by ID:', id);
    
    try {
      const response = await fetch(`${this.baseUrl}/${id}?project_id=${project_id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch resource: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('[RESOURCES] Successfully fetched resource:', result.id);
      
      return result;
    } catch (error) {
      console.error('[RESOURCES] Error fetching resource by ID:', error);
      throw error;
    }
  }

  async createResource(resourceData: CreateResourceRequest): Promise<Resource> {
    console.log('[RESOURCES] Creating new resource:', resourceData.title);
    
    try {
      const data: ResourceData = {
        ...resourceData,
        providerId: `provider_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        verificationStatus: 'unverified',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const response = await fetch(`${this.baseUrl}/insert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: project_id,
          data: data,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create resource: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('[RESOURCES] Successfully created resource');
      
      // Return the created resource with the generated ID
      return {
        id: result.data?.id || `resource_${Date.now()}`,
        project_id: project_id,
        entity: 'Resources',
        data: data,
        created_at: data.createdAt!,
        updated_at: data.updatedAt!,
      };
    } catch (error) {
      console.error('[RESOURCES] Error creating resource:', error);
      throw error;
    }
  }

  async updateResource(id: string, updates: Partial<ResourceData>): Promise<Resource> {
    console.log('[RESOURCES] Updating resource:', id);
    
    try {
      const updatedData = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: project_id,
          data: updatedData,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update resource: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('[RESOURCES] Successfully updated resource');
      
      return result.data;
    } catch (error) {
      console.error('[RESOURCES] Error updating resource:', error);
      throw error;
    }
  }

  async deleteResource(id: string): Promise<void> {
    console.log('[RESOURCES] Deleting resource:', id);
    
    try {
      const response = await fetch(`${this.baseUrl}/${id}?project_id=${project_id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete resource: ${response.status} ${response.statusText}`);
      }

      console.log('[RESOURCES] Successfully deleted resource');
    } catch (error) {
      console.error('[RESOURCES] Error deleting resource:', error);
      throw error;
    }
  }

  async getResourcesByCategory(category: ResourceData['category']): Promise<Resource[]> {
    console.log('[RESOURCES] Fetching resources by category:', category);
    
    try {
      const response = await fetch(`${this.baseUrl}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: project_id,
          filters: [
            {
              field: 'category',
              operator: 'eq',
              value: category,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch resources by category: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('[RESOURCES] Successfully fetched resources by category:', result.records?.length || 0);
      
      return result.records || [];
    } catch (error) {
      console.error('[RESOURCES] Error fetching resources by category:', error);
      throw error;
    }
  }

  async getAvailableResources(): Promise<Resource[]> {
    console.log('[RESOURCES] Fetching available resources...');
    
    try {
      const response = await fetch(`${this.baseUrl}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: project_id,
          filters: [
            {
              field: 'status',
              operator: 'eq',
              value: 'active',
            },
            {
              field: 'availability.status',
              operator: 'in',
              value: ['available', 'limited'],
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch available resources: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('[RESOURCES] Successfully fetched available resources:', result.records?.length || 0);
      
      return result.records || [];
    } catch (error) {
      console.error('[RESOURCES] Error fetching available resources:', error);
      throw error;
    }
  }
}

export const resourcesService = new ResourcesService();