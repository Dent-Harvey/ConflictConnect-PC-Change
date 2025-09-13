const https = require('https');
const { project_id } = require('../9gen_config.json');

const DB_API_BASE_URL = 'https://api.9gen.dev/api';

async function makeRequest(endpoint, options = {}) {
  const url = `${DB_API_BASE_URL}${endpoint}`;
  console.log('Making request to:', url);
  
  return new Promise((resolve, reject) => {
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const req = https.request(url, requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          resolve(data);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

const comprehensiveConflicts = [
  // Ukraine-Russia War
  {
    title: "Ukraine-Russia Conflict - Eastern Front",
    description: "Ongoing military operations in eastern Ukraine with heavy fighting around key strategic positions. Multiple civilian infrastructure targets have been hit, causing widespread power outages and humanitarian concerns.",
    latitude: 49.2331,
    longitude: 28.4682,
    severity: "critical",
    status: "active",
    conflictType: "war",
    country: "Ukraine",
    region: "Eastern Ukraine",
    location: "Donetsk Oblast, Ukraine",
    casualties: 2847,
    verified: true,
    realTimeUpdates: true,
    sources: [
      { type: "official", url: "https://www.understandingwar.org/backgrounder/russian-offensive-campaign-assessment", credibility: 9 },
      { type: "news", url: "https://kyivindependent.com/", credibility: 8 },
      { type: "official", url: "https://www.csis.org/analysis", credibility: 9 },
      { type: "news", url: "https://www.reuters.com/world/", credibility: 9 }
    ],
    involvedParties: ["Ukrainian Armed Forces", "Russian Armed Forces", "Wagner Group"],
    tags: ["war", "military-conflict", "humanitarian-crisis", "infrastructure"],
    dateReported: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
  },

  // Gaza-Israel Conflict
  {
    title: "Gaza Strip - Ongoing Military Operations",
    description: "Intense military operations continue in Gaza Strip with significant civilian casualties and infrastructure damage. Multiple humanitarian organizations report severe shortages of medical supplies and basic necessities.",
    latitude: 31.3547,
    longitude: 34.3088,
    severity: "critical",
    status: "active",
    conflictType: "war",
    country: "Palestine",
    region: "Gaza Strip",
    location: "Gaza City, Gaza Strip",
    casualties: 5243,
    verified: true,
    realTimeUpdates: true,
    sources: [
      { type: "official", url: "https://www.crisisgroup.org/middle-east-north-africa/eastern-mediterranean/israel-palestine", credibility: 9 },
      { type: "official", url: "https://www.unocha.org/occupied-palestinian-territory", credibility: 10 },
      { type: "news", url: "https://www.reuters.com/world/", credibility: 9 },
      { type: "official", url: "https://reliefweb.int/", credibility: 10 }
    ],
    involvedParties: ["Israeli Defense Forces", "Hamas", "Palestinian Civilians"],
    tags: ["war", "humanitarian-crisis", "civilian-casualties", "medical-crisis"],
    dateReported: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
  },

  // Sudan Civil War
  {
    title: "Sudan Civil Conflict - Khartoum Fighting",
    description: "Armed clashes between Sudanese Armed Forces and Rapid Support Forces continue in the capital. Civilian areas heavily affected with mass displacement and breakdown of basic services.",
    latitude: 15.5007,
    longitude: 32.5599,
    severity: "critical",
    status: "active",
    conflictType: "military",
    country: "Sudan",
    region: "Khartoum State",
    location: "Khartoum, Sudan",
    casualties: 1876,
    verified: true,
    realTimeUpdates: true,
    sources: [
      { type: "official", url: "https://www.crisisgroup.org/africa/horn-africa/sudan", credibility: 9 },
      { type: "news", url: "https://www.dabangasudan.org/", credibility: 8 },
      { type: "official", url: "https://www.unocha.org/sudan", credibility: 10 },
      { type: "news", url: "https://www.bbc.com/news/world", credibility: 9 }
    ],
    involvedParties: ["Sudanese Armed Forces", "Rapid Support Forces"],
    tags: ["civil-war", "displacement", "infrastructure-collapse", "humanitarian-crisis"],
    dateReported: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
  },

  // Myanmar Civil Unrest
  {
    title: "Myanmar - Anti-Military Protests in Yangon",
    description: "Large-scale protests against military rule continue despite violent crackdowns. Multiple casualties reported as security forces use live ammunition against peaceful demonstrators.",
    latitude: 16.8661,
    longitude: 96.1951,
    severity: "high",
    status: "active",
    conflictType: "protest",
    protestType: "mixed",
    country: "Myanmar",
    region: "Yangon Region",
    location: "Yangon, Myanmar",
    casualties: 127,
    verified: true,
    realTimeUpdates: false,
    sources: [
      { type: "official", url: "https://www.crisisgroup.org/asia/south-east-asia/myanmar", credibility: 9 },
      { type: "official", url: "https://www.amnesty.org/en/latest/news/", credibility: 9 },
      { type: "news", url: "https://www.reuters.com/world/", credibility: 9 },
      { type: "official", url: "https://www.hrw.org/news", credibility: 9 }
    ],
    involvedParties: ["Myanmar Military", "Pro-Democracy Protesters", "Civil Disobedience Movement"],
    tags: ["protest", "democracy", "human-rights", "military-crackdown"],
    dateReported: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() // 12 hours ago
  },

  // Somalia Famine
  {
    title: "Somalia - Severe Drought and Famine Crisis",
    description: "Acute food security crisis affecting millions with severe malnutrition rates among children. Multiple regions facing emergency-level food insecurity due to prolonged drought.",
    latitude: 2.0469,
    longitude: 45.3182,
    severity: "critical",
    status: "active",
    conflictType: "famine",
    country: "Somalia",
    region: "Bay Region",
    location: "Baidoa, Somalia",
    casualties: 892,
    verified: true,
    realTimeUpdates: false,
    sources: [
      { type: "official", url: "https://www.fsinplatform.org/global-report", credibility: 10 },
      { type: "official", url: "https://www.wfp.org/countries/somalia", credibility: 10 },
      { type: "official", url: "https://www.fsnau.org/", credibility: 8 },
      { type: "official", url: "https://www.unicef.org/press-releases", credibility: 10 }
    ],
    involvedParties: ["Somali Government", "WFP", "UNICEF", "Local Communities"],
    tags: ["famine", "drought", "malnutrition", "humanitarian-crisis"],
    dateReported: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() // 6 days ago
  },

  // United States - Police Violence Protests
  {
    title: "Minneapolis - Police Violence Protests",
    description: "Large demonstrations following police shooting incident. Peaceful protests during day with some incidents of civil unrest in evening hours. Multiple arrests reported.",
    latitude: 44.9778,
    longitude: -93.2650,
    severity: "medium",
    status: "monitoring",
    conflictType: "protest",
    protestType: "mixed",
    country: "United States",
    region: "Minnesota",
    location: "Minneapolis, MN, USA",
    casualties: 23,
    verified: true,
    realTimeUpdates: false,
    sources: [
      { type: "news", url: "https://www.washingtonpost.com/politics/", credibility: 8 },
      { type: "news", url: "https://www.nytimes.com/section/us", credibility: 9 },
      { type: "official", url: "https://www.fbi.gov/news/pressrel", credibility: 9 },
      { type: "news", url: "https://apnews.com/hub/world-news", credibility: 9 }
    ],
    involvedParties: ["Minneapolis Police", "Black Lives Matter", "Local Community"],
    tags: ["protest", "police-violence", "racial-justice", "civil-rights"],
    dateReported: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() // 8 hours ago
  },

  // France - Labor Strikes
  {
    title: "Paris - National Labor Strike Action",
    description: "Major transportation strike affecting metro, buses, and trains across Paris. Protesters demanding better working conditions and pension reform reversal. Some clashes with police reported.",
    latitude: 48.8566,
    longitude: 2.3522,
    severity: "medium",
    status: "active",
    conflictType: "labor-dispute",
    protestType: "peaceful",
    country: "France",
    region: "Île-de-France",
    location: "Paris, France",
    casualties: 8,
    verified: true,
    realTimeUpdates: false,
    sources: [
      { type: "news", url: "https://www.lemonde.fr/en/", credibility: 8 },
      { type: "official", url: "https://www.diplomatie.gouv.fr/en/", credibility: 9 },
      { type: "news", url: "https://www.reuters.com/world/", credibility: 9 },
      { type: "news", url: "https://www.bbc.com/news/world", credibility: 9 }
    ],
    involvedParties: ["French Labor Unions", "French Government", "Transportation Workers"],
    tags: ["strike", "labor-dispute", "transportation", "pension-reform"],
    dateReported: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString() // 18 hours ago
  },

  // Italy - Environmental Protests
  {
    title: "Rome - Climate Change Demonstrations",
    description: "Environmental activists blocking major roads demanding immediate climate action. Peaceful demonstration with some disruptions to city traffic. Police maintaining order with minimal intervention.",
    latitude: 41.9028,
    longitude: 12.4964,
    severity: "low",
    status: "monitoring",
    conflictType: "protest",
    protestType: "peaceful",
    country: "Italy",
    region: "Lazio",
    location: "Rome, Italy",
    casualties: 0,
    verified: true,
    realTimeUpdates: false,
    sources: [
      { type: "news", url: "https://www.ansa.it/english/", credibility: 8 },
      { type: "official", url: "https://www.interno.gov.it/en", credibility: 9 },
      { type: "news", url: "https://www.theguardian.com/world", credibility: 8 },
      { type: "official", url: "https://www.amnesty.org/en/latest/news/", credibility: 9 }
    ],
    involvedParties: ["Climate Activists", "Extinction Rebellion", "Italian Police"],
    tags: ["protest", "climate-change", "environmental", "civil-disobedience"],
    dateReported: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() // 4 hours ago
  },

  // Ethiopia - Ethnic Conflict
  {
    title: "Ethiopia - Inter-ethnic Violence in Oromia",
    description: "Clashes between different ethnic groups in Oromia region resulting in displacement of thousands. Tensions escalating over land rights and resource allocation disputes.",
    latitude: 9.145,
    longitude: 40.4897,
    severity: "high",
    status: "escalating",
    conflictType: "ethnic-conflict",
    country: "Ethiopia",
    region: "Oromia Region",
    location: "Adama, Ethiopia",
    casualties: 234,
    verified: true,
    realTimeUpdates: false,
    sources: [
      { type: "official", url: "https://www.crisisgroup.org/africa/horn-africa/ethiopia", credibility: 9 },
      { type: "official", url: "https://reliefweb.int/", credibility: 10 },
      { type: "news", url: "https://www.bbc.com/news/world", credibility: 9 },
      { type: "official", url: "https://www.unhcr.org/news/briefing-notes", credibility: 10 }
    ],
    involvedParties: ["Oromo Groups", "Amhara Groups", "Ethiopian Government"],
    tags: ["ethnic-conflict", "displacement", "land-rights", "resource-dispute"],
    dateReported: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
  },

  // Yemen - Humanitarian Crisis
  {
    title: "Yemen - Ongoing Humanitarian Emergency",
    description: "Continued armed conflict exacerbating humanitarian crisis. Millions facing food insecurity and lack access to basic healthcare. Multiple aid agencies report severe funding shortfalls.",
    latitude: 15.3694,
    longitude: 44.1910,
    severity: "critical",
    status: "active",
    conflictType: "humanitarian",
    country: "Yemen",
    region: "Sana'a Governorate",
    location: "Sana'a, Yemen",
    casualties: 1456,
    verified: true,
    realTimeUpdates: false,
    sources: [
      { type: "official", url: "https://www.crisisgroup.org/middle-east-north-africa/gulf-and-arabian-peninsula/yemen", credibility: 9 },
      { type: "official", url: "https://www.unocha.org/yemen", credibility: 10 },
      { type: "official", url: "https://www.wfp.org/countries/yemen", credibility: 10 },
      { type: "news", url: "https://www.reuters.com/world/", credibility: 9 }
    ],
    involvedParties: ["Houthi Movement", "Yemeni Government", "Saudi-led Coalition"],
    tags: ["humanitarian-crisis", "food-insecurity", "healthcare", "armed-conflict"],
    dateReported: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
  },

  // Afghanistan - Taliban Restrictions
  {
    title: "Afghanistan - Women's Rights Protests in Kabul",
    description: "Small groups of women activists protesting Taliban restrictions on education and employment. Security forces dispersing gatherings and several arrests reported.",
    latitude: 34.5553,
    longitude: 69.2075,
    severity: "medium",
    status: "active",
    conflictType: "protest",
    protestType: "peaceful",
    country: "Afghanistan",
    region: "Kabul Province",
    location: "Kabul, Afghanistan",
    casualties: 15,
    verified: true,
    realTimeUpdates: false,
    sources: [
      { type: "official", url: "https://www.crisisgroup.org/asia/south-asia/afghanistan", credibility: 9 },
      { type: "official", url: "https://www.unocha.org/afghanistan", credibility: 10 },
      { type: "official", url: "https://www.hrw.org/news", credibility: 9 },
      { type: "news", url: "https://www.bbc.com/news/world", credibility: 9 }
    ],
    involvedParties: ["Women Activists", "Taliban Forces", "Civil Society Groups"],
    tags: ["womens-rights", "protest", "taliban", "human-rights"],
    dateReported: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
  },

  // Madagascar - Famine Crisis
  {
    title: "Madagascar - Southern Famine Emergency",
    description: "Severe drought causing acute malnutrition in southern regions. First climate-induced famine in modern history affecting over one million people. International aid urgently needed.",
    latitude: -23.3165,
    longitude: 43.9253,
    severity: "critical",
    status: "active",
    conflictType: "famine",
    country: "Madagascar",
    region: "Androy Region",
    location: "Ambovombe, Madagascar",
    casualties: 567,
    verified: true,
    realTimeUpdates: false,
    sources: [
      { type: "official", url: "https://www.wfp.org/countries/madagascar", credibility: 10 },
      { type: "official", url: "https://www.fsinplatform.org/global-report", credibility: 10 },
      { type: "official", url: "https://www.unicef.org/press-releases", credibility: 10 },
      { type: "news", url: "https://www.reuters.com/world/", credibility: 9 }
    ],
    involvedParties: ["Malagasy Government", "WFP", "UNICEF", "Local Communities"],
    tags: ["famine", "climate-change", "malnutrition", "drought"],
    dateReported: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
  },

  // Syria - Refugee Crisis
  {
    title: "Syria - Refugee Camp Overcrowding Crisis",
    description: "Severe overcrowding in refugee camps near Turkish border. Inadequate shelter and sanitation facilities creating health crisis. Winter conditions exacerbating humanitarian situation.",
    latitude: 36.2021,
    longitude: 37.1343,
    severity: "high",
    status: "active",
    conflictType: "humanitarian",
    country: "Syria",
    region: "Aleppo Governorate",
    location: "Aleppo, Syria",
    casualties: 89,
    verified: true,
    realTimeUpdates: false,
    sources: [
      { type: "official", url: "https://www.crisisgroup.org/middle-east-north-africa/eastern-mediterranean/syria", credibility: 9 },
      { type: "official", url: "https://www.unhcr.org/news/briefing-notes", credibility: 10 },
      { type: "official", url: "https://reliefweb.int/", credibility: 10 },
      { type: "news", url: "https://www.bbc.com/news/world", credibility: 9 }
    ],
    involvedParties: ["Syrian Refugees", "UNHCR", "Turkish Authorities", "NGOs"],
    tags: ["refugee-crisis", "overcrowding", "health-crisis", "winter-conditions"],
    dateReported: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() // 4 days ago
  },

  // Germany - Far-Right Demonstrations
  {
    title: "Berlin - Counter-Protests Against Far-Right Rally",
    description: "Large counter-demonstrations organized against planned far-right march in city center. Police maintaining separation between groups. Mostly peaceful with some isolated incidents.",
    latitude: 52.5200,
    longitude: 13.4050,
    severity: "low",
    status: "monitoring",
    conflictType: "protest",
    protestType: "peaceful",
    country: "Germany",
    region: "Berlin",
    location: "Berlin, Germany",
    casualties: 3,
    verified: true,
    realTimeUpdates: false,
    sources: [
      { type: "news", url: "https://www.dw.com/en/", credibility: 8 },
      { type: "official", url: "https://www.bundesregierung.de/breg-en", credibility: 9 },
      { type: "news", url: "https://www.reuters.com/world/", credibility: 9 },
      { type: "official", url: "https://www.amnesty.org/en/latest/news/", credibility: 9 }
    ],
    involvedParties: ["Anti-Fascist Groups", "Far-Right Organizations", "German Police"],
    tags: ["protest", "counter-protest", "far-right", "anti-fascist"],
    dateReported: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() // 6 hours ago
  },

  // Local Protest - Student Movement
  {
    title: "London - University Fee Protests",
    description: "Student demonstrations against proposed tuition fee increases. Peaceful march from university campuses to Parliament. Minimal police presence with no significant incidents reported.",
    latitude: 51.5074,
    longitude: -0.1278,
    severity: "low",
    status: "resolved",
    conflictType: "protest",
    protestType: "peaceful",
    country: "United Kingdom",
    region: "Greater London",
    location: "London, UK",
    casualties: 0,
    verified: true,
    realTimeUpdates: false,
    sources: [
      { type: "news", url: "https://www.theguardian.com/world", credibility: 8 },
      { type: "news", url: "https://www.bbc.com/news/world", credibility: 9 },
      { type: "news", url: "https://www.reuters.com/world/", credibility: 9 },
      { type: "official", url: "https://www.amnesty.org/en/latest/news/", credibility: 9 }
    ],
    involvedParties: ["University Students", "Student Unions", "Metropolitan Police"],
    tags: ["student-protest", "education", "tuition-fees", "peaceful"],
    dateReported: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
  }
];

async function addComprehensiveConflicts() {
  console.log('Starting to add comprehensive conflict data...');
  
  let successCount = 0;
  let failureCount = 0;

  for (const conflict of comprehensiveConflicts) {
    try {
      console.log(`Adding conflict: ${conflict.title}`);
      
      const response = await makeRequest('/entities/ConflictZone/insert', {
        method: 'POST',
        body: JSON.stringify({
          project_id: project_id,
          data: {
            ...conflict,
            lastUpdated: new Date().toISOString(),
          },
        }),
      });

      if (response.success || response.data) {
        console.log(`✅ Successfully added: ${conflict.title}`);
        successCount++;
      } else {
        console.log(`❌ Failed to add: ${conflict.title}`, response);
        failureCount++;
      }
    } catch (error) {
      console.log(`❌ Error adding ${conflict.title}:`, error.message);
      failureCount++;
    }
  }

  console.log('\n📊 Summary:');
  console.log(`✅ Successfully added: ${successCount} conflicts`);
  console.log(`❌ Failed to add: ${failureCount} conflicts`);
  console.log(`📈 Total conflicts processed: ${comprehensiveConflicts.length}`);
  console.log('\nComprehensive conflict data population complete!');
  
  // Verify data by querying
  try {
    console.log('\n🔍 Verifying data...');
    const verifyResponse = await makeRequest(`/entities/ConflictZone?project_id=${project_id}&limit=50`);
    console.log(`📋 Total conflicts in database: ${verifyResponse.total || verifyResponse.records?.length || 'Unknown'}`);
  } catch (error) {
    console.log('❌ Error verifying data:', error.message);
  }
}

// Run the script
addComprehensiveConflicts().catch(console.error);