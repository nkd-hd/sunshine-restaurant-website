#!/bin/bash

# Deploy to Local Kubernetes Cluster
# This script deploys your event booking application to the local Kubernetes cluster

set -e

echo "☸️  Deploying to Local Kubernetes Cluster"
echo "=========================================="

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
NAMESPACE="event-booking-system"
APP_NAME="event-booking-app"
SERVICE_NAME="event-booking-service"

# Function to wait for deployment to be ready
wait_for_deployment() {
    local deployment_name=$1
    local namespace=$2
    local timeout=${3:-300}
    
    print_status "Waiting for deployment ${deployment_name} to be ready..."
    
    if kubectl wait --for=condition=available deployment/${deployment_name} -n ${namespace} --timeout=${timeout}s; then
        print_success "Deployment ${deployment_name} is ready"
        return 0
    else
        print_error "Deployment ${deployment_name} failed to become ready within ${timeout} seconds"
        return 1
    fi
}

# Check if kubectl is available and cluster is accessible
if ! kubectl cluster-info >/dev/null 2>&1; then
    print_error "Kubernetes cluster is not accessible"
    print_error "Run './scripts/setup-local-k8s.sh' first to set up your local cluster"
    exit 1
fi

print_success "Kubernetes cluster is accessible"

# Check if we're using the correct context
current_context=$(kubectl config current-context)
if [ "$current_context" != "docker-desktop" ]; then
    print_warning "Current context is '${current_context}', not 'docker-desktop'"
    print_status "Switching to docker-desktop context..."
    kubectl config use-context docker-desktop
fi

# Check if the Docker image exists
IMAGE_NAME="nkdhd/event-booking-app:multi-arch"
if ! docker images | grep -q "nkdhd/event-booking-app"; then
    print_error "Docker image not found locally"
    print_error "Run './scripts/build-image.sh' first to build the image"
    exit 1
fi

print_success "Docker image found: ${IMAGE_NAME}"

# Create namespace if it doesn't exist
print_status "Ensuring namespace exists..."
kubectl apply -f k8s/namespace.yaml

# Apply secrets first (they're needed by the deployment)
if [ -f "k8s/secret.yaml" ]; then
    print_status "Applying secrets..."
    kubectl apply -f k8s/secret.yaml
    print_success "Secrets applied"
else
    print_warning "No secret.yaml found - you may need to create secrets manually"
fi

# Apply ConfigMap
if [ -f "k8s/configmap.yaml" ]; then
    print_status "Applying ConfigMap..."
    kubectl apply -f k8s/configmap.yaml
    print_success "ConfigMap applied"
fi

# Deploy MySQL (if specified)
if [ -f "k8s/mysql-deployment.yaml" ]; then
    print_status "Deploying MySQL..."
    kubectl apply -f k8s/mysql-deployment.yaml
    print_success "MySQL deployment applied"
    
    # Wait for MySQL to be ready
    print_status "Waiting for MySQL to be ready..."
    kubectl wait --for=condition=available deployment/mysql -n ${NAMESPACE} --timeout=300s || {
        print_warning "MySQL deployment is taking longer than expected"
    }
fi

# Apply main application deployment
print_status "Deploying application..."
kubectl apply -f k8s/deployment.yaml
print_success "Application deployment applied"

# Apply service
print_status "Creating service..."
kubectl apply -f k8s/service.yaml
print_success "Service applied"

# Apply ingress if it exists
if [ -f "k8s/ingress.yaml" ]; then
    print_status "Applying ingress..."
    kubectl apply -f k8s/ingress.yaml
    print_success "Ingress applied"
fi

# Apply HPA if it exists
if [ -f "k8s/hpa.yaml" ]; then
    print_status "Applying Horizontal Pod Autoscaler..."
    kubectl apply -f k8s/hpa.yaml
    print_success "HPA applied"
fi

# Apply ServiceMonitor if it exists (for Prometheus monitoring)
if [ -f "k8s/servicemonitor.yaml" ]; then
    print_status "Applying ServiceMonitor..."
    kubectl apply -f k8s/servicemonitor.yaml
    print_success "ServiceMonitor applied"
fi

# Wait for deployment to be ready
wait_for_deployment ${APP_NAME} ${NAMESPACE}

# Show deployment status
echo -e "\n${BLUE}Deployment Status:${NC}"
kubectl get deployments -n ${NAMESPACE}

echo -e "\n${BLUE}Pods:${NC}"
kubectl get pods -n ${NAMESPACE}

echo -e "\n${BLUE}Services:${NC}"
kubectl get services -n ${NAMESPACE}

# Get service details for port forwarding
SERVICE_PORT=$(kubectl get service ${SERVICE_NAME} -n ${NAMESPACE} -o jsonpath='{.spec.ports[0].port}')
TARGET_PORT=$(kubectl get service ${SERVICE_NAME} -n ${NAMESPACE} -o jsonpath='{.spec.ports[0].targetPort}')

echo -e "\n🎉 ${GREEN}Deployment Complete!${NC}"

echo -e "\n${BLUE}Access your application:${NC}"
echo "• Port forward: kubectl port-forward service/${SERVICE_NAME} 3000:${SERVICE_PORT} -n ${NAMESPACE}"
echo "• Then visit: http://localhost:3000"

echo -e "\n${BLUE}Useful commands:${NC}"
echo "• Check pods: kubectl get pods -n ${NAMESPACE}"
echo "• View logs: kubectl logs -f deployment/${APP_NAME} -n ${NAMESPACE}"
echo "• Scale deployment: kubectl scale deployment ${APP_NAME} --replicas=3 -n ${NAMESPACE}"
echo "• Delete deployment: kubectl delete -f k8s/ -n ${NAMESPACE}"

echo -e "\n${BLUE}Monitoring:${NC}"
echo "• Pod status: ./scripts/check-k8s-status.sh"
echo "• Application logs: kubectl logs -f deployment/${APP_NAME} -n ${NAMESPACE}"

# Start port forwarding in background if requested
if [ "$1" = "--port-forward" ]; then
    print_status "Starting port forwarding to localhost:3000..."
    kubectl port-forward service/${SERVICE_NAME} 3000:${SERVICE_PORT} -n ${NAMESPACE} &
    PORT_FORWARD_PID=$!
    echo "Port forwarding started (PID: ${PORT_FORWARD_PID})"
    echo "Visit http://localhost:3000 to access your application"
    echo "Press Ctrl+C to stop port forwarding"
    wait $PORT_FORWARD_PID
fi
