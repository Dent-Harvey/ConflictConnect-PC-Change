#!/bin/bash

# Start News Scraping Service for Conflict\Connect
# This script installs dependencies and starts the news scraping service

echo "🚀 Starting Conflict\Connect News Scraping Service..."

# Check if we're in the right directory
if [ ! -f "backend/package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Install dependencies for news scraping service
echo "📦 Installing news scraping dependencies..."
cd backend

if [ ! -d "node_modules" ]; then
    echo "📥 Installing all dependencies..."
    npm install
else
    echo "📥 Installing new dependencies for news scraping..."
    npm install axios xml2js node-cron
fi

# Start the news scraping service
echo "🔄 Starting news scraping service..."
echo "📡 Service will be available at: http://localhost:3002"
echo "🏥 Health check: http://localhost:3002/health"
echo "📰 Manual scrape: POST http://localhost:3002/api/scrape-news"
echo ""
echo "⏰ News will be scraped automatically every 15 minutes"
echo "🔄 Press Ctrl+C to stop the service"
echo ""

# Start the news scraping service
node newsScrapingService.js
