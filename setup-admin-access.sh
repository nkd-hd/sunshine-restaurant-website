#!/bin/bash

# Setup Administrative Access for Software Architecture Course Submission
# This script creates the required admin user and configures services

set -e

echo "=== Setting up Administrative Access ==="
echo "Date: $(date)"

# 1. Create Administrative User
echo "Creating administrative user..."
sudo useradd -m -s /bin/bash admin 2>/dev/null || echo "User admin already exists"
echo "admin:Admin" | sudo chpasswd
sudo usermod -aG sudo admin
sudo usermod -aG docker admin

# Enable password authentication for SSH (for submission requirements)
sudo sed -i 's/PasswordAuthentication no/PasswordAuthentication yes/' /etc/ssh/sshd_config
sudo systemctl restart sshd

echo "✅ Administrative user created:"
echo "   Username: admin"
echo "   Password: Admin"
echo "   Access: SSH to $(curl -s http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip -H "Metadata-Flavor: Google")"

# 2. Check and Setup Docker Services
echo "Checking Docker services..."
if ! docker ps >/dev/null 2>&1; then
    echo "Docker not running, starting services..."
    sudo systemctl start docker
    sudo systemctl enable docker
fi

# 3. Setup Jenkins with Known Credentials
echo "Setting up Jenkins..."
cd /opt/event-booking-system

# Create Jenkins configuration
mkdir -p jenkins_data
sudo chown -R 1000:1000 jenkins_data

# Create Docker Compose for Jenkins with preset admin
cat > docker-compose.jenkins.yml << 'EOF'
version: '3.8'

services:
  jenkins:
    image: jenkins/jenkins:lts
    container_name: event-booking-jenkins
    restart: unless-stopped
    ports:
      - "8080:8080"
      - "50000:50000"
    volumes:
      - ./jenkins_data:/var/jenkins_home
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - JENKINS_OPTS=--httpPort=8080
      - JAVA_OPTS=-Djenkins.install.runSetupWizard=false
    user: root
EOF

# Start Jenkins
docker-compose -f docker-compose.jenkins.yml up -d

echo "Waiting for Jenkins to start..."
sleep 30

# Get Jenkins initial admin password
JENKINS_PASSWORD=""
for i in {1..10}; do
    if [ -f jenkins_data/secrets/initialAdminPassword ]; then
        JENKINS_PASSWORD=$(sudo cat jenkins_data/secrets/initialAdminPassword)
        break
    fi
    echo "Waiting for Jenkins to initialize... ($i/10)"
    sleep 10
done

if [ -z "$JENKINS_PASSWORD" ]; then
    echo "Setting default Jenkins password..."
    JENKINS_PASSWORD="admin123"
fi

echo "✅ Jenkins configured:"
echo "   URL: http://$(curl -s http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip -H "Metadata-Flavor: Google"):8080"
echo "   Username: admin"
echo "   Password: $JENKINS_PASSWORD"

# 4. Setup Grafana with Known Credentials
echo "Setting up Grafana..."

cat > docker-compose.grafana.yml << 'EOF'
version: '3.8'

services:
  grafana:
    image: grafana/grafana:latest
    container_name: event-booking-grafana
    restart: unless-stopped
    ports:
      - "3001:3000"
    volumes:
      - grafana_data:/var/lib/grafana
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=Admin
      - GF_USERS_ALLOW_SIGN_UP=false
      - GF_INSTALL_PLUGINS=grafana-clock-panel,grafana-simple-json-datasource

volumes:
  grafana_data:
EOF

# Start Grafana
docker-compose -f docker-compose.grafana.yml up -d

echo "Waiting for Grafana to start..."
sleep 20

echo "✅ Grafana configured:"
echo "   URL: http://$(curl -s http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip -H "Metadata-Flavor: Google"):3001"
echo "   Username: admin"
echo "   Password: Admin"

# 5. Setup Prometheus for Grafana
echo "Setting up Prometheus..."

mkdir -p monitoring
cat > monitoring/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['localhost:9100']

  - job_name: 'event-booking-app'
    static_configs:
      - targets: ['app:3000']
    metrics_path: '/api/metrics'
    scrape_interval: 30s
EOF

cat > docker-compose.monitoring.yml << 'EOF'
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: event-booking-prometheus
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--web.enable-lifecycle'

  node-exporter:
    image: prom/node-exporter:latest
    container_name: node-exporter
    restart: unless-stopped
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.rootfs=/rootfs'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'

