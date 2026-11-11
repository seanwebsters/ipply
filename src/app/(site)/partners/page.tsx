import type { Metadata } from "next";
import { FeatureGrid, PageHero } from "@/components/page-hero";
import { ButtonLink, SectionHeading } from "@/components/ui";
import { ORG_TYPE_LABELS } from "@/lib/labels";

export const metadata: Metadata = { title: "For industry partners" };

export default function PartnersPage() {
  return (
    <>
      <PageHero
        eyebrow="IPPLY Licensing"
        title={
          <>
            Find what the world <span className="italic text-ink-muted">will love next.</span>
          </>
        }
        intro="IPPLY gives toy and consumer-product companies, studios, publishers, labels, producers and brands a single place to discover emerging original IP — and a direct, structured line to the people who created it."
      >
        <ButtonLink href="/join?as=partner" size="lg">
          Create a partner account
        </ButtonLink>
        <ButtonLink href="/discover?open=1" variant="secondary" size="lg">
          Browse available IP
        </ButtonLink>
      </PageHero>
      <section className="site-container py-24">
        <SectionHeading eyebrow="The partner portal" title="Serious tools for serious enquiries." />
        <div className="mt-12">
          <FeatureGrid
            items={[
              { title: "Curated discovery", body: "Search and filter by category, licensing availability and openness to deals." },
              { title: "Shortlists", body: "Save properties to your organisation's shortlist with private notes." },
              { title: "Structured enquiries", body: "Specify category, territory, exclusivity, term, intended use and proposed terms." },
              { title: "Transparent rights status", body: "Every listing distinguishes creator-declared ownership from documented ownership." },
              { title: "Direct conversation", body: "Message creators and track every enquiry's status in one place." },
              { title: "Coming next", body: "Deal rooms, contract workflows, royalty reporting and multi-territory rights management." },
            ]}
          />
        </div>
      </section>
      <section className="border-t border-paper-line bg-white py-24">
        <div className="site-container">
          <p className="eyebrow">Built for</p>
          <ul className="mt-8 flex flex-wrap gap-3">
            {Object.values(ORG_TYPE_LABELS)
              .filter((l) => l !== "Other")
              .map((l) => (
                <li key={l} className="display rounded-full border border-paper-line px-6 py-3 text-2xl">
                  {l}
                </li>
              ))}
          </ul>
          <p className="mt-10 max-w-2xl text-sm text-ink-muted">
            IPPLY is open to companies of every size. We do not list or imply partnerships with any company unless an agreement exists.
          </p>
        </div>
      </section>
    </>
  );
}
