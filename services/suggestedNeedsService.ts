import { UserNeed } from './userNeedsService';

export interface SuggestedNeed {
  id: string;
  title: string;
  description: string;
  category: 'food' | 'water' | 'medical' | 'shelter' | 'transportation' | 'communication' | 'security' | 'supplies' | 'evacuation' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical' | 'emergency';
  urgency: 'immediate' | 'within_hours' | 'within_days' | 'within_weeks' | 'not_urgent';
  quantity: number;
  unit: string;
  tags: string[];
  reason: string; // Why this is suggested for this zone
  conflictType: string; // Type of conflict this is relevant to
}

interface ConflictZoneCharacteristics {
  severity: string;
  status: string;
  casualties?: number;
  location?: string;
  country?: string;
  region?: string;
  tags?: string[];
  involvedParties?: string[];
}

export class SuggestedNeedsService {
  // Generate suggestions based on conflict zone characteristics
  static generateSuggestions(
    zoneCharacteristics: ConflictZoneCharacteristics,
    existingNeeds: UserNeed[] = []
  ): SuggestedNeed[] {
    const suggestions: SuggestedNeed[] = [];
    const existingCategories = new Set(existingNeeds.map(need => need.category));
    
    // Base suggestions that apply to most conflict zones
    const baseSuggestions = this.getBaseSuggestions();
    
    // Severity-based suggestions
    const severitySuggestions = this.getSeverityBasedSuggestions(zoneCharacteristics.severity);
    
    // Status-based suggestions
    const statusSuggestions = this.getStatusBasedSuggestions(zoneCharacteristics.status);
    
    // Tag-based suggestions (contextual)
    const tagSuggestions = this.getTagBasedSuggestions(zoneCharacteristics.tags || []);
    
    // Casualty-based suggestions
    const casualtySuggestions = this.getCasualtyBasedSuggestions(zoneCharacteristics.casualties || 0);
    
    // Combine all suggestions
    const allSuggestions = [
      ...baseSuggestions,
      ...severitySuggestions,
      ...statusSuggestions,
      ...tagSuggestions,
      ...casualtySuggestions,
    ];
    
    // Filter out categories that already have needs and prioritize by relevance
    const filteredSuggestions = allSuggestions
      .filter(suggestion => !existingCategories.has(suggestion.category))
      .sort((a, b) => {
        // Sort by priority first (emergency > critical > high > medium > low)
        const priorityOrder = { emergency: 5, critical: 4, high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
        const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }
        
        // Then by urgency
        const urgencyOrder = { immediate: 5, within_hours: 4, within_days: 3, within_weeks: 2, not_urgent: 1 };
        const aUrgency = urgencyOrder[a.urgency as keyof typeof urgencyOrder] || 0;
        const bUrgency = urgencyOrder[b.urgency as keyof typeof urgencyOrder] || 0;
        
        return bUrgency - aUrgency;
      })
      .slice(0, 6); // Limit to top 6 suggestions
    
    return filteredSuggestions;
  }
  
  private static getBaseSuggestions(): SuggestedNeed[] {
    return [
      {
        id: 'water-base',
        title: 'Clean Drinking Water',
        description: 'Potable water for drinking and basic hygiene needs',
        category: 'water',
        priority: 'high',
        urgency: 'within_hours',
        quantity: 100,
        unit: 'liters',
        tags: ['drinking', 'clean', 'potable'],
        reason: 'Clean water is essential for survival in any conflict situation',
        conflictType: 'general',
      },
      {
        id: 'food-base',
        title: 'Non-Perishable Food Supplies',
        description: 'Canned goods, dried foods, and ready-to-eat meals',
        category: 'food',
        priority: 'high',
        urgency: 'within_days',
        quantity: 50,
        unit: 'meals',
        tags: ['canned', 'dried', 'ready-to-eat'],
        reason: 'Food security is crucial for displaced populations',
        conflictType: 'general',
      },
      {
        id: 'medical-base',
        title: 'First Aid Medical Supplies',
        description: 'Bandages, antiseptics, pain relievers, and basic medical equipment',
        category: 'medical',
        priority: 'critical',
        urgency: 'within_hours',
        quantity: 10,
        unit: 'kits',
        tags: ['first-aid', 'bandages', 'antiseptic'],
        reason: 'Medical supplies are critical for treating injuries',
        conflictType: 'general',
      },
    ];
  }
  
