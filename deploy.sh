#!/bin/bash

# Deployment script for zip-sync on EC2
echo "🚀 Starting deployment process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Detect current user and set paths accordingly
CURRENT_USER=${USER:-$(whoami)}
if [ "$CURRENT_USER" = "ec2-user" ]; then
    PROJECT_DIR="/home/ec2-user/zip-sync"
elif [ "$CURRENT_USER" = "ubuntu" ]; then
    PROJECT_DIR="/home/ubuntu/zip-sync"
else
    PROJECT_DIR="/home/$CURRENT_USER/zip-sync"
    print_warning "Using custom user path: $PROJECT_DIR"
fi

print_status "Using project directory: $PROJECT_DIR"

# Check if running as ec2-user (optional check)
if [ "$CURRENT_USER" != "ec2-user" ] && [ "$CURRENT_USER" != "ubuntu" ]; then
    print_warning "This script is designed for EC2 instances. Current user: $CURRENT_USER"
    print_warning "Continuing anyway..."
fi

print_status "Setting up directories..."
# Create necessary directories
mkdir -p $PROJECT_DIR/logs
mkdir -p $PROJECT_DIR/backend/uploads
mkdir -p $PROJECT_DIR/backend/projects

print_status "Installing dependencies..."
# Install backend dependencies
cd $PROJECT_DIR/backend
npm install

# Install frontend dependencies
cd $PROJECT_DIR/frontend
npm install

print_status "Building frontend..."
# Build frontend for production
npm run build

print_status "Setting up PM2..."
# Install PM2 if not already installed
if ! command -v pm2 &> /dev/null; then
    print_status "Installing PM2..."
    sudo npm install -g pm2
fi

# Stop existing processes
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

print_status "Starting applications with PM2..."
# Start applications using ecosystem file
cd $PROJECT_DIR
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup

print_status "Setting up Nginx..."
# Install and configure Nginx
sudo yum update -y
sudo yum install -y nginx

# Create Nginx configuration
sudo tee /etc/nginx/conf.d/zip-sync.conf > /dev/null <<EOF
server {
    listen 80;
    server_name 13.203.192.57;

    # Frontend
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Static files
    location /apps {
        proxy_pass http://localhost:5000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

print_status "Configuring firewall..."
# Configure firewall
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload

print_status "Checking application status..."
# Check PM2 status
pm2 status

# Check Nginx status
sudo systemctl status nginx

print_status "Deployment completed successfully!"
print_status "Your application should be available at: http://13.203.192.57"
print_status "Backend API: http://13.203.192.57/api"
print_status "Frontend: http://13.203.192.57"

print_warning "Make sure to:"
print_warning "1. Configure your environment variables"
print_warning "2. Set up your database connection"
print_warning "3. Configure GitHub tokens if needed"
print_warning "4. Set up SSL certificates for production"

echo ""
print_status "Useful PM2 commands:"
echo "  pm2 status          - Check application status"
echo "  pm2 logs            - View logs"
echo "  pm2 restart all     - Restart all applications"
echo "  pm2 stop all        - Stop all applications"
echo "  pm2 monit           - Monitor applications"
