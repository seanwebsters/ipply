import type { Metadata } from "next";
import Link from "next/link";
import type { LicensingCategory, ProjectCategory } from "@prisma/client";
import { ProjectCard } from "@/components/project-card";
import { EmptyState } from "@/components/ui";
import { categoryCounts, discoverProjects } from "@/lib/queries";
import { CATEGORY_LABELS, CATEGORY_SLUGS, LICENSING_LABELS, categoryFromSlug } from "@/lib/labels";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Discover",
  description: "Explore original characters, worlds, films, music, theatre, books, games and design on IPPLY.",
};

type SP = Promise<{ q?: string; category?: string; licensing?: string; sort?: string; open?: string }>;

export default async function DiscoverPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const category = categoryFromSlug(sp.category);
  const licensing = sp.licensing && sp.licensing in LICENSING_LABELS ? (sp.licensing as LicensingCategory) : undefined;
  const sort = sp.sort === "az" || sp.sort === "followed" ? sp.sort : "new";
  const q = sp.q?.slice(0, 80) ?? "";
  const [projects, counts] = await Promise.all([
    discoverProjects({ q, category, licensing, sort, open: sp.open === "1" }),
    categoryCounts(),
  ]);
  const total = Object.values(counts).reduce((a, b) => a + (b ?? 0), 0);

  const href = (patch: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = { q: q || undefined, category: sp.category, licensing: sp.licensing, sort: sort === "new" ? undefined : sort, open: sp.open, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) params.set(k, v);
    const s = params.toString();
    return `/discover${s ? `?${s}` : ""}`;
  };

  return (
    <div className="pb-28">
      <section className="border-b border-paper-line bg-white">
        <div className="site-container pb-10 pt-14 sm:pt-20">
          <p className="eyebrow">IPPLY Discover</p>
          <h1 className="display mt-4 text-5xl sm:text-7xl">
            {category ? CATEGORY_LABELS[category] : <>Discover what&apos;s <span className="italic text-ink-muted">next.</span></>}
          </h1>
          <form action="/discover" className="mt-10 flex max-w-2xl gap-2" role="search">
            {category && <input type="hidden" name="category" value={sp.category} />}
            {licensing && <input type="hidden" name="licensing" value={licensing} />}
            <label htmlFor="q" className="sr-only">
              Search projects
            </label>
            <input id="q" name="q" defaultValue={q} placeholder="Search titles, characters, creators, genres…" className="input h-14 rounded-full px-6" />
            <button className="h-14 shrink-0 rounded-full bg-ink px-7 text-white">Search</button>
          </form>

          <nav aria-label="Categories" className="-mx-5 mt-8 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
            <Link href={href({ category: undefined })} className={pill(!category)}>
              All <span className="opacity-50">{total}</span>
            </Link>
            {(Object.keys(CATEGORY_LABELS) as ProjectCategory[]).map((c) => (
              <Link key={c} href={href({ category: CATEGORY_SLUGS[c] })} className={pill(category === c)} aria-current={category === c ? "page" : undefined}>
                {CATEGORY_LABELS[c]} <span className="opacity-50">{counts[c] ?? 0}</span>
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <div className="site-container mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <form action="/discover" className="flex flex-wrap items-center gap-3 text-sm">
          {q && <input type="hidden" name="q" value={q} />}
          {sp.category && <input type="hidden" name="category" value={sp.category} />}
          <label className="flex items-center gap-2">
            <span className="text-ink-muted">Licensing</span>
            <select name="licensing" defaultValue={licensing ?? ""} className="rounded-full border border-paper-line bg-white px-4 py-2">
              <option value="">Any category</option>
              {Object.entries(LICENSING_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2">
            <span className="text-ink-muted">Sort</span>
            <select name="sort" defaultValue={sort} className="rounded-full border border-paper-line bg-white px-4 py-2">
              <option value="new">Newest</option>
              <option value="followed">Most followed</option>
              <option value="az">A–Z</option>
            </select>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="open" value="1" defaultChecked={sp.open === "1"} className="h-4 w-4 accent-ink" />
            <span className="text-ink-muted">Open to deals</span>
          </label>
          <button className="rounded-full border border-paper-line bg-white px-4 py-2 hover:border-ink/30">Apply</button>
        </form>
        <p className="text-sm text-ink-muted" aria-live="polite">
          {projects.length} {projects.length === 1 ? "project" : "projects"}
          {q && (
            <>
              {" "}
              for “{q}” ·{" "}
              <Link href={href({ q: undefined })} className="underline underline-offset-4">
                clear
              </Link>
            </>
          )}
        </p>
      </div>

      <div className="site-container mt-10">
        {projects.length === 0 ? (
          <EmptyState
            title="Nothing here yet"
            body="No published projects match those filters. Try a different search — or be the first to create something in this space."
            action={
              <Link href="/join" className="text-sm font-medium underline underline-offset-4">
                Start creating
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {projects.map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function pill(active: boolean) {
  return cn(
    "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm transition",
    active ? "border-ink bg-ink text-white" : "border-paper-line bg-white text-ink-soft hover:border-ink/30",
  );
}
