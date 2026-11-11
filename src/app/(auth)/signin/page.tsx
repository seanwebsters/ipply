import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, homeForRole } from "@/lib/auth";
import { safeRedirect } from "@/lib/utils";
import { ActionForm, Field, TextInput } from "@/components/action-form";
import { SubmitButton } from "@/components/form";
import { signIn } from "@/app/actions/auth";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect(safeRedirect(next, homeForRole(user.role)));
  return (
    <>
      <h1 className="display text-5xl">Welcome back.</h1>
      <p className="mt-3 text-ink-muted">Sign in to your IPPLY account.</p>
      <ActionForm action={signIn} className="mt-10 space-y-5">
        <input type="hidden" name="next" value={safeRedirect(next, "")} />
        <Field name="email" label="Email">
          <TextInput name="email" type="email" autoComplete="email" required />
        </Field>
        <Field name="password" label="Password">
          <TextInput name="password" type="password" autoComplete="current-password" required />
        </Field>
        <SubmitButton size="lg" className="w-full" pendingLabel="Signing in…">
          Sign in
        </SubmitButton>
      </ActionForm>
      <p className="mt-8 text-sm text-ink-muted">
        New to IPPLY?{" "}
        <Link href={`/join${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-medium text-ink underline underline-offset-4">
          Create an account
        </Link>
      </p>
      <div className="mt-12 rounded-2xl border border-dashed border-paper-line p-4 text-xs leading-relaxed text-ink-muted">
        <p className="font-medium text-ink">Exploring the demo?</p>
        <p className="mt-1">
          Seeded accounts: <code>creator@ipply.demo</code>, <code>partner@ipply.demo</code> and <code>admin@ipply.demo</code>. The password is set by{" "}
          <code>SEED_DEMO_PASSWORD</code> (see README).
        </p>
      </div>
    </>
  );
}
