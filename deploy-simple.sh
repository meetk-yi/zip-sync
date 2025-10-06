#!/bin/bash

# Simple deployment script for zip-sync
echo "🚀 Starting simple deployment process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Get current directory
PROJECT_DIR=$(pwd)
print_status "Using project directory: $PROJECT_DIR"

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    print_error "Please run this script from the zip-sync project root directory"
    exit 1
fi

# Check if the correct server file exists
if [ ! -f "backend/src/server.js" ]; then
    print_error "Backend server file not found at backend/src/server.js"
    exit 1
fi

print_status "Setting up directories..."
# Create necessary directories
mkdir -p logs
mkdir -p backend/uploads
mkdir -p backend/projects
mkdir -p backend/backend/projects

print_status "Installing dependencies..."
# Install backend dependencies
if [ -d "backend" ]; then
    print_status "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
else
    print_warning "Backend directory not found, skipping backend setup"
fi

# Install frontend dependencies
if [ -d "frontend" ]; then
    print_status "Installing frontend dependencies..."
    cd frontend
    npm install
    print_status "Building frontend..."
    npm run build
    cd ..
else
    print_warning "Frontend directory not found, skipping frontend setup"
fi

print_status "Setting up PM2..."
# Install PM2 if not already installed
if ! command -v pm2 &> /dev/null; then
    print_status "Installing PM2..."
    sudo npm install -g pm2
fi

print_status "Installing build tools..."
# Install Vite globally to prevent build issues
if ! command -v vite &> /dev/null; then
    print_status "Installing Vite globally..."
    sudo npm install -g vite
fi

# Install additional build tools
print_status "Installing additional build tools..."
sudo npm install -g @vitejs/plugin-react terser esbuild

# Stop existing processes
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

print_status "Starting applications with PM2..."
# Start applications using ecosystem file
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup

print_status "Checking application status..."
# Check PM2 status
pm2 status

print_status "Deployment completed successfully!"
print_status "Your application should be available at:"
print_status "  Backend: http://13.203.192.57:5000"
print_status "  Frontend: http://13.203.192.57:5173"
print_status "  API Endpoint: http://13.203.192.57:5000/api"

print_warning "Make sure to:"
print_warning "1. Configure your environment variables"
print_warning "2. Set up your database connection"
print_warning "3. Configure GitHub tokens if needed"

echo ""
print_status "Useful PM2 commands:"
echo "  pm2 status          - Check application status"
echo "  pm2 logs            - View logs"
echo "  pm2 restart all     - Restart all applications"
echo "  pm2 stop all        - Stop all applications"
echo "  pm2 monit           - Monitor applications"
