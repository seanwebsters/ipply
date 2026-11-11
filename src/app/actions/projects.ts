"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { assertUser } from "@/lib/auth";
import { UserError } from "@/lib/errors";
import { errorState, formObject, parseForm } from "@/lib/action-utils";
import { publishReadiness } from "@/lib/permissions";
import { storage } from "@/lib/storage";
import { randomSuffix, slugify } from "@/lib/utils";
import {
  characterSchema,
  contributorSchema,
  keyArtSchema,
  projectBasicsSchema,
  projectCommercialSchema,
  projectRightsSchema,
  projectStorySchema,
  projectUpdateSchema,
} from "@/lib/validation";
import type { ActionState } from "@/components/action-form";
import { MOTIFS, PALETTES } from "@/components/key-art";

async function ownedProject(projectId: string) {
  const user = await assertUser(["CREATOR"]);
  const project = await db.project.findUnique({ where: { id: projectId } });
  if (!project || project.ownerId !== user.id) throw new UserError("Project not found.");
  return { user, project };
}

function revalidateProject(p: { id: string; slug: string }) {
  revalidatePath(`/dashboard/projects/${p.id}`, "layout");
  revalidatePath(`/ip/${p.slug}`);
  revalidatePath("/dashboard");
}

async function uniqueSlug(title: string) {
  const base = slugify(title) || "project";
  for (let i = 0; i < 6; i++) {
    const slug = i === 0 ? base : `${base}-${randomSuffix(4)}`;
    if (!(await db.project.findUnique({ where: { slug } }))) return slug;
  }
  return `${base}-${randomSuffix(8)}`;
}

function nextStep(projectId: string, step: string): never {
  redirect(`/dashboard/projects/${projectId}?step=${step}&saved=1`);
}

// ───────────── Create ─────────────

export async function createProject(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const user = await assertUser(["CREATOR"]);
    const parsed = parseForm(projectBasicsSchema, formObject(formData));
    if (!parsed.ok) return parsed.state;
    const count = await db.project.count({ where: { ownerId: user.id, status: { not: "ARCHIVED" } } });
    if (count >= 50) throw new UserError("You've reached the project limit for this plan.");
    const slug = await uniqueSlug(parsed.data.title);
    const project = await db.project.create({
      data: {
        ...parsed.data,
        slug,
        ownerId: user.id,
        keyArt: { motif: MOTIFS[Math.floor(Math.random() * MOTIFS.length)], palette: PALETTES[Math.floor(Math.random() * PALETTES.length)] },
        contributors: { create: { name: user.name, role: "Creator", isRightsHolder: true, userId: user.id } },
      },
    });
    redirect(`/dashboard/projects/${project.id}?step=story&created=1`);
  } catch (e) {
    return errorState(e);
  }
}

// ───────────── Steps ─────────────

export async function saveBasics(projectId: string, _: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { project } = await ownedProject(projectId);
    const parsed = parseForm(projectBasicsSchema, formObject(formData));
    if (!parsed.ok) return parsed.state;
    await db.project.update({ where: { id: project.id }, data: parsed.data });
    revalidateProject(project);
  } catch (e) {
    return errorState(e);
  }
  nextStep(projectId, "story");
}

export async function saveStory(projectId: string, _: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { project } = await ownedProject(projectId);
    const parsed = parseForm(projectStorySchema, formObject(formData));
    if (!parsed.ok) return parsed.state;
    await db.project.update({ where: { id: project.id }, data: parsed.data });
    revalidateProject(project);
  } catch (e) {
    return errorState(e);
  }
  nextStep(projectId, "characters");
}

export async function addCharacter(projectId: string, _: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { project } = await ownedProject(projectId);
    const parsed = parseForm(characterSchema, formObject(formData));
    if (!parsed.ok) return parsed.state;
    const count = await db.character.count({ where: { projectId } });
    if (count >= 24) throw new UserError("Projects can list up to 24 characters.");
    await db.character.create({ data: { ...parsed.data, projectId, sortOrder: count } });
    revalidateProject(project);
    return { ok: `${parsed.data.name} added.` };
  } catch (e) {
    return errorState(e);
  }
}

