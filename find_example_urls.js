#!/usr/bin/env node

/**
 * Script to find ConflictZone records containing example.com or other fake URLs
 */

const fs = require('fs');

// Load config
const config = JSON.parse(fs.readFileSync('./9gen_config.json', 'utf8'));
const project_id = config.project_id;

const DB_API_BASE_URL = 'https://api.9gen.dev/api';

async function makeRequest(endpoint, options = {}) {
  const url = `${DB_API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function getConflictZones() {
  try {
    const queryParams = new URLSearchParams({
      project_id: project_id,
    });

    const response = await makeRequest(`/entities/ConflictZone?${queryParams.toString()}`);
    return response.records;
  } catch (error) {
    console.error('Error fetching conflict zones:', error);
    throw error;
  }
}

// Check if a URL looks fake/example
function isFakeUrl(url) {
  if (!url) return false;
  
  const fakePatterns = [
    'example.com',
    '/news/1',
    '/source/1',
    'un.org/reports/1',
    'localhost',
    '127.0.0.1',
    'test.com',
    'fake.com',
    'mock.com'
  ];
  
  return fakePatterns.some(pattern => url.includes(pattern));
}

// Check if any URLs in a record are fake
function hasFakeUrls(data) {
  const foundFakeUrls = [];
  
  // Check sources
  if (data.sources && Array.isArray(data.sources)) {
    data.sources.forEach((source, index) => {
      if (source.url && isFakeUrl(source.url)) {
        foundFakeUrls.push({
          field: 'sources',
          index: index,
          url: source.url
        });
      }
    });
  }
  
  // Check citations
  if (data.citations && Array.isArray(data.citations)) {
    data.citations.forEach((citation, index) => {
      if (citation.url && isFakeUrl(citation.url)) {
        foundFakeUrls.push({
          field: 'citations',
          index: index,
          url: citation.url
        });
      }
    });
  }
  
  // Check geolocatedMedia
  if (data.geolocatedMedia && Array.isArray(data.geolocatedMedia)) {
    data.geolocatedMedia.forEach((media, index) => {
      if (media.url && isFakeUrl(media.url)) {
        foundFakeUrls.push({
          field: 'geolocatedMedia',
          index: index,
          url: media.url
        });
      }
    });
  }
  
  // Check relatedCharities
  if (data.relatedCharities && Array.isArray(data.relatedCharities)) {
    data.relatedCharities.forEach((charity, index) => {
      if (charity.websiteUrl && isFakeUrl(charity.websiteUrl)) {
        foundFakeUrls.push({
          field: 'relatedCharities',
          subField: 'websiteUrl',
          index: index,
          url: charity.websiteUrl
        });
      }
      if (charity.donationUrl && isFakeUrl(charity.donationUrl)) {
        foundFakeUrls.push({
          field: 'relatedCharities',
          subField: 'donationUrl',
          index: index,
          url: charity.donationUrl
        });
      }
    });
  }
  
  return foundFakeUrls;
}

async function main() {
  try {
    console.log('🔍 Searching for records with example.com or fake URLs...\n');
    
    const conflicts = await getConflictZones();
    console.log(`📊 Total records found: ${conflicts.length}\n`);
    
    const recordsWithFakeUrls = [];
    
    for (const conflict of conflicts) {
      const fakeUrls = hasFakeUrls(conflict.data);
      
      if (fakeUrls.length > 0) {
        recordsWithFakeUrls.push({
          id: conflict.id,
          title: conflict.data.title,
          fakeUrls: fakeUrls
        });
        
        console.log(`🔴 Record ID: ${conflict.id}`);
        console.log(`   Title: ${conflict.data.title}`);
        console.log(`   Fake URLs found:`);
        
        fakeUrls.forEach(fake => {
          if (fake.subField) {
            console.log(`     - ${fake.field}[${fake.index}].${fake.subField}: ${fake.url}`);
          } else {
            console.log(`     - ${fake.field}[${fake.index}]: ${fake.url}`);
          }
        });
        console.log('');
      }
    }
    
    console.log(`\n📋 SUMMARY:`);
    console.log(`   Total records: ${conflicts.length}`);
    console.log(`   Records with fake URLs: ${recordsWithFakeUrls.length}`);
    
    if (recordsWithFakeUrls.length > 0) {
      console.log('\n📝 Record IDs that need updating:');
      recordsWithFakeUrls.forEach(record => {
        console.log(`   - ${record.id} ("${record.title}")`);
      });
    } else {
      console.log('\n✅ No records found with example.com or other fake URLs!');
    }
    
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { isFakeUrl, hasFakeUrls };