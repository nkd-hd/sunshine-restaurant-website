#!/bin/bash

# Docker Build Script for Event Booking System
# This script builds the production Docker image

set -e

# Configuration
IMAGE_NAME="event-booking-system"
TAG=${1:-latest}
REGISTRY_USER=${DOCKER_REGISTRY_USER:-"your-dockerhub-username"}

echo "🐳 Building Docker image for Event Booking System..."
echo "Image: ${REGISTRY_USER}/${IMAGE_NAME}:${TAG}"

# Build the image
docker build -t ${REGISTRY_USER}/${IMAGE_NAME}:${TAG} .

echo "✅ Docker image built successfully!"
echo "Image: ${REGISTRY_USER}/${IMAGE_NAME}:${TAG}"

# Optional: Test the image locally
echo ""
echo "🧪 Testing the image locally..."
docker run --rm -d \
  --name event-booking-test \
  -p 3001:3000 \
  -e SKIP_ENV_VALIDATION=1 \
  -e NODE_ENV=production \
  ${REGISTRY_USER}/${IMAGE_NAME}:${TAG}

echo "⏳ Waiting for container to start..."
sleep 10

# Health check
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
  echo "✅ Container health check passed!"
else
  echo "❌ Container health check failed!"
  docker logs event-booking-test
fi

# Clean up test container
docker stop event-booking-test

echo ""
echo "🚀 Build complete! To push to registry:"
echo "docker push ${REGISTRY_USER}/${IMAGE_NAME}:${TAG}"
