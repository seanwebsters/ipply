import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PUBLIC_PROJECT } from "@/lib/queries";
import { ORG_TYPE_LABELS } from "@/lib/labels";
import { PageHeader } from "@/components/app-shell";
import { ButtonLink, DemoBadge, Notice, Stat } from "@/components/ui";
import { EnquiryList } from "@/components/enquiry-list";
import { ProjectCard, cardProjectSelect } from "@/components/project-card";

export default async function PartnerHome({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const { welcome } = await searchParams;
  const user = await requireUser(["PARTNER"]);
  const org = user.organizationId ? await db.organization.findUnique({ where: { id: user.organizationId } }) : null;
  const [enquiries, shortlist, fresh] = await Promise.all([
    org
      ? db.enquiry.findMany({
          where: { organizationId: org.id },
          orderBy: { updatedAt: "desc" },
          take: 5,
          include: { organization: { select: { name: true } }, project: { select: { title: true } } },
        })
      : [],
    db.savedProject.count({ where: { userId: user.id } }),
    db.project.findMany({
      where: { ...PUBLIC_PROJECT, OR: [{ openToLicensing: true }, { openToDevelopment: true }] },
      orderBy: { publishedAt: "desc" },
      take: 4,
      select: cardProjectSelect,
    }),
  ]);
  const active = enquiries.filter((e) => !["DECLINED", "WITHDRAWN"].includes(e.status)).length;

  return (
    <>
      {welcome && (
        <Notice tone="green" className="mb-8">
          Welcome to IPPLY. Browse the catalogue, shortlist properties and send structured enquiries directly to creators.
        </Notice>
      )}
      <PageHeader
        eyebrow={org ? ORG_TYPE_LABELS[org.type] : "Partner portal"}
        title={
          <span className="inline-flex flex-wrap items-center gap-4">
            {org?.name ?? "Set up your organisation"} {org?.isDemo && <DemoBadge className="bg-paper-warm" />}
          </span>
        }
        actions={<ButtonLink href="/discover?open=1">Discover IP</ButtonLink>}
      />
      {!org && (
        <Notice tone="amber" className="mb-8">
          Create your organisation profile before sending enquiries.{" "}
          <Link href="/partner/organisation" className="font-medium underline underline-offset-4">
            Set it up
          </Link>
        </Notice>
      )}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <Stat label="Shortlisted" value={shortlist} />
        <Stat label="Active enquiries" value={active} />
        <Stat label="Organisation status" value={<span className="text-lg">{org?.verified ? "Reviewed" : "Self-declared"}</span>} hint="Identity review coming soon" />
      </div>
      <section className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Recent enquiries</h2>
          <Link href="/partner/enquiries" className="text-sm text-ink-muted hover:text-ink">
            View all
          </Link>
        </div>
        <div className="mt-5">
          <EnquiryList enquiries={enquiries} basePath="/partner/enquiries" show="project" empty={{ title: "No enquiries yet", body: "Find a property you love and send a structured licensing enquiry." }} />
        </div>
      </section>
      <section className="mt-14">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Recently published & open to deals</h2>
          <Link href="/discover?open=1" className="text-sm text-ink-muted hover:text-ink">
            Browse all
          </Link>
        </div>
        <div className="mt-5 grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-4">
          {fresh.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      </section>
    </>
  );
}
