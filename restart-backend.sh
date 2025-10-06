#!/bin/bash

# Script to restart backend with correct server file
echo "🔄 Restarting backend with correct server file..."

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if PM2 is available
if ! command -v pm2 &> /dev/null; then
    print_error "PM2 is not installed. Please install PM2 first."
    exit 1
fi

print_status "Stopping existing backend processes..."
pm2 stop zip-sync-backend 2>/dev/null || true
pm2 delete zip-sync-backend 2>/dev/null || true

print_status "Starting backend with correct server file (src/server.js)..."
pm2 start ecosystem.config.js --only zip-sync-backend

print_status "Checking backend status..."
pm2 status zip-sync-backend

print_status "Backend restarted successfully!"
print_status "Backend should now be accessible at: http://13.203.192.57:5000"
print_status "API endpoints: http://13.203.192.57:5000/api"

echo ""
print_status "Useful commands:"
echo "  pm2 logs zip-sync-backend    - View backend logs"
echo "  pm2 status                   - Check all processes"
echo "  pm2 restart zip-sync-backend - Restart backend"
