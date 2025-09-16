# Real-Time News Integration Setup Guide

This guide explains how to set up and configure the real-time news scraping system for Conflict\Connect.

## Overview

The app now includes a comprehensive news scraping system that:
- Scrapes news from major international and regional sources
- Detects conflict-related articles automatically
- Updates existing conflicts with new information
- Provides real-time data to the mobile app

## Components

### 1. News Scraping Service (`backend/newsScrapingService.js`)
- Runs as a separate Node.js service on port 3002
- Scrapes RSS feeds from 8+ major news sources
- Automatically detects conflict-related articles
- Updates the database with new information every 15 minutes

### 2. Frontend Integration (`services/newsScrapingService.ts`)
- TypeScript service for the mobile app
- Integrates with the backend news service
- Provides real-time conflict data

### 3. Updated Conflict Service (`services/conflictService.ts`)
- Enhanced with real-time news integration
- Triggers news updates automatically
- Provides fresh conflict data

## Setup Instructions

### Step 1: Install Dependencies

```bash
# Install news scraping dependencies
cd backend
npm install axios xml2js node-cron
```

### Step 2: Start the News Scraping Service

```bash
# From project root
./start-news-service.sh
```

Or manually:
```bash
cd backend
node newsScrapingService.js
```

### Step 3: Verify the Service

Check that the service is running:
```bash
curl http://localhost:3002/health
```

You should see:
```json
{
  "status": "OK",
  "service": "Conflict\\Connect News Scraping Service",
  "timestamp": "2025-09-14T18:30:00.000Z",
  "lastScrape": null
}
```

### Step 4: Test News Scraping

Trigger a manual news scrape:
```bash
curl -X POST http://localhost:3002/api/scrape-news
```

### Step 5: Configure Mobile App

The mobile app will automatically use real-time data when the news service is available.

## News Sources

The system scrapes from these sources:

### International Sources
- BBC World News (RSS)
- Reuters World (RSS)
- Associated Press (RSS)
- Al Jazeera (RSS)
- CNN World (RSS)

### Humanitarian Sources
- UN News (RSS)
- UNHCR News (RSS)
- International Crisis Group (RSS)

### Regional Sources
- Haaretz (Middle East)
- Times of Israel (Middle East)
- Kyiv Post (Eastern Europe)
- AllAfrica (Africa)

## Conflict Detection

The system automatically detects conflicts using keywords:
- War, conflict, violence, attack, bombing, shelling
- Fighting, casualties, deaths, injured, displaced
- Refugees, crisis, humanitarian, emergency
- Military, armed, gunfire, explosion, terrorism
- Civil war, ethnic conflict, genocide, massacre

## Severity Detection

Articles are automatically categorized by severity:
- **Critical**: Massacre, genocide, war crimes, atrocities
- **High**: Bombing, shelling, attack, fighting, casualties
- **Medium**: Tension, clashes, violence, unrest, protests
- **Low**: Incident, arrests, investigation, reports

## API Endpoints

### Health Check
```
GET /health
```

### Manual News Scrape
```
POST /api/scrape-news
```

### Get Latest News
```
GET /api/latest-news
```

### Get Scraping Statistics
```
GET /api/scraping-stats
```

## Configuration

### Environment Variables

Set these environment variables for production:

```bash
# News scraping service URL (for mobile app)
EXPO_PUBLIC_NEWS_API_URL=https://conflictconnect-news.neffcreative.co

# Database API (already configured)
# Uses 9gen API with project_id from 9gen_config.json
```

### Scheduling

News scraping runs automatically every 15 minutes. To change this, modify the cron schedule in `newsScrapingService.js`:

```javascript
// Current: every 15 minutes
cron.schedule('*/15 * * * *', async () => {
  await scrapeAndUpdateConflicts();
});

// Example: every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  await scrapeAndUpdateConflicts();
});
```

## Mobile App Integration

The mobile app automatically uses real-time data when available:

```typescript
// In your components
const { data: conflicts, isLoading } = useConflictZones(filters, true); // true = enable real-time
```

### Real-Time Features

1. **Automatic Updates**: Conflicts update every 2 minutes when real-time is enabled
2. **Fresh News Sources**: New news articles are automatically added to conflicts
3. **Severity Updates**: Conflict severity updates based on latest news
4. **Real-Time Status**: Conflicts marked with `realTimeUpdates: true`

## Monitoring

### Check Service Status
```bash
curl http://localhost:3002/api/scraping-stats
```

### View Logs
The service logs all scraping activity:
- Articles found per source
- Conflicts updated
- Errors and warnings

### Cache Information
News articles are cached for 5 minutes to avoid excessive API calls.

## Troubleshooting

### Common Issues

1. **Service Won't Start**
   - Check if port 3002 is available
   - Ensure all dependencies are installed
   - Check Node.js version (requires >= 16.0.0)

2. **No News Articles Found**
   - Check internet connection
   - Verify RSS feed URLs are accessible
   - Check for CORS issues (should not occur with RSS feeds)

3. **Database Update Failures**
   - Verify 9gen API credentials in `9gen_config.json`
   - Check network connectivity to database API
   - Review error logs for specific issues

### Debug Mode

Enable debug logging by setting:
```bash
DEBUG=news-scraping
node newsScrapingService.js
```

## Production Deployment

### Deploy to Server

1. **Upload files** to your server
2. **Install dependencies**: `npm install`
3. **Set environment variables**
4. **Start service**: `node newsScrapingService.js`
5. **Use PM2 for process management**:
   ```bash
   npm install -g pm2
   pm2 start newsScrapingService.js --name "conflict-news"
   pm2 save
   pm2 startup
   ```

### Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name conflictconnect-news.neffcreative.co;
    
    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Performance Considerations

- **Rate Limiting**: 1-second delay between RSS feed requests
- **Caching**: 5-minute cache for news articles
- **Batch Updates**: Conflicts updated in batches with delays
- **Error Handling**: Graceful degradation if sources fail

## Security

- **Input Validation**: All news content is validated
- **Rate Limiting**: Respectful scraping with delays
- **Error Handling**: No sensitive information in logs
- **CORS**: Properly configured for mobile app access

---

**Last Updated**: September 14, 2025  
**Service Version**: 1.0.0  
**Conflict\Connect Version**: 1.0.0
