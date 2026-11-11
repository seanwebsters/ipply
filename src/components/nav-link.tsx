"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function NavLink({ href, children, exact, badge }: { href: string; children: ReactNode; exact?: boolean; badge?: number }) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex shrink-0 items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm transition",
        active ? "bg-ink text-white" : "text-ink-soft hover:bg-paper",
      )}
    >
      {children}
      {!!badge && (
        <span className={cn("rounded-full px-2 py-0.5 text-[0.68rem] font-medium tabular-nums", active ? "bg-white/20" : "iris-bg text-ink")}>{badge}</span>
      )}
    </Link>
  );
}
