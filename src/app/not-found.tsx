import { ButtonLink } from "@/components/ui";
import { Wordmark } from "@/components/wordmark";

export default function NotFound() {
  return (
    <main id="main" className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <Wordmark />
      <p className="display mt-16 text-7xl sm:text-9xl">
        Not <span className="iris-text italic">found.</span>
      </p>
      <p className="mt-6 max-w-md text-ink-muted">This page doesn&apos;t exist, or it isn&apos;t public yet.</p>
      <div className="mt-10 flex gap-3">
        <ButtonLink href="/">Home</ButtonLink>
        <ButtonLink href="/discover" variant="secondary">
          Discover
        </ButtonLink>
      </div>
    </main>
  );
}
