/**
 * Seeds IPPLY with clearly-labelled demonstration content.
 *
 * Every record created here is fictional and flagged isDemo. No follower
 * counts, views, verified rights, completed deals or earnings are invented:
 * engagement starts at zero and all rights are "creator-declared".
 *
 * Re-running the seed removes previous demo records and recreates them.
 */
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { PrismaClient, type LicensingCategory, type ProjectCategory, type ProjectStatus } from "@prisma/client";

// Accept whichever variable a host database integration provides.
const dbUrl = ["DATABASE_URL", "POSTGRES_PRISMA_URL", "POSTGRES_URL", "DATABASE_URL_UNPOOLED", "POSTGRES_URL_NON_POOLING"]
  .map((k) => process.env[k])
  .find(Boolean);
const db = new PrismaClient(dbUrl ? { datasources: { db: { url: dbUrl } } } : undefined);
const DEMO_PASSWORD = process.env.SEED_DEMO_PASSWORD || "ipply-demo-2026";
const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

type DemoProject = {
  slug: string;
  title: string;
  category: ProjectCategory;
  status?: ProjectStatus;
  featured?: boolean;
  tagline: string;
  logline: string;
  overview: string;
  world: string;
  audience: string;
  formats: string[];
  genres: string[];
  keyArt: { motif: string; palette: string };
  aiAssisted?: boolean;
  aiDisclosure?: string;
  licensing: LicensingCategory[];
  commercialNotes?: string;
  characters: { name: string; role: string; description: string }[];
  contributors?: { name: string; role: string; isRightsHolder: boolean; shareBps?: number }[];
  updates?: { title: string; body: string; daysAgo: number }[];
  publishedDaysAgo?: number;
};

type DemoCreator = {
  key: string;
  name: string;
  handle: string;
  headline: string;
  bio: string;
  location: string;
  login?: string;
  projects: DemoProject[];
};

