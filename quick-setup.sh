#!/bin/bash
# Quick Setup for Software Architecture Course Submission
# Run this in Google Cloud Console SSH

set -e

echo "🚀 Setting up submission credentials..."

# Create admin user
sudo useradd -m -s /bin/bash admin 2>/dev/null || echo "User exists"
echo "admin:Admin" | sudo chpasswd
sudo usermod -aG sudo,docker admin

# Enable SSH password auth
sudo sed -i 's/PasswordAuthentication no/PasswordAuthentication yes/' /etc/ssh/sshd_config
sudo systemctl restart sshd

# Get external IP
EXTERNAL_IP=$(curl -s http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip -H "Metadata-Flavor: Google")

# Setup working directory
cd /opt/event-booking-system 2>/dev/null || { sudo mkdir -p /opt/event-booking-system && cd /opt/event-booking-system; }

# Jenkins setup
sudo tee docker-compose.jenkins.yml > /dev/null << 'EOF'
version: '3.8'
services:
  jenkins:
    image: jenkins/jenkins:lts
    container_name: jenkins
    ports: ["8080:8080", "50000:50000"]
    volumes: ["jenkins_data:/var/jenkins_home"]
    environment: ["JAVA_OPTS=-Djenkins.install.runSetupWizard=false"]
volumes:
  jenkins_data:
EOF

# Grafana setup
sudo tee docker-compose.grafana.yml > /dev/null << 'EOF'
version: '3.8'
services:
  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports: ["3001:3000"]
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=Admin
    volumes: ["grafana_data:/var/lib/grafana"]
volumes:
  grafana_data:
EOF

# Prometheus setup
sudo mkdir -p monitoring
sudo tee monitoring/prometheus.yml > /dev/null << 'EOF'
global:
  scrape_interval: 15s
scrape_configs:
  - job_name: 'prometheus'
    static_configs: [targets: ['localhost:9090']]
EOF

sudo tee docker-compose.prometheus.yml > /dev/null << 'EOF'
version: '3.8'
services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    ports: ["9090:9090"]
    volumes: ["./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml"]
EOF

# Demo app setup
sudo tee docker-compose.app.yml > /dev/null << 'EOF'
version: '3.8'
services:
  app:
    image: nginx:alpine
    container_name: demo-app
    ports: ["3000:80"]
    volumes: ["./html:/usr/share/nginx/html"]
EOF

sudo mkdir -p html
sudo tee html/index.html > /dev/null << EOF
<!DOCTYPE html>
<html><head><title>Event Booking System</title></head>
<body style="font-family:Arial;margin:40px;background:#f5f5f5">
<div style="background:white;padding:30px;border-radius:8px">
<h1>🎫 Event Booking System - Software Architecture Course</h1>
<div style="margin:20px 0;padding:15px;background:#e8f4fd;border-radius:5px">
<h3>📊 Grafana Dashboard</h3>
<p><a href="http://$EXTERNAL_IP:3001">http://$EXTERNAL_IP:3001</a></p>
<div style="background:#fff3cd;padding:10px;border-radius:5px">
<strong>Login:</strong> admin / Admin
</div></div>
<div style="margin:20px 0;padding:15px;background:#e8f4fd;border-radius:5px">
<h3>🔧 Jenkins Pipeline</h3>
<p><a href="http://$EXTERNAL_IP:8080">http://$EXTERNAL_IP:8080</a></p>
<div style="background:#fff3cd;padding:10px;border-radius:5px">
<strong>Login:</strong> admin / admin123
</div></div>
<div style="margin:20px 0;padding:15px;background:#e8f4fd;border-radius:5px">
<h3>🖥️ VPS Access</h3>
<div style="background:#fff3cd;padding:10px;border-radius:5px">
<strong>SSH:</strong> admin@$EXTERNAL_IP<br>
<strong>Password:</strong> Admin
</div></div>
</div></body></html>
EOF

# Start all services
echo "Starting services..."
sudo docker-compose -f docker-compose.jenkins.yml up -d
sudo docker-compose -f docker-compose.grafana.yml up -d
sudo docker-compose -f docker-compose.prometheus.yml up -d
sudo docker-compose -f docker-compose.app.yml up -d

# Wait for services
echo "Waiting for services to start..."
sleep 60

# Get Jenkins password
JENKINS_PASSWORD=$(sudo docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword 2>/dev/null || echo "admin123")

# Create credentials file
sudo tee /home/admin/credentials.txt > /dev/null << EOF
SOFTWARE ARCHITECTURE COURSE SUBMISSION
=======================================

VPS Administrative Access:
Host: $EXTERNAL_IP
Username: admin
Password: Admin

Jenkins CI/CD Pipeline:
URL: http://$EXTERNAL_IP:8080
Username: admin
Password: $JENKINS_PASSWORD

Grafana Monitoring Dashboard:
URL: http://$EXTERNAL_IP:3001
Username: admin
Password: Admin

Demo Application:
URL: http://$EXTERNAL_IP:3000
EOF

sudo chown admin:admin /home/admin/credentials.txt

echo ""
echo "✅ SETUP COMPLETE!"
echo ""
echo "🔐 VPS Access: admin@$EXTERNAL_IP (Password: Admin)"
echo "🔧 Jenkins: http://$EXTERNAL_IP:8080 (admin/$JENKINS_PASSWORD)"
echo "📊 Grafana: http://$EXTERNAL_IP:3001 (admin/Admin)"
echo "🌐 Demo: http://$EXTERNAL_IP:3000"
echo ""
echo "📋 All credentials saved to: /home/admin/credentials.txt"
echo "🎯 Ready for submission!"
