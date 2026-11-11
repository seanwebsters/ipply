import { z } from "zod";
import {
  EnquiryStatus,
  EnquiryType,
  Exclusivity,
  LicensingCategory,
  OrganizationType,
  ProjectCategory,
  RightsStatus,
  StudioStage,
} from "@prisma/client";

const trimmed = (max: number) => z.string().trim().max(max);
const optionalText = (max: number) =>
  trimmed(max)
    .optional()
    .transform((v) => (v ? v : null));
const optionalUrl = z
  .string()
  .trim()
  .max(300)
  .optional()
  .transform((v) => (v ? v : null))
  .refine((v) => v === null || /^https?:\/\/[^\s]+$/i.test(v), "Enter a full URL starting with https://");

export const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email address").max(200);
export const passwordSchema = z
  .string()
  .min(10, "Use at least 10 characters")
  .max(200, "That password is too long");

export const signUpSchema = z.object({
  name: trimmed(80).min(2, "Tell us your name"),
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(["CREATOR", "PARTNER"]),
  organizationName: optionalText(120),
  organizationType: z.nativeEnum(OrganizationType).optional(),
  acceptTerms: z.literal("on", { errorMap: () => ({ message: "Please accept the terms to continue" }) }),
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password").max(200),
});

export const creatorProfileSchema = z.object({
  displayName: trimmed(80).min(2),
  handle: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Handles need at least 3 characters")
    .max(30)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens"),
  headline: optionalText(120),
  bio: optionalText(1200),
  location: optionalText(80),
  website: optionalUrl,
});

export const organizationSchema = z.object({
  name: trimmed(120).min(2, "Enter your organisation's name"),
  type: z.nativeEnum(OrganizationType),
  website: optionalUrl,
  country: optionalText(80),
  description: optionalText(1200),
  title: optionalText(80),
});

const listFromText = (maxItems: number, maxLen: number) =>
  z
    .string()
    .optional()
    .transform((v) =>
      (v ?? "")
        .split(/[\n,]/)
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, maxItems)
        .map((s) => s.slice(0, maxLen)),
    );

export const projectBasicsSchema = z.object({
  title: trimmed(80).min(2, "Give your project a title"),
  category: z.nativeEnum(ProjectCategory, { errorMap: () => ({ message: "Choose a category" }) }),
  tagline: optionalText(120),
  logline: optionalText(300),
  genres: listFromText(6, 30),
});

export const projectStorySchema = z.object({
  overview: optionalText(4000),
  world: optionalText(4000),
  audience: optionalText(600),
  formats: listFromText(8, 60),
});

export const characterSchema = z.object({
  name: trimmed(60).min(1, "Name the character"),
  role: optionalText(60),
  description: optionalText(800),
});

export const contributorSchema = z.object({
  name: trimmed(80).min(1, "Enter the contributor's name"),
  role: trimmed(60).min(1, "Describe their role"),
  isRightsHolder: z
    .string()
    .optional()
    .transform((v) => v === "on"),
  sharePercent: z
    .string()
    .optional()
    .transform((v) => (v && v.trim() !== "" ? Number(v) : null))
    .refine((v) => v === null || (Number.isFinite(v) && v >= 0 && v <= 100), "Share must be between 0 and 100"),
});

export const keyArtSchema = z.object({
  motif: z.enum(["orbit", "horizon", "arch", "tide", "grid", "bloom", "stage", "stack"]),
  palette: z.enum(["dawn", "lagoon", "ember", "dusk", "mint", "noir", "blush", "citrus"]),
});

export const projectRightsSchema = z.object({
  declareOwnership: z.literal("on", {
    errorMap: () => ({ message: "Please confirm the ownership declaration" }),
  }),
  aiAssisted: z
    .string()
    .optional()
    .transform((v) => v === "on"),
  aiDisclosure: optionalText(1000),
});

export const projectCommercialSchema = z.object({
  openToLicensing: z
    .string()
    .optional()
    .transform((v) => v === "on"),
  openToDevelopment: z
    .string()
    .optional()
    .transform((v) => v === "on"),
  licensingCategories: z.array(z.nativeEnum(LicensingCategory)).max(13),
  commercialNotes: optionalText(1500),
});

export const projectUpdateSchema = z.object({
  title: trimmed(120).min(2, "Add a headline"),
  body: trimmed(3000).min(2, "Write a short update"),
});

export const enquirySchema = z.object({
  type: z.nativeEnum(EnquiryType),
  categories: z.array(z.nativeEnum(LicensingCategory)).min(1, "Choose at least one category").max(13),
  territories: z.array(z.string().max(60)).min(1, "Choose at least one territory").max(20),
  exclusivity: z.nativeEnum(Exclusivity),
  termMonths: z
    .string()
    .optional()
    .transform((v) => (v && v.trim() !== "" ? Number(v) : null))
    .refine((v) => v === null || (Number.isInteger(v) && v > 0 && v <= 240), "Term must be 1–240 months"),
  intendedUse: trimmed(3000).min(30, "Describe the intended use in a little more detail (30+ characters)"),
  proposedTerms: optionalText(3000),
  budgetRange: optionalText(120),
  launchWindow: optionalText(120),
  acknowledge: z.literal("on", {
    errorMap: () => ({ message: "Please acknowledge that this is an enquiry, not a binding offer" }),
  }),
});

export const enquiryMessageSchema = z.object({
  body: trimmed(4000).min(1, "Write a message"),
});

export const enquiryStatusSchema = z.nativeEnum(EnquiryStatus);
export const rightsStatusSchema = z.nativeEnum(RightsStatus);
export const studioStageSchema = z.nativeEnum(StudioStage);

export type FieldErrors = Record<string, string>;

export function toFieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
