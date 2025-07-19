# Infrastructure Architecture Diagram

## Event Booking System - Software Architecture Course

### Current Infrastructure Overview

```mermaid
graph TB
    subgraph "Internet"
        U[Users/Clients]
        D[Developers]
    end

    subgraph "Google Cloud Platform - Free Tier"
        subgraph "Compute Engine VM (event-booking-vm)"
            subgraph "VM Specifications"
                VM[e2-micro Instance<br/>1GB RAM, 1 vCPU<br/>Ubuntu 20.04 LTS<br/>us-central1-a]
            end
            
            subgraph "Docker Environment"
                subgraph "Application Stack"
                    APP[Event Booking App<br/>Next.js + TypeScript<br/>Port: 3000]
                    DB[MySQL 8.0<br/>Database<br/>Port: 3306]
                end
                
                subgraph "DevOps Stack"
                    JENKINS[Jenkins CI/CD<br/>Port: 8080]
                    PROM[Prometheus<br/>Monitoring<br/>Port: 9090]
                    GRAF[Grafana<br/>Dashboards<br/>Port: 3001]
                end
            end
            
            subgraph "System Services"
                NGINX[Nginx Reverse Proxy<br/>SSL Termination<br/>Port: 80/443]
                UFW[UFW Firewall<br/>Security Layer]
            end
        end
    end

    subgraph "External Services"
        DOCKER_HUB[Docker Hub Registry<br/>nkdhd/event-booking-app]
        GITHUB[GitHub Repository<br/>Source Control]
    end

    subgraph "Development Environment"
        LOCAL[Local Development<br/>Docker Compose<br/>Hot Reload]
    end

    %% User Connections
    U -->|HTTPS/443| NGINX
    U -->|HTTP/80| NGINX
    
    %% Developer Connections
    D -->|SSH/22| VM
    D -->|Git Push| GITHUB
    D -->|Docker Push| DOCKER_HUB
    
    %% Internal VM Connections
    NGINX -->|Proxy| APP
    NGINX -->|Proxy| JENKINS
    NGINX -->|Proxy| GRAF
    
    APP -->|Database Queries| DB
    JENKINS -->|Build & Deploy| APP
    JENKINS -->|Pull Code| GITHUB
    JENKINS -->|Push Images| DOCKER_HUB
    
    PROM -->|Scrape Metrics| APP
    PROM -->|System Metrics| VM
    GRAF -->|Query Data| PROM
    
    %% Development Flow
    LOCAL -->|Test & Build| DOCKER_HUB
    LOCAL -->|Code Changes| GITHUB

    %% Styling
    classDef vmBox fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef appBox fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef devopsBox fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef externalBox fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef securityBox fill:#ffebee,stroke:#b71c1c,stroke-width:2px

    class VM vmBox
    class APP,DB appBox
    class JENKINS,PROM,GRAF devopsBox
    class DOCKER_HUB,GITHUB externalBox
    class NGINX,UFW securityBox
```

### Network Architecture

```mermaid
graph LR
    subgraph "Google Cloud Firewall Rules"
        FW_SSH[SSH - Port 22<br/>Source: 0.0.0.0/0]
        FW_HTTP[HTTP - Port 80<br/>Source: 0.0.0.0/0]
        FW_HTTPS[HTTPS - Port 443<br/>Source: 0.0.0.0/0]
        FW_APP[App - Port 3000<br/>Source: Internal]
        FW_JENKINS[Jenkins - Port 8080<br/>Source: Internal]
        FW_PROM[Prometheus - Port 9090<br/>Source: Internal]
        FW_GRAF[Grafana - Port 3001<br/>Source: Internal]
    end

    subgraph "VM Internal Network"
        subgraph "Docker Bridge Network"
            NET[event-booking-network<br/>172.18.0.0/16]
            APP_IP[App Container<br/>172.18.0.2:3000]
            DB_IP[MySQL Container<br/>172.18.0.3:3306]
        end
        
        subgraph "Host Network"
            HOST[VM Host<br/>10.128.0.2]
            NGINX_HOST[Nginx<br/>Host Network]
        end
    end

    FW_HTTP --> NGINX_HOST
    FW_HTTPS --> NGINX_HOST
    NGINX_HOST --> APP_IP
    APP_IP --> DB_IP
```

