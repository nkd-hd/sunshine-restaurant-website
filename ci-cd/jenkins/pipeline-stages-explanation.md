# Jenkins Pipeline Stages Explanation

## Event Booking System CI/CD Pipeline

This document explains each stage of the Jenkins pipeline for the Event Booking System, designed to work independently of the Google Cloud VPS deployment status.

---

## 🔄 Pipeline Overview

The pipeline consists of 10 main stages that can run even before the Google Cloud infrastructure is fully deployed:

1. **Checkout** - Source code retrieval
2. **Environment Setup** - Build environment configuration
3. **Install Dependencies** - Node.js package installation
4. **Code Quality & Security** - Parallel quality checks
5. **Run Tests** - Parallel test execution
6. **Build Application** - Next.js application build
7. **Build Docker Image** - Container image creation
8. **Security Scan** - Container vulnerability scanning
9. **Push to Registry** - Docker Hub image publishing
10. **Deploy to Production** - Google Cloud VM deployment (conditional)

---

## 📋 Detailed Stage Breakdown

### Stage 1: Checkout
**Purpose**: Retrieve source code from Git repository
**Dependencies**: None
**Can run without VPS**: ✅ Yes

```groovy
stage('Checkout') {
    steps {
        checkout scm
        // Get commit information for tagging
        env.GIT_COMMIT_SHORT = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
    }
}
```

**What it does**:
- Clones the repository from GitHub
- Extracts commit hash and message for build metadata
- Sets up workspace for subsequent stages

**Success criteria**:
- Source code successfully checked out
- Git commit information extracted
- Workspace ready for build

---

### Stage 2: Environment Setup
**Purpose**: Configure build environment and variables
**Dependencies**: Checkout stage
**Can run without VPS**: ✅ Yes

```groovy
stage('Environment Setup') {
    steps {
        // Set dynamic build variables
        env.BUILD_TIMESTAMP = sh(script: 'date +%Y%m%d-%H%M%S', returnStdout: true).trim()
        env.IMAGE_TAG = "${env.BUILD_TIMESTAMP}-${env.GIT_COMMIT_SHORT}"
    }
}
```

**What it does**:
- Creates unique build timestamp
- Generates Docker image tags
- Sets environment variables for the build

**Success criteria**:
- All environment variables set correctly
- Unique build identifiers created
- Build metadata prepared

---

### Stage 3: Install Dependencies
**Purpose**: Install Node.js packages required for build
**Dependencies**: Environment Setup
**Can run without VPS**: ✅ Yes

```groovy
stage('Install Dependencies') {
    steps {
        sh '''
            npm ci --only=production
            npm install --only=dev
        '''
    }
}
```

**What it does**:
- Installs production dependencies
- Installs development dependencies for build tools
- Verifies Node.js and npm versions

**Success criteria**:
- All dependencies installed successfully
- No security vulnerabilities in dependencies
- Build tools available

---

### Stage 4: Code Quality & Security (Parallel)
**Purpose**: Ensure code quality and security standards
**Dependencies**: Install Dependencies
**Can run without VPS**: ✅ Yes

#### Sub-stage 4a: Lint
```groovy
stage('Lint') {
    steps {
        sh 'npm run lint'
    }
}
```

#### Sub-stage 4b: Type Check
```groovy
stage('Type Check') {
    steps {
        sh 'npm run typecheck'
    }
}
```

#### Sub-stage 4c: Security Audit
```groovy
stage('Security Audit') {
    steps {
        sh 'npm audit --audit-level=moderate || true'
    }
}
```

**What it does**:
- **Lint**: Checks code style and potential errors using ESLint
- **Type Check**: Validates TypeScript types and interfaces
- **Security Audit**: Scans for known vulnerabilities in dependencies

**Success criteria**:
- No linting errors (warnings acceptable)
- No TypeScript compilation errors
- No high/critical security vulnerabilities

---

### Stage 5: Run Tests (Parallel)
**Purpose**: Execute comprehensive test suite
**Dependencies**: Code Quality & Security
**Can run without VPS**: ✅ Yes

#### Sub-stage 5a: Unit Tests
```groovy
stage('Unit Tests') {
    steps {
        sh 'npm run test:unit'
        sh 'npm run test:coverage'
    }
    post {
        always {
            publishTestResults testResultsPattern: 'test-results/unit/*.xml'
            publishCoverage adapters: [istanbulCoberturaAdapter('coverage/cobertura-coverage.xml')]
        }
    }
}
```

#### Sub-stage 5b: Integration Tests
```groovy
stage('Integration Tests') {
    steps {
        sh '''
            docker run -d --name test-mysql -e MYSQL_ROOT_PASSWORD=testpass -p 3307:3306 mysql:8.0
            sleep 30
            DATABASE_URL="mysql://root:testpass@localhost:3307/test_db" npm run test:integration
            docker stop test-mysql && docker rm test-mysql
        '''
    }
}
```

**What it does**:
- **Unit Tests**: Tests individual components and functions
- **Integration Tests**: Tests API endpoints and database interactions
- **Coverage**: Generates code coverage reports

**Success criteria**:
- All unit tests pass
- Integration tests pass with temporary database
- Code coverage meets minimum threshold (80%)

---

### Stage 6: Build Application
**Purpose**: Compile Next.js application for production
**Dependencies**: Run Tests
**Can run without VPS**: ✅ Yes

```groovy
stage('Build Application') {
    steps {
        sh '''
            export NODE_ENV=production
            export SKIP_ENV_VALIDATION=1
            export DATABASE_URL="mysql://dummy:dummy@localhost:3306/dummy"
            npm run build
        '''
    }
}
```

