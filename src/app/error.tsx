"use client";

import Link from "next/link";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main" className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <p className="display text-6xl">Something went wrong.</p>
      <p className="mt-4 max-w-md text-ink-muted">
        {error.message && !error.message.includes("Server Components") ? error.message : "We couldn't complete that request. Please try again."}
      </p>
      {error.digest && <p className="mt-2 font-mono text-xs text-ink-faint">Ref {error.digest}</p>}
      <div className="mt-8 flex gap-3">
        <button onClick={reset} className="rounded-full bg-ink px-5 py-2.5 text-sm text-white">
          Try again
        </button>
        <Link href="/" className="rounded-full border border-paper-line px-5 py-2.5 text-sm">
          Home
        </Link>
      </div>
    </main>
  );
}