const CREATORS: DemoCreator[] = [
  {
    key: "ama",
    name: "Ama Owusu",
    handle: "ama-owusu",
    headline: "Illustrator and character designer",
    location: "Accra, Ghana",
    login: "creator@ipply.demo",
    bio: "Ama draws small characters with big feelings. She spent six years designing packaging before deciding the characters on the boxes deserved stories of their own. (Fictional demonstration creator.)",
    projects: [
      {
        slug: "pip-and-the-lantern-moths",
        title: "Pip & the Lantern Moths",
        category: "CHARACTERS_WORLDS",
        featured: true,
        tagline: "A night-keeper the size of a teacup, and the moths who light the city.",
        logline:
          "When the moths that light Lumen City's rooftops start disappearing, Pip — the smallest night-keeper on record — must learn every lantern's name to bring them home before dawn.",
        overview:
          "Pip is a night-keeper: one of the tiny caretakers who tend the lantern moths that glow above Lumen City while everyone below is asleep. Pip is the smallest keeper anyone can remember, terrible at climbing and brilliant at listening.\n\nEach story follows one night on the rooftops — a moth who is afraid of the dark, a lantern that only lights when someone sings, a storm that blows a whole flock off course. The stories are gentle, funny and quietly about looking after the people (and moths) around you.\n\nThe property was designed from day one to work across picture books, short-form animation and soft goods: every moth has a distinct silhouette and colour so children can collect and name them.",
        world:
          "Lumen City is a hillside city of terracotta roofs, washing lines and water towers. By day it is ordinary. By night, thousands of lantern moths settle on the rooftops and glow, each one a different colour, each with a name only the keepers know.\n\nThe keepers live in the gaps between chimneys and travel by washing line. They keep a great ledger of every moth in the city — the Lantern Book — which Pip is slowly, stubbornly memorising.",
        audience: "Children aged 3–7 and the grown-ups who read to them. Bedtime and quiet-time viewing.",
        formats: ["Picture book series", "Animated shorts (7 min)", "Plush collection", "Bedtime audio stories"],
        genres: ["Gentle adventure", "Bedtime", "Friendship"],
        keyArt: { motif: "orbit", palette: "dusk" },
        aiAssisted: true,
        aiDisclosure:
          "All characters, story and final artwork are drawn by Ama. An AI tool was used to brainstorm moth names and to test colour palettes; no AI-generated imagery appears in the final designs.",
        licensing: ["PLUSH_AND_TOYS", "PUBLISHING", "ANIMATION", "APPAREL", "LIFESTYLE_PRODUCTS"],
        commercialNotes:
          "Most interested in a plush range and a picture-book partner first. Open to an animation conversation once the books are underway.",
        characters: [
          { name: "Pip", role: "Night-keeper", description: "The smallest keeper on record. Can't climb, won't give up, knows 211 moth names and counting." },
          { name: "Ember", role: "Lantern moth", description: "A copper moth who glows brightest when nervous — which is inconvenient, because she is nervous a lot." },
          { name: "Old Wick", role: "Head keeper", description: "Keeper of the Lantern Book. Gruff, kind, and secretly afraid of heights." },
          { name: "The Hush", role: "Weather", description: "A grey fog that rolls in from the harbour and dims every lantern it touches." },
        ],
        updates: [
          { title: "First six moths finalised", body: "Ember, Bram, Teasel, Opal, Fig and Little Lumen now have final turnarounds and colour references. Plush prototypes are next.", daysAgo: 12 },
          { title: "Book one manuscript complete", body: "‘Pip and the Moth Who Was Afraid of the Dark’ is drafted at 640 words, with thumbnails for every spread.", daysAgo: 40 },
        ],
        publishedDaysAgo: 46,
      },
      {
        slug: "night-market-kites",
        title: "Night Market Kites",
        category: "CHARACTERS_WORLDS",
        status: "IN_REVIEW",
        tagline: "Paper kites that come alive above a market that only opens after midnight.",
        logline: "A kite-maker's apprentice discovers that the kites she sells at the midnight market remember everyone who has ever flown them.",
        overview:
          "A companion world to Pip, set across the bay. Each kite has a personality stitched in by the hands that made it. The apprentice, Esi, must find the kite that belonged to her grandmother before the market closes for the season. Submitted for review to demonstrate the moderation flow.",
        world: "A floating night market on the harbour wall, lit by paper lanterns and run by families who have sold there for generations.",
        audience: "Ages 6–10.",
        formats: ["Illustrated chapter book", "Animated special"],
        genres: ["Magical realism", "Family"],
        keyArt: { motif: "grid", palette: "citrus" },
        licensing: ["PUBLISHING", "ANIMATION"],
        characters: [{ name: "Esi", role: "Apprentice kite-maker", description: "Quick hands, quicker temper, and a pocket full of string." }],
      },
    ],
  },
  {
    key: "ines",
    name: "Inês Carvalho",
    handle: "ines-carvalho",
    headline: "Screenwriter",
    location: "Porto, Portugal",
    bio: "Inês writes slow-burn drama about places that are changing faster than the people in them. (Fictional demonstration creator.)",
    projects: [
      {
        slug: "saltglass",
        title: "Saltglass",
        category: "FILM_TV",
        featured: true,
        tagline: "A glassblowing town. A disappearing coast. One last commission.",
        logline:
          "In a coastal town losing a metre of land a year, the last family of glassblowers takes on an impossible commission: a window for a cathedral that will be underwater within a decade.",
        overview:
          "Saltglass is a six-part limited drama about inheritance, craft and what we choose to make when we know it won't last.\n\nThe Abreu family has made glass in Vila do Sal for four generations. The furnace is failing, the sea wall is failing and the youngest daughter, Leonor, has come home from Lisbon to sell the workshop. Then the diocese offers one final commission — and the family must decide whether to spend their last season making something beautiful for a building the sea is already claiming.",
        world:
          "Vila do Sal is a fictional fishing and glassmaking town on the Atlantic coast. Its streets end abruptly where the cliffs have fallen. The workshop sits at the very edge, its furnace visible from the water at night.",
        audience: "Adult drama audiences; prestige streaming and public-service broadcasters.",
        formats: ["Limited series (6 × 50 min)"],
        genres: ["Drama", "Family", "Climate"],
        keyArt: { motif: "horizon", palette: "lagoon" },
        licensing: ["FILM_TV"],
        commercialNotes: "Pilot script and series bible available on request. Seeking a producing partner to option the series.",
        characters: [
          { name: "Leonor Abreu", role: "Lead", description: "An architect who left to build things that last. Came home to close the family business." },
          { name: "Graça Abreu", role: "Matriarch", description: "Seventy-one, still at the furnace every morning. Refuses to discuss the sea." },
          { name: "Father Tomé", role: "Client", description: "The young priest who commissioned the window, and the only person in town who believes in it." },
        ],
        updates: [{ title: "Pilot script locked", body: "Episode one is locked at 54 pages after a table read with local actors.", daysAgo: 21 }],
        publishedDaysAgo: 30,
      },
    ],
  },
  {
    key: "juno",
    name: "Juno Park",
    handle: "juno-park",
    headline: "Songwriter and producer",
    location: "Seoul, South Korea",
    bio: "Juno makes songs that sound like the city at 3am and builds a little world around each record. (Fictional demonstration creator.)",
    projects: [
      {
        slug: "paper-satellites",
        title: "Paper Satellites",
        category: "MUSIC",
        tagline: "A ten-song cycle about a girl who builds satellites out of letters.",
        logline: "A concept album and visual world following Dahye, who folds every letter she never sent into a paper satellite and launches it from her apartment roof.",
        overview:
          "Paper Satellites is a ten-track indie-electronic song cycle. Each song is a letter; each letter becomes a satellite with its own orbit, colour and visual identity.\n\nThe project is built to extend beyond the record: a recurring animated character, a set of collectible satellite designs and a live show staged under a ceiling of hanging paper.",
        world: "A rooftop in Mangwon-dong and the strange, crowded sky above it.",
        audience: "16–30, indie and alt-pop listeners; fans of narrative albums.",
        formats: ["Album (10 tracks)", "Animated music videos", "Live show"],
        genres: ["Indie electronic", "Concept album"],
        keyArt: { motif: "grid", palette: "noir" },
        licensing: ["MUSIC", "ANIMATION", "APPAREL", "COLLECTIBLES", "LIVE_AND_THEATRE"],
        characters: [{ name: "Dahye", role: "Narrator", description: "Twenty-three, works nights at a convenience store, writes letters to everyone she's ever lost touch with." }],
        publishedDaysAgo: 18,
      },
    ],
  },
  {
    key: "rafael",
    name: "Rafael Mendes",
    handle: "rafael-mendes",
    headline: "Composer and lyricist",
    location: "London, United Kingdom",
    bio: "Rafael writes musicals with his long-time collaborator Mira Okafor. (Fictional demonstration creator.)",
    projects: [
      {
        slug: "the-night-ferry",
        title: "The Night Ferry",
        category: "THEATRE",
        featured: true,
        tagline: "A new musical. One crossing. Everyone on board is leaving something behind.",
        logline: "On the last overnight ferry before the route closes forever, twelve strangers cross the North Sea — and a stowaway band plays them home.",
        overview:
          "The Night Ferry is an ensemble musical set over a single overnight crossing. A ship's band that isn't on the manifest plays the passengers through one long night: a couple delivering divorce papers in person, a retired captain making his first trip as a passenger, a teenager running away to a city she's only seen online.\n\nThe score blends folk, brass band and contemporary musical theatre. The staging is built around a single revolving deck.",
        world: "MV Northern Star, a forty-year-old ferry on her final sailing.",
        audience: "Theatre audiences 14+; regional and West End transfer potential.",
        formats: ["Stage musical (2 acts)", "Cast album"],
        genres: ["Musical", "Ensemble", "Romance"],
        keyArt: { motif: "stage", palette: "ember" },
        licensing: ["LIVE_AND_THEATRE", "MUSIC", "FILM_TV"],
        commercialNotes: "Demo recordings of eight songs available. Looking for a commercial producer and a development workshop.",
        characters: [
          { name: "Captain Ilse Brandt", role: "Passenger", description: "Forty years at the helm, first night as a passenger. Can't stop correcting the crew." },
          { name: "Kit", role: "Stowaway bandleader", description: "Plays the cornet, knows every passenger's song before they do." },
          { name: "Maya", role: "Runaway", description: "Seventeen, one rucksack, one plan, no ticket home." },
        ],
        contributors: [
          { name: "Rafael Mendes", role: "Music & lyrics", isRightsHolder: true, shareBps: 5000 },
          { name: "Mira Okafor", role: "Book & lyrics", isRightsHolder: true, shareBps: 5000 },
        ],
        updates: [{ title: "Eight-song demo recorded", body: "Recorded live with a seven-piece band. Available to producers on request.", daysAgo: 9 }],
        publishedDaysAgo: 25,
      },
    ],
  },
  {
    key: "hana",
    name: "Hana Sato",
    handle: "hana-sato",
    headline: "Author",
    location: "Sapporo, Japan",
    bio: "Hana writes middle-grade fiction about curious children and the natural world. (Fictional demonstration creator.)",
    projects: [
      {
        slug: "the-atlas-of-lost-weather",
        title: "The Atlas of Lost Weather",
        category: "BOOKS",
        tagline: "Some weather only happens once. Someone has to write it down.",
        logline: "Eleven-year-old Mio inherits her grandfather's atlas of weather that no longer exists — and discovers that some of it is trying to come back.",
        overview:
          "A middle-grade series about memory, climate and wonder. Each book centres on one ‘lost weather’ from the atlas — the singing snow of Rishiri, the warm fog that smelled of oranges — and Mio's quest to find out why it disappeared.\n\nThe books mix adventure with real meteorology, and every chapter opens with a hand-drawn page from the atlas itself.",
        world: "Present-day Hokkaido, and the pages of an atlas that is slightly more alive than an atlas should be.",
        audience: "Readers aged 8–12; schools and libraries.",
        formats: ["Middle-grade novel series", "Illustrated companion atlas"],
        genres: ["Adventure", "Nature", "Mystery"],
        keyArt: { motif: "tide", palette: "citrus" },
        licensing: ["PUBLISHING", "ANIMATION", "FILM_TV"],
        characters: [
          { name: "Mio Sato", role: "Protagonist", description: "Collects rain in jam jars and labels them by date." },
          { name: "Grandfather Kenji", role: "Atlas keeper", description: "A retired weather-station keeper whose notes fill the margins." },
        ],
        publishedDaysAgo: 14,
      },
    ],
  },
  {
    key: "diego",
    name: "Diego Ramírez",
    handle: "diego-ramirez",
    headline: "Game designer",
    location: "Mexico City, Mexico",
    bio: "Diego runs a two-person game studio making cosy co-op games. (Fictional demonstration creator.)",
    projects: [
      {
        slug: "tidepool-society",
        title: "Tidepool Society",
        category: "GAMES",
        featured: true,
        tagline: "Run a marine research station for very small, very opinionated creatures.",
        logline: "A cosy co-op management game where two to four players run a research station on a rock pool, caring for a society of tiny sea creatures with strong views on everything.",
        overview:
          "Tidepool Society is a co-op game for two to four players. You run a research station perched over a rock pool, studying — and negotiating with — the creatures who live there. The hermit crabs want bigger shells. The anemones have formed a union. The sea slug just wants to be left alone.\n\nEvery tide resets the pool. Every creature remembers what you did last time.",
        world: "A single rock pool on a windy headland, and the ramshackle research station built over it.",
        audience: "Cosy and co-op players, families, 10+.",
        formats: ["PC & console game", "Plush and collectible creatures", "Animated shorts"],
        genres: ["Cosy", "Co-op", "Management"],
        keyArt: { motif: "stack", palette: "mint" },
        licensing: ["GAMES", "PLUSH_AND_TOYS", "COLLECTIBLES", "ANIMATION", "TRADING_CARDS"],
        commercialNotes: "Playable prototype available. Seeking a publisher; also open to a toy partner for the creature line.",
        characters: [
          { name: "Shelby", role: "Hermit crab", description: "Has moved shells eleven times this season. Is not done." },
          { name: "The Anemone Collective", role: "Union", description: "Twelve anemones, one voice, many demands." },
          { name: "Dot", role: "Sea slug", description: "Would like everyone to please stop looking at her." },
        ],
        contributors: [
          { name: "Diego Ramírez", role: "Design & code", isRightsHolder: true },
          { name: "Lucía Ferrer", role: "Art & animation", isRightsHolder: true },
        ],
        updates: [{ title: "Co-op prototype playable", body: "Two-player online co-op is working end to end. Four-player is next.", daysAgo: 6 }],
        publishedDaysAgo: 33,
      },
    ],
  },
  {
    key: "priya",
    name: "Priya Nair",
    handle: "priya-nair",
    headline: "Designer",
    location: "Manchester, United Kingdom",
    bio: "Priya designs characters for brands and is building one of her own. (Fictional demonstration creator.)",
    projects: [
      {
        slug: "odd-objects-club",
        title: "Odd Objects Club",
        category: "ART_DESIGN",
        tagline: "A members' club for the everyday things nobody thanks.",
        logline: "A design-led character brand starring the overlooked objects of everyday life — a nervous kettle, a sock with no partner, a lamp that only works when you're not looking.",
        overview:
          "Odd Objects Club is a character brand built for products first. Each member is an everyday object with a single strong personality trait, drawn in a flat, graphic style that works at every size from an enamel pin to a building mural.\n\nThe club has a membership card, a dress code (there isn't one) and a weekly meeting in the back of a kitchen drawer.",
        world: "The kitchen drawer, the airing cupboard and the shelf above the washing machine.",
        audience: "Design-literate adults 18–35; gift and lifestyle retail.",
        formats: ["Character brand", "Stationery & homeware", "Apparel"],
        genres: ["Humour", "Design"],
        keyArt: { motif: "arch", palette: "blush" },
        licensing: ["APPAREL", "ACCESSORIES", "LIFESTYLE_PRODUCTS", "COLLECTIBLES", "PLUSH_AND_TOYS"],
        characters: [
          { name: "Kettle", role: "Club secretary", description: "Boils over under pressure. Takes minutes anyway." },
          { name: "Odd Sock", role: "Newest member", description: "Still looking for the other one. Optimistic about it." },
        ],
        publishedDaysAgo: 8,
      },
    ],
  },
  {
    key: "lea",
    name: "Léa Fontaine",
    handle: "lea-fontaine",
    headline: "Animator",
    location: "Montréal, Canada",
    bio: "Léa directs short-form animation for preschool audiences. (Fictional demonstration creator.)",
    projects: [
      {
        slug: "momo-builds-a-moon",
        title: "Momo Builds a Moon",
        category: "FILM_TV",
        featured: true,
        tagline: "The moon is missing. Momo has cardboard, tape and a very good plan.",
        logline: "When the moon doesn't rise one night, a determined four-year-old and her toolbox of friends set out to build a new one before bedtime.",
        overview:
          "A preschool animated series about making, mending and trying again. In every episode Momo and her friends — a roll of tape, a pencil and a slightly anxious torch — build something to solve a problem in the sky: a new moon, a spare star, a bridge for a lost cloud.\n\nEach episode ends with a real, simple making activity children can do at home.",
        world: "Momo's bedroom, the back garden and, through the window, a sky that occasionally needs repairs.",
        audience: "Preschool, ages 2–5.",
        formats: ["Animated series (52 × 7 min)", "Activity books", "Toys"],
        genres: ["Preschool", "Making", "Comedy"],
        keyArt: { motif: "bloom", palette: "dawn" },
        licensing: ["ANIMATION", "PUBLISHING", "PLUSH_AND_TOYS", "LIFESTYLE_PRODUCTS"],
        characters: [
          { name: "Momo", role: "Maker", description: "Four years old, owns a hard hat, has never met a problem tape couldn't fix." },
          { name: "Torch", role: "Friend", description: "Afraid of the dark, which is awkward for a torch." },
        ],
        publishedDaysAgo: 4,
      },
    ],
  },
];