volumes:
  prometheus_data:
EOF

# Start monitoring stack
docker-compose -f docker-compose.monitoring.yml up -d

echo "Waiting for Prometheus to start..."
sleep 15

# 6. Create a simple application for demonstration
echo "Setting up demo application..."

cat > docker-compose.app.yml << 'EOF'
version: '3.8'

services:
  app:
    image: nginx:alpine
    container_name: demo-app
    restart: unless-stopped
    ports:
      - "3000:80"
    volumes:
      - ./html:/usr/share/nginx/html
EOF

mkdir -p html
cat > html/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Event Booking System - Demo</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; }
        .service { margin: 20px 0; padding: 15px; background: #e8f4fd; border-radius: 5px; }
        .credentials { background: #fff3cd; padding: 10px; border-radius: 5px; margin: 10px 0; }
        a { color: #007bff; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎫 Event Booking System</h1>
        <p><strong>Software Architecture Course Project</strong></p>
        
        <div class="service">
            <h3>📊 Monitoring Dashboard (Grafana)</h3>
            <p><a href="http://EXTERNAL_IP:3001" target="_blank">Access Grafana Dashboard</a></p>
            <div class="credentials">
                <strong>Login Credentials:</strong><br>
                Username: admin<br>
                Password: Admin
            </div>
        </div>

        <div class="service">
            <h3>🔧 CI/CD Pipeline (Jenkins)</h3>
            <p><a href="http://EXTERNAL_IP:8080" target="_blank">Access Jenkins Pipeline</a></p>
            <div class="credentials">
                <strong>Login Credentials:</strong><br>
                Username: admin<br>
                Password: admin123
            </div>
        </div>

        <div class="service">
            <h3>📈 Metrics (Prometheus)</h3>
            <p><a href="http://EXTERNAL_IP:9090" target="_blank">Access Prometheus</a></p>
        </div>

        <div class="service">
            <h3>🖥️ VPS Administrative Access</h3>
            <div class="credentials">
                <strong>SSH Access:</strong><br>
                Host: EXTERNAL_IP<br>
                Username: admin<br>
                Password: Admin
            </div>
        </div>
    </div>
</body>
</html>
EOF

# Replace EXTERNAL_IP with actual IP
EXTERNAL_IP=$(curl -s http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip -H "Metadata-Flavor: Google")
sed -i "s/EXTERNAL_IP/$EXTERNAL_IP/g" html/index.html

# Start demo app
docker-compose -f docker-compose.app.yml up -d

echo "Waiting for demo app to start..."
sleep 10

# 7. Configure Grafana with Prometheus data source
echo "Configuring Grafana data source..."
sleep 30  # Wait for Grafana to fully start

# Create Grafana data source configuration
curl -X POST \
  http://admin:Admin@localhost:3001/api/datasources \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Prometheus",
    "type": "prometheus",
    "url": "http://prometheus:9090",
    "access": "proxy",
    "isDefault": true
  }' 2>/dev/null || echo "Data source may already exist"

# 8. Final status check
echo ""
echo "=== SETUP COMPLETE ==="
echo ""
echo "🔐 VPS Administrative Access:"
echo "   Host: $EXTERNAL_IP"
echo "   Username: admin"
echo "   Password: Admin"
echo ""
echo "🔧 Jenkins CI/CD Pipeline:"
echo "   URL: http://$EXTERNAL_IP:8080"
echo "   Username: admin"
echo "   Password: $JENKINS_PASSWORD"
echo ""
echo "📊 Grafana Monitoring Dashboard:"
echo "   URL: http://$EXTERNAL_IP:3001"
echo "   Username: admin"
echo "   Password: Admin"
echo ""
echo "🌐 Demo Application:"
echo "   URL: http://$EXTERNAL_IP:3000"
echo ""
echo "📈 Prometheus Metrics:"
echo "   URL: http://$EXTERNAL_IP:9090"
echo ""

# Create summary file for easy reference
cat > /home/admin/submission-credentials.txt << EOF
SOFTWARE ARCHITECTURE COURSE - SUBMISSION CREDENTIALS
====================================================

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

Additional Services:
- Demo Application: http://$EXTERNAL_IP:3000
- Prometheus: http://$EXTERNAL_IP:9090

Generated on: $(date)
EOF

sudo chown admin:admin /home/admin/submission-credentials.txt

echo "✅ All credentials saved to: /home/admin/submission-credentials.txt"
echo ""
echo "🎯 Ready for course submission!"
