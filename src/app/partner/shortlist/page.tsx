import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { CATEGORY_LABELS, LICENSING_LABELS } from "@/lib/labels";
import { PageHeader } from "@/components/app-shell";
import { ProjectCover } from "@/components/project-cover";
import { ButtonLink, DemoBadge, EmptyState, RightsBadge } from "@/components/ui";
import { SubmitButton } from "@/components/form";
import { updateSaveNote } from "@/app/actions/engagement";
import { SaveButton } from "@/components/engagement";

export default async function ShortlistPage() {
  const user = await requireUser(["PARTNER"]);
  const items = await db.savedProject.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      project: {
        include: {
          coverImage: { select: { url: true, caption: true } },
          owner: { select: { name: true, creatorProfile: { select: { displayName: true } } } },
          enquiries: user.organizationId ? { where: { organizationId: user.organizationId }, select: { id: true, reference: true, status: true }, take: 1, orderBy: { createdAt: "desc" } } : false,
        },
      },
    },
  });
  return (
    <>
      <PageHeader title="Shortlist" intro="Your saved properties, with private notes only you can see." actions={<ButtonLink href="/discover?open=1" variant="secondary">Find more</ButtonLink>} />
      {items.length === 0 ? (
        <EmptyState title="Your shortlist is empty" body="Use “Shortlist” on any project page to save it here." action={<ButtonLink href="/discover?open=1">Discover IP</ButtonLink>} />
      ) : (
        <ul className="space-y-4">
          {items.map(({ project: p, note }) => {
            const visible = p.status === "PUBLISHED" && !p.hidden;
            const existing = Array.isArray(p.enquiries) ? p.enquiries[0] : undefined;
            return (
              <li key={p.id} className="card grid gap-5 p-4 sm:grid-cols-[9rem_1fr_auto] sm:p-5">
                <Link href={`/ip/${p.slug}`} className="relative block aspect-[4/3] overflow-hidden rounded-2xl sm:aspect-[4/5]">
                  <ProjectCover project={p} />
                  {p.isDemo && <DemoBadge className="absolute left-2 top-2 scale-90" />}
                </Link>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.16em] text-ink-muted">{CATEGORY_LABELS[p.category]}</p>
                  <Link href={`/ip/${p.slug}`} className="display mt-1 block text-3xl hover:underline">
                    {p.title}
                  </Link>
                  <p className="mt-1 text-sm text-ink-muted">by {p.owner.creatorProfile?.displayName ?? p.owner.name}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <RightsBadge status={p.rightsStatus} />
                    {p.licensingCategories.slice(0, 4).map((c) => (
                      <span key={c} className="rounded-full bg-paper px-2.5 py-1 text-[0.72rem] text-ink-soft">
                        {LICENSING_LABELS[c]}
                      </span>
                    ))}
                  </div>
                  {!visible && <p className="mt-3 text-sm text-amber-700">This project is no longer publicly available.</p>}
                  <form action={updateSaveNote.bind(null, p.id)} className="mt-4 flex gap-2">
                    <label htmlFor={`note-${p.id}`} className="sr-only">
                      Private note
                    </label>
                    <input id={`note-${p.id}`} name="note" defaultValue={note ?? ""} placeholder="Private note…" maxLength={500} className="input py-2 text-sm" />
                    <SubmitButton variant="secondary" size="sm" pendingLabel="…">
                      Save note
                    </SubmitButton>
                  </form>
                </div>
                <div className="flex flex-row flex-wrap items-start gap-2 sm:flex-col sm:items-end">
                  {existing ? (
                    <ButtonLink href={`/partner/enquiries/${existing.id}`} size="sm" variant="secondary">
                      View {existing.reference}
                    </ButtonLink>
                  ) : (
                    visible && (
                      <ButtonLink href={`/ip/${p.slug}/enquire`} size="sm">
                        Send enquiry
                      </ButtonLink>
                    )
                  )}
                  <SaveButton projectId={p.id} initialActive next="/partner/shortlist" label="Shortlist" activeLabel="Remove" />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
