/**
 * Backend News Scraping Service for Conflict\Connect
 * This service runs periodically to scrape news and update conflict data
 */

const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const axios = require('axios');
const xml2js = require('xml2js');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Import the config from the project root
const fs = require('fs');
const path = require('path');
const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../9gen_config.json'), 'utf8'));
const project_id = config.project_id;

const DB_API_BASE_URL = 'https://api.9gen.dev/api';

// News sources configuration
const NEWS_SOURCES = [
  {
    name: 'BBC World News',
    rssFeed: 'https://feeds.bbci.co.uk/news/world/rss.xml',
    credibility: 9,
    region: 'global'
  },
  {
    name: 'Reuters World',
    rssFeed: 'https://feeds.reuters.com/Reuters/worldNews',
    credibility: 9,
    region: 'global'
  },
  {
    name: 'Associated Press',
    rssFeed: 'https://feeds.apnews.com/rss/ap/topnews',
    credibility: 9,
    region: 'global'
  },
  {
    name: 'Al Jazeera',
    rssFeed: 'https://www.aljazeera.com/xml/rss/all.xml',
    credibility: 8,
    region: 'global'
  },
  {
    name: 'CNN World',
    rssFeed: 'https://rss.cnn.com/rss/edition_world.rss',
    credibility: 7,
    region: 'global'
  },
  {
    name: 'UN News',
    rssFeed: 'https://news.un.org/en/rss/topic/peace-and-security',
    credibility: 10,
    region: 'global'
  },
  {
    name: 'UNHCR News',
    rssFeed: 'https://www.unhcr.org/rss.xml',
    credibility: 10,
    region: 'global'
  },
  {
    name: 'International Crisis Group',
    rssFeed: 'https://www.crisisgroup.org/rss.xml',
    credibility: 9,
    region: 'global'
  }
];

// Conflict detection keywords
const CONFLICT_KEYWORDS = [
  'war', 'conflict', 'violence', 'attack', 'bombing', 'shelling', 'fighting',
  'casualties', 'deaths', 'injured', 'displaced', 'refugees', 'crisis',
  'humanitarian', 'emergency', 'evacuation', 'ceasefire', 'peace talks',
  'military', 'armed', 'gunfire', 'explosion', 'terrorism', 'insurgency',
  'civil war', 'ethnic conflict', 'religious violence', 'genocide',
  'massacre', 'atrocities', 'war crimes', 'human rights violations'
];

// Severity detection keywords
const SEVERITY_KEYWORDS = {
  critical: ['massacre', 'genocide', 'war crimes', 'atrocities', 'hundreds killed', 'thousands displaced'],
  high: ['bombing', 'shelling', 'attack', 'fighting', 'casualties', 'deaths'],
  medium: ['tension', 'clashes', 'violence', 'unrest', 'protests'],
  low: ['incident', 'arrests', 'investigation', 'reports']
};

// Cache for news articles
let newsCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Makes API requests to the database
 */
async function makeDatabaseRequest(endpoint, options = {}) {
  const url = `${DB_API_BASE_URL}${endpoint}`;
  
  const response = await axios({
    url,
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    data: options.body,
  });

  return response.data;
}

/**
 * Scrapes RSS feeds for news articles
 */
async function scrapeRSSFeed(source) {
  try {
    console.log(`[NEWS SCRAPING] Scraping ${source.name}...`);
    
    const response = await axios.get(source.rssFeed, {
      timeout: 10000,
      headers: {
        'User-Agent': 'ConflictConnect-NewsBot/1.0'
      }
    });

    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(response.data);
    
    const articles = [];
    const items = result.rss?.channel?.[0]?.item || [];

    items.slice(0, 20).forEach(item => {
      const title = item.title?.[0]?.trim() || '';
      const description = item.description?.[0]?.trim() || '';
      const link = item.link?.[0]?.trim() || '';
      const pubDate = item.pubDate?.[0]?.trim() || '';

      if (title && link && isConflictRelated(title + ' ' + description)) {
        articles.push({
          title,
          content: description,
          url: link,
          publishedAt: pubDate || new Date().toISOString(),
          source: source.name,
          credibility: source.credibility,
          region: source.region,
          tags: extractTags(title + ' ' + description)
        });
      }
    });

    console.log(`[NEWS SCRAPING] Found ${articles.length} conflict articles from ${source.name}`);
    return articles;
  } catch (error) {
    console.error(`[NEWS SCRAPING] Error scraping ${source.name}:`, error.message);
    return [];
  }
}

