# FitSync – DevOps Enabled Fitness Tracker Platform

A production-ready fitness tracking web application built with **microservices architecture**, **JSON file storage** (no database), and a full **DevOps pipeline** (Docker, Docker Compose, Nginx, GitHub Actions, Jenkins).

![CI](https://github.com/Dhruv852/Fitsync/actions/workflows/ci.yml/badge.svg)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![Node](https://img.shields.io/badge/Node-20-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Nginx](https://img.shields.io/badge/Nginx-Gateway-009639?logo=nginx&logoColor=white)
![Jenkins](https://img.shields.io/badge/Jenkins-Pipeline-D24939?logo=jenkins&logoColor=white)


---

## Project Overview

FitSync helps users track workouts, calories, water intake, weight, BMI, and fitness goals. The system is split into independent microservices behind an Nginx API gateway.

| Service | Port | Responsibility |
|---------|------|----------------|
| **auth-service** | 3001 | Register, login, JWT, user profile, streaks |
| **fitness-service** | 3002 | Workouts, water, weight, BMI, analytics |
| **goal-service** | 3003 | Goals, progress %, weekly summary |
| **frontend** | 80 | React SPA dashboard |
| **nginx** | 8080 (host) | Reverse proxy & routing |

---

## Architecture Diagram

```
                    ┌─────────────────────────────────────┐
                    │         Browser (User)              │
                    └─────────────────┬───────────────────┘
                                      │ :8080
                    ┌─────────────────▼───────────────────┐
                    │           Nginx Gateway              │
                    └─┬─────────┬─────────┬───────────────┘
                      │         │         │
         /api/auth ───┤         │         ├─── / (React SPA)
         /api/fitness ┤         │         │
         /api/goals ──┤         │         │
                      ▼         ▼         ▼
              ┌──────────┐ ┌──────────┐ ┌──────────┐
              │   Auth   │ │ Fitness  │ │   Goal   │
              │ Service  │ │ Service  │ │ Service  │
              └────┬─────┘ └────┬─────┘ └────┬─────┘
                   │            │            │
              users.json   workouts.json  goals.json
                           water.json
                           weights.json
```

**Data persistence:** Each service stores data in JSON files on Docker named volumes — no MongoDB, MySQL, or external database.

---

## Folder Structure

```
fitness-tracker/
├── frontend/                 # React + Tailwind + Chart.js
├── auth-service/             # JWT authentication
│   └── data/users.json
├── fitness-service/          # Workouts, water, weights
│   └── data/
├── goal-service/             # Fitness goals
│   └── data/goals.json
├── nginx/nginx.conf          # API gateway
├── docs/API.md               # REST API reference
├── docker-compose.yml
├── Jenkinsfile
├── .github/workflows/ci.yml
└── README.md
```

---

## Quick Start (Docker)

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### Run the full stack

```bash
cd fitness-tracker
docker-compose up --build
```

Open **http://localhost:8080** in your browser.

1. Click **Register** to create an account
2. Explore Dashboard, Workouts, Goals, BMI, and Analytics

### Stop containers

```bash
docker-compose down
```

### Reset data (volumes)

```bash
docker-compose down -v
```

---

## Local Development (without Docker)

### Backend services

```bash
# Terminal 1 — Auth
cd auth-service && npm install && npm run dev

# Terminal 2 — Fitness
cd fitness-service && npm install && npm run dev

# Terminal 3 — Goals
cd goal-service && npm install && npm run dev
```

Copy `.env.example` to `.env` in each service. Use the **same** `JWT_SECRET` across all three.

### Frontend

```bash
cd frontend && npm install && npm run dev
```

Open **http://localhost:5173** — Vite proxies `/api/*` to backend ports.

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `JWT_SECRET` | Shared secret for JWT signing | (set in compose) |
| `PORT` | Service port | 3001/3002/3003 |
| `DATA_DIR` | JSON storage path | `/app/data` |

See `.env.example` files in each service folder.

---

## Docker Commands

```bash
# Build all images
docker-compose build

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Rebuild single service
docker-compose build auth-service
docker-compose up -d auth-service
```

### Docker Hub

Tag and push images (after `docker login`):

```bash
docker tag fitness-tracker-auth-service youruser/fitsync-auth:latest
docker push youruser/fitsync-auth:latest
```

Configure `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` as GitHub secrets for automated pushes in CI.

---

## Jenkins (Minimal Pipeline)

1. Install Jenkins with Docker access
2. Create a **Pipeline** job pointing to this repo
3. Jenkins reads `Jenkinsfile` with stages:
   - Clone repository
   - `docker-compose build`
   - `docker-compose up -d`

---

## GitHub Actions

Two workflows are configured under `.github/workflows/`:

### `ci.yml` — Continuous Integration
Triggers on every **push** to `main`, `master`, `develop` and on **pull requests**:
1. Setup Node.js 20
2. Run `npm test` for all three backend services
3. Build the React frontend (`npm run build`)
4. Build all Docker images via `docker compose build`
5. Push to Docker Hub on `main` branch (when `DOCKERHUB_USERNAME` + `DOCKERHUB_TOKEN` secrets are set)

### `docker-publish.yml` — Full CD Pipeline
Triggers on **push to main/master** or **version tags** (`v*.*.*`) or **manual dispatch**:
1. **Job 1 — Run Tests:** same as above, with npm cache for speed
2. **Job 2 — Build & Push** *(only runs if Job 1 passes)*:
   - Computes a short Git SHA tag (e.g. `abc1234`) for immutable image versioning
   - Sets up Docker Buildx (BuildKit for layer caching)
   - Authenticates with Docker Hub via GitHub Secrets
   - Builds and pushes all 4 service images with both `:latest` and `:<sha>` tags
   - Prints a summary table to the GitHub Actions UI



---

## Deployment (Render / Railway / AWS)

### Render / Railway

1. Deploy each service as a separate web service OR use Docker Compose if supported
2. Set environment variables (`JWT_SECRET`, `DATA_DIR`)
3. Mount persistent disk for `/app/data` so JSON files survive restarts
4. Point frontend `VITE_API_URL` to your API gateway URL

### AWS (ECS / EC2)

1. Push images to ECR or Docker Hub
2. Run `docker-compose` on EC2, or define ECS task definitions per service
3. Use Application Load Balancer with path-based routing (`/api/auth`, `/api/fitness`, `/api/goals`)

---

## API Documentation

Full REST reference: [docs/API.md](docs/API.md)

Health checks:

- `GET http://localhost:8080/health/auth`
- `GET http://localhost:8080/health/fitness`
- `GET http://localhost:8080/health/goals`

---

## Features

- JWT authentication with bcrypt password hashing
- Workout logging & history
- Calories & water tracking
- Weight tracker & BMI calculator
- Fitness goals with progress percentage
- Dashboard with Chart.js analytics
- Dark/light theme toggle
- Responsive sidebar navigation
- Toast notifications & loading states

---

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| Frontend | React, Tailwind CSS, Axios, React Router, Chart.js |
| Backend | Node.js, Express.js |
| Storage | JSON files (fs module) |
| Auth | JWT, bcryptjs |
| DevOps | Docker, Docker Compose, Nginx, GitHub Actions, Jenkins |

---

## License

MIT — free for learning and portfolio use.

---

**FitSync** — Track smarter. Deploy faster. 🏃‍♂️