### Container Architecture

```mermaid
graph TB
    subgraph "Docker Compose Stack"
        subgraph "Application Tier"
            APP_CONTAINER[event-booking-app<br/>Image: nkdhd/event-booking-app:latest<br/>Health Check: /api/health<br/>Resources: 512MB RAM, 0.5 CPU]
        end
        
        subgraph "Database Tier"
            DB_CONTAINER[event-booking-mysql<br/>Image: mysql:8.0<br/>Persistent Volume: mysql_data<br/>Health Check: mysqladmin ping]
        end
        
        subgraph "Monitoring Tier"
            PROM_CONTAINER[prometheus<br/>Config: prometheus.yml<br/>Data Retention: 15d]
            GRAF_CONTAINER[grafana<br/>Dashboards: System + App<br/>Data Source: Prometheus]
        end
        
        subgraph "CI/CD Tier"
            JENKINS_CONTAINER[jenkins/jenkins:lts<br/>Plugins: Git, Docker<br/>Workspace: /var/jenkins_home]
        end
    end

    subgraph "Persistent Storage"
        VOL_MYSQL[mysql_data Volume<br/>Database Files]
        VOL_UPLOADS[uploads Volume<br/>Event Images]
        VOL_JENKINS[jenkins_home Volume<br/>Build Artifacts]
        VOL_PROM[prometheus_data Volume<br/>Metrics Data]
        VOL_GRAF[grafana_data Volume<br/>Dashboard Config]
    end

    APP_CONTAINER --> VOL_UPLOADS
    DB_CONTAINER --> VOL_MYSQL
    JENKINS_CONTAINER --> VOL_JENKINS
    PROM_CONTAINER --> VOL_PROM
    GRAF_CONTAINER --> VOL_GRAF

    APP_CONTAINER -.->|Database Connection| DB_CONTAINER
    PROM_CONTAINER -.->|Metrics Collection| APP_CONTAINER
    GRAF_CONTAINER -.->|Data Query| PROM_CONTAINER
    JENKINS_CONTAINER -.->|Deploy| APP_CONTAINER
```

### Deployment Pipeline Architecture

```mermaid
graph LR
    subgraph "Development"
        DEV[Developer<br/>Local Machine]
        IDE[VS Code<br/>Development Environment]
    end

    subgraph "Source Control"
        GITHUB[GitHub Repository<br/>Main Branch<br/>Feature Branches]
    end

    subgraph "CI/CD Pipeline"
        JENKINS[Jenkins Pipeline<br/>Automated Build]
        BUILD[Docker Build<br/>Multi-stage Build]
        TEST[Test Suite<br/>Unit + Integration]
        PUSH[Docker Push<br/>Registry Upload]
    end

    subgraph "Container Registry"
        REGISTRY[Docker Hub<br/>nkdhd/event-booking-app<br/>Tagged Images]
    end

    subgraph "Production Environment"
        DEPLOY[Docker Compose<br/>Production Deploy]
        HEALTH[Health Checks<br/>Monitoring]
    end

    DEV --> IDE
    IDE --> GITHUB
    GITHUB -->|Webhook| JENKINS
    JENKINS --> BUILD
    BUILD --> TEST
    TEST --> PUSH
    PUSH --> REGISTRY
    REGISTRY --> DEPLOY
    DEPLOY --> HEALTH
    HEALTH -.->|Feedback| DEV
```

### Security Architecture

```mermaid
graph TB
    subgraph "External Security"
        CLOUDFLARE[Cloudflare<br/>DDoS Protection<br/>SSL/TLS]
        FIREWALL[Google Cloud Firewall<br/>Port Restrictions<br/>IP Filtering]
    end

    subgraph "VM Security"
        UFW[UFW Firewall<br/>Host-level Protection]
        SSH[SSH Key Authentication<br/>No Password Login]
        FAIL2BAN[Fail2Ban<br/>Intrusion Prevention]
    end

    subgraph "Application Security"
        AUTH[NextAuth.js<br/>Session Management<br/>CSRF Protection]
        ENV[Environment Variables<br/>Secret Management]
        CORS[CORS Configuration<br/>Origin Validation]
    end

    subgraph "Container Security"
        NONROOT[Non-root User<br/>Container Isolation]
        SECRETS[Docker Secrets<br/>Credential Management]
        NETWORK[Docker Networks<br/>Service Isolation]
    end

    CLOUDFLARE --> FIREWALL
    FIREWALL --> UFW
    UFW --> AUTH
    AUTH --> NONROOT
    SSH --> ENV
    ENV --> SECRETS
    FAIL2BAN --> NETWORK
```

