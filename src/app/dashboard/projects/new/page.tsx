import type { Metadata } from "next";
import Link from "next/link";
import type { ProjectCategory } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { CATEGORY_BLURBS, CATEGORY_LABELS } from "@/lib/labels";
import { ActionForm, Field, FormError, TextInput } from "@/components/action-form";
import { SubmitButton } from "@/components/form";
import { KeyArt, type KeyArtSpec } from "@/components/key-art";
import { createProject } from "@/app/actions/projects";

export const metadata: Metadata = { title: "New project" };

const ART: Record<ProjectCategory, KeyArtSpec> = {
  CHARACTERS_WORLDS: { motif: "orbit", palette: "dawn" },
  FILM_TV: { motif: "horizon", palette: "dusk" },
  MUSIC: { motif: "grid", palette: "noir" },
  THEATRE: { motif: "stage", palette: "ember" },
  BOOKS: { motif: "tide", palette: "citrus" },
  GAMES: { motif: "stack", palette: "mint" },
  ART_DESIGN: { motif: "arch", palette: "blush" },
};

export default async function NewProjectPage() {
  await requireUser(["CREATOR"]);
  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/dashboard/projects" className="text-sm text-ink-muted hover:text-ink">
        ← Projects
      </Link>
      <p className="eyebrow mt-10">New project</p>
      <h1 className="display mt-3 text-5xl sm:text-6xl">
        Every franchise <span className="italic text-ink-muted">starts with a name.</span>
      </h1>
      <p className="mt-4 max-w-xl text-lg text-ink-muted">
        Choose what you&apos;re making and give it a title. You&apos;ll build out the story, characters and visuals next — everything saves as a
        private draft until you choose to publish.
      </p>
      <ActionForm action={createProject} className="mt-12 space-y-12">
        <fieldset>
          <legend className="field-label text-base">What are you creating?</legend>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {(Object.keys(CATEGORY_LABELS) as ProjectCategory[]).map((c, i) => (
              <label key={c} className="group cursor-pointer">
                <input type="radio" name="category" value={c} defaultChecked={i === 0} className="peer sr-only" />
                <span className="block overflow-hidden rounded-2xl border-2 border-transparent bg-white transition peer-checked:border-ink peer-focus-visible:ring-4 peer-focus-visible:ring-iris-lavender/60">
                  <span className="block h-24 overflow-hidden">
                    <KeyArt spec={ART[c]} seed={c} className="h-full w-full transition duration-500 group-hover:scale-105" />
                  </span>
                  <span className="block p-4">
                    <span className="block font-medium">{CATEGORY_LABELS[c]}</span>
                    <span className="mt-1 block text-xs leading-snug text-ink-muted">{CATEGORY_BLURBS[c]}</span>
                  </span>
                </span>
              </label>
            ))}
          </div>
          <FormError name="category" />
        </fieldset>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field name="title" label="Title" className="sm:col-span-2">
            <TextInput name="title" placeholder="e.g. Pip & the Lantern Moths" className="h-16 text-2xl" maxLength={80} autoFocus />
          </Field>
          <Field name="tagline" label="Tagline" hint="One line that makes people curious. Optional for now." className="sm:col-span-2">
            <TextInput name="tagline" maxLength={120} />
          </Field>
        </div>
        <div className="flex items-center gap-4">
          <SubmitButton size="lg" pendingLabel="Creating…">
            Create draft & continue
          </SubmitButton>
          <p className="text-xs text-ink-muted">Private until you publish. You keep full ownership.</p>
        </div>
      </ActionForm>
    </div>
  );
}
