"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { isPubliclyVisible } from "@/lib/permissions";

type Result = { ok: true; active: boolean; count?: number } | { ok: false; reason: "signin" | "unavailable" };

async function visibleProject(projectId: string) {
  const p = await db.project.findUnique({ where: { id: projectId }, select: { id: true, slug: true, status: true, hidden: true } });
  return p && isPubliclyVisible(p) ? p : null;
}

export async function toggleFollow(projectId: string): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, reason: "signin" };
  const project = await visibleProject(projectId);
  if (!project) return { ok: false, reason: "unavailable" };
  const key = { userId_projectId: { userId: user.id, projectId } };
  const existing = await db.follow.findUnique({ where: key });
  if (existing) await db.follow.delete({ where: key });
  else await db.follow.create({ data: { userId: user.id, projectId } });
  const count = await db.follow.count({ where: { projectId } });
  revalidatePath(`/ip/${project.slug}`);
  return { ok: true, active: !existing, count };
}

export async function toggleSave(projectId: string): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, reason: "signin" };
  const project = await visibleProject(projectId);
  if (!project) return { ok: false, reason: "unavailable" };
  const key = { userId_projectId: { userId: user.id, projectId } };
  const existing = await db.savedProject.findUnique({ where: key });
  if (existing) await db.savedProject.delete({ where: key });
  else await db.savedProject.create({ data: { userId: user.id, projectId } });
  revalidatePath("/partner/shortlist");
  revalidatePath("/dashboard/saved");
  return { ok: true, active: !existing };
}

export async function updateSaveNote(projectId: string, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;
  const note = String(formData.get("note") ?? "").trim().slice(0, 500) || null;
  await db.savedProject.updateMany({ where: { userId: user.id, projectId }, data: { note } });
  revalidatePath("/partner/shortlist");
}

/** Record a real page view, once per visitor per day (cookie-deduplicated by the caller). */
export async function recordView(projectId: string) {
  if (typeof projectId !== "string" || projectId.length > 40) return;
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  // Best-effort de-duplication so the counter can't be trivially inflated
  if (!rateLimit(`view:${ip}:${projectId}`, 1, 6 * 60 * 60 * 1000)) return;
  if (!rateLimit(`views:${ip}`, 200, 60 * 60 * 1000)) return;
  if (!(await visibleProject(projectId))) return;
  const user = await getCurrentUser();
  if (user) {
    const p = await db.project.findUnique({ where: { id: projectId }, select: { ownerId: true } });
    if (p?.ownerId === user.id) return;
  }
  const day = new Date();
  day.setUTCHours(0, 0, 0, 0);
  await db.projectViewDaily.upsert({
    where: { projectId_day: { projectId, day } },
    create: { projectId, day, count: 1 },
    update: { count: { increment: 1 } },
  });
}
