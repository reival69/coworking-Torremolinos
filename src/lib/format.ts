export const TIME_ZONE = "Europe/Madrid";

const euro = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

export function formatEuros(cents: number) {
  return euro.format(cents / 100);
}

export function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("es-ES", { dateStyle: "medium", timeZone: TIME_ZONE }).format(new Date(value));
}

export function formatDateTime(value: string | Date) {
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TIME_ZONE,
  }).format(new Date(value));
}

export function formatTime(value: string | Date) {
  return new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit", timeZone: TIME_ZONE }).format(
    new Date(value),
  );
}

/** Fecha de hoy en Torremolinos como YYYY-MM-DD. */
export function todayInMadrid() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(new Date());
}

export function hasPassed(instant: Date) {
  return instant.getTime() <= Date.now();
}

/** Convierte una fecha (YYYY-MM-DD) y hora local de Madrid a un instante UTC. */
export function madridToUtc(date: string, hour: number) {
  const [y, m, d] = date.split("-").map(Number);
  const guess = new Date(Date.UTC(y, m - 1, d, hour));
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
  }).formatToParts(guess);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const asMadrid = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"));
  return new Date(guess.getTime() - (asMadrid - guess.getTime()));
}

/** Suma días a una fecha YYYY-MM-DD. */
export function addDays(date: string, days: number) {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** Suma meses a una fecha YYYY-MM-DD; si el día no existe usa el último del mes (igual que Postgres). */
export function addMonths(date: string, months: number) {
  const [y, m, d] = date.split("-").map(Number);
  const lastDay = new Date(Date.UTC(y, m - 1 + months + 1, 0)).getUTCDate();
  return new Date(Date.UTC(y, m - 1 + months, Math.min(d, lastDay))).toISOString().slice(0, 10);
}

export const VAT_RATE = 0.21;

export function withVat(cents: number) {
  return Math.round(cents * (1 + VAT_RATE));
}

export const UNIT_LABEL = {
  hour: { one: "hora", many: "horas", mode: "Por horas", per: "/h" },
  day: { one: "día", many: "días", mode: "Por días", per: "/día" },
  month: { one: "mes", many: "meses", mode: "Por meses", per: "/mes" },
} as const;

export function formatQuantity(unit: keyof typeof UNIT_LABEL, quantity: number) {
  return `${quantity} ${quantity === 1 ? UNIT_LABEL[unit].one : UNIT_LABEL[unit].many}`;
}

/** "lun 6 oct 10:00–12:00" por horas; "6 oct 2026 → 8 oct 2026 (3 días)" por días o meses. */
export function formatBookingRange(b: { starts_at: string; ends_at: string; unit: keyof typeof UNIT_LABEL; quantity: number }) {
  if (b.unit === "hour") return `${formatDateTime(b.starts_at)}–${formatTime(b.ends_at)}`;
  const lastDay = b.unit === "month" ? new Date(new Date(b.ends_at).getTime() - 24 * 3600 * 1000) : b.ends_at;
  return `${formatDate(b.starts_at)} → ${formatDate(lastDay)} (${formatQuantity(b.unit, b.quantity)})`;
}

export const SPACE_KIND_LABEL = {
  desk: "Puesto",
  meeting_room: "Sala de reuniones",
  office: "Oficina",
} as const;

export const MEMBERSHIP_LABEL = {
  pending: "Pendiente",
  active: "Activa",
  paused: "Pausada",
  cancelled: "Cancelada",
} as const;

export const INVOICE_STATUS_LABEL = {
  pending: "Pendiente",
  paid: "Pagada",
  void: "Anulada",
} as const;
