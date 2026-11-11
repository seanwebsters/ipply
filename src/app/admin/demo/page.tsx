import Link from "next/link";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/app-shell";
import { Notice } from "@/components/ui";
import { ProjectStatusBadge } from "@/components/status";
import { SubmitButton } from "@/components/form";
import { setDemoVisibility } from "@/app/actions/admin";

export default async function DemoContentPage() {
  const [projects, users, orgs, enquiries] = await Promise.all([
    db.project.findMany({ where: { isDemo: true }, orderBy: { title: "asc" }, include: { owner: { select: { name: true } } } }),
    db.user.count({ where: { isDemo: true } }),
    db.organization.count({ where: { isDemo: true } }),
    db.enquiry.count({ where: { isDemo: true } }),
  ]);
  const visible = projects.filter((p) => !p.hidden).length;
  return (
    <>
      <PageHeader title="Demonstration content" intro="Fictional projects, creators and organisations seeded to demonstrate IPPLY. Always labelled “Demo” in the product." />
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          ["Demo projects", projects.length],
          ["Publicly visible", visible],
          ["Demo accounts", users],
          ["Demo organisations / enquiries", `${orgs} / ${enquiries}`],
        ].map(([l, v]) => (
          <div key={l as string} className="card p-5">
            <p className="text-sm text-ink-muted">{l}</p>
            <p className="mt-2 text-3xl font-medium">{v}</p>
          </div>
        ))}
      </div>
      <div className="card mt-8 flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium">Catalogue visibility</p>
          <p className="text-sm text-ink-muted">Hide every demo project from Discover and the homepage at once — for example, once real creators have published.</p>
        </div>
        <div className="flex gap-2">
          <form action={setDemoVisibility}>
            <input type="hidden" name="hidden" value="true" />
            <SubmitButton variant="danger">Hide all demo</SubmitButton>
          </form>
          <form action={setDemoVisibility}>
            <input type="hidden" name="hidden" value="false" />
            <SubmitButton variant="secondary">Show all demo</SubmitButton>
          </form>
        </div>
      </div>
      <Notice className="mt-6">
        To reset demo content to its original state, run <code className="rounded bg-white px-1.5 py-0.5">npm run db:seed</code>. This removes and recreates only
        records flagged as demo.
      </Notice>
      <ul className="card mt-8 divide-y divide-paper-line">
        {projects.map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
            <Link href={`/admin/projects/${p.id}`} className="font-medium hover:underline">
              {p.title} <span className="font-normal text-ink-muted">· {p.owner.name}</span>
            </Link>
            <ProjectStatusBadge status={p.status} hidden={p.hidden} />
          </li>
        ))}
      </ul>
    </>
  );
}
