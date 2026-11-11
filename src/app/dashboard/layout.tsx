import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { AppShell } from "@/components/app-shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser(["CREATOR"], "/dashboard");
  const newEnquiries = await db.enquiry.count({ where: { project: { ownerId: user.id }, status: "SUBMITTED" } });
  return (
    <AppShell
      area="Creator studio"
      user={user}
      isDemo={user.isDemo}
      nav={[
        { href: "/dashboard", label: "Overview", exact: true },
        { href: "/dashboard/projects", label: "Projects" },
        { href: "/dashboard/enquiries", label: "Enquiries", badge: newEnquiries },
        { href: "/dashboard/saved", label: "Saved" },
        { href: "/dashboard/profile", label: "Profile" },
      ]}
    >
      {children}
    </AppShell>
  );
}
