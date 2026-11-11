import type { Metadata } from "next";
import { FeatureGrid, PageHero } from "@/components/page-hero";
import { ButtonLink, SectionHeading } from "@/components/ui";

export const metadata: Metadata = { title: "For creators" };

export default function CreatorsPage() {
  return (
    <>
      <PageHero
        eyebrow="IPPLY Create"
        title={
          <>
            The next big thing <span className="italic text-ink-muted">starts with you.</span>
          </>
        }
        intro="Characters, worlds, films, songs, musicals, books, games, design. Build a professional home for your original IP, find an audience, and meet the companies who can take it further."
      >
        <ButtonLink href="/join" size="lg">
          Start creating — it&apos;s free
        </ButtonLink>
        <ButtonLink href="/principles" variant="secondary" size="lg">
          Read the creator rights charter
        </ButtonLink>
      </PageHero>
      <section className="site-container py-24">
        <SectionHeading eyebrow="What you get" title="Studio infrastructure, for everyone." />
        <div className="mt-12">
          <FeatureGrid
            items={[
              { title: "A franchise-grade profile", body: "A beautiful public page for your project: key art, story, world, characters, media and updates." },
              { title: "You keep ownership", body: "Publishing on IPPLY grants only the limited permission to display your listing. Every deal is separate and explicit." },
              { title: "Discovery by industry", body: "Toy companies, studios, publishers, labels and producers browse IPPLY for original IP." },
              { title: "Structured enquiries", body: "Partners must specify category, territory, exclusivity and intended use — so you can respond with confidence." },
              { title: "Honest analytics", body: "Real followers, saves and page views. We never inflate numbers, and neither should anyone else." },
              { title: "A path to IPPLY Studios", body: "Selected projects may be offered development with IPPLY Studios, always on individually negotiated terms." },
            ]}
          />
        </div>
      </section>
      <section className="bg-ink py-24 text-white">
        <div className="site-container grid gap-12 lg:grid-cols-2">
          <h2 className="display text-4xl sm:text-6xl">
            Creative tools that <span className="iris-text italic">serve your vision</span> — not replace it.
          </h2>
          <div className="space-y-5 text-lg leading-relaxed text-white/70">
            <p>
              IPPLY&apos;s AI-assisted tools — for story structure, worldbuilding and pitch materials — are being built to help you develop
              your ideas faster. Human creativity and ownership stay at the centre.
            </p>
            <p>
              We ask every creator to disclose how AI tools were used, because copyright protection for AI-generated material varies by
              jurisdiction and depends on human creative contribution. Clear disclosure protects you and the people you work with.
            </p>
            <p className="text-sm text-white/45">AI-assisted creative tools are on the roadmap and not yet available in this version.</p>
          </div>
        </div>
      </section>
    </>
  );
}
