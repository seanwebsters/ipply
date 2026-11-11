import Link from "next/link";
import type { ReactNode } from "react";
import { Wordmark } from "./wordmark";
import { signOut } from "@/app/actions/auth";
import { NavLink } from "./nav-link";

export type ShellNavItem = { href: string; label: string; badge?: number; exact?: boolean };

export function AppShell({
  area,
  nav,
  user,
  children,
  isDemo,
}: {
  area: string;
  nav: ShellNavItem[];
  user: { name: string; email: string };
  children: ReactNode;
  isDemo?: boolean;
}) {
  return (
    <div className="min-h-screen bg-paper lg:grid lg:grid-cols-[16.5rem_1fr]">
      <aside className="border-b border-paper-line bg-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-5 lg:px-6 lg:py-7">
          <div>
            <Wordmark />
            <p className="mt-1 text-xs text-ink-muted">{area}</p>
          </div>
          <Link href="/discover" className="text-sm text-ink-muted hover:text-ink lg:hidden">
            Discover
          </Link>
        </div>
        <nav aria-label={area} className="-mt-1 flex gap-1 overflow-x-auto px-3 pb-3 [scrollbar-width:none] lg:mt-2 lg:flex-col lg:overflow-visible lg:px-3">
          {nav.map((item) => (
            <NavLink key={item.href} href={item.href} exact={item.exact} badge={item.badge}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto hidden border-t border-paper-line p-5 lg:block">
          <Link href="/discover" className="block rounded-xl px-3 py-2 text-sm text-ink-muted hover:bg-paper hover:text-ink">
            ← Back to IPPLY
          </Link>
          <div className="mt-3 px-3">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-ink-muted">{user.email}</p>
            <form action={signOut} className="mt-3">
              <button className="text-xs text-ink-muted underline underline-offset-4 hover:text-ink">Sign out</button>
            </form>
          </div>
        </div>
      </aside>
      <div className="min-w-0">
        {isDemo && (
          <div className="border-b border-amber-200 bg-amber-50 px-5 py-2 text-xs text-amber-900 sm:px-10">
            You&apos;re signed in to a shared demonstration account. Changes are visible to other people exploring the demo.
          </div>
        )}
        <main id="main" className="px-5 py-8 sm:px-10 sm:py-12">
          {children}
        </main>
        <div className="border-t border-paper-line px-5 py-6 lg:hidden">
          <form action={signOut}>
            <button className="text-sm text-ink-muted underline underline-offset-4">Sign out ({user.email})</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function PageHeader({ title, intro, actions, eyebrow }: { title: ReactNode; intro?: ReactNode; actions?: ReactNode; eyebrow?: string }) {
  return (
    <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h1 className="display text-4xl sm:text-5xl">{title}</h1>
        {intro && <p className="mt-3 max-w-2xl text-ink-muted">{intro}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
