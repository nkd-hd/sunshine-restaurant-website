# Event Booking System - Terraform Infrastructure

This directory contains Terraform configuration files for provisioning the Google Cloud infrastructure for the Event Booking System.

## 📋 Overview

The Terraform configuration creates:
- Google Cloud VM instance (e2-micro, free tier eligible)
- VPC network and subnet
- Firewall rules for security
- Static external IP address
- Service account with appropriate permissions
- Cloud Storage bucket for backups
- Optional Cloud DNS zone for custom domain

## 🚀 Quick Start

### Prerequisites

1. **Google Cloud SDK**: Install and configure gcloud CLI
   ```bash
   # Install gcloud CLI
   curl https://sdk.cloud.google.com | bash
   exec -l $SHELL
   
   # Initialize and authenticate
   gcloud init
   gcloud auth application-default login
   ```

2. **Terraform**: Install Terraform CLI
   ```bash
   # macOS
   brew install terraform
   
   # Ubuntu/Debian
   wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
   echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
   sudo apt update && sudo apt install terraform
   ```

3. **SSH Key**: Generate SSH key pair if you don't have one
   ```bash
   ssh-keygen -t rsa -b 4096 -C "your-email@example.com"
   ```

### Deployment Steps

1. **Clone and Navigate**
   ```bash
   cd infrastructure/terraform
   ```

2. **Configure Variables**
   ```bash
   # Copy example variables file
   cp terraform.tfvars.example terraform.tfvars
   
   # Edit with your values
   vim terraform.tfvars
   ```

3. **Initialize Terraform**
   ```bash
   terraform init
   ```

4. **Plan Deployment**
   ```bash
   terraform plan
   ```

5. **Apply Configuration**
   ```bash
   terraform apply
   ```

6. **Get Outputs**
   ```bash
   terraform output
   ```

## 📁 File Structure

```
infrastructure/terraform/
├── main.tf                    # Main infrastructure configuration
├── variables.tf               # Variable definitions
├── outputs.tf                 # Output values
├── terraform.tfvars.example   # Example variables file
├── startup-script.sh          # VM initialization script
└── README.md                  # This file
```

## 🔧 Configuration Files

### main.tf
- VM instance configuration
- Network setup (VPC, subnet, firewall rules)
- Service account and IAM permissions
- Storage bucket for backups
- Optional DNS configuration

### variables.tf
- All configurable parameters
- Default values for quick setup
- Validation rules for inputs
- Documentation for each variable

### outputs.tf
- VM connection information
- Application URLs
- Generated secrets (sensitive)
- Deployment commands

### startup-script.sh
- Automated VM setup script
- Docker and Docker Compose installation
- Application deployment
- Monitoring stack setup
- Nginx reverse proxy configuration

## 🔐 Security Configuration

### Firewall Rules
- SSH (port 22): External access
- HTTP (port 80): External access
- HTTPS (port 443): External access
- Application ports (3000, 8080, 9090, 3001): External access

### Service Account
- Minimal required permissions
- Compute instance admin
- Storage object viewer

### Generated Secrets
- MySQL root password (16 characters)
- MySQL app password (16 characters)
- NextAuth secret (32 characters)

## 🌐 Network Architecture

```
Internet
    ↓
Google Cloud Firewall
    ↓
VPC Network (10.0.1.0/24)
    ↓
VM Instance (e2-micro)
    ↓
Docker Containers
```

## 💰 Cost Estimation

### Free Tier Resources
- **e2-micro VM**: Free (Always Free Tier)
- **30GB Standard Disk**: Free (Always Free Tier)
- **1GB Egress**: Free (Always Free Tier)

### Paid Resources (if exceeding free tier)
- **Additional Storage**: ~$2.00/month
- **Network Egress**: ~$1.00/month
- **Total Estimated**: ~$3.00/month

## 📊 Monitoring and Outputs

After deployment, Terraform outputs provide:

### Connection Information
```bash
# SSH to VM
gcloud compute ssh --zone us-central1-a event-booking-vm --project your-project-id

# Or using external IP
ssh ubuntu@EXTERNAL_IP
```

### Application URLs
- **Main App**: http://EXTERNAL_IP:3000
- **Jenkins**: http://EXTERNAL_IP:8080
- **Grafana**: http://EXTERNAL_IP:3001
- **Prometheus**: http://EXTERNAL_IP:9090

### Health Checks
```bash
# Application health
curl http://EXTERNAL_IP:3000/api/health

# Container status
ssh ubuntu@EXTERNAL_IP "docker ps"
```

## 🔄 Management Commands

### View Infrastructure
```bash
# Show current state
terraform show

# List resources
terraform state list

# Show specific resource
terraform state show google_compute_instance.event_booking_vm
```

### Update Infrastructure
```bash
# Plan changes
terraform plan

# Apply changes
terraform apply

# Apply specific resource
terraform apply -target=google_compute_instance.event_booking_vm
```

### Destroy Infrastructure
```bash
# Plan destruction
terraform plan -destroy

# Destroy all resources
terraform destroy

# Destroy specific resource
terraform destroy -target=google_compute_instance.event_booking_vm
```

## 🐛 Troubleshooting

### Common Issues

1. **Authentication Error**
   ```bash
   gcloud auth application-default login
   ```

2. **Project Not Set**
   ```bash
   gcloud config set project your-project-id
   ```

3. **API Not Enabled**
   ```bash
   gcloud services enable compute.googleapis.com
   gcloud services enable dns.googleapis.com
   gcloud services enable storage.googleapis.com
   ```

4. **SSH Key Issues**
   ```bash
   # Check SSH key format
   cat ~/.ssh/id_rsa.pub
   
   # Regenerate if needed
   ssh-keygen -t rsa -b 4096 -C "your-email@example.com"
   ```

### Logs and Debugging

1. **VM Startup Logs**
   ```bash
   # SSH to VM and check startup script logs
   ssh ubuntu@EXTERNAL_IP
   sudo tail -f /var/log/startup-script.log
   ```

2. **Container Logs**
   ```bash
   # Check Docker containers
   docker ps
   docker logs event-booking-app
   docker logs event-booking-mysql
   ```

3. **Terraform Debug**
   ```bash
   # Enable debug logging
   export TF_LOG=DEBUG
   terraform apply
   ```

## 📚 Additional Resources

- [Google Cloud Terraform Provider](https://registry.terraform.io/providers/hashicorp/google/latest/docs)
- [Terraform Documentation](https://www.terraform.io/docs)
- [Google Cloud Free Tier](https://cloud.google.com/free)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

## 🎯 Next Steps

After successful deployment:

1. **Verify Application**: Check all services are running
2. **Configure DNS**: Set up custom domain (optional)
3. **SSL Setup**: Configure HTTPS certificates
4. **Monitoring**: Set up Grafana dashboards
5. **CI/CD**: Configure Jenkins pipeline
6. **Backup**: Test backup and restore procedures

---

**Note**: This configuration is designed for the Software Architecture course and includes all necessary components for the project requirements.
