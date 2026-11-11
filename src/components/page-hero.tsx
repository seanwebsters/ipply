import type { ReactNode } from "react";

export function PageHero({ eyebrow, title, intro, children }: { eyebrow: string; title: ReactNode; intro?: ReactNode; children?: ReactNode }) {
  return (
    <section className="relative isolate overflow-hidden border-b border-paper-line">
      <div aria-hidden className="iris-bg absolute -right-40 -top-40 -z-10 h-[34rem] w-[34rem] rounded-full opacity-40 blur-[110px]" />
      <div className="site-container py-20 sm:py-28">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="display mt-5 max-w-5xl text-5xl sm:text-7xl lg:text-8xl">{title}</h1>
        {intro && <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ink-muted sm:text-xl">{intro}</p>}
        {children && <div className="mt-10 flex flex-wrap gap-3">{children}</div>}
      </div>
    </section>
  );
}

export function FeatureGrid({ items }: { items: { title: string; body: string }[] }) {
  return (
    <ul className="grid gap-px overflow-hidden rounded-3xl border border-paper-line bg-paper-line sm:grid-cols-2 lg:grid-cols-3">
      {items.map((i) => (
        <li key={i.title} className="bg-white p-8">
          <h3 className="display text-2xl">{i.title}</h3>
          <p className="mt-3 leading-relaxed text-ink-muted">{i.body}</p>
        </li>
      ))}
    </ul>
  );
}
