# CI/CD Pipeline - Event Booking System

## ✅ CURRENT STATUS - JENKINS IS RUNNING!

**Jenkins Pipeline**: ✅ **ACTIVE & READY**
- **URL**: http://localhost:8080
- **Container**: jenkins-ci (running)
- **Initial Password**: `3e74ec92a4d3480e8291ddc5b2edd7f0`
- **Setup Guide**: [jenkins/JENKINS_SETUP.md](jenkins/JENKINS_SETUP.md)

**Quick Access**: Open http://localhost:8080 and use password `3e74ec92a4d3480e8291ddc5b2edd7f0`

## 🎯 Overview
Complete Jenkins CI/CD pipeline for the Event Booking System, designed to work independently of Google Cloud VPS deployment status.

## 📁 Components

### Jenkins Configuration ✅ **RUNNING**
- **`Jenkinsfile`** - Complete pipeline definition with 10 stages
- **`jenkins-setup.sh`** - Automated Jenkins installation and configuration
- **`local-jenkins-demo.sh`** - Local pipeline simulation script
- **`JENKINS_SETUP.md`** - Complete setup and configuration guide
- **Container**: jenkins-ci (active on port 8080)

### GitHub Actions ✅ **CONFIGURED**
- **`.github/workflows/ci-cd.yml`** - GitHub Actions workflow
- **Status**: Ready for cloud deployment

### Pipeline Features
- **Parallel Execution** - Code quality checks and tests run in parallel
- **Docker Integration** - Automated container building and testing
- **Security Scanning** - Vulnerability detection with Trivy
- **Test Coverage** - Automated test execution with coverage reporting
- **Registry Publishing** - Docker Hub image publishing
- **Conditional Deployment** - Deploys to Google Cloud when VPS is ready

## 🚀 Quick Start

### Step 1: Access Jenkins (Already Running!)
✅ **Jenkins is already running and ready to use!**

```bash
# Jenkins is running at:
# URL: http://localhost:8080
# Password: 3e74ec92a4d3480e8291ddc5b2edd7f0

# Open Jenkins in browser
open http://localhost:8080

# Or check container status
docker ps | grep jenkins
```

**Current Status**:
- ✅ Jenkins container is running
- ✅ Available on port 8080
- ✅ Initial admin password ready
- ✅ Complete setup guide available

**Next**: Follow the setup wizard at http://localhost:8080

### Step 2: Configure GitHub Integration

#### 2.1 Create GitHub Personal Access Token
1. Go to GitHub Settings > Developer settings > Personal access tokens
2. Click "Generate new token (classic)"
3. Select scopes:
   - `repo` (Full control of private repositories)
   - `admin:repo_hook` (Full control of repository hooks)
   - `user:email` (Access user email addresses)
4. Copy the generated token

#### 2.2 Add GitHub Credentials to Jenkins
1. Open Jenkins: http://localhost:8080
2. Login with admin/admin123
3. Go to "Manage Jenkins" > "Manage Credentials"
4. Click "System" > "Global credentials (unrestricted)"
5. Click "Add Credentials"
6. Configure:
   - **Kind**: Secret text
   - **Secret**: [Your GitHub token]
   - **ID**: `github-credentials`
   - **Description**: GitHub Personal Access Token
7. Click "OK"

#### 2.3 Add Docker Hub Credentials
1. In the same credentials section, click "Add Credentials"
2. Configure:
   - **Kind**: Username with password
   - **Username**: [Your Docker Hub username]
   - **Password**: [Your Docker Hub password]
   - **ID**: `docker-hub-credentials`
   - **Description**: Docker Hub Login
3. Click "OK"

### Step 3: Set up Pipeline Job

#### 3.1 Create New Pipeline Job
1. From Jenkins dashboard, click "New Item"
2. Enter name: `event-booking-system-pipeline`
3. Select "Pipeline" and click "OK"

#### 3.2 Configure Pipeline Settings
1. **General Tab**:
   - ✅ Check "GitHub project"
   - **Project url**: `https://github.com/your-username/event-booking-system/`

2. **Build Triggers Tab**:
   - ✅ Check "GitHub hook trigger for GITScm polling"
   - ✅ Check "Poll SCM" with schedule: `H/5 * * * *`

3. **Pipeline Tab**:
   - **Definition**: Pipeline script from SCM
   - **SCM**: Git
   - **Repository URL**: `https://github.com/your-username/event-booking-system.git`
   - **Credentials**: Select `github-credentials`
   - **Branch Specifier**: `*/main`
   - **Script Path**: `ci-cd/jenkins/Jenkinsfile`

4. Click "Save"

### Step 4: Configure Deployment Credentials

#### 4.1 Google Cloud Service Account (Optional - for VPS deployment)
1. Go to Google Cloud Console > IAM & Admin > Service Accounts
2. Create new service account: `jenkins-deployer`
3. Grant roles:
   - Compute Instance Admin (v1)
   - Service Account User
4. Create and download JSON key
5. In Jenkins credentials, add:
   - **Kind**: Secret file
   - **File**: Upload the JSON key file
   - **ID**: `gcp-service-account`
   - **Description**: Google Cloud Service Account

#### 4.2 Update Jenkinsfile Variables (if needed)
Edit `ci-cd/jenkins/Jenkinsfile` and update:
```groovy
environment {
    DOCKER_REPO = 'your-dockerhub-username/event-booking-app'
    GIT_REPO = 'https://github.com/your-username/event-booking-system.git'
    GCP_PROJECT_ID = 'your-project-id'
    // ... other variables
}
```

### Step 5: Test Pipeline Execution

