import { describe, expect, it } from "vitest";
import { allowedEnquiryTransitions, canEditProject, canEnquire, canViewProject, publishReadiness } from "@/lib/permissions";

const published = { ownerId: "owner", status: "PUBLISHED" as const, hidden: false };
const commercial = { ...published, openToLicensing: true, openToDevelopment: false, rightsStatus: "CREATOR_DECLARED" as const };
const partner = { id: "p1", role: "PARTNER" as const, organizationId: "org1" };

describe("project visibility", () => {
  it("shows published projects to everyone", () => expect(canViewProject(null, published)).toBe(true));
  it("hides drafts from the public and other users", () => {
    const draft = { ...published, status: "DRAFT" as const };
    expect(canViewProject(null, draft)).toBe(false);
    expect(canViewProject({ id: "x", role: "CREATOR" }, draft)).toBe(false);
    expect(canViewProject({ id: "owner", role: "CREATOR" }, draft)).toBe(true);
    expect(canViewProject({ id: "a", role: "ADMIN" }, draft)).toBe(true);
  });
  it("hides taken-down projects even when published", () => expect(canViewProject(null, { ...published, hidden: true })).toBe(false));
  it("only lets the owner edit (not admins)", () => {
    expect(canEditProject({ id: "owner", role: "CREATOR" }, published)).toBe(true);
    expect(canEditProject({ id: "a", role: "ADMIN" }, published)).toBe(false);
  });
});

describe("enquiries", () => {
  it("requires a partner with an organisation", () => {
    expect(canEnquire(partner, commercial)).toBe(true);
    expect(canEnquire({ ...partner, organizationId: null }, commercial)).toBe(false);
    expect(canEnquire({ id: "c", role: "CREATOR", organizationId: null }, commercial)).toBe(false);
  });
  it("blocks closed, hidden and disputed projects", () => {
    expect(canEnquire(partner, { ...commercial, openToLicensing: false })).toBe(false);
    expect(canEnquire(partner, { ...commercial, hidden: true })).toBe(false);
    expect(canEnquire(partner, { ...commercial, rightsStatus: "DISPUTED" })).toBe(false);
  });
  it("lets partners only withdraw, and closed enquiries go nowhere", () => {
    expect(allowedEnquiryTransitions("partner", "IN_DISCUSSION")).toEqual(["WITHDRAWN"]);
    expect(allowedEnquiryTransitions("creator", "DECLINED")).toEqual([]);
    expect(allowedEnquiryTransitions("partner", "WITHDRAWN")).toEqual([]);
  });
  it("never lets a creator jump straight to agreement", () => {
    expect(allowedEnquiryTransitions("creator", "SUBMITTED")).not.toContain("AGREED_IN_PRINCIPLE");
    expect(allowedEnquiryTransitions("creator", "TERMS_PROPOSED")).toContain("AGREED_IN_PRINCIPLE");
  });
});

describe("publish readiness", () => {
  it("requires logline, overview and ownership declaration", () => {
    const r = publishReadiness({ title: "X", logline: null, overview: "short", ownershipDeclaredAt: null });
    expect(r.ready).toBe(false);
    expect(r.missing).toHaveLength(3);
    expect(publishReadiness({ title: "X", logline: "L", overview: "o".repeat(80), ownershipDeclaredAt: new Date() }).ready).toBe(true);
  });
});