  private static getSeverityBasedSuggestions(severity: string): SuggestedNeed[] {
    const suggestions: SuggestedNeed[] = [];
    
    switch (severity) {
      case 'critical':
        suggestions.push(
          {
            id: 'evacuation-critical',
            title: 'Emergency Evacuation Support',
            description: 'Transportation and coordination for immediate evacuation of civilians',
            category: 'evacuation',
            priority: 'emergency',
            urgency: 'immediate',
            quantity: 20,
            unit: 'vehicles',
            tags: ['evacuation', 'emergency', 'transport'],
            reason: 'Critical conflicts require immediate evacuation capabilities',
            conflictType: 'critical',
          },
          {
            id: 'medical-critical',
            title: 'Advanced Medical Equipment',
            description: 'Surgical supplies, blood products, and life support equipment',
            category: 'medical',
            priority: 'emergency',
            urgency: 'immediate',
            quantity: 5,
            unit: 'units',
            tags: ['surgical', 'advanced', 'life-support'],
            reason: 'High casualty situations require advanced medical care',
            conflictType: 'critical',
          }
        );
        break;
        
      case 'high':
        suggestions.push(
          {
            id: 'shelter-high',
            title: 'Emergency Shelter Materials',
            description: 'Tents, blankets, and temporary housing materials',
            category: 'shelter',
            priority: 'high',
            urgency: 'within_hours',
            quantity: 15,
            unit: 'tents',
            tags: ['tents', 'blankets', 'temporary'],
            reason: 'High-intensity conflicts often displace populations',
            conflictType: 'high-intensity',
          },
          {
            id: 'communication-high',
            title: 'Emergency Communication Equipment',
            description: 'Satellite phones, radios, and communication devices',
            category: 'communication',
            priority: 'high',
            urgency: 'within_hours',
            quantity: 10,
            unit: 'devices',
            tags: ['satellite', 'radio', 'emergency'],
            reason: 'Communication is vital for coordination during active conflicts',
            conflictType: 'high-intensity',
          }
        );
        break;
        
      case 'medium':
        suggestions.push(
          {
            id: 'supplies-medium',
            title: 'Basic Household Supplies',
            description: 'Soap, toothbrushes, sanitary items, and hygiene products',
            category: 'supplies',
            priority: 'medium',
            urgency: 'within_days',
            quantity: 30,
            unit: 'kits',
            tags: ['hygiene', 'sanitation', 'household'],
            reason: 'Medium-intensity conflicts require sustained humanitarian support',
            conflictType: 'ongoing',
          }
        );
        break;
    }
    
    return suggestions;
  }
  
  private static getStatusBasedSuggestions(status: string): SuggestedNeed[] {
    const suggestions: SuggestedNeed[] = [];
    
    switch (status) {
      case 'escalating':
        suggestions.push(
          {
            id: 'security-escalating',
            title: 'Security and Protection Services',
            description: 'Security personnel and safe passage arrangements',
            category: 'security',
            priority: 'critical',
            urgency: 'immediate',
            quantity: 5,
            unit: 'teams',
            tags: ['security', 'protection', 'safe-passage'],
            reason: 'Escalating conflicts require enhanced security measures',
            conflictType: 'escalating',
          }
        );
        break;
        
      case 'active':
        suggestions.push(
          {
            id: 'transportation-active',
            title: 'Safe Transportation Services',
            description: 'Armored vehicles or safe passage for humanitarian aid',
            category: 'transportation',
            priority: 'high',
            urgency: 'within_hours',
            quantity: 8,
            unit: 'vehicles',
            tags: ['safe', 'armored', 'humanitarian'],
            reason: 'Active conflicts require secure transportation for aid delivery',
            conflictType: 'active',
          }
        );
        break;
    }
    
    return suggestions;
  }
  
