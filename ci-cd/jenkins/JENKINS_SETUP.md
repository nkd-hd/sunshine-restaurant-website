# Jenkins CI/CD Setup Guide

## 🚀 Jenkins Installation & Configuration

### Current Status
✅ **Jenkins is now running!**
- **URL**: http://localhost:8080
- **Container**: jenkins-ci
- **Initial Admin Password**: `3e74ec92a4d3480e8291ddc5b2edd7f0`

### 1. Initial Setup

1. **Access Jenkins**: Open http://localhost:8080 in your browser
2. **Unlock Jenkins**: Enter the initial admin password: `3e74ec92a4d3480e8291ddc5b2edd7f0`
3. **Install Plugins**: Choose "Install suggested plugins"
4. **Create Admin User**: Set up your admin account
5. **Instance Configuration**: Keep default URL (http://localhost:8080/)

### 2. Required Plugins

Install these additional plugins for our CI/CD pipeline:

```
- Docker Pipeline
- GitHub Integration
- Blue Ocean (for modern UI)
- Pipeline: Stage View
- Build Timeout
- Timestamper
- Workspace Cleanup
- Slack Notification
- Email Extension
- NodeJS
- Coverage (for test coverage)
```

### 3. Global Tool Configuration

Navigate to **Manage Jenkins > Global Tool Configuration**:

#### NodeJS Installation
- Name: `NodeJS-18`
- Version: `NodeJS 18.x`
- Global npm packages: `npm@latest`

#### Docker Installation
- Name: `Docker`
- Installation root: `/usr/bin/docker`

### 4. System Configuration

Navigate to **Manage Jenkins > Configure System**:

#### GitHub Configuration
- Add GitHub Server
- API URL: `https://api.github.com`
- Credentials: Add your GitHub token

#### Docker Configuration
- Docker Host URI: `unix:///var/run/docker.sock`
- Enable Docker Cloud if needed

### 5. Credentials Setup

Navigate to **Manage Jenkins > Manage Credentials > System > Global credentials**:

#### Required Credentials
1. **GitHub Token** (Secret text)
   - ID: `github-token`
   - Description: `GitHub API Token`

2. **Docker Hub** (Username with password)
   - ID: `docker-hub-credentials`
   - Username: `nkdhd`
   - Password: `[Your Docker Hub Password]`

3. **GCP VM SSH Key** (SSH Username with private key)
   - ID: `gcp-vm-ssh`
   - Username: `nkd`
   - Private Key: `[Your SSH Private Key]`

4. **Slack Webhook** (Secret text)
   - ID: `slack-webhook`
   - Secret: `[Your Slack Webhook URL]`

### 6. Pipeline Creation

#### Method 1: Pipeline from SCM
1. **New Item** > **Pipeline**
2. **Pipeline Definition**: Pipeline script from SCM
3. **SCM**: Git
4. **Repository URL**: `https://github.com/yourusername/event-booking-system.git`
5. **Script Path**: `Jenkinsfile`

#### Method 2: Multibranch Pipeline
1. **New Item** > **Multibranch Pipeline**
2. **Branch Sources**: GitHub
3. **Repository**: `yourusername/event-booking-system`
4. **Scan Repository Triggers**: Periodically if not otherwise run (1 hour)

### 7. Webhook Configuration

#### GitHub Webhook
1. Go to your GitHub repository settings
2. **Webhooks** > **Add webhook**
3. **Payload URL**: `http://your-jenkins-url:8080/github-webhook/`
4. **Content type**: `application/json`
5. **Events**: Push events, Pull requests

### 8. Pipeline Features

Our Jenkinsfile includes:

#### Stages
- ✅ **Checkout**: Source code retrieval
- ✅ **Environment Setup**: Node.js and dependencies
- ✅ **Code Quality**: ESLint, TypeScript checks
- ✅ **Security Audit**: npm audit
- ✅ **Testing**: Unit and integration tests
- ✅ **Coverage**: Test coverage reporting
- ✅ **Build**: Next.js application build
- ✅ **Docker Build**: Container image creation
- ✅ **Security Scan**: Trivy vulnerability scanning
- ✅ **Push Registry**: Docker Hub deployment
- ✅ **Deploy**: Production deployment
- ✅ **Health Check**: Post-deployment verification

#### Parallel Execution
- Code quality checks run in parallel
- Test suites execute simultaneously
- Faster pipeline execution

#### Conditional Deployment
- **Staging**: Deploys on `develop` branch
- **Production**: Deploys on `main` branch with approval

### 9. Monitoring & Notifications

#### Build Status
- **Blue Ocean UI**: Modern pipeline visualization
- **Stage View**: Detailed stage breakdown
- **Build History**: Historical build data

#### Notifications
- **Slack**: Real-time build notifications
- **Email**: Build failure alerts
- **GitHub**: Commit status updates

### 10. Pipeline Commands

#### Manual Triggers
```bash
# Trigger build via CLI
curl -X POST http://localhost:8080/job/event-booking-system/build \
  --user admin:your-api-token

# Trigger with parameters
curl -X POST http://localhost:8080/job/event-booking-system/buildWithParameters \
  --user admin:your-api-token \
  --data "BRANCH=develop&DEPLOY_ENV=staging"
```

#### Local Testing
```bash
# Run the local Jenkins demo
./ci-cd/jenkins/local-jenkins-demo.sh

# Test individual stages
npm run lint
npm run test:unit
npm run build
docker build -t test-image .
```

### 11. Troubleshooting

#### Common Issues

**Docker Permission Denied**
```bash
# Add jenkins user to docker group
docker exec -u root jenkins-ci usermod -aG docker jenkins
docker restart jenkins-ci
```

**Node.js Not Found**
- Verify NodeJS plugin installation
- Check Global Tool Configuration
- Restart Jenkins after configuration

**GitHub Webhook Not Triggering**
- Verify webhook URL accessibility
- Check GitHub webhook delivery logs
- Ensure Jenkins GitHub plugin is configured

**Build Failures**
- Check console output in Jenkins
- Verify environment variables
- Test commands locally first

### 12. Security Best Practices

#### Access Control
- Enable security realm
- Use role-based authorization
- Limit anonymous access

#### Credentials Management
- Use Jenkins credential store
- Rotate credentials regularly
- Avoid hardcoded secrets

#### Network Security
- Use HTTPS in production
- Restrict Jenkins access
- Secure webhook endpoints

### 13. Backup & Maintenance

#### Regular Backups
```bash
# Backup Jenkins home
docker exec jenkins-ci tar -czf /tmp/jenkins-backup.tar.gz /var/jenkins_home
docker cp jenkins-ci:/tmp/jenkins-backup.tar.gz ./jenkins-backup.tar.gz
```

#### Updates
- Regular plugin updates
- Jenkins core updates
- Security patch monitoring

### 14. Next Steps

1. **Complete Jenkins Setup**: Follow the initial setup wizard
2. **Configure Credentials**: Add all required credentials
3. **Create Pipeline**: Set up the multibranch pipeline
4. **Test Pipeline**: Trigger a test build
5. **Configure Webhooks**: Enable automatic builds
6. **Monitor Builds**: Use Blue Ocean for visualization

### 15. Alternative: GitHub Actions

If you prefer GitHub Actions over Jenkins, use the workflow file:
- `.github/workflows/ci-cd.yml` (already created)
- Simpler setup for GitHub-hosted projects
- No local infrastructure required

---

## 📋 Quick Reference

### Jenkins URLs
- **Main Dashboard**: http://localhost:8080
- **Blue Ocean**: http://localhost:8080/blue
- **Manage Jenkins**: http://localhost:8080/manage

### Container Commands
```bash
# Start Jenkins
docker start jenkins-ci

# Stop Jenkins
docker stop jenkins-ci

# View logs
docker logs jenkins-ci

# Access container
docker exec -it jenkins-ci bash
```

### Pipeline Status
- ✅ Jenkinsfile created
- ✅ GitHub Actions workflow created
- ✅ Local demo script created
- ✅ Jenkins container running
- 🔄 Manual setup required (credentials, plugins)

**Ready for CI/CD Pipeline Setup!** 🎉
