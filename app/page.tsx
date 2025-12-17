import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-4xl font-semibold mb-4">Todo Raptor</h1>
        <p className="mb-6 text-muted-foreground">
          A modern daily planner built with Next.js, Bun, and SQLite.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/app" className="px-4 py-2 rounded bg-blue-600 text-white">
            Open app
          </Link>
        </div>
      </div>
    </main>
  );
}
