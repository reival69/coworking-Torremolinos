import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { formatBookingRange, formatEuros, withVat } from "@/lib/format";
import type { Booking } from "@/lib/types";
import { cancelBooking } from "../../app/reservas/actions";
import { invoiceBooking } from "../actions";

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

  const toInvoice = bookings?.filter((b) => !b.invoice_id).length ?? 0;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Próximas reservas</h1>
      {toInvoice > 0 && (
        <p className="text-sm text-ink-soft">
          Sin facturar: <strong className="text-ink">{toInvoice}</strong>. Al facturar se crea la factura con el IVA (21%)
          incluido y aparece en Facturas y en la cuenta del cliente.
        </p>
      )}
      {bookings?.length ? (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-sand-deep text-left text-ink-soft">
              <tr>
                <th className="px-4 py-2.5 font-medium">Cuándo</th>
                <th className="px-4 py-2.5 font-medium">Espacio</th>
                <th className="px-4 py-2.5 font-medium">Cliente</th>
                <th className="px-4 py-2.5 text-right font-medium">Precio</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-t border-line">
                  <td className="px-4 py-2.5 whitespace-nowrap">{formatBookingRange(b)}</td>
                  <td className="px-4 py-2.5">{b.space.name}</td>
                  <td className="px-4 py-2.5">{b.member.full_name ?? b.member.email}</td>
                  <td className="px-4 py-2.5 text-right whitespace-nowrap">
                    {formatEuros(b.price_cents)}
                    <span className="block text-xs text-ink-soft">{formatEuros(withVat(b.price_cents))} con IVA</span>
                  </td>
                  <td className="px-4 py-2.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-3">
                      {b.invoice_id ? (
                        <span className="badge bg-emerald-100 text-emerald-800">Facturada</span>
                      ) : (
                        <form action={invoiceBooking}>
                          <input type="hidden" name="id" value={b.id} />
                          <button className="text-sm font-semibold text-sea hover:underline">Facturar</button>
                        </form>
                      )}
                      <form action={cancelBooking}>
                        <input type="hidden" name="id" value={b.id} />
                        <button className="text-sm font-semibold text-red-700 hover:underline">Cancelar</button>
                      </form>
                    </div>
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
