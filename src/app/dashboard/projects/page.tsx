import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { CATEGORY_LABELS } from "@/lib/labels";
import { formatRelative } from "@/lib/utils";
import { PageHeader } from "@/components/app-shell";
import { ButtonLink, EmptyState } from "@/components/ui";
import { ProjectStatusBadge } from "@/components/status";
import { ProjectCover } from "@/components/project-cover";

export default async function ProjectsPage() {
  const user = await requireUser(["CREATOR"]);
  const projects = await db.project.findMany({
    where: { ownerId: user.id },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    include: { coverImage: { select: { url: true, caption: true } }, _count: { select: { follows: true, saves: true, enquiries: true } } },
  });
  return (
    <>
      <PageHeader title="Projects" intro="Everything you've created on IPPLY." actions={<ButtonLink href="/dashboard/projects/new">New project</ButtonLink>} />
      {projects.length === 0 ? (
        <EmptyState title="No projects yet" action={<ButtonLink href="/dashboard/projects/new">Create your first project</ButtonLink>} />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b border-paper-line text-xs uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="px-5 py-4 font-medium">Project</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 text-right font-medium">Followers</th>
                <th className="px-5 py-4 text-right font-medium">Saves</th>
                <th className="px-5 py-4 text-right font-medium">Enquiries</th>
                <th className="px-5 py-4 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-paper-line">
              {projects.map((p) => (
                <tr key={p.id} className="hover:bg-paper/60">
                  <td className="px-5 py-3">
                    <Link href={`/dashboard/projects/${p.id}`} className="flex items-center gap-4">
                      <span className="h-14 w-11 shrink-0 overflow-hidden rounded-lg">
                        <ProjectCover project={p} />
                      </span>
                      <span>
                        <span className="block font-medium">{p.title}</span>
                        <span className="text-xs text-ink-muted">{CATEGORY_LABELS[p.category]}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    <ProjectStatusBadge status={p.status} hidden={p.hidden} />
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums">{p._count.follows}</td>
                  <td className="px-5 py-3 text-right tabular-nums">{p._count.saves}</td>
                  <td className="px-5 py-3 text-right tabular-nums">{p._count.enquiries}</td>
                  <td className="px-5 py-3 text-ink-muted">{formatRelative(p.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
