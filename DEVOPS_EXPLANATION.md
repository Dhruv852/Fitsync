# 🚀 FitSync — DevOps Concepts Explained for Presentation
> **Project:** FitSync Fitness Tracker  
> **Author:** Dhruv Tiwari  
> **Purpose:** Explaining all DevOps concepts implemented in this project

---

## 📋 Table of Contents
1. [Overall DevOps Architecture](#1-overall-devops-architecture)
2. [Microservices Architecture](#2-microservices-architecture)
3. [Docker & Containerisation](#3-docker--containerisation)
4. [Docker Compose — Local Orchestration](#4-docker-compose--local-orchestration)
5. [Nginx — API Gateway / Reverse Proxy](#5-nginx--api-gateway--reverse-proxy)
6. [GitHub Actions — CI/CD Pipeline](#6-github-actions--cicd-pipeline)
7. [Jenkins Pipeline](#7-jenkins-pipeline)
8. [Secrets & Environment Variables](#8-secrets--environment-variables)
9. [Health Checks & Service Dependencies](#9-health-checks--service-dependencies)
10. [Named Volumes — Data Persistence](#10-named-volumes--data-persistence)
11. [How to Demo to Your Teacher](#11-how-to-demo-to-your-teacher)

---

## 1. Overall DevOps Architecture

```
  Developer Laptop
       │
       │  git push
       ▼
  GitHub Repository  ──────────────────────────────────────────────┐
       │                                                            │
       │ triggers                                                   │
       ▼                                                            ▼
  GitHub Actions                                            Jenkins (local/server)
  (Cloud CI/CD)                                             (Self-hosted CI/CD)
       │                                                            │
       │  1. Run Tests                                              │  1. Clone repo
       │  2. Build Docker images                                    │  2. docker-compose build
       │  3. Push to Docker Hub                                     │  3. docker-compose up -d
       ▼
  Docker Hub (Image Registry)
       │
       │  docker pull / docker-compose up
       ▼
  Production Server  (or local for demo)
  ┌─────────────────────────────────────────┐
  │  Nginx (Port 8080)  ← Single entry point│
  │    ├── /api/auth  → auth-service:3001   │
  │    ├── /api/fitness → fitness-svc:3002  │
  │    ├── /api/goals  → goal-service:3003  │
  │    └── /          → frontend:80         │
  └─────────────────────────────────────────┘
```

**Key DevOps Concepts Demonstrated:**
| Concept | Tool Used |
|---|---|
| Version Control | Git + GitHub |
| Containerisation | Docker |
| Container Orchestration (local) | Docker Compose |
| CI/CD Pipeline (cloud) | GitHub Actions |
| CI/CD Pipeline (self-hosted) | Jenkins |
| Image Registry | Docker Hub |
| Reverse Proxy / API Gateway | Nginx |
| Secret Management | GitHub Secrets |
| Infrastructure as Code | docker-compose.yml, Jenkinsfile, .github/workflows/ |

---

## 2. Microservices Architecture

**What is it?**
Instead of one giant application (monolith), the app is broken into small, independent services that each do ONE thing well.

```
FitSync Application
├── auth-service    (Port 3001) — Login, Register, JWT tokens
├── fitness-service (Port 3002) — Workouts, BMI tracking
├── goal-service    (Port 3003) — Fitness goals management
├── frontend        (Port 80)  — React/Vite SPA
└── nginx           (Port 8080) — Routes all traffic above
```

**Why Microservices?**
- Each service can be deployed, scaled, or updated **independently**
- A crash in goal-service does NOT crash auth-service
- Different services can even use different technologies/languages
- This is how Netflix, Amazon, and Uber build their systems

---

## 3. Docker & Containerisation

### What is Docker?
Docker packages an application and ALL its dependencies (Node.js, npm packages, config files) into a single portable unit called a **container**. It works identically on any machine — "works on my machine" problem is **eliminated**.

### Each Service Has a Dockerfile
Every microservice directory contains a `Dockerfile`:
```
auth-service/
├── Dockerfile      ← "Recipe" to build the container image
├── package.json
└── src/
```

### What a Dockerfile does (simplified):
```dockerfile
FROM node:20-alpine      # Start from official Node.js base image
WORKDIR /app             # Set working directory inside container
COPY package*.json ./    # Copy dependency list
RUN npm install          # Install dependencies
COPY . .                 # Copy all source code
EXPOSE 3001              # Tell Docker which port the app uses
CMD ["node", "server.js"] # Command to START the app
```

### Docker Key Concepts:
| Term | Meaning |
|---|---|
| **Image** | The blueprint/recipe (like a class in OOP) |
| **Container** | A running instance of an image (like an object) |
| **Dockerfile** | Instructions to build an image |
| **Docker Hub** | Cloud registry to store and share images |
| **Layer Caching** | Docker only rebuilds changed layers, making builds faster |

---

## 4. Docker Compose — Local Orchestration

**File:** `docker-compose.yml`

Docker Compose is a tool that lets you define and run **multiple containers at once** using a single YAML file.

### What `docker-compose up --build` does (step by step):
1. Reads `docker-compose.yml`
2. Builds Docker images for all 4 custom services (auth, fitness, goal, frontend)
3. Pulls `nginx:alpine` from Docker Hub (pre-built)
4. Creates a shared network called `fitsync-network`
5. Starts all 5 containers in the correct ORDER (respecting `depends_on`)
6. Maps port `8080` on your laptop to port `80` inside nginx
7. Attaches named volumes to persist data

### Key Sections Explained:

#### Services Block
```yaml
services:
  auth-service:          # Service name (also the DNS hostname inside Docker network)
    build: ./auth-service  # Build from this directory's Dockerfile
    container_name: fitsync-auth  # Human-readable container name
    environment:         # Environment variables passed INTO the container
      - PORT=3001
      - JWT_SECRET=${JWT_SECRET:-fitsync_jwt_secret_change_me}
    volumes:             # Mount named volume for data persistence
      - auth_data:/app/data
    networks:            # Connect to shared internal network
      - fitsync-network
    healthcheck:         # Docker checks if service is alive
      test: ["CMD", "wget", "-qO-", "http://localhost:3001/health"]
      interval: 30s
      retries: 3
```

#### depends_on with health checks
```yaml
  fitness-service:
    depends_on:
      auth-service:
        condition: service_healthy   # ← fitness-service only starts AFTER
                                     #   auth-service passes its healthcheck
```
This prevents race conditions — fitness-service won't crash because auth-service isn't ready yet.

#### Volumes (Data Persistence)
```yaml
volumes:
  auth_data:     # Named volume — data survives container restarts
  fitness_data:
  goal_data:
```
Without volumes, all user data is LOST when a container stops.

#### Networks (Container Communication)
```yaml
networks:
  fitsync-network:
    driver: bridge    # Internal virtual network only containers can see
```
Containers talk to each other by service name (e.g., `http://auth-service:3001`) — no need for external IPs.

---

## 5. Nginx — API Gateway / Reverse Proxy

**File:** `nginx/nginx.conf`

**What is a Reverse Proxy?**
Nginx sits in front of all services and routes incoming requests to the correct backend service. The client only ever talks to ONE port (8080).

```
Browser → http://localhost:8080/api/auth/login
                │
                ▼
           Nginx (port 8080)
                │
                │ matches /api/auth/*
                ▼
         auth-service:3001  (internal, not exposed to internet)
```

**Why Nginx as API Gateway?**
- Single entry point for all traffic
- Hides internal ports from the outside world
- Can handle SSL/TLS termination (HTTPS)
- Load balancing (if you have multiple instances)
- Serves the frontend static files

---

## 6. GitHub Actions — CI/CD Pipeline

**Files:**
- `.github/workflows/ci.yml` — Basic CI: Test + Build
- `.github/workflows/docker-publish.yml` — Full CD: Test → Build → Push to Docker Hub

### What is CI/CD?
- **CI (Continuous Integration):** Every time you push code, it is automatically tested and built
- **CD (Continuous Delivery/Deployment):** If tests pass, the new version is automatically packaged and delivered

### Workflow 1: `ci.yml` — The Basic CI Pipeline

```
git push to main/develop/master
          │
          ▼
    GitHub Action Triggered
          │
    ┌─────────────────────────┐
    │  Job: test-and-build     │
    │  Runs on: ubuntu-latest  │
    │                          │
    │  Step 1: Checkout code   │
    │  Step 2: Setup Node 20   │
    │  Step 3: npm test (auth) │
    │  Step 4: npm test (fit.) │
    │  Step 5: npm test (goal) │
    │  Step 6: npm run build   │
    │  Step 7: docker compose  │
    │          build           │
    └─────────────────────────┘
          │ (only on main branch)
          ▼
    ┌─────────────────────────┐
    │  Job: docker-hub-push    │
    │  (needs: test-and-build) │  ← Only runs if previous job PASSED
    │                          │
    │  Step 1: Login Docker Hub│
    │  Step 2: Build & Push    │
    │          auth-service    │
    └─────────────────────────┘
```

**Triggers (the `on:` block):**
```yaml
on:
  push:
    branches: [main, master, develop]    # fires on any push to these branches
  pull_request:
    branches: [main, master]             # fires when a PR is opened
```

**Why this matters:** Code that breaks the build is caught IMMEDIATELY before it can damage production.

---

### Workflow 2: `docker-publish.yml` — The Full CD Pipeline

This is the more advanced pipeline that publishes Docker images to Docker Hub.

#### Complete Flow:
```
git push to main  (or manual trigger)
          │
          ▼
  ┌──────────────────────────────────────┐
  │  Job 1: "✅ Run Tests"               │
  │  runs-on: ubuntu-latest              │
  │                                      │
  │  • Checkout code                     │
  │  • Setup Node.js 20 (with npm cache) │
  │  • npm ci + npm test (auth-service)  │
  │  • npm ci + npm test (fitness-svc)   │
  │  • npm ci + npm test (goal-service)  │
  │  • npm ci + npm run build (frontend) │
  └──────────────────────────────────────┘
          │  if all tests pass ↓
          ▼
  ┌──────────────────────────────────────────────────────┐
  │  Job 2: "🐳 Build & Push Docker Images"              │
  │  needs: test   ← BLOCKS until Job 1 passes           │
  │                                                      │
  │  Step 1: Checkout code                               │
  │  Step 2: Compute SHORT_SHA (e.g. "abc1234")          │
  │           from git commit hash                       │
  │  Step 3: Setup Docker Buildx (enables BuildKit)      │
  │  Step 4: Login to Docker Hub (using SECRETS)         │
  │  Step 5: Build & Push frontend image                 │
  │           Tags: username/app-ci:latest               │
  │                 username/app-ci:abc1234              │
  │  Step 6: Build & Push auth-service image             │
  │  Step 7: Build & Push fitness-service image          │
  │  Step 8: Build & Push goal-service image             │
  │  Step 9: Print summary table to GitHub UI            │
  └──────────────────────────────────────────────────────┘
          │
          ▼
  Docker Hub (public/private registry)
  └── username/app-ci:latest
  └── username/fitsync-auth:latest
  └── username/fitsync-fitness:latest
  └── username/fitsync-goal:latest
```

#### Key GitHub Actions Concepts Used:

**1. `uses:` — Reusable Actions**
```yaml
- uses: actions/checkout@v4          # Clones your repo onto the runner
- uses: actions/setup-node@v4        # Installs Node.js
- uses: docker/setup-buildx-action@v3  # Sets up advanced Docker builder
- uses: docker/login-action@v3       # Logs into Docker Hub securely
- uses: docker/build-push-action@v6  # Builds image and pushes to registry
```
These are pre-built, community-maintained building blocks — you don't write this logic yourself.

**2. `needs:` — Job Dependency**
```yaml
jobs:
  test:
    ...
  docker:
    needs: test    # ← docker job will NOT start unless test job succeeds
```
This enforces: **broken code never gets packaged into a Docker image.**

**3. `if:` — Conditional Execution**
```yaml
if: github.event_name == 'push' || github.event_name == 'workflow_dispatch'
```
Docker push only happens on actual code pushes, not on Pull Request checks.

**4. `workflow_dispatch:` — Manual Trigger**
```yaml
on:
  workflow_dispatch:   # Adds a "Run Workflow" button in GitHub UI
```
Allows running the pipeline manually without pushing code.

**5. Image Tagging Strategy**
```yaml
tags: |
  username/fitsync-auth:latest           # Rolling tag — always the newest
  username/fitsync-auth:abc1234          # Immutable tag — specific commit
```
- `latest` → always points to newest build
- `abc1234` (short git SHA) → lets you roll back to any specific commit

**6. Layer Cache (BuildKit)**
```yaml
cache-from: type=registry,ref=username/fitsync-auth:buildcache
cache-to:   type=registry,ref=username/fitsync-auth:buildcache,mode=max
```
Docker doesn't rebuild layers that haven't changed. This makes CI builds **2-5x faster** on subsequent runs.

---

## 7. Jenkins Pipeline

**File:** `Jenkinsfile`

Jenkins is a **self-hosted** CI/CD server — you run it on your own machine or server, unlike GitHub Actions which runs in GitHub's cloud.

### The Jenkinsfile (Declarative Pipeline):
```groovy
pipeline {
    agent any           // Run on any available Jenkins agent (worker node)

    environment {
        COMPOSE_PROJECT_NAME = 'fitsync'  // Sets env variable for all stages
    }

    stages {
        stage('Clone Repository') {    // Stage 1
            steps {
                echo 'Cloning FitSync repository...'
                checkout scm           // SCM = Source Control Management
                                       // Jenkins automatically clones the
                                       // repo that triggered the build
            }
        }

        stage('Docker Compose Build') {  // Stage 2
            steps {
                echo 'Building all microservice containers...'
                sh 'docker-compose build'  // sh = run shell command
            }
        }

        stage('Docker Compose Up') {    // Stage 3
            steps {
                echo 'Starting FitSync stack...'
                sh 'docker-compose up -d'  // -d = detached (background)
            }
        }
    }

    post {                           // Post-build actions
        success {
            echo 'FitSync deployed successfully on port 8080'
        }
        failure {
            echo 'Pipeline failed — check Docker and compose logs'
        }
    }
}
```

### How Jenkins Pipeline Stages Work:

```
git push → Jenkins webhook triggered
                │
                ▼
    ┌─────────────────────┐
    │  STAGE 1            │
    │  Clone Repository   │  ← Jenkins pulls code from GitHub
    │  checkout scm       │
    └─────────────────────┘
                │ success?
                ▼
    ┌─────────────────────┐
    │  STAGE 2            │
    │  Docker Compose     │  ← Builds all 5 container images
    │  Build              │
    └─────────────────────┘
                │ success?
                ▼
    ┌─────────────────────┐
    │  STAGE 3            │
    │  Docker Compose Up  │  ← Starts all containers in detached mode
    │                     │
    └─────────────────────┘
                │
        ┌───────┴────────┐
        ▼                ▼
    SUCCESS           FAILURE
    "Deployed         "Check Docker
     on port 8080"     logs"
```

### GitHub Actions vs Jenkins — Comparison:

| Feature | GitHub Actions | Jenkins |
|---|---|---|
| **Hosting** | GitHub's cloud (free tier) | Self-hosted on your machine/server |
| **Setup** | Just commit a `.yml` file | Requires installing Jenkins server |
| **Config Language** | YAML | Groovy (Jenkinsfile) |
| **Cost** | Free for public repos | Free software, you pay for server |
| **Integration** | Tightly tied to GitHub | Works with any Git host |
| **Scalability** | Auto-scaled by GitHub | You manage the agents |
| **Best For** | Quick CI for open-source | Enterprise, complex pipelines |
| **Our Use Case** | Automated Docker Hub push | Local deployment automation |

**In simple terms:**
- GitHub Actions = CI/CD as a service (someone else manages the servers)
- Jenkins = CI/CD on your own infrastructure (you manage everything)

---

## 8. Secrets & Environment Variables

### The Problem Without Secrets:
If you hard-code passwords in your code and push to GitHub:
```yaml
# BAD — NEVER DO THIS
password: myDockerHubPassword123   # Anyone can see this!
```

### GitHub Secrets Solution:
Secrets are stored **encrypted** in GitHub → Settings → Secrets and Variables → Actions.

```yaml
# GOOD — Secret is never visible in code or logs
- name: Login to Docker Hub
  uses: docker/login-action@v3
  with:
    username: ${{ secrets.DOCKERHUB_USERNAME }}  # resolved at runtime
    password: ${{ secrets.DOCKERHUB_TOKEN }}     # masked in all logs as ***
```

**Secrets used in this project:**
| Secret Name | What It Contains |
|---|---|
| `DOCKERHUB_USERNAME` | Your Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub Access Token (not password) — can be revoked |

### Environment Variables in Docker Compose:
```yaml
# .env.example (safe to commit — no real values)
JWT_SECRET=your_jwt_secret_here

# docker-compose.yml reads from .env file or uses default
environment:
  - JWT_SECRET=${JWT_SECRET:-fitsync_jwt_secret_change_me}
  #                          ↑ default value if variable not set
```

**The `.gitignore` file ensures `.env` (with real secrets) is NEVER pushed to GitHub.**

---

## 9. Health Checks & Service Dependencies

**Problem:** Container A starts but the app inside isn't ready yet. Container B tries to connect and fails.

**Solution:** Docker health checks + `condition: service_healthy`

```yaml
auth-service:
  healthcheck:
    test: ["CMD", "wget", "-qO-", "http://localhost:3001/health"]
    # ↑ Docker runs this command every 30 seconds
    interval: 30s
    timeout: 5s      # Must respond within 5 seconds
    retries: 3       # Fail 3 times before marking as unhealthy
    start_period: 15s  # Give 15 seconds grace period on startup

fitness-service:
  depends_on:
    auth-service:
      condition: service_healthy  # ← Only starts when auth is HEALTHY
```

**Timeline:**
```
t=0s:  auth-service container starts
t=15s: grace period ends, health checks begin
t=15s: health check #1 → GET /health → 200 OK ✅ → HEALTHY
t=15s: fitness-service starts (condition met!)
```

---

## 10. Named Volumes — Data Persistence

**Problem:** Containers are ephemeral — stopping a container deletes all data inside.

**Solution:** Named volumes (Docker-managed storage outside the container)

```yaml
services:
  auth-service:
    volumes:
      - auth_data:/app/data  # Maps named volume to path inside container

volumes:
  auth_data:      # Docker creates and manages this storage
  fitness_data:
  goal_data:
```

**What this means:**
```
docker-compose down         → Containers are DELETED
docker-compose up           → New containers start
                            → /app/data is re-mounted from auth_data volume
                            → ALL USER DATA IS STILL THERE ✅
```

---

## 11. How to Demo to Your Teacher

### Demo Script (5 minutes):

**Step 1 — Show the Architecture (2 min)**
- Open `docker-compose.yml` and explain the 5 services
- Point to `nginx/nginx.conf` — explain it's the API gateway
- Show the internal network `fitsync-network`

**Step 2 — Run Locally (1 min)**
```bash
# In terminal:
docker-compose up --build

# Open browser:
http://localhost:8080
```
Show 5 containers starting, nginx routing traffic

**Step 3 — Show GitHub Actions (1 min)**
- Go to GitHub → your repo → Actions tab
- Show the workflow runs (green = passed, red = failed)
- Open a run and show the stages: Test → Build → Push

**Step 4 — Show Jenkins Pipeline (1 min)**
- Open `Jenkinsfile` and explain the 3 stages
- If Jenkins is running locally, show the pipeline view with colored stages

### Key Points to Explain:

1. **"Why Docker?"**
   > "It eliminates the 'works on my machine' problem. The app runs identically on any computer that has Docker installed, whether it's a developer's MacBook or a Linux server in the cloud."

2. **"Why Docker Compose?"**
   > "Our app has 5 services that need to start in order and talk to each other. Docker Compose automates this with a single command instead of starting each container manually."

3. **"Why GitHub Actions?"**
   > "Every time I push code to GitHub, it automatically tests and packages my application without me doing anything manually. If tests fail, the broken code never reaches production."

4. **"Why Jenkins?"**
   > "Jenkins shows how CI/CD works on self-hosted infrastructure. In enterprises, companies often run their own Jenkins servers because they need more control over the build environment or have security requirements that prevent using cloud runners."

5. **"Why two CI systems?"**
   > "GitHub Actions handles cloud-based continuous integration and Docker Hub publishing. Jenkins demonstrates local/server-based deployment automation. Together they show the full DevOps lifecycle."

6. **"What are Secrets?"**
   > "Credentials like passwords should never be stored in code. GitHub Secrets encrypts them and injects them as environment variables at runtime, so they never appear in our repository or build logs."

---

## 📁 File Structure Summary

```
fitness-tracker/
│
├── .github/
│   └── workflows/
│       ├── ci.yml              ← GitHub Actions: Basic CI (Test + Build)
│       └── docker-publish.yml  ← GitHub Actions: Full CD (Push to Docker Hub)
│
├── Jenkinsfile                 ← Jenkins: 3-stage local deployment pipeline
│
├── docker-compose.yml          ← Docker Compose: Orchestrates all 5 services
│
├── nginx/
│   └── nginx.conf              ← Nginx: API Gateway / Reverse Proxy config
│
├── auth-service/
│   └── Dockerfile              ← Container recipe for auth microservice
├── fitness-service/
│   └── Dockerfile              ← Container recipe for fitness microservice
├── goal-service/
│   └── Dockerfile              ← Container recipe for goal microservice
├── frontend/
│   └── Dockerfile              ← Container recipe for frontend (Vite/React)
│
├── .env.example                ← Template showing required env variables
└── .gitignore                  ← Ensures .env (secrets) are never committed
```

---

*Generated for FitSync DevOps Presentation | May 2026*
