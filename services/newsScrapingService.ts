/**
 * Real-time News Scraping Service for Conflict\Connect
 * This service scrapes news from various sources to keep conflict data updated
 */

import { ConflictZone } from '@/types/conflict';

export interface NewsArticle {
  title: string;
  content: string;
  url: string;
  publishedAt: string;
  source: string;
  credibility: number;
  location?: string;
  tags: string[];
}

export interface NewsSource {
  name: string;
  url: string;
  rssFeed?: string;
  apiEndpoint?: string;
  credibility: number;
  region: string;
  selector?: {
    title: string;
    content: string;
    date: string;
    link: string;
  };
}

// News sources for different conflict zones
const NEWS_SOURCES: NewsSource[] = [
  // International Sources
  {
    name: 'BBC World News',
    url: 'https://www.bbc.com/news/world',
    rssFeed: 'https://feeds.bbci.co.uk/news/world/rss.xml',
    credibility: 9,
    region: 'global',
    selector: {
      title: 'h1, h2, .gs-c-promo-heading__title',
      content: '.story-body__inner p',
      date: 'time',
      link: 'a[href*="/news/"]'
    }
  },
  {
    name: 'Reuters World',
    url: 'https://www.reuters.com/world/',
    rssFeed: 'https://feeds.reuters.com/Reuters/worldNews',
    credibility: 9,
    region: 'global'
  },
  {
    name: 'Associated Press',
    url: 'https://apnews.com/hub/world-news',
    rssFeed: 'https://feeds.apnews.com/rss/ap/topnews',
    credibility: 9,
    region: 'global'
  },
  {
    name: 'Al Jazeera',
    url: 'https://www.aljazeera.com/news/',
    rssFeed: 'https://www.aljazeera.com/xml/rss/all.xml',
    credibility: 8,
    region: 'global'
  },
  {
    name: 'CNN World',
    url: 'https://www.cnn.com/world',
    rssFeed: 'https://rss.cnn.com/rss/edition_world.rss',
    credibility: 7,
    region: 'global'
  },

  // Regional Sources - Middle East
  {
    name: 'Haaretz',
    url: 'https://www.haaretz.com/',
    rssFeed: 'https://www.haaretz.com/rss',
    credibility: 8,
    region: 'middle_east'
  },
  {
    name: 'Times of Israel',
    url: 'https://www.timesofisrael.com/',
    rssFeed: 'https://www.timesofisrael.com/feed/',
    credibility: 8,
    region: 'middle_east'
  },
  {
    name: 'Al-Monitor',
    url: 'https://www.al-monitor.com/',
    rssFeed: 'https://www.al-monitor.com/rss',
    credibility: 7,
    region: 'middle_east'
  },

  // Regional Sources - Eastern Europe
  {
    name: 'Kyiv Post',
    url: 'https://www.kyivpost.com/',
    rssFeed: 'https://www.kyivpost.com/rss',
    credibility: 8,
    region: 'eastern_europe'
  },
  {
    name: 'Ukrainska Pravda',
    url: 'https://www.pravda.com.ua/eng/',
    rssFeed: 'https://www.pravda.com.ua/rss/view_news/',
    credibility: 7,
    region: 'eastern_europe'
  },

  // Regional Sources - Africa
  {
    name: 'AllAfrica',
    url: 'https://allafrica.com/',
    rssFeed: 'https://allafrica.com/tools/headlines/rdf/africa/headlines.rdf',
    credibility: 7,
    region: 'africa'
  },
  {
    name: 'BBC Africa',
    url: 'https://www.bbc.com/news/world/africa',
    rssFeed: 'https://feeds.bbci.co.uk/news/world/africa/rss.xml',
    credibility: 9,
    region: 'africa'
  },

  // Regional Sources - Asia
  {
    name: 'South China Morning Post',
    url: 'https://www.scmp.com/',
    rssFeed: 'https://www.scmp.com/rss/4/feed',
    credibility: 7,
    region: 'asia'
  },
  {
    name: 'The Diplomat',
    url: 'https://thediplomat.com/',
    rssFeed: 'https://thediplomat.com/feed/',
    credibility: 8,
    region: 'asia'
  },

  // Humanitarian Sources
  {
    name: 'UN News',
    url: 'https://news.un.org/',
    rssFeed: 'https://news.un.org/en/rss/topic/peace-and-security',
    credibility: 10,
    region: 'global'
  },
  {
    name: 'UNHCR News',
    url: 'https://www.unhcr.org/news',
    rssFeed: 'https://www.unhcr.org/rss.xml',
    credibility: 10,
    region: 'global'
  },
  {
    name: 'Médecins Sans Frontières',
    url: 'https://www.msf.org/news',
    rssFeed: 'https://www.msf.org/rss.xml',
    credibility: 9,
    region: 'global'
  },
  {
    name: 'International Crisis Group',
    url: 'https://www.crisisgroup.org/',
    rssFeed: 'https://www.crisisgroup.org/rss.xml',
    credibility: 9,
    region: 'global'
  }
];

