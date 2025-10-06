#!/bin/bash

# Script to verify project directory structure
echo "🔍 Verifying project directory structure..."

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if we're in the right directory
if [ ! -d "backend" ]; then
    print_error "Please run this script from the zip-sync project root directory"
    exit 1
fi

print_status "Checking directory structure..."

# Check backend/projects directory
if [ -d "backend/projects" ]; then
    print_status "✅ backend/projects directory exists"
else
    print_warning "⚠️ backend/projects directory missing, creating..."
    mkdir -p backend/projects
    print_status "✅ backend/projects directory created"
fi

# Check backend/uploads directory
if [ -d "backend/uploads" ]; then
    print_status "✅ backend/uploads directory exists"
else
    print_warning "⚠️ backend/uploads directory missing, creating..."
    mkdir -p backend/uploads
    print_status "✅ backend/uploads directory created"
fi

# Check logs directory
if [ -d "logs" ]; then
    print_status "✅ logs directory exists"
else
    print_warning "⚠️ logs directory missing, creating..."
    mkdir -p logs
    print_status "✅ logs directory created"
fi

# Check permissions
print_status "Setting proper permissions..."
chmod -R 755 backend/projects
chmod -R 755 backend/uploads
chmod -R 755 logs

print_status "Directory structure verification completed!"
print_status "Projects will be built in: $(pwd)/backend/projects"
print_status "Uploads will be stored in: $(pwd)/backend/uploads"
print_status "Logs will be stored in: $(pwd)/logs"

echo ""
print_status "Directory structure:"
echo "├── backend/"
echo "│   ├── projects/     (where projects are built)"
echo "│   ├── uploads/      (temporary upload storage)"
echo "│   └── src/"
echo "├── frontend/"
echo "└── logs/             (PM2 and application logs)"
