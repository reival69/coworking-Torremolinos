"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { formatBookingRange, formatEuros, withVat } from "@/lib/format";
import type { Booking, MembershipStatus, Space } from "@/lib/types";

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

export async function setLeadStatus(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!["new", "contacted", "won", "lost"].includes(status)) return;

  await supabase.from("leads").update({ status }).eq("id", id);
  revalidatePath("/admin/contactos");
}

/** Crea la factura de una reserva (precio + IVA 21%) y la deja enlazada. */
export async function invoiceBooking(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");

  const { data: booking } = await supabase
    .from("bookings")
    .select("*, space:spaces(name)")
    .eq("id", id)
    .is("invoice_id", null)
    .single<Booking & { space: Pick<Space, "name"> }>();
  if (!booking || booking.status !== "confirmed") return;

  const { data: invoice } = await supabase
    .from("invoices")
    .insert({
      member_id: booking.member_id,
      concept: `${booking.space.name} — ${formatBookingRange(booking)} (base ${formatEuros(booking.price_cents)} + IVA 21%)`,
      amount_cents: withVat(booking.price_cents),
    })
    .select("id")
    .single();
  if (invoice) await supabase.from("bookings").update({ invoice_id: invoice.id }).eq("id", booking.id);

  revalidatePath("/admin/reservas");
  revalidatePath("/admin/facturas");
}

function euroInputToCents(value: FormDataEntryValue | null): number | null {
  const text = String(value ?? "").trim().replace(",", ".");
  if (!text) return null;
  const amount = Number(text);
  return Number.isFinite(amount) && amount > 0 ? Math.round(amount * 100) : null;
}

export async function updateSpace(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const capacity = Number(formData.get("capacity"));
  if (!name || !Number.isInteger(capacity) || capacity < 1) return;

  await supabase
    .from("spaces")
    .update({
      name,
      capacity,
      description: String(formData.get("description") ?? "").trim() || null,
      hourly_price_cents: euroInputToCents(formData.get("hourly")) ?? 0,
      daily_price_cents: euroInputToCents(formData.get("daily")),
      monthly_price_cents: euroInputToCents(formData.get("monthly")),
      active: formData.get("active") === "on",
    })
    .eq("id", id);
  revalidatePath("/admin/espacios");
  revalidatePath("/app/reservas");
  revalidatePath("/");
}

export async function createSpace(formData: FormData) {
  const { supabase } = await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const kind = String(formData.get("kind") ?? "");
  const capacity = Number(formData.get("capacity") ?? 1);
  if (!name || !["desk", "meeting_room", "office"].includes(kind) || !Number.isInteger(capacity) || capacity < 1) return;

  await supabase.from("spaces").insert({ name, kind, capacity });
  revalidatePath("/admin/espacios");
}
