import Link from "next/link";
import type { Enquiry, Organization, Project } from "@prisma/client";
import { ENQUIRY_TYPE_LABELS, LICENSING_LABELS } from "@/lib/labels";
import { formatRelative } from "@/lib/utils";
import { EnquiryStatusBadge } from "./status";
import { DemoBadge, EmptyState } from "./ui";

export function EnquiryList({
  enquiries,
  basePath,
  show,
  empty,
}: {
  enquiries: (Enquiry & { organization: Pick<Organization, "name">; project: Pick<Project, "title"> })[];
  basePath: string;
  show: "organization" | "project" | "both";
  empty: { title: string; body?: string };
}) {
  if (!enquiries.length) return <EmptyState title={empty.title} body={empty.body} />;
  return (
    <ul className="card divide-y divide-paper-line">
      {enquiries.map((e) => (
        <li key={e.id}>
          <Link href={`${basePath}/${e.id}`} className="flex flex-col gap-2 p-5 hover:bg-paper/60 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="min-w-0">
              <p className="truncate font-medium">
                {show === "project" ? e.project.title : show === "organization" ? e.organization.name : `${e.organization.name} → ${e.project.title}`}
              </p>
              <p className="mt-1 text-sm text-ink-muted">
                {ENQUIRY_TYPE_LABELS[e.type]} · {e.categories.map((c) => LICENSING_LABELS[c]).join(", ")} · {e.territories.slice(0, 2).join(", ")}
                {e.territories.length > 2 ? ` +${e.territories.length - 2}` : ""}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              {e.isDemo && <DemoBadge className="bg-paper-warm" />}
              <span className="font-mono text-xs text-ink-faint">{e.reference}</span>
              <span className="text-xs text-ink-faint">{formatRelative(e.updatedAt)}</span>
              <EnquiryStatusBadge status={e.status} />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
