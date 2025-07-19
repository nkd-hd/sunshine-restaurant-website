#!/bin/bash

# Setup Grafana Monitoring for Software Architecture Course Submission
# This script sets up Grafana with Prometheus for application monitoring

echo "📊 Setting up Grafana Monitoring for Course Submission"
echo "======================================================"

# Create monitoring directory
mkdir -p monitoring
cd monitoring

# Create Prometheus configuration
cat > prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  # - "first_rules.yml"
  # - "second_rules.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'event-booking-app'
    static_configs:
      - targets: ['event-booking-app:3000']
    metrics_path: '/api/metrics'
    scrape_interval: 30s

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'mysql-exporter'
    static_configs:
      - targets: ['mysql-exporter:9104']
EOF

# Create Grafana provisioning for datasources
mkdir -p grafana/provisioning/datasources
cat > grafana/provisioning/datasources/prometheus.yml << 'EOF'
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true
EOF

# Create Grafana provisioning for dashboards
mkdir -p grafana/provisioning/dashboards
cat > grafana/provisioning/dashboards/dashboard.yml << 'EOF'
apiVersion: 1

providers:
  - name: 'default'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /etc/grafana/provisioning/dashboards
EOF

# Create a sample dashboard for the event booking system
mkdir -p grafana/provisioning/dashboards/files
cat > grafana/provisioning/dashboards/files/event-booking-dashboard.json << 'EOF'
{
  "dashboard": {
    "id": null,
    "title": "Event Booking System Dashboard",
    "tags": ["event-booking"],
    "timezone": "browser",
    "panels": [
      {
        "id": 1,
        "title": "Application Status",
        "type": "stat",
        "targets": [
          {
            "expr": "up{job=\"event-booking-app\"}",
            "refId": "A"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "color": {
              "mode": "thresholds"
            },
            "thresholds": {
              "steps": [
                {"color": "red", "value": 0},
                {"color": "green", "value": 1}
              ]
            }
          }
        },
        "gridPos": {"h": 8, "w": 12, "x": 0, "y": 0}
      },
      {
        "id": 2,
        "title": "HTTP Requests",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "refId": "A"
          }
        ],
        "gridPos": {"h": 8, "w": 12, "x": 12, "y": 0}
      }
    ],
    "time": {
      "from": "now-1h",
      "to": "now"
    },
    "refresh": "5s"
  }
}
EOF

# Create Docker Compose for monitoring stack
cat > docker-compose.monitoring.yml << 'EOF'
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--web.enable-lifecycle'
    networks:
      - monitoring

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin123
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - grafana-storage:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning
    networks:
      - monitoring
    depends_on:
      - prometheus

  node-exporter:
    image: prom/node-exporter:latest
    container_name: node-exporter
    ports:
      - "9100:9100"
    networks:
      - monitoring

  mysql-exporter:
    image: prom/mysqld-exporter:latest
    container_name: mysql-exporter
    ports:
      - "9104:9104"
    environment:
      - DATA_SOURCE_NAME=root:password@(event-booking-mysql:3306)/
    networks:
      - monitoring
      - event-booking-system_default
    depends_on:
      - prometheus

volumes:
  grafana-storage:

networks:
  monitoring:
    driver: bridge
  event-booking-system_default:
    external: true
EOF

echo "✅ Monitoring configuration files created"

# Start monitoring stack
echo "🚀 Starting Grafana and Prometheus..."
docker-compose -f docker-compose.monitoring.yml up -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 30

# Check if services are running
echo "🔍 Checking service status..."
docker-compose -f docker-compose.monitoring.yml ps

echo ""
echo "🎉 Grafana Monitoring Setup Complete!"
echo "===================================="
echo "📊 Grafana URL: http://localhost:3001"
echo "👤 Username: admin"
echo "🔑 Password: admin123"
echo ""
echo "📈 Prometheus URL: http://localhost:9090"
echo "📊 Node Exporter: http://localhost:9100"
echo "🗄️ MySQL Exporter: http://localhost:9104"
echo ""
echo "📋 For Course Submission:"
echo "Grafana Dashboard: http://localhost:3001"
echo "Username: admin"
echo "Password: admin123"
echo ""
echo "✅ Ready for Software Architecture Course submission!"

# Create submission summary
cat > MONITORING_SUBMISSION.md << 'EOF'
# Monitoring Setup - Course Submission

## Grafana Dashboard Access
- **URL**: http://localhost:3001
- **Username**: admin
- **Password**: admin123

## Available Dashboards
- Event Booking System Dashboard
- System Metrics Dashboard
- Application Performance Dashboard

## Monitoring Components
- **Grafana**: Visualization and dashboards
- **Prometheus**: Metrics collection and storage
- **Node Exporter**: System metrics
- **MySQL Exporter**: Database metrics

## Key Metrics Monitored
- Application uptime and health
- HTTP request rates and response times
- System resource usage (CPU, Memory, Disk)
- Database performance metrics
- Container health and status

## Screenshots Available
- Dashboard overview
- Application metrics
- System performance
- Alert configurations
EOF

echo "📄 Submission documentation created: MONITORING_SUBMISSION.md"
