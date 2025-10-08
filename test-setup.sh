#!/bin/bash

# Test script to verify PM2 setup
echo "🧪 Testing Zip Sync PM2 Setup..."

# Check if PM2 is installed
if command -v pm2 &> /dev/null; then
    echo "✅ PM2 is installed"
else
    echo "❌ PM2 is not installed. Please run: npm install -g pm2"
    exit 1
fi

# Check if applications are running
echo ""
echo "📊 Current PM2 Status:"
pm2 status

echo ""
echo "🌐 Testing Application URLs..."

# Test backend
echo "Testing backend on http://43.205.121.85:5000..."
if curl -s --connect-timeout 5 http://43.205.121.85:5000 > /dev/null; then
    echo "✅ Backend is responding"
else
    echo "❌ Backend is not responding"
fi

# Test frontend
echo "Testing frontend on http://43.205.121.85:5173..."
if curl -s --connect-timeout 5 http://43.205.121.85:5173 > /dev/null; then
    echo "✅ Frontend is responding"
else
    echo "❌ Frontend is not responding"
fi

echo ""
echo "📝 Recent logs:"
pm2 logs --lines 10

echo ""
echo "🔧 Useful commands:"
echo "   pm2 status          - Check status"
echo "   pm2 logs            - View logs"
echo "   pm2 monit           - Monitor resources"
echo "   pm2 restart all     - Restart applications"
