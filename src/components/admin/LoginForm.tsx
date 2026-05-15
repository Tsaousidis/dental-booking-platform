"use client";

import { LockKeyhole, Mail } from "lucide-react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { login, type LoginState } from "@/app/admin/login/actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction] = useActionState(login, initialState);

  return (
    <form action={formAction} className="mt-8 grid gap-4">
      <label className="grid gap-2 text-sm font-medium">
        Email
        <span className="flex min-h-12 items-center gap-3 border border-line bg-background px-4">
          <Mail size={18} className="text-accent" aria-hidden="true" />
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full bg-transparent text-base outline-none"
            placeholder="doctor@example.com"
          />
        </span>
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Κωδικός
        <span className="flex min-h-12 items-center gap-3 border border-line bg-background px-4">
          <LockKeyhole size={18} className="text-accent" aria-hidden="true" />
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full bg-transparent text-base outline-none"
            placeholder="••••••••"
          />
        </span>
      </label>

      {state.message ? (
        <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.message}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-12 bg-foreground px-5 text-sm font-semibold text-background transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Γίνεται σύνδεση..." : "Σύνδεση"}
    </button>
  );
}
