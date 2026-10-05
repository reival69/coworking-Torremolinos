"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn, signUp, type AuthState } from "./actions";

export function AuthForm({ mode, plan }: { mode: "login" | "registro"; plan?: string }) {
  const isSignup = mode === "registro";
  const [state, action, pending] = useActionState<AuthState, FormData>(isSignup ? signUp : signIn, {});

  return (
    <form action={action} className="space-y-4">
      {isSignup && (
        <>
          <div>
            <label className="label" htmlFor="full_name">
              Nombre y apellidos
            </label>
            <input className="input" id="full_name" name="full_name" required autoComplete="name" />
          </div>
          <div>
            <label className="label" htmlFor="phone">
              Teléfono
            </label>
            <input className="input" id="phone" name="phone" type="tel" autoComplete="tel" />
          </div>
          <input type="hidden" name="plan" value={plan ?? ""} />
        </>
      )}
      <div>
        <label className="label" htmlFor="email">
          Email
        </label>
        <input className="input" id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div>
        <label className="label" htmlFor="password">
          Contraseña
        </label>
        <input
          className="input"
          id="password"
          name="password"
          type="password"
          required
          minLength={isSignup ? 8 : undefined}
          autoComplete={isSignup ? "new-password" : "current-password"}
        />
      </div>

      {state.error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      {state.message && <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{state.message}</p>}

      <button className="btn-primary w-full" disabled={pending}>
        {pending ? "Un momento…" : isSignup ? "Crear cuenta" : "Entrar"}
      </button>

      <p className="text-center text-sm text-ink-soft">
        {isSignup ? (
          <>
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="font-semibold text-terracotta">
              Inicia sesión
            </Link>
          </>
        ) : (
          <>
            ¿Aún no tienes cuenta?{" "}
            <Link href="/login?modo=registro" className="font-semibold text-terracotta">
              Regístrate
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
