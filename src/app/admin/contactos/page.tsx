import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { PRODUCTS } from "@/lib/site";
import { setLeadStatus } from "../actions";

export const metadata: Metadata = { title: "Contactos web" };

type Lead = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  interest: string | null;
  message: string | null;
  status: "new" | "contacted" | "won" | "lost";
  created_at: string;
};

const STATUS = {
  new: { label: "Nuevo", style: "bg-terracotta/15 text-terracotta-dark" },
  contacted: { label: "Contactado", style: "bg-sea/10 text-sea" },
  won: { label: "Cliente", style: "bg-emerald-100 text-emerald-800" },
  lost: { label: "Descartado", style: "bg-slate-200 text-slate-700" },
} as const;

const interestLabel = (slug: string | null) =>
  slug === "visita" ? "Visita" : (PRODUCTS.find((p) => p.slug === slug)?.name ?? "—");

export default async function AdminLeadsPage() {
  const { supabase } = await requireAdmin();
  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200)
    .returns<Lead[]>();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Contactos web</h1>
      {leads?.length ? (
        <div className="space-y-3">
          {leads.map((l) => (
            <div key={l.id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="flex flex-wrap items-center gap-2 font-semibold">
                    {l.full_name}
                    <span className={`badge ${STATUS[l.status].style}`}>{STATUS[l.status].label}</span>
                  </p>
                  <p className="text-sm text-ink-soft">
                    <a href={`mailto:${l.email}`} className="hover:text-terracotta">
                      {l.email}
                    </a>
                    {l.phone && ` · ${l.phone}`} · {interestLabel(l.interest)} · {formatDateTime(l.created_at)}
                  </p>
                </div>
                <form action={setLeadStatus} className="flex flex-wrap gap-1.5">
                  <input type="hidden" name="id" value={l.id} />
                  {(Object.keys(STATUS) as Lead["status"][])
                    .filter((s) => s !== l.status)
                    .map((s) => (
                      <button key={s} name="status" value={s} className="btn-ghost px-3 py-1 text-xs">
                        {STATUS[s].label}
                      </button>
                    ))}
                </form>
              </div>
              {l.message && <p className="mt-3 rounded-xl bg-sand px-3 py-2 text-sm whitespace-pre-line">{l.message}</p>}
            </div>
          ))}
        </div>
      ) : (
        <p className="card text-ink-soft">Todavía no hay solicitudes desde la web.</p>
      )}
    </div>
  );
}
