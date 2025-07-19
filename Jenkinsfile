pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'docker.io'
        DOCKER_REPO = 'nkdhd/event-booking-app'
        NODE_VERSION = '18'
        BUILD_TIMESTAMP = sh(script: 'date +%Y%m%d-%H%M%S', returnStdout: true).trim()
        GIT_COMMIT_SHORT = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
        IMAGE_TAG = "${BUILD_TIMESTAMP}-${GIT_COMMIT_SHORT}"
        FULL_IMAGE_NAME = "${DOCKER_REPO}:${IMAGE_TAG}"
        LATEST_IMAGE_NAME = "${DOCKER_REPO}:latest"
    }
    
    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
    }
    
    triggers {
        githubPush()
        pollSCM('H/5 * * * *')
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo "🔄 Checking out source code..."
                checkout scm
                script {
                    env.GIT_COMMIT_MSG = sh(script: 'git log -1 --pretty=%B', returnStdout: true).trim()
                }
                echo "📝 Commit: ${env.GIT_COMMIT_SHORT}"
                echo "💬 Message: ${env.GIT_COMMIT_MSG}"
            }
        }
        
        stage('Environment Setup') {
            steps {
                echo "🔧 Setting up build environment..."
                sh '''
                    echo "Node.js version: $(node --version)"
                    echo "npm version: $(npm --version)"
                    echo "Docker version: $(docker --version)"
                '''
            }
        }
        
        stage('Install Dependencies') {
            steps {
                echo "📦 Installing dependencies..."
                sh 'npm ci'
                sh 'npm ls --depth=0'
            }
        }
        
        stage('Code Quality & Security') {
            parallel {
                stage('Lint') {
                    steps {
                        echo "🔍 Running ESLint..."
                        sh 'npm run lint'
                    }
                }
                stage('Type Check') {
                    steps {
                        echo "🔍 Running TypeScript type check..."
                        sh 'npm run typecheck'
                    }
                }
                stage('Security Audit') {
                    steps {
                        echo "🔒 Running security audit..."
                        sh 'npm audit --audit-level=moderate'
                    }
                }
            }
        }
        
        stage('Tests') {
            parallel {
                stage('Unit Tests') {
                    steps {
                        echo "🧪 Running unit tests..."
                        sh '''
                            export DATABASE_URL="mysql://root:testpass@mysql-test:3306/test_db"
                            npm run test:unit
                        '''
                    }
                    post {
                        always {
                            publishTestResults testResultsPattern: 'test-results/unit/junit.xml'
                        }
                    }
                }
                stage('Integration Tests') {
                    steps {
                        echo "🧪 Running integration tests..."
                        sh '''
                            export DATABASE_URL="mysql://root:testpass@mysql-test:3306/test_db"
                            export AUTH_SECRET="test-secret"
                            export NEXTAUTH_URL="http://localhost:3000"
                            npm run test:integration
                        '''
                    }
                    post {
                        always {
                            publishTestResults testResultsPattern: 'test-results/integration/junit.xml'
                        }
                    }
                }
            }
        }
        
        stage('Test Coverage') {
            steps {
                echo "📊 Generating test coverage..."
                sh '''
                    export DATABASE_URL="mysql://root:testpass@mysql-test:3306/test_db"
                    npm run test:coverage
                '''
                publishCoverage adapters: [
                    istanbulCoberturaAdapter('coverage/cobertura-coverage.xml')
                ], sourceFileResolver: sourceFiles('STORE_LAST_BUILD')
            }
        }
        
        stage('Build Application') {
            steps {
                echo "🏗️ Building Next.js application..."
                sh '''
                    export NODE_ENV=production
                    export SKIP_ENV_VALIDATION=1
                    export DATABASE_URL="mysql://dummy:dummy@localhost:3306/dummy"
                    npm run build
                '''
                archiveArtifacts artifacts: '.next/**/*', allowEmptyArchive: true
            }
        }
        
        stage('Build Docker Image') {
            steps {
                echo "🐳 Building Docker image..."
                script {
                    def image = docker.build(
                        "${FULL_IMAGE_NAME}",
                        "--build-arg NODE_ENV=production --build-arg BUILD_TIMESTAMP=${BUILD_TIMESTAMP} --build-arg GIT_COMMIT=${GIT_COMMIT_SHORT} ."
                    )
                    
                    // Tag as latest
                    image.tag("latest")
                    
                    // Store image for later stages
                    env.DOCKER_IMAGE_ID = image.id
                }
            }
        }
        
        stage('Security Scan') {
            steps {
                echo "🔒 Scanning Docker image for vulnerabilities..."
                sh '''
                    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
                        -v $PWD:/tmp/.cache/ \
                        aquasec/trivy:latest image \
                        --exit-code 0 \
                        --severity HIGH,CRITICAL \
                        --format json \
                        --output /tmp/.cache/trivy-report.json \
                        ${FULL_IMAGE_NAME}
                '''
                archiveArtifacts artifacts: 'trivy-report.json', allowEmptyArchive: true
            }
        }
        
        stage('Push to Registry') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                echo "📤 Pushing Docker image to registry..."
                script {
                    docker.withRegistry('https://index.docker.io/v1/', 'docker-hub-credentials') {
                        def image = docker.image("${FULL_IMAGE_NAME}")
                        image.push()
                        image.push("latest")
                    }
                }
            }
        }
        
        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                echo "🚀 Deploying to staging environment..."
                sh '''
                    ssh -o StrictHostKeyChecking=no staging-server "
                        cd /opt/event-booking-system-staging &&
                        docker-compose pull app &&
                        docker-compose up -d app &&
                        docker system prune -f
                    "
                '''
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                echo "🚀 Deploying to production environment..."
                script {
                    timeout(time: 5, unit: 'MINUTES') {
                        input message: 'Deploy to production?', ok: 'Deploy',
                              submitterParameter: 'DEPLOYER'
                    }
                }
                sh '''
                    ssh -o StrictHostKeyChecking=no ${GCP_VM_HOST} "
                        cd /opt/event-booking-system &&
                        docker-compose pull app &&
                        docker-compose up -d app &&
                        docker system prune -f
                    "
                '''
            }
        }
        
        stage('Health Check') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                echo "🏥 Running health checks..."
                script {
                    def healthUrl = env.BRANCH_NAME == 'main' ? 
                        "http://${env.GCP_VM_HOST}:3000/api/health" : 
                        "http://staging-server:3000/api/health"
                    
                    sh """
                        sleep 30
                        curl -f ${healthUrl} || exit 1
                    """
                }
            }
        }
    }
    
    post {
        always {
            echo "🧹 Cleaning up..."
            sh '''
                docker system prune -f
                npm cache clean --force
            '''
        }
        success {
            echo "✅ Pipeline completed successfully!"
            slackSend(
                channel: '#deployments',
                color: 'good',
                message: ":white_check_mark: *${env.JOB_NAME}* - Build #${env.BUILD_NUMBER} succeeded\n" +
                        "Branch: ${env.BRANCH_NAME}\n" +
                        "Commit: ${env.GIT_COMMIT_SHORT}\n" +
                        "Message: ${env.GIT_COMMIT_MSG}\n" +
                        "Duration: ${currentBuild.durationString}\n" +
                        "Image: ${env.FULL_IMAGE_NAME}"
            )
        }
        failure {
            echo "❌ Pipeline failed!"
            slackSend(
                channel: '#deployments',
                color: 'danger',
                message: ":x: *${env.JOB_NAME}* - Build #${env.BUILD_NUMBER} failed\n" +
                        "Branch: ${env.BRANCH_NAME}\n" +
                        "Commit: ${env.GIT_COMMIT_SHORT}\n" +
                        "Message: ${env.GIT_COMMIT_MSG}\n" +
                        "Duration: ${currentBuild.durationString}"
            )
        }
        unstable {
            echo "⚠️ Pipeline completed with warnings!"
            slackSend(
                channel: '#deployments',
                color: 'warning',
                message: ":warning: *${env.JOB_NAME}* - Build #${env.BUILD_NUMBER} unstable\n" +
                        "Branch: ${env.BRANCH_NAME}\n" +
                        "Commit: ${env.GIT_COMMIT_SHORT}\n" +
                        "Duration: ${currentBuild.durationString}"
            )
        }
    }
}
