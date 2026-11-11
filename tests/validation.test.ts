import { describe, expect, it } from "vitest";
import { enquirySchema, projectBasicsSchema, signUpSchema } from "@/lib/validation";
import { safeRedirect, slugify } from "@/lib/utils";

describe("validation", () => {
  it("rejects weak passwords and requires accepting terms", () => {
    const r = signUpSchema.safeParse({ name: "Ann", email: "a@b.co", password: "short", role: "CREATOR" });
    expect(r.success).toBe(false);
  });
  it("cannot sign up as admin", () => {
    const r = signUpSchema.safeParse({ name: "Ann", email: "a@b.co", password: "longenough123", role: "ADMIN", acceptTerms: "on" });
    expect(r.success).toBe(false);
  });
  it("parses genre lists", () => {
    const r = projectBasicsSchema.parse({ title: "Saltglass", category: "FILM_TV", genres: "Drama, Family,  ,Climate" });
    expect(r.genres).toEqual(["Drama", "Family", "Climate"]);
  });
  it("requires the non-binding acknowledgement on enquiries", () => {
    const base = { type: "LICENSING", categories: ["PLUSH_AND_TOYS"], territories: ["Europe"], exclusivity: "EXCLUSIVE", intendedUse: "x".repeat(40) };
    expect(enquirySchema.safeParse(base).success).toBe(false);
    expect(enquirySchema.safeParse({ ...base, acknowledge: "on" }).success).toBe(true);
  });
});

describe("utils", () => {
  it("only allows same-site redirects", () => {
    expect(safeRedirect("/partner")).toBe("/partner");
    expect(safeRedirect("//evil.com")).toBe("/");
    expect(safeRedirect("https://evil.com")).toBe("/");
    expect(safeRedirect("/\\evil.com")).toBe("/");
  });
  it("slugifies titles", () => expect(slugify("Pip & the Lantern Moths!")).toBe("pip-the-lantern-moths"));
});
