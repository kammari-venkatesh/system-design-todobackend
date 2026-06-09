# System Design Study Plan — Backend

Express + MongoDB API for the study plan tracker: phone auth, progress, analytics, knowledge notes (summary + per-task subtopics), and file uploads.

## Where to deploy

| Repo | Platform | URL pattern |
|------|----------|-------------|
| **This repo (backend)** | [Render](https://render.com) | `https://*.onrender.com` |
| [Frontend repo](https://github.com/kammari-venkatesh/system-design-todo) | [Vercel](https://vercel.com) | `https://*.vercel.app` |

**Do not deploy this backend on Vercel** — it will crash (`FUNCTION_INVOCATION_FAILED`). See [DEPLOY.md](./DEPLOY.md) for step-by-step instructions.

## Requirements

- Node.js 18+
- MongoDB Atlas (or local MongoDB)

## Setup

```bash
npm ci
cp .env.example .env
# Edit .env with your MongoDB URI and secrets
npm run seed   # load the 120-day study plan (run once)
npm run dev
```

API runs at `http://localhost:5000`. Health check: `GET /api/health`.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret for signing JWT tokens |
| `PORT` | No | Server port (default `5000`) |
| `NODE_ENV` | Prod | Set to `production` when deployed |
| `FRONTEND_URL` | Prod | Your Vercel frontend URL (required for browser CORS) |
| `PUBLIC_URL` | Prod | Auto-set on Render via `RENDER_EXTERNAL_URL` if omitted |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with file watching |
| `npm start` | Production start |
| `npm run seed` | Seed study plan data |
| `npm run migrate` | Sync database indexes |

## Deploy (Render)

1. Create a **Web Service** from [system-design-todobackend](https://github.com/kammari-venkatesh/system-design-todobackend).
2. Build command: `npm ci`
3. Start command: `npm start`
4. Health check path: `/api/health`
5. Set environment variables:

```
NODE_ENV=production
MONGO_URI=<your-atlas-uri>
JWT_SECRET=<long-random-secret>
FRONTEND_URL=https://your-frontend.vercel.app
PUBLIC_URL=https://your-service.onrender.com
```

6. After first deploy, run **Shell** command: `npm run seed`

Or use the included `render.yaml` Blueprint.

Full walkthrough: **[DEPLOY.md](./DEPLOY.md)**

## Production checklist

- [ ] `NODE_ENV=production`
- [ ] `JWT_SECRET` is not the default placeholder
- [ ] `FRONTEND_URL` matches your deployed frontend URL exactly
- [ ] `PUBLIC_URL` matches this service’s public URL (for note attachments)
- [ ] Study plan seeded (`npm run seed`)
- [ ] Health check returns `{ "status": "ok" }`

## API routes

- `POST /api/auth/register` — Register with name + phone
- `POST /api/auth/login` — Login with phone
- `GET /api/plan` — Study plan (phases, weeks, days, tasks)
- `GET/PATCH /api/progress` — User progress and `knowledgeNotes`
- `POST /api/progress/notes/upload` — Image/PDF upload (max 5MB)
- `GET /api/analytics` — Dashboard analytics
- `GET /api/search` — Search topics/tasks

## Knowledge notes schema

Notes are stored in `knowledgeNotes` on user progress:

| ID pattern | Type | Purpose |
|------------|------|---------|
| `day-{n}` | `daily` | Main topic summary (plain text) |
| `day-{n}-task-{i}` | `task` | Subtopic note (rich text body) |

Notes are auto-created when a user opens a study day on the calendar.
