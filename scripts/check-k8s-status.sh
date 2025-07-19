#!/bin/bash

# Check Kubernetes Deployment Status
# This script provides comprehensive status information about your Kubernetes deployment

set -e

echo "📊 Kubernetes Deployment Status Check"
echo "====================================="

# Color definitions for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
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

print_section() {
    echo -e "\n${PURPLE}=== $1 ===${NC}"
}

# Configuration
NAMESPACE="event-booking-system"
APP_NAME="event-booking-app"
SERVICE_NAME="event-booking-service"

# Check if kubectl is available and cluster is accessible
if ! kubectl cluster-info >/dev/null 2>&1; then
    print_error "Kubernetes cluster is not accessible"
    exit 1
fi

print_success "Connected to Kubernetes cluster"

# Show current context
current_context=$(kubectl config current-context)
print_status "Current context: ${current_context}"

# Check if namespace exists
if kubectl get namespace ${NAMESPACE} >/dev/null 2>&1; then
    print_success "Namespace '${NAMESPACE}' exists"
else
    print_error "Namespace '${NAMESPACE}' does not exist"
    exit 1
fi

print_section "Cluster Information"
kubectl cluster-info

print_section "Nodes"
kubectl get nodes -o wide

print_section "Namespace Resources"
kubectl get all -n ${NAMESPACE}

print_section "Deployments"
kubectl get deployments -n ${NAMESPACE} -o wide

print_section "Pods"
kubectl get pods -n ${NAMESPACE} -o wide

# Check pod status in detail
print_section "Pod Status Details"
pods=$(kubectl get pods -n ${NAMESPACE} -o jsonpath='{.items[*].metadata.name}')

if [ -n "$pods" ]; then
    for pod in $pods; do
        status=$(kubectl get pod $pod -n ${NAMESPACE} -o jsonpath='{.status.phase}')
        ready=$(kubectl get pod $pod -n ${NAMESPACE} -o jsonpath='{.status.containerStatuses[0].ready}')
        
        echo -e "${CYAN}Pod: $pod${NC}"
        echo "  Status: $status"
        echo "  Ready: $ready"
        
        # Show container status if not running
        if [ "$status" != "Running" ] || [ "$ready" != "true" ]; then
            echo "  Container Status:"
            kubectl get pod $pod -n ${NAMESPACE} -o jsonpath='{.status.containerStatuses[*]}' | jq '.' 2>/dev/null || kubectl describe pod $pod -n ${NAMESPACE} | grep -A 10 "Conditions:"
        fi
        echo ""
    done
else
    print_warning "No pods found in namespace ${NAMESPACE}"
fi

print_section "Services"
kubectl get services -n ${NAMESPACE} -o wide

print_section "ConfigMaps"
kubectl get configmaps -n ${NAMESPACE}

print_section "Secrets"
kubectl get secrets -n ${NAMESPACE}

# Check ingress if it exists
if kubectl get ingress -n ${NAMESPACE} >/dev/null 2>&1; then
    print_section "Ingress"
    kubectl get ingress -n ${NAMESPACE} -o wide
fi

# Check HPA if it exists
if kubectl get hpa -n ${NAMESPACE} >/dev/null 2>&1; then
    print_section "Horizontal Pod Autoscaler"
    kubectl get hpa -n ${NAMESPACE}
fi

# Check PVCs if they exist
if kubectl get pvc -n ${NAMESPACE} >/dev/null 2>&1; then
    print_section "Persistent Volume Claims"
    kubectl get pvc -n ${NAMESPACE}
fi

print_section "Resource Usage"
# Check if metrics server is available
if kubectl top nodes >/dev/null 2>&1; then
    echo "Node Resource Usage:"
    kubectl top nodes
    echo ""
    echo "Pod Resource Usage:"
    kubectl top pods -n ${NAMESPACE}
else
    print_warning "Metrics server not available - cannot show resource usage"
fi

print_section "Recent Events"
kubectl get events -n ${NAMESPACE} --sort-by='.lastTimestamp' | tail -10

# Application-specific health checks
print_section "Application Health"

# Check if service is accessible
service_exists=$(kubectl get service ${SERVICE_NAME} -n ${NAMESPACE} >/dev/null 2>&1 && echo "true" || echo "false")

if [ "$service_exists" = "true" ]; then
    SERVICE_PORT=$(kubectl get service ${SERVICE_NAME} -n ${NAMESPACE} -o jsonpath='{.spec.ports[0].port}')
    SERVICE_TYPE=$(kubectl get service ${SERVICE_NAME} -n ${NAMESPACE} -o jsonpath='{.spec.type}')
    
    print_success "Service '${SERVICE_NAME}' found (Type: ${SERVICE_TYPE}, Port: ${SERVICE_PORT})"
    
    # Check if we can reach the health endpoint
    print_status "Testing application health endpoint..."
    
    # Try port-forward temporarily to test health
    kubectl port-forward service/${SERVICE_NAME} 8080:${SERVICE_PORT} -n ${NAMESPACE} >/dev/null 2>&1 &
    PORT_FORWARD_PID=$!
    
    sleep 3
    
    if curl -f http://localhost:8080/api/health >/dev/null 2>&1; then
        print_success "Application health check passed"
    else
        print_warning "Application health check failed (this might be expected if the app is still starting)"
    fi
    
    # Clean up port forward
    kill $PORT_FORWARD_PID >/dev/null 2>&1 || true
    
else
    print_error "Service '${SERVICE_NAME}' not found"
fi

# Summary
print_section "Summary"

deployment_ready=$(kubectl get deployment ${APP_NAME} -n ${NAMESPACE} -o jsonpath='{.status.readyReplicas}' 2>/dev/null || echo "0")
deployment_desired=$(kubectl get deployment ${APP_NAME} -n ${NAMESPACE} -o jsonpath='{.spec.replicas}' 2>/dev/null || echo "0")

if [ "$deployment_ready" = "$deployment_desired" ] && [ "$deployment_ready" != "0" ]; then
    print_success "Deployment is healthy: ${deployment_ready}/${deployment_desired} replicas ready"
else
    print_warning "Deployment status: ${deployment_ready}/${deployment_desired} replicas ready"
fi

echo -e "\n${BLUE}Quick Access Commands:${NC}"
echo "• Access app: kubectl port-forward service/${SERVICE_NAME} 3000:${SERVICE_PORT} -n ${NAMESPACE}"
echo "• View logs: kubectl logs -f deployment/${APP_NAME} -n ${NAMESPACE}"
echo "• Shell into pod: kubectl exec -it deployment/${APP_NAME} -n ${NAMESPACE} -- /bin/sh"
echo "• Scale up: kubectl scale deployment ${APP_NAME} --replicas=5 -n ${NAMESPACE}"
echo "• Scale down: kubectl scale deployment ${APP_NAME} --replicas=1 -n ${NAMESPACE}"

echo -e "\n${BLUE}Troubleshooting Commands:${NC}"
echo "• Describe deployment: kubectl describe deployment ${APP_NAME} -n ${NAMESPACE}"
echo "• Describe pods: kubectl describe pods -n ${NAMESPACE}"
echo "• Get events: kubectl get events -n ${NAMESPACE} --sort-by='.lastTimestamp'"
echo "• Restart deployment: kubectl rollout restart deployment/${APP_NAME} -n ${NAMESPACE}"
