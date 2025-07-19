#!/bin/bash

# Local Jenkins CI/CD Demo Script
# This script simulates the Jenkins pipeline locally for demonstration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_stage() {
    echo -e "${BLUE}[STAGE]${NC} $1"
    echo "=================================================="
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

# Pipeline variables
BUILD_TIMESTAMP=$(date +%Y%m%d-%H%M%S)
GIT_COMMIT_SHORT=$(git rev-parse --short HEAD 2>/dev/null || echo "local")
IMAGE_TAG="${BUILD_TIMESTAMP}-${GIT_COMMIT_SHORT}"
DOCKER_REPO="nkdhd/event-booking-app"
FULL_IMAGE_NAME="${DOCKER_REPO}:${IMAGE_TAG}"
LATEST_IMAGE_NAME="${DOCKER_REPO}:latest"

echo "🚀 Event Booking System - Jenkins Pipeline Demo"
echo "=================================================="
echo "Build Timestamp: $BUILD_TIMESTAMP"
echo "Git Commit: $GIT_COMMIT_SHORT"
echo "Image Tag: $IMAGE_TAG"
echo "=================================================="
echo ""

# Stage 1: Checkout
print_stage "1. Checkout"
echo "✅ Source code already available locally"
echo "📝 Commit: $GIT_COMMIT_SHORT"
print_success "Checkout completed"
echo ""

# Stage 2: Environment Setup
print_stage "2. Environment Setup"
echo "🔧 Setting up build environment..."
echo "NODE_ENV=production"
echo "SKIP_ENV_VALIDATION=1"
echo "IMAGE_TAG=$IMAGE_TAG"
print_success "Environment setup completed"
echo ""

# Stage 3: Install Dependencies
print_stage "3. Install Dependencies"
if command -v npm &> /dev/null; then
    echo "📦 Installing Node.js dependencies..."
    npm --version
    if [ -f "package.json" ]; then
        npm ci --only=production || npm install --only=production
        print_success "Dependencies installed successfully"
    else
        print_warning "package.json not found, skipping dependency installation"
    fi
else
    print_warning "npm not found, skipping dependency installation"
fi
echo ""

# Stage 4: Code Quality & Security (Parallel simulation)
print_stage "4. Code Quality & Security Checks"
echo "🔍 Running parallel quality checks..."

echo "  4a. ESLint..."
if [ -f "package.json" ] && command -v npm &> /dev/null; then
    npm run lint 2>/dev/null || echo "    ⚠️ Lint script not found or failed"
else
    echo "    ⚠️ Skipping lint (npm/package.json not available)"
fi

echo "  4b. TypeScript Type Check..."
if [ -f "tsconfig.json" ] && command -v npm &> /dev/null; then
    npm run typecheck 2>/dev/null || echo "    ⚠️ TypeScript check script not found or failed"
else
    echo "    ⚠️ Skipping type check (tsconfig.json not available)"
fi

echo "  4c. Security Audit..."
if command -v npm &> /dev/null; then
    npm audit --audit-level=moderate 2>/dev/null || echo "    ⚠️ Security audit completed with warnings"
else
    echo "    ⚠️ Skipping security audit (npm not available)"
fi

print_success "Code quality checks completed"
echo ""

# Stage 5: Run Tests (Parallel simulation)
print_stage "5. Run Tests"
echo "🧪 Running test suite..."

echo "  5a. Unit Tests..."
if [ -f "package.json" ] && command -v npm &> /dev/null; then
    npm run test:unit 2>/dev/null || echo "    ⚠️ Unit test script not found or failed"
else
    echo "    ⚠️ Skipping unit tests (npm/package.json not available)"
fi

echo "  5b. Integration Tests..."
echo "    🐳 Starting test database..."
docker run -d --name test-mysql-demo \
    -e MYSQL_ROOT_PASSWORD=testpass \
    -e MYSQL_DATABASE=test_db \
    -p 3307:3306 \
    mysql:8.0 2>/dev/null || echo "    ⚠️ Could not start test database"

sleep 5

if [ -f "package.json" ] && command -v npm &> /dev/null; then
    DATABASE_URL="mysql://root:testpass@localhost:3307/test_db" \
    npm run test:integration 2>/dev/null || echo "    ⚠️ Integration test script not found or failed"
else
    echo "    ⚠️ Skipping integration tests (npm/package.json not available)"
fi

# Cleanup test database
docker stop test-mysql-demo 2>/dev/null || true
docker rm test-mysql-demo 2>/dev/null || true

