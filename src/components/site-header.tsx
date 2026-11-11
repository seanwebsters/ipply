import Link from "next/link";
import { getCurrentUser, homeForRole } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Wordmark } from "./wordmark";
import { buttonClass } from "./ui";
import { MobileNav } from "./mobile-nav";

export const PUBLIC_NAV = [
  { href: "/discover", label: "Discover" },
  { href: "/creators", label: "Create" },
  { href: "/studios", label: "Studios" },
  { href: "/partners", label: "Partners" },
  { href: "/about", label: "About" },
];

export async function SiteHeader({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const user = await getCurrentUser();
  const onDark = tone === "light";
  const accountHref = user ? homeForRole(user.role) : null;
  return (
    <header className={cn("relative z-40", onDark ? "text-white" : "border-b border-paper-line/70 bg-paper/80 backdrop-blur-xl")}>
      <div className="site-container flex h-[4.5rem] items-center justify-between gap-6">
        <Wordmark tone={onDark ? "light" : "dark"} />
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {PUBLIC_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm transition",
                onDark ? "text-white/80 hover:text-white" : "text-ink-muted hover:text-ink",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <Link href={accountHref!} className={buttonClass(onDark ? "light" : "primary", "sm")}>
              {user.role === "ADMIN" ? "Studio dashboard" : user.role === "PARTNER" ? "Partner portal" : "My studio"}
            </Link>
          ) : (
            <>
              <Link href="/signin" className={cn("rounded-full px-4 py-2 text-sm", onDark ? "text-white/80 hover:text-white" : "text-ink-muted hover:text-ink")}>
                Sign in
              </Link>
              <Link href="/join" className={buttonClass(onDark ? "light" : "primary", "sm")}>
                Start creating
              </Link>
            </>
          )}
        </div>
        <MobileNav items={PUBLIC_NAV} onDark={onDark} account={user ? { href: accountHref!, label: "Your account" } : null} />
      </div>
    </header>
  );
}
