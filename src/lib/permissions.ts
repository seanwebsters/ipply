import type { Project, Role } from "@prisma/client";

type Viewer = { id: string; role: Role } | null;
type ProjectLike = Pick<Project, "ownerId" | "status" | "hidden">;

/** Public visibility: published and not taken down. */
export function isPubliclyVisible(p: Pick<Project, "status" | "hidden">) {
  return p.status === "PUBLISHED" && !p.hidden;
}

export function canViewProject(viewer: Viewer, p: ProjectLike) {
  if (isPubliclyVisible(p)) return true;
  if (!viewer) return false;
  return viewer.role === "ADMIN" || viewer.id === p.ownerId;
}

export function canEditProject(viewer: Viewer, p: Pick<Project, "ownerId">) {
  return !!viewer && viewer.id === p.ownerId;
}

export function canModerate(viewer: Viewer) {
  return viewer?.role === "ADMIN";
}

/** Only partners attached to an organisation may send commercial enquiries, and never to their own work. */
export function canEnquire(
  viewer: (Viewer & { organizationId: string | null }) | null,
  p: Pick<Project, "ownerId" | "status" | "hidden" | "openToLicensing" | "openToDevelopment" | "rightsStatus">,
) {
  if (!viewer || viewer.role !== "PARTNER" || !viewer.organizationId) return false;
  if (viewer.id === p.ownerId) return false;
  if (!isPubliclyVisible(p)) return false;
  if (p.rightsStatus === "DISPUTED") return false;
  return p.openToLicensing || p.openToDevelopment;
}

/** Statuses each party may move an enquiry to. */
export function allowedEnquiryTransitions(
  party: "creator" | "partner",
  current: string,
): string[] {
  const closed = ["DECLINED", "WITHDRAWN"];
  if (closed.includes(current)) return [];
  if (party === "partner") return ["WITHDRAWN"];
  const creatorFlow: Record<string, string[]> = {
    SUBMITTED: ["UNDER_REVIEW", "IN_DISCUSSION", "DECLINED"],
    UNDER_REVIEW: ["IN_DISCUSSION", "DECLINED"],
    IN_DISCUSSION: ["TERMS_PROPOSED", "DECLINED"],
    TERMS_PROPOSED: ["AGREED_IN_PRINCIPLE", "IN_DISCUSSION", "DECLINED"],
    AGREED_IN_PRINCIPLE: ["IN_DISCUSSION"],
  };
  return creatorFlow[current] ?? [];
}

/** A project needs these fields before it can be submitted for review. */
export function publishReadiness(p: {
  title: string;
  logline: string | null;
  overview: string | null;
  ownershipDeclaredAt: Date | null;
  characters?: unknown[];
}) {
  const missing: string[] = [];
  if (!p.title) missing.push("Title");
  if (!p.logline) missing.push("Logline");
  if (!p.overview || p.overview.length < 80) missing.push("Overview (at least 80 characters)");
  if (!p.ownershipDeclaredAt) missing.push("Ownership declaration");
  return { ready: missing.length === 0, missing };
}