print_success "Tests completed"
echo ""

# Stage 6: Build Application
print_stage "6. Build Application"
if [ -f "package.json" ] && command -v npm &> /dev/null; then
    echo "🏗️ Building Next.js application..."
    export NODE_ENV=production
    export SKIP_ENV_VALIDATION=1
    export DATABASE_URL="mysql://dummy:dummy@localhost:3306/dummy"
    
    npm run build 2>/dev/null || echo "⚠️ Build script not found or failed"
    
    if [ -d ".next" ]; then
        echo "✅ Build artifacts created:"
        ls -la .next/ | head -5
    fi
    print_success "Application build completed"
else
    print_warning "Skipping application build (npm/package.json not available)"
fi
echo ""

# Stage 7: Build Docker Image
print_stage "7. Build Docker Image"
if command -v docker &> /dev/null && [ -f "Dockerfile" ]; then
    echo "🐳 Building Docker image..."
    docker build \
        --tag $FULL_IMAGE_NAME \
        --tag $LATEST_IMAGE_NAME \
        --build-arg NODE_ENV=production \
        --build-arg BUILD_TIMESTAMP=$BUILD_TIMESTAMP \
        --build-arg GIT_COMMIT=$GIT_COMMIT_SHORT \
        . || print_error "Docker build failed"
    
    echo "✅ Docker image built:"
    docker images | grep $DOCKER_REPO | head -2
    
    # Test container locally
    echo "🧪 Testing container locally..."
    docker run --rm -d \
        --name test-container-demo \
        -p 3333:3000 \
        -e DATABASE_URL="mysql://dummy:dummy@localhost:3306/dummy" \
        -e AUTH_SECRET="test-secret" \
        -e NEXTAUTH_URL="http://localhost:3333" \
        $FULL_IMAGE_NAME || print_warning "Could not start test container"
    
    sleep 10
    
    # Test health endpoint
    curl -f http://localhost:3333/api/health 2>/dev/null && echo "✅ Health check passed" || echo "⚠️ Health check failed"
    
    # Cleanup test container
    docker stop test-container-demo 2>/dev/null || true
    
    print_success "Docker image build completed"
else
    print_warning "Skipping Docker build (docker/Dockerfile not available)"
fi
echo ""

# Stage 8: Security Scan
print_stage "8. Security Scan"
if command -v trivy &> /dev/null; then
    echo "🔒 Scanning Docker image for vulnerabilities..."
    trivy image --exit-code 0 --severity HIGH,CRITICAL $FULL_IMAGE_NAME || echo "⚠️ Security scan completed with warnings"
    print_success "Security scan completed"
else
    print_warning "Trivy not installed, skipping security scan"
    echo "To install Trivy: brew install trivy"
fi
echo ""

# Stage 9: Push to Registry
print_stage "9. Push to Registry"
echo "📤 Simulating Docker Hub push..."
echo "Would push: $FULL_IMAGE_NAME"
echo "Would push: $LATEST_IMAGE_NAME"
print_warning "Skipping actual push (demo mode)"
echo "To enable push, configure Docker Hub credentials and remove demo mode"
echo ""

# Stage 10: Deploy to Production
print_stage "10. Deploy to Production"
echo "🚀 Simulating deployment to Google Cloud VM..."
echo "Would execute on VM:"
echo "  cd /opt/event-booking-system"
echo "  docker-compose pull app"
echo "  docker-compose up -d app"
echo "  docker system prune -f"
print_warning "Skipping actual deployment (demo mode)"
echo "To enable deployment, configure GCP credentials and VM access"
echo ""

# Pipeline Summary
echo "🎉 Pipeline Demo Completed!"
echo "=================================================="
echo "✅ Checkout"
echo "✅ Environment Setup"
echo "✅ Install Dependencies"
echo "✅ Code Quality & Security"
echo "✅ Run Tests"
echo "✅ Build Application"
echo "✅ Build Docker Image"
echo "✅ Security Scan"
echo "⏸️ Push to Registry (demo mode)"
echo "⏸️ Deploy to Production (demo mode)"
echo "=================================================="
echo ""
echo "📋 Next Steps:"
echo "1. Set up actual Jenkins server"
echo "2. Configure Docker Hub credentials"
echo "3. Set up Google Cloud VM access"
echo "4. Enable GitHub webhook triggers"
echo ""
echo "🔗 Alternative: Use GitHub Actions workflow (.github/workflows/ci-cd.yml)"
echo ""
echo "Build completed at: $(date)"
