#!/bin/bash

# Jenkins Setup Script for Event Booking System
# This script sets up Jenkins with all required plugins and configurations

set -e

echo "🚀 Setting up Jenkins for Event Booking System CI/CD"

# Variables
JENKINS_HOME="/var/jenkins_home"
JENKINS_URL="http://localhost:8080"
JENKINS_USER="admin"
JENKINS_PASSWORD="admin123"

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

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    print_status "Docker is installed"
}

# Check if Docker Compose is installed
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    print_status "Docker Compose is installed"
}

# Create Jenkins directories
create_directories() {
    print_status "Creating Jenkins directories..."
    
    mkdir -p jenkins_home
    mkdir -p jenkins_home/plugins
    mkdir -p jenkins_home/jobs
    mkdir -p jenkins_home/workspace
    
    # Set proper permissions
    sudo chown -R 1000:1000 jenkins_home
    
    print_status "Directories created successfully"
}

# Create Jenkins Docker Compose file
create_docker_compose() {
    print_status "Creating Jenkins Docker Compose configuration..."
    
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
      - ./jenkins_home:/var/jenkins_home
      - /var/run/docker.sock:/var/run/docker.sock
      - /usr/bin/docker:/usr/bin/docker
    environment:
      - JENKINS_OPTS=--httpPort=8080
      - JAVA_OPTS=-Djenkins.install.runSetupWizard=false
    networks:
      - jenkins-network
    user: root

  jenkins-agent:
    image: jenkins/inbound-agent:latest
    container_name: jenkins-agent
    restart: unless-stopped
    environment:
      - JENKINS_URL=http://jenkins:8080
      - JENKINS_AGENT_NAME=docker-agent
      - JENKINS_AGENT_WORKDIR=/home/jenkins/agent
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - /usr/bin/docker:/usr/bin/docker
    networks:
      - jenkins-network
    depends_on:
      - jenkins

networks:
  jenkins-network:
    driver: bridge
EOF

    print_status "Docker Compose file created"
}

# Create Jenkins configuration as code
create_jenkins_config() {
    print_status "Creating Jenkins Configuration as Code..."
    
    mkdir -p jenkins_home/casc_configs
    
    cat > jenkins_home/casc_configs/jenkins.yaml << EOF
jenkins:
  systemMessage: "Event Booking System CI/CD Server"
  numExecutors: 2
  mode: NORMAL
  scmCheckoutRetryCount: 3
  
  securityRealm:
    local:
      allowsSignup: false
      users:
        - id: "admin"
          password: "admin123"
          
  authorizationStrategy:
    globalMatrix:
      permissions:
        - "Overall/Administer:admin"
        - "Overall/Read:authenticated"

  remotingSecurity:
    enabled: true

tool:
  git:
    installations:
      - name: "Default"
        home: "/usr/bin/git"
        
  nodejs:
    installations:
      - name: "NodeJS 18"
        properties:
          - installSource:
              installers:
                - nodeJSInstaller:
                    id: "18.19.0"
                    npmPackagesRefreshHours: 72

  dockerTool:
    installations:
      - name: "Docker"
        home: "/usr/bin/docker"

credentials:
  system:
    domainCredentials:
      - credentials:
          - usernamePassword:
              scope: GLOBAL
              id: "docker-hub-credentials"
              username: "your-docker-username"
              password: "your-docker-password"
              description: "Docker Hub credentials"
          - string:
              scope: GLOBAL
              id: "github-token"
              secret: "your-github-token"
              description: "GitHub Personal Access Token"

unclassified:
  location:
    url: "http://localhost:8080/"
    adminAddress: "admin@example.com"
    
  globalLibraries:
    libraries:
      - name: "shared-library"
        defaultVersion: "main"
        retriever:
          modernSCM:
            scm:
              git:
                remote: "https://github.com/your-username/jenkins-shared-library.git"

jobs:
  - script: |
      pipelineJob('event-booking-system') {
        definition {
          cpsScm {
            scm {
              git {
                remote {
                  url('https://github.com/your-username/event-booking-system.git')
                  credentials('github-token')
                }
                branch('*/main')
              }
            }
            scriptPath('ci-cd/jenkins/Jenkinsfile')
          }
        }
        triggers {
          githubPush()
        }
        properties {
          pipelineTriggers {
            triggers {
              githubPush()
            }
          }
        }
      }
EOF

    print_status "Jenkins Configuration as Code created"
}

