# 🏗️ Software Architecture Course Deployment Plan

## 📋 Executive Summary

**Project**: Event Booking System Architecture Deployment
**Timeline**: 6-8 weeks
**Risk Level**: Medium-High
**Primary Challenge**: Migration from Netlify serverless to VPS + Kubernetes infrastructure

## 🎯 Course Requirements Mapping

| Requirement | Current State | Effort Level | Priority |
|-------------|---------------|--------------|----------|
| 1. Infrastructure Setup (15 marks) | Netlify serverless | 🟡 Medium | High |
| 2. Scrum Application (5 marks) | No formal process | 🟢 Low | Low |
| 3. Jenkins CI/CD (10 marks) | Netlify auto-deploy | 🔴 High | High |
| 4. Prometheus/Grafana (2.5 marks) | No monitoring | 🟡 Medium | Medium |
| 5. Ansible IaC (2.5 marks) | Manual setup | 🟡 Medium | Medium |
| 6. Robust Testing (10 marks) | Basic DB tests | 🟡 Medium | High |
| 7. Kubernetes (15 marks) | No containerization | 🔴 High | High |
| 8. Architecture Docs (20 marks) | Implicit architecture | 🟢 Low | Medium |
| 9. Innovation (10 marks) | Standard features | 🟢 Low | Low |
| 10. Documentation (15 marks) | Basic README | 🟢 Low | Medium |

## 🚀 Phase 1: Immediate Action Steps (Week 1)

### Step 1: Git Workflow Setup
```bash
# 1. Create architecture branch
git checkout main
git pull origin main
git checkout -b feature/architecture-deployment
git push -u origin feature/architecture-deployment

# 2. Create backup branch
git checkout -b backup/pre-architecture-$(date +%Y%m%d)
git push -u origin backup/pre-architecture-$(date +%Y%m%d)
git checkout feature/architecture-deployment
```

### Step 2: VPS Infrastructure Provisioning
**Recommended Provider**: DigitalOcean (cost-effective, good documentation)

**VPS Specifications**:
- **CPU**: 2 vCPUs
- **RAM**: 4GB
- **Storage**: 80GB SSD
- **OS**: Ubuntu 22.04 LTS

**Initial Server Setup**:
```bash
# Connect to VPS
ssh root@your-vps-ip

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install Nginx
apt install nginx -y

# Configure firewall
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw allow 3000
ufw allow 8080
ufw --force enable
```

### Step 3: Basic Containerization
Create `Dockerfile` in project root:
```dockerfile
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
```

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - AUTH_SECRET=${AUTH_SECRET}
    restart: unless-stopped
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - app
    restart: unless-stopped
```

### Step 4: Testing Infrastructure
```bash
# Test local Docker build
docker build -t event-booking-system .
docker run -p 3000:3000 event-booking-system

# Test on VPS
scp -r . root@your-vps-ip:/opt/event-booking-system
ssh root@your-vps-ip
cd /opt/event-booking-system
docker-compose up -d
```

## 📊 Week 1 Deliverables

- [ ] VPS provisioned and configured
- [ ] Docker containerization working locally
- [ ] Basic deployment to VPS successful
- [ ] Git workflow documented
- [ ] Infrastructure diagram created

## ⚠️ Risk Assessment & Mitigation

### High-Risk Areas
1. **Kubernetes Learning Curve** - Allocate extra time for K8s tutorials
2. **Jenkins Configuration** - Use Jenkins Docker image for faster setup
3. **Database Migration** - Test thoroughly in staging environment

### Mitigation Strategies
1. **Parallel Development** - Keep Netlify deployment active during transition
2. **Incremental Testing** - Test each component independently
3. **Documentation** - Document every step for troubleshooting

## 🔄 Next Steps (Week 2)

1. **Jenkins Setup** - Install and configure CI/CD pipeline
2. **Kubernetes Cluster** - Set up minikube or k3s
3. **Monitoring Foundation** - Install Prometheus and Grafana
4. **Testing Framework** - Add Jest and testing infrastructure

## 📞 Support Resources

- **DigitalOcean Tutorials**: https://www.digitalocean.com/community/tutorials
- **Kubernetes Documentation**: https://kubernetes.io/docs/
- **Jenkins Documentation**: https://www.jenkins.io/doc/
- **Course Support**: Leverage instructor office hours for complex issues

---

**Next Document**: `JENKINS-SETUP-GUIDE.md` (to be created in Week 2)
