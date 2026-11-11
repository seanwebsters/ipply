import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, homeForRole } from "@/lib/auth";
import { safeRedirect } from "@/lib/utils";
import { JoinForm } from "./join-form";

export const metadata: Metadata = { title: "Join IPPLY" };

export default async function JoinPage({ searchParams }: { searchParams: Promise<{ as?: string; next?: string }> }) {
  const { as, next } = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect(homeForRole(user.role));
  return (
    <>
      <h1 className="display text-5xl">Join the world&apos;s studio.</h1>
      <p className="mt-3 text-ink-muted">Free for creators. Your work stays yours.</p>
      <div className="mt-10">
        <JoinForm initialRole={as === "partner" ? "PARTNER" : "CREATOR"} next={safeRedirect(next, "")} />
      </div>
      <p className="mt-8 text-sm text-ink-muted">
        Already have an account?{" "}
        <Link href="/signin" className="font-medium text-ink underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </>
  );
}