// Keywords for conflict detection
const CONFLICT_KEYWORDS = [
  'war', 'conflict', 'violence', 'attack', 'bombing', 'shelling', 'fighting',
  'casualties', 'deaths', 'injured', 'displaced', 'refugees', 'crisis',
  'humanitarian', 'emergency', 'evacuation', 'ceasefire', 'peace talks',
  'military', 'armed', 'gunfire', 'explosion', 'terrorism', 'insurgency',
  'civil war', 'ethnic conflict', 'religious violence', 'genocide',
  'massacre', 'atrocities', 'war crimes', 'human rights violations'
];

const SEVERITY_KEYWORDS = {
  critical: ['massacre', 'genocide', 'war crimes', 'atrocities', 'hundreds killed', 'thousands displaced'],
  high: ['bombing', 'shelling', 'attack', 'fighting', 'casualties', 'deaths'],
  medium: ['tension', 'clashes', 'violence', 'unrest', 'protests'],
  low: ['incident', 'arrests', 'investigation', 'reports']
};

export class NewsScrapingService {
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private static cache = new Map<string, { data: NewsArticle[], timestamp: number }>();

  /**
   * Scrapes news from multiple sources and detects conflicts
   */
  static async scrapeConflictNews(): Promise<NewsArticle[]> {
    const allArticles: NewsArticle[] = [];
    
    try {
      // Scrape from multiple sources in parallel
      const scrapingPromises = NEWS_SOURCES.map(source => 
        this.scrapeSource(source).catch(error => {
          console.error(`Error scraping ${source.name}:`, error);
          return [];
        })
      );

      const results = await Promise.all(scrapingPromises);
      results.forEach(articles => allArticles.push(...articles));

      // Filter for conflict-related articles
      const conflictArticles = allArticles.filter(article => 
        this.isConflictRelated(article)
      );

      // Sort by recency and credibility
      conflictArticles.sort((a, b) => {
        const dateComparison = new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        if (dateComparison !== 0) return dateComparison;
        return b.credibility - a.credibility;
      });

      console.log(`[NEWS SCRAPING] Found ${conflictArticles.length} conflict-related articles from ${allArticles.length} total articles`);
      
      return conflictArticles;
    } catch (error) {
      console.error('[NEWS SCRAPING] Error scraping news:', error);
      return [];
    }
  }

  /**
   * Scrapes a single news source
   */
  private static async scrapeSource(source: NewsSource): Promise<NewsArticle[]> {
    try {
      if (source.rssFeed) {
        return await this.scrapeRSSFeed(source);
      } else if (source.apiEndpoint) {
        return await this.scrapeAPIEndpoint(source);
      } else {
        return await this.scrapeWebPage(source);
      }
    } catch (error) {
      console.error(`[NEWS SCRAPING] Error scraping ${source.name}:`, error);
      return [];
    }
  }

  /**
   * Scrapes RSS feeds
   */
  private static async scrapeRSSFeed(source: NewsSource): Promise<NewsArticle[]> {
    try {
      const response = await fetch(source.rssFeed!);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const xmlText = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

      const articles: NewsArticle[] = [];
      const items = xmlDoc.querySelectorAll('item');

      items.forEach((item, index) => {
        if (index >= 20) return; // Limit to 20 articles per source

        const title = item.querySelector('title')?.textContent?.trim() || '';
        const description = item.querySelector('description')?.textContent?.trim() || '';
        const link = item.querySelector('link')?.textContent?.trim() || '';
        const pubDate = item.querySelector('pubDate')?.textContent?.trim() || '';

        if (title && link) {
          articles.push({
            title,
            content: description,
            url: link,
            publishedAt: pubDate || new Date().toISOString(),
            source: source.name,
            credibility: source.credibility,
            tags: this.extractTags(title + ' ' + description)
          });
        }
      });

      return articles;
    } catch (error) {
      console.error(`[NEWS SCRAPING] Error parsing RSS feed for ${source.name}:`, error);
      return [];
    }
  }

  /**
   * Scrapes web pages (basic implementation)
   */
  private static async scrapeWebPage(source: NewsSource): Promise<NewsArticle[]> {
    // This would require a backend service to avoid CORS issues
    // For now, return empty array
    console.log(`[NEWS SCRAPING] Web scraping not implemented for ${source.name}`);
    return [];
  }

