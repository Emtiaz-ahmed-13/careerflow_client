# CareerFlow Web

Next.js frontend for **CareerFlow** — a neo-brutalist job hunt dashboard with AI-assisted daily applications.

## Live

| | URL |
|---|-----|
| **App** | https://client-emtiaz-ahmed-13s-projects.vercel.app |

## What it does

CareerFlow helps software engineers apply consistently:

1. **Upload resumes once** (Backend / Frontend / SWE tracks)
2. **Paste a LinkedIn job** — AI extracts company, role, suggests resume type
3. **Preview** match score, cover letter, and email
4. **Edit** before applying — your custom writing style from Settings
5. **Confirm** — logs application, saves docs, sets 3-day follow-up reminder
6. **Track streak** — daily apply goals with 7–90 day challenges

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Landing |
| `/login`, `/register` | Auth |
| `/dashboard` | Metrics, weekly chart, streak widget |
| `/goal-session` | Main apply flow (preview → edit → confirm) |
| `/applications` | All applies + view saved letter & email |
| `/kanban` | Drag-and-drop pipeline |
| `/job-matcher` | Standalone resume vs job match |
| `/resume-analyzer` | ATS-style resume review |
| `/cover-letter` | Standalone cover letter generator |
| `/email-generator` | Standalone application email |
| `/interview-prep` | AI interview questions |
| `/profile` | Name, links, avatar |
| `/settings` | **Writing style** (email + cover letter format) + career insights |

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS 4, custom neo-brutalist design system |
| Data | TanStack Query |
| Charts | Recharts |
| Kanban | @dnd-kit |
| Toasts | Sonner |
| Deploy | Vercel |

## Project structure

```
client/
├── src/
│   ├── app/                    # App Router pages
│   │   ├── dashboard/
│   │   ├── goal-session/       # Core apply workflow
│   │   ├── applications/
│   │   ├── kanban/
│   │   └── ...
│   ├── components/
│   │   ├── layout/             # Sidebar, DashboardLayout
│   │   ├── shared/             # GoalStreakCard, JobPastePanel, Tag
│   │   └── ui/                 # Button, Input, Card
│   ├── lib/
│   │   ├── api/client.ts       # API + auth token handling
│   │   ├── toast.ts
│   │   └── utils.ts
│   ├── providers/              # Auth, QueryClient
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

### 3. Run (with server on port 4000)

```bash
npm run dev
```

App: http://localhost:3000

## Production (Vercel)

```bash
vercel link          # project: client
```

Set env:

```env
NEXT_PUBLIC_API_URL=https://server-sooty-nine-27.vercel.app/api/v1
```

```bash
vercel --prod
```

Ensure server `CORS_ORIGIN` includes your client URL.

## Goal Session flow

```
Resume Vault (upload once)
       ↓
Paste job URL / description
       ↓
Preview Session  →  AI: match, letter, email, track suggestion
       ↓
Edit cover letter & email
       ↓
Confirm Apply  →  saved to Applications + Docs
       ↓
Optional: Send Email (SMTP or mailto fallback)
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production build |
| `npm run lint` | ESLint |

## Design

Neo-brutalist UI — thick black borders, bold typography, lime/cyan/yellow/pink accents. Mobile sidebar with hamburger menu on small screens.

## Related repo

Backend API: [careerflow_server](../server) (or separate git repo `careerflow_server`)

## License

Private — CareerFlow