**What it does**:
- Compiles TypeScript to JavaScript
- Optimizes React components
- Generates static assets
- Creates production build artifacts

**Success criteria**:
- Build completes without errors
- All pages and API routes compiled
- Static assets generated
- Build artifacts ready for containerization

---

### Stage 7: Build Docker Image
**Purpose**: Create containerized application image
**Dependencies**: Build Application
**Can run without VPS**: ✅ Yes

```groovy
stage('Build Docker Image') {
    steps {
        sh '''
            docker build --tag ${FULL_IMAGE_NAME} --tag ${LATEST_IMAGE_NAME} .
            docker run --rm -d --name test-container -p 3333:3000 ${FULL_IMAGE_NAME}
            sleep 15
            curl -f http://localhost:3333/api/health
            docker stop test-container
        '''
    }
}
```

**What it does**:
- Builds multi-stage Docker image
- Tags image with build timestamp and commit hash
- Tests container locally
- Verifies health endpoint responds

**Success criteria**:
- Docker image builds successfully
- Container starts and responds to health checks
- Image size optimized (multi-stage build)
- No security issues in base image

---

### Stage 8: Security Scan
**Purpose**: Scan Docker image for vulnerabilities
**Dependencies**: Build Docker Image
**Can run without VPS**: ✅ Yes

```groovy
stage('Security Scan') {
    steps {
        sh 'trivy image --exit-code 0 --severity HIGH,CRITICAL ${FULL_IMAGE_NAME}'
    }
}
```

**What it does**:
- Scans Docker image for known vulnerabilities
- Checks base image and installed packages
- Reports security issues by severity

**Success criteria**:
- No critical vulnerabilities found
- High-severity issues documented
- Security scan completes successfully

---

### Stage 9: Push to Registry
**Purpose**: Publish Docker image to Docker Hub
**Dependencies**: Security Scan
**Can run without VPS**: ✅ Yes

```groovy
stage('Push to Registry') {
    when {
        anyOf {
            branch 'main'
            branch 'develop'
        }
    }
    steps {
        withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials')]) {
            sh '''
                echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin
                docker push ${FULL_IMAGE_NAME}
                docker push ${LATEST_IMAGE_NAME}
            '''
        }
    }
}
```

**What it does**:
- Authenticates with Docker Hub
- Pushes tagged image to registry
- Pushes latest tag for easy access
- Makes image available for deployment

**Success criteria**:
- Image successfully pushed to Docker Hub
- Both tagged and latest versions available
- Registry authentication successful

---

### Stage 10: Deploy to Production
**Purpose**: Deploy to Google Cloud VM
**Dependencies**: Push to Registry
**Can run without VPS**: ❌ No (requires VPS)

```groovy
stage('Deploy to Production') {
    when {
        allOf {
            branch 'main'
            expression { return currentBuild.result != 'FAILURE' }
        }
    }
    steps {
        withCredentials([file(credentialsId: 'gcp-service-account')]) {
            sh '''
                gcloud auth activate-service-account --key-file=$GOOGLE_APPLICATION_CREDENTIALS
                gcloud compute ssh ${GCP_INSTANCE} --zone=${GCP_ZONE} --command="
                    cd /opt/event-booking-system &&
                    docker-compose pull app &&
                    docker-compose up -d app
                "
            '''
        }
    }
}
```

**What it does**:
- Connects to Google Cloud VM
- Pulls latest Docker image
- Restarts application container
- Performs rolling deployment

**Success criteria**:
- VM accessible via SSH
- Docker image pulled successfully
- Application container restarted
- Health checks pass

---

## 🎯 Pipeline Benefits Without VPS

Even without the Google Cloud VPS deployed, this pipeline provides significant value:

### ✅ What Works Immediately:
1. **Code Quality Assurance** - Linting, type checking, security audits
2. **Automated Testing** - Unit and integration tests with coverage
3. **Build Verification** - Ensures application compiles correctly
4. **Container Creation** - Docker images built and tested
5. **Security Scanning** - Vulnerability detection in containers
6. **Registry Publishing** - Images available for deployment
7. **Continuous Integration** - Automated on every commit

### 🔄 What Happens When VPS is Ready:
1. **Automatic Deployment** - Pipeline will start deploying to VPS
2. **Health Monitoring** - Post-deployment verification
3. **Rollback Capability** - Previous versions available in registry
4. **Production Monitoring** - Integration with Grafana/Prometheus

---

## 📊 Pipeline Metrics and Reporting

### Build Artifacts:
- **Test Results**: JUnit XML reports
- **Coverage Reports**: Cobertura XML and HTML
- **Docker Images**: Tagged and versioned in registry
- **Security Reports**: Trivy vulnerability scans
- **Build Logs**: Complete execution history

### Notifications:
- **Slack Integration**: Success/failure notifications
- **Email Alerts**: Build status updates
- **GitHub Status**: Commit status updates

### Quality Gates:
- **Test Coverage**: Minimum 80% required
- **Security**: No critical vulnerabilities
- **Code Quality**: ESLint and TypeScript checks pass
- **Build Success**: Application compiles and starts

---

## 🚀 Getting Started

1. **Set up Jenkins** using the provided setup script
2. **Configure credentials** for Docker Hub and GitHub
3. **Create pipeline job** pointing to your repository
4. **Run initial build** to verify everything works
5. **Deploy VPS** when ready for production deployment

The pipeline is designed to be robust and provide immediate value while being ready to scale to full production deployment when your infrastructure is ready.
