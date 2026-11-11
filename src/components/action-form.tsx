"use client";

import { createContext, useActionState, useContext, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ActionState = { error?: string; ok?: string; fieldErrors?: Record<string, string> } | null;
export type FormAction = (state: ActionState, formData: FormData) => Promise<ActionState>;

const ErrorsContext = createContext<Record<string, string>>({});

/** A form bound to a server action, with field-level error reporting. Works without JS via progressive enhancement. */
export function ActionForm({
  action,
  children,
  className,
  id,
  resetOnSuccess,
}: {
  action: FormAction;
  children: ReactNode;
  className?: string;
  id?: string;
  resetOnSuccess?: boolean;
}) {
  const [state, formAction] = useActionState(action, null);
  return (
    <ErrorsContext.Provider value={state?.fieldErrors ?? {}}>
      <form
        id={id}
        action={formAction}
        className={className}
        key={resetOnSuccess && state?.ok ? state.ok + Math.random() : undefined}
        noValidate
      >
        {state?.error && (
          <p role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {state.error}
          </p>
        )}
        {state?.ok && (
          <p role="status" className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            {state.ok}
          </p>
        )}
        {children}
      </form>
    </ErrorsContext.Provider>
  );
}

export function useFieldError(name: string) {
  return useContext(ErrorsContext)[name];
}

export function Field({
  name,
  label,
  hint,
  children,
  className,
}: {
  name: string;
  label: ReactNode;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const error = useFieldError(name);
  return (
    <div className={className}>
      <label htmlFor={name} className="field-label">
        {label}
      </label>
      {children}
      {error ? (
        <p className="field-error" role="alert" id={`${name}-error`}>
          {error}
        </p>
      ) : hint ? (
        <p className="field-hint">{hint}</p>
      ) : null}
    </div>
  );
}

export function TextInput({ name, className, ...rest }: React.ComponentProps<"input"> & { name: string }) {
  const error = useFieldError(name);
  return (
    <input
      id={rest.id ?? name}
      name={name}
      aria-invalid={!!error || undefined}
      aria-describedby={error ? `${name}-error` : undefined}
      className={cn("input", error && "border-rose-300", className)}
      {...rest}
    />
  );
}

export function TextArea({ name, className, ...rest }: React.ComponentProps<"textarea"> & { name: string }) {
  const error = useFieldError(name);
  return (
    <textarea
      id={rest.id ?? name}
      name={name}
      aria-invalid={!!error || undefined}
      aria-describedby={error ? `${name}-error` : undefined}
      className={cn("input min-h-[8rem] resize-y leading-relaxed", error && "border-rose-300", className)}
      {...rest}
    />
  );
}

export function Select({ name, className, children, ...rest }: React.ComponentProps<"select"> & { name: string }) {
  const error = useFieldError(name);
  return (
    <select id={rest.id ?? name} name={name} aria-invalid={!!error || undefined} className={cn("input appearance-none bg-[length:12px] pr-10", error && "border-rose-300", className)} {...rest}>
      {children}
    </select>
  );
}

export function FormError({ name }: { name: string }) {
  const error = useFieldError(name);
  if (!error) return null;
  return (
    <p className="field-error" role="alert">
      {error}
    </p>
  );
}
