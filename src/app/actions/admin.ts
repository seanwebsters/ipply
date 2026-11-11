"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { assertUser } from "@/lib/auth";
import { UserError } from "@/lib/errors";
import { rightsStatusSchema, studioStageSchema } from "@/lib/validation";

function revalidateAll(slug?: string) {
  revalidatePath("/admin", "layout");
  revalidatePath("/");
  revalidatePath("/discover");
  if (slug) revalidatePath(`/ip/${slug}`);
  revalidatePath("/dashboard", "layout");
}

async function adminProject(projectId: string) {
  const admin = await assertUser(["ADMIN"]);
  const project = await db.project.findUnique({ where: { id: projectId } });
  if (!project) throw new UserError("Project not found.");
  return { admin, project };
}

export async function approveProject(projectId: string, formData: FormData) {
  const { admin, project } = await adminProject(projectId);
  if (project.status !== "IN_REVIEW") throw new UserError("Only projects in review can be approved.");
  const note = String(formData.get("note") ?? "").trim().slice(0, 1000) || null;
  await db.$transaction([
    db.project.update({ where: { id: projectId }, data: { status: "PUBLISHED", publishedAt: project.publishedAt ?? new Date() } }),
    db.moderationEvent.create({ data: { projectId, actorId: admin.id, action: "APPROVED", note } }),
  ]);
  revalidateAll(project.slug);
}

export async function requestChanges(projectId: string, formData: FormData) {
  const { admin, project } = await adminProject(projectId);
  const note = String(formData.get("note") ?? "").trim().slice(0, 1000);
  if (!note) throw new UserError("Explain what needs to change.");
  await db.$transaction([
    db.project.update({ where: { id: projectId }, data: { status: "CHANGES_REQUESTED", featured: false } }),
    db.moderationEvent.create({ data: { projectId, actorId: admin.id, action: "CHANGES_REQUESTED", note } }),
  ]);
  revalidateAll(project.slug);
}

export async function toggleFeatured(projectId: string) {
  const { admin, project } = await adminProject(projectId);
  if (!project.featured && (project.status !== "PUBLISHED" || project.hidden)) throw new UserError("Only visible, published projects can be featured.");
  await db.$transaction([
    db.project.update({ where: { id: projectId }, data: { featured: !project.featured } }),
    db.moderationEvent.create({ data: { projectId, actorId: admin.id, action: project.featured ? "UNFEATURED" : "FEATURED" } }),
  ]);
  revalidateAll(project.slug);
}

export async function toggleHidden(projectId: string, formData: FormData) {
  const { admin, project } = await adminProject(projectId);
  const note = String(formData.get("note") ?? "").trim().slice(0, 1000) || null;
  await db.$transaction([
    db.project.update({ where: { id: projectId }, data: { hidden: !project.hidden, featured: project.hidden ? project.featured : false } }),
    db.moderationEvent.create({ data: { projectId, actorId: admin.id, action: project.hidden ? "UNHIDDEN" : "HIDDEN", note } }),
  ]);
  revalidateAll(project.slug);
}

export async function setRightsStatus(projectId: string, formData: FormData) {
  const { admin, project } = await adminProject(projectId);
  const status = rightsStatusSchema.parse(formData.get("rightsStatus"));
  const note = String(formData.get("note") ?? "").trim().slice(0, 1000) || null;
  if (status === "VERIFIED" && !note) throw new UserError("Record what documentation was reviewed before marking rights as documented.");
  await db.$transaction([
    db.project.update({ where: { id: projectId }, data: { rightsStatus: status } }),
    db.moderationEvent.create({ data: { projectId, actorId: admin.id, action: `RIGHTS_${status}`, note } }),
  ]);
  revalidateAll(project.slug);
}

export async function upsertStudioOpportunity(projectId: string, formData: FormData) {
  const { admin, project } = await adminProject(projectId);
  const stage = studioStageSchema.parse(formData.get("stage"));
  const notes = String(formData.get("notes") ?? "").trim().slice(0, 3000) || null;
  const formats = String(formData.get("formats") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 8);
  await db.studioOpportunity.upsert({
    where: { projectId },
    create: { projectId, stage, notes, formats },
    update: { stage, notes, formats },
  });
  await db.moderationEvent.create({ data: { projectId, actorId: admin.id, action: `STUDIO_${stage}` } });
  revalidateAll(project.slug);
}

export async function removeStudioOpportunity(projectId: string) {
  await adminProject(projectId);
  await db.studioOpportunity.deleteMany({ where: { projectId } });
  revalidatePath("/admin", "layout");
}

/** Hide or show every demonstration project at once (e.g. before launch). */
export async function setDemoVisibility(formData: FormData) {
  const admin = await assertUser(["ADMIN"]);
  const hidden = formData.get("hidden") === "true";
  const projects = await db.project.findMany({ where: { isDemo: true }, select: { id: true } });
  await db.$transaction([
    db.project.updateMany({ where: { isDemo: true }, data: { hidden, ...(hidden ? { featured: false } : {}) } }),
    db.moderationEvent.createMany({
      data: projects.map((p) => ({ projectId: p.id, actorId: admin.id, action: hidden ? "DEMO_HIDDEN" : "DEMO_SHOWN" })),
    }),
  ]);
  revalidateAll();
}
