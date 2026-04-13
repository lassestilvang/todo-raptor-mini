import Link from 'next/link';

export const metadata = {
  title: 'Todo Raptor',
  description: 'A modern daily planner built with Next.js, Bun, and SQLite. Stay focused, ship faster.',
};

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-3xl rounded-3xl border border-border bg-card p-10 shadow-[var(--shadow-soft)] backdrop-blur">
        <div className="flex flex-col gap-6">
          <div className="space-y-3 text-center">
            <h1 className="text-5xl font-semibold tracking-tight">Todo Raptor</h1>
            <p className="text-lg text-foreground/70">
              A modern daily planner built with Next.js, Bun, and SQLite. Stay focused, ship faster.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/app"
              className="inline-flex items-center justify-center rounded-2xl bg-indigo-500 px-8 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-indigo-400"
            >
              Launch app
            </Link>
            <a
              href="https://github.com/lassestilvang/todo-raptor-mini"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-2xl border border-border bg-card px-8 py-3 text-sm font-semibold text-foreground transition hover:bg-card/80"
            >
              View source
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
