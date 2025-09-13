import { ConflictZone } from '@/types/conflict';
import { project_id } from '@/9gen_config.json';
import { errorHandler } from '@/utils/errorHandler';

const DB_API_BASE_URL = 'https://api.9gen.dev';

export interface ConflictSubmissionResponse {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Submit a new conflict report to the database
 */
export const submitConflictReport = async (conflictData: Partial<ConflictZone>): Promise<ConflictSubmissionResponse> => {
  try {
    console.log('[CONFLICT SUBMISSION] Submitting conflict report:', conflictData.title);
    
    const response = await fetch(`${DB_API_BASE_URL}/api/entities/ConflictZone/insert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project_id: project_id,
        data: {
          ...conflictData,
          // Ensure required fields have defaults
          verified: false,
          submissionStatus: conflictData.submissionStatus || 'submitted',
          dateReported: conflictData.dateReported || new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          confidence: 50, // Default confidence for user submissions
        },
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${JSON.stringify(result)}`);
    }

    if (result.success) {
      console.log('[CONFLICT SUBMISSION] Successfully submitted conflict:', result.data?.id);
      return {
        success: true,
        message: 'Conflict report submitted successfully',
        data: result.data,
      };
    } else {
      throw new Error(result.message || 'Failed to submit conflict report');
    }
    
  } catch (error) {
    console.error('[CONFLICT SUBMISSION] Error submitting conflict:', error);
    errorHandler({
      filePath: 'services/conflictSubmissionService.ts',
      functionName: 'submitConflictReport',
      error: error as Error,
    });
    
    return {
      success: false,
      message: 'Failed to submit conflict report. Please check your connection and try again.',
    };
  }
};

/**
 * Get user-submitted conflicts with optional filtering
 */
