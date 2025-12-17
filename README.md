# Todo Raptor Mini

A modern daily task planner built with Next.js 16, Bun, TypeScript, Tailwind CSS, and Drizzle + SQLite.

Quick start

1. Install Bun: https://bun.sh/
2. Install dependencies: `bun install`
3. Initialize DB (apply migrations): `bun run scripts/init-db.ts`
4. Initialize DB (apply migrations): `bun run scripts/init-db.ts`
5. Seed sample data (optional): `bun run seed`
6. Run dev server: `bun run next dev`
7. Run unit tests: `bun test`
8. Run E2E tests (Playwright): `npx playwright test`

Project structure

- `app/` — Next.js App Router pages and layouts
- `components/` — UI components (shadcn/ui-compatible patterns)
- `lib/` — server-side helpers and services
- `db/` — migrations and schema
- `tests/` — unit and E2E tests

Features

- Lists (Inbox + custom) with color & emoji
- Tasks: title, notes, date, deadline, reminders, estimate, actuals, labels, priority, subtasks, recurrence, attachments, activity log
- Views: Today, Next 7 Days, Upcoming, All
- Search (fuzzy) and filters
- Local-first storage (SQLite) with storage abstraction for attachments (local, S3-ready)

See `.github/workflows/ci.yml` for CI details.