#### 5.1 Manual Pipeline Run
1. Go to your pipeline job: `event-booking-system-pipeline`
2. Click "Build Now"
3. Watch the pipeline execution in real-time
4. Check each stage for success/failure

#### 5.2 Expected Pipeline Flow
```
✅ Checkout (30s)
✅ Environment Setup (10s)
✅ Install Dependencies (2min)
✅ Code Quality & Security (1min)
✅ Run Tests (3min)
✅ Build Application (2min)
✅ Build Docker Image (3min)
✅ Security Scan (2min)
✅ Push to Registry (1min)
⏸️ Deploy to Production (skipped if no VPS)
```

#### 5.3 Verify Success
1. **Check Console Output**: Click on build number > Console Output
2. **Verify Docker Image**: Check Docker Hub for new image
3. **Review Test Reports**: Click on build > Test Results
4. **Check Coverage**: Click on build > Coverage Report

#### 5.4 Troubleshooting Common Issues
```bash
# If Docker permission issues
sudo usermod -aG docker jenkins
docker restart event-booking-jenkins

# If Node.js issues
docker exec -it event-booking-jenkins node --version

# If GitHub connection issues
# Check credentials and repository URL in Jenkins
```

## 📊 Pipeline Stages

| Stage | Purpose | Runs Without VPS | Duration |
|-------|---------|------------------|----------|
| Checkout | Source code retrieval | ✅ Yes | ~30s |
| Environment Setup | Build configuration | ✅ Yes | ~10s |
| Install Dependencies | Package installation | ✅ Yes | ~2min |
| Code Quality & Security | Parallel quality checks | ✅ Yes | ~1min |
| Run Tests | Unit & integration tests | ✅ Yes | ~3min |
| Build Application | Next.js compilation | ✅ Yes | ~2min |
| Build Docker Image | Container creation | ✅ Yes | ~3min |
| Security Scan | Vulnerability scanning | ✅ Yes | ~2min |
| Push to Registry | Docker Hub publishing | ✅ Yes | ~1min |
| Deploy to Production | GCP deployment | ❌ No | ~2min |

**Total Pipeline Time**: ~15 minutes (without VPS), ~17 minutes (with VPS)

## 🔧 Requirements

### Local Development
- Docker and Docker Compose
- Node.js 18+
- Git

### Jenkins Server
- Jenkins LTS with required plugins
- Docker access for container builds
- Network access to Docker Hub and GitHub

### Production Deployment (Optional)
- Google Cloud SDK
- Service account with Compute Engine access
- Running VM instance with Docker Compose

## 🎯 Benefits Without VPS Deployment

Even without Google Cloud VPS deployed, this pipeline provides:

### ✅ Immediate Value:
- **Code Quality Assurance** - Automated linting and type checking
- **Comprehensive Testing** - Unit and integration tests with coverage
- **Security Scanning** - Vulnerability detection in dependencies and containers
- **Build Verification** - Ensures application compiles correctly
- **Container Creation** - Docker images built and tested locally
- **Registry Publishing** - Images available for future deployment

### 🔄 Ready for Production:
- **Conditional Deployment** - Automatically deploys when VPS is available
- **Health Monitoring** - Post-deployment verification
- **Rollback Capability** - Previous versions available in Docker Hub
- **Scalable Architecture** - Ready for Kubernetes deployment

## 📋 Pipeline Outputs

### Build Artifacts:
- **Docker Images**: `nkdhd/event-booking-app:TIMESTAMP-COMMIT`
- **Test Reports**: JUnit XML and HTML coverage reports
- **Security Reports**: Trivy vulnerability scans
- **Build Logs**: Complete execution history

### Quality Gates:
- **Test Coverage**: Minimum 80% required
- **Security**: No critical vulnerabilities allowed
- **Code Quality**: ESLint and TypeScript checks must pass
- **Build Success**: Application must compile and start

## 🔍 Monitoring and Notifications

### Slack Integration:
```groovy
slackSend(
    channel: '#deployments',
    color: 'good',
    message: "✅ Event Booking System - Deployment Successful"
)
```

### Email Notifications:
- Build success/failure alerts
- Security vulnerability reports
- Test coverage reports

### GitHub Integration:
- Commit status updates
- Pull request checks
- Automated webhook triggers

## 🛠️ Troubleshooting

### Common Issues:

1. **Docker Permission Denied**
   ```bash
   sudo usermod -aG docker $USER
   newgrp docker
   ```

2. **Jenkins Plugin Issues**
   ```bash
   ./jenkins-cli.sh install-plugin docker-workflow
   ./jenkins-cli.sh restart
   ```

3. **Build Failures**
   - Check Node.js version compatibility
   - Verify Docker daemon is running
   - Ensure sufficient disk space

### Debug Commands:
```bash
# Monitor Jenkins
./monitor-jenkins.sh

# View Jenkins logs
docker logs -f event-booking-jenkins

# Test Docker build locally
docker build -t test-build .
```

## 📚 Additional Resources

- [Jenkins Pipeline Documentation](https://www.jenkins.io/doc/book/pipeline/)
- [Docker Multi-stage Builds](https://docs.docker.com/develop/dev-best-practices/dockerfile_best-practices/)
- [Trivy Security Scanner](https://aquasecurity.github.io/trivy/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

**Note**: This CI/CD pipeline is designed for the Software Architecture course and provides comprehensive automation while being flexible enough to work with or without full infrastructure deployment.

## Setup Instructions

1. Install Jenkins
2. Configure GitHub integration
3. Set up pipeline job
4. Configure deployment credentials
5. Test pipeline execution
