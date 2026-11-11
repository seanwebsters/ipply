import { KeyArt, parseKeyArt } from "./key-art";
import { cn } from "@/lib/utils";

/** The cover for a project: the creator's uploaded image if any, otherwise generative key art. */
export function ProjectCover({
  project,
  className,
  priority,
}: {
  project: { slug: string; title: string; keyArt: unknown; coverImage?: { url: string; caption: string | null } | null };
  className?: string;
  priority?: boolean;
}) {
  if (project.coverImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={project.coverImage.url}
        alt={project.coverImage.caption || `Cover artwork for ${project.title}`}
        className={cn("block h-full w-full min-w-0 max-w-full object-cover", className)}
        loading={priority ? "eager" : "lazy"}
      />
    );
  }
  return <KeyArt spec={parseKeyArt(project.keyArt, project.slug)} seed={project.slug} title={project.title} className={cn("h-full w-full", className)} />;
}
