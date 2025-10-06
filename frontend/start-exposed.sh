#!/bin/bash

# Script to start frontend with external access
echo "🚀 Starting frontend with external access..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    print_warning "Please run this script from the frontend directory"
    exit 1
fi

print_status "Installing dependencies..."
npm install

print_status "Starting frontend with external access..."
print_status "Frontend will be available at: http://13.203.192.57:5173"
print_status "Local access: http://localhost:5173"
print_status "Network access: http://0.0.0.0:5173"

# Start with host binding
npm run dev -- --host 0.0.0.0 --port 5173