async function main() {
  console.log("Removing previous demonstration content…");
  await db.user.deleteMany({ where: { isDemo: true } });
  await db.organization.deleteMany({ where: { isDemo: true } });

  const demoHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const lockedHash = await bcrypt.hash(randomBytes(24).toString("hex"), 12); // non-login demo creators

  const admin = await db.user.create({
    data: { email: "admin@ipply.demo", name: "IPPLY Studio Team", role: "ADMIN", isDemo: true, passwordHash: demoHash },
  });

  const projectIds: Record<string, string> = {};
  for (const c of CREATORS) {
    const user = await db.user.create({
      data: {
        email: c.login ?? `${c.handle}@creators.ipply.demo`,
        name: c.name,
        role: "CREATOR",
        isDemo: true,
        passwordHash: c.login ? demoHash : lockedHash,
        creatorProfile: {
          create: { handle: c.handle, displayName: c.name, headline: c.headline, bio: c.bio, location: c.location },
        },
      },
    });
    for (const p of c.projects) {
      const status = p.status ?? "PUBLISHED";
      const publishedAt = status === "PUBLISHED" ? daysAgo(p.publishedDaysAgo ?? 10) : null;
      const project = await db.project.create({
        data: {
          slug: p.slug,
          ownerId: user.id,
          title: p.title,
          category: p.category,
          status,
          featured: !!p.featured,
          isDemo: true,
          tagline: p.tagline,
          logline: p.logline,
          overview: p.overview,
          world: p.world,
          audience: p.audience,
          formats: p.formats,
          genres: p.genres,
          keyArt: p.keyArt,
          aiAssisted: !!p.aiAssisted,
          aiDisclosure: p.aiDisclosure ?? null,
          rightsStatus: "CREATOR_DECLARED",
          ownershipDeclaredAt: daysAgo((p.publishedDaysAgo ?? 3) + 2),
          licensingCategories: p.licensing,
          commercialNotes: p.commercialNotes ?? null,
          openToLicensing: true,
          openToDevelopment: true,
          submittedAt: status !== "DRAFT" ? daysAgo((p.publishedDaysAgo ?? 1) + 1) : null,
          publishedAt,
          createdAt: daysAgo((p.publishedDaysAgo ?? 2) + 20),
          characters: { create: p.characters.map((ch, i) => ({ ...ch, sortOrder: i })) },
          contributors: {
            create: (p.contributors ?? [{ name: c.name, role: "Creator", isRightsHolder: true, shareBps: 10000 }]).map((ct) => ({
              ...ct,
              userId: ct.name === c.name ? user.id : null,
            })),
          },
          updates: { create: (p.updates ?? []).map((u) => ({ title: u.title, body: u.body, createdAt: daysAgo(u.daysAgo) })) },
          moderation: {
            create: [
              { action: "SUBMITTED", actorId: user.id, createdAt: daysAgo((p.publishedDaysAgo ?? 1) + 1) },
              ...(status === "PUBLISHED" ? [{ action: "APPROVED", actorId: admin.id, createdAt: publishedAt! }] : []),
            ],
          },
        },
      });
      projectIds[p.slug] = project.id;
    }
  }

  // Internal studio pipeline (visible to administrators only)
  await db.studioOpportunity.create({
    data: {
      projectId: projectIds["pip-and-the-lantern-moths"],
      stage: "EVALUATING",
      formats: ["Animated shorts", "Plush range"],
      notes: "Strong silhouettes; collectible structure built in. Discuss short-form pilot once publishing partner is in place. (Demo note.)",
    },
  });
  await db.studioOpportunity.create({
    data: {
      projectId: projectIds["momo-builds-a-moon"],
      stage: "SCOUTED",
      formats: ["Preschool series"],
      notes: "Making-activity hook is distinctive. Watch for audience response. (Demo note.)",
    },
  });

  // A commercial partner organisation with one in-progress enquiry
  const partner = await db.user.create({
    data: {
      email: "partner@ipply.demo",
      name: "Jordan Ellis",
      role: "PARTNER",
      isDemo: true,
      passwordHash: demoHash,
    },
  });
  const org = await db.organization.create({
    data: {
      name: "Northlight Play Co.",
      type: "TOY_AND_CONSUMER_PRODUCTS",
      country: "United Kingdom",
      website: "https://example.com",
      description: "A fictional toy and gift company used to demonstrate the IPPLY partner portal.",
      isDemo: true,
      members: { create: { userId: partner.id, title: "Head of Licensing" } },
    },
  });
  await db.savedProject.createMany({
    data: [
      { userId: partner.id, projectId: projectIds["pip-and-the-lantern-moths"], note: "Plush — strong fit for Q4 gift range" },
      { userId: partner.id, projectId: projectIds["tidepool-society"], note: "Creature line could work as blind-bag collectibles" },
    ],
  });
  const enquiry = await db.enquiry.create({
    data: {
      reference: "IPL-DEMO01",
      projectId: projectIds["pip-and-the-lantern-moths"],
      organizationId: org.id,
      submittedById: partner.id,
      type: "LICENSING",
      categories: ["PLUSH_AND_TOYS"],
      territories: ["United Kingdom & Ireland", "Europe"],
      exclusivity: "EXCLUSIVE",
      termMonths: 36,
      intendedUse:
        "A six-piece plush range (Pip plus five lantern moths) for specialist toy and gift retail, with glow-in-the-dark details on the moths. Target launch for the autumn gifting season.",
      proposedTerms: "Royalty-based licence on wholesale price with an advance against royalties; creator approval of all samples.",
      budgetRange: "To be discussed",
      launchWindow: "Autumn 2027",
      status: "IN_DISCUSSION",
      isDemo: true,
      createdAt: daysAgo(5),
      messages: {
        create: [
          { kind: "EVENT", body: "Enquiry submitted", createdAt: daysAgo(5) },
          {
            authorId: partner.id,
            body: "Hi Ama — we love the moths. We'd start with six pieces and would want you involved in every sample review. Happy to share our design process.",
            createdAt: daysAgo(5),
          },
          { kind: "EVENT", body: "Status changed to In discussion", createdAt: daysAgo(3) },
        ],
      },
    },
  });
  void enquiry;

  console.log("Demo content ready.");
  console.log(`  Admin:    admin@ipply.demo`);
  console.log(`  Creator:  creator@ipply.demo`);
  console.log(`  Partner:  partner@ipply.demo`);
  console.log(`  Password: ${process.env.SEED_DEMO_PASSWORD ? "(from SEED_DEMO_PASSWORD)" : DEMO_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
