import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PUBLIC_PROJECT } from "@/lib/queries";
import { ProjectCard, cardProjectSelect } from "@/components/project-card";
import { DemoBadge, EmptyState } from "@/components/ui";

async function getCreator(handle: string) {
  return db.creatorProfile.findUnique({
    where: { handle },
    include: {
      user: {
        select: {
          isDemo: true,
          projects: { where: PUBLIC_PROJECT, orderBy: { publishedAt: "desc" }, select: cardProjectSelect },
        },
      },
    },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const c = await getCreator((await params).handle);
  return { title: c?.displayName ?? "Creator" };
}

export default async function CreatorProfilePage({ params }: { params: Promise<{ handle: string }> }) {
  const creator = await getCreator((await params).handle);
  if (!creator) notFound();
  const projects = creator.user.projects;
  return (
    <div className="site-container py-16 sm:py-24">
      <div className="flex flex-col gap-8 sm:flex-row sm:items-end">
        <div className="iris-bg flex h-28 w-28 shrink-0 items-center justify-center rounded-full text-5xl font-light">{creator.displayName.charAt(0)}</div>
        <div>
          {creator.user.isDemo && <DemoBadge className="mb-3 bg-paper-warm" />}
          <h1 className="display text-5xl sm:text-7xl">{creator.displayName}</h1>
          <p className="mt-3 text-ink-muted">
            {[creator.headline, creator.location].filter(Boolean).join(" · ")}
          </p>
        </div>
      </div>
      {creator.bio && <p className="mt-10 max-w-2xl text-lg leading-relaxed text-ink-soft">{creator.bio}</p>}
      {creator.website && (
        <a href={creator.website} target="_blank" rel="noopener noreferrer nofollow" className="mt-4 inline-block text-sm underline underline-offset-4">
          {creator.website.replace(/^https?:\/\//, "")}
        </a>
      )}
      <h2 className="eyebrow mt-20">Projects</h2>
      <div className="mt-8">
        {projects.length ? (
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </div>
        ) : (
          <EmptyState title="No published projects yet" />
        )}
      </div>
    </div>
  );
}
