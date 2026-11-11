import Link from "next/link";
import { notFound } from "next/navigation";
import type { RightsStatus, StudioStage } from "@prisma/client";
import { db } from "@/lib/db";
import { CATEGORY_LABELS, ENQUIRY_STATUS_LABELS, LICENSING_LABELS, RIGHTS_LABELS, STUDIO_STAGE_LABELS } from "@/lib/labels";
import { formatDate, formatRelative } from "@/lib/utils";
import { publishReadiness } from "@/lib/permissions";
import { ProjectCover } from "@/components/project-cover";
import { ButtonLink, DemoBadge, Notice, RightsBadge } from "@/components/ui";
import { ProjectStatusBadge } from "@/components/status";
import { SubmitButton } from "@/components/form";
import {
  approveProject,
  removeStudioOpportunity,
  requestChanges,
  setRightsStatus,
  toggleFeatured,
  toggleHidden,
  upsertStudioOpportunity,
} from "@/app/actions/admin";

export default async function AdminProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const project = await db.project.findUnique({
    where: { id: (await params).id },
    include: {
      owner: { include: { creatorProfile: true } },
      coverImage: { select: { url: true, caption: true } },
      characters: true,
      contributors: true,
      media: true,
      studio: true,
      moderation: { orderBy: { createdAt: "desc" }, include: { actor: { select: { name: true } } } },
      enquiries: { orderBy: { createdAt: "desc" }, include: { organization: { select: { name: true } } } },
      _count: { select: { follows: true, saves: true } },
    },
  });
  if (!project) notFound();
  const readiness = publishReadiness(project);
  const isVisible = project.status === "PUBLISHED" && !project.hidden;

  return (
    <div>
      <Link href="/admin/projects" className="text-sm text-ink-muted hover:text-ink">
        ← Projects
      </Link>
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <ProjectStatusBadge status={project.status} hidden={project.hidden} />
        <RightsBadge status={project.rightsStatus} />
        {project.isDemo && <DemoBadge className="bg-paper-warm" />}
        {project.featured && <span className="iris-bg rounded-full px-2.5 py-1 text-[0.72rem] font-medium">Featured</span>}
      </div>
      <h1 className="display mt-4 text-4xl sm:text-5xl">{project.title}</h1>
      <p className="mt-2 text-ink-muted">
        {CATEGORY_LABELS[project.category]} · by {project.owner.creatorProfile?.displayName ?? project.owner.name} ({project.owner.email})
      </p>

      <div className="mt-10 grid gap-10 xl:grid-cols-[1fr_24rem]">
        <div className="min-w-0 space-y-8">
          <div className="card overflow-hidden">
            <div className="aspect-[16/7]">
              <ProjectCover project={project} />
            </div>
            <div className="space-y-5 p-6 sm:p-8">
              {project.tagline && <p className="text-lg">{project.tagline}</p>}
              <Block label="Logline" value={project.logline} />
              <Block label="Overview" value={project.overview} />
              <Block label="World" value={project.world} />
              <Block label="Audience" value={project.audience} />
              <Block label="Characters" value={project.characters.map((c) => `${c.name}${c.role ? ` (${c.role})` : ""}`).join(", ") || null} />
              <Block label="Contributors" value={project.contributors.map((c) => `${c.name} — ${c.role}${c.isRightsHolder ? " · rights holder" : ""}`).join("\n") || null} />
              <Block label="AI disclosure" value={project.aiAssisted ? project.aiDisclosure : "No AI tools declared"} />
              <Block label="Licensing" value={project.licensingCategories.map((c) => LICENSING_LABELS[c]).join(", ") || null} />
              <Block label="Ownership declared" value={project.ownershipDeclaredAt ? formatDate(project.ownershipDeclaredAt) : "Not declared"} />
              <p className="text-sm text-ink-muted">
                {project.media.length} media files · {project._count.follows} followers · {project._count.saves} saves
              </p>
              <ButtonLink href={`/ip/${project.slug}`} variant="secondary" size="sm" target="_blank">
                Open page ↗
              </ButtonLink>
            </div>
          </div>

          <section>
            <h2 className="text-lg font-medium">Enquiries</h2>
            {project.enquiries.length === 0 ? (
              <p className="mt-3 text-sm text-ink-muted">None.</p>
            ) : (
              <ul className="card mt-4 divide-y divide-paper-line text-sm">
                {project.enquiries.map((e) => (
                  <li key={e.id} className="flex justify-between gap-4 px-5 py-3">
                    <span>
                      {e.organization.name} <span className="font-mono text-xs text-ink-faint">{e.reference}</span>
                    </span>
                    <span className="text-ink-muted">{ENQUIRY_STATUS_LABELS[e.status]}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="text-lg font-medium">Moderation log</h2>
            <ol className="card mt-4 divide-y divide-paper-line text-sm">
              {project.moderation.map((m) => (
                <li key={m.id} className="px-5 py-3">
                  <div className="flex justify-between gap-4">
                    <span className="font-medium">{m.action.replaceAll("_", " ").toLowerCase()}</span>
                    <span className="text-ink-faint">
                      {m.actor?.name ?? "System"} · {formatRelative(m.createdAt)}
                    </span>
                  </div>
                  {m.note && <p className="mt-1 text-ink-muted">{m.note}</p>}
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="space-y-5 xl:sticky xl:top-8 xl:self-start">
          {(project.status === "IN_REVIEW" || project.status === "PUBLISHED") && (
            <div className="card space-y-4 p-6">
              <h2 className="font-medium">Review</h2>
              {project.status === "IN_REVIEW" && (
                <>
                  {!readiness.ready && <Notice tone="amber">Missing: {readiness.missing.join(", ")}</Notice>}
                  <form action={approveProject.bind(null, project.id)} className="space-y-2">
                    <label htmlFor="approve-note" className="sr-only">
                      Note
                    </label>
                    <input id="approve-note" name="note" placeholder="Optional note" className="input py-2 text-sm" />
                    <SubmitButton className="w-full">Approve & publish</SubmitButton>
                  </form>
                </>
              )}
              <form action={requestChanges.bind(null, project.id)} className="space-y-2 border-t border-paper-line pt-4">
                <label htmlFor="changes-note" className="text-sm font-medium">
                  Request changes
                </label>
                <textarea id="changes-note" name="note" required rows={3} placeholder="What should the creator change? They will see this note." className="input text-sm" />
                <SubmitButton variant="secondary" className="w-full">
                  {project.status === "PUBLISHED" ? "Unpublish & request changes" : "Request changes"}
                </SubmitButton>
              </form>
            </div>
          )}

          <div className="card space-y-4 p-6">
            <h2 className="font-medium">Curation & visibility</h2>
            <form action={toggleFeatured.bind(null, project.id)}>
              <SubmitButton variant="secondary" className="w-full">
                {project.featured ? "Remove from featured" : isVisible ? "Feature on homepage" : "Feature (publish first)"}
              </SubmitButton>
            </form>
            <form action={toggleHidden.bind(null, project.id)} className="space-y-2">
              <label htmlFor="hide-note" className="sr-only">
                Reason
              </label>
              <input id="hide-note" name="note" placeholder={project.hidden ? "Optional note" : "Reason (recorded in the log)"} className="input py-2 text-sm" required={!project.hidden} />
              <SubmitButton variant={project.hidden ? "secondary" : "danger"} className="w-full">
                {project.hidden ? "Restore visibility" : "Hide from public"}
              </SubmitButton>
            </form>
          </div>

          <div className="card space-y-3 p-6">
            <h2 className="font-medium">Rights status</h2>
            <p className="text-xs leading-relaxed text-ink-muted">Only mark rights as documented after reviewing evidence. Record what was reviewed.</p>
            <form action={setRightsStatus.bind(null, project.id)} className="space-y-2">
              <label htmlFor="rightsStatus" className="sr-only">
                Rights status
              </label>
              <select id="rightsStatus" name="rightsStatus" defaultValue={project.rightsStatus} className="input py-2 text-sm">
                {(Object.keys(RIGHTS_LABELS) as RightsStatus[]).map((r) => (
                  <option key={r} value={r}>
                    {RIGHTS_LABELS[r].label}
                  </option>
                ))}
              </select>
              <textarea name="note" required rows={2} placeholder="Evidence reviewed / reason" className="input text-sm" aria-label="Rights note" />
              <SubmitButton variant="secondary" className="w-full">
                Update rights status
              </SubmitButton>
            </form>
          </div>

          <div className="card space-y-3 p-6">
            <h2 className="font-medium">IPPLY Studios</h2>
            <p className="text-xs leading-relaxed text-ink-muted">Internal only. Never shown to the creator or public. Any development requires a separately negotiated agreement.</p>
            <form action={upsertStudioOpportunity.bind(null, project.id)} className="space-y-2">
              <label htmlFor="stage" className="sr-only">
                Stage
              </label>
              <select id="stage" name="stage" defaultValue={project.studio?.stage ?? "SCOUTED"} className="input py-2 text-sm">
                {(Object.keys(STUDIO_STAGE_LABELS) as StudioStage[]).map((s) => (
                  <option key={s} value={s}>
                    {STUDIO_STAGE_LABELS[s]}
                  </option>
                ))}
              </select>
              <input name="formats" defaultValue={project.studio?.formats.join(", ") ?? ""} placeholder="Formats, comma-separated" className="input py-2 text-sm" aria-label="Formats" />
              <textarea name="notes" defaultValue={project.studio?.notes ?? ""} rows={3} placeholder="Notes" className="input text-sm" aria-label="Notes" />
              <SubmitButton variant="secondary" className="w-full">
                {project.studio ? "Update pipeline" : "Add to studio pipeline"}
              </SubmitButton>
            </form>
            {project.studio && (
              <form action={removeStudioOpportunity.bind(null, project.id)}>
                <button className="text-xs text-ink-muted underline underline-offset-4">Remove from pipeline</button>
              </form>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Block({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-ink-muted">{label}</p>
      <p className="mt-1 whitespace-pre-line text-sm leading-relaxed">{value || <span className="text-ink-faint">—</span>}</p>
    </div>
  );
}
