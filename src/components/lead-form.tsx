"use client";

import { useActionState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { submitLead, type LeadState } from "@/app/contacto/actions";
import { PRODUCTS } from "@/lib/site";

export function LeadForm({ defaultInterest }: { defaultInterest?: string }) {
  const [state, action, pending] = useActionState<LeadState, FormData>(submitLead, {});

  if (state.ok) {
    return (
      <div className="flex items-start gap-3 rounded-2xl bg-white/10 p-6">
        <CheckCircle2 className="mt-0.5 size-6 shrink-0 text-terracotta" />
        <div>
          <p className="font-semibold">¡Gracias! Hemos recibido tu solicitud.</p>
          <p className="mt-1 text-sm text-sand/80">Te contestamos en menos de 24 horas laborables.</p>
        </div>
      </div>
    );
  }

  const field = "w-full rounded-xl border border-white/20 bg-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-white/50 outline-none focus:border-white/60";

  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      <input name="full_name" required placeholder="Nombre y apellidos" className={field} autoComplete="name" />
      <input name="email" type="email" required placeholder="Email" className={field} autoComplete="email" />
      <input name="phone" type="tel" placeholder="Teléfono (opcional)" className={field} autoComplete="tel" />
      <select name="interest" defaultValue={defaultInterest ?? ""} className={field}>
        <option value="" className="text-ink">
          ¿Qué te interesa?
        </option>
        {PRODUCTS.map((p) => (
          <option key={p.slug} value={p.slug} className="text-ink">
            {p.name}
          </option>
        ))}
        <option value="visita" className="text-ink">
          Visitar el espacio
        </option>
      </select>
      <textarea
        name="message"
        rows={3}
        placeholder="Cuéntanos qué necesitas: personas, fechas, horario…"
        className={`${field} sm:col-span-2`}
      />
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {state.error && <p className="text-sm text-red-200 sm:col-span-2">{state.error}</p>}
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <button className="btn-primary" disabled={pending}>
          {pending ? "Enviando…" : "Solicitar información"} <ArrowRight className="size-4" />
        </button>
        <p className="text-xs text-sand/60">Solo usaremos tus datos para responder a tu consulta.</p>
      </div>
    </form>
  );
}
