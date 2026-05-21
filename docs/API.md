# FitSync API Documentation

Base URL (Docker): `http://localhost:8080`

All protected routes require header: `Authorization: Bearer <token>`

---

## Auth Service (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | No | Register new user |
| POST | `/login` | No | Login and receive JWT |
| GET | `/profile` | Yes | Get user profile |
| PUT | `/profile` | Yes | Update name, height, weight |
| POST | `/streak` | Yes | Update daily activity streak |

### Register Body
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123",
  "height": 175,
  "weight": 72
}
```

---

## Fitness Service (`/api/fitness`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/workouts` | List user workouts |
| POST | `/workouts` | Add workout |
| DELETE | `/workouts/:id` | Delete workout |
| GET | `/water` | Water log history |
| GET | `/water/today` | Today's water intake |
| POST | `/water` | Log water glasses |
| GET | `/weights` | Weight history |
| POST | `/weights` | Log weight entry |
| POST | `/bmi` | Calculate BMI |
| GET | `/summary` | Daily dashboard summary |
| GET | `/stats/weekly` | 7-day calorie stats |
| GET | `/stats/calories` | Calorie aggregates |

---

## Goal Service (`/api/goals`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List goals with progress % |
| POST | `/` | Create goal |
| PUT | `/:id` | Update goal |
| DELETE | `/:id` | Delete goal |
| GET | `/progress/weekly` | Weekly goal summary |

---

## Health Checks

| Service | Endpoint |
|---------|----------|
| Auth | `GET /health` |
| Fitness | `GET /health` |
| Goals | `GET /health` |
