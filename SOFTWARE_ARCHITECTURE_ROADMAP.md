# Software Architecture Implementation Roadmap

## Chronological Implementation Steps

### Week 1: Google Cloud Infrastructure & Initial Setup ✅ **COMPLETED**

#### 1.1: Google Cloud Free Tier Setup ✅ **COMPLETED**
- [x] Sign up/Log in to Google Cloud
- [x] Create e2-micro VM instance (event-booking-vm)
- [x] 📸 VM details: us-central1-a zone, Ubuntu 20.04 LTS, 1GB RAM
- [x] 💾 VM connection: `gcloud compute ssh --zone "us-central1-a" "event-booking-vm" --project "ordinal-throne-463911-h8"`

#### 1.2: VM Configuration & Security ✅ **COMPLETED**
- [x] SSH into VM via Google Cloud Console
- [x] Update packages: `sudo apt update && sudo apt upgrade -y`
- [x] Install essential tools: `sudo apt install -y curl wget git vim htop unzip`
- [x] Configure ufw firewall (SSH, HTTP, HTTPS, app ports)
- [x] 📸 `sudo ufw status` output
- [x] Configure Google Cloud firewall rules (ports 22, 80, 443, 3000, 8080, 9090, 3001)

#### 1.3: Docker Installation ✅ **COMPLETED**
- [x] Install Docker Engine: `curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh`
- [x] Install Docker Compose: Latest version from GitHub releases
- [x] Add user to docker group: `sudo usermod -aG docker $USER`
- [x] Verify: `docker --version` and `docker-compose --version`
- [x] Test: `sudo docker run hello-world`
- [x] 📸 `docker ps` output (empty but working)

#### 1.4: Production MySQL Deployment 🔄 **NEXT STEP**
- [ ] Create MySQL data directory: `/opt/mysql-data`
- [ ] Deploy MySQL container with persistent storage
- [ ] 📸 `docker ps` showing running MySQL container
- [ ] Apply Drizzle migrations and seed data
- [ ] 📸 MySQL prompt with seeded data query

### Week 2: Application Containerization & Manual Deployment

#### 2.1: Production Dockerfile
- [x] Create/refine production-optimized Dockerfile (multi-stage build)
- [x] 💾 Final Dockerfile

#### 2.2: Docker Image Build & Registry
- [x] Build production image: `docker build -t username/event-booking-app:latest .`
- [x] 📸 Successful docker build output
- [x] Push to Docker Hub: `docker push nkdhd/event-booking-app:latest` ✅ **COMPLETED**
  - Image successfully pushed: `nkdhd/event-booking-app:latest` and `nkdhd/event-booking-app:v1.0.0`
  - Size: 226MB (optimized multi-stage build)
  - Public URL: https://hub.docker.com/r/nkdhd/event-booking-app
- [x] 📸 Successful docker push output

#### 2.3: Application Deployment 🔄 **CURRENT FOCUS**
- [ ] Pull and run application container on Google Cloud VM
- [ ] Configure environment variables (DATABASE_URL, NEXTAUTH_SECRET)
- [ ] 📸 `docker ps` showing running app container

#### 2.4: Reverse Proxy & SSL
- [ ] Install and configure Nginx as reverse proxy
- [ ] 💾 nginx.conf configuration
- [ ] Install Certbot and obtain SSL certificate
- [ ] 📸 Application homepage with HTTPS padlock

### Week 3: CI/CD Pipeline & Initial Observability

#### 3.1: Jenkins Setup
- [ ] Install Jenkins on Google Cloud VM (Docker-based approach)
- [ ] Complete initial setup (unlock, admin user, plugins)
- [ ] 📸 Jenkins dashboard
- [ ] Install Git and Docker plugins
- [ ] Create Pipeline job connected to Git repository
- [ ] 💾 Jenkinsfile for automated build and push
- [ ] 📸 Successful Jenkins pipeline console output

