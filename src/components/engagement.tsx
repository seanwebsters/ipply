"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { recordView, toggleFollow, toggleSave } from "@/app/actions/engagement";
import { cn } from "@/lib/utils";

export function FollowButton({
  projectId,
  initialActive,
  initialCount,
  next,
  onDark,
}: {
  projectId: string;
  initialActive: boolean;
  initialCount: number;
  next: string;
  onDark?: boolean;
}) {
  const [active, setActive] = useState(initialActive);
  const [count, setCount] = useState(initialCount);
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <button
      type="button"
      aria-pressed={active}
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await toggleFollow(projectId);
          if (!res.ok) {
            if (res.reason === "signin") router.push(`/signin?next=${encodeURIComponent(next)}`);
            return;
          }
          setActive(res.active);
          if (typeof res.count === "number") setCount(res.count);
        })
      }
      className={cn(
        "inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-medium transition",
        active
          ? onDark
            ? "bg-white text-ink"
            : "bg-ink text-white"
          : onDark
            ? "border border-white/30 text-white hover:bg-white/10"
            : "border border-paper-line bg-white text-ink hover:border-ink/30",
      )}
    >
      {active ? "Following" : "Follow"}
      <span className={cn("tabular-nums", active ? "opacity-70" : "opacity-50")}>{count}</span>
    </button>
  );
}

export function SaveButton({
  projectId,
  initialActive,
  next,
  label = "Save",
  activeLabel = "Saved",
  onDark,
}: {
  projectId: string;
  initialActive: boolean;
  next: string;
  label?: string;
  activeLabel?: string;
  onDark?: boolean;
}) {
  const [active, setActive] = useState(initialActive);
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <button
      type="button"
      aria-pressed={active}
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await toggleSave(projectId);
          if (!res.ok) {
            if (res.reason === "signin") router.push(`/signin?next=${encodeURIComponent(next)}`);
            return;
          }
          setActive(res.active);
        })
      }
      className={cn(
        "inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-medium transition",
        onDark ? "border border-white/30 text-white hover:bg-white/10" : "border border-paper-line bg-white text-ink hover:border-ink/30",
      )}
    >
      <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
        <path d="M4 2.5h8v11l-4-3-4 3z" strokeLinejoin="round" />
      </svg>
      {active ? activeLabel : label}
    </button>
  );
}

/** Counts one real view per browser per project per day. Owners and admins are excluded by the caller. */
export function ViewTracker({ projectId }: { projectId: string }) {
  useEffect(() => {
    const key = `ipply:v:${projectId}:${new Date().toISOString().slice(0, 10)}`;
    try {
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, "1");
    } catch {
      return; // storage unavailable: don't count rather than over-count
    }
    void recordView(projectId);
  }, [projectId]);
  return null;
}
