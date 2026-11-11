import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { KeyArt } from "@/components/key-art";
import { ButtonLink, SectionHeading } from "@/components/ui";

export const metadata: Metadata = { title: "IPPLY Studios" };

const CAPABILITIES = [
  { title: "Animation & television", body: "Shorts, pilots and series developed with the creator.", art: { motif: "horizon", palette: "dusk" } },
  { title: "Film", body: "Feature development, from treatment to financing.", art: { motif: "orbit", palette: "noir" } },
  { title: "Games", body: "Original games and interactive experiences.", art: { motif: "stack", palette: "mint" } },
  { title: "Music & theatre", body: "Albums, cast recordings and stage productions.", art: { motif: "stage", palette: "ember" } },
] as const;

export default function StudiosPage() {
  return (
    <>
      <PageHero
        eyebrow="IPPLY Studios"
        title={
          <>
            Where great ideas <span className="italic text-ink-muted">become franchises.</span>
          </>
        }
        intro="IPPLY Studios is the creative development and production arm of IPPLY. We identify promising projects on the platform and help develop them into real entertainment — commissioning talent, financing pilots and coordinating distribution partnerships."
      />
      <section className="site-container py-24">
        <SectionHeading eyebrow="What we develop" title="Every form of entertainment." />
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {CAPABILITIES.map((c) => (
            <div key={c.title} className="group overflow-hidden rounded-3xl bg-white">
              <div className="aspect-[16/9] overflow-hidden">
                <KeyArt spec={c.art} seed={c.title} className="h-full w-full transition duration-700 group-hover:scale-105" />
              </div>
              <div className="p-7">
                <h3 className="display text-3xl">{c.title}</h3>
                <p className="mt-2 text-ink-muted">{c.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="bg-ink py-24 text-white">
        <div className="site-container grid gap-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow text-white/50">Our commitment</p>
            <h2 className="display mt-4 text-4xl sm:text-6xl">The creator is always at the table.</h2>
          </div>
          <div className="space-y-5 text-lg leading-relaxed text-white/70">
            <p>
              Being on IPPLY never obliges a creator to work with IPPLY Studios, and publishing never grants IPPLY development rights.
            </p>
            <p>
              Projects selected for studio development receive individually negotiated agreements that define ownership, rights, fees and
              creator participation — before any work begins.
            </p>
            <p className="text-sm text-white/45">
              IPPLY Studios is in its early stages. We have not yet announced any original productions.
            </p>
          </div>
        </div>
      </section>
      <section className="site-container py-24 text-center">
        <h2 className="display mx-auto max-w-3xl text-4xl sm:text-6xl">Your project could be next.</h2>
        <div className="mt-10 flex justify-center gap-3">
          <ButtonLink href="/join" size="lg">
            Start creating
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
