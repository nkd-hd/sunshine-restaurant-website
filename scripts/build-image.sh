#!/bin/bash

# Build Docker Image for Local Kubernetes Deployment
# This script builds the Docker image for your event booking application

set -e

echo "🐳 Building Docker Image for Local Kubernetes"
echo "=============================================="

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

# Configuration
IMAGE_NAME="nkdhd/event-booking-app"
TAG=${1:-"latest"}
FULL_IMAGE_NAME="${IMAGE_NAME}:${TAG}"

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker Desktop."
    exit 1
fi

print_success "Docker is running"

# Check if Dockerfile exists
if [ ! -f "Dockerfile" ]; then
    print_error "Dockerfile not found in current directory"
    exit 1
fi

print_success "Dockerfile found"

# Show current directory and image info
print_status "Building image: ${FULL_IMAGE_NAME}"
print_status "Build context: $(pwd)"

# Build the Docker image
print_status "Starting Docker build..."
docker build -t "${FULL_IMAGE_NAME}" . || {
    print_error "Docker build failed"
    exit 1
}

print_success "Docker image built successfully: ${FULL_IMAGE_NAME}"

# Also tag as multi-arch (to match your k8s deployment)
if [ "$TAG" = "latest" ]; then
    docker tag "${FULL_IMAGE_NAME}" "${IMAGE_NAME}:multi-arch"
    print_success "Tagged as ${IMAGE_NAME}:multi-arch"
fi

# Show image details
print_status "Image details:"
docker images | grep "${IMAGE_NAME}" | head -5

# Get image size
IMAGE_SIZE=$(docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | grep "${IMAGE_NAME}" | grep "${TAG}" | awk '{print $3}')
print_status "Image size: ${IMAGE_SIZE}"

# Test the image by running a quick container test
print_status "Testing the built image..."
docker run --rm -d --name test-container -p 3001:3000 "${FULL_IMAGE_NAME}" >/dev/null 2>&1 && {
    sleep 3
    if curl -f http://localhost:3001/api/health >/dev/null 2>&1; then
        print_success "Image test passed - application is responding"
    else
        print_warning "Image built but health check failed (this might be expected without database)"
    fi
    docker stop test-container >/dev/null 2>&1
} || {
    print_warning "Could not test image (port might be in use or dependencies missing)"
}

echo -e "\n🎉 ${GREEN}Docker Image Build Complete!${NC}"
echo -e "\n${BLUE}Image Details:${NC}"
echo "• Name: ${FULL_IMAGE_NAME}"
echo "• Size: ${IMAGE_SIZE}"
echo "• Build context: $(pwd)"

echo -e "\n${BLUE}Next steps:${NC}"
echo "1. Deploy to Kubernetes: ./scripts/deploy-local-k8s.sh"
echo "2. Check deployment: ./scripts/check-k8s-status.sh"

echo -e "\n${BLUE}Useful commands:${NC}"
echo "• Run locally: docker run -p 3000:3000 ${FULL_IMAGE_NAME}"
echo "• Push to registry: docker push ${FULL_IMAGE_NAME}"
echo "• Remove image: docker rmi ${FULL_IMAGE_NAME}"
