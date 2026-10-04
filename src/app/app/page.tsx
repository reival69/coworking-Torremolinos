import Link from "next/link";
import { MembershipBadge } from "@/components/status-badge";
import { requireMember } from "@/lib/auth";
import { formatDateTime, formatTime, SPACE_KIND_LABEL } from "@/lib/format";
import type { Booking, Plan, Space } from "@/lib/types";
import { cancelBooking } from "./reservas/actions";

export default async function MemberHome() {
  const { supabase, profile } = await requireMember();

  const [{ data: bookings }, { data: plan }] = await Promise.all([
    supabase
      .from("bookings")
      .select("*, space:spaces(*)")
      .eq("member_id", profile.id)
      .eq("status", "confirmed")
      .gte("ends_at", new Date().toISOString())
      .order("starts_at")
      .limit(10)
      .returns<(Booking & { space: Space })[]>(),
    profile.plan_id
      ? supabase.from("plans").select("*").eq("id", profile.plan_id).single<Plan>()
      : Promise.resolve({ data: null }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold">Hola, {profile.full_name?.split(" ")[0] ?? "miembro"}</h1>
        <p className="mt-2 flex flex-wrap items-center gap-2 text-ink-soft">
          Membresía <MembershipBadge status={profile.membership_status} />
          {plan && <span>· Plan {plan.name}</span>}
        </p>
      </div>

      {profile.membership_status === "pending" && (
        <div className="card border-amber-300 bg-amber-50">
          <p className="font-semibold">Tu membresía está pendiente de activar</p>
          <p className="mt-1 text-sm text-ink-soft">
            Te la activamos en tu primera visita o al confirmar el pago. Mientras tanto no podrás hacer reservas.
          </p>
        </div>
      )}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Próximas reservas</h2>
          <Link href="/app/reservas" className="btn-primary">
            Nueva reserva
          </Link>
        </div>
        {bookings?.length ? (
          <ul className="space-y-3">
            {bookings.map((b) => (
              <li key={b.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-semibold">{b.space.name}</p>
                  <p className="text-sm text-ink-soft">
                    {SPACE_KIND_LABEL[b.space.kind]} · {formatDateTime(b.starts_at)}–{formatTime(b.ends_at)}
                  </p>
                </div>
                <form action={cancelBooking}>
                  <input type="hidden" name="id" value={b.id} />
                  <button className="btn-ghost px-4 py-1.5 text-red-700">Cancelar</button>
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <p className="card text-ink-soft">No tienes reservas próximas.</p>
        )}
      </section>
    </div>
  );
}
