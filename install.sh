#!/bin/bash

# Event Booking System - Kubernetes Installation Script
# Usage: curl -sSL https://your-domain.com/install.sh | bash

set -e

echo "🚀 Installing Event Booking System on Kubernetes..."

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed. Please install kubectl first."
    exit 1
fi

# Check if cluster is accessible
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ Cannot connect to Kubernetes cluster. Please check your kubeconfig."
    exit 1
fi

echo "✅ Kubernetes cluster is accessible"

# Create namespace
echo "📦 Creating namespace..."
kubectl apply -f - <<EOF
apiVersion: v1
kind: Namespace
metadata:
  name: event-booking-system
  labels:
    name: event-booking-system
EOF

# Apply all resources using kustomize
echo "🔧 Deploying Event Booking System..."

# If you have the files in a public repo, use this:
# kubectl apply -k https://github.com/YOUR_USERNAME/event-booking-system/k8s/

# For now, we'll use inline YAML (you can replace this with your GitHub raw links)
kubectl apply -f - <<EOF
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: event-booking-system
  labels:
    app: event-booking-app
data:
  NODE_ENV: "production"
  NEXT_TELEMETRY_DISABLED: "1"
  SKIP_ENV_VALIDATION: "1"
  PORT: "3000"
  HOSTNAME: "0.0.0.0"
EOF

# Add all your other resources here...
# (This is just an example - you'd want to include all your YAML files)

echo "✅ Event Booking System deployed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Check deployment status: kubectl get pods -n event-booking-system"
echo "2. Get service info: kubectl get svc -n event-booking-system"
echo "3. Port forward to access locally: kubectl port-forward -n event-booking-system svc/event-booking-service 8080:80"
echo ""
echo "🌐 Access your application at: http://localhost:8080"
