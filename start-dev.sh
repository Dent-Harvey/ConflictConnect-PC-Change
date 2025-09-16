#!/bin/bash

# Conflict\Connect Development Startup Script
# This script starts both the backend email service and the Expo frontend

echo "🚀 Starting Conflict\Connect Development Environment..."

# Function to cleanup background processes on exit
cleanup() {
    echo "🛑 Shutting down services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start backend email service
echo "📧 Starting backend email service..."
cd backend
npm start &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Check if backend is running
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ Backend email service is running on http://localhost:3001"
else
    echo "❌ Failed to start backend email service"
    exit 1
fi

# Start Expo frontend
echo "📱 Starting Expo frontend..."
npx expo start &
FRONTEND_PID=$!

echo "🎉 Development environment started!"
echo "📧 Backend Email Service: http://localhost:3001"
echo "📱 Expo Frontend: Check terminal for QR code"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for background processes
wait
