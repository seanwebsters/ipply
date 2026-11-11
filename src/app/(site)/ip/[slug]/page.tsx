import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { canEnquire, canViewProject, isPubliclyVisible } from "@/lib/permissions";
import { CATEGORY_LABELS, CATEGORY_SLUGS, LICENSING_LABELS, RIGHTS_LABELS, STATUS_LABELS } from "@/lib/labels";
import { formatDate } from "@/lib/utils";
import { ProjectCover } from "@/components/project-cover";
import { KeyArt, parseKeyArt, PALETTE_DEFS } from "@/components/key-art";
import { Badge, ButtonLink, DemoBadge, Notice, RightsBadge } from "@/components/ui";
import { FollowButton, SaveButton, ViewTracker } from "@/components/engagement";

const getProject = cache(async (slug: string) =>
  db.project.findUnique({
    where: { slug },
    include: {
      owner: { include: { creatorProfile: true } },
      coverImage: { select: { url: true, caption: true } },
      characters: { orderBy: { sortOrder: "asc" } },
      media: { orderBy: { sortOrder: "asc" } },
      updates: { orderBy: { createdAt: "desc" }, take: 10 },
      contributors: { orderBy: { createdAt: "asc" } },
      _count: { select: { follows: true } },
    },
  }),
);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const project = await getProject((await params).slug);
  if (!project || !isPubliclyVisible(project)) return { title: "Project" };
  return {
    title: project.title,
    description: project.tagline ?? project.logline ?? undefined,
    openGraph: { title: `${project.title} on IPPLY`, description: project.tagline ?? undefined },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [project, viewer] = await Promise.all([getProject(slug), getCurrentUser()]);
  if (!project || !canViewProject(viewer, project)) notFound();

  const isPublic = isPubliclyVisible(project);
  const isOwner = viewer?.id === project.ownerId;
  const [following, saved, openEnquiry] = viewer
    ? await Promise.all([
        db.follow.findUnique({ where: { userId_projectId: { userId: viewer.id, projectId: project.id } } }),
        db.savedProject.findUnique({ where: { userId_projectId: { userId: viewer.id, projectId: project.id } } }),
        viewer.organizationId
          ? db.enquiry.findFirst({
              where: { projectId: project.id, organizationId: viewer.organizationId, status: { notIn: ["DECLINED", "WITHDRAWN"] } },
              select: { id: true, reference: true },
            })
          : null,
      ])
    : [null, null, null];

  const creator = project.owner.creatorProfile;
  const creatorName = creator?.displayName ?? project.owner.name;
  const art = parseKeyArt(project.keyArt, project.slug);
  const palette = PALETTE_DEFS[art.palette];
  const images = project.media.filter((m) => m.kind === "IMAGE");
  const otherMedia = project.media.filter((m) => m.kind !== "IMAGE");
  const enquiryAllowed = canEnquire(viewer, project);
  const paragraphs = (t: string | null) => (t ?? "").split(/\n{2,}/).filter(Boolean);
  const path = `/ip/${project.slug}`;

  return (
    <article>
      {isPublic && !isOwner && viewer?.role !== "ADMIN" && <ViewTracker projectId={project.id} />}

      {!isPublic && (
        <div className="bg-amber-50 text-amber-900">
          <div className="site-container flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
            <p>
              <strong className="font-semibold">Preview.</strong> This project is {STATUS_LABELS[project.status].toLowerCase()}
              {project.hidden ? " and hidden by IPPLY" : ""} — only you{isOwner ? "" : " (and the creator)"} can see this page.
            </p>
            {isOwner && (
              <Link href={`/dashboard/projects/${project.id}`} className="font-medium underline underline-offset-4">
                Back to editor
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Hero */}
      <header className="relative isolate overflow-hidden bg-ink text-white">
        <div className="absolute inset-0 -z-10">
          <ProjectCover project={project} priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />
        </div>
        <div className="site-container flex min-h-[78vh] flex-col justify-end pb-12 pt-32 sm:pb-16">
          <div className="flex flex-wrap items-center gap-2">
            {project.isDemo && <DemoBadge onDark />}
            <Link
              href={`/discover?category=${CATEGORY_SLUGS[project.category]}`}
              className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur hover:bg-white/25"
            >
              {CATEGORY_LABELS[project.category]}
            </Link>
            {project.genres.map((g) => (
              <span key={g} className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/80">
                {g}
              </span>
            ))}
          </div>
          <h1 className="display mt-6 max-w-5xl text-6xl sm:text-8xl lg:text-[8.5rem]">{project.title}</h1>
          {project.tagline && <p className="mt-6 max-w-2xl text-xl font-light text-white/85 sm:text-2xl">{project.tagline}</p>}
          <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <p className="text-sm text-white/70">
              Created by{" "}
              {creator ? (
                <Link href={`/creators/${creator.handle}`} className="font-medium text-white underline-offset-4 hover:underline">
                  {creatorName}
                </Link>
              ) : (
                <span className="font-medium text-white">{creatorName}</span>
              )}
              {creator?.location ? ` · ${creator.location}` : ""}
            </p>
            {isPublic && (
              <div className="flex flex-wrap gap-2">
                <FollowButton projectId={project.id} initialActive={!!following} initialCount={project._count.follows} next={path} onDark />
                <SaveButton
                  projectId={project.id}
                  initialActive={!!saved}
                  next={path}
                  onDark
                  label={viewer?.role === "PARTNER" ? "Shortlist" : "Save"}
                  activeLabel={viewer?.role === "PARTNER" ? "Shortlisted" : "Saved"}
                />
                {(project.openToLicensing || project.openToDevelopment) && !isOwner && (
                  <a href="#licensing" className="inline-flex h-11 items-center rounded-full bg-white px-5 text-sm font-medium text-ink hover:bg-white/90">
                    Request to license
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="site-container grid gap-16 py-20 lg:grid-cols-[1fr_22rem] lg:gap-20">
        <div className="min-w-0 space-y-24">
          {project.logline && (
            <section aria-labelledby="logline">
              <h2 id="logline" className="eyebrow">
                Logline
              </h2>
              <p className="display mt-5 text-3xl leading-[1.15] sm:text-[2.6rem]">{project.logline}</p>
            </section>
          )}

          {project.overview && (
            <section aria-labelledby="overview">
              <h2 id="overview" className="eyebrow">
                Overview
              </h2>
              <div className="prose-ipply mt-6 max-w-2xl">
                {paragraphs(project.overview).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>
          )}

          {(images.length > 0 || otherMedia.length > 0) && (
            <section aria-labelledby="gallery">
              <h2 id="gallery" className="eyebrow">
                Artwork &amp; media
              </h2>
              {images.length > 0 && (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {images.map((m, i) => (
                    <figure key={m.id} className={i === 0 && images.length % 2 === 1 ? "sm:col-span-2" : ""}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m.url} alt={m.caption || `${project.title} artwork ${i + 1}`} loading="lazy" className="w-full rounded-3xl bg-paper-warm object-cover" />
                      {m.caption && <figcaption className="mt-2 text-sm text-ink-muted">{m.caption}</figcaption>}
                    </figure>
                  ))}
                </div>
              )}
              {otherMedia.length > 0 && (
                <ul className="mt-6 space-y-4">
                  {otherMedia.map((m) => (
                    <li key={m.id} className="card p-4">
                      {m.kind === "VIDEO" && <video src={m.url} controls preload="metadata" className="w-full rounded-2xl bg-black" />}
                      {m.kind === "AUDIO" && <audio src={m.url} controls className="w-full" />}
                      {m.kind === "DOCUMENT" && (
                        <a href={m.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between text-sm font-medium">
                          {m.caption || "Document (PDF)"} <span aria-hidden>↗</span>
                        </a>
                      )}
                      {m.caption && m.kind !== "DOCUMENT" && <p className="mt-2 text-sm text-ink-muted">{m.caption}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {project.world && (
            <section aria-labelledby="world" className="relative overflow-hidden rounded-4xl p-8 sm:p-12" style={{ background: `linear-gradient(135deg, ${palette.bg[0]}, ${palette.bg[2]})`, color: palette.ink }}>
              <h2 id="world" className="text-[0.72rem] font-medium uppercase tracking-[0.18em] opacity-70">
                The world
              </h2>
              <div className="mt-6 max-w-2xl space-y-5 text-lg leading-relaxed">
                {paragraphs(project.world).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>
          )}

          {project.characters.length > 0 && (
            <section aria-labelledby="characters">
              <h2 id="characters" className="eyebrow">
                Characters
              </h2>
              <ul className="mt-6 grid gap-5 sm:grid-cols-2">
                {project.characters.map((c, i) => (
                  <li key={c.id} className="card overflow-hidden">
                    <div className="relative h-28">
                      <KeyArt spec={{ ...art, motif: (["orbit", "bloom", "arch", "stack", "tide", "grid"] as const)[i % 6] }} seed={`${project.slug}-${c.name}`} className="h-full w-full" />
                      <span className="display absolute bottom-3 left-5 text-5xl text-white drop-shadow-sm">{c.name.charAt(0)}</span>
                    </div>
                    <div className="p-6">
                      <h3 className="display text-3xl">{c.name}</h3>
                      {c.role && <p className="mt-1 text-sm font-medium text-ink-muted">{c.role}</p>}
                      {c.description && <p className="mt-3 leading-relaxed text-ink-soft">{c.description}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {project.updates.length > 0 && (
            <section aria-labelledby="updates">
              <h2 id="updates" className="eyebrow">
                Project updates
              </h2>
              <ol className="mt-6 space-y-0 border-l border-paper-line">
                {project.updates.map((u) => (
                  <li key={u.id} className="relative pb-10 pl-8 last:pb-0">
                    <span aria-hidden className="iris-bg absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full" />
                    <time className="text-xs uppercase tracking-wider text-ink-faint" dateTime={u.createdAt.toISOString()}>
                      {formatDate(u.createdAt)}
                    </time>
                    <h3 className="mt-2 text-lg font-medium">{u.title}</h3>
                    <p className="mt-2 max-w-2xl leading-relaxed text-ink-muted">{u.body}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Licensing */}
          <section id="licensing" aria-labelledby="licensing-title" className="scroll-mt-28 rounded-4xl bg-ink p-8 text-white sm:p-12">
            <p className="text-[0.72rem] font-medium uppercase tracking-[0.18em] text-white/50">Commercial opportunities</p>
            <h2 id="licensing-title" className="display mt-4 text-4xl sm:text-5xl">
              {project.openToLicensing || project.openToDevelopment ? (
                <>
                  Bring {project.title} <span className="iris-text italic">to the world.</span>
                </>
              ) : (
                "Not currently open to enquiries"
              )}
            </h2>
            {project.licensingCategories.length > 0 && (
              <ul className="mt-8 flex flex-wrap gap-2">
                {project.licensingCategories.map((c) => (
                  <li key={c} className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/85">
                    {LICENSING_LABELS[c]}
                  </li>
                ))}
              </ul>
            )}
            {project.commercialNotes && <p className="mt-8 max-w-2xl leading-relaxed text-white/70">{project.commercialNotes}</p>}
            <div className="mt-10 flex flex-wrap items-center gap-4">
              {isOwner ? (
                <p className="text-sm text-white/60">This is your project. Enquiries appear in your dashboard.</p>
              ) : openEnquiry ? (
                <ButtonLink href={`/partner/enquiries/${openEnquiry.id}`} variant="light" size="lg">
                  View your enquiry {openEnquiry.reference}
                </ButtonLink>
              ) : enquiryAllowed ? (
                <ButtonLink href={`/ip/${project.slug}/enquire`} variant="light" size="lg">
                  Request to license
                </ButtonLink>
              ) : project.rightsStatus === "DISPUTED" ? (
                <p className="text-sm text-white/60">Enquiries are paused while a rights claim is reviewed.</p>
              ) : project.openToLicensing || project.openToDevelopment ? (
                viewer?.role === "PARTNER" ? (
                  <ButtonLink href="/partner/organisation" variant="light" size="lg">
                    Complete your organisation profile to enquire
                  </ButtonLink>
                ) : (
                  <>
                    <ButtonLink href={`/join?as=partner&next=${encodeURIComponent(`/ip/${project.slug}/enquire`)}`} variant="light" size="lg">
                      Request to license
                    </ButtonLink>
                    <p className="text-sm text-white/55">Commercial enquiries require a partner account.</p>
                  </>
                )
              ) : null}
            </div>
            <p className="mt-10 border-t border-white/10 pt-6 text-xs leading-relaxed text-white/45">
              An enquiry is an expression of interest, not an offer or a contract. Any licence, option or development right is agreed
              separately and explicitly with the rights holders.
            </p>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <div className="card p-6">
            <p className="eyebrow">Creator</p>
            <div className="mt-4 flex items-center gap-4">
              <div className="iris-bg flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-xl font-medium">{creatorName.charAt(0)}</div>
              <div>
                <p className="font-medium">{creatorName}</p>
                {creator?.headline && <p className="text-sm text-ink-muted">{creator.headline}</p>}
              </div>
            </div>
            {creator?.bio && <p className="mt-4 text-sm leading-relaxed text-ink-muted">{creator.bio}</p>}
            {creator && (
              <Link href={`/creators/${creator.handle}`} className="mt-4 inline-block text-sm font-medium underline underline-offset-4">
                View profile
              </Link>
            )}
          </div>

          <dl className="card divide-y divide-paper-line text-sm">
            {project.formats.length > 0 && (
              <div className="p-6">
                <dt className="eyebrow">Formats</dt>
                <dd className="mt-3 space-y-1.5">
                  {project.formats.map((f) => (
                    <p key={f}>{f}</p>
                  ))}
                </dd>
              </div>
            )}
            {project.audience && (
              <div className="p-6">
                <dt className="eyebrow">Audience</dt>
                <dd className="mt-3 leading-relaxed text-ink-soft">{project.audience}</dd>
              </div>
            )}
            <div className="p-6">
              <dt className="eyebrow">Rights</dt>
              <dd className="mt-3">
                <RightsBadge status={project.rightsStatus} />
                <p className="mt-3 text-xs leading-relaxed text-ink-muted">{RIGHTS_LABELS[project.rightsStatus].detail}</p>
                {project.contributors.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {project.contributors.map((c) => (
                      <li key={c.id} className="flex items-baseline justify-between gap-3">
                        <span>
                          {c.name} <span className="text-ink-faint">· {c.role}</span>
                        </span>
                        {c.isRightsHolder && <Badge>Rights holder</Badge>}
                      </li>
                    ))}
                  </ul>
                )}
              </dd>
            </div>
            <div className="p-6">
              <dt className="eyebrow">AI disclosure</dt>
              <dd className="mt-3 leading-relaxed text-ink-soft">
                {project.aiAssisted ? project.aiDisclosure : "The creator has declared that no AI tools were used to create this work."}
              </dd>
            </div>
            {project.publishedAt && (
              <div className="p-6">
                <dt className="eyebrow">Published</dt>
                <dd className="mt-3">{formatDate(project.publishedAt)}</dd>
              </div>
            )}
          </dl>

          {project.isDemo && (
            <Notice tone="amber">
              <strong className="font-semibold">Demonstration project.</strong> {project.title} and its creator are fictional, created by IPPLY
              to show how the platform works.
            </Notice>
          )}
        </aside>
      </div>
    </article>
  );
}
