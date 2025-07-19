#!/bin/bash

# Event Booking System - VM Startup Script
# This script runs when the VM instance starts up

set -e  # Exit on any error

# Variables passed from Terraform
MYSQL_ROOT_PASSWORD="${mysql_root_password}"
MYSQL_APP_PASSWORD="${mysql_app_password}"
AUTH_SECRET="${auth_secret}"
DOMAIN_NAME="${domain_name}"
DOCKER_IMAGE="${docker_image}"

# Log all output
exec > >(tee /var/log/startup-script.log)
exec 2>&1

echo "=== Event Booking System VM Startup Script ==="
echo "Starting at: $(date)"

# Update system packages
echo "Updating system packages..."
apt-get update -y
apt-get upgrade -y

# Install essential packages
echo "Installing essential packages..."
apt-get install -y \
    curl \
    wget \
    git \
    vim \
    htop \
    unzip \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release

# Install Docker
echo "Installing Docker..."
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Install Docker Compose (standalone)
echo "Installing Docker Compose..."
DOCKER_COMPOSE_VERSION="2.24.0"
curl -L "https://github.com/docker/compose/releases/download/v${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Start and enable Docker
systemctl start docker
systemctl enable docker

# Add ubuntu user to docker group
usermod -aG docker ubuntu

# Install Node.js (for health checks and utilities)
echo "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Install Nginx
echo "Installing Nginx..."
apt-get install -y nginx

# Configure UFW firewall
echo "Configuring firewall..."
ufw --force enable
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw allow 3000/tcp  # Application
ufw allow 8080/tcp  # Jenkins
ufw allow 9090/tcp  # Prometheus
ufw allow 3001/tcp  # Grafana

# Create application directory
echo "Setting up application directory..."
mkdir -p /opt/event-booking-system
cd /opt/event-booking-system

# Create environment file
echo "Creating environment configuration..."
cat > .env.production << EOF
# Production Environment Configuration
NODE_ENV=production
DATABASE_URL=mysql://app_user:${MYSQL_APP_PASSWORD}@mysql:3306/event_booking
AUTH_SECRET=${AUTH_SECRET}
NEXTAUTH_URL=http://$(curl -s http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip -H "Metadata-Flavor: Google"):3000
SKIP_ENV_VALIDATION=1
NEXT_TELEMETRY_DISABLED=1
PORT=3000
HOSTNAME=0.0.0.0

# MySQL Configuration
MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
MYSQL_DATABASE=event_booking
MYSQL_USER=app_user
MYSQL_PASSWORD=${MYSQL_APP_PASSWORD}
EOF

# Create Docker Compose configuration
echo "Creating Docker Compose configuration..."
cat > docker-compose.prod.yml << 'EOF'
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: event-booking-mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_DATABASE}
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - event-booking-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 20s
      retries: 10

  app:
    image: nkdhd/event-booking-app:latest
    container_name: event-booking-app
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - AUTH_SECRET=${AUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - SKIP_ENV_VALIDATION=1
      - NEXT_TELEMETRY_DISABLED=1
      - PORT=3000
      - HOSTNAME=0.0.0.0
    depends_on:
      mysql:
        condition: service_healthy
    networks:
      - event-booking-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

  jenkins:
    image: jenkins/jenkins:lts
    container_name: event-booking-jenkins
    restart: unless-stopped
    ports:
      - "8080:8080"
      - "50000:50000"
    volumes:
      - jenkins_data:/var/jenkins_home
      - /var/run/docker.sock:/var/run/docker.sock
    networks:
      - event-booking-network
    environment:
      - JENKINS_OPTS=--httpPort=8080

  prometheus:
    image: prom/prometheus:latest
    container_name: event-booking-prometheus
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - prometheus_data:/prometheus
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
    networks:
      - event-booking-network
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'

  grafana:
    image: grafana/grafana:latest
    container_name: event-booking-grafana
    restart: unless-stopped
    ports:
      - "3001:3000"
    volumes:
      - grafana_data:/var/lib/grafana
    networks:
      - event-booking-network
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin123

volumes:
  mysql_data:
  jenkins_data:
  prometheus_data:
  grafana_data:

networks:
  event-booking-network:
    driver: bridge
EOF

# Create monitoring configuration directory
mkdir -p monitoring
cat > monitoring/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'event-booking-app'
    static_configs:
      - targets: ['app:3000']
    metrics_path: '/api/metrics'

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['localhost:9100']
EOF

# Configure Nginx reverse proxy
echo "Configuring Nginx..."
cat > /etc/nginx/sites-available/event-booking << 'EOF'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /jenkins {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /grafana {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/event-booking /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
nginx -t && systemctl reload nginx

# Pull Docker images
echo "Pulling Docker images..."
docker pull mysql:8.0
docker pull ${DOCKER_IMAGE}
docker pull jenkins/jenkins:lts
docker pull prom/prometheus:latest
docker pull grafana/grafana:latest

# Start the application stack
echo "Starting application stack..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 60

# Check service health
echo "Checking service health..."
docker-compose -f docker-compose.prod.yml ps

# Create a simple health check script
cat > /usr/local/bin/health-check.sh << 'EOF'
#!/bin/bash
echo "=== Event Booking System Health Check ==="
echo "Date: $(date)"
echo ""

echo "Docker containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

echo "Application health:"
curl -s http://localhost:3000/api/health || echo "Application not responding"
echo ""

echo "Disk usage:"
df -h /
echo ""

echo "Memory usage:"
free -h
echo ""
EOF

chmod +x /usr/local/bin/health-check.sh

# Set up log rotation
cat > /etc/logrotate.d/event-booking << 'EOF'
/var/log/startup-script.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
}
EOF

# Create a startup completion marker
touch /var/log/startup-complete
echo "Startup script completed at: $(date)" >> /var/log/startup-complete

echo "=== Startup script completed successfully ==="
echo "Application should be available at: http://$(curl -s http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip -H "Metadata-Flavor: Google"):3000"
echo "Jenkins available at: http://$(curl -s http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip -H "Metadata-Flavor: Google"):8080"
echo "Grafana available at: http://$(curl -s http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip -H "Metadata-Flavor: Google"):3001"
