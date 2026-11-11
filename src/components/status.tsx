import type { EnquiryStatus, ProjectStatus } from "@prisma/client";
import { ENQUIRY_STATUS_LABELS, STATUS_LABELS } from "@/lib/labels";
import { Badge } from "./ui";

export function ProjectStatusBadge({ status, hidden }: { status: ProjectStatus; hidden?: boolean }) {
  const tone = status === "PUBLISHED" ? "green" : status === "IN_REVIEW" ? "blue" : status === "CHANGES_REQUESTED" ? "amber" : "neutral";
  return (
    <span className="inline-flex gap-1.5">
      <Badge tone={tone}>{STATUS_LABELS[status]}</Badge>
      {hidden && <Badge tone="rose">Hidden</Badge>}
    </span>
  );
}

export function EnquiryStatusBadge({ status }: { status: EnquiryStatus }) {
  const tone =
    status === "AGREED_IN_PRINCIPLE"
      ? "green"
      : status === "DECLINED" || status === "WITHDRAWN"
        ? "neutral"
        : status === "SUBMITTED"
          ? "iris"
          : status === "TERMS_PROPOSED"
            ? "amber"
            : "blue";
  return <Badge tone={tone}>{ENQUIRY_STATUS_LABELS[status]}</Badge>;
}
