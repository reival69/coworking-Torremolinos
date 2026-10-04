"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireMember } from "@/lib/auth";
import { madridToUtc } from "@/lib/format";
import { OPEN_HOUR, CLOSE_HOUR } from "./config";

export async function createBooking(formData: FormData) {
  const { supabase, profile } = await requireMember();

  const spaceId = String(formData.get("space_id") ?? "");
  const date = String(formData.get("date") ?? "");
  const hour = Number(formData.get("hour"));
  const duration = Number(formData.get("duration") ?? 1);
  const back = `/app/reservas?espacio=${spaceId}&fecha=${date}`;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isInteger(hour) || !Number.isInteger(duration)) {
    redirect(`${back}&error=datos`);
  }
  if (hour < OPEN_HOUR || duration < 1 || hour + duration > CLOSE_HOUR) redirect(`${back}&error=horario`);
  if (profile.membership_status !== "active") redirect(`${back}&error=membresia`);

  const startsAt = madridToUtc(date, hour);
  const endsAt = madridToUtc(date, hour + duration);
  if (startsAt.getTime() <= Date.now()) redirect(`${back}&error=pasado`);

  const { error } = await supabase.from("bookings").insert({
    space_id: spaceId,
    member_id: profile.id,
    starts_at: startsAt.toISOString(),
    ends_at: endsAt.toISOString(),
  });

  // 23P01 = exclusion_violation: el hueco ya está ocupado
  if (error) redirect(`${back}&error=${error.code === "23P01" ? "ocupado" : "desconocido"}`);

  revalidatePath("/app");
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
