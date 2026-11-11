import type { Prisma, ProjectCategory } from "@prisma/client";
import { db } from "./db";
import { cardProjectSelect } from "@/components/project-card";

export const PUBLIC_PROJECT: Prisma.ProjectWhereInput = { status: "PUBLISHED", hidden: false };

export function featuredProjects(take = 5) {
  return db.project.findMany({
    where: { ...PUBLIC_PROJECT, featured: true },
    orderBy: { publishedAt: "desc" },
    take,
    select: { ...cardProjectSelect, id: true, logline: true },
  });
}

export function recentProjects(take = 8) {
  return db.project.findMany({
    where: PUBLIC_PROJECT,
    orderBy: { publishedAt: "desc" },
    take,
    select: cardProjectSelect,
  });
}

export type DiscoverParams = {
  q?: string;
  category?: ProjectCategory;
  licensing?: string;
  sort?: "new" | "az" | "followed";
  open?: boolean;
};

export async function discoverProjects(params: DiscoverParams) {
  const q = params.q?.trim().slice(0, 80);
  const where: Prisma.ProjectWhereInput = {
    ...PUBLIC_PROJECT,
    ...(params.category ? { category: params.category } : {}),
    ...(params.licensing ? { licensingCategories: { has: params.licensing as never } } : {}),
    ...(params.open ? { OR: [{ openToLicensing: true }, { openToDevelopment: true }] } : {}),
    ...(q
      ? {
          AND: [
            {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { tagline: { contains: q, mode: "insensitive" } },
                { logline: { contains: q, mode: "insensitive" } },
                { genres: { has: q } },
                { characters: { some: { name: { contains: q, mode: "insensitive" } } } },
                { owner: { creatorProfile: { displayName: { contains: q, mode: "insensitive" } } } },
              ],
            },
          ],
        }
      : {}),
  };
  const orderBy: Prisma.ProjectOrderByWithRelationInput =
    params.sort === "az" ? { title: "asc" } : params.sort === "followed" ? { follows: { _count: "desc" } } : { publishedAt: "desc" };
  return db.project.findMany({ where, orderBy, take: 60, select: cardProjectSelect });
}

export async function categoryCounts() {
  const rows = await db.project.groupBy({ by: ["category"], where: PUBLIC_PROJECT, _count: true });
  return Object.fromEntries(rows.map((r) => [r.category, r._count])) as Partial<Record<ProjectCategory, number>>;
}