export async function deleteCharacter(projectId: string, characterId: string) {
  const { project } = await ownedProject(projectId);
  await db.character.deleteMany({ where: { id: characterId, projectId } });
  revalidateProject(project);
}

export async function saveKeyArt(projectId: string, _: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { project } = await ownedProject(projectId);
    const parsed = parseForm(keyArtSchema, formObject(formData));
    if (!parsed.ok) return parsed.state;
    await db.project.update({ where: { id: project.id }, data: { keyArt: parsed.data } });
    revalidateProject(project);
    return { ok: "Key art style saved." };
  } catch (e) {
    return errorState(e);
  }
}

export async function addContributor(projectId: string, _: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { project } = await ownedProject(projectId);
    const parsed = parseForm(contributorSchema, formObject(formData));
    if (!parsed.ok) return parsed.state;
    const count = await db.projectContributor.count({ where: { projectId } });
    if (count >= 20) throw new UserError("Projects can list up to 20 contributors.");
    await db.projectContributor.create({
      data: {
        projectId,
        name: parsed.data.name,
        role: parsed.data.role,
        isRightsHolder: parsed.data.isRightsHolder,
        shareBps: parsed.data.sharePercent === null ? null : Math.round(parsed.data.sharePercent * 100),
      },
    });
    revalidateProject(project);
    return { ok: `${parsed.data.name} added.` };
  } catch (e) {
    return errorState(e);
  }
}

export async function deleteContributor(projectId: string, contributorId: string) {
  const { project } = await ownedProject(projectId);
  await db.projectContributor.deleteMany({ where: { id: contributorId, projectId } });
  revalidateProject(project);
}

export async function saveRights(projectId: string, _: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { project } = await ownedProject(projectId);
    const parsed = parseForm(projectRightsSchema, formObject(formData));
    if (!parsed.ok) return parsed.state;
    if (parsed.data.aiAssisted && !parsed.data.aiDisclosure) {
      return { error: "Please describe how AI tools were used.", fieldErrors: { aiDisclosure: "Describe how AI tools were used and what is your own work" } };
    }
    await db.project.update({
      where: { id: project.id },
      data: {
        aiAssisted: parsed.data.aiAssisted,
        aiDisclosure: parsed.data.aiAssisted ? parsed.data.aiDisclosure : null,
        ownershipDeclaredAt: project.ownershipDeclaredAt ?? new Date(),
      },
    });
    revalidateProject(project);
  } catch (e) {
    return errorState(e);
  }
  nextStep(projectId, "commercial");
}

export async function saveCommercial(projectId: string, _: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { project } = await ownedProject(projectId);
    const parsed = parseForm(projectCommercialSchema, {
      ...formObject(formData),
      licensingCategories: formData.getAll("licensingCategories"),
    });
    if (!parsed.ok) return parsed.state;
    await db.project.update({ where: { id: project.id }, data: parsed.data });
    revalidateProject(project);
  } catch (e) {
    return errorState(e);
  }
  nextStep(projectId, "publish");
}

// ───────────── Lifecycle ─────────────

export async function submitForReview(projectId: string): Promise<ActionState> {
  try {
    const { project, user } = await ownedProject(projectId);
    if (!["DRAFT", "CHANGES_REQUESTED"].includes(project.status)) throw new UserError("This project is not a draft.");
    const readiness = publishReadiness(project);
    if (!readiness.ready) return { error: `Before submitting, please complete: ${readiness.missing.join(", ")}.` };
    await db.$transaction([
      db.project.update({ where: { id: project.id }, data: { status: "IN_REVIEW", submittedAt: new Date() } }),
      db.moderationEvent.create({ data: { projectId, actorId: user.id, action: "SUBMITTED" } }),
    ]);
    revalidateProject(project);
    revalidatePath("/admin", "layout");
    return { ok: "Submitted. The IPPLY team will review your project shortly." };
  } catch (e) {
    return errorState(e);
  }
}

