Deployment checklist

- Use a managed Postgres DB and update `DATABASE_URL`.
- Configure `STORAGE_PROVIDER` and set up S3 credentials.
- Add SECRET keys and env vars to your deployment platform.
- Run migrations using drizzle (or run SQL migrations for Postgres) before the app starts.
- Start server with `bun run next start` in production mode.
- Monitor error logs and upload limits for attachments.

Security notes

- Limit acceptable file types for attachments in the upload handler.
- Add rate limits on unauthenticated routes if exposing APIs publicly.
