#!/bin/bash

# Setup Local Kubernetes Environment with Docker Desktop
# This script helps configure and validate your local Kubernetes setup

set -e

echo "🚀 Setting up Local Kubernetes Environment with Docker Desktop"
echo "=============================================================="

# Color definitions for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists docker; then
    print_error "Docker is not installed. Please install Docker Desktop first."
    exit 1
fi

if ! command_exists kubectl; then
    print_error "kubectl is not installed. Please install kubectl first."
    exit 1
fi

print_success "Docker and kubectl are installed"

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker Desktop."
    exit 1
fi

print_success "Docker is running"

# Check if Kubernetes is enabled in Docker Desktop
print_status "Checking Kubernetes status..."

if kubectl cluster-info >/dev/null 2>&1; then
    print_success "Kubernetes cluster is accessible"
    
    # Show cluster info
    echo -e "\n${BLUE}Cluster Information:${NC}"
    kubectl cluster-info
    
    # Show nodes
    echo -e "\n${BLUE}Nodes:${NC}"
    kubectl get nodes
    
else
    print_warning "Kubernetes cluster is not accessible"
    echo -e "\n${YELLOW}To enable Kubernetes in Docker Desktop:${NC}"
    echo "1. Open Docker Desktop"
    echo "2. Go to Settings (gear icon)"
    echo "3. Click on 'Kubernetes' in the left sidebar"
    echo "4. Check 'Enable Kubernetes'"
    echo "5. Click 'Apply & Restart'"
    echo "6. Wait for Kubernetes to start (this may take a few minutes)"
    echo ""
    echo "After enabling Kubernetes, run this script again."
    exit 1
fi

# Switch to docker-desktop context if not already
current_context=$(kubectl config current-context 2>/dev/null || echo "none")
if [ "$current_context" != "docker-desktop" ]; then
    print_status "Switching to docker-desktop context..."
    kubectl config use-context docker-desktop
    print_success "Switched to docker-desktop context"
fi

# Verify kubectl is working with the cluster
print_status "Verifying kubectl connectivity..."
kubectl version --client
kubectl get nodes

# Check if ingress controller is needed (for local development)
print_status "Checking for ingress controller..."
if kubectl get ingressclass >/dev/null 2>&1; then
    print_success "Ingress controller is available"
else
    print_warning "No ingress controller found"
    echo "For local development with ingress, you might want to install nginx-ingress:"
    echo "kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml"
fi

# Create namespace if it doesn't exist
print_status "Creating event-booking-system namespace..."
kubectl apply -f k8s/namespace.yaml 2>/dev/null || {
    print_status "Creating namespace manually..."
    kubectl create namespace event-booking-system --dry-run=client -o yaml | kubectl apply -f -
}
print_success "Namespace ready"

# Validate Kubernetes manifests
print_status "Validating Kubernetes manifests..."
for manifest in k8s/*.yaml; do
    if [ -f "$manifest" ]; then
        print_status "Validating $(basename "$manifest")..."
        kubectl apply --dry-run=client -f "$manifest" >/dev/null 2>&1 && {
            print_success "✓ $(basename "$manifest") is valid"
        } || {
            print_error "✗ $(basename "$manifest") has validation errors"
        }
    fi
done

# Check if Docker image exists locally
print_status "Checking for Docker image..."
if docker images | grep -q "nkdhd/event-booking-app"; then
    print_success "Docker image 'nkdhd/event-booking-app' found locally"
else
    print_warning "Docker image 'nkdhd/event-booking-app' not found locally"
    echo "You may need to build the image first:"
    echo "docker build -t nkdhd/event-booking-app:latest ."
fi

echo -e "\n🎉 ${GREEN}Local Kubernetes Environment Setup Complete!${NC}"
echo -e "\n${BLUE}Next steps:${NC}"
echo "1. Build your Docker image: ./scripts/build-image.sh"
echo "2. Deploy to Kubernetes: ./scripts/deploy-local-k8s.sh"
echo "3. Check deployment status: ./scripts/check-k8s-status.sh"

echo -e "\n${BLUE}Useful commands:${NC}"
echo "• Check cluster status: kubectl cluster-info"
echo "• List all pods: kubectl get pods -n event-booking-system"
echo "• View logs: kubectl logs -f deployment/event-booking-app -n event-booking-system"
echo "• Port forward to app: kubectl port-forward service/event-booking-service 3000:80 -n event-booking-system"
