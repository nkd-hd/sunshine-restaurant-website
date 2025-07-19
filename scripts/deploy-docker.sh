#!/bin/bash

# Docker Deployment Script for Event Booking System
# This script deploys the application using Docker Compose

set -e

# Configuration
COMPOSE_FILE=${1:-docker-compose.yml}
ENV_FILE=${2:-.env.production}

echo "🚀 Deploying Event Booking System with Docker..."
echo "Compose file: $COMPOSE_FILE"
echo "Environment file: $ENV_FILE"

# Check if environment file exists
if [ ! -f "$ENV_FILE" ]; then
  echo "❌ Environment file $ENV_FILE not found!"
  echo "Please create it from .env.production.example"
  exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker is not running!"
  exit 1
fi

# Load environment variables
export $(grep -v '^#' $ENV_FILE | xargs)

echo ""
echo "📋 Pre-deployment checks..."

# Check required environment variables
required_vars=("DATABASE_URL" "AUTH_SECRET" "NEXTAUTH_URL")
for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ Required environment variable $var is not set!"
    exit 1
  fi
done

echo "✅ Environment variables validated"

# Stop existing containers
echo ""
echo "🛑 Stopping existing containers..."
docker-compose -f $COMPOSE_FILE down

# Pull latest images
echo ""
echo "📥 Pulling latest images..."
docker-compose -f $COMPOSE_FILE pull

# Start services
echo ""
echo "🚀 Starting services..."
docker-compose -f $COMPOSE_FILE up -d

# Wait for services to be ready
echo ""
echo "⏳ Waiting for services to be ready..."
sleep 30

# Health check
echo ""
echo "🏥 Performing health checks..."

# Check MySQL
if docker-compose -f $COMPOSE_FILE exec mysql mysqladmin ping -h localhost --silent; then
  echo "✅ MySQL is healthy"
else
  echo "❌ MySQL health check failed"
  docker-compose -f $COMPOSE_FILE logs mysql
  exit 1
fi

# Check Application
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
  echo "✅ Application is healthy"
else
  echo "❌ Application health check failed"
  docker-compose -f $COMPOSE_FILE logs app
  exit 1
fi

echo ""
echo "🎉 Deployment successful!"
echo "Application is running at: http://localhost:3000"
echo ""
echo "📊 Container status:"
docker-compose -f $COMPOSE_FILE ps
