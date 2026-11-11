import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/app-shell";
import { EnquiryList } from "@/components/enquiry-list";
import { ButtonLink } from "@/components/ui";

export default async function PartnerEnquiriesPage() {
  const user = await requireUser(["PARTNER"]);
  const enquiries = user.organizationId
    ? await db.enquiry.findMany({
        where: { organizationId: user.organizationId },
        orderBy: { updatedAt: "desc" },
        include: { organization: { select: { name: true } }, project: { select: { title: true } } },
      })
    : [];
  return (
    <>
      <PageHeader title="Enquiries" intro="Every enquiry your organisation has sent, and where it stands." actions={<ButtonLink href="/discover?open=1">New enquiry</ButtonLink>} />
      <EnquiryList enquiries={enquiries} basePath="/partner/enquiries" show="project" empty={{ title: "No enquiries yet", body: "Open any project that's open to deals and choose “Request to license”." }} />
    </>
  );
}
