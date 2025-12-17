TL;DR

Build a modern, professional Next.js 16 (App Router) daily planner using Bun, TypeScript, Tailwind, shadcn/ui and Framer Motion. Use Drizzle + SQLite for local persistence (migration-ready), React Hook Form + Zod for validated forms, and Bun Test + Playwright for tests. Deliverables: full task models (lists, tasks, labels, subtasks, attachments, activity log), server services and routes, polished UI (split sidebar + main), fuzzy search, recurrence, change logs, and thorough tests.

---

Plan

1) Project scaffolding & infra
- Initialize project with Bun + Next.js 16 (App Router) + TypeScript.
- Add Tailwind CSS, PostCSS, and shadcn/ui.
- Set up ESLint, Prettier, Husky + lint-staged hooks.
- Add Bun Test and Playwright (E2E) to repo.
- Add CI (`.github/workflows/ci.yml`) to run `bun install`, lint, tests, and Playwright.

2) Database & ORM
- Use Drizzle ORM + `drizzle-kit` for migrations and typed schemas (Bun-friendly).
- SQLite local DB (e.g., `./db/data.db`) for single-user/dev-first approach; recommend PostgreSQL for multi-user/scale.
- Schema: users (optional), lists, tasks, subtasks, labels, task_labels, attachments, activity_log, recurrence_exceptions.
- Use structured recurrence storage (JSON or rrule string) and `activity_log` for change history.

3) Core server & business logic
- `lib/db.ts`: DB client + helpers.
- `db/schema.ts`: Drizzle schema definitions.
- `lib/task-service.server.ts`: Business logic for create/update/delete, recurrence generation, search, and activity logging.
- `app/api/**/route.ts`: Next 16 route handlers (tasks, lists, labels, attachments).
- Migrations: `scripts/migrate.ts` or `drizzle-kit` commands.

4) UI & components
- Layout: App root (`app/layout.tsx`) and authenticated dashboard layout (`app/(app)/dashboard/layout.tsx`) implementing a split view: Sidebar + Main.
- Sidebar: lists, views (Today, Next 7 Days, Upcoming, All), labels, and quick-add.
- Pages: `app/(app)/lists/[listId]/page.tsx`; views: Today, Next 7 Days, Upcoming, All; task details page/modal: `app/(app)/tasks/[taskId]/page.tsx`.
- Components: `Sidebar`, `TaskList`, `TaskItem`, `TaskForm` (React Hook Form + Zod), `DatePicker` (react-day-picker wrapper), `RecurrenceEditor` (daily/weekly/monthly/custom), `SearchBar` (fuzzy), `LabelChip`.
- Styling: Tailwind with dark mode by system preference; shadcn/ui components and Radix primitives for accessible UI; Framer Motion for animations and View Transition API for page transitions.

5) Features & UX
- Lists: Inbox default magic list; custom lists with color + emoji; list CRUD.
- Tasks: title, description, date, deadline, reminders, estimate (HH:mm), actual time (HH:mm), labels, priority (High/Medium/Low/None), subtasks/checklists, recurrence (presets + custom), attachments, and activity log for changes.
- Views: Today, Next 7 Days, Upcoming, All; ability to toggle completed tasks visibility and filter by labels, priority, and list.
- Overdue tasks: highlighted with badge counts in sidebar and views.
- Search: fast fuzzy search (e.g., fuse.js or custom trigram index) across title, description, labels, and subtasks.
- Natural language parsing (stretch): optional NLU to parse input like "Lunch with Sarah at 1 PM tomorrow".

6) Validation, Accessibility & Resilience
- Forms: React Hook Form + Zod schemas for task and list forms; comprehensive validation and error messaging.
- Accessibility: keyboard navigation, ARIA attributes, focus management for modals and popovers.
- Loading states, empty states, error handling.

7) Attachments & Storage
- Local filesystem adapter for dev; storage abstraction to support S3/GCS later with signed upload endpoints.
- Store metadata in SQLite; store files under `./storage/attachments` in dev.

8) Recurrence & Scheduling
- Support presets (Every day, Every week, Every weekday, Every month, Every year) and a custom recurrence editor.
- Store recurrence rules as structured JSON or rrule strings; create server logic to generate instances and handle exceptions.

9) Testing & CI
- Unit tests: Bun Test for business logic and components via @testing-library/react.
- E2E: Playwright tests for core flows (create task, complete, recurrence, search, attachments).
- CI: run lint, build, unit and E2E tests; lock Bun version in CI.

10) Documentation & deployment notes
- README with dev setup (Bun install, migrations, test commands), environment variables, and migration runbook.
- `.env.example` with DATABASE_URL, STORAGE_PROVIDER, NEXT_PUBLIC_BASE_URL, etc.

---

Database Schema (high-level)
- lists: id, owner_id, title, color, emoji, archived, created_at, updated_at.
- tasks: id, list_id, title, notes, status, priority, due_date, due_timezone, estimate_minutes, actual_minutes, recurrence (JSON/rrule), ordered_position, created_at, updated_at, completed_at.
- subtasks: id, task_id, title, done, position.
- labels: id, owner_id, name, color, icon.
- task_labels: task_id, label_id.
- attachments: id, task_id, filename, size, mime, storage_key, created_at.
- activity_log: id, entity_type, entity_id, action, payload(JSON), performed_by, created_at.
- recurrence_exceptions: id, task_id, instance_date, is_skipped, overrides(JSON).

---

Risks & Decisions
- SQLite concurrency (suitable for single-user/local-first; switch to Postgres for multi-user/scale).
- Drizzle vs Prisma: Drizzle recommended for Bun compatibility; Prisma is mature but may require Node shims.
- Recurrence complexity: start with structured JSON presets, extend to full RRULE if needed.
- Attachments: local dev-first, later add S3-backed storage with signed uploads.

---

Timeline (estimate)
- Scaffolding & infra: 1–2 days
- Modeling & CRUD: 2–3 days
- Recurrence, search & attachments: 2 days
- UI polish & animations: 1–2 days
- Tests & CI: 1–2 days
- Docs & polish: 1 day

---

Open Questions
1. Single-user local-first or multi-user with authentication? (affects users table & auth)
2. Attachments: local-only or cloud ready at launch? (affects storage design)
3. Recurrence expressiveness: simple presets or full RRULE + exceptions? (affects schema & test matrix)
4. Any existing branding or color palette to follow?

---

Next Steps
- Confirm preferences for the open questions above.
- If confirmed, proceed to scaffold the project and implement the files and features per the file plan (detailed file-by-file plan available on request).

---

Notes
- This file is a living plan and will be updated as decisions are made or as the project evolves. Replace SQLite with PostgreSQL if you plan to support multiple users or heavy concurrency from the start.
