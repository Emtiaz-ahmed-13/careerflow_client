# CareerFlow — Web Client

Next.js frontend for **CareerFlow** — a neo-brutalist, AI-assisted job hunt dashboard that helps software engineers apply consistently and track every application in one place.

## Live

| | URL |
|---|-----|
| **App** | https://client-mocha-five-q1k2xjicnj.vercel.app |
| **API** | https://server-sooty-nine-27.vercel.app/api/v1 |

## What it does

CareerFlow turns the daily grind of job hunting into a guided, repeatable flow:

1. **Upload resumes once** — keep one resume per track (Backend / Frontend / Software Engineer)
2. **Paste a LinkedIn job** — AI extracts company, role, and suggests the right resume track
3. **Preview** — match score, tailored cover letter, and application email
4. **Edit** — refine the letter & email using your saved writing style
5. **Confirm** — logs the application, saves the documents, and sets a 3-day follow-up reminder
6. **Stay consistent** — daily apply goals with 7–90 day streak challenges

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Landing page |
| `/login`, `/register` | Authentication |
| `/onboarding` | First-run setup (resumes, goal, writing style) |
| `/dashboard` | Metrics, weekly apply chart, streak widget |
| `/goal-session` | Core apply flow (paste → preview → edit → confirm) |
| `/applications` | All applications + saved cover letter & email |
| `/applications/[id]` | Single application detail |
| `/kanban` | Drag-and-drop application pipeline |
| `/job-matcher` | Standalone resume vs. job match |
| `/resume-analyzer` | ATS-style resume review |
| `/cover-letter` | Standalone cover letter generator |
| `/email-generator` | Standalone application email generator |
| `/interview-prep` | AI-generated interview questions |
| `/profile` | Name, links, avatar |
| `/settings` | Writing style (email + cover letter format) and career insights |

## Tech stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS 4 + custom neo-brutalist design system |
| Data fetching | TanStack Query |
| Forms & validation | React Hook Form + Zod |
| Charts | Recharts |
| Kanban | @dnd-kit |
| Toasts | Sonner |
| Icons | lucide-react |
| Deploy | Vercel |

## Project structure

```
client/
├── src/
│   ├── app/
│   │   ├── (auth)/             # login, register
│   │   ├── (dashboard)/        # authenticated app routes
│   │   ├── (marketing)/        # landing
│   │   ├── goal-session/       # core apply workflow
│   │   ├── onboarding/
│   │   └── ...
│   ├── components/
│   │   ├── ai/                 # AI feature widgets
│   │   ├── applications/
│   │   ├── dashboard/
│   │   ├── kanban/
│   │   ├── layout/             # Sidebar, DashboardLayout
│   │   ├── shared/             # GoalStreakCard, JobPastePanel, Tag
│   │   └── ui/                 # Button, Input, Card
│   ├── hooks/
│   ├── lib/
│   │   ├── api/                # API client + auth token handling
│   │   ├── auth/
│   │   └── utils/
│   ├── providers/              # Auth, QueryClient
│   ├── schemas/                # Zod schemas
│   └── types/
├── .env.example
└── package.json
```

## Local setup

### 1. Install

```bash
cd client
npm install
```

### 2. Environment

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

### 3. Run (with the server running on port 4000)

```bash
npm run dev
```

App runs at http://localhost:3000

## Deployment (Vercel)

```bash
vercel link          # project: client
```

Set the production API URL:

```env
NEXT_PUBLIC_API_URL=https://server-sooty-nine-27.vercel.app/api/v1
```

```bash
vercel --prod
```

Make sure the server's `CORS_ORIGIN` includes your client URL.

## Goal Session flow

```
Resume Vault (upload once)
        ↓
Paste job URL / description
        ↓
Preview Session  →  AI: match score, cover letter, email, track suggestion
        ↓
Edit cover letter & email (your writing style)
        ↓
Confirm Apply  →  saved to Applications + Documents
        ↓
Optional: Send email (SMTP) + 3-day follow-up reminder
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production build |
| `npm run lint` | Run ESLint |

## Design

Neo-brutalist UI — thick black borders, bold typography, hard shadows, and lime/cyan/yellow/pink accents. Fully responsive with a collapsible mobile sidebar.

## Related

- **Backend API:** [`../server`](../server)
- **Chrome extension:** [`../extension`](../extension) — save LinkedIn jobs to Goal Session with one click

## License

Private — CareerFlow
