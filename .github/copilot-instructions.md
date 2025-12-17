# Copilot instructions for Todo Raptor Mini

Purpose: give AI coding agents the essential, actionable knowledge to be productive quickly in this repo.

## Big picture
- Stack: **Next.js 16 (App Router)** + **Bun** runtime + **TypeScript** + **Tailwind**; SQLite DB via **drizzle-orm** + **better-sqlite3**.
- Runtime separation: UI components live under `app/` and `components/`; server-side services and business logic are in `lib/*.server.ts`. API endpoints use `app/api/*/route.ts` and return `NextResponse`.
- Storage: local-first; attachments persist to `storage/attachments` by default (`lib/storage.ts`). S3 is supported by env var but currently a stub.

## Key workflows & commands (copyable)
- Install deps: `bun install`
- Init DB (run migrations): `bun run scripts/init-db.ts` (honors `DATABASE_URL` env var)
- Seed (in-memory sample): `bun run seed` (creates sample lists/tasks in-memory)
- Dev server: `bun run next dev`
- Unit tests: `bun test` (uses `bun:test`)
- E2E tests: `npx playwright test`
- CI: `bun install && bun test && npx playwright test` (see `package.json` `ci` script)
- Run migrations: `bun run migrate` (uses `drizzle-kit`)
- Lint & format: `bun run lint`, `bun run format`; pre-commit hooks via `husky` and `lint-staged`.

## DB & schema notes
- Schema is in `db/schema.ts`. Migrations live in `db/migrations` and `scripts/init-db.ts` applies them in sorted order.
- `lib/db.ts` exposes `initDb(connection?)`, `getDb()` and `db()` helpers. Tests and seed scripts often pass a `better-sqlite3` connection (e.g., `':memory:'`) to `initDb` for isolation.
- Recurrence and other structured fields are stored as JSON in columns (`tasks.recurrence`). Dates are ISO strings.

## Conventions & idioms to follow when editing/adding code
- Server-only modules use the `.server.ts` suffix and expect access to `getDb()`/`initDb()`.
- API route validation uses `zod`, e.g. `app/api/tasks/route.ts` validates POST bodies with a `z.object(...)` schema before calling `createTask`.
- Services return plain JS objects (not ORM rows) and map DB column names to camelCase (see `lib/task-service.server.ts`). Prefer that pattern.
- Client code fetches backend via the app's internal `fetch('/api/...')` endpoints (see `components/TaskForm.tsx`, `TaskList.tsx`).
- To avoid heavy bundles, client code sometimes lazy-requires optional libs (example: `const Fuse = require('fuse.js')` inside a client-only component).
- Activity logging is centralized via `lib/activity-service.server.ts` (`logActivity` and `getActivityForEntity`). Use it for audit-style actions.

## Storage & attachments
- Default: `LocalStorageAdapter` writes files to `storage/attachments` (`lib/storage.ts`).
- To enable S3: set `STORAGE_PROVIDER=s3`, install `@aws-sdk/client-s3` and implement `S3Adapter.upload` (currently a stub).
- Upload endpoint: `app/api/attachments/route.ts` writes files to disk and records optional metadata in DB (it tolerates DB failures).

## Tests & how to write them
- Tests use `bun:test`. Example pattern: create an isolated DB (`':memory:'`), call `initDb(conn)`, and use service helpers. Look at `scripts/seed.ts` and `tests/task-service.test.ts` for examples.
- Reset state between tests using service helpers (`clearTasks()` etc.). Keep tests fast and self-contained.

## Quick debugging tips
- If UI shows empty lists, ensure DB was initialized (`bun run scripts/init-db.ts`) and `DATABASE_URL` points to the correct file.
- For attachment issues, check `storage/attachments` exists and writable; the POST handler intentionally ignores DB errors, so file writes can succeed while DB insert fails.
- Use `bun run lint` and `bun test` before opening PRs; run `npx playwright test` for E2E regressions.

## Files to inspect for implementation examples
- Business logic / patterns: `lib/task-service.server.ts`, `lib/list-service.server.ts`
- DB interactions / schema: `db/schema.ts`, `lib/db.ts`, `db/migrations/001_initial.sql`
- API examples: `app/api/tasks/route.ts`, `app/api/attachments/route.ts`
- UI / client patterns: `components/TaskForm.tsx`, `components/TaskList.tsx`, `components/TaskItem.tsx`
- Tests: `tests/*.test.ts`, `tests/e2e/*`

---
If anything here is unclear or you'd like more detail (examples for common PRs, style rules, or test templates), I can iterate on this file.
