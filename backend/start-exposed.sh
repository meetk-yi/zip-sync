#!/bin/bash

# Script to start backend with external access
echo "🚀 Starting backend with external access..."

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

# Check if we're in the backend directory
if [ ! -f "src/server.js" ]; then
    print_warning "Please run this script from the backend directory"
    exit 1
fi

print_status "Installing dependencies..."
npm install

print_status "Starting backend with external access..."
print_status "Backend will be available at:"
print_status "  External: http://13.203.192.57:5000"
print_status "  Local: http://localhost:5000"
print_status "  Network: http://0.0.0.0:5000"
print_status "  API: http://13.203.192.57:5000/api"

# Start with host binding
node src/server.js
