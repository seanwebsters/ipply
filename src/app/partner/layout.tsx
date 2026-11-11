import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { AppShell } from "@/components/app-shell";

export default async function PartnerLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser(["PARTNER"], "/partner");
  const shortlist = await db.savedProject.count({ where: { userId: user.id } });
  return (
    <AppShell
      area="Partner portal"
      user={user}
      isDemo={user.isDemo}
      nav={[
        { href: "/partner", label: "Overview", exact: true },
        { href: "/discover?open=1", label: "Discover IP" },
        { href: "/partner/shortlist", label: "Shortlist", badge: shortlist },
        { href: "/partner/enquiries", label: "Enquiries" },
        { href: "/partner/organisation", label: "Organisation" },
      ]}
    >
      {children}
    </AppShell>
  );
}
