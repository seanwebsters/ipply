import Link from "next/link";
import type { StudioStage } from "@prisma/client";
import { db } from "@/lib/db";
import { CATEGORY_LABELS, STUDIO_STAGE_LABELS } from "@/lib/labels";
import { formatRelative } from "@/lib/utils";
import { PageHeader } from "@/components/app-shell";
import { ProjectCover } from "@/components/project-cover";
import { DemoBadge } from "@/components/ui";

export default async function StudioPipelinePage() {
  const items = await db.studioOpportunity.findMany({
    orderBy: { updatedAt: "desc" },
    include: { project: { include: { coverImage: { select: { url: true, caption: true } }, owner: { select: { name: true } } } } },
  });
  const stages = Object.keys(STUDIO_STAGE_LABELS) as StudioStage[];
  return (
    <>
      <PageHeader
        eyebrow="IPPLY Studios"
        title="Development pipeline"
        intro="Projects the studio team is tracking for potential development. Internal only — add projects from their review page."
      />
      <div className="-mx-5 overflow-x-auto px-5 pb-4 sm:-mx-10 sm:px-10">
        <div className="grid min-w-[64rem] grid-cols-5 gap-4">
          {stages.map((s) => {
            const col = items.filter((i) => i.stage === s);
            return (
              <section key={s} className="rounded-3xl bg-paper-warm p-3">
                <h2 className="flex items-center justify-between px-2 py-2 text-sm font-medium">
                  {STUDIO_STAGE_LABELS[s]} <span className="text-ink-faint">{col.length}</span>
                </h2>
                <ul className="mt-2 space-y-3">
                  {col.map((i) => (
                    <li key={i.id}>
                      <Link href={`/admin/projects/${i.projectId}`} className="block overflow-hidden rounded-2xl bg-white transition hover:shadow-sm">
                        <div className="relative h-24">
                          <ProjectCover project={i.project} />
                          {i.project.isDemo && <DemoBadge className="absolute left-2 top-2 scale-90" />}
                        </div>
                        <div className="p-4">
                          <p className="font-medium">{i.project.title}</p>
                          <p className="text-xs text-ink-muted">
                            {CATEGORY_LABELS[i.project.category]} · {i.project.owner.name}
                          </p>
                          {i.formats.length > 0 && <p className="mt-2 text-xs text-ink-soft">{i.formats.join(" · ")}</p>}
                          {i.notes && <p className="mt-2 line-clamp-3 text-xs text-ink-muted">{i.notes}</p>}
                          <p className="mt-2 text-[0.68rem] text-ink-faint">Updated {formatRelative(i.updatedAt)}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}
