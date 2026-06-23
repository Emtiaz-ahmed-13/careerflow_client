# CareerFlow Web (Next.js 16)

Frontend for CareerFlow — job tracking dashboard, Kanban board, and AI career tools.

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS + Shadcn UI
- React Hook Form + Zod
- TanStack Query
- Recharts
- Dnd Kit

## Structure

```
src/
├── app/
│   ├── (auth)/           # login, register
│   ├── (marketing)/      # landing
│   └── (dashboard)/      # protected pages
├── components/
│   ├── ui/               # Shadcn
│   ├── layout/
│   ├── applications/
│   ├── kanban/
│   ├── dashboard/
│   └── ai/
├── hooks/
├── lib/
├── providers/
├── schemas/
└── types/
```

## Commands (after setup)

```bash
npm install
npm run dev
```

See [../docs/BLUEPRINT.md](../docs/BLUEPRINT.md) for full architecture.
# careerflow_client
