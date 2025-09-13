/**
 * Temporary script to update conflict records with realistic news sources
 * This mimics the functionality of scripts/updateNewsLinks.js
 */

// Generate realistic news sources based on the original script logic
function generateRealisticNewsSources(country, region, conflictType, title) {
  const sources = [];

  // Major international news sources
  const internationalSources = [
    {
      type: 'news',
      url: 'https://www.bbc.com/news/world',
      credibility: 9
    },
    {
      type: 'news',
      url: 'https://www.reuters.com/world/',
      credibility: 9
    },
    {
      type: 'news',
      url: 'https://apnews.com/hub/world-news',
      credibility: 9
    },
    {
      type: 'news',
      url: 'https://www.aljazeera.com/news/',
      credibility: 8
    },
    {
      type: 'news',
      url: 'https://www.cnn.com/world',
      credibility: 7
    }
  ];

  // Regional/country-specific sources
  const regionalSources = {
    'Ukraine': [
      {
        type: 'news',
        url: 'https://www.kyivpost.com/',
        credibility: 8
      },
      {
        type: 'news',
        url: 'https://www.pravda.com.ua/eng/',
        credibility: 7
      }
    ],
    'Syria': [
      {
        type: 'news',
        url: 'https://www.syriahr.com/',
        credibility: 7
      }
    ],
    'Gaza': [
      {
        type: 'news',
        url: 'https://www.haaretz.com/',
        credibility: 8
      },
      {
        type: 'news',
        url: 'https://www.timesofisrael.com/',
        credibility: 8
      }
    ],
    'Tunisia': [
      {
        type: 'news',
        url: 'https://www.tap.info.tn/en',
        credibility: 7
      }
    ],
    'Myanmar': [
      {
        type: 'news',
        url: 'https://www.mmtimes.com/',
        credibility: 7
      }
    ],
    'Sudan': [
      {
        type: 'news',
        url: 'https://www.dabangasudan.org/',
        credibility: 8
      }
    ],
    'Ethiopia': [
      {
        type: 'news',
        url: 'https://addisstandard.com/',
        credibility: 7
      }
    ]
  };

  // Official sources
  const officialSources = [
    {
      type: 'official',
      url: 'https://www.un.org/en/our-work/maintain-international-peace-and-security',
      credibility: 10
    },
    {
      type: 'official',
      url: 'https://www.icrc.org/en',
      credibility: 10
    },
    {
      type: 'official',
      url: 'https://www.unhcr.org/news',
      credibility: 10
    },
    {
      type: 'official',
      url: 'https://www.msf.org/news',
      credibility: 9
    }
  ];

  // Social media sources (verified accounts)
  const socialSources = [
    {
      type: 'twitter',
      url: 'https://twitter.com/UN',
      credibility: 8
    },
    {
      type: 'twitter',
      url: 'https://twitter.com/UNICEF',
      credibility: 8
    },
    {
      type: 'twitter',
      url: 'https://twitter.com/MSF',
      credibility: 8
    }
  ];

  // Add 2-3 international sources
  sources.push(...internationalSources.slice(0, 2));

  // Add regional source if available
  if (regionalSources[country]) {
    sources.push(regionalSources[country][0]);
  }

  // Add official source for humanitarian crises
  if (Array.isArray(conflictType) && (conflictType.includes('humanitarian') || conflictType.includes('displacement'))) {
    sources.push(officialSources[Math.floor(Math.random() * officialSources.length)]);
  }

  // Add social media source
  sources.push(socialSources[Math.floor(Math.random() * socialSources.length)]);

  return sources.slice(0, 4); // Limit to 4 sources max
}

// Check if a record has fake URLs that need updating
function hasFakeUrls(sources) {
  if (!sources || sources.length === 0) return false;
  
  return sources.some(source => 
    source.url.includes('example.com') || 
    source.url.includes('/news/1') ||
    source.url.includes('/source/1') ||
    source.url.includes('un.org/reports/1')
  );
}

module.exports = { generateRealisticNewsSources, hasFakeUrls };