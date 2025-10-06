#!/bin/bash

# Script to test API endpoints
echo "🔍 Testing API endpoints..."

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

BASE_URL="http://13.203.192.57:5000"

echo "Testing backend at: $BASE_URL"
echo ""

# Test root endpoint
echo "1. Testing root endpoint (/)..."
if response=$(curl -s "$BASE_URL/"); then
    print_status "Root endpoint accessible"
    echo "Response: $response"
else
    print_error "Root endpoint not accessible"
fi
echo ""

# Test health endpoint
echo "2. Testing health endpoint (/health)..."
if response=$(curl -s "$BASE_URL/health"); then
    print_status "Health endpoint accessible"
    echo "Response: $response"
else
    print_error "Health endpoint not accessible"
fi
echo ""

# Test auth endpoints
echo "3. Testing auth endpoints..."
if response=$(curl -s "$BASE_URL/api/auth"); then
    print_status "Auth endpoints accessible"
    echo "Response: $response"
else
    print_warning "Auth endpoints might require authentication"
fi
echo ""

# Test projects endpoints
echo "4. Testing projects endpoints..."
if response=$(curl -s "$BASE_URL/api/projects"); then
    print_status "Projects endpoints accessible"
    echo "Response: $response"
else
    print_warning "Projects endpoints might require authentication"
fi
echo ""

# Test releases endpoints
echo "5. Testing releases endpoints..."
if response=$(curl -s "$BASE_URL/api/releases"); then
    print_status "Releases endpoints accessible"
    echo "Response: $response"
else
    print_warning "Releases endpoints might require authentication"
fi
echo ""

print_status "API testing completed!"
print_warning "If you see 404 errors, the routes might not be properly configured"
print_warning "If you see authentication errors, that's normal for protected endpoints"
