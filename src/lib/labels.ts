import type {
  EnquiryStatus,
  EnquiryType,
  Exclusivity,
  LicensingCategory,
  OrganizationType,
  ProjectCategory,
  ProjectStatus,
  RightsStatus,
  StudioStage,
} from "@prisma/client";

export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  CHARACTERS_WORLDS: "Characters & Worlds",
  FILM_TV: "Film & TV",
  MUSIC: "Music",
  THEATRE: "Theatre",
  BOOKS: "Books",
  GAMES: "Games",
  ART_DESIGN: "Art & Design",
};

export const CATEGORY_SLUGS: Record<ProjectCategory, string> = {
  CHARACTERS_WORLDS: "characters-worlds",
  FILM_TV: "film-tv",
  MUSIC: "music",
  THEATRE: "theatre",
  BOOKS: "books",
  GAMES: "games",
  ART_DESIGN: "art-design",
};

export const CATEGORY_BLURBS: Record<ProjectCategory, string> = {
  CHARACTERS_WORLDS: "Original characters and the worlds they live in.",
  FILM_TV: "Series, features, shorts and animation.",
  MUSIC: "Songs, albums and the universes around them.",
  THEATRE: "Musicals, plays and live productions.",
  BOOKS: "Picture books, novels and series.",
  GAMES: "Games and interactive experiences.",
  ART_DESIGN: "Art, design and creative brands.",
};

export function categoryFromSlug(slug?: string | null): ProjectCategory | undefined {
  if (!slug) return undefined;
  return (Object.keys(CATEGORY_SLUGS) as ProjectCategory[]).find((c) => CATEGORY_SLUGS[c] === slug);
}

export const LICENSING_LABELS: Record<LicensingCategory, string> = {
  PLUSH_AND_TOYS: "Plush & toys",
  COLLECTIBLES: "Collectibles",
  TRADING_CARDS: "Trading cards",
  PUBLISHING: "Publishing",
  APPAREL: "Apparel",
  ACCESSORIES: "Accessories",
  LIFESTYLE_PRODUCTS: "Lifestyle products",
  ANIMATION: "Animation",
  FILM_TV: "Film & TV",
  GAMES: "Games",
  MUSIC: "Music",
  LIVE_AND_THEATRE: "Live & theatre",
  EXPERIENCES: "Experiences",
};

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  DRAFT: "Draft",
  IN_REVIEW: "In review",
  PUBLISHED: "Published",
  CHANGES_REQUESTED: "Changes requested",
  ARCHIVED: "Archived",
};

export const RIGHTS_LABELS: Record<RightsStatus, { label: string; detail: string }> = {
  CREATOR_DECLARED: {
    label: "Creator-declared",
    detail: "The creator has declared that they own or control the rights. IPPLY has not independently verified this.",
  },
  UNDER_REVIEW: {
    label: "Rights under review",
    detail: "IPPLY is reviewing documentation supplied by the creator. Ownership is not yet verified.",
  },
  VERIFIED: {
    label: "Rights documented",
    detail: "IPPLY has reviewed documentation supporting the creator's ownership. Partners should still complete their own legal due diligence.",
  },
  DISPUTED: {
    label: "Rights disputed",
    detail: "A rights claim on this project is being reviewed. Commercial enquiries are paused.",
  },
};

export const ENQUIRY_TYPE_LABELS: Record<EnquiryType, string> = {
  LICENSING: "Licensing",
  DEVELOPMENT: "Development",
  COLLABORATION: "Collaboration",
  OPTION_OR_ACQUISITION: "Option or acquisition",
};

export const EXCLUSIVITY_LABELS: Record<Exclusivity, string> = {
  EXCLUSIVE: "Exclusive",
  NON_EXCLUSIVE: "Non-exclusive",
  SOLE: "Sole",
  OPEN_TO_DISCUSSION: "Open to discussion",
};

export const ENQUIRY_STATUS_LABELS: Record<EnquiryStatus, string> = {
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under review",
  IN_DISCUSSION: "In discussion",
  TERMS_PROPOSED: "Terms proposed",
  AGREED_IN_PRINCIPLE: "Agreed in principle",
  DECLINED: "Declined",
  WITHDRAWN: "Withdrawn",
};

export const ORG_TYPE_LABELS: Record<OrganizationType, string> = {
  TOY_AND_CONSUMER_PRODUCTS: "Toys & consumer products",
  FILM_AND_TELEVISION: "Film & television",
  ANIMATION_STUDIO: "Animation studio",
  MUSIC: "Music publishing & labels",
  THEATRE: "Theatrical production",
  PUBLISHING: "Book publishing",
  GAMES: "Games",
  FASHION_AND_LIFESTYLE: "Fashion & lifestyle",
  RETAIL: "Retail",
  AGENCY: "Licensing agency",
  OTHER: "Other",
};

export const STUDIO_STAGE_LABELS: Record<StudioStage, string> = {
  SCOUTED: "Scouted",
  EVALUATING: "Evaluating",
  IN_CONVERSATION: "In conversation with creator",
  IN_DEVELOPMENT: "In development",
  PASSED: "Passed",
};

export const TERRITORIES = [
  "Worldwide",
  "North America",
  "Latin America",
  "United Kingdom & Ireland",
  "Europe",
  "Middle East",
  "Africa",
  "India",
  "Greater China",
  "Japan",
  "South Korea",
  "Southeast Asia",
  "Australia & New Zealand",
];

export function labelList<T extends string>(values: T[], map: Record<T, string>) {
  return values.map((v) => map[v]).join(", ");
}
