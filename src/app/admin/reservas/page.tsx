import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { formatDateTime, formatTime } from "@/lib/format";
import type { Booking } from "@/lib/types";
import { cancelBooking } from "../../app/reservas/actions";

export const metadata: Metadata = { title: "Reservas" };

type Row = Booking & { space: { name: string }; member: { full_name: string | null; email: string } };

export default async function AdminBookingsPage() {
  const { supabase } = await requireAdmin();
  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, space:spaces(name), member:profiles(full_name, email)")
    .eq("status", "confirmed")
    .gte("ends_at", new Date().toISOString())
    .order("starts_at")
    .limit(200)
    .returns<Row[]>();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Próximas reservas</h1>
      {bookings?.length ? (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-sand-deep text-left text-ink-soft">
              <tr>
                <th className="px-4 py-2.5 font-medium">Cuándo</th>
                <th className="px-4 py-2.5 font-medium">Espacio</th>
                <th className="px-4 py-2.5 font-medium">Miembro</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-t border-line">
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    {formatDateTime(b.starts_at)}–{formatTime(b.ends_at)}
                  </td>
                  <td className="px-4 py-2.5">{b.space.name}</td>
                  <td className="px-4 py-2.5">{b.member.full_name ?? b.member.email}</td>
                  <td className="px-4 py-2.5 text-right">
                    <form action={cancelBooking}>
                      <input type="hidden" name="id" value={b.id} />
                      <button className="text-sm font-semibold text-red-700 hover:underline">Cancelar</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="card text-ink-soft">No hay reservas próximas.</p>
      )}
    </div>
  );
}
