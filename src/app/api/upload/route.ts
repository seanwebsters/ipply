import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { randomBytes } from "node:crypto";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ALLOWED_MIME, MAX_UPLOAD_BYTES, extensionFor, sniffMatches, storage } from "@/lib/storage";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const MAX_ASSETS_PER_PROJECT = 40;

function sameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  const user = await getCurrentUser();
  if (!user || user.role !== "CREATOR") return NextResponse.json({ error: "Sign in as a creator to upload." }, { status: 401 });
  if (!rateLimit(`upload:${user.id}`, 60, 60 * 60 * 1000)) return NextResponse.json({ error: "Upload limit reached. Try again later." }, { status: 429 });

  const form = await req.formData().catch(() => null);
  const projectId = form?.get("projectId");
  const file = form?.get("file");
  if (typeof projectId !== "string" || !(file instanceof File)) return NextResponse.json({ error: "Choose a file to upload." }, { status: 400 });

  const project = await db.project.findUnique({ where: { id: projectId }, select: { id: true, slug: true, ownerId: true, coverImageId: true } });
  if (!project || project.ownerId !== user.id) return NextResponse.json({ error: "Project not found." }, { status: 404 });

  const kind = ALLOWED_MIME[file.type];
  if (!kind) return NextResponse.json({ error: "Upload JPG, PNG, WebP, GIF, MP4, WebM, MP3, WAV or PDF files." }, { status: 415 });
  if (file.size > MAX_UPLOAD_BYTES) return NextResponse.json({ error: "Files must be 15 MB or smaller." }, { status: 413 });
  const count = await db.mediaAsset.count({ where: { projectId } });
  if (count >= MAX_ASSETS_PER_PROJECT) return NextResponse.json({ error: `Projects can hold up to ${MAX_ASSETS_PER_PROJECT} files.` }, { status: 400 });

  const bytes = Buffer.from(await file.arrayBuffer());
  if (!sniffMatches(file.type, bytes)) return NextResponse.json({ error: "That file's contents don't match its type." }, { status: 415 });

  const key = `projects/${project.id}/${randomBytes(12).toString("hex")}.${extensionFor(file.type)}`;
  const url = await storage().put(key, bytes, file.type);
  const caption = String(form?.get("caption") ?? "").trim().slice(0, 200) || null;
  const asset = await db.mediaAsset.create({
    data: { projectId, uploaderId: user.id, kind, storageKey: key, url, mimeType: file.type, sizeBytes: file.size, caption, sortOrder: count },
  });
  // First image becomes the cover automatically
  if (kind === "IMAGE" && !project.coverImageId) await db.project.update({ where: { id: project.id }, data: { coverImageId: asset.id } });

  revalidatePath(`/ip/${project.slug}`);
  revalidatePath(`/dashboard/projects/${project.id}`, "layout");
  return NextResponse.json({ id: asset.id, url: asset.url, kind: asset.kind });
}
