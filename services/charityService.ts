import { RelatedCharity } from '@/types/conflict';
import { project_id } from '@/9gen_config.json';

const DB_API_BASE_URL = process.env.EXPO_PUBLIC_DB_API_BASE || 'https://api.9gen.dev/api';

/**
 * Get charities related to a specific conflict zone based on location and conflict type
 */
export const getCharitiesForConflict = async (
  country?: string,
  region?: string,
  tags?: string[]
): Promise<RelatedCharity[]> => {
  try {
    // Build filters for charity query
    const filters = [];
    
    if (country) {
      filters.push({
        field: 'operatingRegions',
        operator: 'contains',
        value: country
      });
    }
    
    if (region) {
      filters.push({
        field: 'operatingRegions', 
        operator: 'contains',
        value: region
      });
    }
    
    if (tags && tags.length > 0) {
      filters.push({
        field: 'focusAreas',
        operator: 'in',
        value: tags
      });
    }

    const queryParams = new URLSearchParams({
      project_id: project_id,
      sort_by: 'trustworthinessRating',
      sort_order: 'desc',
      limit: '4'
    });

    if (filters.length > 0) {
      queryParams.append('filters', JSON.stringify(filters));
    }

    const response = await fetch(`${DB_API_BASE_URL}/entities/Charity?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch charities: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform API response to RelatedCharity objects
    const charities: RelatedCharity[] = data.records?.map((record: any) => ({
      name: record.data.name,
      description: record.data.description,
      trustworthinessRating: record.data.trustworthinessRating || 0,
      websiteUrl: record.data.websiteUrl,
      donationUrl: record.data.donationUrl,
      focusAreas: record.data.focusAreas || [],
      verifiedStatus: record.data.verifiedStatus || false,
      registrationNumber: record.data.registrationNumber
    })) || [];

    return charities;
  } catch (error) {
    console.error('Error fetching charities:', error);
    
    // Return empty array instead of fallback data
    return [];
  }
};

/**
 * Get trustworthiness rating color based on the rating value
 */
export const getTrustworthinessColor = (rating: number): string => {
  if (rating >= 9) return '#00FF88'; // Excellent - Green
  if (rating >= 7.5) return '#FFD700'; // Good - Gold
  if (rating >= 6) return '#FF8C00'; // Fair - Orange
  return '#FF4444'; // Poor - Red
};

/**
 * Get trustworthiness rating text
 */
export const getTrustworthinessText = (rating: number): string => {
  if (rating >= 9) return 'EXCELLENT';
  if (rating >= 7.5) return 'GOOD';
  if (rating >= 6) return 'FAIR';
  return 'CAUTION';
};

/**
 * Get charity focus area emoji
 */
export const getFocusAreaEmoji = (focusArea: string): string => {
  const area = focusArea.toLowerCase();
  
  if (area.includes('medical') || area.includes('health')) return '🏥';
  if (area.includes('food') || area.includes('nutrition')) return '🍽️';
  if (area.includes('water') || area.includes('sanitation')) return '💧';
  if (area.includes('child') || area.includes('education')) return '👶';
  if (area.includes('shelter') || area.includes('housing')) return '🏠';
  if (area.includes('protection') || area.includes('legal')) return '🛡️';
  if (area.includes('emergency') || area.includes('response')) return '🚨';
  if (area.includes('refugee')) return '🏃‍♂️';
  
  return '🤝'; // Default helping hands emoji
};