  private static getTagBasedSuggestions(tags: string[]): SuggestedNeed[] {
    const suggestions: SuggestedNeed[] = [];
    
    // Check for specific conflict types in tags
    if (tags.some(tag => tag.toLowerCase().includes('urban'))) {
      suggestions.push({
        id: 'water-urban',
        title: 'Urban Water Purification Systems',
        description: 'Portable water filtration systems for contaminated urban water sources',
        category: 'water',
        priority: 'high',
        urgency: 'within_days',
        quantity: 3,
        unit: 'systems',
        tags: ['urban', 'filtration', 'purification'],
        reason: 'Urban conflicts often contaminate municipal water supplies',
        conflictType: 'urban',
      });
    }
    
    if (tags.some(tag => tag.toLowerCase().includes('refugee') || tag.toLowerCase().includes('displacement'))) {
      suggestions.push({
        id: 'shelter-refugee',
        title: 'Long-term Shelter Solutions',
        description: 'Durable shelters and camp infrastructure for displaced populations',
        category: 'shelter',
        priority: 'high',
        urgency: 'within_days',
        quantity: 25,
        unit: 'structures',
        tags: ['refugee', 'displacement', 'camp'],
        reason: 'Large displacement requires organized shelter solutions',
        conflictType: 'displacement',
      });
    }
    
    if (tags.some(tag => tag.toLowerCase().includes('winter') || tag.toLowerCase().includes('cold'))) {
      suggestions.push({
        id: 'supplies-winter',
        title: 'Winter Survival Supplies',
        description: 'Warm clothing, heating equipment, and insulated shelters',
        category: 'supplies',
        priority: 'critical',
        urgency: 'within_hours',
        quantity: 20,
        unit: 'kits',
        tags: ['winter', 'heating', 'warm-clothing'],
        reason: 'Cold weather significantly increases survival risks',
        conflictType: 'winter',
      });
    }
    
    return suggestions;
  }
  
  private static getCasualtyBasedSuggestions(casualties: number): SuggestedNeed[] {
    const suggestions: SuggestedNeed[] = [];
    
    if (casualties > 50) {
      suggestions.push({
        id: 'medical-mass-casualty',
        title: 'Mass Casualty Medical Response',
        description: 'Field hospitals, trauma surgeons, and emergency medical teams',
        category: 'medical',
        priority: 'emergency',
        urgency: 'immediate',
        quantity: 2,
        unit: 'field hospitals',
        tags: ['mass-casualty', 'field-hospital', 'trauma'],
        reason: 'High casualty count requires massive medical response',
        conflictType: 'mass-casualty',
      });
    } else if (casualties > 10) {
      suggestions.push({
        id: 'medical-trauma',
        title: 'Trauma Care Supplies',
        description: 'Emergency surgery kits, blood supplies, and trauma equipment',
        category: 'medical',
        priority: 'critical',
        urgency: 'within_hours',
        quantity: 5,
        unit: 'trauma kits',
        tags: ['trauma', 'surgery', 'blood'],
        reason: 'Multiple casualties require specialized trauma care',
        conflictType: 'moderate-casualty',
      });
    }
    
    return suggestions;
  }
  
  // Convert a suggested need to a template for easy addition
  static convertToNeedTemplate(suggestion: SuggestedNeed, location: { latitude: number; longitude: number }, conflictZoneId: string): Partial<UserNeed> {
    return {
      title: suggestion.title,
      description: suggestion.description,
      category: suggestion.category,
      priority: suggestion.priority,
      urgency: suggestion.urgency,
      quantity: suggestion.quantity,
      unit: suggestion.unit,
      location,
      conflictZoneId,
      tags: suggestion.tags,
      status: 'open',
    };
  }
}