export async function withdrawSubmission(projectId: string) {
  const { project, user } = await ownedProject(projectId);
  if (project.status !== "IN_REVIEW") return;
  await db.$transaction([
    db.project.update({ where: { id: projectId }, data: { status: "DRAFT" } }),
    db.moderationEvent.create({ data: { projectId, actorId: user.id, action: "WITHDRAWN" } }),
  ]);
  revalidateProject(project);
}

export async function unpublishProject(projectId: string) {
  const { project, user } = await ownedProject(projectId);
  await db.$transaction([
    db.project.update({ where: { id: projectId }, data: { status: "ARCHIVED", featured: false } }),
    db.moderationEvent.create({ data: { projectId, actorId: user.id, action: "ARCHIVED_BY_CREATOR" } }),
  ]);
  revalidateProject(project);
  revalidatePath("/discover");
  revalidatePath("/");
}

export async function restoreProject(projectId: string) {
  const { project, user } = await ownedProject(projectId);
  if (project.status !== "ARCHIVED") return;
  await db.$transaction([
    db.project.update({ where: { id: projectId }, data: { status: "DRAFT" } }),
    db.moderationEvent.create({ data: { projectId, actorId: user.id, action: "RESTORED_TO_DRAFT" } }),
  ]);
  revalidateProject(project);
}

export async function deleteProject(projectId: string) {
  const { project } = await ownedProject(projectId);
  const enquiries = await db.enquiry.count({ where: { projectId } });
  if (enquiries > 0) throw new UserError("Projects with commercial enquiries can be archived but not deleted.");
  const media = await db.mediaAsset.findMany({ where: { projectId }, select: { storageKey: true } });
  await db.project.delete({ where: { id: project.id } });
  await Promise.all(media.map((m) => storage().remove(m.storageKey).catch(() => undefined)));
  revalidatePath("/dashboard");
  redirect("/dashboard/projects");
}

// ───────────── Updates & media ─────────────

export async function postUpdate(projectId: string, _: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { project } = await ownedProject(projectId);
    const parsed = parseForm(projectUpdateSchema, formObject(formData));
    if (!parsed.ok) return parsed.state;
    await db.projectUpdate.create({ data: { ...parsed.data, projectId } });
    revalidateProject(project);
    return { ok: "Update posted." };
  } catch (e) {
    return errorState(e);
  }
}

export async function deleteUpdate(projectId: string, updateId: string) {
  const { project } = await ownedProject(projectId);
  await db.projectUpdate.deleteMany({ where: { id: updateId, projectId } });
  revalidateProject(project);
}

export async function setCover(projectId: string, mediaId: string | null) {
  const { project } = await ownedProject(projectId);
  if (mediaId) {
    const media = await db.mediaAsset.findFirst({ where: { id: mediaId, projectId, kind: "IMAGE" } });
    if (!media) throw new UserError("Choose an image from this project.");
  }
  await db.project.update({ where: { id: projectId }, data: { coverImageId: mediaId } });
  revalidateProject(project);
}

export async function updateCaption(projectId: string, mediaId: string, formData: FormData) {
  const { project } = await ownedProject(projectId);
  const caption = String(formData.get("caption") ?? "").trim().slice(0, 200) || null;
  await db.mediaAsset.updateMany({ where: { id: mediaId, projectId }, data: { caption } });
  revalidateProject(project);
}

export async function deleteMedia(projectId: string, mediaId: string) {
  const { project } = await ownedProject(projectId);
  const media = await db.mediaAsset.findFirst({ where: { id: mediaId, projectId } });
  if (!media) return;
  const data: Prisma.ProjectUpdateInput = project.coverImageId === mediaId ? { coverImage: { disconnect: true } } : {};
  await db.$transaction([db.project.update({ where: { id: projectId }, data }), db.mediaAsset.delete({ where: { id: mediaId } })]);
  await storage().remove(media.storageKey).catch(() => undefined);
  revalidateProject(project);
}
