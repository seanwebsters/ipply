import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { RIGHTS_LABELS } from "@/lib/labels";
import { RightsBadge } from "@/components/ui";
import type { RightsStatus } from "@prisma/client";

export const metadata: Metadata = { title: "Creator rights charter" };

const SECTIONS = [
  {
    id: "ownership",
    title: "1. You own your work",
    body: [
      "Submitting or publishing content on IPPLY does not transfer ownership of your intellectual property to IPPLY.",
      "You grant IPPLY only the limited, non-exclusive permission needed to host, display and operate your listing — for example, showing your artwork on your project page and in the catalogue. You can unpublish at any time.",
      "Any licensing, option, acquisition or development rights must be separately and explicitly agreed, in writing, with the rights holders.",
    ],
  },
  {
    id: "rights",
    title: "2. Rights status is honest",
    body: [
      "When you publish, you declare that you own or control the rights to your project, and list any contributors and co-owners. IPPLY records this as a creator declaration.",
      "We never automatically label a project as verified. Only after IPPLY has reviewed supporting documentation can a project be marked “Rights documented” — and partners should still complete their own legal due diligence.",
    ],
  },
  {
    id: "ai",
    title: "3. AI and authorship",
    body: [
      "Creators can use AI tools, and must disclose how they were used.",
      "Copyright protection for AI-generated material varies by jurisdiction and generally depends on meaningful human creative contribution. Clear disclosure protects creators and the partners who license their work.",
    ],
  },
  {
    id: "deals",
    title: "4. Deals are explicit",
    body: [
      "Enquiries on IPPLY are expressions of interest, not offers or contracts. IPPLY does not currently execute contracts, process payments or distribute royalties — these are future capabilities and will never be simulated as completed transactions.",
      "Where IPPLY facilitates a deal, any transaction fee or commercial participation is disclosed and agreed in advance.",
    ],
  },
  {
    id: "demo",
    title: "5. No invented numbers",
    body: [
      "We do not fabricate followers, engagement, verified rights, completed deals, partnerships or earnings.",
      "Projects marked “Demo” are fictional samples created by IPPLY to demonstrate the platform. Their creators and organisations do not exist, and any engagement shown on them is real activity from visitors to this site.",
    ],
  },
];

export default function PrinciplesPage() {
  return (
    <>
      <PageHero
        eyebrow="Trust"
        title={
          <>
            The creator rights <span className="italic text-ink-muted">charter.</span>
          </>
        }
        intro="The principles that govern how IPPLY treats creators, their work and the partners who want to build with them."
      />
      <div className="site-container grid gap-16 py-20 lg:grid-cols-[16rem_1fr]">
        <nav aria-label="Sections" className="hidden lg:block">
          <ul className="sticky top-28 space-y-3 text-sm">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-ink-muted hover:text-ink">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="max-w-3xl space-y-16">
          {SECTIONS.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-28">
              <h2 className="display text-4xl">{s.title}</h2>
              <div className="prose-ipply mt-6">
                {s.body.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              {s.id === "rights" && (
                <dl className="mt-8 space-y-4">
                  {(Object.keys(RIGHTS_LABELS) as RightsStatus[]).map((k) => (
                    <div key={k} className="card flex flex-col gap-2 p-5 sm:flex-row sm:items-start sm:gap-6">
                      <dt className="shrink-0 sm:w-44">
                        <RightsBadge status={k} />
                      </dt>
                      <dd className="text-sm leading-relaxed text-ink-muted">{RIGHTS_LABELS[k].detail}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </section>
          ))}
          <p className="text-xs text-ink-faint">
            This charter summarises IPPLY&apos;s product principles. It is not legal advice and does not replace the platform terms of service.
          </p>
        </div>
      </div>
    </>
  );
}
