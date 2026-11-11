import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import type { RightsStatus } from "@prisma/client";
import { RIGHTS_LABELS } from "@/lib/labels";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "light" | "outline-light" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-white hover:bg-ink-soft",
  secondary: "bg-white text-ink border border-paper-line hover:border-ink/30",
  ghost: "text-ink hover:bg-ink/5",
  light: "bg-white text-ink hover:bg-white/90",
  "outline-light": "border border-white/30 text-white hover:bg-white/10",
  danger: "bg-white text-rose-700 border border-rose-200 hover:bg-rose-50",
};
const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[0.95rem]",
  lg: "h-14 px-7 text-base",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-medium transition duration-200 disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap",
    variants[variant],
    sizes[size],
    className,
  );
}

export function ButtonLink({
  href,
  variant,
  size,
  className,
  children,
  ...rest
}: { href: string; variant?: Variant; size?: Size } & Omit<ComponentProps<typeof Link>, "href">) {
  return (
    <Link href={href} className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </Link>
  );
}

export function Button({
  variant,
  size,
  className,
  ...rest
}: { variant?: Variant; size?: Size } & ComponentProps<"button">) {
  return <button className={buttonClass(variant, size, className)} {...rest} />;
}

export function Badge({ children, className, tone = "neutral" }: { children: ReactNode; className?: string; tone?: "neutral" | "dark" | "iris" | "amber" | "green" | "rose" | "blue" }) {
  const tones = {
    neutral: "bg-ink/5 text-ink-soft",
    dark: "bg-ink text-white",
    iris: "iris-bg text-ink",
    amber: "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200",
    green: "bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200",
    rose: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200",
    blue: "bg-sky-50 text-sky-800 ring-1 ring-inset ring-sky-200",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.72rem] font-medium leading-none", tones[tone], className)}>
      {children}
    </span>
  );
}

export function DemoBadge({ className, onDark }: { className?: string; onDark?: boolean }) {
  return (
    <span
      title="Fictional sample project created by IPPLY to demonstrate the platform. Not a real creator or property."
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em]",
        onDark ? "bg-black/40 text-white backdrop-blur" : "bg-white/85 text-ink backdrop-blur",
        className,
      )}
    >
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-amber-400" />
      Demo
    </span>
  );
}

export function RightsBadge({ status, className }: { status: RightsStatus; className?: string }) {
  const tone = status === "VERIFIED" ? "green" : status === "DISPUTED" ? "rose" : status === "UNDER_REVIEW" ? "blue" : "neutral";
  return (
    <Badge tone={tone} className={className}>
      <span title={RIGHTS_LABELS[status].detail}>{RIGHTS_LABELS[status].label}</span>
    </Badge>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  action,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-6 md:flex-row md:items-end md:justify-between", className)}>
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
        <h2 className="display text-4xl sm:text-5xl lg:text-6xl">{title}</h2>
        {intro && <p className="mt-5 text-lg leading-relaxed text-ink-muted">{intro}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body?: ReactNode; action?: ReactNode }) {
  return (
    <div className="rounded-3xl border border-dashed border-paper-line bg-white/60 px-6 py-14 text-center">
      <div aria-hidden className="iris-bg mx-auto mb-5 h-10 w-10 rounded-full opacity-80" />
      <h3 className="text-lg font-medium">{title}</h3>
      {body && <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">{body}</p>}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-ink-muted">{label}</p>
      <p className="mt-2 text-3xl font-medium tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-faint">{hint}</p>}
    </div>
  );
}

export function Notice({ children, tone = "neutral", className }: { children: ReactNode; tone?: "neutral" | "amber" | "green" | "rose"; className?: string }) {
  const tones = {
    neutral: "bg-paper-warm text-ink-soft border-paper-line",
    amber: "bg-amber-50 text-amber-900 border-amber-200",
    green: "bg-emerald-50 text-emerald-900 border-emerald-200",
    rose: "bg-rose-50 text-rose-800 border-rose-200",
  };
  return <div className={cn("rounded-2xl border px-4 py-3 text-sm leading-relaxed", tones[tone], className)}>{children}</div>;
}
