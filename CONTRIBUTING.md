# Contributing

## Getting Started

### Prerequisites
- [Bun](https://bun.sh/) runtime (v1.0+)
- Node.js 18+ (for compatibility with better-sqlite3 native bindings)

### Setup

1. **Install dependencies**
   ```bash
   bun install
   ```

2. **Initialize the database**
   ```bash
   # Using Bun (with sql.js fallback)
   bun run scripts/init-db.ts
   
   # Or using Node (recommended for native better-sqlite3)
   node scripts/init-db.node.js
   ```

3. **Start the dev server**
   ```bash
   bun run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development Workflow

### Code Quality

- **Lint**: `bun run lint` (runs ESLint with --fix)
- **Format**: `bun run format` (runs Prettier)
- **Type check**: TypeScript strict mode enabled (part of build)

Pre-commit hooks via Husky and lint-staged automatically run linting on staged files.

### Testing

- **Unit tests**: `bun test`
- **Unit tests with coverage**: `bun run test:coverage`
- **E2E tests**: `npx playwright test` or `bun run e2e`
- **Run CI locally**: `bun run ci`

### Database

- Migrations: `bun run migrate` (uses Drizzle Kit)
- Schema: See `db/schema.ts` for table definitions
- Seed sample data: `bun run seed`

### Architecture Overview

- **UI components**: `components/` and `app/` directories (client-side)
- **Server logic**: `lib/*.server.ts` files (server-only modules)
- **API endpoints**: `app/api/*/route.ts` (Next.js route handlers)
- **Database services**: `lib/*-service.server.ts` for business logic
- **Storage**: Local files to `storage/attachments` by default (S3 support available via env)

## Code Style

- **TypeScript strict mode** is enabled
- **No implicit any**: Use proper types instead of `any`
- **Zod validation**: Use for API input validation (see `app/api/tasks/route.ts` for examples)
- **Server/Client split**: Use `.server.ts` suffix for server-only modules
- **Comments**: Only for non-obvious logic; avoid over-commenting

## Making Changes

1. Create a feature branch: `git checkout -b feat/your-feature`
2. Make changes and test locally
3. Run linting and tests: `bun run lint && bun test`
4. Commit with descriptive messages
5. Push to your fork and create a Pull Request

## Performance Considerations

- Components using `fetch` during SSR may see URL parsing warnings at build time; this is expected for client-cache patterns
- Use lazy loading for heavy components when possible
- Minimize bundle size by checking bundle impact with `bun build`

## Troubleshooting

### `better-sqlite3` binding issues

If you see native binding errors, the fallback to `sql.js` will activate automatically. To force native bindings:

```bash
bun rebuild
node scripts/init-db.node.js
```

### Database not initialized

Always run `bun run scripts/init-db.ts` or `node scripts/init-db.node.js` after installing dependencies.

### Tests fail with "fetch is not defined"

The test setup mocks `fetch` globally. If issues persist, check `tests/setup.ts`.

## Questions?

Feel free to open an issue or discussion in the repository.