  /**
   * Scrapes API endpoints
   */
  private static async scrapeAPIEndpoint(source: NewsSource): Promise<NewsArticle[]> {
    // This would require API keys and specific implementations
    console.log(`[NEWS SCRAPING] API scraping not implemented for ${source.name}`);
    return [];
  }

  /**
   * Checks if an article is conflict-related
   */
  private static isConflictRelated(article: NewsArticle): boolean {
    const text = (article.title + ' ' + article.content).toLowerCase();
    
    return CONFLICT_KEYWORDS.some(keyword => 
      text.includes(keyword.toLowerCase())
    );
  }

  /**
   * Extracts tags from article content
   */
  private static extractTags(text: string): string[] {
    const tags: string[] = [];
    const lowerText = text.toLowerCase();

    // Extract location tags
    const locations = [
      'gaza', 'israel', 'palestine', 'ukraine', 'russia', 'syria', 'myanmar',
      'sudan', 'ethiopia', 'somalia', 'afghanistan', 'yemen', 'libya',
      'mali', 'niger', 'burkina faso', 'congo', 'cameroon', 'nigeria'
    ];

    locations.forEach(location => {
      if (lowerText.includes(location)) {
        tags.push(location);
      }
    });

    // Extract conflict type tags
    CONFLICT_KEYWORDS.forEach(keyword => {
      if (lowerText.includes(keyword.toLowerCase())) {
        tags.push(keyword);
      }
    });

    return [...new Set(tags)]; // Remove duplicates
  }

  /**
   * Determines conflict severity from article content
   */
  static determineSeverity(article: NewsArticle): 'low' | 'medium' | 'high' | 'critical' {
    const text = (article.title + ' ' + article.content).toLowerCase();

    for (const [severity, keywords] of Object.entries(SEVERITY_KEYWORDS)) {
      if (keywords.some(keyword => text.includes(keyword.toLowerCase()))) {
        return severity as 'low' | 'medium' | 'high' | 'critical';
      }
    }

    return 'medium'; // Default
  }

  /**
   * Updates existing conflicts with new information from news
   */
  static async updateConflictsWithNews(conflicts: ConflictZone[], newsArticles: NewsArticle[]): Promise<ConflictZone[]> {
    const updatedConflicts = [...conflicts];

    newsArticles.forEach(article => {
      // Find matching conflicts based on location and tags
      const matchingConflicts = updatedConflicts.filter(conflict => 
        this.isArticleRelevantToConflict(article, conflict)
      );

      matchingConflicts.forEach(conflict => {
        // Update conflict with new information
        conflict.lastUpdated = new Date().toISOString();
        conflict.sources = conflict.sources || [];
        
        // Add new source if not already present
        const sourceExists = conflict.sources.some(source => source.url === article.url);
        if (!sourceExists) {
          conflict.sources.push({
            type: 'news',
            url: article.url,
            credibility: article.credibility,
            title: article.title,
            publishedAt: article.publishedAt
          });
        }

        // Update severity if news indicates higher severity
        const newsSeverity = this.determineSeverity(article);
        if (this.isSeverityHigher(newsSeverity, conflict.severity)) {
          conflict.severity = newsSeverity;
        }

        // Update real-time status
        conflict.realTimeUpdates = true;
      });
    });

    return updatedConflicts;
  }

  /**
   * Checks if an article is relevant to a specific conflict
   */
  private static isArticleRelevantToConflict(article: NewsArticle, conflict: ConflictZone): boolean {
    const articleText = (article.title + ' ' + article.content).toLowerCase();
    const conflictText = (conflict.title + ' ' + conflict.description + ' ' + conflict.location).toLowerCase();

    // Check for location overlap
    const conflictLocation = conflict.location?.toLowerCase() || '';
    const conflictCountry = conflict.country?.toLowerCase() || '';
    
    if (articleText.includes(conflictLocation) || articleText.includes(conflictCountry)) {
      return true;
    }

    // Check for tag overlap
    const articleTags = article.tags.map(tag => tag.toLowerCase());
    const conflictTags = conflict.tags?.map(tag => tag.toLowerCase()) || [];
    
    return articleTags.some(tag => conflictTags.includes(tag));
  }

  /**
   * Compares severity levels
   */
  private static isSeverityHigher(newSeverity: string, currentSeverity: string): boolean {
    const severityOrder = ['low', 'medium', 'high', 'critical'];
    return severityOrder.indexOf(newSeverity) > severityOrder.indexOf(currentSeverity);
  }

  /**
   * Gets cached news data
   */
  static getCachedNews(source: string): NewsArticle[] | null {
    const cached = this.cache.get(source);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  /**
   * Sets cached news data
   */
  static setCachedNews(source: string, data: NewsArticle[]): void {
    this.cache.set(source, {
      data,
      timestamp: Date.now()
    });
  }
}
