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
                sh 'docker-compose up -d'
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
