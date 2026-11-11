import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { isPubliclyVisible } from "@/lib/permissions";
import { readLocalObject } from "@/lib/storage";

export const runtime = "nodejs";

/** Serves locally stored uploads (STORAGE_DRIVER=local). Media of unpublished projects is visible only to the owner and admins. */
export async function GET(_: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const key = (await params).key.join("/");
  const asset = await db.mediaAsset.findUnique({
    where: { storageKey: key },
    include: { project: { select: { ownerId: true, status: true, hidden: true } } },
  });
  if (!asset) return new NextResponse("Not found", { status: 404 });
  if (asset.project && !isPubliclyVisible(asset.project)) {
    const user = await getCurrentUser();
    if (!user || (user.id !== asset.project.ownerId && user.role !== "ADMIN")) return new NextResponse("Not found", { status: 404 });
  }
  const body = await readLocalObject(key);
  if (!body) return new NextResponse("Not found", { status: 404 });
  return new NextResponse(new Uint8Array(body), {
    headers: {
      "Content-Type": asset.mimeType,
      "Content-Length": String(body.length),
      "Cache-Control": asset.project && isPubliclyVisible(asset.project) ? "public, max-age=3600" : "private, no-store",
      "Content-Disposition": asset.kind === "DOCUMENT" ? "inline" : "inline",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