## Infrastructure Specifications

### Google Cloud VM Details
- **Instance Name**: event-booking-vm
- **Machine Type**: e2-micro (1 vCPU, 1GB RAM)
- **Zone**: us-central1-a
- **Operating System**: Ubuntu 20.04 LTS
- **Boot Disk**: 10GB Standard Persistent Disk
- **Network**: default VPC
- **External IP**: Ephemeral (assigned dynamically)

### Connection Details
```bash
# SSH Connection
gcloud compute ssh --zone "us-central1-a" "event-booking-vm" --project "ordinal-throne-463911-h8"

# Alternative SSH (if gcloud configured)
ssh -i ~/.ssh/google_compute_engine username@EXTERNAL_IP
```

### Port Configuration
| Service | Port | Protocol | Access |
|---------|------|----------|--------|
| SSH | 22 | TCP | External |
| HTTP | 80 | TCP | External |
| HTTPS | 443 | TCP | External |
| Application | 3000 | TCP | Internal |
| Jenkins | 8080 | TCP | Internal |
| Prometheus | 9090 | TCP | Internal |
| Grafana | 3001 | TCP | Internal |
| MySQL | 3306 | TCP | Container |

### Resource Allocation
| Component | CPU | Memory | Storage |
|-----------|-----|--------|---------|
| Next.js App | 0.5 cores | 512MB | - |
| MySQL | 0.3 cores | 256MB | 2GB |
| Jenkins | 0.2 cores | 256MB | 1GB |
| Prometheus | 0.1 cores | 128MB | 500MB |
| Grafana | 0.1 cores | 64MB | 100MB |
| System | 0.2 cores | 200MB | 6GB |

### Environment Variables
```bash
# Production Environment
NODE_ENV=production
DATABASE_URL=mysql://app_user:secure_password@mysql:3306/event_booking
AUTH_SECRET=super-secure-production-secret
NEXTAUTH_URL=https://your-domain.com
SKIP_ENV_VALIDATION=1
NEXT_TELEMETRY_DISABLED=1
```

## Monitoring and Observability

### Metrics Collection
- **System Metrics**: CPU, Memory, Disk, Network (via node_exporter)
- **Application Metrics**: Response time, Error rate, Request count
- **Database Metrics**: Connection pool, Query performance
- **Container Metrics**: Resource usage, Health status

### Alerting Rules
- High CPU usage (>80% for 5 minutes)
- High memory usage (>90% for 5 minutes)
- Application down (health check fails)
- Database connection failures
- Disk space low (<10% free)

### Log Management
- Application logs: JSON structured logging
- System logs: journald + rsyslog
- Container logs: Docker logging driver
- Centralized logging: ELK stack (future enhancement)

## Disaster Recovery

### Backup Strategy
- **Database**: Daily automated backups to Google Cloud Storage
- **Application**: Docker images stored in registry
- **Configuration**: Infrastructure as Code in Git
- **Monitoring Data**: Prometheus data retention (15 days)

### Recovery Procedures
1. **VM Failure**: Recreate VM from Terraform/scripts
2. **Container Failure**: Auto-restart via Docker Compose
3. **Database Corruption**: Restore from latest backup
4. **Application Issues**: Rollback to previous Docker image

## Future Enhancements

### Kubernetes Migration
- Migrate from Docker Compose to Kubernetes
- Implement horizontal pod autoscaling
- Add ingress controller with SSL termination
- Implement persistent volume claims

### High Availability
- Multi-zone deployment
- Load balancer configuration
- Database replication
- Redis session store

### Security Enhancements
- Implement Vault for secret management
- Add network policies
- Implement pod security policies
- Regular security scanning

---

**Document Version**: 1.0  
**Last Updated**: 2024-06-24  
**Next Review**: Weekly during implementation phase
