# CareerFlow — API Server

NestJS backend for **CareerFlow** — an AI-powered job application tracker with daily goals, a resume vault, and one-click apply sessions.

## Live

| | URL |
|---|-----|
| **API** | https://server-sooty-nine-27.vercel.app/api/v1 |
| **Swagger** | https://server-sooty-nine-27.vercel.app/api/docs |
| **Health** | https://server-sooty-nine-27.vercel.app/api/v1/health |

## Features

- **Auth** — JWT access + refresh tokens, register / login / refresh / logout
- **Applications** — full CRUD, Kanban status, linked cover letters & emails
- **Goal Session** — preview match → edit letter/email → confirm apply, plus onboarding flow
- **Resume Vault** — one PDF per track (Backend / Frontend / Software Engineer)
- **Daily Goals** — streak tracking with 7–90 day commitment challenges
- **AI** (Groq / Anthropic / Gemini) — job parsing, resume matching, cover letters, emails, resume review, interview questions, career insights
- **Writing Style** — user-defined email & cover letter formatting injected into prompts
- **Documents** — PDF upload, text extraction, ImageKit storage
- **Email** — direct SMTP send (optional)
- **Reminders** — automatic 3-day follow-up after each application
- **Analytics** — dashboard metrics + weekly apply chart data
- **Rate limiting** — global throttler (100 req / 60s)

## Tech stack

| Layer | Tech |
|-------|------|
| Framework | NestJS 11, TypeScript |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma 7 (`@prisma/adapter-pg`) |
| Auth | Passport JWT, bcrypt |
| AI | Groq (default), Anthropic, Gemini |
| Files | ImageKit |
| Email | Nodemailer (SMTP) |
| Docs | Swagger / OpenAPI |
| Deploy | Vercel (serverless) |

## Data model (Prisma)

`User`, `UserGoal`, `JobApplication`, `Interview`, `Document`, `Reminder`, `ResumeAnalysis`, `CoverLetter`, `InterviewQuestion`, `ApplicationEmail`

## Project structure

```
server/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── common/                 # Guards, decorators, filters, interceptors, pipes
│   ├── config/
│   ├── infrastructure/
│   │   ├── ai/                 # LlmService (multi-provider)
│   │   ├── database/           # PrismaService
│   │   ├── email/              # SMTP EmailService
│   │   └── storage/            # ImageKit
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── applications/
│   │   ├── documents/
│   │   ├── goals/              # Goal session, streak, vault, onboarding
│   │   ├── ai/                 # AI orchestration endpoints
│   │   ├── analytics/
│   │   ├── reminders/
│   │   ├── cover-letters/
│   │   ├── resume-analysis/
│   │   ├── interview-prep/
│   │   ├── interviews/
│   │   └── career-insights/
│   ├── generated/prisma/       # Prisma client output
│   ├── configure-app.ts
│   └── main.ts
├── prisma.config.ts
├── Dockerfile
└── vercel.json
```

## API overview

All routes are prefixed with `/api/v1`. A Bearer token is required unless noted.

| Module | Endpoints |
|--------|-----------|
| `auth` | `POST /register`, `/login`, `/refresh`, `/logout`, `GET /me` |
| `users` | `GET/PATCH /profile`, `POST /avatar` |
| `applications` | `GET/POST /applications`, `GET/PATCH/DELETE /:id` |
| `goals` | `GET /today`, `PATCH /commitment`, `GET /resumes`, `GET /onboarding-status`, `POST /onboarding/complete`, `/onboarding/skip`, `/session/preview`, `/session/manual-preview`, `/session/confirm`, `/session` |
| `ai` | `POST /job/parse`, `/job/fetch`, `/job/suggest-track`, `/resume/match`, `/resume/review`, `GET /resume/analyses`, `POST /cover-letter/generate`, `GET /cover-letter`, `POST /email/generate`, `GET /email`, `POST /interview/questions`, `GET /interview/questions`, `GET /career-insights` |
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
- `GROQ_API_KEY` (or Anthropic / Gemini) + `AI_PROVIDER`
- `IMAGEKIT_*` keys
- `CORS_ORIGIN` — include `http://localhost:3000`

Optional: `SMTP_*` for direct email send, `CRON_SECRET` for the reminder cron, `CLIENT_URL` for links in reminder emails.

### 3. Database

```bash
npm run prisma:migrate     # create/apply dev migrations
npm run prisma:generate
```

### 4. Run

```bash
npm run start:dev
```

- API: http://localhost:4000/api/v1
- Swagger: http://localhost:4000/api/docs

## Deployment (Vercel + Supabase)

### Database URL

Vercel serverless functions **cannot** use the Supabase direct host (`db.xxx.supabase.co`). Use the **pooler** for `DATABASE_URL`:

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

`DATABASE_URL`, `DIRECT_URL`, `JWT_*`, `AI_PROVIDER`, `GROQ_API_KEY`, `IMAGEKIT_*`, `CORS_ORIGIN` (client URL). Optional: `SMTP_*`, `CRON_SECRET`, `CLIENT_URL`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run start:dev` | Dev server with watch |
| `npm run start:prod` | Run compiled build (`dist/main`) |
| `npm run build` | Production build |
| `npm run prisma:migrate` | Create/apply dev migrations |
| `npm run prisma:deploy` | Apply migrations (CI/prod) |
| `npm run prisma:generate` | Regenerate Prisma client |

## Prisma 7 notes

- Configuration lives in `prisma.config.ts`, not in `schema.prisma`
- Client is generated to `src/generated/prisma`
- `PrismaService` uses `@prisma/adapter-pg`

## License

Private — CareerFlow
