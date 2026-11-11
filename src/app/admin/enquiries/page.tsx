import { db } from "@/lib/db";
import { ENQUIRY_STATUS_LABELS, ENQUIRY_TYPE_LABELS, LICENSING_LABELS } from "@/lib/labels";
import { formatRelative } from "@/lib/utils";
import { PageHeader } from "@/components/app-shell";
import { DemoBadge, EmptyState } from "@/components/ui";
import { EnquiryStatusBadge } from "@/components/status";
import Link from "next/link";
import type { EnquiryStatus } from "@prisma/client";

export default async function AdminEnquiriesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const filter = status && status in ENQUIRY_STATUS_LABELS ? (status as EnquiryStatus) : undefined;
  const enquiries = await db.enquiry.findMany({
    where: filter ? { status: filter } : {},
    orderBy: { updatedAt: "desc" },
    take: 200,
    include: { organization: { select: { name: true } }, project: { select: { title: true, id: true } }, _count: { select: { messages: true } } },
  });
  return (
    <>
      <PageHeader title="Commercial enquiries" intro="Oversight of every enquiry on the platform. Message content is private between the parties." />
      <nav className="mb-6 flex flex-wrap gap-1" aria-label="Filter by status">
        <Link href="/admin/enquiries" className={`rounded-full px-4 py-2 text-sm ${!filter ? "bg-ink text-white" : "bg-white"}`}>
          All
        </Link>
        {(Object.keys(ENQUIRY_STATUS_LABELS) as EnquiryStatus[]).map((s) => (
          <Link key={s} href={`/admin/enquiries?status=${s}`} className={`rounded-full px-4 py-2 text-sm ${filter === s ? "bg-ink text-white" : "bg-white"}`}>
            {ENQUIRY_STATUS_LABELS[s]}
          </Link>
        ))}
      </nav>
      {enquiries.length === 0 ? (
        <EmptyState title="No enquiries" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead className="border-b border-paper-line text-xs uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Reference</th>
                <th className="px-5 py-3 font-medium">Partner → Project</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Categories</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-paper-line">
              {enquiries.map((e) => (
                <tr key={e.id}>
                  <td className="px-5 py-3 font-mono text-xs">
                    {e.reference} {e.isDemo && <DemoBadge className="ml-1 scale-90 bg-paper-warm" />}
                  </td>
                  <td className="px-5 py-3">
                    {e.organization.name} →{" "}
                    <Link href={`/admin/projects/${e.project.id}`} className="underline underline-offset-4">
                      {e.project.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3">{ENQUIRY_TYPE_LABELS[e.type]}</td>
                  <td className="px-5 py-3 text-ink-muted">{e.categories.map((c) => LICENSING_LABELS[c]).join(", ")}</td>
                  <td className="px-5 py-3">
                    <EnquiryStatusBadge status={e.status} />
                  </td>
                  <td className="px-5 py-3 text-ink-muted">{formatRelative(e.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
