#!/bin/bash

# Deploy Event Booking System to Google Cloud VPS
# This script builds, pushes to GCR, and deploys to your VPS

set -e

echo "🚀 Deploying Event Booking System to Google Cloud VPS"
echo "====================================================="

# Color definitions for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "\n${PURPLE}>>> STEP: $1 <<<${NC}"
}

# Configuration
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
REGION="us-central1"
IMAGE_NAME="event-booking-app"
GCR_IMAGE="gcr.io/${PROJECT_ID}/${IMAGE_NAME}"
VERSION=$(date +%Y%m%d-%H%M%S)
FULL_IMAGE="${GCR_IMAGE}:${VERSION}"
LATEST_IMAGE="${GCR_IMAGE}:latest"

# Get VPS IP
VPS_IP=${1}
if [ -z "$VPS_IP" ]; then
    print_error "VPS IP address required as first argument"
    echo "Usage: $0 <VPS_IP_ADDRESS> [ssh_user]"
    echo "Example: $0 34.123.45.67 admin"
    exit 1
fi

SSH_USER=${2:-"admin"}

print_step "Validating Prerequisites"

# Check if gcloud is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -n1 >/dev/null; then
    print_error "Not authenticated with Google Cloud"
    print_error "Run: gcloud auth login"
    exit 1
fi

print_success "Google Cloud authenticated"

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    print_error "Docker is not running"
    exit 1
fi

print_success "Docker is running"

# Check project configuration
if [ -z "$PROJECT_ID" ]; then
    print_error "No Google Cloud project configured"
    print_error "Run: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

print_success "Project: $PROJECT_ID"

print_step "Building and Tagging Docker Image"

# Build the image with production optimizations
print_status "Building production Docker image..."
docker build \
    --tag "$FULL_IMAGE" \
    --tag "$LATEST_IMAGE" \
    --tag "nkdhd/event-booking-app:latest" \
    --build-arg NODE_ENV=production \
    . || {
    print_error "Docker build failed"
    exit 1
}

print_success "Image built: $FULL_IMAGE"

print_step "Configuring Docker for GCR"

# Configure Docker to use gcloud as credential helper
gcloud auth configure-docker --quiet

print_success "Docker configured for Google Container Registry"

print_step "Pushing Image to Google Container Registry"

# Push both tagged images
print_status "Pushing versioned image: $FULL_IMAGE"
docker push "$FULL_IMAGE"

print_status "Pushing latest image: $LATEST_IMAGE"
docker push "$LATEST_IMAGE"

print_success "Images pushed to Google Container Registry"

print_step "Preparing VPS Deployment Files"

# Create temporary deployment directory
DEPLOY_DIR="./vps-deployment"
mkdir -p "$DEPLOY_DIR"

# Create production environment file
cat > "$DEPLOY_DIR/.env.production" << EOF
# Production Environment Configuration
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
SKIP_ENV_VALIDATION=1
PORT=3000
HOSTNAME=0.0.0.0

# Database Configuration
DATABASE_URL=mysql://app_user:SecurePassword123@mysql:3306/event_booking

# Authentication
AUTH_SECRET=super-secure-auth-secret-change-this-in-production-$(openssl rand -hex 32)
NEXTAUTH_URL=http://${VPS_IP}:3000

# MySQL Configuration
MYSQL_ROOT_PASSWORD=RootPassword123
MYSQL_DATABASE=event_booking
MYSQL_USER=app_user
MYSQL_PASSWORD=SecurePassword123
EOF

# Create Docker Compose file for VPS
cat > "$DEPLOY_DIR/docker-compose.yml" << EOF
version: '3.8'

services:
  app:
    image: ${LATEST_IMAGE}
    container_name: event-booking-app
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=mysql://app_user:SecurePassword123@mysql:3306/event_booking
      - AUTH_SECRET=super-secure-auth-secret-change-this-in-production-$(openssl rand -hex 16)
      - NEXTAUTH_URL=http://${VPS_IP}:3000
      - NEXT_TELEMETRY_DISABLED=1
      - SKIP_ENV_VALIDATION=1
      - PORT=3000
      - HOSTNAME=0.0.0.0
    depends_on:
      mysql:
        condition: service_healthy
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

  mysql:
    image: mysql:8.0
    container_name: event-booking-mysql
    restart: unless-stopped
    ports:
      - "3306:3306"
    environment:
      - MYSQL_ROOT_PASSWORD=RootPassword123
      - MYSQL_DATABASE=event_booking
      - MYSQL_USER=app_user
      - MYSQL_PASSWORD=SecurePassword123
    volumes:
      - mysql_data:/var/lib/mysql
      - ./init-db.sql:/docker-entrypoint-initdb.d/init-db.sql:ro
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p\$\$MYSQL_ROOT_PASSWORD"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s

  nginx:
    image: nginx:alpine
    container_name: event-booking-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    networks:
      - app-network

volumes:
  mysql_data:
    driver: local

networks:
  app-network:
    driver: bridge
EOF

# Create Nginx configuration
cat > "$DEPLOY_DIR/nginx.conf" << EOF
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3000;
    }

    server {
        listen 80;
        server_name ${VPS_IP};

        location / {
            proxy_pass http://app;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }

        location /api/health {
            proxy_pass http://app;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
        }
    }
}
EOF

