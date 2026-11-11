import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { CATEGORY_LABELS } from "@/lib/labels";
import { cn, formatRelative } from "@/lib/utils";
import { PageHeader } from "@/components/app-shell";
import { DemoBadge, EmptyState, RightsBadge } from "@/components/ui";
import { ProjectStatusBadge } from "@/components/status";
import { ProjectCover } from "@/components/project-cover";

const TABS: { key: string; label: string; where: Prisma.ProjectWhereInput }[] = [
  { key: "review", label: "Review queue", where: { status: "IN_REVIEW" } },
  { key: "published", label: "Published", where: { status: "PUBLISHED", hidden: false } },
  { key: "featured", label: "Featured", where: { featured: true } },
  { key: "hidden", label: "Hidden", where: { hidden: true } },
  { key: "changes", label: "Changes requested", where: { status: "CHANGES_REQUESTED" } },
  { key: "drafts", label: "Drafts", where: { status: "DRAFT" } },
  { key: "all", label: "All", where: {} },
];

export default async function AdminProjectsPage({ searchParams }: { searchParams: Promise<{ tab?: string; q?: string }> }) {
  const sp = await searchParams;
  const tab = TABS.find((t) => t.key === sp.tab) ?? TABS[0];
  const q = sp.q?.trim().slice(0, 80);
  const where: Prisma.ProjectWhereInput = {
    ...tab.where,
    ...(q ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { owner: { name: { contains: q, mode: "insensitive" } } }] } : {}),
  };
  const [projects, counts] = await Promise.all([
    db.project.findMany({
      where,
      orderBy: tab.key === "review" ? { submittedAt: "asc" } : { updatedAt: "desc" },
      take: 100,
      include: { owner: { select: { name: true } }, coverImage: { select: { url: true, caption: true } }, _count: { select: { enquiries: true, follows: true } } },
    }),
    Promise.all(TABS.map((t) => db.project.count({ where: t.where }))),
  ]);

  return (
    <>
      <PageHeader title="Projects & review" intro="Approve submissions, curate featured properties and manage visibility." />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <nav aria-label="Filter" className="-mx-5 flex gap-1 overflow-x-auto px-5 lg:mx-0 lg:px-0">
          {TABS.map((t, i) => (
            <Link
              key={t.key}
              href={`/admin/projects?tab=${t.key}`}
              aria-current={tab.key === t.key ? "page" : undefined}
              className={cn("shrink-0 rounded-full px-4 py-2 text-sm", tab.key === t.key ? "bg-ink text-white" : "bg-white text-ink-soft hover:bg-paper-warm")}
            >
              {t.label} <span className="opacity-50">{counts[i]}</span>
            </Link>
          ))}
        </nav>
        <form className="flex gap-2">
          <input type="hidden" name="tab" value={tab.key} />
          <label htmlFor="admin-q" className="sr-only">
            Search
          </label>
          <input id="admin-q" name="q" defaultValue={q} placeholder="Search title or creator" className="input h-10 py-2 text-sm" />
        </form>
      </div>
      <div className="mt-6">
        {projects.length === 0 ? (
          <EmptyState title="Nothing here" />
        ) : (
          <ul className="card divide-y divide-paper-line">
            {projects.map((p) => (
              <li key={p.id}>
                <Link href={`/admin/projects/${p.id}`} className="grid items-center gap-4 p-4 hover:bg-paper/60 sm:grid-cols-[3.5rem_1fr_auto] sm:px-5">
                  <span className="hidden h-16 w-14 overflow-hidden rounded-xl sm:block">
                    <ProjectCover project={p} />
                  </span>
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{p.title}</span>
                      {p.isDemo && <DemoBadge className="bg-paper-warm" />}
                      {p.featured && <span className="iris-bg rounded-full px-2 py-0.5 text-[0.68rem] font-medium">Featured</span>}
                    </span>
                    <span className="mt-1 block text-sm text-ink-muted">
                      {CATEGORY_LABELS[p.category]} · {p.owner.name} · {p._count.follows} followers · {p._count.enquiries} enquiries · updated {formatRelative(p.updatedAt)}
                    </span>
                  </span>
                  <span className="flex flex-wrap gap-2">
                    <RightsBadge status={p.rightsStatus} />
                    <ProjectStatusBadge status={p.status} hidden={p.hidden} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
