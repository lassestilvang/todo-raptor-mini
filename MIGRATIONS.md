Migration runbook

We use SQL migrations located in `db/migrations`.

Run locally:

1. Ensure dependencies: `bun install`
2. Apply SQL migrations: `bun run scripts/init-db.ts`

Using drizzle-kit (dev):

- Create a new migration: `npx drizzle-kit generate` or `drizzle-kit generate`
- Apply migrations in CI using `drizzle-kit migrate` or the `scripts/init-db.ts` helper for SQLite

Notes:

- For SQLite, the DB file is `db/data.db` by default (see `.env.example`).
- For production, prefer PostgreSQL and adapt `drizzle.config.ts` accordingly.
