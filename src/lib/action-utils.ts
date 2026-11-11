import type { z } from "zod";
import { toFieldErrors } from "./validation";
import { UserError } from "./errors";
import type { ActionState } from "@/components/action-form";

export function formObject(formData: FormData) {
  const out: Record<string, string> = {};
  for (const [k, v] of formData.entries()) if (typeof v === "string" && !(k in out)) out[k] = v;
  return out;
}

export function parseForm<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown,
): { ok: true; data: z.infer<T> } | { ok: false; state: ActionState } {
  const result = schema.safeParse(data);
  if (result.success) return { ok: true, data: result.data };
  return { ok: false, state: { error: "Please check the highlighted fields.", fieldErrors: toFieldErrors(result.error) } };
}

export function errorState(e: unknown): ActionState {
  // Re-throw Next.js control-flow errors (redirect / notFound)
  if (e && typeof e === "object" && "digest" in e && typeof (e as { digest: unknown }).digest === "string") {
    const d = (e as { digest: string }).digest;
    if (d.startsWith("NEXT_REDIRECT") || d.startsWith("NEXT_HTTP_ERROR_FALLBACK") || d === "NEXT_NOT_FOUND") throw e;
  }
  if (!(e instanceof UserError)) console.error(e);
  return { error: e instanceof UserError ? e.message : "Something went wrong. Please try again." };
}
