import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { EnquiryDetail, enquiryInclude } from "@/components/enquiry-detail";

export default async function CreatorEnquiryPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser(["CREATOR"]);
  const enquiry = await db.enquiry.findUnique({ where: { id: (await params).id }, include: enquiryInclude });
  if (!enquiry || enquiry.project.ownerId !== user.id) notFound();
  return <EnquiryDetail enquiry={enquiry} party="creator" viewerId={user.id} />;
}
