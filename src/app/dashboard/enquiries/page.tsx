import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/app-shell";
import { EnquiryList } from "@/components/enquiry-list";

export default async function CreatorEnquiriesPage() {
  const user = await requireUser(["CREATOR"]);
  const enquiries = await db.enquiry.findMany({
    where: { project: { ownerId: user.id } },
    orderBy: { updatedAt: "desc" },
    include: { organization: { select: { name: true } }, project: { select: { title: true } } },
  });
  return (
    <>
      <PageHeader title="Enquiries" intro="Commercial interest in your projects. You decide what happens next — nothing is agreed without you." />
      <EnquiryList
        enquiries={enquiries}
        basePath="/dashboard/enquiries"
        show="both"
        empty={{ title: "No enquiries yet", body: "Publish a project and mark it open to licensing to start receiving enquiries from partners." }}
      />
    </>
  );
}
