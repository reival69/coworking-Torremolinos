import { createClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "@/lib/env";
import type { Plan } from "@/lib/types";

// Se usa en la landing si la base de datos aún no está conectada.
const FALLBACK_PLANS: Plan[] = [
  {
    id: "pase-dia",
    slug: "pase-dia",
    name: "Pase de día",
    description: "Ideal para probar o para nómadas de paso.",
    price_cents: 1500,
    billing_interval: "day",
    features: ["Puesto flexible de 9:00 a 20:00", "Wifi de fibra y café", "Acceso a zona común"],
    sort_order: 1,
    active: true,
  },
  {
    id: "flex",
    slug: "flex",
    name: "Flex",
    description: "Puesto flexible para quien viene varios días a la semana.",
    price_cents: 14900,
    billing_interval: "month",
    features: ["Puesto flexible L–V", "4 h de sala de reuniones al mes", "Taquilla", "Comunidad y eventos"],
    sort_order: 2,
    active: true,
  },
  {
    id: "fijo",
    slug: "fijo",
    name: "Puesto fijo",
    description: "Tu mesa de siempre, lista cuando llegues.",
    price_cents: 21900,
    billing_interval: "month",
    features: ["Mesa fija con acceso 24/7", "8 h de sala de reuniones al mes", "Domiciliación fiscal", "Taquilla y correo"],
    sort_order: 3,
    active: true,
  },
  {
    id: "oficina",
    slug: "oficina",
    name: "Oficina privada",
    description: "Despacho cerrado para equipos de 2 a 4 personas.",
    price_cents: 59000,
    billing_interval: "month",
    features: ["Oficina privada con llave", "Acceso 24/7", "15 h de sala de reuniones al mes", "Domiciliación fiscal"],
    sort_order: 4,
    active: true,
  },
];

export async function getPublicPlans(): Promise<Plan[]> {
  if (!isSupabaseConfigured()) return FALLBACK_PLANS;
  // Cliente anónimo sin cookies: las tarifas son públicas y la landing puede cachearse.
  const supabase = createClient(supabaseUrl(), supabaseAnonKey(), { auth: { persistSession: false } });
  const { data } = await supabase.from("plans").select("*").eq("active", true).order("sort_order");
  return data?.length ? (data as Plan[]) : FALLBACK_PLANS;
}
