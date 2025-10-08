#!/bin/bash

# Zip Sync PM2 Startup Script
# This script will start both frontend and backend using PM2

echo "🚀 Starting Zip Sync Application with PM2..."

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2 is not installed. Installing PM2 globally..."
    npm install -g pm2
fi

# Navigate to project root
cd "$(dirname "$0")"

# Stop any existing PM2 processes
echo "🛑 Stopping existing PM2 processes..."
pm2 delete all 2>/dev/null || true

# Start the applications
echo "🔄 Starting applications with PM2..."
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup

echo "✅ Applications started successfully!"
echo ""
echo "📊 Application Status:"
pm2 status

echo ""
echo "🌐 Access URLs:"
echo "   Frontend: http://43.205.121.85:5173"
echo "   Backend:  http://43.205.121.85:5000"
echo ""
echo "📝 Useful PM2 commands:"
echo "   pm2 status          - Check application status"
echo "   pm2 logs            - View all logs"
echo "   pm2 logs frontend   - View frontend logs"
echo "   pm2 logs backend    - View backend logs"
echo "   pm2 restart all     - Restart all applications"
echo "   pm2 stop all        - Stop all applications"
echo "   pm2 delete all      - Delete all applications"
