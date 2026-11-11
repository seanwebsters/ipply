import Link from "next/link";
import { db } from "@/lib/db";
import { CATEGORY_LABELS, ENQUIRY_STATUS_LABELS } from "@/lib/labels";
import { formatRelative } from "@/lib/utils";
import { PageHeader } from "@/components/app-shell";
import { ButtonLink, EmptyState, Stat } from "@/components/ui";
import type { EnquiryStatus } from "@prisma/client";

export default async function AdminHome() {
  const [creators, partners, published, inReview, featured, enquiriesByStatus, queue, recentEvents] = await Promise.all([
    db.user.count({ where: { role: "CREATOR", isDemo: false } }),
    db.organization.count({ where: { isDemo: false } }),
    db.project.count({ where: { status: "PUBLISHED", hidden: false } }),
    db.project.count({ where: { status: "IN_REVIEW" } }),
    db.project.count({ where: { featured: true } }),
    db.enquiry.groupBy({ by: ["status"], _count: true }),
    db.project.findMany({ where: { status: "IN_REVIEW" }, orderBy: { submittedAt: "asc" }, take: 5, include: { owner: { select: { name: true } } } }),
    db.moderationEvent.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { project: { select: { title: true, id: true } }, actor: { select: { name: true } } } }),
  ]);
  const totalEnquiries = enquiriesByStatus.reduce((a, b) => a + b._count, 0);

  return (
    <>
      <PageHeader eyebrow="IPPLY Studio" title="Studio dashboard" intro="Review submissions, curate the catalogue and track commercial activity." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Stat label="Awaiting review" value={inReview} />
        <Stat label="Published" value={published} hint="Visible in Discover" />
        <Stat label="Featured" value={featured} />
        <Stat label="Creators" value={creators} hint="Excluding demo accounts" />
        <Stat label="Partner organisations" value={partners} hint="Excluding demo" />
      </div>

      <div className="mt-12 grid gap-10 xl:grid-cols-2">
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Review queue</h2>
            <Link href="/admin/projects?tab=review" className="text-sm text-ink-muted hover:text-ink">
              Open queue
            </Link>
          </div>
          <div className="mt-5">
            {queue.length === 0 ? (
              <EmptyState title="Queue is clear" body="New submissions from creators appear here." />
            ) : (
              <ul className="card divide-y divide-paper-line">
                {queue.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-4 p-5">
                    <div>
                      <p className="font-medium">{p.title}</p>
                      <p className="text-sm text-ink-muted">
                        {CATEGORY_LABELS[p.category]} · {p.owner.name} · submitted {p.submittedAt ? formatRelative(p.submittedAt) : ""}
                      </p>
                    </div>
                    <ButtonLink href={`/admin/projects/${p.id}`} size="sm">
                      Review
                    </ButtonLink>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
        <section>
          <h2 className="text-lg font-medium">Enquiries by status</h2>
          <div className="card mt-5 p-6">
            {totalEnquiries === 0 ? (
              <p className="text-sm text-ink-muted">No enquiries yet.</p>
            ) : (
              <ul className="space-y-3">
                {enquiriesByStatus.map((row) => (
                  <li key={row.status} className="text-sm">
                    <div className="flex justify-between">
                      <span>{ENQUIRY_STATUS_LABELS[row.status as EnquiryStatus]}</span>
                      <span className="tabular-nums text-ink-muted">{row._count}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-paper">
                      <div className="iris-bg h-full rounded-full" style={{ width: `${(row._count / totalEnquiries) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <h2 className="mt-10 text-lg font-medium">Recent moderation activity</h2>
          <ul className="card mt-5 divide-y divide-paper-line text-sm">
            {recentEvents.map((e) => (
              <li key={e.id} className="flex justify-between gap-4 px-5 py-3">
                <span>
                  <Link href={`/admin/projects/${e.project.id}`} className="font-medium hover:underline">
                    {e.project.title}
                  </Link>{" "}
                  <span className="text-ink-muted">· {e.action.replaceAll("_", " ").toLowerCase()}</span>
                </span>
                <span className="shrink-0 text-ink-faint">{formatRelative(e.createdAt)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