export const getUserSubmittedConflicts = async (submitterEmail?: string): Promise<{ conflicts: ConflictZone[]; error?: string }> => {
  try {
    console.log('[CONFLICT SUBMISSION] Fetching user-submitted conflicts...');
    
    const filters = [];
    if (submitterEmail) {
      filters.push({
        field: 'submittedBy.email',
        operator: 'eq',
        value: submitterEmail,
      });
    }
    
    // Always filter for user submissions
    filters.push({
      field: 'submissionStatus',
      operator: 'in',
      value: ['submitted', 'under_review', 'verified', 'published'],
    });

    const queryParams = new URLSearchParams({
      project_id: project_id,
      sort_by: 'created_at',
      sort_order: 'desc',
    });

    if (filters.length > 0) {
      queryParams.append('filters', JSON.stringify(filters));
    }

    const response = await fetch(`${DB_API_BASE_URL}/api/entities/ConflictZone?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const conflicts = result.records || [];
    console.log('[CONFLICT SUBMISSION] Retrieved user-submitted conflicts:', conflicts.length);
    
    return { conflicts };
    
  } catch (error) {
    console.error('[CONFLICT SUBMISSION] Error fetching user submissions:', error);
    errorHandler({
      filePath: 'services/conflictSubmissionService.ts',
      functionName: 'getUserSubmittedConflicts',
      error: error as Error,
    });
    
    return {
      conflicts: [],
      error: 'Failed to load user-submitted conflicts',
    };
  }
};

/**
 * Update the status of a submitted conflict (for moderation)
 */
export const updateConflictStatus = async (
  conflictId: string,
  status: 'submitted' | 'under_review' | 'verified' | 'published' | 'rejected',
  moderationNote?: string
): Promise<ConflictSubmissionResponse> => {
  try {
    console.log('[CONFLICT SUBMISSION] Updating conflict status:', conflictId, status);
    
    const updateData: any = {
      submissionStatus: status,
      lastUpdated: new Date().toISOString(),
    };

    if (moderationNote) {
      updateData.moderationNotes = [
        {
          note: moderationNote,
          timestamp: new Date().toISOString(),
          action: status === 'verified' ? 'approve' : 
                  status === 'rejected' ? 'reject' : 
                  status === 'published' ? 'approve' : 'review',
        },
      ];
    }

    // If status is verified or published, also mark as verified
    if (status === 'verified' || status === 'published') {
      updateData.verified = true;
    }

    const response = await fetch(`${DB_API_BASE_URL}/api/entities/ConflictZone/${conflictId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project_id: project_id,
        data: updateData,
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    if (result.success) {
      console.log('[CONFLICT SUBMISSION] Successfully updated conflict status');
      return {
        success: true,
        message: `Conflict status updated to ${status}`,
        data: result.data,
      };
    } else {
      throw new Error(result.message || 'Failed to update conflict status');
    }
    
  } catch (error) {
    console.error('[CONFLICT SUBMISSION] Error updating conflict status:', error);
    errorHandler({
      filePath: 'services/conflictSubmissionService.ts',
      functionName: 'updateConflictStatus',
      error: error as Error,
    });
    
    return {
      success: false,
      message: 'Failed to update conflict status',
    };
  }
};

/**
 * Validate citation URLs and check accessibility
 */
export const validateCitation = async (url: string): Promise<{ isValid: boolean; title?: string; error?: string }> => {
  try {
    console.log('[CONFLICT SUBMISSION] Validating citation:', url);
    
    // Basic URL validation
    const urlPattern = /^https?:\/\/.+/i;
    if (!urlPattern.test(url)) {
      return {
        isValid: false,
        error: 'Invalid URL format',
      };
    }

    // For demo purposes, we'll just return valid
    // In production, you might want to fetch the URL to check if it's accessible
    // and extract the title from the HTML
    return {
      isValid: true,
      title: 'Verified Source', // You could extract this from the actual page
    };
    
  } catch (error) {
    console.error('[CONFLICT SUBMISSION] Error validating citation:', error);
    return {
      isValid: false,
      error: 'Could not validate citation',
    };
  }
};

/**
 * Upload media file to cloud storage (mock implementation)
 */
export const uploadMediaFile = async (fileUri: string, filename: string): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    console.log('[CONFLICT SUBMISSION] Uploading media file:', filename);
    
    // For demo purposes, we'll just return the local URI
    // In production, you would upload to cloud storage (AWS S3, Google Cloud, etc.)
    
    // Mock upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      url: fileUri, // In production, this would be the cloud storage URL
    };
    
  } catch (error) {
    console.error('[CONFLICT SUBMISSION] Error uploading media:', error);
    errorHandler({
      filePath: 'services/conflictSubmissionService.ts',
      functionName: 'uploadMediaFile',
      error: error as Error,
    });
    
    return {
      success: false,
      error: 'Failed to upload media file',
    };
  }
};

/**
 * Get submission statistics for analytics
 */
export const getSubmissionStatistics = async (): Promise<{
  totalSubmissions: number;
  pendingReview: number;
  verified: number;
  published: number;
  rejected: number;
}> => {
  try {
    console.log('[CONFLICT SUBMISSION] Fetching submission statistics...');
    
    const response = await fetch(`${DB_API_BASE_URL}/api/entities/ConflictZone`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    const conflicts = result.records || [];
    
    // Filter for user submissions and calculate stats
    const userSubmissions = conflicts.filter((c: ConflictZone) => c.submissionStatus);
    
    const stats = {
      totalSubmissions: userSubmissions.length,
      pendingReview: userSubmissions.filter((c: ConflictZone) => c.submissionStatus === 'submitted' || c.submissionStatus === 'under_review').length,
      verified: userSubmissions.filter((c: ConflictZone) => c.submissionStatus === 'verified').length,
      published: userSubmissions.filter((c: ConflictZone) => c.submissionStatus === 'published').length,
      rejected: userSubmissions.filter((c: ConflictZone) => c.submissionStatus === 'rejected').length,
    };
    
    console.log('[CONFLICT SUBMISSION] Submission statistics:', stats);
    return stats;
    
  } catch (error) {
    console.error('[CONFLICT SUBMISSION] Error fetching statistics:', error);
    errorHandler({
      filePath: 'services/conflictSubmissionService.ts',
      functionName: 'getSubmissionStatistics',
      error: error as Error,
    });
    
    // Return empty stats on error
    return {
      totalSubmissions: 0,
      pendingReview: 0,
      verified: 0,
      published: 0,
      rejected: 0,
    };
  }
};