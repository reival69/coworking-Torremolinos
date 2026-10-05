import type { Metadata } from "next";
import Link from "next/link";
import { requireMember } from "@/lib/auth";
import {
  addDays,
  formatEuros,
  formatQuantity,
  hasPassed,
  madridToUtc,
  SPACE_KIND_LABEL,
  todayInMadrid,
  TIME_ZONE,
  UNIT_LABEL,
} from "@/lib/format";
import { availableUnits, unitPrice } from "@/lib/pricing";
import type { BookingUnit, Space } from "@/lib/types";
import { createBooking } from "./actions";
import { CLOSE_HOUR, OPEN_HOUR } from "./config";

export const metadata: Metadata = { title: "Reservar" };

const ERRORS: Record<string, string> = {
  datos: "Revisa los datos de la reserva.",
  horario: `Las reservas por horas son entre las ${OPEN_HOUR}:00 y las ${CLOSE_HOUR}:00.`,
  pasado: "No puedes reservar un momento que ya ha pasado.",
  ocupado: "Ese espacio ya está reservado en esas fechas. Elige otras.",
  modalidad: "Este espacio no se alquila en esa modalidad o las fechas no son válidas.",
  desconocido: "No se pudo guardar la reserva. Inténtalo de nuevo.",
};

const MODES: Record<string, BookingUnit> = { hora: "hour", dia: "day", mes: "month" };
const MODE_PARAM: Record<BookingUnit, string> = { hour: "hora", day: "dia", month: "mes" };
const QUANTITIES: Record<BookingUnit, number[]> = {
  hour: [1, 2, 3, 4, 6, 8],
  day: [1, 2, 3, 4, 5, 10, 15, 20],
  month: [1, 2, 3, 6, 12],
};
const CALENDAR_DAYS = 28;

function hourInMadrid(iso: string) {
  return Number(
    new Intl.DateTimeFormat("en-US", { hour: "2-digit", hourCycle: "h23", timeZone: TIME_ZONE }).format(new Date(iso)),
  );
}

function dayLabel(date: string) {
  return new Intl.DateTimeFormat("es-ES", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }).format(
    new Date(`${date}T12:00:00Z`),
  );
}

