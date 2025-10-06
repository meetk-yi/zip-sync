#!/bin/bash

echo "🚀 Starting Zip Sync Frontend Development Server"
echo "================================================"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🔧 Starting development server..."
echo "📱 Frontend will be available at: http://13.203.192.57:5173"
echo "🔗 Make sure your backend is running on: http://13.203.192.57:5000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev
