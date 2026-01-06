pipeline {
  agent any
  options {
    timestamps()
    ansiColor('xterm')
  }
  environment {
    IMAGE_TAG = "${env.GIT_COMMIT ?: env.BUILD_NUMBER}"
    BACKEND_IMAGE = "${env.BACKEND_IMAGE ?: 'webapp-backend'}"
    FRONTEND_IMAGE = "${env.FRONTEND_IMAGE ?: 'webapp-frontend'}"
    RUN_COMPOSE_TESTS = "${env.RUN_COMPOSE_TESTS ?: 'false'}"
    BUILD_IMAGES = "${env.BUILD_IMAGES ?: 'false'}"
  }

  stages {
    stage('Backend checks') {
      agent {
        docker {
          image 'python:3.11-slim'
          args '-u root'
        }
      }
      steps {
        dir('backend') {
          sh 'pip install --no-cache-dir -r requirements.txt'
          sh 'python manage.py check'
          sh 'python manage.py migrate --noinput'
        }
      }
    }

    stage('Frontend build') {
      agent {
        docker {
          image 'node:18-alpine'
        }
      }
      steps {
        dir('frontend') {
          sh 'npm install'
          sh 'npm run build'
        }
      }
    }

    stage('Compose smoke test') {
      when {
        environment name: 'RUN_COMPOSE_TESTS', value: 'true'
      }
      steps {
        sh 'docker compose -f docker/docker-compose.yml up -d --build'
        sh 'sleep 8'
        sh 'curl -f http://localhost:8000/api/offerings/'
        sh '''curl -f -X POST -H "Content-Type: application/json" \
          -d '{"client_name":"CI","contact_email":"ci@example.com","scope":"smoke"}' \
          http://localhost:8000/api/requests/'''
      }
      post {
        always {
          sh 'docker compose -f docker/docker-compose.yml down -v'
        }
      }
    }

    stage('Docker images') {
      when {
        environment name: 'BUILD_IMAGES', value: 'true'
      }
      steps {
        script {
          def backendTag = "${BACKEND_IMAGE}:${IMAGE_TAG}"
          def frontendTag = "${FRONTEND_IMAGE}:${IMAGE_TAG}"

          sh "docker build -f docker/backend.Dockerfile -t ${backendTag} ."
          sh "docker build -f docker/frontend.Dockerfile -t ${frontendTag} ."

          if (env.REGISTRY?.trim()) {
            def backendRemote = "${env.REGISTRY}/${backendTag}"
            def frontendRemote = "${env.REGISTRY}/${frontendTag}"

            sh "docker tag ${backendTag} ${backendRemote}"
            sh "docker tag ${frontendTag} ${frontendRemote}"

            docker.withRegistry(env.REGISTRY, env.REGISTRY_CREDENTIALS ?: null) {
              sh "docker push ${backendRemote}"
              sh "docker push ${frontendRemote}"
            }
          } else {
            echo "REGISTRY not set; keeping images locally."
          }
        }
      }
    }
  }

  post {
    always {
      cleanWs()
    }
  }
}