export default async function ReservasPage({ searchParams }: PageProps<"/app/reservas">) {
  const params = await searchParams;
  const { supabase } = await requireMember();

  const { data: spaces } = await supabase
    .from("spaces")
    .select("*")
    .eq("active", true)
    .order("kind")
    .order("name")
    .returns<Space[]>();
  const bookable = (spaces ?? []).filter((s) => availableUnits(s).length > 0);

  const today = todayInMadrid();
  const date = typeof params.fecha === "string" && params.fecha >= today ? params.fecha : today;
  const space = bookable.find((s) => s.id === params.espacio) ?? bookable[0];
  const units = space ? availableUnits(space) : [];
  const requested = typeof params.modo === "string" ? MODES[params.modo] : undefined;
  const unit: BookingUnit = requested && units.includes(requested) ? requested : (units[0] ?? "hour");
  const price = space ? unitPrice(space, unit) : null;

  // Huecos ocupados: un día (por horas) o las próximas 4 semanas (por días / meses)
  const rangeEnd = unit === "hour" ? addDays(date, 1) : addDays(date, CALENDAR_DAYS);
  const slots: { starts_at: string; ends_at: string }[] = [];
  if (space) {
    const { data } = await supabase.rpc("space_busy_slots", {
      p_space_id: space.id,
      p_from: madridToUtc(date, 0).toISOString(),
      p_to: madridToUtc(rangeEnd, 0).toISOString(),
    });
    slots.push(...((data ?? []) as typeof slots));
  }

  const busyHours = new Set<number>();
  if (unit === "hour") {
    for (const slot of slots) {
      const start = new Date(slot.starts_at) < madridToUtc(date, 0) ? 0 : hourInMadrid(slot.starts_at);
      const end = new Date(slot.ends_at) >= madridToUtc(addDays(date, 1), 0) ? 24 : hourInMadrid(slot.ends_at) || 24;
      for (let h = start; h < end; h++) busyHours.add(h);
    }
  }

  const days = Array.from({ length: CALENDAR_DAYS }, (_, i) => addDays(date, i));
  const dayIsBusy = (d: string) => {
    const from = madridToUtc(d, OPEN_HOUR).getTime();
    const to = madridToUtc(d, CLOSE_HOUR).getTime();
    return slots.some((s) => new Date(s.starts_at).getTime() < to && new Date(s.ends_at).getTime() > from);
  };

  const hours = Array.from({ length: CLOSE_HOUR - OPEN_HOUR }, (_, i) => OPEN_HOUR + i);
  const isPast = (h: number) => hasPassed(madridToUtc(date, h));
  const error = typeof params.error === "string" ? ERRORS[params.error] : undefined;
  const link = (s: Space, u: BookingUnit) => `/app/reservas?espacio=${s.id}&fecha=${date}&modo=${MODE_PARAM[u]}`;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Reservar</h1>

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {params.ok && (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          ¡Reserva confirmada! El coworking te enviará la factura.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {bookable.map((s) => (
          <Link key={s.id} href={link(s, unit)} className={s.id === space?.id ? "btn-primary" : "btn-ghost"}>
            {s.name}
          </Link>
        ))}
      </div>

      {space && price !== null ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <section className="card">
            <div className="mb-5 flex flex-wrap gap-2">
              {units.map((u) => (
                <Link
                  key={u}
                  href={link(space, u)}
                  className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${
                    u === unit ? "border-sea bg-sea text-white" : "border-line bg-card text-ink hover:bg-sand-deep"
                  }`}
                >
                  {UNIT_LABEL[u].mode} · {formatEuros(unitPrice(space, u)!)}
                  {UNIT_LABEL[u].per}
                </Link>
              ))}
            </div>

            <form className="mb-5 flex flex-wrap items-end gap-3">
              <input type="hidden" name="espacio" value={space.id} />
              <input type="hidden" name="modo" value={MODE_PARAM[unit]} />
              <div>
                <label className="label" htmlFor="fecha">
                  {unit === "hour" ? "Día" : "Ver desde"}
                </label>
                <input className="input" type="date" id="fecha" name="fecha" min={today} defaultValue={date} />
              </div>
              <button className="btn-ghost">Ver disponibilidad</button>
            </form>

            <p className="mb-3 text-sm text-ink-soft">
              {SPACE_KIND_LABEL[space.kind]} · hasta {space.capacity} {space.capacity === 1 ? "persona" : "personas"}
              {space.description && ` · ${space.description}`}
            </p>

            {unit === "hour" ? (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                {hours.map((h) => {
                  const taken = busyHours.has(h);
                  const past = isPast(h);
                  return (
                    <div
                      key={h}
                      className={`rounded-xl border px-2 py-3 text-center text-sm ${
                        taken
                          ? "border-terracotta/30 bg-terracotta/10 text-terracotta-dark"
                          : past
                            ? "border-line bg-sand-deep text-ink-soft/60"
                            : "border-sea/30 bg-sea/5 text-sea"
                      }`}
                    >
                      <span className="font-semibold">{h}:00</span>
                      <span className="block text-xs">{taken ? "Ocupado" : past ? "—" : "Libre"}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-7">
                {days.map((d) => {
                  const taken = dayIsBusy(d);
                  return (
                    <div
                      key={d}
                      className={`rounded-xl border px-2 py-3 text-center text-sm ${
                        taken
                          ? "border-terracotta/30 bg-terracotta/10 text-terracotta-dark"
                          : "border-sea/30 bg-sea/5 text-sea"
                      }`}
                    >
                      <span className="font-semibold capitalize">{dayLabel(d)}</span>
                      <span className="block text-xs">{taken ? "Ocupado" : "Libre"}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="card h-fit">
            <h2 className="mb-4 font-display text-lg font-semibold">Nueva reserva</h2>
            <form action={createBooking} className="space-y-4">
              <input type="hidden" name="space_id" value={space.id} />
              <input type="hidden" name="unit" value={unit} />
              {unit === "hour" ? (
                <>
                  <input type="hidden" name="date" value={date} />
                  <div>
                    <label className="label" htmlFor="hour">
                      Hora de inicio
                    </label>
                    <select className="input" id="hour" name="hour" required>
                      {hours
                        .filter((h) => !busyHours.has(h) && !isPast(h))
                        .map((h) => (
                          <option key={h} value={h}>
                            {h}:00
                          </option>
                        ))}
                    </select>
                  </div>
                </>
              ) : (
                <div>
                  <label className="label" htmlFor="date">
                    Primer día
                  </label>
                  <input
                    className="input"
                    type="date"
                    id="date"
                    name="date"
                    min={addDays(today, 1)}
                    defaultValue={date > today ? date : addDays(today, 1)}
                    required
                  />
                </div>
              )}
              <div>
                <label className="label" htmlFor="quantity">
                  Duración
                </label>
                <select className="input" id="quantity" name="quantity" defaultValue="1">
                  {QUANTITIES[unit].map((q) => (
                    <option key={q} value={q}>
                      {formatQuantity(unit, q)} — {formatEuros(price * q)}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-ink-soft">
                {unit === "hour"
                  ? `Horario de ${OPEN_HOUR}:00 a ${CLOSE_HOUR}:00.`
                  : unit === "day"
                    ? `Cada día de ${OPEN_HOUR}:00 a ${CLOSE_HOUR}:00.`
                    : "Desde el primer día, por meses completos."}{" "}
                Precios sin IVA (21%). Pagas por factura, no se cobra nada al reservar.
              </p>
              <button className="btn-primary w-full">Reservar</button>
            </form>
          </section>
        </div>
      ) : (
        <p className="card text-ink-soft">Todavía no hay espacios reservables.</p>
      )}
    </div>
  );
}
