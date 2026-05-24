// FitSync — Minimal Jenkins Pipeline (beginner-friendly)
pipeline {
    agent any

    environment {
        COMPOSE_PROJECT_NAME = 'fitsync'
    }

    stages {
        stage('Clone Repository') {
            steps {
                echo 'Cloning FitSync repository...'
                checkout scm
            }
        }

        stage('Docker Compose Build') {
            steps {
                echo 'Building all microservice containers...'
                sh 'docker-compose build'
            }
        }

        stage('Docker Compose Up') {
            steps {
                echo 'Starting FitSync stack...'
                sh '''
                    docker rm -f fitsync-auth fitsync-fitness fitsync-goals fitsync-frontend fitsync-gateway 2>/dev/null || true
                    docker-compose down --remove-orphans 2>/dev/null || true
                    docker-compose up -d
                '''
            }
        }
    }

    post {
        success {
            echo 'FitSync deployed successfully on port 8080'
        }
        failure {
            echo 'Pipeline failed — check Docker and compose logs'
        }
    }
}
