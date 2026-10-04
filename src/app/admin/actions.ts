"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import type { MembershipStatus } from "@/lib/types";

const STATUSES: MembershipStatus[] = ["pending", "active", "paused", "cancelled"];

export async function updateMembership(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const planId = String(formData.get("plan_id") ?? "") || null;
  const status = String(formData.get("membership_status") ?? "") as MembershipStatus;
  if (!STATUSES.includes(status)) return;

  await supabase.from("profiles").update({ plan_id: planId, membership_status: status }).eq("id", id);
  revalidatePath("/admin");
}

export async function createInvoice(formData: FormData) {
  const { supabase } = await requireAdmin();
  const memberId = String(formData.get("member_id") ?? "");
  const concept = String(formData.get("concept") ?? "").trim();
  const amount = Number(String(formData.get("amount") ?? "").replace(",", "."));
  const dueOn = String(formData.get("due_on") ?? "") || undefined;
  if (!memberId || !concept || !Number.isFinite(amount) || amount < 0) return;

  await supabase.from("invoices").insert({
    member_id: memberId,
    concept,
    amount_cents: Math.round(amount * 100),
    ...(dueOn ? { due_on: dueOn } : {}),
  });
  revalidatePath("/admin/facturas");
}

export async function setInvoiceStatus(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!["pending", "paid", "void"].includes(status)) return;

  await supabase
    .from("invoices")
    .update({ status, paid_at: status === "paid" ? new Date().toISOString() : null })
    .eq("id", id);
  revalidatePath("/admin/facturas");
}

/** Genera la cuota mensual de todos los miembros activos con plan mensual. */
export async function generateMonthlyInvoices() {
  const { supabase } = await requireAdmin();
  const month = new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric", timeZone: "Europe/Madrid" }).format(
    new Date(),
  );

  const { data: members } = await supabase
    .from("profiles")
    .select("id, plan:plans(name, price_cents, billing_interval)")
    .eq("membership_status", "active")
    .not("plan_id", "is", null)
    .returns<{ id: string; plan: { name: string; price_cents: number; billing_interval: string } | null }[]>();

  const rows = (members ?? [])
    .filter((m) => m.plan?.billing_interval === "month")
    .map((m) => ({ member_id: m.id, concept: `Cuota ${m.plan!.name} — ${month}`, amount_cents: m.plan!.price_cents }));

  if (rows.length) {
    // Evita duplicar la cuota del mes si ya se generó
    const { data: existing } = await supabase
      .from("invoices")
      .select("member_id, concept")
      .in(
        "concept",
        rows.map((r) => r.concept),
      );
    const done = new Set((existing ?? []).map((e) => `${e.member_id}|${e.concept}`));
    const pending = rows.filter((r) => !done.has(`${r.member_id}|${r.concept}`));
    if (pending.length) await supabase.from("invoices").insert(pending);
  }
  revalidatePath("/admin/facturas");
}