/**
 * Checks if content is conflict-related
 */
function isConflictRelated(text) {
  const lowerText = text.toLowerCase();
  return CONFLICT_KEYWORDS.some(keyword => lowerText.includes(keyword.toLowerCase()));
}

/**
 * Extracts tags from text content
 */
function extractTags(text) {
  const tags = [];
  const lowerText = text.toLowerCase();

  // Location tags
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

  // Conflict keywords as tags
  CONFLICT_KEYWORDS.forEach(keyword => {
    if (lowerText.includes(keyword.toLowerCase())) {
      tags.push(keyword);
    }
  });

  return [...new Set(tags)];
}

/**
 * Determines severity from article content
 */
function determineSeverity(article) {
  const text = (article.title + ' ' + article.content).toLowerCase();

  for (const [severity, keywords] of Object.entries(SEVERITY_KEYWORDS)) {
    if (keywords.some(keyword => text.includes(keyword.toLowerCase()))) {
      return severity;
    }
  }

  return 'medium';
}

/**
 * Gets all conflict zones from database
 */
async function getConflictZones() {
  try {
    const queryParams = new URLSearchParams({
      project_id: project_id,
    });

    const response = await makeDatabaseRequest(`/entities/ConflictZone?${queryParams.toString()}`);
    return response.records || [];
  } catch (error) {
    console.error('[NEWS SCRAPING] Error fetching conflict zones:', error.message);
    return [];
  }
}

/**
 * Updates a conflict zone with new information
 */
async function updateConflictZone(conflictId, updates) {
  try {
    await makeDatabaseRequest(`/entities/ConflictZone/${conflictId}`, {
      method: 'PUT',
      body: {
        project_id: project_id,
        data: updates
      }
    });
    
    console.log(`[NEWS SCRAPING] Updated conflict ${conflictId}`);
    return true;
  } catch (error) {
    console.error(`[NEWS SCRAPING] Error updating conflict ${conflictId}:`, error.message);
    return false;
  }
}

/**
 * Main news scraping function
 */
async function scrapeAndUpdateConflicts() {
  try {
    console.log('[NEWS SCRAPING] Starting news scraping cycle...');
    
    // Check cache first
    const cacheKey = 'latest_news';
    const cached = newsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('[NEWS SCRAPING] Using cached news data');
      return cached.data;
    }

    // Scrape news from all sources
    const allArticles = [];
    for (const source of NEWS_SOURCES) {
      try {
        const articles = await scrapeRSSFeed(source);
        allArticles.push(...articles);
        
        // Add delay between requests to be respectful
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`[NEWS SCRAPING] Failed to scrape ${source.name}:`, error.message);
      }
    }

    console.log(`[NEWS SCRAPING] Scraped ${allArticles.length} total conflict articles`);

    // Get existing conflicts
    const conflicts = await getConflictZones();
    console.log(`[NEWS SCRAPING] Found ${conflicts.length} existing conflicts`);

    // Update conflicts with new news
    let updateCount = 0;
    for (const article of allArticles) {
      // Find relevant conflicts
      const relevantConflicts = conflicts.filter(conflict => 
        isArticleRelevantToConflict(article, conflict)
      );

      for (const conflict of relevantConflicts) {
        const updates = {
          ...conflict.data,
          lastUpdated: new Date().toISOString(),
          realTimeUpdates: true,
          sources: conflict.data.sources || []
        };

        // Add new source if not already present
        const sourceExists = updates.sources.some(source => source.url === article.url);
        if (!sourceExists) {
          updates.sources.push({
            type: 'news',
            url: article.url,
            credibility: article.credibility,
            title: article.title,
            publishedAt: article.publishedAt,
            source: article.source
          });
        }

        // Update severity if news indicates higher severity
        const newsSeverity = determineSeverity(article);
        const currentSeverity = conflict.data.severity || 'medium';
        if (isSeverityHigher(newsSeverity, currentSeverity)) {
          updates.severity = newsSeverity;
        }

        // Update the conflict
        const success = await updateConflictZone(conflict.id, updates);
        if (success) {
          updateCount++;
        }

        // Small delay between updates
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    // Cache the results
    newsCache.set(cacheKey, {
      data: allArticles,
      timestamp: Date.now()
    });

    console.log(`[NEWS SCRAPING] Updated ${updateCount} conflicts with new news data`);
    return allArticles;

  } catch (error) {
    console.error('[NEWS SCRAPING] Error in scraping cycle:', error.message);
    return [];
  }
}

