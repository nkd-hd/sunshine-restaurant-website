# Event Booking System - Google Cloud Infrastructure
# Terraform configuration for Software Architecture Course

terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.1"
    }
  }
}

# Configure the Google Cloud Provider
provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

# Random password for MySQL
resource "random_password" "mysql_root_password" {
  length  = 16
  special = true
}

resource "random_password" "mysql_app_password" {
  length  = 16
  special = true
}

# Random secret for NextAuth
resource "random_password" "auth_secret" {
  length  = 32
  special = true
}

# Create a VPC network
resource "google_compute_network" "event_booking_vpc" {
  name                    = "${var.project_name}-vpc"
  auto_create_subnetworks = false
  description             = "VPC network for Event Booking System"
}

# Create a subnet
resource "google_compute_subnetwork" "event_booking_subnet" {
  name          = "${var.project_name}-subnet"
  ip_cidr_range = var.subnet_cidr
  region        = var.region
  network       = google_compute_network.event_booking_vpc.id
  description   = "Subnet for Event Booking System VM"
}

# Create firewall rules
resource "google_compute_firewall" "allow_ssh" {
  name    = "${var.project_name}-allow-ssh"
  network = google_compute_network.event_booking_vpc.name

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["event-booking-vm"]
  description   = "Allow SSH access to Event Booking VM"
}

resource "google_compute_firewall" "allow_http" {
  name    = "${var.project_name}-allow-http"
  network = google_compute_network.event_booking_vpc.name

  allow {
    protocol = "tcp"
    ports    = ["80"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["event-booking-vm"]
  description   = "Allow HTTP access to Event Booking VM"
}

resource "google_compute_firewall" "allow_https" {
  name    = "${var.project_name}-allow-https"
  network = google_compute_network.event_booking_vpc.name

  allow {
    protocol = "tcp"
    ports    = ["443"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["event-booking-vm"]
  description   = "Allow HTTPS access to Event Booking VM"
}

resource "google_compute_firewall" "allow_app_ports" {
  name    = "${var.project_name}-allow-app-ports"
  network = google_compute_network.event_booking_vpc.name

  allow {
    protocol = "tcp"
    ports    = ["3000", "8080", "9090", "3001"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["event-booking-vm"]
  description   = "Allow access to application ports (App, Jenkins, Prometheus, Grafana)"
}

# Create a static external IP
resource "google_compute_address" "event_booking_ip" {
  name         = "${var.project_name}-external-ip"
  region       = var.region
  description  = "Static external IP for Event Booking VM"
  address_type = "EXTERNAL"
}

# Create the VM instance
resource "google_compute_instance" "event_booking_vm" {
  name         = var.vm_name
  machine_type = var.machine_type
  zone         = var.zone

  tags = ["event-booking-vm"]

  boot_disk {
    initialize_params {
      image = var.vm_image
      size  = var.disk_size
      type  = "pd-standard"
    }
  }

  network_interface {
    network    = google_compute_network.event_booking_vpc.id
    subnetwork = google_compute_subnetwork.event_booking_subnet.id
    
    access_config {
      nat_ip = google_compute_address.event_booking_ip.address
    }
  }

  metadata = {
    ssh-keys = "${var.ssh_user}:${file(var.ssh_public_key_path)}"
  }

  metadata_startup_script = templatefile("${path.module}/startup-script.sh", {
    mysql_root_password = random_password.mysql_root_password.result
    mysql_app_password  = random_password.mysql_app_password.result
    auth_secret         = random_password.auth_secret.result
    domain_name         = var.domain_name
    docker_image        = var.docker_image
  })

  service_account {
    email  = google_service_account.event_booking_sa.email
    scopes = ["cloud-platform"]
  }

  labels = {
    environment = var.environment
    project     = var.project_name
    managed_by  = "terraform"
  }

  allow_stopping_for_update = true
}

# Create a service account for the VM
resource "google_service_account" "event_booking_sa" {
  account_id   = "${var.project_name}-vm-sa"
  display_name = "Event Booking VM Service Account"
  description  = "Service account for Event Booking System VM"
}

# Grant necessary permissions to the service account
resource "google_project_iam_member" "event_booking_sa_compute" {
  project = var.project_id
  role    = "roles/compute.instanceAdmin.v1"
  member  = "serviceAccount:${google_service_account.event_booking_sa.email}"
}

resource "google_project_iam_member" "event_booking_sa_storage" {
  project = var.project_id
  role    = "roles/storage.objectViewer"
  member  = "serviceAccount:${google_service_account.event_booking_sa.email}"
}

# Create a Cloud Storage bucket for backups
resource "google_storage_bucket" "event_booking_backups" {
  name          = "${var.project_id}-${var.project_name}-backups"
  location      = var.region
  force_destroy = false

  versioning {
    enabled = true
  }

  lifecycle_rule {
    condition {
      age = 30
    }
    action {
      type = "Delete"
    }
  }

  labels = {
    environment = var.environment
    project     = var.project_name
    managed_by  = "terraform"
  }
}

# Create a Cloud DNS zone (optional, for custom domain)
resource "google_dns_managed_zone" "event_booking_zone" {
  count       = var.create_dns_zone ? 1 : 0
  name        = "${var.project_name}-zone"
  dns_name    = "${var.domain_name}."
  description = "DNS zone for Event Booking System"

  labels = {
    environment = var.environment
    project     = var.project_name
    managed_by  = "terraform"
  }
}

# Create DNS A record pointing to the VM
resource "google_dns_record_set" "event_booking_a_record" {
  count        = var.create_dns_zone ? 1 : 0
  name         = google_dns_managed_zone.event_booking_zone[0].dns_name
  managed_zone = google_dns_managed_zone.event_booking_zone[0].name
  type         = "A"
  ttl          = 300

  rrdatas = [google_compute_address.event_booking_ip.address]
}

# Create DNS CNAME record for www subdomain
resource "google_dns_record_set" "event_booking_www_record" {
  count        = var.create_dns_zone ? 1 : 0
  name         = "www.${google_dns_managed_zone.event_booking_zone[0].dns_name}"
  managed_zone = google_dns_managed_zone.event_booking_zone[0].name
  type         = "CNAME"
  ttl          = 300

  rrdatas = [google_dns_managed_zone.event_booking_zone[0].dns_name]
}
