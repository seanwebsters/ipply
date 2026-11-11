import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { canEnquire } from "@/lib/permissions";
import { CATEGORY_LABELS } from "@/lib/labels";
import { ProjectCover } from "@/components/project-cover";
import { DemoBadge, Notice, RightsBadge } from "@/components/ui";
import { submitEnquiry } from "@/app/actions/enquiries";
import { EnquiryForm } from "./enquiry-form";

export const metadata: Metadata = { title: "Licensing enquiry" };

export default async function EnquirePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await requireUser(["PARTNER"], `/ip/${slug}/enquire`);
  const project = await db.project.findUnique({
    where: { slug },
    include: { owner: { include: { creatorProfile: true } }, coverImage: { select: { url: true, caption: true } } },
  });
  if (!project) notFound();
  if (!user.organizationId) redirect("/partner/organisation?next=" + encodeURIComponent(`/ip/${slug}/enquire`));
  const open = await db.enquiry.findFirst({
    where: { projectId: project.id, organizationId: user.organizationId, status: { notIn: ["DECLINED", "WITHDRAWN"] } },
  });
  if (open) redirect(`/partner/enquiries/${open.id}`);
  if (!canEnquire(user, project)) notFound();
  const org = await db.organization.findUnique({ where: { id: user.organizationId } });

  return (
    <div className="site-container grid gap-12 py-14 sm:py-20 lg:grid-cols-[1fr_24rem]">
      <div className="max-w-3xl">
        <Link href={`/ip/${project.slug}`} className="text-sm text-ink-muted hover:text-ink">
          ← {project.title}
        </Link>
        <p className="eyebrow mt-8">Licensing enquiry</p>
        <h1 className="display mt-4 text-5xl sm:text-6xl">Tell {project.owner.creatorProfile?.displayName ?? project.owner.name} what you have in mind.</h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-muted">
          A clear, structured enquiry helps creators respond quickly. You&apos;re enquiring on behalf of <strong className="text-ink">{org?.name}</strong>.
        </p>
        <div className="mt-12">
          <EnquiryForm action={submitEnquiry.bind(null, project.id)} available={project.licensingCategories} openToDevelopment={project.openToDevelopment} openToLicensing={project.openToLicensing} />
        </div>
      </div>
      <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
        <div className="overflow-hidden rounded-3xl">
          <div className="relative aspect-[4/3]">
            <ProjectCover project={project} />
            {project.isDemo && <DemoBadge className="absolute left-4 top-4" />}
          </div>
          <div className="bg-white p-6">
            <p className="text-xs uppercase tracking-[0.16em] text-ink-muted">{CATEGORY_LABELS[project.category]}</p>
            <p className="display mt-2 text-3xl">{project.title}</p>
            <div className="mt-4">
              <RightsBadge status={project.rightsStatus} />
            </div>
          </div>
        </div>
        <Notice>
          Enquiries are expressions of interest — not offers, contracts or reservations of rights. IPPLY does not execute contracts or
          process payments today. Rights status shown is as declared by the creator; complete your own due diligence before any agreement.
        </Notice>
      </aside>
    </div>
  );
}
