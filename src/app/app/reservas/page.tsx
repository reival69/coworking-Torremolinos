import type { Metadata } from "next";
import Link from "next/link";
import { requireMember } from "@/lib/auth";
import { formatEuros, hasPassed, madridToUtc, SPACE_KIND_LABEL, todayInMadrid, TIME_ZONE } from "@/lib/format";
import type { Space } from "@/lib/types";
import { createBooking } from "./actions";
import { CLOSE_HOUR, OPEN_HOUR } from "./config";

export const metadata: Metadata = { title: "Reservar" };

const ERRORS: Record<string, string> = {
  datos: "Revisa los datos de la reserva.",
  horario: `Las reservas son entre las ${OPEN_HOUR}:00 y las ${CLOSE_HOUR}:00.`,
  membresia: "Tu membresía no está activa todavía.",
  pasado: "No puedes reservar una hora que ya ha pasado.",
  ocupado: "Ese hueco ya está ocupado. Elige otra hora.",
  desconocido: "No se pudo guardar la reserva. Inténtalo de nuevo.",
};

function hourInMadrid(iso: string) {
  return Number(
    new Intl.DateTimeFormat("en-US", { hour: "2-digit", hourCycle: "h23", timeZone: TIME_ZONE }).format(new Date(iso)),
  );
}

export default async function ReservasPage({ searchParams }: PageProps<"/app/reservas">) {
  const params = await searchParams;
  const { supabase, profile } = await requireMember();

  const { data: spaces } = await supabase
    .from("spaces")
    .select("*")
    .eq("active", true)
    .neq("kind", "office")
    .order("kind")
    .order("name")
    .returns<Space[]>();

  const today = todayInMadrid();
  const date = typeof params.fecha === "string" && params.fecha >= today ? params.fecha : today;
  const space = spaces?.find((s) => s.id === params.espacio) ?? spaces?.[0];

  const busy = new Set<number>();
  if (space) {
    const { data } = await supabase.rpc("space_busy_slots", {
      p_space_id: space.id,
      p_from: madridToUtc(date, 0).toISOString(),
      p_to: madridToUtc(date, 24).toISOString(),
    });
    for (const slot of (data ?? []) as { starts_at: string; ends_at: string }[]) {
      const end = hourInMadrid(slot.ends_at) || 24;
      for (let h = hourInMadrid(slot.starts_at); h < end; h++) busy.add(h);
    }
  }

  const hours = Array.from({ length: CLOSE_HOUR - OPEN_HOUR }, (_, i) => OPEN_HOUR + i);
  const isPast = (h: number) => hasPassed(madridToUtc(date, h));
  const error = typeof params.error === "string" ? ERRORS[params.error] : undefined;
  const canBook = profile.membership_status === "active";

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Reservar</h1>

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {params.ok && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">¡Reserva confirmada!</p>}
      {!canBook && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Tu membresía aún no está activa; puedes consultar la disponibilidad pero no reservar.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {spaces?.map((s) => (
          <Link
            key={s.id}
            href={`/app/reservas?espacio=${s.id}&fecha=${date}`}
            className={s.id === space?.id ? "btn-primary" : "btn-ghost"}
          >
            {s.name}
          </Link>
        ))}
      </div>

      {space ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <section className="card">
            <form className="mb-5 flex flex-wrap items-end gap-3">
              <input type="hidden" name="espacio" value={space.id} />
              <div>
                <label className="label" htmlFor="fecha">
                  Día
                </label>
                <input className="input" type="date" id="fecha" name="fecha" min={today} defaultValue={date} />
              </div>
              <button className="btn-ghost">Ver día</button>
            </form>
            <p className="mb-3 text-sm text-ink-soft">
              {SPACE_KIND_LABEL[space.kind]} · hasta {space.capacity} personas
              {space.hourly_price_cents > 0 && ` · ${formatEuros(space.hourly_price_cents)}/h fuera de plan`}
            </p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
              {hours.map((h) => {
                const taken = busy.has(h);
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
          </section>

          <section className="card h-fit">
            <h2 className="mb-4 font-display text-lg font-semibold">Nueva reserva</h2>
            <form action={createBooking} className="space-y-4">
              <input type="hidden" name="space_id" value={space.id} />
              <input type="hidden" name="date" value={date} />
              <div>
                <label className="label" htmlFor="hour">
                  Hora de inicio
                </label>
                <select className="input" id="hour" name="hour" required>
                  {hours
                    .filter((h) => !busy.has(h) && !isPast(h))
                    .map((h) => (
                      <option key={h} value={h}>
                        {h}:00
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="duration">
                  Duración
                </label>
                <select className="input" id="duration" name="duration" defaultValue="1">
                  {[1, 2, 3, 4, 6, 8].map((d) => (
                    <option key={d} value={d}>
                      {d} {d === 1 ? "hora" : "horas"}
                    </option>
                  ))}
                </select>
              </div>
              <button className="btn-primary w-full" disabled={!canBook}>
                Reservar
              </button>
            </form>
          </section>
        </div>
      ) : (
        <p className="card text-ink-soft">Todavía no hay espacios reservables.</p>
      )}
    </div>
  );
}
