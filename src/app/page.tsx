import Link from "next/link";
import type { ProjectCategory } from "@prisma/client";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProjectCard } from "@/components/project-card";
import { ProjectCover } from "@/components/project-cover";
import { KeyArt, type KeyArtSpec } from "@/components/key-art";
import { ButtonLink, DemoBadge, SectionHeading } from "@/components/ui";
import { featuredProjects, recentProjects } from "@/lib/queries";
import { CATEGORY_BLURBS, CATEGORY_LABELS, CATEGORY_SLUGS } from "@/lib/labels";


const CATEGORY_ART: Record<ProjectCategory, KeyArtSpec> = {
  CHARACTERS_WORLDS: { motif: "orbit", palette: "dawn" },
  FILM_TV: { motif: "horizon", palette: "dusk" },
  MUSIC: { motif: "grid", palette: "noir" },
  THEATRE: { motif: "stage", palette: "ember" },
  BOOKS: { motif: "tide", palette: "citrus" },
  GAMES: { motif: "stack", palette: "mint" },
  ART_DESIGN: { motif: "arch", palette: "blush" },
};

const STEPS = [
  { n: "01", title: "Create", body: "Bring an original character, story, world, song or game — or develop something new with IPPLY's creative tools." },
  { n: "02", title: "Develop", body: "Build a professional profile: identity, characters, world, audience and the ways it could grow." },
  { n: "03", title: "Publish", body: "Make it discoverable. Fans follow it, the industry finds it." },
  { n: "04", title: "Get discovered", body: "Studios, publishers, toy makers and brands browse IPPLY for what's next — and contact you directly." },
  { n: "05", title: "Make a deal", body: "Every licence or development deal is negotiated with you and agreed explicitly. Nothing transfers by default." },
  { n: "06", title: "Grow", body: "A character becomes a book, a plush, a series, a game. You participate in what it becomes." },
];

const DIVISIONS = [
  { name: "Create", body: "The creator platform for original IP.", status: "Live" },
  { name: "Discover", body: "The catalogue where the industry finds what's next.", status: "Live" },
  { name: "Licensing", body: "Structured enquiries today; full deal management next.", status: "In progress" },
  { name: "Studios", body: "Development and production of selected properties.", status: "In progress" },
  { name: "Products", body: "Plush, collectibles, books and apparel with partners.", status: "Future" },
  { name: "Experiences", body: "Concerts, theatre, exhibitions and live events.", status: "Future" },
];

