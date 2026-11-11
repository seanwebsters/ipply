import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PUBLIC_PROJECT } from "@/lib/queries";
import { PageHeader } from "@/components/app-shell";
import { ProjectCard, cardProjectSelect } from "@/components/project-card";
import { ButtonLink, EmptyState } from "@/components/ui";

export default async function SavedPage() {
  const user = await requireUser(["CREATOR"]);
  const [saves, follows] = await Promise.all([
    db.savedProject.findMany({ where: { userId: user.id, project: PUBLIC_PROJECT }, orderBy: { createdAt: "desc" }, include: { project: { select: cardProjectSelect } } }),
    db.follow.findMany({ where: { userId: user.id, project: PUBLIC_PROJECT }, orderBy: { createdAt: "desc" }, include: { project: { select: cardProjectSelect } } }),
  ]);
  return (
    <>
      <PageHeader title="Saved & following" intro="Projects you've saved for inspiration and the ones you follow." />
      <h2 className="text-lg font-medium">Saved</h2>
      <div className="mt-5">
        {saves.length ? (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-4">{saves.map((s) => <ProjectCard key={s.projectId} project={s.project} />)}</div>
        ) : (
          <EmptyState title="Nothing saved yet" action={<ButtonLink href="/discover" variant="secondary">Explore IPPLY</ButtonLink>} />
        )}
      </div>
      <h2 className="mt-14 text-lg font-medium">Following</h2>
      <div className="mt-5">
        {follows.length ? (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-4">{follows.map((s) => <ProjectCard key={s.projectId} project={s.project} />)}</div>
        ) : (
          <EmptyState title="You're not following anything yet" />
        )}
      </div>
    </>
  );
}
