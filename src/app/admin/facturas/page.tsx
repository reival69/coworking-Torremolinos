import type { Metadata } from "next";
import { InvoiceBadge } from "@/components/status-badge";
import { requireAdmin } from "@/lib/auth";
import { formatDate, formatEuros } from "@/lib/format";
import type { Invoice, Profile } from "@/lib/types";
import { createInvoice, generateMonthlyInvoices, setInvoiceStatus } from "../actions";

export const metadata: Metadata = { title: "Facturas" };

type Row = Invoice & { member: { full_name: string | null; email: string } };

export default async function AdminInvoicesPage() {
  const { supabase } = await requireAdmin();
  const [{ data: invoices }, { data: members }] = await Promise.all([
    supabase
      .from("invoices")
      .select("*, member:profiles(full_name, email)")
      .order("issued_on", { ascending: false })
      .order("number", { ascending: false })
      .limit(200)
      .returns<Row[]>(),
    supabase.from("profiles").select("id, full_name, email").order("full_name").returns<Pick<Profile, "id" | "full_name" | "email">[]>(),
  ]);

  const pendingTotal = invoices?.filter((i) => i.status === "pending").reduce((sum, i) => sum + i.amount_cents, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold">Facturas</h1>
        <form action={generateMonthlyInvoices}>
          <button className="btn-primary">Generar cuotas del mes</button>
        </form>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="space-y-3">
          <p className="text-sm text-ink-soft">
            Pendiente de cobro: <strong className="text-ink">{formatEuros(pendingTotal)}</strong>
          </p>
          {invoices?.length ? (
            <div className="card overflow-x-auto p-0">
              <table className="w-full text-sm">
                <thead className="bg-sand-deep text-left text-ink-soft">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">Nº</th>
                    <th className="px-4 py-2.5 font-medium">Cliente</th>
                    <th className="px-4 py-2.5 font-medium">Concepto</th>
                    <th className="px-4 py-2.5 font-medium">Vence</th>
                    <th className="px-4 py-2.5 text-right font-medium">Importe</th>
                    <th className="px-4 py-2.5 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="border-t border-line">
                      <td className="px-4 py-2.5 font-mono text-xs">{inv.number}</td>
                      <td className="px-4 py-2.5">{inv.member.full_name ?? inv.member.email}</td>
                      <td className="px-4 py-2.5">{inv.concept}</td>
                      <td className="px-4 py-2.5 whitespace-nowrap">{formatDate(inv.due_on)}</td>
                      <td className="px-4 py-2.5 text-right whitespace-nowrap">{formatEuros(inv.amount_cents)}</td>
                      <td className="px-4 py-2.5">
                        <form action={setInvoiceStatus} className="flex items-center gap-2">
                          <input type="hidden" name="id" value={inv.id} />
                          <InvoiceBadge status={inv.status} />
                          {inv.status === "pending" && (
                            <>
                              <button name="status" value="paid" className="text-xs font-semibold text-emerald-700 hover:underline">
                                Cobrada
                              </button>
                              <button name="status" value="void" className="text-xs font-semibold text-ink-soft hover:underline">
                                Anular
                              </button>
                            </>
                          )}
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="card text-ink-soft">Aún no hay facturas.</p>
          )}
        </section>

        <section className="card h-fit">
          <h2 className="mb-4 font-display text-lg font-semibold">Nueva factura</h2>
          <form action={createInvoice} className="space-y-4">
            <div>
              <label className="label" htmlFor="member_id">
                Cliente
              </label>
              <select className="input" id="member_id" name="member_id" required>
                {members?.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.full_name ?? m.email}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="concept">
                Concepto
              </label>
              <input className="input" id="concept" name="concept" required placeholder="Sala de reuniones 3 h" />
            </div>
            <div>
              <label className="label" htmlFor="amount">
                Importe (€)
              </label>
              <input className="input" id="amount" name="amount" inputMode="decimal" required placeholder="36,00" />
            </div>
            <div>
              <label className="label" htmlFor="due_on">
                Vencimiento
              </label>
              <input className="input" id="due_on" name="due_on" type="date" />
            </div>
            <button className="btn-primary w-full">Crear factura</button>
          </form>
        </section>
      </div>
    </div>
  );
}
