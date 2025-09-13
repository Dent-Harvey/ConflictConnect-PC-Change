import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ConflictZone } from '@/types/conflict';
import { 
  submitConflictReport, 
  getUserSubmittedConflicts, 
  updateConflictStatus,
  getSubmissionStatistics,
  ConflictSubmissionResponse 
} from '@/services/conflictSubmissionService';
import { errorHandler } from '@/utils/errorHandler';

/**
 * Hook for submitting a new conflict report
 */
export const useSubmitConflict = () => {
  const queryClient = useQueryClient();
  
  return useMutation<ConflictSubmissionResponse, Error, Partial<ConflictZone>>({
    mutationFn: submitConflictReport,
    onSuccess: (data) => {
      console.log('[CONFLICT SUBMISSION HOOK] Conflict submitted successfully:', data);
      // Invalidate and refetch conflicts to include the new submission
      queryClient.invalidateQueries({ queryKey: ['conflicts'] });
      queryClient.invalidateQueries({ queryKey: ['userSubmissions'] });
      queryClient.invalidateQueries({ queryKey: ['submissionStats'] });
    },
    onError: (error) => {
      console.error('[CONFLICT SUBMISSION HOOK] Error submitting conflict:', error);
      errorHandler({
        filePath: 'hooks/useConflictSubmission.ts',
        functionName: 'useSubmitConflict',
        error,
      });
    },
  });
};

/**
 * Hook for fetching user-submitted conflicts
 */
export const useUserSubmittedConflicts = (submitterEmail?: string) => {
  return useQuery({
    queryKey: ['userSubmissions', submitterEmail],
    queryFn: () => getUserSubmittedConflicts(submitterEmail),
    select: (data) => ({
      conflicts: data.conflicts,
      error: data.error,
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * Hook for updating conflict status (for moderation)
 */
export const useUpdateConflictStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation<
    ConflictSubmissionResponse,
    Error,
    { conflictId: string; status: 'submitted' | 'under_review' | 'verified' | 'published' | 'rejected'; moderationNote?: string }
  >({
    mutationFn: ({ conflictId, status, moderationNote }) => 
      updateConflictStatus(conflictId, status, moderationNote),
    onSuccess: (data, variables) => {
      console.log('[CONFLICT SUBMISSION HOOK] Conflict status updated:', variables.status);
      // Invalidate queries to reflect status changes
      queryClient.invalidateQueries({ queryKey: ['conflicts'] });
      queryClient.invalidateQueries({ queryKey: ['userSubmissions'] });
      queryClient.invalidateQueries({ queryKey: ['submissionStats'] });
    },
    onError: (error) => {
      console.error('[CONFLICT SUBMISSION HOOK] Error updating conflict status:', error);
      errorHandler({
        filePath: 'hooks/useConflictSubmission.ts',
        functionName: 'useUpdateConflictStatus',
        error,
      });
    },
  });
};

/**
 * Hook for fetching submission statistics
 */
export const useSubmissionStatistics = () => {
  return useQuery({
    queryKey: ['submissionStats'],
    queryFn: getSubmissionStatistics,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

/**
 * Hook for getting conflicts by status
 */
export const useConflictsByStatus = (status: 'submitted' | 'under_review' | 'verified' | 'published' | 'rejected') => {
  const { data: userSubmissions, ...rest } = useUserSubmittedConflicts();
  
  const conflictsByStatus = userSubmissions?.conflicts.filter(
    (conflict) => conflict.submissionStatus === status
  ) || [];
  
  return {
    conflicts: conflictsByStatus,
    count: conflictsByStatus.length,
    ...rest,
  };
};

/**
 * Hook for getting recent submissions (last 7 days)
 */
export const useRecentSubmissions = () => {
  const { data: userSubmissions, ...rest } = useUserSubmittedConflicts();
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const recentConflicts = userSubmissions?.conflicts.filter(
    (conflict) => {
      if (!conflict.created_at) return false;
      return new Date(conflict.created_at) > sevenDaysAgo;
    }
  ) || [];
  
  return {
    conflicts: recentConflicts,
    count: recentConflicts.length,
    ...rest,
  };
};

/**
 * Hook for validating a conflict submission before submitting
 */
export const useValidateSubmission = () => {
  return useMutation<
    { isValid: boolean; errors: string[] },
    Error,
    Partial<ConflictZone>
  >({
    mutationFn: async (conflictData) => {
      const errors: string[] = [];
      
      // Basic validation
      if (!conflictData.title?.trim()) {
        errors.push('Title is required');
      }
      
      if (!conflictData.description?.trim() || conflictData.description.length < 10) {
        errors.push('Description must be at least 10 characters');
      }
      
      if (!conflictData.location?.trim()) {
        errors.push('Location is required');
      }
      
      if (!conflictData.country?.trim()) {
        errors.push('Country is required');
      }
      
      if (!conflictData.submittedBy?.name?.trim()) {
        errors.push('Submitter name is required');
      }
      
      if (!conflictData.submittedBy?.email?.trim()) {
        errors.push('Submitter email is required');
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(conflictData.submittedBy.email)) {
          errors.push('Valid email address is required');
        }
      }
      
      // Validate citations
      if (conflictData.citations && conflictData.citations.length > 0) {
        conflictData.citations.forEach((citation, index) => {
          if (!citation.title?.trim()) {
            errors.push(`Citation ${index + 1} title is required`);
          }
          if (!citation.url?.trim()) {
            errors.push(`Citation ${index + 1} URL is required`);
          } else {
            const urlRegex = /^https?:\/\/.+/i;
            if (!urlRegex.test(citation.url)) {
              errors.push(`Citation ${index + 1} must have a valid URL`);
            }
          }
        });
      }
      
      // Validate associated needs
      if (conflictData.associatedNeeds && conflictData.associatedNeeds.length > 0) {
        conflictData.associatedNeeds.forEach((need, index) => {
          if (!need.description?.trim()) {
            errors.push(`Need ${index + 1} description is required`);
          }
          if (!need.category) {
            errors.push(`Need ${index + 1} category is required`);
          }
          if (!need.urgency) {
            errors.push(`Need ${index + 1} urgency level is required`);
          }
        });
      }
      
      return {
        isValid: errors.length === 0,
        errors,
      };
    },
    onError: (error) => {
      errorHandler({
        filePath: 'hooks/useConflictSubmission.ts',
        functionName: 'useValidateSubmission',
        error,
      });
    },
  });
};