// Always render on request: the page reads live data and must never touch the database at build time.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, recent] = await Promise.all([featuredProjects(5), recentProjects(8)]);
  const [lead, ...rest] = featured;
  const heroPosters = featured.slice(0, 3);

  return (
    <>
      {/* ───────────── Hero ───────────── */}
      <section className="relative isolate overflow-hidden bg-ink text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-[10%] top-[-20%] h-[70vh] w-[70vh] animate-drift rounded-full bg-iris-lavender/40 blur-[120px]" />
          <div className="absolute right-[-10%] top-[10%] h-[60vh] w-[60vh] animate-drift rounded-full bg-iris-pink/30 blur-[120px] [animation-delay:-6s]" />
          <div className="absolute bottom-[-25%] left-[30%] h-[60vh] w-[60vh] animate-drift rounded-full bg-iris-peach/25 blur-[120px] [animation-delay:-12s]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(11,11,15,0.6)_70%)]" />
        </div>
        <SiteHeader tone="light" />
        <div className="site-container pb-16 pt-16 sm:pt-24 lg:pb-24 lg:pt-28">
          <p className="animate-fade-up text-sm font-medium tracking-[0.32em] text-white/70">IPPLY</p>
          <h1 className="display mt-6 animate-fade-up text-[3.6rem] [animation-delay:80ms] sm:text-[6rem] lg:text-[9rem]">
            The World&apos;s <span className="iris-text italic">Studio.</span>
          </h1>
          <p className="mt-6 animate-fade-up text-2xl font-light text-white/90 [animation-delay:160ms] sm:text-3xl">
            Created by anyone. Loved by everyone.
          </p>
          <p className="mt-6 max-w-xl animate-fade-up text-lg leading-relaxed text-white/65 [animation-delay:240ms]">
            Meet a new kind of entertainment studio. Where anyone can create the next great character, story or world — and take it
            further than ever imagined.
          </p>
          <div className="mt-10 flex animate-fade-up flex-wrap gap-3 [animation-delay:320ms]">
            <ButtonLink href="/discover" variant="light" size="lg">
              Explore IPPLY
            </ButtonLink>
            <ButtonLink href="/join" variant="outline-light" size="lg">
              Start Creating
            </ButtonLink>
          </div>
        </div>

        {heroPosters.length > 0 && (
          <div className="site-container pb-20 sm:pb-28">
            <div className="grid grid-cols-3 gap-3 sm:gap-6">
              {heroPosters.map((p, i) => (
                <Link
                  key={p.slug}
                  href={`/ip/${p.slug}`}
                  className="group relative block animate-fade-up overflow-hidden rounded-2xl ring-1 ring-white/10 sm:rounded-3xl"
                  style={{ animationDelay: `${400 + i * 120}ms` }}
                >
                  <div className="aspect-[3/4] transition duration-700 group-hover:scale-[1.03] sm:aspect-[4/5]">
                    <ProjectCover project={p} priority />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 sm:p-6">
                    <p className="display text-lg sm:text-3xl">{p.title}</p>
                  </div>
                  {p.isDemo && <DemoBadge onDark className="absolute left-2 top-2 scale-90 sm:left-4 sm:top-4 sm:scale-100" />}
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      <main id="main">
        {/* ───────────── 1. Featured ───────────── */}
        {lead && (
          <section className="site-container py-24 sm:py-32">
            <SectionHeading
              eyebrow="Featured on IPPLY"
              title={
                <>
                  Original worlds, <span className="italic text-ink-muted">from everywhere.</span>
                </>
              }
              intro="A first look at the kinds of properties being built on IPPLY. These featured projects are fictional demonstrations."
              action={
                <ButtonLink href="/discover" variant="secondary">
                  See everything
                </ButtonLink>
              }
            />
            <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-[1.35fr_1fr]">
              <Link href={`/ip/${lead.slug}`} className="group relative block min-h-[34rem] min-w-0 overflow-hidden rounded-4xl bg-ink">
                <div className="absolute inset-0 transition duration-700 group-hover:scale-[1.02]">
                  <ProjectCover project={lead} />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                {lead.isDemo && <DemoBadge className="absolute left-6 top-6" />}
                <div className="absolute inset-x-0 bottom-0 p-7 text-white sm:p-10">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/70">{CATEGORY_LABELS[lead.category]}</p>
                  <h3 className="display mt-3 text-5xl sm:text-7xl">{lead.title}</h3>
                  <p className="mt-4 max-w-lg text-base leading-relaxed text-white/80 sm:text-lg">{lead.logline}</p>
                </div>
              </Link>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-1">
                {rest.slice(0, 2).map((p) => (
                  <ProjectCard key={p.slug} project={p} size="lg" />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ───────────── 2. Categories ───────────── */}
        <section className="border-y border-paper-line bg-white py-24 sm:py-32">
          <div className="site-container">
            <SectionHeading
              eyebrow="Discover"
              title="Characters, stories, worlds — and everything they become."
              intro="Browse original intellectual property across every form of entertainment."
            />
            <div className="mt-14 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
              {(Object.keys(CATEGORY_LABELS) as ProjectCategory[]).map((c, i) => (
                <Link
                  key={c}
                  href={`/discover?category=${CATEGORY_SLUGS[c]}`}
                  className={`group relative overflow-hidden rounded-3xl ${i === 0 ? "col-span-2 row-span-2" : ""}`}
                >
                  <div className={`${i === 0 ? "aspect-square" : "aspect-[4/3]"} transition duration-700 group-hover:scale-105`}>
                    <KeyArt spec={CATEGORY_ART[c]} seed={c} className="h-full w-full" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
                    <p className={`display ${i === 0 ? "text-4xl sm:text-6xl" : "text-2xl sm:text-3xl"}`}>{CATEGORY_LABELS[c]}</p>
                    <p className="mt-1 hidden text-sm text-white/75 sm:block">{CATEGORY_BLURBS[c]}</p>
                  </div>
                </Link>
              ))}
              <Link href="/discover" className="group flex aspect-[4/3] flex-col justify-between rounded-3xl bg-ink p-5 text-white sm:p-6">
                <span aria-hidden className="iris-bg h-8 w-8 rounded-full transition group-hover:scale-125" />
                <span className="display text-2xl sm:text-3xl">
                  Explore all <span aria-hidden>→</span>
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* ───────────── 3. Mission ───────────── */}
        <section className="relative overflow-hidden py-28 sm:py-40">
          <div aria-hidden className="iris-bg absolute left-1/2 top-1/2 -z-10 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-[120px]" />
          <div className="site-container text-center">
            <p className="eyebrow">Our mission</p>
            <p className="display mx-auto mt-8 max-w-5xl text-4xl leading-[1.08] sm:text-6xl lg:text-7xl">
              What if the next great entertainment company <span className="italic">could come from anyone?</span>
            </p>
            <p className="mx-auto mt-10 max-w-2xl text-lg leading-relaxed text-ink-muted">
              For a century, a handful of studios decided which characters and stories the world would meet. IPPLY gives anyone, anywhere,
              the opportunity to create, own and develop the world&apos;s next great entertainment franchise.
            </p>
            <div className="mt-10">
              <ButtonLink href="/about" variant="secondary">
                Read the mission
              </ButtonLink>
            </div>
          </div>
        </section>

        {/* ───────────── 4. How it works ───────────── */}
        <section className="bg-ink py-24 text-white sm:py-32">
          <div className="site-container">
            <div className="max-w-2xl">
              <p className="eyebrow text-white/50">How it works</p>
              <h2 className="display mt-4 text-4xl sm:text-6xl">
                One idea can become <span className="iris-text italic">an entire entertainment business.</span>
              </h2>
            </div>
            <ol className="mt-16 grid gap-px overflow-hidden rounded-3xl bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
              {STEPS.map((s) => (
                <li key={s.n} className="bg-ink p-8 sm:p-10">
                  <p className="font-mono text-xs text-white/40">{s.n}</p>
                  <h3 className="display mt-6 text-3xl">{s.title}</h3>
                  <p className="mt-3 leading-relaxed text-white/60">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ───────────── 5. New ───────────── */}
        {recent.length > 0 && (
          <section className="site-container py-24 sm:py-32">
            <SectionHeading
              eyebrow="Just published"
              title="New on IPPLY"
              action={
                <ButtonLink href="/discover" variant="secondary">
                  Browse the catalogue
                </ButtonLink>
              }
            />
            <div className="-mx-5 mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12 [scrollbar-width:none]">
              {recent.map((p) => (
                <ProjectCard key={p.slug} project={p} className="w-[78vw] shrink-0 snap-start sm:w-[22rem]" />
              ))}
            </div>
          </section>
        )}

        {/* ───────────── 6 & 7. Creators / Partners ───────────── */}
        <section className="site-container grid gap-6 pb-24 sm:pb-32 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-4xl bg-ink p-8 text-white sm:p-12">
            <div aria-hidden className="iris-bg absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-60 blur-3xl" />
            <p className="eyebrow relative text-white/50">For creators</p>
            <h2 className="display relative mt-4 text-4xl sm:text-5xl">The next big thing starts with you.</h2>
            <ul className="relative mt-8 space-y-4 text-white/75">
              <li>— Keep ownership of everything you create.</li>
              <li>— Build a beautiful home for your IP in minutes.</li>
              <li>— Get found by studios, publishers and brands.</li>
              <li>— Negotiate every deal on your own terms.</li>
            </ul>
            <div className="relative mt-10 flex flex-wrap gap-3">
              <ButtonLink href="/join" variant="light">
                Start creating
              </ButtonLink>
              <ButtonLink href="/creators" variant="outline-light">
                How it works for creators
              </ButtonLink>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-4xl border border-paper-line bg-white p-8 sm:p-12">
            <p className="eyebrow">For industry partners</p>
            <h2 className="display mt-4 text-4xl sm:text-5xl">Find what the world will love next.</h2>
            <ul className="mt-8 space-y-4 text-ink-muted">
              <li>— A curated catalogue of emerging original IP.</li>
              <li>— Clear rights status and available licensing categories.</li>
              <li>— Structured enquiries by category, territory and term.</li>
              <li>— A direct line to the people who created it.</li>
            </ul>
            <div className="mt-10 flex flex-wrap gap-3">
              <ButtonLink href="/join?as=partner">Join as a partner</ButtonLink>
              <ButtonLink href="/partners" variant="secondary">
                For toy, film, music & publishing
              </ButtonLink>
            </div>
          </div>
        </section>

        {/* ───────────── 8. Studios ───────────── */}
        <section className="border-t border-paper-line bg-paper-warm py-24 sm:py-32">
          <div className="site-container grid gap-16 lg:grid-cols-[1fr_1.3fr]">
            <div>
              <p className="eyebrow">IPPLY Studios</p>
              <h2 className="display mt-4 text-4xl sm:text-6xl">
                From a profile page <span className="italic text-ink-muted">to the big screen.</span>
              </h2>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-muted">
                IPPLY Studios identifies promising projects and helps develop them into real entertainment franchises — shorts, series,
                games, music and theatre — always under individually negotiated agreements with the creator.
              </p>
              <div className="mt-8">
                <ButtonLink href="/studios" variant="secondary">
                  About IPPLY Studios
                </ButtonLink>
              </div>
            </div>
            <ul className="grid gap-px overflow-hidden rounded-3xl border border-paper-line bg-paper-line sm:grid-cols-2">
              {DIVISIONS.map((d) => (
                <li key={d.name} className="bg-white p-7">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold tracking-[0.16em]">
                      IPPLY <span className="font-normal">{d.name}</span>
                    </p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wider ${
                        d.status === "Live" ? "bg-emerald-50 text-emerald-700" : d.status === "Future" ? "bg-ink/5 text-ink-faint" : "bg-sky-50 text-sky-700"
                      }`}
                    >
                      {d.status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-ink-muted">{d.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ───────────── 9. Final invitation ───────────── */}
        <section className="relative isolate overflow-hidden bg-ink py-32 text-center text-white sm:py-44">
          <div aria-hidden className="absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 animate-drift rounded-full bg-iris-lavender/35 blur-[120px]" />
            <div className="absolute left-[60%] top-[40%] h-[24rem] w-[24rem] animate-drift rounded-full bg-iris-peach/25 blur-[100px] [animation-delay:-9s]" />
          </div>
          <div className="site-container">
            <p className="display mx-auto max-w-4xl text-5xl sm:text-7xl lg:text-8xl">
              Created by anyone.
              <br />
              <span className="iris-text italic">Loved by everyone.</span>
            </p>
            <p className="mx-auto mt-8 max-w-lg text-lg text-white/65">Your character, your story, your world. Bring it to IPPLY.</p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/join" variant="light" size="lg">
                Start Creating
              </ButtonLink>
              <ButtonLink href="/discover" variant="outline-light" size="lg">
                Explore IPPLY
              </ButtonLink>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
