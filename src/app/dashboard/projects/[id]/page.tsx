import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { LicensingCategory, ProjectCategory } from "@prisma/client";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { publishReadiness, isPubliclyVisible } from "@/lib/permissions";
import { CATEGORY_LABELS, LICENSING_LABELS, RIGHTS_LABELS, STATUS_LABELS } from "@/lib/labels";
import { cn, formatBytes, formatDate, formatRelative } from "@/lib/utils";
import { ActionForm, Field, Select, TextArea, TextInput } from "@/components/action-form";
import { SubmitButton } from "@/components/form";
import { ProjectCover } from "@/components/project-cover";
import { KeyArt, MOTIFS, PALETTES, parseKeyArt } from "@/components/key-art";
import { Badge, ButtonLink, Notice, RightsBadge } from "@/components/ui";
import { ProjectStatusBadge } from "@/components/status";
import { MediaUploader } from "@/components/media-uploader";
import {
  addCharacter,
  addContributor,
  deleteCharacter,
  deleteContributor,
  deleteMedia,
  deleteProject,
  deleteUpdate,
  postUpdate,
  restoreProject,
  saveBasics,
  saveCommercial,
  saveKeyArt,
  saveRights,
  saveStory,
  setCover,
  submitForReview,
  unpublishProject,
  updateCaption,
  withdrawSubmission,
} from "@/app/actions/projects";

export const metadata: Metadata = { title: "Edit project" };

const STEPS = [
  { key: "basics", label: "Basics" },
  { key: "story", label: "Story & world" },
  { key: "characters", label: "Characters" },
  { key: "visuals", label: "Artwork & media" },
  { key: "rights", label: "Rights & credits" },
  { key: "commercial", label: "Commercial" },
  { key: "publish", label: "Publish" },
  { key: "updates", label: "Updates" },
] as const;
type StepKey = (typeof STEPS)[number]["key"];

