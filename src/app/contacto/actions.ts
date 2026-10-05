"use server";

import { createClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "@/lib/env";

export type LeadState = { ok?: boolean; error?: string };

export async function submitLead(_prev: LeadState, formData: FormData): Promise<LeadState> {
  // Campo trampa: los humanos no lo ven, los bots lo rellenan
  if (formData.get("website")) return { ok: true };

  const text = (name: string, max: number) => String(formData.get(name) ?? "").trim().slice(0, max);
  const fullName = text("full_name", 120);
  const email = text("email", 200);
  if (!fullName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Indica tu nombre y un email válido." };
  }
  if (!isSupabaseConfigured()) return { error: "El formulario aún no está activo. Inténtalo más tarde." };

  const supabase = createClient(supabaseUrl(), supabaseAnonKey(), { auth: { persistSession: false } });
  const { error } = await supabase.from("leads").insert({
    full_name: fullName,
    email,
    phone: text("phone", 40) || null,
    interest: text("interest", 60) || null,
    message: text("message", 2000) || null,
  });
  if (error) return { error: "No se pudo enviar. Inténtalo de nuevo en unos minutos." };

  return { ok: true };
}