# Create plugins list
create_plugins_list() {
    print_status "Creating plugins list..."
    
    cat > jenkins_home/plugins.txt << 'EOF'
# Essential plugins for Event Booking System CI/CD
ant:latest
antisamy-markup-formatter:latest
build-timeout:latest
credentials-binding:latest
timestamper:latest
ws-cleanup:latest
github:latest
github-branch-source:latest
pipeline-github-lib:latest
pipeline-stage-view:latest
git:latest
workflow-aggregator:latest
workflow-job:latest
workflow-cps:latest
pipeline-build-step:latest
pipeline-input-step:latest
pipeline-milestone-step:latest
pipeline-model-api:latest
pipeline-model-definition:latest
pipeline-model-extensions:latest
pipeline-stage-step:latest
pipeline-stage-tags-metadata:latest
docker-workflow:latest
docker-plugin:latest
nodejs:latest
slack:latest
email-ext:latest
mailer:latest
configuration-as-code:latest
job-dsl:latest
blueocean:latest
junit:latest
jacoco:latest
htmlpublisher:latest
cobertura:latest
warnings-ng:latest
checkstyle:latest
pmd:latest
findbugs:latest
sonar:latest
terraform:latest
ansible:latest
kubernetes:latest
google-compute-engine:latest
google-storage-plugin:latest
EOF

    print_status "Plugins list created"
}

