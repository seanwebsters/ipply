import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ORG_TYPE_LABELS } from "@/lib/labels";
import { PageHeader } from "@/components/app-shell";
import { ActionForm, Field, Select, TextArea, TextInput } from "@/components/action-form";
import { SubmitButton } from "@/components/form";
import { updateOrganization } from "@/app/actions/profile";

export default async function OrganisationPage() {
  const user = await requireUser(["PARTNER"]);
  const membership = user.organizationId
    ? await db.organizationMember.findFirst({ where: { userId: user.id, organizationId: user.organizationId }, include: { organization: true } })
    : null;
  const org = membership?.organization;
  return (
    <>
      <PageHeader title="Organisation profile" intro="Creators see this when you send an enquiry. A complete, specific profile gets better responses." />
      <div className="card max-w-2xl p-6 sm:p-10">
        <ActionForm action={updateOrganization} className="space-y-6">
          <Field name="name" label="Organisation name">
            <TextInput name="name" defaultValue={org?.name ?? ""} maxLength={120} />
          </Field>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field name="type" label="Type">
              <Select name="type" defaultValue={org?.type ?? "OTHER"}>
                {Object.entries(ORG_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </Select>
            </Field>
            <Field name="country" label="Country">
              <TextInput name="country" defaultValue={org?.country ?? ""} maxLength={80} />
            </Field>
          </div>
          <Field name="website" label="Website">
            <TextInput name="website" type="url" defaultValue={org?.website ?? ""} placeholder="https://" />
          </Field>
          <Field name="description" label="About your organisation" hint="What you make, where you sell, notable work.">
            <TextArea name="description" defaultValue={org?.description ?? ""} rows={5} maxLength={1200} />
          </Field>
          <Field name="title" label="Your role">
            <TextInput name="title" defaultValue={membership?.title ?? ""} placeholder="e.g. Head of Licensing" maxLength={80} />
          </Field>
          <SubmitButton>Save organisation</SubmitButton>
        </ActionForm>
      </div>
    </>
  );
}
