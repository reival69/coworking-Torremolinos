import Link from "next/link";
import { MembershipBadge } from "@/components/status-badge";
import { requireMember } from "@/lib/auth";
import { formatBookingRange, formatEuros, SPACE_KIND_LABEL } from "@/lib/format";
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
        <h1 className="font-display text-3xl font-semibold">Hola, {profile.full_name?.split(" ")[0] ?? ""}</h1>
        {plan && (
          <p className="mt-2 flex flex-wrap items-center gap-2 text-ink-soft">
            Plan {plan.name} <MembershipBadge status={profile.membership_status} />
          </p>
        )}
      </div>

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
                    {SPACE_KIND_LABEL[b.space.kind]} · {formatBookingRange(b)} · {formatEuros(b.price_cents)} + IVA
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
