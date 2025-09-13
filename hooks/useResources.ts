import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  resourcesService, 
  Resource, 
  ResourceData, 
  CreateResourceRequest 
} from '@/services/resourcesService';

const RESOURCES_QUERY_KEY = 'resources';

export const useResources = () => {
  return useQuery({
    queryKey: [RESOURCES_QUERY_KEY],
    queryFn: () => resourcesService.getAllResources(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useResource = (id: string) => {
  return useQuery({
    queryKey: [RESOURCES_QUERY_KEY, id],
    queryFn: () => resourcesService.getResourceById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useResourcesByCategory = (category: ResourceData['category']) => {
  return useQuery({
    queryKey: [RESOURCES_QUERY_KEY, 'category', category],
    queryFn: () => resourcesService.getResourcesByCategory(category),
    enabled: !!category,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useAvailableResources = () => {
  return useQuery({
    queryKey: [RESOURCES_QUERY_KEY, 'available'],
    queryFn: () => resourcesService.getAvailableResources(),
    staleTime: 3 * 60 * 1000, // 3 minutes for available resources
    gcTime: 10 * 60 * 1000,
  });
};

export const useCreateResource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (resourceData: CreateResourceRequest) => 
      resourcesService.createResource(resourceData),
    onSuccess: (newResource) => {
      console.log('[RESOURCES] Resource created successfully:', newResource.id);
      
      // Invalidate and refetch resources queries
      queryClient.invalidateQueries({ queryKey: [RESOURCES_QUERY_KEY] });
      
      // Add the new resource to the cache
      queryClient.setQueryData([RESOURCES_QUERY_KEY], (oldData: Resource[] | undefined) => {
        return oldData ? [...oldData, newResource] : [newResource];
      });
    },
    onError: (error) => {
      console.error('[RESOURCES] Failed to create resource:', error);
    },
  });
};

export const useUpdateResource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<ResourceData> }) =>
      resourcesService.updateResource(id, updates),
    onSuccess: (updatedResource, { id }) => {
      console.log('[RESOURCES] Resource updated successfully:', id);
      
      // Invalidate and refetch resources queries
      queryClient.invalidateQueries({ queryKey: [RESOURCES_QUERY_KEY] });
      
      // Update the specific resource in the cache
      queryClient.setQueryData([RESOURCES_QUERY_KEY, id], updatedResource);
      
      // Update the resource in the main list
      queryClient.setQueryData([RESOURCES_QUERY_KEY], (oldData: Resource[] | undefined) => {
        return oldData?.map(resource => 
          resource.id === id ? updatedResource : resource
        ) || [];
      });
    },
    onError: (error) => {
      console.error('[RESOURCES] Failed to update resource:', error);
    },
  });
};

export const useDeleteResource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => resourcesService.deleteResource(id),
    onSuccess: (_, id) => {
      console.log('[RESOURCES] Resource deleted successfully:', id);
      
      // Remove from cache
      queryClient.setQueryData([RESOURCES_QUERY_KEY], (oldData: Resource[] | undefined) => {
        return oldData?.filter(resource => resource.id !== id) || [];
      });
      
      // Remove individual resource query
      queryClient.removeQueries({ queryKey: [RESOURCES_QUERY_KEY, id] });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: [RESOURCES_QUERY_KEY] });
    },
    onError: (error) => {
      console.error('[RESOURCES] Failed to delete resource:', error);
    },
  });
};

export const useToggleResourceAvailability = () => {
  const updateResource = useUpdateResource();

  return useMutation({
    mutationFn: ({ 
      resource, 
      newStatus 
    }: { 
      resource: Resource; 
      newStatus: ResourceData['availability']['status']; 
    }) => {
      const updates: Partial<ResourceData> = {
        availability: {
          ...resource.data.availability,
          status: newStatus,
        },
      };
      
      return updateResource.mutateAsync({ id: resource.id, updates });
    },
    onSuccess: () => {
      console.log('[RESOURCES] Resource availability toggled successfully');
    },
    onError: (error) => {
      console.error('[RESOURCES] Failed to toggle resource availability:', error);
    },
  });
};

export const useMarkResourceDepleted = () => {
  const updateResource = useUpdateResource();

  return useMutation({
    mutationFn: (resource: Resource) => {
      const updates: Partial<ResourceData> = {
        status: 'depleted',
        availability: {
          ...resource.data.availability,
          status: 'unavailable',
        },
      };
      
      return updateResource.mutateAsync({ id: resource.id, updates });
    },
    onSuccess: () => {
      console.log('[RESOURCES] Resource marked as depleted successfully');
    },
    onError: (error) => {
      console.error('[RESOURCES] Failed to mark resource as depleted:', error);
    },
  });
};