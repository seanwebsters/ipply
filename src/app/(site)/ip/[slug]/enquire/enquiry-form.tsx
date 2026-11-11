"use client";

import type { LicensingCategory } from "@prisma/client";
import { ActionForm, Field, FormError, Select, TextArea, TextInput, type FormAction } from "@/components/action-form";
import { SubmitButton } from "@/components/form";
import { ENQUIRY_TYPE_LABELS, EXCLUSIVITY_LABELS, LICENSING_LABELS, TERRITORIES } from "@/lib/labels";

export function EnquiryForm({
  action,
  available,
  openToLicensing,
  openToDevelopment,
}: {
  action: FormAction;
  available: LicensingCategory[];
  openToLicensing: boolean;
  openToDevelopment: boolean;
}) {
  const categories = (Object.keys(LICENSING_LABELS) as LicensingCategory[]).sort(
    (a, b) => Number(available.includes(b)) - Number(available.includes(a)),
  );
  return (
    <ActionForm action={action} className="space-y-12">
      <fieldset className="space-y-6">
        <legend className="display mb-2 text-3xl">The opportunity</legend>
        <Field name="type" label="Type of enquiry">
          <Select name="type" defaultValue={openToLicensing ? "LICENSING" : "DEVELOPMENT"}>
            {Object.entries(ENQUIRY_TYPE_LABELS)
              .filter(([k]) => (k === "LICENSING" ? openToLicensing : openToDevelopment || k === "COLLABORATION"))
              .map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
          </Select>
        </Field>
        <div>
          <p className="field-label">Categories</p>
          <p className="field-hint -mt-1 mb-3">Categories the creator has marked as available are listed first.</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <label key={c} className="cursor-pointer">
                <input type="checkbox" name="categories" value={c} className="peer sr-only" />
                <span className="inline-flex items-center gap-1.5 rounded-full border border-paper-line bg-white px-4 py-2 text-sm transition peer-checked:border-ink peer-checked:bg-ink peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-iris-lavender">
                  {LICENSING_LABELS[c]}
                  {available.includes(c) && <span aria-label="available" className="iris-bg h-1.5 w-1.5 rounded-full" />}
                </span>
              </label>
            ))}
          </div>
          <FormError name="categories" />
        </div>
        <Field name="intendedUse" label="Intended use" hint="What would you make, for whom, and how would it reach people?">
          <TextArea name="intendedUse" rows={5} placeholder="e.g. A six-piece plush range for specialist toy and gift retail…" />
        </Field>
      </fieldset>

      <fieldset className="space-y-6">
        <legend className="display mb-2 text-3xl">Scope</legend>
        <div>
          <p className="field-label">Territories</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {TERRITORIES.map((t) => (
              <label key={t} className="cursor-pointer">
                <input type="checkbox" name="territories" value={t} className="peer sr-only" />
                <span className="inline-flex rounded-full border border-paper-line bg-white px-4 py-2 text-sm transition peer-checked:border-ink peer-checked:bg-ink peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-iris-lavender">
                  {t}
                </span>
              </label>
            ))}
          </div>
          <FormError name="territories" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field name="exclusivity" label="Exclusivity">
            <Select name="exclusivity" defaultValue="OPEN_TO_DISCUSSION">
              {Object.entries(EXCLUSIVITY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </Field>
          <Field name="termMonths" label="Proposed term (months)" hint="Optional">
            <TextInput name="termMonths" type="number" min={1} max={240} inputMode="numeric" placeholder="36" />
          </Field>
          <Field name="launchWindow" label="Target launch" hint="Optional">
            <TextInput name="launchWindow" placeholder="e.g. Autumn 2027" />
          </Field>
          <Field name="budgetRange" label="Budget or advance range" hint="Optional — helps creators gauge scale">
            <TextInput name="budgetRange" placeholder="e.g. To be discussed" />
          </Field>
        </div>
        <Field name="proposedTerms" label="Proposed commercial terms" hint="Optional. Royalty structure, advance, approvals — whatever is useful at this stage.">
          <TextArea name="proposedTerms" rows={4} />
        </Field>
      </fieldset>

      <fieldset className="space-y-6">
        <legend className="display mb-2 text-3xl">A note to the creator</legend>
        <Field name="message" label="Message" hint="Optional. Introduce yourself and why you're excited about this project.">
          <TextArea name="message" rows={4} />
        </Field>
        <label className="flex items-start gap-3 rounded-2xl border border-paper-line bg-white p-4 text-sm leading-relaxed">
          <input type="checkbox" name="acknowledge" className="mt-1 h-4 w-4 accent-ink" />
          <span>
            I understand this enquiry is non-binding, that the creator retains all rights unless a separate agreement is signed, and that
            IPPLY has not independently verified ownership unless stated.
          </span>
        </label>
        <FormError name="acknowledge" />
      </fieldset>

      <SubmitButton size="lg" pendingLabel="Sending…">
        Send enquiry
      </SubmitButton>
    </ActionForm>
  );
}
