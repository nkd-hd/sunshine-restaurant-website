# Event Booking System - Terraform Variables
# Variable definitions for Google Cloud infrastructure

variable "project_id" {
  description = "The Google Cloud Project ID"
  type        = string
  default     = "ordinal-throne-463911-h8"
}

variable "project_name" {
  description = "Name of the project (used for resource naming)"
  type        = string
  default     = "event-booking"
}

variable "region" {
  description = "The Google Cloud region"
  type        = string
  default     = "us-central1"
}

variable "zone" {
  description = "The Google Cloud zone"
  type        = string
  default     = "us-central1-a"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"
  
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

# VM Configuration
variable "vm_name" {
  description = "Name of the VM instance"
  type        = string
  default     = "event-booking-vm"
}

variable "machine_type" {
  description = "The machine type for the VM instance"
  type        = string
  default     = "e2-micro"
  
  validation {
    condition = contains([
      "e2-micro", "e2-small", "e2-medium", 
      "n1-standard-1", "n2-standard-2"
    ], var.machine_type)
    error_message = "Machine type must be a valid Google Cloud machine type."
  }
}

variable "vm_image" {
  description = "The image to use for the VM instance"
  type        = string
  default     = "ubuntu-os-cloud/ubuntu-2004-lts"
}

variable "disk_size" {
  description = "Size of the boot disk in GB"
  type        = number
  default     = 20
  
  validation {
    condition     = var.disk_size >= 10 && var.disk_size <= 100
    error_message = "Disk size must be between 10 and 100 GB."
  }
}

# Network Configuration
variable "subnet_cidr" {
  description = "CIDR block for the subnet"
  type        = string
  default     = "10.0.1.0/24"
}

# SSH Configuration
variable "ssh_user" {
  description = "SSH username for the VM"
  type        = string
  default     = "ubuntu"
}

variable "ssh_public_key_path" {
  description = "Path to the SSH public key file"
  type        = string
  default     = "~/.ssh/id_rsa.pub"
}

# Application Configuration
variable "docker_image" {
  description = "Docker image for the application"
  type        = string
  default     = "nkdhd/event-booking-app:latest"
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = "event-booking.example.com"
}

variable "create_dns_zone" {
  description = "Whether to create a Cloud DNS zone"
  type        = bool
  default     = false
}

# Security Configuration
variable "allowed_ssh_sources" {
  description = "List of CIDR blocks allowed to SSH to the VM"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "allowed_http_sources" {
  description = "List of CIDR blocks allowed to access HTTP/HTTPS"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

# Monitoring Configuration
variable "enable_monitoring" {
  description = "Enable Google Cloud Monitoring"
  type        = bool
  default     = true
}

variable "enable_logging" {
  description = "Enable Google Cloud Logging"
  type        = bool
  default     = true
}

# Backup Configuration
variable "backup_retention_days" {
  description = "Number of days to retain backups"
  type        = number
  default     = 30
  
  validation {
    condition     = var.backup_retention_days >= 1 && var.backup_retention_days <= 365
    error_message = "Backup retention must be between 1 and 365 days."
  }
}

# Resource Labels
variable "labels" {
  description = "Labels to apply to all resources"
  type        = map(string)
  default = {
    project     = "event-booking-system"
    course      = "software-architecture"
    managed_by  = "terraform"
    environment = "production"
  }
}

# Cost Management
variable "preemptible" {
  description = "Use preemptible VM instances (cheaper but can be terminated)"
  type        = bool
  default     = false
}

variable "automatic_restart" {
  description = "Automatically restart VM if it crashes"
  type        = bool
  default     = true
}

variable "on_host_maintenance" {
  description = "What to do when host maintenance occurs"
  type        = string
  default     = "MIGRATE"
  
  validation {
    condition     = contains(["MIGRATE", "TERMINATE"], var.on_host_maintenance)
    error_message = "On host maintenance must be either MIGRATE or TERMINATE."
  }
}

# Application Environment Variables
variable "app_environment_vars" {
  description = "Environment variables for the application"
  type        = map(string)
  default = {
    NODE_ENV                = "production"
    SKIP_ENV_VALIDATION     = "1"
    NEXT_TELEMETRY_DISABLED = "1"
    PORT                    = "3000"
    HOSTNAME                = "0.0.0.0"
  }
  sensitive = true
}

# Database Configuration
variable "mysql_database_name" {
  description = "Name of the MySQL database"
  type        = string
  default     = "event_booking"
}

variable "mysql_user" {
  description = "MySQL application user"
  type        = string
  default     = "app_user"
}

# Monitoring Ports
variable "monitoring_ports" {
  description = "Ports used for monitoring services"
  type        = map(number)
  default = {
    prometheus = 9090
    grafana    = 3001
    jenkins    = 8080
    app        = 3000
  }
}

# SSL Configuration
variable "enable_ssl" {
  description = "Enable SSL/TLS certificates"
  type        = bool
  default     = true
}

variable "ssl_email" {
  description = "Email for SSL certificate registration"
  type        = string
  default     = "admin@example.com"
}
