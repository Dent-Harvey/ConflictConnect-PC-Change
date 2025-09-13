import { useMemo } from 'react';
import { SuggestedNeedsService, SuggestedNeed } from '@/services/suggestedNeedsService';
import { UserNeed } from '@/services/userNeedsService';
import { ConflictZone } from '@/types/conflict';

interface UseSuggestedNeedsProps {
  conflictZone: ConflictZone | null;
  existingNeeds: UserNeed[];
  enabled?: boolean;
}

export const useSuggestedNeeds = ({
  conflictZone,
  existingNeeds,
  enabled = true,
}: UseSuggestedNeedsProps) => {
  const suggestions = useMemo(() => {
    if (!enabled || !conflictZone) {
      return [];
    }

    const zoneCharacteristics = {
      severity: conflictZone.severity || 'medium',
      status: conflictZone.status,
      casualties: conflictZone.casualties || 0,
      location: conflictZone.location || 'Unknown',
      country: conflictZone.country || 'Unknown',
      region: conflictZone.region || 'Unknown',
      tags: conflictZone.tags || [],
      involvedParties: conflictZone.involvedParties || [],
    };

    return SuggestedNeedsService.generateSuggestions(
      zoneCharacteristics,
      existingNeeds
    );
  }, [conflictZone, existingNeeds, enabled]);

  const convertSuggestionToNeed = (
    suggestion: SuggestedNeed,
    location: { latitude: number; longitude: number },
    conflictZoneId: string
  ) => {
    return SuggestedNeedsService.convertToNeedTemplate(
      suggestion,
      location,
      conflictZoneId
    );
  };

  return {
    suggestions,
    convertSuggestionToNeed,
    isEnabled: enabled,
    hasConflictZone: !!conflictZone,
  };
};

export type { SuggestedNeed };