/**
 * Checks if article is relevant to conflict
 */
function isArticleRelevantToConflict(article, conflict) {
  const articleText = (article.title + ' ' + article.content).toLowerCase();
  const conflictText = (conflict.data.title + ' ' + conflict.data.description + ' ' + conflict.data.location).toLowerCase();

  // Check for location overlap
  const conflictLocation = conflict.data.location?.toLowerCase() || '';
  const conflictCountry = conflict.data.country?.toLowerCase() || '';
  
  if (articleText.includes(conflictLocation) || articleText.includes(conflictCountry)) {
    return true;
  }

  // Check for tag overlap
  const articleTags = article.tags.map(tag => tag.toLowerCase());
  const conflictTags = conflict.data.tags?.map(tag => tag.toLowerCase()) || [];
  
  return articleTags.some(tag => conflictTags.includes(tag));
}

/**
 * Compares severity levels
 */
function isSeverityHigher(newSeverity, currentSeverity) {
  const severityOrder = ['low', 'medium', 'high', 'critical'];
  return severityOrder.indexOf(newSeverity) > severityOrder.indexOf(currentSeverity);
}

// API Routes

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Conflict\Connect News Scraping Service',
    timestamp: new Date().toISOString(),
    lastScrape: newsCache.get('latest_news')?.timestamp || null
  });
});

/**
 * Manual trigger for news scraping
 */
app.post('/api/scrape-news', async (req, res) => {
  try {
    console.log('[NEWS SCRAPING] Manual scrape triggered');
    const articles = await scrapeAndUpdateConflicts();
    
    res.json({
      success: true,
      message: `Scraped ${articles.length} conflict articles`,
      articles: articles.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[NEWS SCRAPING] Manual scrape error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to scrape news',
      error: error.message
    });
  }
});

/**
 * Get latest scraped news
 */
app.get('/api/latest-news', (req, res) => {
  const cached = newsCache.get('latest_news');
  if (cached) {
    res.json({
      success: true,
      articles: cached.data,
      timestamp: cached.timestamp,
      age: Date.now() - cached.timestamp
    });
  } else {
    res.json({
      success: false,
      message: 'No cached news data available'
    });
  }
});

/**
 * Get scraping statistics
 */
app.get('/api/scraping-stats', (req, res) => {
  const cached = newsCache.get('latest_news');
  res.json({
    success: true,
    stats: {
      lastScrape: cached?.timestamp || null,
      cacheAge: cached ? Date.now() - cached.timestamp : null,
      articleCount: cached?.data?.length || 0,
      sources: NEWS_SOURCES.length,
      cacheSize: newsCache.size
    }
  });
});

// Schedule news scraping every 15 minutes
cron.schedule('*/15 * * * *', async () => {
  console.log('[NEWS SCRAPING] Scheduled scrape starting...');
  await scrapeAndUpdateConflicts();
});

// Initial scrape on startup
console.log('[NEWS SCRAPING] Starting news scraping service...');
scrapeAndUpdateConflicts().then(() => {
  console.log('[NEWS SCRAPING] Initial scrape completed');
}).catch(error => {
  console.error('[NEWS SCRAPING] Initial scrape failed:', error.message);
});

// Start the server
app.listen(PORT, () => {
  console.log(`News Scraping Service listening on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Manual scrape: POST http://localhost:${PORT}/api/scrape-news`);
});

module.exports = app;
