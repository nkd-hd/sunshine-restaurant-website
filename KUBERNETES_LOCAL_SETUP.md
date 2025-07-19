# Local Kubernetes Setup Guide

This guide will help you set up and deploy your Event Booking System to a local Kubernetes cluster using Docker Desktop.

## Prerequisites

1. **Docker Desktop** - Download and install from [docker.com](https://www.docker.com/products/docker-desktop)
2. **kubectl** - Should be included with Docker Desktop
3. **Enable Kubernetes in Docker Desktop**:
   - Open Docker Desktop
   - Go to Settings (gear icon)
   - Click "Kubernetes" in the left sidebar
   - Check "Enable Kubernetes"
   - Click "Apply & Restart"
   - Wait for Kubernetes to start (may take a few minutes)

## Quick Start

### Option 1: Complete Automated Setup
```bash
# Run the complete setup (builds image and deploys everything)
./scripts/deploy-complete-local-k8s.sh

# Or with automatic port forwarding
./scripts/deploy-complete-local-k8s.sh false true
```

### Option 2: Step-by-Step Setup

1. **Setup Kubernetes Environment**
   ```bash
   ./scripts/setup-local-k8s.sh
   ```

2. **Build Docker Image**
   ```bash
   ./scripts/build-image.sh
   ```

3. **Deploy to Kubernetes**
   ```bash
   ./scripts/deploy-local-k8s.sh
   ```

4. **Check Deployment Status**
   ```bash
   ./scripts/check-k8s-status.sh
   ```

## Accessing Your Application

After deployment, access your application using port forwarding:

```bash
# Forward traffic from localhost:3000 to the service
kubectl port-forward service/event-booking-service 3000:80 -n event-booking-system

# Then visit http://localhost:3000
```

## Available Scripts

| Script | Purpose |
|--------|---------|
| `setup-local-k8s.sh` | Validates and sets up local Kubernetes environment |
| `build-image.sh` | Builds the Docker image for your application |
| `deploy-local-k8s.sh` | Deploys all Kubernetes resources |
| `check-k8s-status.sh` | Comprehensive status check of your deployment |
| `deploy-complete-local-k8s.sh` | Orchestrates the entire setup process |

## Common Operations

### Check Application Status
```bash
# Quick status check
kubectl get pods -n event-booking-system

# Comprehensive status
./scripts/check-k8s-status.sh
```

### View Application Logs
```bash
# Follow logs from all pods
kubectl logs -f deployment/event-booking-app -n event-booking-system

# Logs from a specific pod
kubectl logs -f <pod-name> -n event-booking-system
```

### Scale Your Application
```bash
# Scale to 3 replicas
kubectl scale deployment event-booking-app --replicas=3 -n event-booking-system

# Scale down to 1 replica
kubectl scale deployment event-booking-app --replicas=1 -n event-booking-system
```

### Restart Deployment
```bash
# Restart all pods (useful after making changes)
kubectl rollout restart deployment/event-booking-app -n event-booking-system
```

### Update Application
```bash
# After making code changes:
./scripts/build-image.sh
kubectl rollout restart deployment/event-booking-app -n event-booking-system
```

## Troubleshooting

### Common Issues

1. **Kubernetes not enabled in Docker Desktop**
   - Error: `The connection to the server localhost:8080 was refused`
   - Solution: Enable Kubernetes in Docker Desktop settings

2. **Docker image not found**
   - Error: `ErrImagePull` or `ImagePullBackOff`
   - Solution: Run `./scripts/build-image.sh` to build the image locally

3. **Application not starting**
   - Check pod status: `kubectl describe pods -n event-booking-system`
   - Check logs: `kubectl logs deployment/event-booking-app -n event-booking-system`

4. **Database connection issues**
   - Ensure MySQL pod is running: `kubectl get pods -n event-booking-system`
   - Check MySQL logs: `kubectl logs deployment/mysql -n event-booking-system`

### Debug Commands

```bash
# Describe deployment for detailed status
kubectl describe deployment event-booking-app -n event-booking-system

# Get events sorted by time
kubectl get events -n event-booking-system --sort-by='.lastTimestamp'

# Shell into a running pod
kubectl exec -it deployment/event-booking-app -n event-booking-system -- /bin/sh

# Port forward to specific pod
kubectl port-forward <pod-name> 3000:3000 -n event-booking-system
```

## Cleanup

### Remove Deployment
```bash
# Remove all resources
kubectl delete -f k8s/ -n event-booking-system

# Or remove entire namespace
kubectl delete namespace event-booking-system
```

### Remove Docker Images
```bash
# Remove application image
docker rmi nkdhd/event-booking-app:latest
docker rmi nkdhd/event-booking-app:multi-arch
```

## Kubernetes Resources

Your deployment includes:

- **Namespace**: `event-booking-system`
- **Deployment**: `event-booking-app` (your Next.js application)
- **Service**: `event-booking-service` (exposes your app)
- **ConfigMap**: Application configuration
- **Secret**: Sensitive data (database URLs, auth secrets)
- **MySQL**: Database deployment (if using local MySQL)
- **HPA**: Horizontal Pod Autoscaler (optional)
- **Ingress**: External access (optional, requires ingress controller)

## Next Steps

1. **Set up Ingress** (for external access without port forwarding):
   ```bash
   # Install nginx ingress controller
   kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml
   ```

2. **Enable Monitoring** (optional):
   - Install Prometheus and Grafana
   - Use the ServiceMonitor for application metrics

3. **Persistent Storage** (for production-like setup):
   - Configure PersistentVolumes for MySQL data

## Support

If you encounter issues:

1. Run the status check: `./scripts/check-k8s-status.sh`
2. Check the troubleshooting section above
3. Verify Docker Desktop is running and Kubernetes is enabled
4. Ensure all prerequisites are installed
