#!/bin/bash

# Docker Push Script for Event Booking System
# This script pushes the Docker image to Docker Hub

set -e

# Configuration
IMAGE_NAME="event-booking-system"
TAG=${1:-latest}
REGISTRY_USER=${DOCKER_REGISTRY_USER:-"your-dockerhub-username"}

echo "🚀 Pushing Docker image to registry..."
echo "Image: ${REGISTRY_USER}/${IMAGE_NAME}:${TAG}"

# Check if user is logged in to Docker Hub
if ! docker info | grep -q "Username"; then
  echo "⚠️  You need to login to Docker Hub first:"
  echo "docker login"
  exit 1
fi

# Push the image
docker push ${REGISTRY_USER}/${IMAGE_NAME}:${TAG}

echo "✅ Docker image pushed successfully!"
echo "Image: ${REGISTRY_USER}/${IMAGE_NAME}:${TAG}"

# Also tag and push as 'latest' if not already latest
if [ "$TAG" != "latest" ]; then
  echo ""
  echo "🏷️  Tagging as latest..."
  docker tag ${REGISTRY_USER}/${IMAGE_NAME}:${TAG} ${REGISTRY_USER}/${IMAGE_NAME}:latest
  docker push ${REGISTRY_USER}/${IMAGE_NAME}:latest
  echo "✅ Latest tag pushed!"
fi

echo ""
echo "🎉 Push complete! Your image is now available at:"
echo "https://hub.docker.com/r/${REGISTRY_USER}/${IMAGE_NAME}"
