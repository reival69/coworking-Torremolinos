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
