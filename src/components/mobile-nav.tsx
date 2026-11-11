"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function MobileNav({
  items,
  onDark,
  account,
}: {
  items: { href: string; label: string }[];
  onDark: boolean;
  account: { href: string; label: string } | null;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((o) => !o)}
        className={cn("relative z-50 flex h-10 w-10 items-center justify-center rounded-full", open ? "text-ink" : onDark ? "text-white" : "text-ink")}
      >
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        <span aria-hidden className="relative block h-3 w-5">
          <span className={cn("absolute left-0 top-0 h-px w-5 bg-current transition", open && "top-1.5 rotate-45")} />
          <span className={cn("absolute bottom-0 left-0 h-px w-5 bg-current transition", open && "bottom-1.5 -rotate-45")} />
        </span>
      </button>
      {open && (
        <div id="mobile-menu" className="fixed inset-0 z-40 flex flex-col bg-paper px-6 pb-10 pt-24 text-ink animate-fade-up">
          <nav aria-label="Mobile" className="flex flex-col">
            {items.map((item) => (
              <Link key={item.href} href={item.href} className="display border-b border-paper-line py-4 text-4xl">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto flex flex-col gap-3">
            {account ? (
              <Link href={account.href} className="rounded-full bg-ink py-4 text-center text-white">
                {account.label}
              </Link>
            ) : (
              <>
                <Link href="/join" className="rounded-full bg-ink py-4 text-center text-white">
                  Start creating
                </Link>
                <Link href="/signin" className="rounded-full border border-paper-line py-4 text-center">
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
