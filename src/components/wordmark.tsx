import Link from "next/link";
import { cn } from "@/lib/utils";

export function Wordmark({ className, tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  return (
    <Link href="/" aria-label="IPPLY home" className={cn("group inline-flex items-center gap-2", className)}>
      <span
        className={cn(
          "font-sans text-[1.35rem] font-semibold tracking-[0.22em]",
          tone === "light" ? "text-white" : "text-ink",
        )}
      >
        IPPLY
      </span>
      <span aria-hidden className="iris-bg h-1.5 w-1.5 rounded-full transition-transform duration-500 group-hover:scale-150" />
    </Link>
  );
}
