import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { SPACE_KIND_LABEL } from "@/lib/format";
import type { Space } from "@/lib/types";
import { createSpace, updateSpace } from "../actions";

export const metadata: Metadata = { title: "Espacios y precios" };

const euros = (cents: number | null) => (cents ? (cents / 100).toFixed(2).replace(".", ",") : "");

export default async function AdminSpacesPage() {
  const { supabase } = await requireAdmin();
  const { data: spaces } = await supabase.from("spaces").select("*").order("kind").order("name").returns<Space[]>();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Espacios y precios</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Precios en euros, sin IVA. Deja un precio vacío si el espacio no se alquila en esa modalidad.
        </p>
      </div>

      <div className="space-y-3">
        {spaces?.map((s) => (
          <form key={s.id} action={updateSpace} className="card grid gap-3 p-4 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]">
            <input type="hidden" name="id" value={s.id} />
            <div>
              <label className="label" htmlFor={`name-${s.id}`}>
                {SPACE_KIND_LABEL[s.kind]}
              </label>
              <input className="input" id={`name-${s.id}`} name="name" defaultValue={s.name} required />
              <input
                className="input mt-2"
                name="description"
                defaultValue={s.description ?? ""}
                placeholder="Descripción"
                aria-label="Descripción"
              />
            </div>
            <div>
              <label className="label" htmlFor={`cap-${s.id}`}>
                Personas
              </label>
              <input className="input" id={`cap-${s.id}`} name="capacity" type="number" min={1} defaultValue={s.capacity} />
            </div>
            <div>
              <label className="label" htmlFor={`h-${s.id}`}>
                €/hora
              </label>
              <input className="input" id={`h-${s.id}`} name="hourly" inputMode="decimal" defaultValue={euros(s.hourly_price_cents)} />
            </div>
            <div>
              <label className="label" htmlFor={`d-${s.id}`}>
                €/día
              </label>
              <input className="input" id={`d-${s.id}`} name="daily" inputMode="decimal" defaultValue={euros(s.daily_price_cents)} />
            </div>
            <div>
              <label className="label" htmlFor={`m-${s.id}`}>
                €/mes
              </label>
              <input className="input" id={`m-${s.id}`} name="monthly" inputMode="decimal" defaultValue={euros(s.monthly_price_cents)} />
            </div>
            <div className="flex flex-col justify-end gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="active" defaultChecked={s.active} /> Activo
              </label>
              <button className="btn-ghost px-4 py-1.5">Guardar</button>
            </div>
          </form>
        ))}
      </div>

      <form action={createSpace} className="card flex flex-wrap items-end gap-3">
        <div>
          <label className="label" htmlFor="new-name">
            Nuevo espacio
          </label>
          <input className="input" id="new-name" name="name" required placeholder="Oficina 2" />
        </div>
        <div>
          <label className="label" htmlFor="new-kind">
            Tipo
          </label>
          <select className="input" id="new-kind" name="kind" defaultValue="office">
            {Object.entries(SPACE_KIND_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="new-cap">
            Personas
          </label>
          <input className="input w-24" id="new-cap" name="capacity" type="number" min={1} defaultValue={1} />
        </div>
        <button className="btn-primary">Añadir</button>
      </form>
    </div>
  );
}
