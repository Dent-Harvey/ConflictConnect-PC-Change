import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ConflictZone, ConflictFilters } from '@/types/conflict';
import { ConflictService } from '@/services/conflictService';
import { errorHandler } from '@/utils/errorHandler';

export const CONFLICT_QUERY_KEYS = {
  all: ['conflicts'] as const,
  lists: () => [...CONFLICT_QUERY_KEYS.all, 'list'] as const,
  list: (filters?: ConflictFilters) => [...CONFLICT_QUERY_KEYS.lists(), filters] as const,
  details: () => [...CONFLICT_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...CONFLICT_QUERY_KEYS.details(), id] as const,
};

export const useConflictZones = (filters?: ConflictFilters) => {
  return useQuery({
    queryKey: CONFLICT_QUERY_KEYS.list(filters),
    queryFn: () => ConflictService.getConflictZones(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes - shorter for fresher data
    gcTime: 15 * 60 * 1000, // 15 minutes - longer garbage collection
    refetchInterval: 3 * 60 * 1000, // Refetch every 3 minutes
    refetchOnMount: 'always', // Always get fresh data
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnReconnect: true, // Refetch on network reconnect
    networkMode: 'online',
    retry: 1, // Faster failure for better UX
    retryDelay: 1000,
  });
};

export const useConflictZone = (id: string | undefined) => {
  return useQuery({
    queryKey: CONFLICT_QUERY_KEYS.detail(id || ''),
    queryFn: async () => {
      console.log('Fetching conflict zone with ID:', id);
      if (!id) {
        throw new Error('No conflict ID provided');
      }
      const result = await ConflictService.getConflictZoneById(id);
      console.log('Conflict zone result:', result ? 'Found' : 'Not found');
      return result;
    },
    enabled: !!id && id.length > 0,
    staleTime: 15 * 60 * 1000, // 15 minutes for individual conflict - longer cache
    gcTime: 30 * 60 * 1000, // 30 minutes garbage collection
    refetchInterval: false, // Disable automatic refetching for individual conflicts
    refetchOnMount: 'always', // Always get fresh data when component mounts
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 1, // Reduce retry attempts for faster failure
    retryDelay: 1000, // Faster retry
    networkMode: 'online', // Only fetch when online
  });
};

export const useCreateConflictZone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conflictData: Omit<ConflictZone, 'id'>) => 
      ConflictService.createConflictZone(conflictData),
    onSuccess: (newConflict) => {
      // Optimistically update the cache first for immediate UI feedback
      queryClient.setQueryData<ConflictZone[]>(
        CONFLICT_QUERY_KEYS.list(),
        (oldConflicts) => oldConflicts ? [newConflict, ...oldConflicts] : [newConflict]
      );

      // Then invalidate to ensure consistency
      queryClient.invalidateQueries({
        queryKey: CONFLICT_QUERY_KEYS.lists(),
      });

      console.log('New conflict zone created:', newConflict.title);
    },
    onError: (error) => {
      errorHandler({
        filePath: '/hooks/useConflictData.ts',
        functionName: 'useCreateConflictZone.onError',
        error: error as Error,
      });
      
      // Rollback optimistic update on error
      queryClient.invalidateQueries({
        queryKey: CONFLICT_QUERY_KEYS.lists(),
      });
    },
  });
};

export const useLatestConflictData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ConflictService.fetchLatestConflictData,
    onSuccess: async (newConflicts) => {
      // Since we're no longer using mock data, this method returns empty array
      // In a real implementation, this would process actual real-time data
      if (newConflicts.length > 0) {
        // For each new conflict, check if it already exists and add if not
        for (const conflict of newConflicts) {
          try {
            await ConflictService.createConflictZone(conflict);
          } catch (error) {
            // If conflict already exists, just log and continue
            console.log('Conflict may already exist:', conflict.title);
          }
        }

        // Invalidate queries to refetch updated data
        queryClient.invalidateQueries({
          queryKey: CONFLICT_QUERY_KEYS.lists(),
        });

        console.log(`Processed ${newConflicts.length} new conflict reports`);
      } else {
        console.log('No new conflict data available - real-time data source not configured');
      }
    },
    onError: (error) => {
      errorHandler({
        filePath: '/hooks/useConflictData.ts',
        functionName: 'useLatestConflictData.onError',
        error: error as Error,
      });
    },
  });
};

export const useRefreshConflictData = () => {
  const queryClient = useQueryClient();

  return () => {
    // Force refetch with fresh data
    queryClient.refetchQueries({
      queryKey: CONFLICT_QUERY_KEYS.all,
      type: 'active',
    });
  };
};

// New hook for prefetching conflict details when hovering/previewing
export const usePrefetchConflictZone = () => {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: CONFLICT_QUERY_KEYS.detail(id),
      queryFn: () => ConflictService.getConflictZoneById(id),
      staleTime: 15 * 60 * 1000, // 15 minutes
    });
  };
};