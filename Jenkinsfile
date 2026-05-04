pipeline {
    agent any

    environment {
        DOCKER_IMAGE_NAME = 'todo-app'
        DOCKERHUB_USERNAME = credentials('dockerhub-username')
        DOCKERHUB_PASSWORD = credentials('dockerhub-password')
        GITHUB_TOKEN = credentials('github-token')
        APP_VERSION = '1.0.0'
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code from GitHub...'
                checkout scm
            }
        }

        stage('Environment Info') {
            steps {
                echo "Building version: ${APP_VERSION}"
                echo "Node Version:"
                sh 'node --version'
                echo "NPM Version:"
                sh 'npm --version'
                echo "Docker Version:"
                sh 'docker --version'
            }
        }

        stage('Install Backend Dependencies') {
            steps {
                echo 'Installing backend dependencies...'
                sh 'npm install'
            }
        }

        stage('Run Backend Tests') {
            steps {
                echo 'Running backend tests...'
                sh 'npm test'
            }
        }

        stage('Install Frontend Dependencies') {
            steps {
                echo 'Installing frontend dependencies...'
                sh 'cd client && npm install && cd ..'
            }
        }

        stage('Lint Backend Code') {
            steps {
                echo 'Linting backend code...'
                sh 'npm run lint || true'
            }
        }

        stage('Build React Frontend') {
            steps {
                echo 'Building React frontend...'
                sh 'cd client && npm run build'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo 'Building Docker image...'
                sh """
                    docker build -t ${DOCKER_IMAGE_NAME}:${APP_VERSION} .
                    docker build -t ${DOCKER_IMAGE_NAME}:latest .
                    docker tag ${DOCKER_IMAGE_NAME}:${APP_VERSION} ${DOCKERHUB_USERNAME}/${DOCKER_IMAGE_NAME}:${APP_VERSION}
                    docker tag ${DOCKER_IMAGE_NAME}:latest ${DOCKERHUB_USERNAME}/${DOCKER_IMAGE_NAME}:latest
                """
            }
        }

        stage('Test Docker Image') {
            steps {
                echo 'Testing Docker image...'
                sh """
                    docker-compose up -d
                    sleep 10
                    curl -f http://localhost/health || exit 1
                    curl -f http://localhost/ || exit 1
                    docker-compose down
                """
            }
        }

        stage('Push to Docker Hub') {
            steps {
                echo 'Pushing Docker image to Docker Hub...'
                sh """
                    echo ${DOCKERHUB_PASSWORD} | docker login -u ${DOCKERHUB_USERNAME} --password-stdin
                    docker push ${DOCKERHUB_USERNAME}/${DOCKER_IMAGE_NAME}:${APP_VERSION}
                    docker push ${DOCKERHUB_USERNAME}/${DOCKER_IMAGE_NAME}:latest
                    docker logout
                """
            }
        }

        stage('Deploy to Staging') {
            steps {
                echo 'Deploying to staging environment...'
                sh """
                    ssh -o StrictHostKeyChecking=no ubuntu@${STAGING_SERVER} "
                        docker-compose down || true
                        docker pull ${DOCKERHUB_USERNAME}/${DOCKER_IMAGE_NAME}:latest
                        docker-compose up -d
                    "
                """
            }
        }

        stage('Staging Health Check') {
            steps {
                echo 'Checking staging environment health...'
                sh "curl -f http://${STAGING_SERVER}:80/health || exit 1"
            }
        }

        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                echo 'Deploying to production environment...'
                input message: 'Deploy to production?', ok: 'Deploy'
                sh """
                    ssh -o StrictHostKeyChecking=no ubuntu@${PRODUCTION_SERVER} "
                        docker-compose down || true
                        docker pull ${DOCKERHUB_USERNAME}/${DOCKER_IMAGE_NAME}:latest
                        docker-compose up -d
                    "
                """
            }
        }
    }

    post {
        always {
            echo 'Cleaning up...'
            sh 'docker-compose down || true'
            sh 'docker rmi ${DOCKER_IMAGE_NAME}:${APP_VERSION} ${DOCKER_IMAGE_NAME}:latest || true'
            cleanWs()
        }
        success {
            echo 'Pipeline completed successfully!'
            emailext(
                subject: "SUCCESS: Pipeline ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "Build completed successfully. Check console output at ${env.BUILD_URL}",
                to: 'team@example.com'
            )
        }
        failure {
            echo 'Pipeline failed!'
            emailext(
                subject: "FAILED: Pipeline ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "Build failed. Check console output at ${env.BUILD_URL}",
                to: 'team@example.com'
            )
        }
    }
}