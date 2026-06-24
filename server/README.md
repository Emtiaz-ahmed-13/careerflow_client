# CareerFlow API

NestJS backend for **CareerFlow** — an AI-powered job application tracker with daily goals, resume vault, and one-click apply sessions.

## Live

| | URL |
|---|-----|
| **API** | https://server-sooty-nine-27.vercel.app/api/v1 |
| **Swagger** | https://server-sooty-nine-27.vercel.app/api/docs |
| **Health** | https://server-sooty-nine-27.vercel.app/api/v1/health |

## Features

- **Auth** — JWT access + refresh tokens, register/login
- **Applications** — CRUD, Kanban status, linked cover letters & emails
- **Goal Session** — preview match → edit letter/email → confirm apply
- **Resume Vault** — one PDF per track (Backend / Frontend / Software Engineer)
- **Daily Goals** — streak, 7–90 day commitment challenges
- **AI** (Groq / Anthropic / Gemini) — job parse, resume match, cover letter, email, interview prep
- **Writing Style** — user-defined email & cover letter format in prompts
- **Documents** — PDF upload, text extraction, ImageKit storage
- **Email** — SMTP direct send (optional)
- **Reminders** — 3-day follow-up after each apply
- **Analytics** — dashboard metrics + weekly apply chart data

## Stack

| Layer | Tech |
|-------|------|
| Framework | NestJS 11, TypeScript |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma 7 (`@prisma/adapter-pg`) |
| Auth | Passport JWT, bcrypt |
| AI | Groq (default), Anthropic, Gemini |
| Files | ImageKit |
| Email | Nodemailer (SMTP) |
| Deploy | Vercel (zero-config NestJS) |

## Project structure

```
server/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── common/              # Guards, decorators, filters
│   ├── infrastructure/
│   │   ├── ai/              # LlmService (multi-provider)
│   │   ├── database/        # PrismaService
│   │   ├── email/           # SMTP EmailService
│   │   └── storage/         # ImageKit
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── applications/
│   │   ├── documents/
│   │   ├── goals/           # Goal session, streak, vault
│   │   ├── ai/
│   │   ├── analytics/
│   │   └── reminders/
│   ├── generated/prisma/    # Prisma client output
│   ├── configure-app.ts
│   └── main.ts
├── prisma.config.ts
└── vercel.json
```

## API overview

All routes prefixed with `/api/v1`. Bearer token required unless noted.

| Module | Endpoints |
|--------|-----------|
| `auth` | `POST /register`, `/login`, `/refresh`, `/logout`, `GET /me` |
| `users` | `GET/PATCH /profile`, `POST /avatar` |
| `applications` | `GET/POST /applications`, `GET/PATCH/DELETE /:id` |
| `goals` | `GET /today`, `PATCH /commitment`, `GET /resumes`, `POST /session/preview`, `/session/confirm` |
| `ai` | `POST /job/parse`, `/job/fetch`, `/job/suggest-track`, `/resume/match`, `/cover-letter/generate`, `/email/generate`, … |
| `documents` | `POST /upload`, `GET /` |
| `analytics` | `GET /dashboard` |
| `reminders` | `GET /`, `POST /cron/process` (cron secret header) |

Full interactive docs: `/api/docs`

## Local setup

### 1. Install

```bash
cd server
npm install
```

### 2. Environment

```bash
cp .env.example .env
```

Fill in at minimum:

- `DATABASE_URL` / `DIRECT_URL` — Supabase PostgreSQL
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- `GROQ_API_KEY` (or Anthropic/Gemini)
- `IMAGEKIT_*` keys
- `CORS_ORIGIN` — include `http://localhost:3000`

Optional: `SMTP_*` for direct email send, `CRON_SECRET` for reminder cron.

### 3. Database

```bash
npm run prisma:migrate    # dev migrations
npm run prisma:generate
```

### 4. Run

```bash
npm run start:dev
```

API: http://localhost:4000/api/v1  
Swagger: http://localhost:4000/api/docs

## Production (Vercel + Supabase)

### Database URL

Vercel serverless **cannot** use Supabase direct host (`db.xxx.supabase.co`). Use the **pooler**:

```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

Keep `DIRECT_URL` as the direct connection for local `prisma migrate`.

### Deploy

```bash
vercel link          # project: server
vercel env pull
vercel --prod
```

`vercel.json` runs `prisma generate` + `nest build` on deploy.

### Required Vercel env vars

`DATABASE_URL`, `DIRECT_URL`, `JWT_*`, `GROQ_API_KEY`, `IMAGEKIT_*`, `CORS_ORIGIN` (client URL), `AI_PROVIDER`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run start:dev` | Dev server with watch |
| `npm run build` | Production build |
| `npm run prisma:migrate` | Create/apply dev migrations |
| `npm run prisma:deploy` | Apply migrations (CI/prod) |
| `npm run prisma:generate` | Regenerate Prisma client |

## Prisma 7 notes

- Config lives in `prisma.config.ts`, not `schema.prisma`
- Client generated to `src/generated/prisma`
- `PrismaService` uses `@prisma/adapter-pg`

## License

Private — CareerFlow
