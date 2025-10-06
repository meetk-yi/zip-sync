#!/bin/bash

# Environment setup script for zip-sync on EC2
echo "🔧 Setting up environment for zip-sync..."

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

# Update system
print_status "Updating system packages..."
sudo yum update -y

# Install Node.js (if not already installed)
if ! command -v node &> /dev/null; then
    print_status "Installing Node.js..."
    curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
    sudo yum install -y nodejs
fi

# Install Git (if not already installed)
if ! command -v git &> /dev/null; then
    print_status "Installing Git..."
    sudo yum install -y git
fi

# Install PM2 globally
if ! command -v pm2 &> /dev/null; then
    print_status "Installing PM2..."
    sudo npm install -g pm2
fi

# Install other useful tools
print_status "Installing additional tools..."
sudo yum install -y htop nano wget curl

# Create necessary directories
print_status "Creating project directories..."
mkdir -p /home/ec2-user/zip-sync/logs
mkdir -p /home/ec2-user/zip-sync/backend/uploads
mkdir -p /home/ec2-user/zip-sync/backend/projects
mkdir -p /home/ec2-user/zip-sync/backend/backend/projects

# Set proper permissions
print_status "Setting up permissions..."
sudo chown -R ec2-user:ec2-user /home/ec2-user/zip-sync
chmod +x /home/ec2-user/zip-sync/deploy.sh

print_status "Environment setup completed!"
print_warning "Next steps:"
print_warning "1. Upload your project files to /home/ec2-user/zip-sync/"
print_warning "2. Configure your environment variables"
print_warning "3. Run ./deploy.sh to start the application"
