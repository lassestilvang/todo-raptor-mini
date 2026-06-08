'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl rounded-3xl border border-border bg-card p-10 shadow-[var(--shadow-soft)] backdrop-blur">
        <div className="flex flex-col gap-6">
          <div className="space-y-3 text-center">
            <h1 className="text-5xl font-semibold tracking-tight">Something went wrong!</h1>
            <p className="text-lg text-foreground/70">
              An unexpected error occurred. Try refreshing the page or contact support if the problem persists.
            </p>
          </div>

          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
            <p className="text-sm text-foreground/60 font-mono break-words">{error.message}</p>
          </div>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center rounded-2xl bg-indigo-500 px-8 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-indigo-400"
            >
              Try again
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-2xl border border-border bg-card px-8 py-3 text-sm font-semibold text-foreground transition hover:bg-card/80"
            >
              Go home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
