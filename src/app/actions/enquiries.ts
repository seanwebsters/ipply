"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { EnquiryStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { assertUser } from "@/lib/auth";
import { UserError } from "@/lib/errors";
import { errorState, formObject, parseForm } from "@/lib/action-utils";
import { allowedEnquiryTransitions, canEnquire } from "@/lib/permissions";
import { enquiryMessageSchema, enquirySchema, enquiryStatusSchema } from "@/lib/validation";
import { ENQUIRY_STATUS_LABELS, TERRITORIES } from "@/lib/labels";
import { enquiryReference } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";
import type { ActionState } from "@/components/action-form";

export async function submitEnquiry(projectId: string, _: ActionState, formData: FormData): Promise<ActionState> {
  let id: string;
  try {
    const user = await assertUser(["PARTNER"]);
    if (!user.organizationId) throw new UserError("Set up your organisation profile before sending enquiries.");
    const project = await db.project.findUnique({ where: { id: projectId } });
    if (!project || !canEnquire(user, project)) throw new UserError("This project isn't currently accepting enquiries.");
    if (!rateLimit(`enquiry:${user.id}`, 20, 24 * 60 * 60 * 1000)) throw new UserError("Daily enquiry limit reached. Please try again tomorrow.");

    const parsed = parseForm(enquirySchema, {
      ...formObject(formData),
      categories: formData.getAll("categories"),
      territories: formData.getAll("territories").filter((t) => TERRITORIES.includes(String(t))),
    });
    if (!parsed.ok) return parsed.state;
    const { acknowledge: _ack, ...data } = parsed.data;
    void _ack;

    const open = await db.enquiry.findFirst({
      where: { projectId, organizationId: user.organizationId, status: { notIn: ["DECLINED", "WITHDRAWN"] } },
    });
    if (open) throw new UserError(`Your organisation already has an open enquiry (${open.reference}) for this project. Continue the conversation there.`);

    const message = String(formData.get("message") ?? "").trim().slice(0, 4000);
    const enquiry = await db.enquiry.create({
      data: {
        ...data,
        reference: enquiryReference(),
        projectId,
        organizationId: user.organizationId,
        submittedById: user.id,
        messages: {
          create: [
            { kind: "EVENT", body: "Enquiry submitted" },
            ...(message ? [{ authorId: user.id, body: message }] : []),
          ],
        },
      },
    });
    id = enquiry.id;
    revalidatePath("/partner", "layout");
    revalidatePath("/dashboard", "layout");
  } catch (e) {
    return errorState(e);
  }
  redirect(`/partner/enquiries/${id}?sent=1`);
}

async function enquiryForParty(enquiryId: string) {
  const user = await assertUser();
  const enquiry = await db.enquiry.findUnique({ where: { id: enquiryId }, include: { project: { select: { ownerId: true } } } });
  if (!enquiry) throw new UserError("Enquiry not found.");
  const party =
    enquiry.project.ownerId === user.id
      ? ("creator" as const)
      : user.organizationId && user.organizationId === enquiry.organizationId
        ? ("partner" as const)
        : null;
  if (!party) throw new UserError("Enquiry not found.");
  return { user, enquiry, party };
}

export async function postEnquiryMessage(enquiryId: string, _: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { user, enquiry } = await enquiryForParty(enquiryId);
    if (["DECLINED", "WITHDRAWN"].includes(enquiry.status)) throw new UserError("This enquiry is closed.");
    const parsed = parseForm(enquiryMessageSchema, formObject(formData));
    if (!parsed.ok) return parsed.state;
    await db.$transaction([
      db.enquiryMessage.create({ data: { enquiryId, authorId: user.id, body: parsed.data.body } }),
      db.enquiry.update({ where: { id: enquiryId }, data: { updatedAt: new Date() } }),
    ]);
    revalidatePath(`/partner/enquiries/${enquiryId}`);
    revalidatePath(`/dashboard/enquiries/${enquiryId}`);
    return { ok: "Message sent." };
  } catch (e) {
    return errorState(e);
  }
}

export async function changeEnquiryStatus(enquiryId: string, formData: FormData) {
  const { user, enquiry, party } = await enquiryForParty(enquiryId);
  const status = enquiryStatusSchema.parse(formData.get("status")) as EnquiryStatus;
  if (!allowedEnquiryTransitions(party, enquiry.status).includes(status)) throw new UserError("That status change isn't available.");
  await db.$transaction([
    db.enquiry.update({ where: { id: enquiryId }, data: { status } }),
    db.enquiryMessage.create({
      data: { enquiryId, authorId: user.id, kind: "EVENT", body: `Status changed to ${ENQUIRY_STATUS_LABELS[status]}` },
    }),
  ]);
  revalidatePath(`/partner/enquiries/${enquiryId}`);
  revalidatePath(`/dashboard/enquiries/${enquiryId}`);
  revalidatePath("/dashboard", "layout");
  revalidatePath("/partner", "layout");
}