# Create database initialization script
cat > "$DEPLOY_DIR/init-db.sql" << EOF
-- Event Booking System Database Initialization
-- This script sets up the basic database structure

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS event_booking;
USE event_booking;

-- Set timezone
SET time_zone = '+00:00';

-- Grant privileges to app user
GRANT ALL PRIVILEGES ON event_booking.* TO 'app_user'@'%';
FLUSH PRIVILEGES;

-- Create a simple health check table
CREATE TABLE IF NOT EXISTS health_check (
    id INT AUTO_INCREMENT PRIMARY KEY,
    status VARCHAR(20) DEFAULT 'healthy',
    last_check TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert initial health check record
INSERT INTO health_check (status) VALUES ('healthy') ON DUPLICATE KEY UPDATE last_check = CURRENT_TIMESTAMP;
EOF

# Create deployment script for VPS
cat > "$DEPLOY_DIR/deploy-on-vps.sh" << 'EOF'
#!/bin/bash

echo "🚀 Starting Event Booking System deployment on VPS..."

# Stop existing containers
echo "Stopping existing containers..."
docker-compose down --remove-orphans 2>/dev/null || true

# Pull latest images
echo "Pulling latest images..."
docker-compose pull

# Start services
echo "Starting services..."
docker-compose up -d

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 30

# Check service status
echo "Checking service status..."
docker-compose ps

# Test application health
echo "Testing application health..."
curl -f http://localhost:3000/api/health || echo "Health check will be available shortly..."

echo "✅ Deployment complete!"
echo ""
echo "🌐 Access your application:"
echo "   Main App: http://$(curl -s ifconfig.me):3000"
echo "   Health Check: http://$(curl -s ifconfig.me):3000/api/health"
echo ""
echo "📊 Check logs:"
echo "   docker-compose logs -f app"
echo "   docker-compose logs -f mysql"
EOF

chmod +x "$DEPLOY_DIR/deploy-on-vps.sh"

print_success "Deployment files prepared in $DEPLOY_DIR"

print_step "Transferring Files to VPS"

# Create deployment package
cd "$DEPLOY_DIR"
tar -czf "../deployment-package.tar.gz" .
cd ..

# Copy files to VPS
print_status "Copying deployment package to VPS..."
scp -o StrictHostKeyChecking=no deployment-package.tar.gz "${SSH_USER}@${VPS_IP}:/tmp/" || {
    print_error "Failed to copy files to VPS"
    print_error "Make sure SSH access is configured and the VPS is accessible"
    exit 1
}

print_success "Files copied to VPS"

print_step "Deploying on VPS"

# Execute deployment on VPS
ssh -o StrictHostKeyChecking=no "${SSH_USER}@${VPS_IP}" << 'ENDSSH'
    # Setup deployment directory
    sudo mkdir -p /opt/event-booking-system
    cd /opt/event-booking-system
    
    # Extract deployment package
    sudo tar -xzf /tmp/deployment-package.tar.gz
    sudo chown -R $(whoami):$(whoami) .
    
    # Configure Docker for GCR (if needed)
    echo "Configuring Docker for Google Container Registry..."
    gcloud auth configure-docker --quiet 2>/dev/null || echo "gcloud not available, assuming public image"
    
    # Execute deployment
    chmod +x deploy-on-vps.sh
    ./deploy-on-vps.sh
ENDSSH

if [ $? -eq 0 ]; then
    print_success "Deployment completed successfully!"
else
    print_error "Deployment failed on VPS"
    exit 1
fi

print_step "Deployment Summary"

echo -e "\n🎉 ${GREEN}Event Booking System Successfully Deployed!${NC}"
echo -e "\n${BLUE}📊 Deployment Details:${NC}"
echo "• VPS IP: $VPS_IP"
echo "• Image: $LATEST_IMAGE"
echo "• Version: $VERSION"
echo "• SSH User: $SSH_USER"

echo -e "\n${BLUE}🌐 Access URLs:${NC}"
echo "• Application: http://$VPS_IP:3000"
echo "• Health Check: http://$VPS_IP:3000/api/health"
echo "• Database: $VPS_IP:3306"

echo -e "\n${BLUE}🔧 Management Commands:${NC}"
echo "• SSH to VPS: ssh $SSH_USER@$VPS_IP"
echo "• Check logs: ssh $SSH_USER@$VPS_IP 'cd /opt/event-booking-system && docker-compose logs -f'"
echo "• Restart app: ssh $SSH_USER@$VPS_IP 'cd /opt/event-booking-system && docker-compose restart app'"
echo "• Update app: $0 $VPS_IP $SSH_USER"

echo -e "\n${BLUE}📋 Monitoring:${NC}"
echo "• Container status: ssh $SSH_USER@$VPS_IP 'docker ps'"
echo "• System resources: ssh $SSH_USER@$VPS_IP 'docker stats'"
echo "• Application logs: ssh $SSH_USER@$VPS_IP 'cd /opt/event-booking-system && docker-compose logs app'"

# Cleanup
rm -rf "$DEPLOY_DIR" deployment-package.tar.gz

echo -e "\n${GREEN}✅ Deployment script completed successfully!${NC}"
