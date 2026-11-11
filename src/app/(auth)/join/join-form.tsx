"use client";

import Link from "next/link";
import { useState } from "react";
import { ActionForm, Field, FormError, Select, TextInput } from "@/components/action-form";
import { SubmitButton } from "@/components/form";
import { signUp } from "@/app/actions/auth";
import { ORG_TYPE_LABELS } from "@/lib/labels";
import { cn } from "@/lib/utils";

export function JoinForm({ initialRole, next }: { initialRole: "CREATOR" | "PARTNER"; next: string }) {
  const [role, setRole] = useState(initialRole);
  return (
    <ActionForm action={signUp} className="space-y-5">
      <input type="hidden" name="next" value={next} />
      <fieldset>
        <legend className="field-label">I&apos;m joining as</legend>
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              ["CREATOR", "A creator", "Create & showcase original IP"],
              ["PARTNER", "An industry partner", "Discover & license IP"],
            ] as const
          ).map(([value, title, body]) => (
            <label key={value} className={cn("cursor-pointer rounded-2xl border p-4 transition", role === value ? "border-ink bg-white ring-4 ring-iris-lavender/40" : "border-paper-line bg-white hover:border-ink/30")}>
              <input type="radio" name="role" value={value} checked={role === value} onChange={() => setRole(value)} className="sr-only" />
              <span className="block font-medium">{title}</span>
              <span className="mt-1 block text-xs text-ink-muted">{body}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <Field name="name" label="Your name">
        <TextInput name="name" autoComplete="name" required />
      </Field>
      {role === "PARTNER" && (
        <div className="grid gap-5 rounded-2xl bg-paper-warm p-4 sm:grid-cols-2">
          <Field name="organizationName" label="Organisation" className="sm:col-span-2">
            <TextInput name="organizationName" autoComplete="organization" />
          </Field>
          <Field name="organizationType" label="Type of organisation" className="sm:col-span-2">
            <Select name="organizationType" defaultValue="">
              <option value="" disabled>
                Choose…
              </option>
              {Object.entries(ORG_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      )}
      <Field name="email" label={role === "PARTNER" ? "Work email" : "Email"}>
        <TextInput name="email" type="email" autoComplete="email" required />
      </Field>
      <Field name="password" label="Password" hint="At least 10 characters.">
        <TextInput name="password" type="password" autoComplete="new-password" required minLength={10} />
      </Field>
      <label className="flex items-start gap-3 text-sm leading-relaxed text-ink-muted">
        <input type="checkbox" name="acceptTerms" className="mt-1 h-4 w-4 accent-ink" />
        <span>
          I agree to the platform terms and have read the{" "}
          <Link href="/principles" target="_blank" className="text-ink underline underline-offset-4">
            creator rights charter
          </Link>
          .
        </span>
      </label>
      <FormError name="acceptTerms" />
      <SubmitButton size="lg" className="w-full" pendingLabel="Creating your account…">
        Create account
      </SubmitButton>
    </ActionForm>
  );
}
