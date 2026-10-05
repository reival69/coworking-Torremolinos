import type { Metadata } from "next";
import { MembershipBadge } from "@/components/status-badge";
import { requireAdmin } from "@/lib/auth";
import { formatDate, MEMBERSHIP_LABEL } from "@/lib/format";
import type { Plan, Profile } from "@/lib/types";
import { updateMembership } from "./actions";

export const metadata: Metadata = { title: "Clientes" };

export default async function AdminMembersPage() {
  const { supabase } = await requireAdmin();
  const [{ data: members }, { data: plans }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }).returns<Profile[]>(),
    supabase.from("plans").select("*").order("sort_order").returns<Plan[]>(),
  ]);

  const count = (status: Profile["membership_status"]) => members?.filter((m) => m.membership_status === status).length ?? 0;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Clientes</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        {(["active", "pending", "paused"] as const).map((s) => (
          <div key={s} className="card p-5">
            <p className="text-sm text-ink-soft">{MEMBERSHIP_LABEL[s]}</p>
            <p className="font-display text-3xl font-semibold">{count(s)}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {members?.map((m) => (
          <div key={m.id} className="card flex flex-wrap items-center justify-between gap-4 p-4">
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2 font-semibold">
                {m.full_name ?? "Sin nombre"} <MembershipBadge status={m.membership_status} />
                {m.role === "admin" && <span className="badge bg-sea/10 text-sea">Admin</span>}
              </p>
              <p className="truncate text-sm text-ink-soft">
                {m.email}
                {m.phone && ` · ${m.phone}`}
                {m.company && ` · ${m.company}`} · alta {formatDate(m.created_at)}
              </p>
              {m.requested_plan_slug && !m.plan_id && (
                <p className="text-xs text-terracotta">Solicitó: {m.requested_plan_slug}</p>
              )}
            </div>
            <form action={updateMembership} className="flex flex-wrap items-center gap-2">
              <input type="hidden" name="id" value={m.id} />
              <select
                name="plan_id"
                className="input w-auto py-1.5"
                defaultValue={m.plan_id ?? plans?.find((p) => p.slug === m.requested_plan_slug)?.id ?? ""}
              >
                <option value="">Sin plan</option>
                {plans?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <select name="membership_status" className="input w-auto py-1.5" defaultValue={m.membership_status}>
                {Object.entries(MEMBERSHIP_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <button className="btn-ghost px-4 py-1.5">Guardar</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
