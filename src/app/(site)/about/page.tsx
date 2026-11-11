import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { ButtonLink } from "@/components/ui";

export const metadata: Metadata = { title: "Mission" };

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Our mission"
        title={
          <>
            What if the next great studio <span className="italic text-ink-muted">could come from anyone?</span>
          </>
        }
      />
      <section className="site-container grid gap-16 py-24 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-10">
          <div>
            <p className="eyebrow">Mission</p>
            <p className="display mt-4 text-3xl leading-tight">
              Give anyone, anywhere, the opportunity to create, own and develop the world&apos;s next great entertainment franchise.
            </p>
          </div>
          <div>
            <p className="eyebrow">Vision</p>
            <p className="display mt-4 text-3xl leading-tight">
              A globally influential entertainment company powered by the creativity of millions of people.
            </p>
          </div>
        </div>
        <div className="prose-ipply">
          <p>
            Traditionally, a small number of entertainment companies decide which characters, films, stories, games, musicals and
            franchises are developed. Extraordinary ideas are everywhere; the doors to develop them have not been.
          </p>
          <p>
            IPPLY is the world&apos;s first open-access entertainment studio. Anyone can create original intellectual property, showcase it to
            the world, attract an audience, connect with commercial partners and potentially develop it into a global franchise.
          </p>
          <p>
            We provide the technology, creative development, commercial relationships and studio infrastructure to make that possible. The
            creator keeps ownership of their IP unless they voluntarily agree to different terms. IPPLY and its partners share in commercial
            success through transparent, negotiated licensing, production and development agreements.
          </p>
          <p>
            We&apos;re not building another content-generation website. We&apos;re building the next major entertainment institution — one that
            belongs, in a real sense, to the people who create for it.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href="/join">Start creating</ButtonLink>
            <ButtonLink href="/principles" variant="secondary">
              Creator rights charter
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
