# Todo Raptor Mini

A modern daily task planner built with Next.js 16, Bun, TypeScript, Tailwind CSS, and Drizzle + SQLite.

Quick start

1. Install Bun: https://bun.sh/
2. Install dependencies: `bun install`
3. Initialize DB (apply migrations):
   - With Bun (requires `sql.js` to be installed): `bun run scripts/init-db.ts`
   - With Node (recommended for native `better-sqlite3`): `node scripts/init-db.node.js`
   If you run into native binding issues with `better-sqlite3` on Bun, install `sql.js` (`bun add sql.js`) so the Bun script can use the sql.js fallback.
4. Seed sample data (optional): `bun run seed`
5. Run dev server: `bun run next dev`
6. Run unit tests: `bun test`
7. Run E2E tests (Playwright): `npx playwright test`

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

See `.github/workflows/ci.yml` for CI details — CI now runs tests under Bun and performs a Node init check that runs `scripts/init-db.node.js` to validate native `better-sqlite3` initialization (or `sql.js` fallback).