export default async function EditProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ step?: string; saved?: string; created?: string }>;
}) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const user = await requireUser(["CREATOR"]);
  const project = await db.project.findUnique({
    where: { id },
    include: {
      coverImage: { select: { url: true, caption: true } },
      characters: { orderBy: { sortOrder: "asc" } },
      media: { orderBy: { sortOrder: "asc" } },
      contributors: { orderBy: { createdAt: "asc" } },
      updates: { orderBy: { createdAt: "desc" } },
      moderation: { orderBy: { createdAt: "desc" }, take: 5, where: { action: { in: ["CHANGES_REQUESTED", "APPROVED", "HIDDEN"] } } },
      _count: { select: { follows: true, saves: true, enquiries: true } },
    },
  });
  if (!project || project.ownerId !== user.id) notFound();

  const step: StepKey = STEPS.some((s) => s.key === sp.step) ? (sp.step as StepKey) : "basics";
  const readiness = publishReadiness(project);
  const art = parseKeyArt(project.keyArt, project.slug);
  const stepDone: Partial<Record<StepKey, boolean>> = {
    basics: !!project.title && !!project.logline,
    story: !!project.overview && project.overview.length >= 80,
    characters: project.characters.length > 0,
    visuals: project.media.length > 0,
    rights: !!project.ownershipDeclaredAt,
    commercial: project.licensingCategories.length > 0,
    publish: project.status === "PUBLISHED",
  };
  const lastFeedback = project.moderation.find((m) => m.action === "CHANGES_REQUESTED");

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/dashboard/projects" className="text-sm text-ink-muted hover:text-ink">
          ← Projects
        </Link>
        <div className="flex items-center gap-3">
          <ProjectStatusBadge status={project.status} hidden={project.hidden} />
          <ButtonLink href={`/ip/${project.slug}`} variant="secondary" size="sm" target="_blank">
            {isPubliclyVisible(project) ? "View live page ↗" : "Preview ↗"}
          </ButtonLink>
        </div>
      </div>
      <h1 className="display mt-6 text-4xl sm:text-5xl">{project.title}</h1>

      {sp.created && (
        <Notice tone="green" className="mt-6">
          Draft created. Now tell us the story — you can come back to any step at any time.
        </Notice>
      )}
      {sp.saved && !sp.created && (
        <Notice tone="green" className="mt-6">
          Saved.
        </Notice>
      )}
      {project.status === "CHANGES_REQUESTED" && lastFeedback?.note && (
        <Notice tone="amber" className="mt-6">
          <strong className="font-semibold">The IPPLY team requested changes:</strong> {lastFeedback.note}
        </Notice>
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-[13rem_1fr] 2xl:grid-cols-[13rem_1fr_19rem]">
        {/* Step rail */}
        <nav aria-label="Project sections" className="-mx-5 overflow-x-auto px-5 lg:row-span-2 lg:mx-0 lg:px-0 2xl:row-span-1">
          <ol className="flex gap-1 lg:sticky lg:top-8 lg:flex-col">
            {STEPS.map((s, i) => (
              <li key={s.key} className="shrink-0">
                <Link
                  href={`/dashboard/projects/${project.id}?step=${s.key}`}
                  aria-current={step === s.key ? "step" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                    step === s.key ? "bg-ink text-white" : "text-ink-soft hover:bg-white",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[0.65rem]",
                      stepDone[s.key] ? "iris-bg text-ink" : step === s.key ? "bg-white/20" : "bg-ink/5",
                    )}
                  >
                    {stepDone[s.key] ? "✓" : i + 1}
                  </span>
                  {s.label}
                </Link>
              </li>
            ))}
          </ol>
        </nav>

        {/* Step content */}
        <div className="min-w-0">
          <div className="card p-6 sm:p-10">
            {step === "basics" && (
              <Section title="The basics" intro="How your project introduces itself to the world.">
                <ActionForm action={saveBasics.bind(null, project.id)} className="space-y-6">
                  <Field name="title" label="Title">
                    <TextInput name="title" defaultValue={project.title} maxLength={80} />
                  </Field>
                  <Field name="category" label="Category">
                    <Select name="category" defaultValue={project.category}>
                      {(Object.keys(CATEGORY_LABELS) as ProjectCategory[]).map((c) => (
                        <option key={c} value={c}>
                          {CATEGORY_LABELS[c]}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field name="tagline" label="Tagline" hint="A single line for cards and the top of your page.">
                    <TextInput name="tagline" defaultValue={project.tagline ?? ""} maxLength={120} />
                  </Field>
                  <Field name="logline" label="Logline" hint="One or two sentences: who, what they want, what's in the way. Required to publish.">
                    <TextArea name="logline" defaultValue={project.logline ?? ""} rows={3} maxLength={300} />
                  </Field>
                  <Field name="genres" label="Genres & tags" hint="Comma-separated, up to six.">
                    <TextInput name="genres" defaultValue={project.genres.join(", ")} placeholder="Gentle adventure, Friendship" />
                  </Field>
                  <SubmitButton>Save & continue</SubmitButton>
                </ActionForm>
              </Section>
            )}

            {step === "story" && (
              <Section title="Story & world" intro="The heart of your project — what partners and fans will read first.">
                <ActionForm action={saveStory.bind(null, project.id)} className="space-y-6">
                  <Field name="overview" label="Overview" hint="What is it, what happens, why it matters. Separate paragraphs with a blank line. At least 80 characters to publish.">
                    <TextArea name="overview" defaultValue={project.overview ?? ""} rows={9} maxLength={4000} />
                  </Field>
                  <Field name="world" label="The world" hint="Where and when it's set; the rules that make it unique.">
                    <TextArea name="world" defaultValue={project.world ?? ""} rows={6} maxLength={4000} />
                  </Field>
                  <Field name="audience" label="Audience" hint="Who is it for?">
                    <TextInput name="audience" defaultValue={project.audience ?? ""} maxLength={600} />
                  </Field>
                  <Field name="formats" label="Formats" hint="One per line — e.g. Picture book series, Animated shorts (7 min), Plush collection.">
                    <TextArea name="formats" defaultValue={project.formats.join("\n")} rows={4} />
                  </Field>
                  <SubmitButton>Save & continue</SubmitButton>
                </ActionForm>
              </Section>
            )}

            {step === "characters" && (
              <Section title="Characters" intro="The people, creatures and objects at the centre of your world.">
                {project.characters.length > 0 && (
                  <ul className="mb-10 space-y-3">
                    {project.characters.map((c) => (
                      <li key={c.id} className="flex items-start justify-between gap-4 rounded-2xl border border-paper-line p-5">
                        <div>
                          <p className="font-medium">
                            {c.name} {c.role && <span className="font-normal text-ink-muted">· {c.role}</span>}
                          </p>
                          {c.description && <p className="mt-1 text-sm text-ink-muted">{c.description}</p>}
                        </div>
                        <form action={deleteCharacter.bind(null, project.id, c.id)}>
                          <button className="text-xs text-ink-muted underline underline-offset-4 hover:text-rose-700">Remove</button>
                        </form>
                      </li>
                    ))}
                  </ul>
                )}
                <ActionForm action={addCharacter.bind(null, project.id)} resetOnSuccess className="space-y-5 rounded-2xl bg-paper p-5 sm:p-6">
                  <p className="font-medium">Add a character</p>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field name="name" label="Name">
                      <TextInput name="name" maxLength={60} />
                    </Field>
                    <Field name="role" label="Role">
                      <TextInput name="role" placeholder="e.g. Protagonist" maxLength={60} />
                    </Field>
                  </div>
                  <Field name="description" label="Description">
                    <TextArea name="description" rows={3} maxLength={800} />
                  </Field>
                  <div className="flex flex-wrap gap-3">
                    <SubmitButton variant="secondary" pendingLabel="Adding…">
                      Add character
                    </SubmitButton>
                    <ButtonLink href={`/dashboard/projects/${project.id}?step=visuals`}>Continue</ButtonLink>
                  </div>
                </ActionForm>
              </Section>
            )}

            {step === "visuals" && (
              <Section title="Artwork & media" intro="Upload your own artwork, trailers, music or pitch documents. Until you add a cover image, IPPLY generates poster-style key art for you.">
                <MediaUploader projectId={project.id} />
                {project.media.length > 0 && (
                  <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                    {project.media.map((m) => (
                      <li key={m.id} className="overflow-hidden rounded-2xl border border-paper-line">
                        <div className="relative flex aspect-[4/3] items-center justify-center bg-paper">
                          {m.kind === "IMAGE" ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={m.url} alt={m.caption ?? ""} className="h-full w-full object-cover" />
                          ) : m.kind === "VIDEO" ? (
                            <video src={m.url} controls preload="metadata" className="h-full w-full bg-black" />
                          ) : m.kind === "AUDIO" ? (
                            <audio src={m.url} controls className="w-11/12" />
                          ) : (
                            <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-sm underline">
                              Open PDF ↗
                            </a>
                          )}
                          {project.coverImageId === m.id && <Badge tone="dark" className="absolute left-3 top-3">Cover</Badge>}
                        </div>
                        <div className="space-y-3 p-4">
                          <form action={updateCaption.bind(null, project.id, m.id)} className="flex gap-2">
                            <label className="sr-only" htmlFor={`cap-${m.id}`}>
                              Caption
                            </label>
                            <input id={`cap-${m.id}`} name="caption" defaultValue={m.caption ?? ""} placeholder="Caption / alt text" className="input py-2 text-sm" maxLength={200} />
                            <SubmitButton variant="secondary" size="sm" pendingLabel="…">
                              Save
                            </SubmitButton>
                          </form>
                          <div className="flex items-center justify-between text-xs text-ink-muted">
                            <span>
                              {m.kind.toLowerCase()} · {formatBytes(m.sizeBytes)}
                            </span>
                            <span className="flex gap-3">
                              {m.kind === "IMAGE" && project.coverImageId !== m.id && (
                                <form action={setCover.bind(null, project.id, m.id)}>
                                  <button className="underline underline-offset-4 hover:text-ink">Make cover</button>
                                </form>
                              )}
                              <form action={deleteMedia.bind(null, project.id, m.id)}>
                                <button className="underline underline-offset-4 hover:text-rose-700">Delete</button>
                              </form>
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                {project.coverImageId && (
                  <form action={setCover.bind(null, project.id, null)} className="mt-4">
                    <button className="text-sm text-ink-muted underline underline-offset-4 hover:text-ink">Use generated key art as cover instead</button>
                  </form>
                )}

                <div className="mt-12 border-t border-paper-line pt-10">
                  <h3 className="text-lg font-medium">Generated key art</h3>
                  <p className="mt-1 text-sm text-ink-muted">Used as your cover until you upload artwork, and as an accent throughout your page.</p>
                  <ActionForm action={saveKeyArt.bind(null, project.id)} className="mt-6 space-y-6">
                    <fieldset>
                      <legend className="field-label">Composition</legend>
                      <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                        {MOTIFS.map((m) => (
                          <label key={m} className="cursor-pointer">
                            <input type="radio" name="motif" value={m} defaultChecked={art.motif === m} className="peer sr-only" />
                            <span className="block overflow-hidden rounded-xl border-2 border-transparent peer-checked:border-ink peer-focus-visible:ring-2 peer-focus-visible:ring-iris-lavender">
                              <KeyArt spec={{ motif: m, palette: art.palette }} seed={project.slug} className="aspect-square w-full" />
                            </span>
                            <span className="mt-1 block text-center text-[0.7rem] capitalize text-ink-muted">{m}</span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                    <fieldset>
                      <legend className="field-label">Palette</legend>
                      <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                        {PALETTES.map((p) => (
                          <label key={p} className="cursor-pointer">
                            <input type="radio" name="palette" value={p} defaultChecked={art.palette === p} className="peer sr-only" />
                            <span className="block overflow-hidden rounded-xl border-2 border-transparent peer-checked:border-ink peer-focus-visible:ring-2 peer-focus-visible:ring-iris-lavender">
                              <KeyArt spec={{ motif: art.motif, palette: p }} seed={project.slug} className="aspect-square w-full" />
                            </span>
                            <span className="mt-1 block text-center text-[0.7rem] capitalize text-ink-muted">{p}</span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                    <div className="flex flex-wrap gap-3">
                      <SubmitButton variant="secondary">Save key art</SubmitButton>
                      <ButtonLink href={`/dashboard/projects/${project.id}?step=rights`}>Continue</ButtonLink>
                    </div>
                  </ActionForm>
                </div>
              </Section>
            )}

            {step === "rights" && (
              <Section title="Rights & credits" intro="Who made this, who owns it, and how it was made. This information builds trust with partners.">
                <h3 className="font-medium">Contributors & rights holders</h3>
                <ul className="mt-4 space-y-2">
                  {project.contributors.map((c) => (
                    <li key={c.id} className="flex items-center justify-between gap-4 rounded-2xl border border-paper-line px-5 py-4 text-sm">
                      <span>
                        <span className="font-medium">{c.name}</span> <span className="text-ink-muted">· {c.role}</span>
                        {c.shareBps !== null && <span className="text-ink-muted"> · {(c.shareBps / 100).toFixed(c.shareBps % 100 ? 2 : 0)}%</span>}
                      </span>
                      <span className="flex items-center gap-3">
                        {c.isRightsHolder && <Badge>Rights holder</Badge>}
                        {c.userId !== user.id && (
                          <form action={deleteContributor.bind(null, project.id, c.id)}>
                            <button className="text-xs text-ink-muted underline underline-offset-4 hover:text-rose-700">Remove</button>
                          </form>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
                <ActionForm action={addContributor.bind(null, project.id)} resetOnSuccess className="mt-4 grid gap-4 rounded-2xl bg-paper p-5 sm:grid-cols-[1fr_1fr_7rem]">
                  <Field name="name" label="Name">
                    <TextInput name="name" maxLength={80} />
                  </Field>
                  <Field name="role" label="Role">
                    <TextInput name="role" placeholder="e.g. Co-writer" maxLength={60} />
                  </Field>
                  <Field name="sharePercent" label="Share %" hint="Optional">
                    <TextInput name="sharePercent" type="number" min={0} max={100} step="0.01" />
                  </Field>
                  <label className="flex items-center gap-2 text-sm sm:col-span-2">
                    <input type="checkbox" name="isRightsHolder" className="h-4 w-4 accent-ink" /> Co-owns the rights
                  </label>
                  <div className="sm:text-right">
                    <SubmitButton variant="secondary" size="sm" pendingLabel="Adding…">
                      Add
                    </SubmitButton>
                  </div>
                </ActionForm>
                <p className="mt-3 text-xs text-ink-muted">Shares are declarative and help partners understand who must approve a deal. They are not a legal agreement between contributors.</p>

                <ActionForm action={saveRights.bind(null, project.id)} className="mt-12 space-y-6 border-t border-paper-line pt-10">
                  <h3 className="font-medium">AI disclosure</h3>
                  <label className="flex items-start gap-3 text-sm">
                    <input type="checkbox" name="aiAssisted" defaultChecked={project.aiAssisted} className="mt-0.5 h-4 w-4 accent-ink" />
                    <span>AI tools were used in creating this project.</span>
                  </label>
                  <Field name="aiDisclosure" label="How were they used?" hint="Be specific about what is your own work. Copyright protection for AI-generated material varies by jurisdiction.">
                    <TextArea name="aiDisclosure" defaultValue={project.aiDisclosure ?? ""} rows={3} maxLength={1000} />
                  </Field>
                  <div className="rounded-2xl border border-paper-line bg-paper p-5">
                    <label className="flex items-start gap-3 text-sm leading-relaxed">
                      <input type="checkbox" name="declareOwnership" defaultChecked={!!project.ownershipDeclaredAt} className="mt-1 h-4 w-4 accent-ink" />
                      <span>
                        I declare that I own or control the rights to this project, that it does not infringe anyone else&apos;s rights, and that I
                        have listed everyone who holds rights in it. I understand IPPLY records this as a <strong>creator declaration</strong>, not a
                        verification, and that publishing grants IPPLY only the limited permission to display my listing.
                      </span>
                    </label>
                    {project.ownershipDeclaredAt && <p className="mt-3 pl-7 text-xs text-ink-muted">Declared {formatDate(project.ownershipDeclaredAt)}</p>}
                  </div>
                  <SubmitButton>Save & continue</SubmitButton>
                </ActionForm>
              </Section>
            )}

            {step === "commercial" && (
              <Section title="Commercial opportunities" intro="Let partners know what you're open to. You decide on every deal — nothing is agreed without you.">
                <ActionForm action={saveCommercial.bind(null, project.id)} className="space-y-8">
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 text-sm">
                      <input type="checkbox" name="openToLicensing" defaultChecked={project.openToLicensing} className="mt-0.5 h-4 w-4 accent-ink" />
                      <span>
                        <span className="font-medium">Open to licensing enquiries</span>
                        <span className="block text-ink-muted">Products, publishing, media and more.</span>
                      </span>
                    </label>
                    <label className="flex items-start gap-3 text-sm">
                      <input type="checkbox" name="openToDevelopment" defaultChecked={project.openToDevelopment} className="mt-0.5 h-4 w-4 accent-ink" />
                      <span>
                        <span className="font-medium">Open to development conversations</span>
                        <span className="block text-ink-muted">Studios, producers and IPPLY Studios.</span>
                      </span>
                    </label>
                  </div>
                  <fieldset>
                    <legend className="field-label">Available licensing categories</legend>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(Object.keys(LICENSING_LABELS) as LicensingCategory[]).map((c) => (
                        <label key={c} className="cursor-pointer">
                          <input type="checkbox" name="licensingCategories" value={c} defaultChecked={project.licensingCategories.includes(c)} className="peer sr-only" />
                          <span className="inline-flex rounded-full border border-paper-line bg-white px-4 py-2 text-sm transition peer-checked:border-ink peer-checked:bg-ink peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-iris-lavender">
                            {LICENSING_LABELS[c]}
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <Field name="commercialNotes" label="Notes for partners" hint="What kind of partner are you looking for? What's available on request?">
                    <TextArea name="commercialNotes" defaultValue={project.commercialNotes ?? ""} rows={4} maxLength={1500} />
                  </Field>
                  <SubmitButton>Save & continue</SubmitButton>
                </ActionForm>
              </Section>
            )}

            {step === "publish" && (
              <Section title="Publish" intro="Published projects appear in IPPLY Discover after a short review by the IPPLY team.">
                <ul className="space-y-2">
                  {[
                    ["Title & logline", !!project.title && !!project.logline, "basics"],
                    ["Overview (80+ characters)", !!project.overview && project.overview.length >= 80, "story"],
                    ["Ownership declaration", !!project.ownershipDeclaredAt, "rights"],
                    ["At least one character (recommended)", project.characters.length > 0, "characters"],
                    ["Artwork or media (recommended)", project.media.length > 0, "visuals"],
                    ["Licensing categories (recommended)", project.licensingCategories.length > 0, "commercial"],
                  ].map(([label, ok, s]) => (
                    <li key={label as string} className="flex items-center justify-between rounded-2xl border border-paper-line px-5 py-3.5 text-sm">
                      <span className="flex items-center gap-3">
                        <span className={cn("flex h-5 w-5 items-center justify-center rounded-full text-[0.65rem]", ok ? "iris-bg" : "bg-ink/5 text-ink-faint")}>{ok ? "✓" : ""}</span>
                        {label as string}
                      </span>
                      {!ok && (
                        <Link href={`/dashboard/projects/${project.id}?step=${s}`} className="text-xs underline underline-offset-4">
                          Complete
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>

                <div className="mt-10">
                  {(project.status === "DRAFT" || project.status === "CHANGES_REQUESTED") && (
                    <ActionForm action={submitForReview.bind(null, project.id)}>
                      <SubmitButton size="lg" pendingLabel="Submitting…">
                        {project.status === "CHANGES_REQUESTED" ? "Resubmit for review" : "Submit for publishing"}
                      </SubmitButton>
                      {!readiness.ready && <p className="mt-3 text-sm text-ink-muted">Complete the required items above to submit.</p>}
                    </ActionForm>
                  )}
                  {project.status === "IN_REVIEW" && (
                    <div className="space-y-4">
                      <Notice>Submitted {project.submittedAt ? formatRelative(project.submittedAt) : ""}. The IPPLY team will review it shortly. You can keep editing while you wait.</Notice>
                      <form action={withdrawSubmission.bind(null, project.id)}>
                        <SubmitButton variant="secondary">Withdraw submission</SubmitButton>
                      </form>
                    </div>
                  )}
                  {project.status === "PUBLISHED" && (
                    <Notice tone="green">
                      Live since {project.publishedAt ? formatDate(project.publishedAt) : "—"}. Edits you make are published immediately.
                    </Notice>
                  )}
                </div>

                <div className="mt-14 border-t border-paper-line pt-8">
                  <h3 className="font-medium">Manage</h3>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {project.status === "ARCHIVED" ? (
                      <form action={restoreProject.bind(null, project.id)}>
                        <SubmitButton variant="secondary">Restore to draft</SubmitButton>
                      </form>
                    ) : (
                      <form action={unpublishProject.bind(null, project.id)}>
                        <SubmitButton variant="secondary">{project.status === "PUBLISHED" ? "Unpublish & archive" : "Archive"}</SubmitButton>
                      </form>
                    )}
                    {project._count.enquiries === 0 && (
                      <form action={deleteProject.bind(null, project.id)}>
                        <SubmitButton variant="danger" pendingLabel="Deleting…">
                          Delete permanently
                        </SubmitButton>
                      </form>
                    )}
                  </div>
                </div>
              </Section>
            )}

            {step === "updates" && (
              <Section title="Project updates" intro="Share progress with followers and partners. Updates appear on your public page.">
                <ActionForm action={postUpdate.bind(null, project.id)} resetOnSuccess className="space-y-5">
                  <Field name="title" label="Headline">
                    <TextInput name="title" maxLength={120} placeholder="e.g. First plush prototype arrived" />
                  </Field>
                  <Field name="body" label="Update">
                    <TextArea name="body" rows={4} maxLength={3000} />
                  </Field>
                  <SubmitButton pendingLabel="Posting…">Post update</SubmitButton>
                </ActionForm>
                <ul className="mt-10 space-y-3">
                  {project.updates.map((u) => (
                    <li key={u.id} className="rounded-2xl border border-paper-line p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs text-ink-faint">{formatDate(u.createdAt)}</p>
                          <p className="mt-1 font-medium">{u.title}</p>
                          <p className="mt-1 text-sm text-ink-muted">{u.body}</p>
                        </div>
                        <form action={deleteUpdate.bind(null, project.id, u.id)}>
                          <button className="text-xs text-ink-muted underline underline-offset-4 hover:text-rose-700">Delete</button>
                        </form>
                      </div>
                    </li>
                  ))}
                </ul>
              </Section>
            )}
          </div>
        </div>

        {/* Live preview */}
        <aside className="grid gap-5 sm:grid-cols-2 lg:col-start-2 2xl:col-start-auto 2xl:sticky 2xl:top-8 2xl:block 2xl:space-y-5 2xl:self-start">
          <div className="overflow-hidden rounded-3xl bg-white sm:row-span-3 2xl:row-span-1">
            <div className="relative aspect-[4/5]">
              <ProjectCover project={project} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <p className="text-[0.65rem] uppercase tracking-[0.18em] text-white/70">{CATEGORY_LABELS[project.category]}</p>
                <p className="display mt-1 text-3xl">{project.title}</p>
              </div>
            </div>
            <p className="p-5 text-sm text-ink-muted">{project.tagline || "Add a tagline to complete your card."}</p>
          </div>
          <dl className="card grid grid-cols-3 divide-x divide-paper-line text-center">
            {[
              ["Followers", project._count.follows],
              ["Saves", project._count.saves],
              ["Enquiries", project._count.enquiries],
            ].map(([l, v]) => (
              <div key={l as string} className="p-4">
                <dt className="text-xs text-ink-muted">{l}</dt>
                <dd className="mt-1 text-xl font-medium tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="card space-y-3 p-5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-ink-muted">Status</span>
              <span>{STATUS_LABELS[project.status]}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink-muted">Rights</span>
              <RightsBadge status={project.rightsStatus} />
            </div>
            <p className="text-xs leading-relaxed text-ink-faint">{RIGHTS_LABELS[project.rightsStatus].detail}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Section({ title, intro, children }: { title: string; intro?: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="display text-3xl sm:text-4xl">{title}</h2>
      {intro && <p className="mt-2 max-w-xl text-ink-muted">{intro}</p>}
      <div className="mt-8">{children}</div>
    </section>
  );
}
