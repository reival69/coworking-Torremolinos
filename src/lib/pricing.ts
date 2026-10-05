import type { BookingUnit, Space } from "@/lib/types";

/** Precio por unidad (sin IVA) o null si el espacio no se alquila en esa modalidad. */
export function unitPrice(space: Space, unit: BookingUnit): number | null {
  if (unit === "hour") return space.hourly_price_cents > 0 ? space.hourly_price_cents : null;
  if (unit === "day") return space.daily_price_cents;
  return space.monthly_price_cents;
}

export function availableUnits(space: Space): BookingUnit[] {
  return (["hour", "day", "month"] as const).filter((u) => unitPrice(space, u) !== null);
}
