# System Design Study Plan — Backend

Express + MongoDB API for the study plan tracker (auth, progress, analytics, knowledge notes, file uploads).

## Requirements

- Node.js 18+
- MongoDB Atlas (or local MongoDB)

## Setup

```bash
npm ci
cp .env.example .env
# Edit .env with your MongoDB URI and secrets
npm run seed   # optional: load the 120-day study plan
npm run dev
```

API runs at `http://localhost:5000`. Health check: `GET /api/health`.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret for signing JWT tokens |
| `PORT` | No | Server port (default `5000`) |
| `NODE_ENV` | No | Set to `production` when deployed |
| `FRONTEND_URL` | Prod | Comma-separated allowed CORS origins |
| `PUBLIC_URL` | Prod | Public backend URL for upload links |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with file watching |
| `npm start` | Production start |
| `npm run seed` | Seed study plan data |
| `npm run migrate` | Sync database indexes |

## Deploy (Render)

1. Create a new **Web Service** from this repo.
2. Set build command: `npm ci`
3. Set start command: `npm start`
4. Add environment variables from `.env.example`.
5. Set `PUBLIC_URL` to your Render service URL (e.g. `https://system-design-todobackend.onrender.com`).
6. Set `FRONTEND_URL` to your frontend URL (e.g. `https://system-design-todo.vercel.app`).

Alternatively, use the included `render.yaml` Blueprint.

## API routes

- `POST /api/auth/register` — Register with name + phone
- `POST /api/auth/login` — Login with phone
- `GET /api/plan` — Study plan (phases, weeks, days)
- `GET/PATCH /api/progress` — User progress and knowledge notes
- `POST /api/progress/notes/upload` — Image/PDF upload (max 5MB)
- `GET /api/analytics` — Dashboard analytics
- `GET /api/search` — Search topics/tasks
