import type { Metadata } from "next";
import { InvoiceBadge, MembershipBadge } from "@/components/status-badge";
import { requireMember } from "@/lib/auth";
import { formatDate, formatEuros } from "@/lib/format";
import type { Invoice, Plan } from "@/lib/types";
import { updateProfile } from "./actions";

export const metadata: Metadata = { title: "Mi cuenta" };

export default async function CuentaPage({ searchParams }: PageProps<"/app/cuenta">) {
  const params = await searchParams;
  const { supabase, profile } = await requireMember();

  const [{ data: invoices }, { data: plan }] = await Promise.all([
    supabase
      .from("invoices")
      .select("*")
      .eq("member_id", profile.id)
      .order("issued_on", { ascending: false })
      .returns<Invoice[]>(),
    profile.plan_id
      ? supabase.from("plans").select("*").eq("id", profile.plan_id).single<Plan>()
      : Promise.resolve({ data: null }),
  ]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
      <section className="card h-fit">
        <h1 className="mb-4 font-display text-2xl font-semibold">Mis datos</h1>
        {params.ok && (
          <p className="mb-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">Datos guardados.</p>
        )}
        <form action={updateProfile} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input className="input bg-sand-deep" value={profile.email} disabled />
          </div>
          {(
            [
              ["full_name", "Nombre y apellidos", profile.full_name],
              ["phone", "Teléfono", profile.phone],
              ["company", "Empresa", profile.company],
              ["tax_id", "NIF / CIF (para facturas)", profile.tax_id],
            ] as const
          ).map(([name, label, value]) => (
            <div key={name}>
              <label className="label" htmlFor={name}>
                {label}
              </label>
              <input className="input" id={name} name={name} defaultValue={value ?? ""} />
            </div>
          ))}
          <button className="btn-primary">Guardar</button>
        </form>
      </section>

      <div className="space-y-6">
        <section className="card">
          <h2 className="mb-3 font-display text-xl font-semibold">Membresía</h2>
          <p className="flex flex-wrap items-center gap-2">
            <MembershipBadge status={profile.membership_status} />
            {plan ? (
              <span>
                {plan.name} · {formatEuros(plan.price_cents)}/{plan.billing_interval === "day" ? "día" : "mes"}
              </span>
            ) : (
              <span className="text-ink-soft">Sin plan asignado</span>
            )}
          </p>
        </section>

        <section className="card">
          <h2 className="mb-3 font-display text-xl font-semibold">Facturas</h2>
          {invoices?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-ink-soft">
                  <tr>
                    <th className="py-2 pr-3 font-medium">Nº</th>
                    <th className="py-2 pr-3 font-medium">Concepto</th>
                    <th className="py-2 pr-3 font-medium">Fecha</th>
                    <th className="py-2 pr-3 text-right font-medium">Importe</th>
                    <th className="py-2 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="border-t border-line">
                      <td className="py-2 pr-3 font-mono text-xs">{inv.number}</td>
                      <td className="py-2 pr-3">{inv.concept}</td>
                      <td className="py-2 pr-3 whitespace-nowrap">{formatDate(inv.issued_on)}</td>
                      <td className="py-2 pr-3 text-right whitespace-nowrap">{formatEuros(inv.amount_cents)}</td>
                      <td className="py-2">
                        <InvoiceBadge status={inv.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-ink-soft">Aún no tienes facturas.</p>
          )}
        </section>
      </div>
    </div>
  );
}
