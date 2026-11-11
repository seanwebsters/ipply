"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createSession, destroySession, hashPassword, homeForRole, verifyPassword } from "@/lib/auth";
import { formObject, parseForm, errorState } from "@/lib/action-utils";
import { signInSchema, signUpSchema } from "@/lib/validation";
import { randomSuffix, safeRedirect, slugify } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";
import type { ActionState } from "@/components/action-form";

async function uniqueHandle(name: string) {
  const base = slugify(name).slice(0, 24) || "creator";
  for (let i = 0; i < 5; i++) {
    const handle = i === 0 ? base : `${base}-${randomSuffix(4)}`;
    const exists = await db.creatorProfile.findUnique({ where: { handle } });
    if (!exists) return handle;
  }
  return `${base}-${randomSuffix(8)}`;
}

export async function signUp(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseForm(signUpSchema, formObject(formData));
  if (!parsed.ok) return parsed.state;
  const data = parsed.data;
  if (data.role === "PARTNER" && (!data.organizationName || !data.organizationType)) {
    return {
      error: "Tell us about your organisation.",
      fieldErrors: {
        ...(data.organizationName ? {} : { organizationName: "Enter your organisation's name" }),
        ...(data.organizationType ? {} : { organizationType: "Choose a type" }),
      },
    };
  }
  if (!rateLimit(`signup:${data.email}`, 5, 60 * 60 * 1000)) return { error: "Too many attempts. Please try again later." };

  try {
    const existing = await db.user.findUnique({ where: { email: data.email } });
    if (existing) return { error: "An account with that email already exists.", fieldErrors: { email: "Already registered — try signing in" } };

    const passwordHash = await hashPassword(data.password);
    const user = await db.user.create({
      data: {
        email: data.email,
        name: data.name,
        role: data.role,
        passwordHash,
        ...(data.role === "CREATOR"
          ? { creatorProfile: { create: { handle: await uniqueHandle(data.name), displayName: data.name } } }
          : {
              memberships: {
                create: { organization: { create: { name: data.organizationName!, type: data.organizationType! } } },
              },
            }),
      },
    });
    await createSession(user.id);
    const next = safeRedirect(formData.get("next"), "");
    redirect(next || (data.role === "CREATOR" ? "/dashboard?welcome=1" : "/partner?welcome=1"));
  } catch (e) {
    return errorState(e);
  }
}

export async function signIn(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseForm(signInSchema, formObject(formData));
  if (!parsed.ok) return parsed.state;
  const { email, password } = parsed.data;
  if (!rateLimit(`signin:${email}`, 10, 15 * 60 * 1000)) return { error: "Too many attempts. Please wait a few minutes and try again." };

  try {
    const user = await db.user.findUnique({ where: { email } });
    const valid = user ? await verifyPassword(password, user.passwordHash) : false;
    if (!user || !valid) return { error: "That email and password don't match an account." };
    await createSession(user.id);
    const next = safeRedirect(formData.get("next"), "");
    redirect(next || homeForRole(user.role));
  } catch (e) {
    return errorState(e);
  }
}

export async function signOut() {
  await destroySession();
  redirect("/");
}
