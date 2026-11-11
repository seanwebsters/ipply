import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { AppShell } from "@/components/app-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser(["ADMIN"], "/admin");
  const queue = await db.project.count({ where: { status: "IN_REVIEW" } });
  return (
    <AppShell
      area="Studio dashboard"
      user={user}
      isDemo={user.isDemo}
      nav={[
        { href: "/admin", label: "Overview", exact: true },
        { href: "/admin/projects", label: "Projects & review", badge: queue },
        { href: "/admin/enquiries", label: "Enquiries" },
        { href: "/admin/studio", label: "Studio pipeline" },
        { href: "/admin/demo", label: "Demo content" },
      ]}
    >
      {children}
    </AppShell>
  );
}
