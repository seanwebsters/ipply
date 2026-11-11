import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { EnquiryDetail, enquiryInclude } from "@/components/enquiry-detail";
import { Notice } from "@/components/ui";

export default async function PartnerEnquiryPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ sent?: string }> }) {
  const user = await requireUser(["PARTNER"]);
  const [{ id }, { sent }] = await Promise.all([params, searchParams]);
  const enquiry = await db.enquiry.findUnique({ where: { id }, include: enquiryInclude });
  if (!enquiry || !user.organizationId || enquiry.organizationId !== user.organizationId) notFound();
  return (
    <>
      {sent && (
        <Notice tone="green" className="mb-8">
          Enquiry {enquiry.reference} sent. The creator has been notified in their dashboard, and you&apos;ll see their response here.
        </Notice>
      )}
      <EnquiryDetail enquiry={enquiry} party="partner" viewerId={user.id} />
    </>
  );
}
