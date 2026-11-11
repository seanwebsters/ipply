import Link from "next/link";
import type { ProjectCategory } from "@prisma/client";
import { CATEGORY_LABELS } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { ProjectCover } from "./project-cover";
import { DemoBadge } from "./ui";

export type CardProject = {
  slug: string;
  title: string;
  tagline: string | null;
  category: ProjectCategory;
  keyArt: unknown;
  isDemo: boolean;
  coverImage?: { url: string; caption: string | null } | null;
  owner: { name: string; creatorProfile: { displayName: string } | null };
};

export function ProjectCard({ project, size = "md", className }: { project: CardProject; size?: "md" | "lg"; className?: string }) {
  const creator = project.owner.creatorProfile?.displayName ?? project.owner.name;
  return (
    <Link href={`/ip/${project.slug}`} className={cn("group block min-w-0", className)}>
      <div className={cn("relative overflow-hidden rounded-3xl bg-paper-warm", size === "lg" ? "aspect-[4/5] sm:aspect-[16/11]" : "aspect-[4/5]")}>
        <div className="absolute inset-0 transition duration-700 ease-out group-hover:scale-[1.035]">
          <ProjectCover project={project} />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        <div className="absolute left-4 top-4 flex gap-2">{project.isDemo && <DemoBadge />}</div>
        <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-white/75">{CATEGORY_LABELS[project.category]}</p>
          <h3 className={cn("display mt-2", size === "lg" ? "text-4xl sm:text-5xl" : "text-3xl")}>{project.title}</h3>
        </div>
      </div>
      <div className="mt-4 flex items-start justify-between gap-4 px-1">
        <p className="line-clamp-2 text-sm leading-relaxed text-ink-muted">{project.tagline}</p>
        <p className="shrink-0 text-sm text-ink-faint">{creator}</p>
      </div>
    </Link>
  );
}

export const cardProjectSelect = {
  slug: true,
  title: true,
  tagline: true,
  category: true,
  keyArt: true,
  isDemo: true,
  coverImage: { select: { url: true, caption: true } },
  owner: { select: { name: true, creatorProfile: { select: { displayName: true } } } },
} as const;