#### 3.2: Monitoring Stack
- [ ] Deploy Prometheus and Grafana (Docker Compose)
- [ ] Configure Prometheus with node_exporter for VM metrics
- [ ] Configure Grafana with Prometheus data source
- [ ] Create dashboard for CPU, Memory, Network usage
- [ ] 📸 Grafana dashboard with active metrics

#### 3.3: Infrastructure as Code (Ansible)
- [ ] Install Ansible on local machine
- [ ] Create inventory file targeting Google Cloud VM
- [ ] 💾 install_nginx.yml playbook
- [ ] 💾 configure_nginx_ssl.yml playbook
- [ ] Execute playbooks from local machine
- [ ] 📸 Successful Ansible execution output

### Week 4: Kubernetes Orchestration & Robust Testing

#### 4.1: Kubernetes Cluster Setup
- [ ] Install k3s/k0s on Google Cloud VM (single-node cluster)
- [ ] Verify cluster: `kubectl get nodes`
- [ ] 📸 kubectl get nodes showing Ready status
- [ ] Copy kubeconfig to local machine for remote management

#### 4.2: Kubernetes Deployment
- [ ] 💾 Kubernetes manifests (deployment.yaml, service.yaml, ingress.yaml)
- [ ] Apply manifests: `kubectl apply -f`
- [ ] 📸 kubectl get pods and svc (Running/Ready state)
- [ ] Demonstrate scaling: `kubectl scale deployment --replicas=2`
- [ ] 📸 Multiple pod replicas
- [ ] Demonstrate rolling update
- [ ] 📸 Successful rollout status

#### 4.3: Comprehensive Testing Implementation
- [ ] 💾 Unit test files achieving 80%+ coverage
- [ ] 💾 Integration test files with database interaction
- [ ] 💾 E2E test files (Playwright/Cypress)
- [ ] 📸 Test execution with coverage report
- [ ] Update Jenkinsfile to include test execution
- [ ] 📸 Jenkins pipeline testing stage

### Ongoing: Documentation & Academic Requirements

#### Scrum Implementation (Throughout Project)
- [ ] Define roles: Product Owner, Scrum Master, Team Member (Self)
- [ ] Create product backlog (GitHub Projects/Trello)
- [ ] Plan Sprint 1: "Deploy App Manually to OCI" (Week 1-2)
- [ ] Plan Sprint 2: "Implement CI/CD & Monitoring" (Week 3-4)
- [ ] 📸 Sprint backlog and burndown charts
- [ ] 💾 Sprint retrospective documents

#### Architecture Documentation (Parallel to Implementation)
- [ ] Start Infrastructure Diagram (update constantly)
- [ ] 📸 Final Infrastructure Diagram
- [ ] 💾 Architecture Document with UML diagrams
- [ ] Document architectural style justification
- [ ] Analyze quality attributes and trade-offs
- [ ] Document architectural design process

#### Project Innovation & Final Documentation
- [ ] Identify unique project aspects (T3 Stack, tRPC type safety, etc.)
- [ ] 📸 Innovation demo
- [ ] 💾 Innovation description document
- [ ] Generate API documentation (Swagger/Postman)
- [ ] 💾 User manual/onboarding guide
- [ ] 💾 Comprehensive README.md

## Success Criteria
- **Week 1**: ✅ Google Cloud VM setup with Docker - **COMPLETED**
- **Week 2**: Application accessible via HTTPS on Google Cloud VM
- **Week 3**: Jenkins pipeline running, monitoring active
- **Week 4**: Kubernetes cluster operational, 80%+ test coverage

## Critical Notes
- Keep web dev branch stable - No changes to `feature/local-mysql-setup`
- Document everything - Screenshots and files are deliverables
- Test incrementally - Verify each component before proceeding
- Save crucial info - IP addresses, passwords, SSH keys
- Regular commits - Clear messages for each architecture component
