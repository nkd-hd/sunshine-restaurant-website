#!/bin/bash

# Complete Local Kubernetes Deployment Script
# This script orchestrates the entire process from setup to deployment

set -e

echo "🚀 Complete Local Kubernetes Deployment"
echo "======================================="

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
SKIP_BUILD=${1:-false}
AUTO_PORT_FORWARD=${2:-false}

print_step "Checking Prerequisites"

# Check if required scripts exist
required_scripts=(
    "scripts/setup-local-k8s.sh"
    "scripts/build-image.sh"
    "scripts/deploy-local-k8s.sh"
    "scripts/check-k8s-status.sh"
)

for script in "${required_scripts[@]}"; do
    if [ ! -f "$script" ]; then
        print_error "Required script not found: $script"
        exit 1
    fi
    
    # Make scripts executable
    chmod +x "$script"
done

print_success "All required scripts found and made executable"

print_step "Setting Up Local Kubernetes Environment"

# Run the setup script
./scripts/setup-local-k8s.sh || {
    print_error "Kubernetes setup failed"
    exit 1
}

print_success "Kubernetes environment setup completed"

# Build Docker image unless skipped
if [ "$SKIP_BUILD" != "true" ]; then
    print_step "Building Docker Image"
    
    ./scripts/build-image.sh || {
        print_error "Docker image build failed"
        exit 1
    }
    
    print_success "Docker image build completed"
else
    print_warning "Skipping Docker image build (as requested)"
fi

print_step "Deploying to Kubernetes"

# Deploy to Kubernetes
./scripts/deploy-local-k8s.sh || {
    print_error "Kubernetes deployment failed"
    exit 1
}

print_success "Kubernetes deployment completed"

print_step "Checking Deployment Status"

# Wait a bit for pods to start
sleep 5

# Check status
./scripts/check-k8s-status.sh || {
    print_warning "Status check completed with warnings"
}

print_step "Final Setup"

# Check if we should auto start port forwarding
if [ "$AUTO_PORT_FORWARD" = "true" ]; then
    print_status "Starting automatic port forwarding..."
    
    NAMESPACE="event-booking-system"
    SERVICE_NAME="event-booking-service"
    
    # Get service port
    SERVICE_PORT=$(kubectl get service ${SERVICE_NAME} -n ${NAMESPACE} -o jsonpath='{.spec.ports[0].port}' 2>/dev/null || echo "80")
    
    print_status "Port forwarding ${SERVICE_NAME} to localhost:3000..."
    kubectl port-forward service/${SERVICE_NAME} 3000:${SERVICE_PORT} -n ${NAMESPACE} &
    PORT_FORWARD_PID=$!
    
    echo "Port forwarding started (PID: ${PORT_FORWARD_PID})"
    echo "Your application should be available at: http://localhost:3000"
    echo ""
    echo "Press Ctrl+C to stop port forwarding and exit"
    echo ""
    
    # Wait for interrupt
    trap 'kill $PORT_FORWARD_PID 2>/dev/null || true; echo "Port forwarding stopped"; exit 0' INT
    wait $PORT_FORWARD_PID
else
    # Show manual instructions
    NAMESPACE="event-booking-system"
    SERVICE_NAME="event-booking-service"
    SERVICE_PORT=$(kubectl get service ${SERVICE_NAME} -n ${NAMESPACE} -o jsonpath='{.spec.ports[0].port}' 2>/dev/null || echo "80")
    
    echo -e "\n🎉 ${GREEN}Complete Deployment Successful!${NC}"
    
    echo -e "\n${BLUE}Your application is now running in Kubernetes!${NC}"
    echo -e "\n${BLUE}To access your application:${NC}"
    echo "1. Run: kubectl port-forward service/${SERVICE_NAME} 3000:${SERVICE_PORT} -n ${NAMESPACE}"
    echo "2. Visit: http://localhost:3000"
    
    echo -e "\n${BLUE}Useful commands:${NC}"
    echo "• Check status: ./scripts/check-k8s-status.sh"
    echo "• View logs: kubectl logs -f deployment/event-booking-app -n ${NAMESPACE}"
    echo "• Restart app: kubectl rollout restart deployment/event-booking-app -n ${NAMESPACE}"
    echo "• Scale app: kubectl scale deployment event-booking-app --replicas=3 -n ${NAMESPACE}"
    
    echo -e "\n${BLUE}Cleanup commands:${NC}"
    echo "• Remove deployment: kubectl delete -f k8s/ -n ${NAMESPACE}"
    echo "• Remove namespace: kubectl delete namespace ${NAMESPACE}"
    echo "• Remove Docker image: docker rmi nkdhd/event-booking-app:latest"
    
    echo -e "\n${YELLOW}Next time, you can use these shortcuts:${NC}"
    echo "• Rebuild and deploy: $0 false"
    echo "• Deploy without building: $0 true"
    echo "• Deploy with auto port-forward: $0 false true"
fi
