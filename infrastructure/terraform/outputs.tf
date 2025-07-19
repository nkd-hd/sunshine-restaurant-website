# Event Booking System - Terraform Outputs
# Output values for infrastructure resources

# VM Instance Outputs
output "vm_instance_name" {
  description = "Name of the VM instance"
  value       = google_compute_instance.event_booking_vm.name
}

output "vm_instance_id" {
  description = "ID of the VM instance"
  value       = google_compute_instance.event_booking_vm.instance_id
}

output "vm_machine_type" {
  description = "Machine type of the VM instance"
  value       = google_compute_instance.event_booking_vm.machine_type
}

output "vm_zone" {
  description = "Zone where the VM instance is located"
  value       = google_compute_instance.event_booking_vm.zone
}

# Network Outputs
output "external_ip" {
  description = "External IP address of the VM instance"
  value       = google_compute_address.event_booking_ip.address
}

output "internal_ip" {
  description = "Internal IP address of the VM instance"
  value       = google_compute_instance.event_booking_vm.network_interface[0].network_ip
}

output "vpc_network_name" {
  description = "Name of the VPC network"
  value       = google_compute_network.event_booking_vpc.name
}

output "subnet_name" {
  description = "Name of the subnet"
  value       = google_compute_subnetwork.event_booking_subnet.name
}

output "subnet_cidr" {
  description = "CIDR block of the subnet"
  value       = google_compute_subnetwork.event_booking_subnet.ip_cidr_range
}

# SSH Connection Information
output "ssh_connection_command" {
  description = "SSH command to connect to the VM"
  value       = "gcloud compute ssh --zone ${var.zone} ${google_compute_instance.event_booking_vm.name} --project ${var.project_id}"
}

output "ssh_connection_external" {
  description = "SSH command using external IP"
  value       = "ssh ${var.ssh_user}@${google_compute_address.event_booking_ip.address}"
}

# Application URLs
output "application_url_http" {
  description = "HTTP URL for the application"
  value       = "http://${google_compute_address.event_booking_ip.address}:3000"
}

output "application_url_https" {
  description = "HTTPS URL for the application (if SSL configured)"
  value       = "https://${var.domain_name}"
}

output "jenkins_url" {
  description = "URL for Jenkins CI/CD"
  value       = "http://${google_compute_address.event_booking_ip.address}:8080"
}

output "grafana_url" {
  description = "URL for Grafana monitoring"
  value       = "http://${google_compute_address.event_booking_ip.address}:3001"
}

output "prometheus_url" {
  description = "URL for Prometheus metrics"
  value       = "http://${google_compute_address.event_booking_ip.address}:9090"
}

# Service Account Information
output "service_account_email" {
  description = "Email of the service account"
  value       = google_service_account.event_booking_sa.email
}

output "service_account_id" {
  description = "ID of the service account"
  value       = google_service_account.event_booking_sa.account_id
}

# Storage Information
output "backup_bucket_name" {
  description = "Name of the backup storage bucket"
  value       = google_storage_bucket.event_booking_backups.name
}

output "backup_bucket_url" {
  description = "URL of the backup storage bucket"
  value       = google_storage_bucket.event_booking_backups.url
}

# DNS Information (if enabled)
output "dns_zone_name" {
  description = "Name of the DNS zone"
  value       = var.create_dns_zone ? google_dns_managed_zone.event_booking_zone[0].name : null
}

output "dns_zone_nameservers" {
  description = "Name servers for the DNS zone"
  value       = var.create_dns_zone ? google_dns_managed_zone.event_booking_zone[0].name_servers : null
}

# Security Information
output "firewall_rules" {
  description = "List of firewall rules created"
  value = [
    google_compute_firewall.allow_ssh.name,
    google_compute_firewall.allow_http.name,
    google_compute_firewall.allow_https.name,
    google_compute_firewall.allow_app_ports.name
  ]
}

# Generated Secrets (sensitive)
output "mysql_root_password" {
  description = "Generated MySQL root password"
  value       = random_password.mysql_root_password.result
  sensitive   = true
}

output "mysql_app_password" {
  description = "Generated MySQL application password"
  value       = random_password.mysql_app_password.result
  sensitive   = true
}

output "auth_secret" {
  description = "Generated NextAuth secret"
  value       = random_password.auth_secret.result
  sensitive   = true
}

# Environment Configuration
output "environment_variables" {
  description = "Environment variables for the application"
  value = {
    NODE_ENV                = "production"
    DATABASE_URL            = "mysql://${var.mysql_user}:${random_password.mysql_app_password.result}@localhost:3306/${var.mysql_database_name}"
    AUTH_SECRET             = random_password.auth_secret.result
    NEXTAUTH_URL            = var.create_dns_zone ? "https://${var.domain_name}" : "http://${google_compute_address.event_booking_ip.address}:3000"
    SKIP_ENV_VALIDATION     = "1"
    NEXT_TELEMETRY_DISABLED = "1"
    PORT                    = "3000"
    HOSTNAME                = "0.0.0.0"
  }
  sensitive = true
}

# Resource Information
output "resource_labels" {
  description = "Labels applied to resources"
  value       = var.labels
}

output "project_info" {
  description = "Project information"
  value = {
    project_id   = var.project_id
    project_name = var.project_name
    region       = var.region
    zone         = var.zone
    environment  = var.environment
  }
}

# Cost Information
output "estimated_monthly_cost" {
  description = "Estimated monthly cost (USD) - approximate"
  value = {
    vm_instance = var.machine_type == "e2-micro" ? "Free (Always Free Tier)" : "~$24.27"
    storage     = "~$2.00"
    network     = "~$1.00"
    total       = var.machine_type == "e2-micro" ? "~$3.00" : "~$27.27"
    note        = "Costs are estimates and may vary based on usage"
  }
}

# Deployment Information
output "deployment_commands" {
  description = "Commands to deploy the application"
  value = {
    ssh_connect = "gcloud compute ssh --zone ${var.zone} ${google_compute_instance.event_booking_vm.name} --project ${var.project_id}"
    deploy_app  = "docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d"
    check_logs  = "docker-compose logs -f"
    health_check = "curl http://${google_compute_address.event_booking_ip.address}:3000/api/health"
  }
}

# Monitoring Endpoints
output "monitoring_endpoints" {
  description = "Monitoring and management endpoints"
  value = {
    application_health = "http://${google_compute_address.event_booking_ip.address}:3000/api/health"
    prometheus_metrics = "http://${google_compute_address.event_booking_ip.address}:9090/metrics"
    grafana_dashboard  = "http://${google_compute_address.event_booking_ip.address}:3001"
    jenkins_pipeline   = "http://${google_compute_address.event_booking_ip.address}:8080"
  }
}
