import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userNeedsService, UserNeed, Resource, QueryFilter } from '@/services/userNeedsService';
import { errorHandler } from '@/utils/errorHandler';

export const useUserNeeds = (filters?: QueryFilter[]) => {
  return useQuery({
    queryKey: ['userNeeds', filters],
    queryFn: async () => {
      try {
        return await userNeedsService.getAllNeeds(filters);
      } catch (error) {
        errorHandler({
          filePath: '/hooks/useUserNeeds.ts',
          functionName: 'useUserNeeds.queryFn',
          error: error as Error,
        });
        throw error;
      }
    },
    staleTime: 30000, // 30 seconds
  });
};

export const useNeedsByConflictZone = (conflictZoneId: string) => {
  return useQuery({
    queryKey: ['userNeeds', 'conflictZone', conflictZoneId],
    queryFn: async () => {
      try {
        return await userNeedsService.getNeedsByConflictZone(conflictZoneId);
      } catch (error) {
        errorHandler({
          filePath: '/hooks/useUserNeeds.ts',
          functionName: 'useNeedsByConflictZone.queryFn',
          error: error as Error,
        });
        throw error;
      }
    },
    enabled: !!conflictZoneId,
    staleTime: 30000,
  });
};

export const useCreateNeed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (needData: Omit<UserNeed, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        return await userNeedsService.createNeed(needData);
      } catch (error) {
        errorHandler({
          filePath: '/hooks/useUserNeeds.ts',
          functionName: 'useCreateNeed.mutationFn',
          error: error as Error,
        });
        throw error;
      }
    },
    onSuccess: (newNeed) => {
      // Invalidate and refetch needs queries
      queryClient.invalidateQueries({ queryKey: ['userNeeds'] });
      queryClient.invalidateQueries({ 
        queryKey: ['userNeeds', 'conflictZone', newNeed.conflictZoneId] 
      });
    },
  });
};

export const useUpdateNeed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ needId, updates }: { needId: string; updates: Partial<UserNeed> }) => {
      try {
        return await userNeedsService.updateNeed(needId, updates);
      } catch (error) {
        errorHandler({
          filePath: '/hooks/useUserNeeds.ts',
          functionName: 'useUpdateNeed.mutationFn',
          error: error as Error,
        });
        throw error;
      }
    },
    onSuccess: (updatedNeed) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['userNeeds'] });
      if (updatedNeed.conflictZoneId) {
        queryClient.invalidateQueries({ 
          queryKey: ['userNeeds', 'conflictZone', updatedNeed.conflictZoneId] 
        });
      }
    },
  });
};

export const useDeleteNeed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (needId: string) => {
      try {
        await userNeedsService.deleteNeed(needId);
        return needId;
      } catch (error) {
        errorHandler({
          filePath: '/hooks/useUserNeeds.ts',
          functionName: 'useDeleteNeed.mutationFn',
          error: error as Error,
        });
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate all needs queries
      queryClient.invalidateQueries({ queryKey: ['userNeeds'] });
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
};

export const useResources = (filters?: QueryFilter[]) => {
  return useQuery({
    queryKey: ['resources', filters],
    queryFn: async () => {
      try {
        return await userNeedsService.getAvailableResources(filters);
      } catch (error) {
        errorHandler({
          filePath: '/hooks/useUserNeeds.ts',
          functionName: 'useResources.queryFn',
          error: error as Error,
        });
        throw error;
      }
    },
    staleTime: 30000,
  });
};

export const useCreateResource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (resourceData: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        return await userNeedsService.createResource(resourceData);
      } catch (error) {
        errorHandler({
          filePath: '/hooks/useUserNeeds.ts',
          functionName: 'useCreateResource.mutationFn',
          error: error as Error,
        });
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate resources queries
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
};

export const useMatchResources = (needId: string, category: string, location: { latitude: number; longitude: number }) => {
  return useQuery({
    queryKey: ['matchedResources', needId, category, location],
    queryFn: async () => {
      try {
        return await userNeedsService.matchNeedsWithResources(needId, category, location);
      } catch (error) {
        errorHandler({
          filePath: '/hooks/useUserNeeds.ts',
          functionName: 'useMatchResources.queryFn',
          error: error as Error,
        });
        throw error;
      }
    },
    enabled: !!needId && !!category && !!location.latitude && !!location.longitude,
    staleTime: 60000, // 1 minute
  });
};

export const useRequestFulfillment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ needId, resourceId, quantity, notes }: {
      needId: string;
      resourceId: string;
      quantity: number;
      notes?: string;
    }) => {
      try {
        await userNeedsService.requestFulfillment(needId, resourceId, quantity, notes);
        return { needId, resourceId };
      } catch (error) {
        errorHandler({
          filePath: '/hooks/useUserNeeds.ts',
          functionName: 'useRequestFulfillment.mutationFn',
          error: error as Error,
        });
        throw error;
      }
    },
    onSuccess: ({ needId }) => {
      // Invalidate needs and resources queries
      queryClient.invalidateQueries({ queryKey: ['userNeeds'] });
      queryClient.invalidateQueries({ queryKey: ['matchedResources', needId] });
    },
  });
};