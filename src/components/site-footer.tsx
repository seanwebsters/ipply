import Link from "next/link";
import { Wordmark } from "./wordmark";

const COLUMNS = [
  {
    title: "Explore",
    links: [
      { href: "/discover", label: "Discover" },
      { href: "/discover?category=characters-worlds", label: "Characters & Worlds" },
      { href: "/discover?category=film-tv", label: "Film & TV" },
      { href: "/discover?category=music", label: "Music" },
      { href: "/discover?category=games", label: "Games" },
    ],
  },
  {
    title: "IPPLY",
    links: [
      { href: "/creators", label: "For creators" },
      { href: "/partners", label: "For partners" },
      { href: "/studios", label: "IPPLY Studios" },
      { href: "/about", label: "Mission" },
    ],
  },
  {
    title: "Trust",
    links: [
      { href: "/principles", label: "Creator rights charter" },
      { href: "/principles#rights", label: "How rights status works" },
      { href: "/principles#ai", label: "AI & authorship" },
      { href: "/principles#demo", label: "Demonstration content" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-paper-line bg-paper">
      <div className="site-container py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          <div className="max-w-sm">
            <Wordmark />
            <p className="display mt-6 text-3xl leading-tight">
              Created by anyone.
              <br />
              <span className="italic text-ink-muted">Loved by everyone.</span>
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="eyebrow">{col.title}</p>
                <ul className="mt-4 space-y-3">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-sm text-ink-soft transition hover:text-ink">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-16 flex flex-col gap-4 border-t border-paper-line pt-8 text-xs text-ink-faint sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} IPPLY. Creators keep ownership of their work.</p>
          <p>Projects marked “Demo” are fictional samples created to demonstrate the platform.</p>
        </div>
      </div>
    </footer>
  );
}
