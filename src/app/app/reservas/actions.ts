"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireMember } from "@/lib/auth";
import { addDays, addMonths, madridToUtc } from "@/lib/format";
import type { BookingUnit } from "@/lib/types";
import { OPEN_HOUR, CLOSE_HOUR } from "./config";

const UNITS: BookingUnit[] = ["hour", "day", "month"];
const MODE_PARAM: Record<BookingUnit, string> = { hour: "hora", day: "dia", month: "mes" };

export async function createBooking(formData: FormData) {
  const { supabase, profile } = await requireMember();

  const spaceId = String(formData.get("space_id") ?? "");
  const date = String(formData.get("date") ?? "");
  const unit = String(formData.get("unit") ?? "hour") as BookingUnit;
  const quantity = Number(formData.get("quantity") ?? 1);
  const hour = Number(formData.get("hour") ?? OPEN_HOUR);
  const back = `/app/reservas?espacio=${spaceId}&fecha=${date}&modo=${MODE_PARAM[unit] ?? "hora"}`;

  if (
    !UNITS.includes(unit) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    !Number.isInteger(hour)
  ) {
    redirect(`${back}&error=datos`);
  }

  let startsAt: Date;
  let endsAt: Date;
  if (unit === "hour") {
    if (hour < OPEN_HOUR || hour + quantity > CLOSE_HOUR) redirect(`${back}&error=horario`);
    startsAt = madridToUtc(date, hour);
    endsAt = madridToUtc(date, hour + quantity);
  } else if (unit === "day") {
    if (quantity > 31) redirect(`${back}&error=datos`);
    startsAt = madridToUtc(date, OPEN_HOUR);
    endsAt = madridToUtc(addDays(date, quantity - 1), CLOSE_HOUR);
  } else {
    if (quantity > 12) redirect(`${back}&error=datos`);
    startsAt = madridToUtc(date, OPEN_HOUR);
    endsAt = madridToUtc(addMonths(date, quantity), OPEN_HOUR);
  }
  if (startsAt.getTime() <= Date.now()) redirect(`${back}&error=pasado`);

  // El precio lo calcula la base de datos (trigger prepare_booking)
  const { error } = await supabase.from("bookings").insert({
    space_id: spaceId,
    member_id: profile.id,
    starts_at: startsAt.toISOString(),
    ends_at: endsAt.toISOString(),
    unit,
    quantity,
  });

  // 23P01 = exclusion_violation: el hueco ya está ocupado; P0001 = validación del trigger
  if (error) {
    const code = error.code === "23P01" ? "ocupado" : error.code === "P0001" ? "modalidad" : "desconocido";
    redirect(`${back}&error=${code}`);
  }

  revalidatePath("/app");
  revalidatePath("/admin/reservas");
  redirect(`${back}&ok=1`);
}

export async function cancelBooking(formData: FormData) {
  const { supabase, profile } = await requireMember();
  const id = String(formData.get("id") ?? "");

  let query = supabase.from("bookings").update({ status: "cancelled" }).eq("id", id);
  if (profile.role !== "admin") query = query.eq("member_id", profile.id);
  await query;

  revalidatePath("/app");
  revalidatePath("/app/reservas");
  revalidatePath("/admin/reservas");
}
