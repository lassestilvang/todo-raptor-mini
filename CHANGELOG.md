# Changelog

## 0.2.0 - Type safety and error handling improvements (unreleased)

- Improved TypeScript type safety across components (removed 'any' types)
- Added proper type inference for cached resources (Label, List types)
- Created API utilities for error handling and params resolution
- Enhanced documentation (CONTRIBUTING.md, SECURITY.md)
- Consistent error responses across API routes
- Test isolation improvements to prevent DOM leakage

## 0.1.0 - Initial release

- Project scaffolding: Bun, Next.js 16 (App Router), TypeScript, Tailwind
- DB & ORM: SQLite + Drizzle, initial migrations
- Core features: Lists, Tasks, Labels, Subtasks, Attachments, Activity log
- Views: Today, Next 7 Days, Upcoming, All
- Search (fuzzy), Recurrence (presets), Recurrence exceptions
- Tests: Bun unit tests, Playwright E2E tests
- CI: Lint, unit tests, Playwright steps
