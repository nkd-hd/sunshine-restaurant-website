#!/bin/bash

# Deploy Admin Setup to Google Cloud VM
# This script transfers and executes the admin setup on the VM

set -e

echo "=== Deploying Admin Setup to Google Cloud VM ==="

# VM details
VM_NAME="event-booking-vm"
ZONE="us-central1-a"
PROJECT="ordinal-throne-463911-h8"
GCLOUD_PATH="$HOME/google-cloud-sdk/bin/gcloud"

echo "Transferring setup script to VM..."

# Transfer the setup script to the VM
$GCLOUD_PATH compute scp setup-admin-access.sh $VM_NAME:/tmp/setup-admin-access.sh \
  --zone=$ZONE \
  --project=$PROJECT

echo "Making script executable and running setup..."

# Execute the setup script on the VM
$GCLOUD_PATH compute ssh $VM_NAME \
  --zone=$ZONE \
  --project=$PROJECT \
  --command="chmod +x /tmp/setup-admin-access.sh && sudo /tmp/setup-admin-access.sh"

echo ""
echo "=== Getting Final Credentials ==="

# Get the external IP
EXTERNAL_IP=$($GCLOUD_PATH compute instances describe $VM_NAME \
  --zone=$ZONE \
  --project=$PROJECT \
  --format="get(networkInterfaces[0].accessConfigs[0].natIP)")

echo ""
echo "🎯 SUBMISSION CREDENTIALS READY:"
echo ""
echo "1️⃣ VPS Administrative Access:"
echo "   Host: $EXTERNAL_IP"
echo "   Username: admin"
echo "   Password: Admin"
echo ""
echo "2️⃣ Jenkins CI/CD Pipeline:"
echo "   URL: http://$EXTERNAL_IP:8080"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "3️⃣ Grafana Monitoring Dashboard:"
echo "   URL: http://$EXTERNAL_IP:3001"
echo "   Username: admin"
echo "   Password: Admin"
echo ""

# Test connectivity
echo "Testing service connectivity..."
echo "Testing Jenkins..."
curl -s -o /dev/null -w "Jenkins: %{http_code}\n" http://$EXTERNAL_IP:8080 || echo "Jenkins: Not responding yet"

echo "Testing Grafana..."
curl -s -o /dev/null -w "Grafana: %{http_code}\n" http://$EXTERNAL_IP:3001 || echo "Grafana: Not responding yet"

echo "Testing Demo App..."
curl -s -o /dev/null -w "Demo App: %{http_code}\n" http://$EXTERNAL_IP:3000 || echo "Demo App: Not responding yet"

echo ""
echo "✅ Setup complete! Services may take 2-3 minutes to fully start."
echo "📋 Copy the credentials above for your course submission."
