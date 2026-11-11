import Link from "next/link";
import type { Enquiry, EnquiryMessage, Organization, Project, User } from "@prisma/client";
import { ENQUIRY_STATUS_LABELS, ENQUIRY_TYPE_LABELS, EXCLUSIVITY_LABELS, LICENSING_LABELS, ORG_TYPE_LABELS } from "@/lib/labels";
import { allowedEnquiryTransitions } from "@/lib/permissions";
import { cn, formatDate, formatRelative } from "@/lib/utils";
import { changeEnquiryStatus, postEnquiryMessage } from "@/app/actions/enquiries";
import { ActionForm, TextArea } from "./action-form";
import { SubmitButton } from "./form";
import { EnquiryStatusBadge } from "./status";
import { DemoBadge, Notice } from "./ui";

type FullEnquiry = Enquiry & {
  project: Pick<Project, "id" | "title" | "slug">;
  organization: Organization;
  submittedBy: Pick<User, "name">;
  messages: (EnquiryMessage & { author: Pick<User, "id" | "name"> | null })[];
};

export function EnquiryDetail({ enquiry, party, viewerId }: { enquiry: FullEnquiry; party: "creator" | "partner"; viewerId: string }) {
  const transitions = allowedEnquiryTransitions(party, enquiry.status);
  const closed = ["DECLINED", "WITHDRAWN"].includes(enquiry.status);
  const backHref = party === "creator" ? "/dashboard/enquiries" : "/partner/enquiries";

  return (
    <div>
      <Link href={backHref} className="text-sm text-ink-muted hover:text-ink">
        ← Enquiries
      </Link>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <EnquiryStatusBadge status={enquiry.status} />
        <span className="font-mono text-xs text-ink-muted">{enquiry.reference}</span>
        {enquiry.isDemo && <DemoBadge className="bg-paper-warm" />}
      </div>
      <h1 className="display mt-4 text-4xl sm:text-5xl">
        {ENQUIRY_TYPE_LABELS[enquiry.type]} enquiry for{" "}
        <Link href={`/ip/${enquiry.project.slug}`} className="italic underline decoration-1 underline-offset-8">
          {enquiry.project.title}
        </Link>
      </h1>
      <p className="mt-3 text-ink-muted">
        From {enquiry.organization.name} ({ORG_TYPE_LABELS[enquiry.organization.type]}) · {enquiry.submittedBy.name} · {formatDate(enquiry.createdAt)}
      </p>

      <div className="mt-10 grid gap-10 xl:grid-cols-[1fr_22rem]">
        <div className="min-w-0 space-y-8">
          <section className="card p-6 sm:p-8">
            <h2 className="eyebrow">Proposal</h2>
            <dl className="mt-6 grid gap-6 sm:grid-cols-2">
              <Item label="Categories" value={enquiry.categories.map((c) => LICENSING_LABELS[c]).join(", ")} />
              <Item label="Territories" value={enquiry.territories.join(", ")} />
              <Item label="Exclusivity" value={EXCLUSIVITY_LABELS[enquiry.exclusivity]} />
              <Item label="Term" value={enquiry.termMonths ? `${enquiry.termMonths} months` : "Not specified"} />
              <Item label="Target launch" value={enquiry.launchWindow ?? "Not specified"} />
              <Item label="Budget / advance" value={enquiry.budgetRange ?? "Not specified"} />
              <Item label="Intended use" value={enquiry.intendedUse} wide />
              {enquiry.proposedTerms && <Item label="Proposed terms" value={enquiry.proposedTerms} wide />}
            </dl>
          </section>

          <section>
            <h2 className="eyebrow">Conversation</h2>
            <ol className="mt-5 space-y-4">
              {enquiry.messages.map((m) =>
                m.kind === "EVENT" ? (
                  <li key={m.id} className="flex items-center gap-3 text-xs text-ink-faint">
                    <span className="h-px flex-1 bg-paper-line" />
                    {m.body} · {formatRelative(m.createdAt)}
                    <span className="h-px flex-1 bg-paper-line" />
                  </li>
                ) : (
                  <li key={m.id} className={cn("flex", m.authorId === viewerId ? "justify-end" : "justify-start")}>
                    <div className={cn("max-w-[85%] rounded-3xl px-5 py-4", m.authorId === viewerId ? "bg-ink text-white" : "border border-paper-line bg-white")}>
                      <p className={cn("text-xs", m.authorId === viewerId ? "text-white/60" : "text-ink-muted")}>
                        {m.author?.name ?? "Former member"} · {formatRelative(m.createdAt)}
                      </p>
                      <p className="mt-1.5 whitespace-pre-line leading-relaxed">{m.body}</p>
                    </div>
                  </li>
                ),
              )}
            </ol>
            {!closed ? (
              <ActionForm action={postEnquiryMessage.bind(null, enquiry.id)} resetOnSuccess className="mt-6 space-y-3">
                <label htmlFor="body" className="sr-only">
                  Message
                </label>
                <TextArea name="body" rows={3} placeholder="Write a message…" />
                <SubmitButton pendingLabel="Sending…">Send message</SubmitButton>
              </ActionForm>
            ) : (
              <Notice className="mt-6">This enquiry is {ENQUIRY_STATUS_LABELS[enquiry.status].toLowerCase()}. The conversation is closed.</Notice>
            )}
          </section>
        </div>

        <aside className="space-y-5 xl:sticky xl:top-8 xl:self-start">
          {transitions.length > 0 && (
            <div className="card p-6">
              <h2 className="font-medium">{party === "creator" ? "Respond" : "Manage"}</h2>
              <p className="mt-1 text-sm text-ink-muted">
                {party === "creator" ? "Move this enquiry forward, or decline it. The partner sees every change." : "You can withdraw this enquiry at any time."}
              </p>
              <div className="mt-5 flex flex-col gap-2">
                {transitions.map((t) => (
                  <form key={t} action={changeEnquiryStatus.bind(null, enquiry.id)}>
                    <input type="hidden" name="status" value={t} />
                    <SubmitButton variant={t === "DECLINED" || t === "WITHDRAWN" ? "danger" : "secondary"} className="w-full">
                      {t === "DECLINED" ? "Decline" : t === "WITHDRAWN" ? "Withdraw enquiry" : `Mark as ${ENQUIRY_STATUS_LABELS[t as keyof typeof ENQUIRY_STATUS_LABELS].toLowerCase()}`}
                    </SubmitButton>
                  </form>
                ))}
              </div>
            </div>
          )}
          <div className="card p-6 text-sm">
            <h2 className="font-medium">{party === "creator" ? "About the partner" : "Organisation"}</h2>
            <p className="mt-3 font-medium">{enquiry.organization.name}</p>
            <p className="text-ink-muted">{[ORG_TYPE_LABELS[enquiry.organization.type], enquiry.organization.country].filter(Boolean).join(" · ")}</p>
            {enquiry.organization.description && <p className="mt-3 leading-relaxed text-ink-muted">{enquiry.organization.description}</p>}
            <p className="mt-3 text-xs text-ink-faint">{enquiry.organization.verified ? "Organisation identity reviewed by IPPLY." : "Organisation details are self-declared and have not been verified by IPPLY."}</p>
          </div>
          <Notice>
            “Agreed in principle” records mutual intent only. Contracts, payments and royalty reporting happen outside IPPLY for now — always take
            independent legal advice before signing.
          </Notice>
        </aside>
      </div>
    </div>
  );
}

function Item({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className="mt-1 whitespace-pre-line leading-relaxed">{value}</dd>
    </div>
  );
}

export const enquiryInclude = {
  project: { select: { id: true, title: true, slug: true, ownerId: true } },
  organization: true,
  submittedBy: { select: { name: true } },
  messages: { orderBy: { createdAt: "asc" }, include: { author: { select: { id: true, name: true } } } },
} as const;