# Install Jenkins plugins
install_plugins() {
    print_status "Installing Jenkins plugins..."
    
    # Create plugin installation script
    cat > jenkins_home/install-plugins.sh << 'EOF'
#!/bin/bash
set -e

JENKINS_HOME=/var/jenkins_home
PLUGIN_DIR=$JENKINS_HOME/plugins

# Create plugins directory
mkdir -p $PLUGIN_DIR

# Install plugins from list
while IFS= read -r plugin; do
    if [[ ! $plugin =~ ^#.* ]] && [[ -n $plugin ]]; then
        plugin_name=$(echo $plugin | cut -d':' -f1)
        echo "Installing plugin: $plugin_name"
        jenkins-plugin-cli --plugins $plugin || echo "Failed to install $plugin_name"
    fi
done < $JENKINS_HOME/plugins.txt

echo "Plugin installation completed"
EOF

    chmod +x jenkins_home/install-plugins.sh
    print_status "Plugin installation script created"
}

# Start Jenkins
start_jenkins() {
    print_status "Starting Jenkins..."
    
    docker-compose -f docker-compose.jenkins.yml up -d
    
    print_status "Waiting for Jenkins to start..."
    
    # Wait for Jenkins to be ready
    for i in {1..30}; do
        if curl -s $JENKINS_URL > /dev/null 2>&1; then
            print_status "Jenkins is ready!"
            break
        else
            echo "Waiting for Jenkins... (attempt $i/30)"
            sleep 10
        fi
    done
}

# Get Jenkins initial admin password
get_admin_password() {
    print_status "Getting Jenkins initial admin password..."
    
    # Wait for password file to be created
    sleep 10
    
    if [ -f jenkins_home/secrets/initialAdminPassword ]; then
        INITIAL_PASSWORD=$(cat jenkins_home/secrets/initialAdminPassword)
        print_status "Initial admin password: $INITIAL_PASSWORD"
        echo "Save this password for initial setup!"
    else
        print_warning "Initial admin password file not found. Check Jenkins logs."
    fi
}

# Create Jenkins CLI script
create_jenkins_cli() {
    print_status "Creating Jenkins CLI helper script..."
    
    cat > jenkins-cli.sh << 'EOF'
#!/bin/bash

# Jenkins CLI helper script
JENKINS_URL="http://localhost:8080"
JENKINS_CLI_JAR="jenkins-cli.jar"

# Download Jenkins CLI if not exists
if [ ! -f $JENKINS_CLI_JAR ]; then
    echo "Downloading Jenkins CLI..."
    wget $JENKINS_URL/jnlpJars/jenkins-cli.jar
fi

# Execute Jenkins CLI command
java -jar $JENKINS_CLI_JAR -s $JENKINS_URL -auth admin:admin123 "$@"
EOF

    chmod +x jenkins-cli.sh
    print_status "Jenkins CLI script created"
}

# Create backup script
create_backup_script() {
    print_status "Creating backup script..."
    
    cat > backup-jenkins.sh << 'EOF'
#!/bin/bash

# Jenkins backup script
BACKUP_DIR="./jenkins-backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="jenkins-backup-$TIMESTAMP.tar.gz"

echo "Creating Jenkins backup..."

# Create backup directory
mkdir -p $BACKUP_DIR

# Stop Jenkins
docker-compose -f docker-compose.jenkins.yml stop

# Create backup
tar -czf $BACKUP_DIR/$BACKUP_FILE jenkins_home/

# Start Jenkins
docker-compose -f docker-compose.jenkins.yml start

echo "Backup created: $BACKUP_DIR/$BACKUP_FILE"
EOF

    chmod +x backup-jenkins.sh
    print_status "Backup script created"
}

# Create monitoring script
create_monitoring_script() {
    print_status "Creating monitoring script..."
    
    cat > monitor-jenkins.sh << 'EOF'
#!/bin/bash

# Jenkins monitoring script
JENKINS_URL="http://localhost:8080"

echo "=== Jenkins Status Monitor ==="
echo "Date: $(date)"
echo ""

# Check if Jenkins container is running
if docker ps | grep -q "event-booking-jenkins"; then
    echo "✅ Jenkins container is running"
else
    echo "❌ Jenkins container is not running"
    exit 1
fi

# Check if Jenkins web interface is accessible
if curl -s $JENKINS_URL > /dev/null; then
    echo "✅ Jenkins web interface is accessible"
else
    echo "❌ Jenkins web interface is not accessible"
fi

# Show container stats
echo ""
echo "Container stats:"
docker stats --no-stream event-booking-jenkins

# Show recent logs
echo ""
echo "Recent logs:"
docker logs --tail 10 event-booking-jenkins
EOF

    chmod +x monitor-jenkins.sh
    print_status "Monitoring script created"
}

# Main execution
main() {
    print_status "Starting Jenkins setup for Event Booking System..."
    
    check_docker
    check_docker_compose
    create_directories
    create_docker_compose
    create_jenkins_config
    create_plugins_list
    install_plugins
    create_jenkins_cli
    create_backup_script
    create_monitoring_script
    start_jenkins
    get_admin_password
    
    print_status "Jenkins setup completed!"
    echo ""
    echo "🎉 Jenkins is now running at: $JENKINS_URL"
    echo "👤 Username: admin"
    echo "🔑 Password: admin123 (or use initial admin password shown above)"
    echo ""
    echo "📋 Next steps:"
    echo "1. Open $JENKINS_URL in your browser"
    echo "2. Complete the initial setup wizard"
    echo "3. Configure credentials for Docker Hub and GitHub"
    echo "4. Create your first pipeline job"
    echo ""
    echo "🔧 Useful commands:"
    echo "  ./jenkins-cli.sh help                 # Jenkins CLI help"
    echo "  ./monitor-jenkins.sh                  # Monitor Jenkins status"
    echo "  ./backup-jenkins.sh                   # Backup Jenkins data"
    echo "  docker-compose -f docker-compose.jenkins.yml logs -f  # View logs"
}

# Run main function
main "$@"
