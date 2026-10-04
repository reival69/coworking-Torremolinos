import type { Metadata } from "next";
import { Logo } from "@/components/logo";
import { isSupabaseConfigured } from "@/lib/env";
import { AuthForm } from "./auth-form";

export const metadata: Metadata = { title: "Acceso miembros" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const mode = params.modo === "registro" ? "registro" : "login";
  const plan = typeof params.plan === "string" ? params.plan : undefined;

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="mb-8">
        <Logo />
      </div>
      <div className="card w-full max-w-md">
        <h1 className="mb-1 font-display text-2xl font-semibold">
          {mode === "registro" ? "Hazte miembro" : "Accede a tu cuenta"}
        </h1>
        <p className="mb-6 text-sm text-ink-soft">
          {mode === "registro"
            ? "Crea tu cuenta y te activamos la membresía tras la primera visita."
            : "Reserva salas y puestos, y consulta tus facturas."}
        </p>
        {isSupabaseConfigured() ? (
          <AuthForm mode={mode} plan={plan} />
        ) : (
          <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
            La base de datos aún no está conectada. Configura las variables de Supabase en <code>.env.local</code>.
          </p>
        )}
      </div>
    </main>
  );
}
