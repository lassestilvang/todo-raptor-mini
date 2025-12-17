Deployment guide

This project is intended for local / small-team use with SQLite. For production:

1. Replace SQLite with PostgreSQL (update `drizzle.config.ts`).
2. Use S3/GCS for attachments; implement `S3Adapter` in `lib/storage.ts` and add env vars.
3. Set environment variables: `DATABASE_URL` (Postgres connection), `STORAGE_PROVIDER` (s3), `NEXT_PUBLIC_BASE_URL`.
4. Build and run on a server (service):
   - `bun install`
   - `bun run next build`
   - `bun run next start`
5. CI: run `bun install`, `bun test`, `npx playwright test`.

Notes: pin Bun version in CI to avoid runtime differences. For a multi-user app, add authentication and switch to a managed DB.
