import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/app-shell";
import { ActionForm, Field, TextArea, TextInput } from "@/components/action-form";
import { SubmitButton } from "@/components/form";
import { ButtonLink } from "@/components/ui";
import { updateCreatorProfile } from "@/app/actions/profile";

export default async function ProfilePage() {
  const user = await requireUser(["CREATOR"]);
  const profile = await db.creatorProfile.findUnique({ where: { userId: user.id } });
  return (
    <>
      <PageHeader
        title="Creator profile"
        intro="Shown on your public profile and every project page."
        actions={profile && <ButtonLink href={`/creators/${profile.handle}`} variant="secondary" target="_blank">View public profile ↗</ButtonLink>}
      />
      <div className="card max-w-2xl p-6 sm:p-10">
        <ActionForm action={updateCreatorProfile} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <Field name="displayName" label="Display name">
              <TextInput name="displayName" defaultValue={profile?.displayName ?? user.name} maxLength={80} />
            </Field>
            <Field name="handle" label="Handle" hint="ipply.com/creators/your-handle">
              <TextInput name="handle" defaultValue={profile?.handle ?? ""} maxLength={30} />
            </Field>
          </div>
          <Field name="headline" label="Headline" hint="e.g. Illustrator and character designer">
            <TextInput name="headline" defaultValue={profile?.headline ?? ""} maxLength={120} />
          </Field>
          <Field name="bio" label="Bio">
            <TextArea name="bio" defaultValue={profile?.bio ?? ""} rows={5} maxLength={1200} />
          </Field>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field name="location" label="Location">
              <TextInput name="location" defaultValue={profile?.location ?? ""} maxLength={80} />
            </Field>
            <Field name="website" label="Website">
              <TextInput name="website" type="url" defaultValue={profile?.website ?? ""} placeholder="https://" />
            </Field>
          </div>
          <SubmitButton>Save profile</SubmitButton>
        </ActionForm>
      </div>
    </>
  );
}
