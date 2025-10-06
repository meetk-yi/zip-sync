#!/bin/bash

# Script to test backend connectivity
echo "🔍 Testing backend connectivity..."

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

# Test local connectivity
echo "Testing local connectivity..."
if curl -s http://localhost:5000 > /dev/null; then
    print_status "Backend is running locally on port 5000"
else
    print_error "Backend is not running locally on port 5000"
fi

# Test external connectivity
echo "Testing external connectivity..."
if curl -s http://13.203.192.57:5000 > /dev/null; then
    print_status "Backend is accessible externally at http://13.203.192.57:5000"
else
    print_error "Backend is not accessible externally at http://13.203.192.57:5000"
fi

# Test API endpoint
echo "Testing API endpoint..."
if curl -s http://13.203.192.57:5000/api > /dev/null; then
    print_status "API endpoint is accessible at http://13.203.192.57:5000/api"
else
    print_warning "API endpoint might not be configured or accessible"
fi

# Check if port is listening
echo "Checking if port 5000 is listening..."
if netstat -tlnp 2>/dev/null | grep :5000 > /dev/null; then
    print_status "Port 5000 is listening"
    netstat -tlnp | grep :5000
else
    print_error "Port 5000 is not listening"
fi

# Check firewall status
echo "Checking firewall status..."
if command -v firewall-cmd &> /dev/null; then
    if firewall-cmd --list-ports 2>/dev/null | grep 5000 > /dev/null; then
        print_status "Port 5000 is open in firewall"
    else
        print_warning "Port 5000 might not be open in firewall"
        print_warning "Run: sudo firewall-cmd --permanent --add-port=5000/tcp && sudo firewall-cmd --reload"
    fi
else
    print_warning "firewall-cmd not available, check your security group settings"
fi

echo ""
print_warning "If backend is not accessible:"
print_warning "1. Check EC2 Security Group - ensure port 5000 is open"
print_warning "2. Check if backend is running: pm2 status"
print_warning "3. Check backend logs: pm2 logs zip-sync-backend"
print_warning "4. Restart backend: pm2 restart zip-sync-backend"
