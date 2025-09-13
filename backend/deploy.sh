#!/bin/bash

# Crisis Connect Backend Deployment Script
# This script helps deploy the email service backend

set -e

echo "🚀 Crisis Connect Backend Deployment"
echo "======================================"

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the backend directory"
    exit 1
fi

# Function to deploy to Heroku
deploy_heroku() {
    echo "📦 Deploying to Heroku..."
    
    # Check if Heroku CLI is installed
    if ! command -v heroku &> /dev/null; then
        echo "❌ Heroku CLI not found. Please install it first:"
        echo "https://devcenter.heroku.com/articles/heroku-cli"
        exit 1
    fi
    
    # Initialize git if needed
    if [ ! -d ".git" ]; then
        echo "🔧 Initializing git repository..."
        git init
        git add .
        git commit -m "Initial backend setup for Crisis Connect"
    fi
    
    # Create Heroku app
    read -p "Enter your Heroku app name (or press Enter for auto-generated): " app_name
    
    if [ -z "$app_name" ]; then
        echo "🎲 Creating Heroku app with auto-generated name..."
        heroku create
    else
        echo "🎯 Creating Heroku app: $app_name"
        heroku create $app_name
    fi
    
    # Deploy
    echo "🚀 Deploying to Heroku..."
    git push heroku main
    
    # Get the app URL
    app_url=$(heroku info -s | grep web_url | cut -d= -f2)
    echo "✅ Deployment successful!"
    echo "🌐 Your backend API is available at: ${app_url}api"
    echo ""
    echo "Next steps:"
    echo "1. Update your mobile app's BACKEND_API_BASE to: ${app_url}api"
    echo "2. Test the health endpoint: ${app_url}health"
}

# Function to test local setup
test_local() {
    echo "🧪 Testing local setup..."
    
    # Install dependencies
    echo "📦 Installing dependencies..."
    npm install
    
    # Start server in background
    echo "🚀 Starting server..."
    npm start &
    server_pid=$!
    
    # Wait for server to start
    sleep 3
    
    # Test health endpoint
    echo "🔍 Testing health endpoint..."
    response=$(curl -s http://localhost:3001/health || echo "failed")
    
    if [[ $response == *"OK"* ]]; then
        echo "✅ Health check passed!"
    else
        echo "❌ Health check failed"
    fi
    
    # Test SMTP connection
    echo "🔍 Testing SMTP connection..."
    smtp_response=$(curl -s http://localhost:3001/api/email/test-connection || echo "failed")
    
    if [[ $smtp_response == *"success"* ]]; then
        echo "✅ SMTP connection test passed!"
    else
        echo "❌ SMTP connection test failed"
        echo "Response: $smtp_response"
    fi
    
    # Stop server
    kill $server_pid
    echo "🛑 Server stopped"
}

# Function to show deployment options
show_options() {
    echo ""
    echo "Choose deployment option:"
    echo "1. 🧪 Test local setup"
    echo "2. 🚀 Deploy to Heroku"
    echo "3. 📖 Show manual deployment guide"
    echo "4. ❌ Exit"
    echo ""
}

# Function to show manual guide
show_manual_guide() {
    echo ""
    echo "📖 Manual Deployment Guide"
    echo "=========================="
    echo ""
    echo "For Railway:"
    echo "1. Go to https://railway.app"
    echo "2. Connect your GitHub repository"
    echo "3. Select the backend folder"
    echo "4. Deploy automatically"
    echo ""
    echo "For DigitalOcean App Platform:"
    echo "1. Go to https://cloud.digitalocean.com/apps"
    echo "2. Create app from GitHub"
    echo "3. Select Node.js environment"
    echo "4. Set build command: npm install"
    echo "5. Set run command: npm start"
    echo ""
    echo "For Vercel:"
    echo "1. Go to https://vercel.com"
    echo "2. Import from GitHub"
    echo "3. Configure as Node.js project"
    echo "4. Deploy"
    echo ""
}

# Main menu
main() {
    while true; do
        show_options
        read -p "Select option (1-4): " choice
        
        case $choice in
            1)
                test_local
                ;;
            2)
                deploy_heroku
                ;;
            3)
                show_manual_guide
                ;;
            4)
                echo "👋 Goodbye!"
                exit 0
                ;;
            *)
                echo "❌ Invalid option. Please select 1-4."
                ;;
        esac
        
        echo ""
        read -p "Press Enter to continue..."
    done
}

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 16+ first."
    exit 1
fi

node_version=$(node -v | cut -d. -f1 | cut -dv -f2)
if [ $node_version -lt 16 ]; then
    echo "❌ Node.js version 16+ required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo ""

# Start main menu
main