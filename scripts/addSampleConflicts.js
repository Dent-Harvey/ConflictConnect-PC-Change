/**
 * Sample script to add conflict zones with real sources and new types
 * Run this to populate the database with realistic examples
 */

import { ConflictService } from '../services/conflictService.js';

const sampleConflicts = [
  {
    title: 'Sudan Armed Conflict - Khartoum',
    description: 'Ongoing armed conflict between the Sudanese Armed Forces (SAF) and the Rapid Support Forces (RSF) in Khartoum and surrounding areas.',
    latitude: 15.5007,
    longitude: 32.5599,
    severity: 'critical',
    status: 'active',
    dateReported: new Date().toISOString(),
    casualties: 15000,
    involvedParties: ['Sudanese Armed Forces', 'Rapid Support Forces'],
    location: 'Khartoum',
    country: 'Sudan',
    region: 'North Africa',
    tags: ['armed-conflict', 'displacement', 'civilian-casualties'],
    conflictType: 'war',
    verified: true,
    realTimeUpdates: true,
    confidence: 95
  },
  {
    title: 'Ukraine War - Eastern Front',
    description: 'Active military operations in eastern Ukraine as part of the ongoing conflict with Russia.',
    latitude: 48.3794,
    longitude: 31.1656,
    severity: 'critical',
    status: 'active',
    dateReported: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    casualties: 500000,
    involvedParties: ['Ukrainian Armed Forces', 'Russian Armed Forces'],
    location: 'Eastern Ukraine',
    country: 'Ukraine',
    region: 'Eastern Europe',
    tags: ['invasion', 'territorial-conflict', 'civilian-infrastructure'],
    conflictType: 'war',
    verified: true,
    realTimeUpdates: true,
    confidence: 99
  },
  {
    title: 'Gaza Humanitarian Crisis',
    description: 'Ongoing humanitarian emergency in Gaza Strip with limited access to basic necessities and medical care.',
    latitude: 31.3547,
    longitude: 34.3088,
    severity: 'critical',
    status: 'active',
    dateReported: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
    casualties: 45000,
    involvedParties: ['Israeli Defense Forces', 'Hamas', 'Palestinian civilians'],
    location: 'Gaza Strip',
    country: 'Gaza',
    region: 'Middle East',
    tags: ['siege', 'humanitarian-crisis', 'civilian-casualties'],
    conflictType: 'humanitarian',
    verified: true,
    realTimeUpdates: true,
    confidence: 95
  },
  {
    title: 'US Campus Protests - Multiple Universities',
    description: 'Widespread student protests across major US universities regarding foreign policy and campus issues.',
    latitude: 40.7589,
    longitude: -73.9851,
    severity: 'medium',
    status: 'active',
    dateReported: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    casualties: 0,
    involvedParties: ['Student Organizations', 'University Administration', 'Law Enforcement'],
    location: 'New York City',
    country: 'United States',
    region: 'North America',
    tags: ['protest', 'education', 'civil-disobedience'],
    conflictType: 'protest',
    protestType: 'peaceful',
    verified: true,
    realTimeUpdates: false,
    confidence: 90
  },
  {
    title: 'French Labor Strikes - Transportation Sector',
    description: 'Major transportation strikes across France affecting trains, buses, and metro systems.',
    latitude: 48.8566,
    longitude: 2.3522,
    severity: 'medium',
    status: 'active',
    dateReported: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    casualties: 0,
    involvedParties: ['Transport Workers Union', 'SNCF', 'French Government'],
    location: 'Paris',
    country: 'France',
    region: 'Western Europe',
    tags: ['labor-strike', 'transportation', 'workers-rights'],
    conflictType: 'protest',
    protestType: 'peaceful',
    verified: true,
    realTimeUpdates: true,
    confidence: 95
  },
  {
    title: 'Yemen Famine Crisis - Hodeidah Province',
    description: 'Acute food insecurity and malnutrition affecting hundreds of thousands in war-torn Yemen.',
    latitude: 14.7972,
    longitude: 42.9553,
    severity: 'critical',
    status: 'active',
    dateReported: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    casualties: 8500,
    involvedParties: ['World Food Programme', 'Houthi Forces', 'Saudi-led Coalition'],
    location: 'Hodeidah',
    country: 'Yemen',
    region: 'Middle East',
    tags: ['famine', 'war', 'humanitarian-crisis', 'blockade'],
    conflictType: 'famine',
    verified: true,
    realTimeUpdates: true,
    confidence: 98
  },
  {
    title: 'Somalia Drought and Famine',
    description: 'Severe drought leading to widespread famine conditions affecting millions in Somalia.',
    latitude: 2.0469,
    longitude: 45.3182,
    severity: 'critical',
    status: 'active',
    dateReported: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    casualties: 43000,
    involvedParties: ['UN Agencies', 'Somali Government', 'Al-Shabaab'],
    location: 'Horn of Africa',
    country: 'Somalia',
    region: 'East Africa',
    tags: ['famine', 'drought', 'humanitarian-crisis', 'malnutrition'],
    conflictType: 'famine',
    verified: true,
    realTimeUpdates: true,
    confidence: 98
  },
  {
    title: 'German Climate Protests - Berlin',
    description: 'Environmental activists blocking major roads and government buildings in climate demonstrations.',
    latitude: 52.5200,
    longitude: 13.4050,
    severity: 'low',
    status: 'active',
    dateReported: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    casualties: 0,
    involvedParties: ['Climate Activists', 'German Police', 'Local Government'],
    location: 'Berlin',
    country: 'Germany',
    region: 'Central Europe',
    tags: ['climate-protest', 'civil-disobedience', 'environmental'],
    conflictType: 'protest',
    protestType: 'civil-disobedience',
    verified: true,
    realTimeUpdates: false,
    confidence: 88
  },
  {
    title: 'Afghanistan Humanitarian Crisis',
    description: 'Ongoing humanitarian emergency with severe restrictions on aid delivery and women\'s rights.',
    latitude: 34.5553,
    longitude: 69.2075,
    severity: 'high',
    status: 'active',
    dateReported: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    casualties: 1200,
    involvedParties: ['Taliban Government', 'UN Agencies', 'International NGOs'],
    location: 'Kabul',
    country: 'Afghanistan',
    region: 'Central Asia',
    tags: ['humanitarian-crisis', 'women-rights', 'aid-restrictions'],
    conflictType: 'humanitarian',
    verified: true,
    realTimeUpdates: false,
    confidence: 92
  },
  {
    title: 'Portland Police Reform Protests',
    description: 'Demonstrations calling for police accountability and criminal justice reform in Portland.',
    latitude: 45.5152,
    longitude: -122.6784,
    severity: 'medium',
    status: 'monitoring',
    dateReported: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    casualties: 0,
    involvedParties: ['Black Lives Matter', 'Portland Police Bureau', 'City Government'],
    location: 'Portland',
    country: 'United States',
    region: 'North America',
    tags: ['police-reform', 'civil-rights', 'social-justice'],
    conflictType: 'protest',
    protestType: 'mixed',
    verified: true,
    realTimeUpdates: false,
    confidence: 87
  },
  {
    title: 'Italy Immigration Crisis - Lampedusa',
    description: 'Overcrowded migrant reception facilities as hundreds arrive daily from North Africa.',
    latitude: 35.5089,
    longitude: 12.6090,
    severity: 'high',
    status: 'escalating',
    dateReported: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
    casualties: 25,
    involvedParties: ['Italian Coast Guard', 'EU Border Agency', 'NGO Rescue Ships'],
    location: 'Lampedusa',
    country: 'Italy',
    region: 'Southern Europe',
    tags: ['migration', 'humanitarian-crisis', 'border-crisis'],
    conflictType: 'humanitarian',
    verified: true,
    realTimeUpdates: true,
    confidence: 93
  },
  {
    title: 'Madagascar Famine - Southern Regions',
    description: 'Climate-induced famine affecting over 1 million people due to prolonged drought conditions.',
    latitude: -24.2676,
    longitude: 45.7129,
    severity: 'high',
    status: 'active',
    dateReported: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days ago
    casualties: 2500,
    involvedParties: ['UN World Food Programme', 'Malagasy Government', 'International NGOs'],
    location: 'Southern Madagascar',
    country: 'Madagascar',
    region: 'Southern Africa',
    tags: ['climate-famine', 'food-insecurity', 'malnutrition'],
    conflictType: 'famine',
    verified: true,
    realTimeUpdates: false,
    confidence: 92
  }
];

async function addSampleConflicts() {
  console.log('Adding sample conflicts with real sources...');
  
  for (const conflict of sampleConflicts) {
    try {
      // Generate specialized sources based on conflict type
      const sources = ConflictService.generateSourcesForConflict(
        conflict.country,
        conflict.region,
        conflict.conflictType,
        conflict.title
      );
      
      const conflictWithSources = {
        ...conflict,
        sources
      };
      
      const result = await ConflictService.createConflictZone(conflictWithSources);
      console.log(`✓ Added: ${result.title}`);
    } catch (error) {
      console.error(`✗ Failed to add ${conflict.title}:`, error);
    }
  }
}

// Export for use in other scripts
export { addSampleConflicts, sampleConflicts };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  addSampleConflicts().then(() => {
    console.log('Sample conflicts added successfully!');
  }).catch(error => {
    console.error('Error adding sample conflicts:', error);
  });
}