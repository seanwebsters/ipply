import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { CATEGORY_LABELS, ENQUIRY_TYPE_LABELS } from "@/lib/labels";
import { formatCount, formatRelative } from "@/lib/utils";
import { PageHeader } from "@/components/app-shell";
import { ButtonLink, EmptyState, Notice, Stat } from "@/components/ui";
import { EnquiryStatusBadge, ProjectStatusBadge } from "@/components/status";
import { ProjectCover } from "@/components/project-cover";

export default async function DashboardHome({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const { welcome } = await searchParams;
  const user = await requireUser(["CREATOR"]);
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [projects, followers, saves, views, enquiries, profile] = await Promise.all([
    db.project.findMany({
      where: { ownerId: user.id, status: { not: "ARCHIVED" } },
      orderBy: { updatedAt: "desc" },
      take: 6,
      include: { coverImage: { select: { url: true, caption: true } }, _count: { select: { follows: true, enquiries: true } } },
    }),
    db.follow.count({ where: { project: { ownerId: user.id } } }),
    db.savedProject.count({ where: { project: { ownerId: user.id } } }),
    db.projectViewDaily.aggregate({ _sum: { count: true }, where: { project: { ownerId: user.id }, day: { gte: since } } }),
    db.enquiry.findMany({
      where: { project: { ownerId: user.id } },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { organization: true, project: { select: { title: true } } },
    }),
    db.creatorProfile.findUnique({ where: { userId: user.id } }),
  ]);
  const openEnquiries = enquiries.filter((e) => !["DECLINED", "WITHDRAWN"].includes(e.status)).length;

  return (
    <>
      {welcome && (
        <div className="relative mb-10 overflow-hidden rounded-3xl bg-ink p-8 text-white sm:p-10">
          <div aria-hidden className="iris-bg absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-60 blur-3xl" />
          <p className="display relative text-4xl">Welcome to IPPLY, {user.name.split(" ")[0]}.</p>
          <p className="relative mt-3 max-w-lg text-white/70">The next big thing starts with you. Create your first project — you can save it as a draft and come back any time.</p>
          <ButtonLink href="/dashboard/projects/new" variant="light" className="relative mt-6">
            Create a project
          </ButtonLink>
        </div>
      )}
      <PageHeader
        eyebrow="Creator studio"
        title={`Hello, ${user.name.split(" ")[0]}.`}
        actions={<ButtonLink href="/dashboard/projects/new">New project</ButtonLink>}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Followers" value={formatCount(followers)} hint="Across all projects" />
        <Stat label="Saves" value={formatCount(saves)} hint="Fans and partners" />
        <Stat label="Page views" value={formatCount(views._sum.count ?? 0)} hint="Last 30 days" />
        <Stat label="Open enquiries" value={openEnquiries} hint="Commercial interest" />
      </div>
      <p className="mt-3 text-xs text-ink-faint">All figures are real activity recorded on IPPLY. Your own visits are not counted.</p>

      {!profile?.bio && (
        <Notice className="mt-8">
          Partners like to know who they&apos;re working with.{" "}
          <Link href="/dashboard/profile" className="font-medium underline underline-offset-4">
            Complete your creator profile
          </Link>
          .
        </Notice>
      )}

      <div className="mt-12 grid gap-10 xl:grid-cols-[1.5fr_1fr]">
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Your projects</h2>
            <Link href="/dashboard/projects" className="text-sm text-ink-muted hover:text-ink">
              View all
            </Link>
          </div>
          <div className="mt-5">
            {projects.length === 0 ? (
              <EmptyState
                title="Your first project is waiting"
                body="Characters, a world, a song cycle, a musical, a game — start with a title and build from there."
                action={<ButtonLink href="/dashboard/projects/new">Create a project</ButtonLink>}
              />
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2">
                {projects.map((p) => (
                  <li key={p.id}>
                    <Link href={`/dashboard/projects/${p.id}`} className="card group flex gap-4 p-3 transition hover:border-ink/20">
                      <div className="h-24 w-20 shrink-0 overflow-hidden rounded-2xl">
                        <ProjectCover project={p} />
                      </div>
                      <div className="min-w-0 py-1">
                        <ProjectStatusBadge status={p.status} hidden={p.hidden} />
                        <p className="mt-2 truncate font-medium">{p.title}</p>
                        <p className="text-xs text-ink-muted">
                          {CATEGORY_LABELS[p.category]} · {p._count.follows} followers · {p._count.enquiries} enquiries
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Latest enquiries</h2>
            <Link href="/dashboard/enquiries" className="text-sm text-ink-muted hover:text-ink">
              View all
            </Link>
          </div>
          <div className="mt-5">
            {enquiries.length === 0 ? (
              <EmptyState title="No enquiries yet" body="When partners express interest in your published projects, it will appear here." />
            ) : (
              <ul className="card divide-y divide-paper-line">
                {enquiries.map((e) => (
                  <li key={e.id}>
                    <Link href={`/dashboard/enquiries/${e.id}`} className="block p-5 hover:bg-paper/60">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate font-medium">{e.organization.name}</p>
                        <EnquiryStatusBadge status={e.status} />
                      </div>
                      <p className="mt-1 text-sm text-ink-muted">
                        {ENQUIRY_TYPE_LABELS[e.type]} · {e.project.title} · {formatRelative(e.updatedAt)}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
