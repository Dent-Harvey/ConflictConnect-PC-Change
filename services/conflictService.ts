import { ConflictZone, ConflictZoneResponse, ConflictFilters, ConflictSource } from '@/types/conflict';
import { project_id } from '@/9gen_config.json';

const DB_API_BASE_URL = 'https://api.9gen.dev/api';

export class ConflictService {
  private static async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${DB_API_BASE_URL}${endpoint}`;
    console.log('Making API request to:', url);
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    console.log('API Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error response:', errorText);
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const jsonResponse = await response.json();
    console.log('API Response JSON:', jsonResponse);
    return jsonResponse;
  }

  static async getConflictZones(filters?: ConflictFilters): Promise<ConflictZone[]> {
    try {
      const queryParams = new URLSearchParams({
        project_id: project_id,
      });

      // Add filters if provided
      const filterArray = [];
      
      // Show all active and ongoing conflicts regardless of date
      // Only filter out resolved conflicts older than 3 months
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      const threeMonthsAgoISO = threeMonthsAgo.toISOString();
      
      if (filters) {
        if (filters.severity && filters.severity.length > 0) {
          filterArray.push({
            field: 'severity',
            operator: 'in',
            value: filters.severity
          });
        }

        if (filters.status && filters.status.length > 0) {
          filterArray.push({
            field: 'status',
            operator: 'in',
            value: filters.status
          });
        }

        if (filters.country && filters.country.length > 0) {
          filterArray.push({
            field: 'country',
            operator: 'in',
            value: filters.country
          });
        }

        if (filters.verified !== undefined) {
          filterArray.push({
            field: 'verified',
            operator: 'eq',
            value: filters.verified
          });
        }

        if (filters.dateFrom) {
          filterArray.push({
            field: 'dateReported',
            operator: 'gte',
            value: filters.dateFrom
          });
        }

        if (filters.dateTo) {
          filterArray.push({
            field: 'dateReported',
            operator: 'lte',
            value: filters.dateTo
          });
        }
      }

      if (filterArray.length > 0) {
        queryParams.append('filters', JSON.stringify(filterArray));
      }
      
      // Add sorting by most recent first for real-time feel
      queryParams.append('sort_by', 'dateReported');
      queryParams.append('sort_order', 'desc');

      const response = await this.makeRequest<{
        records: any[];
        total: number;
      }>(`/entities/ConflictZone?${queryParams.toString()}`);

      // Transform API response to ConflictZone objects and apply additional filtering
      const allRecords = response.records.map((record): ConflictZone => ({
        id: record.id,
        title: record.data.title,
        description: record.data.description,
        latitude: record.data.latitude,
        longitude: record.data.longitude,
        severity: record.data.severity,
        status: record.data.status,
        dateReported: record.data.dateReported,
        sources: record.data.sources,
        casualties: record.data.casualties,
        involvedParties: record.data.involvedParties,
        location: record.data.location,
        country: record.data.country,
        region: record.data.region,
        tags: record.data.tags,
        conflictType: record.data.conflictType,
        verified: record.data.verified,
        realTimeUpdates: record.data.realTimeUpdates,
        protestType: record.data.protestType,
        lastUpdated: record.data.lastUpdated,
        created_at: record.created_at,
        updated_at: record.updated_at,
      }));
      
      // Show all active/escalating/ongoing conflicts regardless of date
      // Only filter out resolved conflicts older than 3 months
      const filteredRecords = allRecords.filter(conflict => {
        const conflictDate = new Date(conflict.dateReported);
        const isRecent = conflictDate >= threeMonthsAgo;
        const isOngoing = conflict.status === 'active' || conflict.status === 'escalating' || conflict.status === 'ongoing';
        const isResolved = conflict.status === 'resolved';
        
        // Include if: ongoing (regardless of age) OR recent (within 3 months) OR not resolved
        return isOngoing || isRecent || !isResolved;
      });
      
      return filteredRecords;
    } catch (error) {
      console.error('Error fetching conflict zones:', error);
      throw error;
    }
  }

  static async getConflictZoneById(id: string): Promise<ConflictZone | null> {
    try {
      console.log('Fetching conflict zone by ID:', id);
      console.log('API URL:', `${DB_API_BASE_URL}/entities/ConflictZone/${id}?project_id=${project_id}`);
      
      const response = await this.makeRequest<any>(
        `/entities/ConflictZone/${id}?project_id=${project_id}`
      );

      console.log('API Response:', response);

      if (!response || !response.data) {
        console.error('Invalid response structure:', response);
        return null;
      }

      const conflict: ConflictZone = {
        id: response.id,
        title: response.data.title,
        description: response.data.description,
        latitude: response.data.latitude,
        longitude: response.data.longitude,
        severity: response.data.severity,
        status: response.data.status,
        dateReported: response.data.dateReported,
        sources: response.data.sources,
        casualties: response.data.casualties,
        involvedParties: response.data.involvedParties,
        location: response.data.location,
        country: response.data.country,
        region: response.data.region,
        tags: response.data.tags,
        conflictType: response.data.conflictType,
        verified: response.data.verified,
        realTimeUpdates: response.data.realTimeUpdates,
        protestType: response.data.protestType,
        lastUpdated: response.data.lastUpdated,
        created_at: response.created_at,
        updated_at: response.updated_at,
      };

      console.log('Parsed conflict:', conflict.title);
      return conflict;
    } catch (error) {
      console.error('Error fetching conflict zone by ID:', error);
      console.error('Error details:', error);
      return null;
    }
  }

  static async createConflictZone(conflictData: Omit<ConflictZone, 'id'>): Promise<ConflictZone> {
    try {
      const response = await this.makeRequest<any>('/entities/ConflictZone/insert', {
        method: 'POST',
        body: JSON.stringify({
          project_id: project_id,
          data: {
            title: conflictData.title,
            description: conflictData.description,
            latitude: conflictData.latitude,
            longitude: conflictData.longitude,
            severity: conflictData.severity || 'medium',
            status: conflictData.status,
            dateReported: conflictData.dateReported,
            sources: conflictData.sources || [],
            casualties: conflictData.casualties || 0,
            involvedParties: conflictData.involvedParties || [],
            location: conflictData.location,
            country: conflictData.country,
            region: conflictData.region,
            tags: conflictData.tags || [],
            conflictType: conflictData.conflictType || 'other',
            verified: conflictData.verified || false,
            realTimeUpdates: conflictData.realTimeUpdates || false,
            protestType: conflictData.protestType,
            lastUpdated: new Date().toISOString(),
          },
        }),
      });

      return {
        id: response.data.id,
        ...conflictData,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error creating conflict zone:', error);
      throw error;
    }
  }

  // Generate specialized sources based on conflict type and location
  private static generateSpecializedSources(
    country: string,
    region: string,
    conflictType: string,
    title: string
  ): ConflictSource[] {
    const sources: ConflictSource[] = [];

    // UN and International Organization Sources
    const unSources = [
      {
        type: 'official' as const,
        url: 'https://news.un.org/en/news/topic/peace-and-security',
        credibility: 10
      },
      {
        type: 'official' as const,
        url: 'https://www.un.org/sg/en/content/sg/press-encounter',
        credibility: 10
      },
      {
        type: 'official' as const,
        url: 'https://www.unhcr.org/news/briefing-notes',
        credibility: 10
      },
      {
        type: 'official' as const,
        url: 'https://www.unicef.org/press-releases',
        credibility: 10
      },
      {
        type: 'official' as const,
        url: 'https://www.wfp.org/news',
        credibility: 10
      },
      {
        type: 'official' as const,
        url: 'https://www.who.int/news',
        credibility: 10
      }
    ];

    // Think Tank and Research Sources
    const thinkTankSources = [
      {
        type: 'official' as const,
        url: 'https://www.understandingwar.org/latest-updates',
        credibility: 9
      },
      {
        type: 'official' as const,
        url: 'https://www.csis.org/analysis',
        credibility: 9
      },
      {
        type: 'official' as const,
        url: 'https://www.cfr.org/global-conflict-tracker',
        credibility: 9
      },
      {
        type: 'official' as const,
        url: 'https://www.crisisgroup.org/latest-updates/briefing',
        credibility: 9
      },
      {
        type: 'official' as const,
        url: 'https://www.chathamhouse.org/publications',
        credibility: 9
      },
      {
        type: 'official' as const,
        url: 'https://www.brookings.edu/topic/international-affairs/',
        credibility: 8
      }
    ];

    // Conflict-specific specialized sources
    const conflictSpecificSources: { [key: string]: ConflictSource[] } = {
      'war': [
        {
          type: 'official' as const,
          url: 'https://www.understandingwar.org/',
          credibility: 9
        },
        {
          type: 'official' as const,
          url: 'https://acleddata.com/curated-data-files/',
          credibility: 9
        },
        {
          type: 'news' as const,
          url: 'https://www.defensenews.com/',
          credibility: 8
        }
      ],
      'famine': [
        {
          type: 'official' as const,
          url: 'https://www.fsinplatform.org/global-report',
          credibility: 10
        },
        {
          type: 'official' as const,
          url: 'https://www.wfp.org/publications/global-report-food-crises',
          credibility: 10
        },
        {
          type: 'official' as const,
          url: 'https://www.fao.org/emergencies/crisis/en/',
          credibility: 10
        }
      ],
      'humanitarian': [
        {
          type: 'official' as const,
          url: 'https://www.unocha.org/global-humanitarian-overview',
          credibility: 10
        },
        {
          type: 'official' as const,
          url: 'https://reliefweb.int/',
          credibility: 10
        },
        {
          type: 'official' as const,
          url: 'https://www.icrc.org/en/where-we-work',
          credibility: 10
        }
      ],
      'military': [
        {
          type: 'official' as const,
          url: 'https://www.understandingwar.org/',
          credibility: 9
        },
        {
          type: 'official' as const,
          url: 'https://www.rand.org/topics/national-security.html',
          credibility: 9
        }
      ],
      'protest': [
        {
          type: 'news' as const,
          url: 'https://www.theguardian.com/world',
          credibility: 8
        },
        {
          type: 'official' as const,
          url: 'https://www.amnesty.org/en/latest/news/',
          credibility: 9
        },
        {
          type: 'official' as const,
          url: 'https://www.hrw.org/news',
          credibility: 9
        }
      ]
    };

    // Regional expertise sources
    const regionalSources: { [key: string]: ConflictSource[] } = {
      'Ukraine': [
        {
          type: 'official' as const,
          url: 'https://www.understandingwar.org/backgrounder/russian-offensive-campaign-assessment',
          credibility: 9
        },
        {
          type: 'news' as const,
          url: 'https://kyivindependent.com/',
          credibility: 8
        }
      ],
      'Sudan': [
        {
          type: 'official' as const,
          url: 'https://www.crisisgroup.org/africa/horn-africa/sudan',
          credibility: 9
        },
        {
          type: 'news' as const,
          url: 'https://www.dabangasudan.org/',
          credibility: 8
        }
      ],
      'Ethiopia': [
        {
          type: 'official' as const,
          url: 'https://www.crisisgroup.org/africa/horn-africa/ethiopia',
          credibility: 9
        }
      ],
      'Syria': [
        {
          type: 'official' as const,
          url: 'https://www.crisisgroup.org/middle-east-north-africa/eastern-mediterranean/syria',
          credibility: 9
        }
      ],
      'Gaza': [
        {
          type: 'official' as const,
          url: 'https://www.crisisgroup.org/middle-east-north-africa/eastern-mediterranean/israel-palestine',
          credibility: 9
        },
        {
          type: 'official' as const,
          url: 'https://www.unocha.org/occupied-palestinian-territory',
          credibility: 10
        }
      ],
      'Myanmar': [
        {
          type: 'official' as const,
          url: 'https://www.crisisgroup.org/asia/south-east-asia/myanmar',
          credibility: 9
        }
      ],
      'Yemen': [
        {
          type: 'official' as const,
          url: 'https://www.crisisgroup.org/middle-east-north-africa/gulf-and-arabian-peninsula/yemen',
          credibility: 9
        }
      ],
      'United States': [
        {
          type: 'news' as const,
          url: 'https://www.washingtonpost.com/politics/',
          credibility: 8
        },
        {
          type: 'news' as const,
          url: 'https://www.nytimes.com/section/us',
          credibility: 9
        },
        {
          type: 'official' as const,
          url: 'https://www.fbi.gov/news/pressrel',
          credibility: 9
        }
      ],
      'France': [
        {
          type: 'news' as const,
          url: 'https://www.lemonde.fr/en/',
          credibility: 8
        },
        {
          type: 'official' as const,
          url: 'https://www.diplomatie.gouv.fr/en/',
          credibility: 9
        }
      ],
      'Germany': [
        {
          type: 'news' as const,
          url: 'https://www.dw.com/en/',
          credibility: 8
        },
        {
          type: 'official' as const,
          url: 'https://www.bundesregierung.de/breg-en',
          credibility: 9
        }
      ],
      'Italy': [
        {
          type: 'news' as const,
          url: 'https://www.ansa.it/english/',
          credibility: 8
        },
        {
          type: 'official' as const,
          url: 'https://www.interno.gov.it/en',
          credibility: 9
        }
      ],
      'Somalia': [
        {
          type: 'official' as const,
          url: 'https://www.crisisgroup.org/africa/horn-africa/somalia',
          credibility: 9
        },
        {
          type: 'official' as const,
          url: 'https://www.fsnau.org/',
          credibility: 8
        }
      ],
      'Afghanistan': [
        {
          type: 'official' as const,
          url: 'https://www.crisisgroup.org/asia/south-asia/afghanistan',
          credibility: 9
        },
        {
          type: 'official' as const,
          url: 'https://www.unocha.org/afghanistan',
          credibility: 10
        }
      ],
      'Madagascar': [
        {
          type: 'official' as const,
          url: 'https://www.wfp.org/countries/madagascar',
          credibility: 10
        }
      ]
    };

    // High-quality news sources
    const newsWireSources = [
      {
        type: 'news' as const,
        url: 'https://www.reuters.com/world/',
        credibility: 9
      },
      {
        type: 'news' as const,
        url: 'https://apnews.com/hub/world-news',
        credibility: 9
      },
      {
        type: 'news' as const,
        url: 'https://www.bbc.com/news/world',
        credibility: 9
      }
    ];

    // Always include UN source for credibility
    sources.push(unSources[Math.floor(Math.random() * unSources.length)]);

    // Add conflict-specific sources if available
    if (conflictSpecificSources[conflictType]) {
      sources.push(...conflictSpecificSources[conflictType].slice(0, 2));
    }

    // Add think tank source
    sources.push(thinkTankSources[Math.floor(Math.random() * thinkTankSources.length)]);

    // Add regional expertise if available
    if (regionalSources[country]) {
      sources.push(regionalSources[country][0]);
    }

    // Fill remaining slots with news wire services
    while (sources.length < 4) {
      const newsSource = newsWireSources[Math.floor(Math.random() * newsWireSources.length)];
      if (!sources.some(s => s.url === newsSource.url)) {
        sources.push(newsSource);
      }
    }

    return sources.slice(0, 4); // Limit to 4 sources max
  }

  // Method to fetch latest conflict data from external APIs
  static async fetchLatestConflictData(): Promise<ConflictZone[]> {
    // This method would integrate with actual news APIs, social media APIs, etc.
    // For now, return empty array until real data sources are configured
    console.log('fetchLatestConflictData: Real-time data fetching not yet implemented');
    return [];
  }

  // Public method to generate specialized sources for any conflict
  static generateSourcesForConflict(
    country: string,
    region: string,
    conflictType: string,
    title: string
  ): ConflictSource[] {
    return this.generateSpecializedSources(country, region, conflictType, title);
  }

  // Method to update existing conflict with specialized sources
  static async updateConflictWithSpecializedSources(conflictId: string): Promise<boolean> {
    try {
      // First get the existing conflict
      const existingConflict = await this.getConflictZoneById(conflictId);
      if (!existingConflict) {
        console.error('Conflict not found:', conflictId);
        return false;
      }

      // Generate new specialized sources
      const newSources = this.generateSourcesForConflict(
        existingConflict.country || 'Unknown',
        existingConflict.region || 'Unknown',
        existingConflict.conflictType || 'other',
        existingConflict.title
      );

      // Update the conflict with new sources
      const response = await this.makeRequest<any>(`/entities/ConflictZone/${conflictId}`, {
        method: 'PUT',
        body: JSON.stringify({
          project_id: project_id,
          data: {
            title: existingConflict.title,
            description: existingConflict.description,
            latitude: existingConflict.latitude,
            longitude: existingConflict.longitude,
            severity: existingConflict.severity,
            status: existingConflict.status,
            dateReported: existingConflict.dateReported,
            sources: newSources, // Replace with specialized sources
            casualties: existingConflict.casualties,
            involvedParties: existingConflict.involvedParties,
            location: existingConflict.location,
            country: existingConflict.country,
            region: existingConflict.region,
            tags: existingConflict.tags,
            verified: existingConflict.verified,
            lastUpdated: new Date().toISOString(), // Update timestamp
          },
        }),
      });

      console.log(`Updated conflict ${conflictId} with specialized sources`);
      return true;
    } catch (error) {
      console.error(`Error updating conflict ${conflictId} with specialized sources:`, error);
      return false;
    }
  }
}