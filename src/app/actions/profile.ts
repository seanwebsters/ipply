"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { assertUser } from "@/lib/auth";
import { errorState, formObject, parseForm } from "@/lib/action-utils";
import { creatorProfileSchema, organizationSchema } from "@/lib/validation";
import type { ActionState } from "@/components/action-form";

export async function updateCreatorProfile(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const user = await assertUser(["CREATOR"]);
    const parsed = parseForm(creatorProfileSchema, formObject(formData));
    if (!parsed.ok) return parsed.state;
    const taken = await db.creatorProfile.findFirst({ where: { handle: parsed.data.handle, NOT: { userId: user.id } } });
    if (taken) return { error: "That handle is taken.", fieldErrors: { handle: "Already in use — try another" } };
    await db.creatorProfile.upsert({ where: { userId: user.id }, create: { ...parsed.data, userId: user.id }, update: parsed.data });
    revalidatePath(`/creators/${parsed.data.handle}`);
    revalidatePath("/dashboard", "layout");
    return { ok: "Profile saved." };
  } catch (e) {
    return errorState(e);
  }
}

export async function updateOrganization(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const user = await assertUser(["PARTNER"]);
    const parsed = parseForm(organizationSchema, formObject(formData));
    if (!parsed.ok) return parsed.state;
    const { title, ...org } = parsed.data;
    if (user.organizationId) {
      await db.organization.update({ where: { id: user.organizationId }, data: org });
      await db.organizationMember.updateMany({ where: { userId: user.id, organizationId: user.organizationId }, data: { title } });
    } else {
      await db.organization.create({ data: { ...org, members: { create: { userId: user.id, title } } } });
    }
    revalidatePath("/partner", "layout");
    return { ok: "Organisation profile saved." };
  } catch (e) {
    return errorState(e);
  }
}
