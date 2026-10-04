import Link from "next/link";
import { CalendarCheck, Coffee, MapPin, Sun, Users, Wifi } from "lucide-react";
import { Logo } from "@/components/logo";
import { getPublicPlans } from "@/lib/catalog";
import { formatEuros } from "@/lib/format";

export const revalidate = 3600;

const SERVICES = [
  { icon: Wifi, title: "Fibra de 1 Gb", text: "Conexión estable para videollamadas y despliegues." },
  { icon: Users, title: "Salas de reuniones", text: "Reservables por horas desde la app, con pantalla." },
  { icon: Coffee, title: "Café y cocina", text: "Café de especialidad incluido y office equipado." },
  { icon: Sun, title: "Luz y terraza", text: "Espacio luminoso con terraza a cinco minutos de la playa." },
];

export default async function Home() {
  const plans = await getPublicPlans();

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-line/70 bg-sand/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Logo />
          <nav className="flex items-center gap-2 text-sm">
            <a href="#tarifas" className="hidden px-3 py-2 hover:text-terracotta sm:block">
              Tarifas
            </a>
            <a href="#ubicacion" className="hidden px-3 py-2 hover:text-terracotta sm:block">
              Ubicación
            </a>
            <Link href="/login" className="btn-ghost">
              Acceso miembros
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-[1.2fr_1fr] md:py-24">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-sea">Torremolinos · Málaga</p>
            <h1 className="font-display text-4xl leading-tight font-semibold md:text-6xl">
              Trabaja a un paso del mar.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ink-soft">
              Puestos flexibles, mesas fijas, oficinas privadas y salas de reuniones en el centro de Torremolinos.
              Reserva tu sitio online y gestiona tu membresía desde el móvil.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login?modo=registro" className="btn-primary">
                <CalendarCheck className="size-4" /> Hazte miembro
              </Link>
              <a href="#tarifas" className="btn-ghost">
                Ver tarifas
              </a>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-3xl bg-sea p-8 text-white">
            <div className="absolute -right-16 -bottom-16 size-64 rounded-full bg-terracotta/80" />
            <div className="absolute -top-10 -left-10 size-40 rounded-full bg-white/10" />
            <div className="relative space-y-6">
              <p className="font-display text-2xl">“Wifi rápido, buena luz y la playa para la pausa del café.”</p>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-white/70">Horario</dt>
                  <dd className="font-semibold">L–V 8:00–20:00</dd>
                </div>
                <div>
                  <dt className="text-white/70">Acceso 24/7</dt>
                  <dd className="font-semibold">Puesto fijo y oficina</dd>
                </div>
                <div>
                  <dt className="text-white/70">Salas</dt>
                  <dd className="font-semibold">2 salas de reuniones</dd>
                </div>
                <div>
                  <dt className="text-white/70">Playa</dt>
                  <dd className="font-semibold">A 5 minutos a pie</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        <section className="border-y border-line bg-card">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map(({ icon: Icon, title, text }) => (
              <div key={title}>
                <Icon className="mb-3 size-6 text-terracotta" />
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-ink-soft">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="tarifas" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20">
          <h2 className="font-display text-3xl font-semibold md:text-4xl">Tarifas</h2>
          <p className="mt-3 text-ink-soft">Sin permanencia. IVA no incluido.</p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => {
              const featured = plan.slug === "fijo";
              return (
                <article
                  key={plan.id}
                  className={`card flex flex-col ${featured ? "border-terracotta ring-2 ring-terracotta/20" : ""}`}
                >
                  {featured && <span className="badge mb-3 self-start bg-terracotta text-white">Más elegido</span>}
                  <h3 className="font-display text-xl font-semibold">{plan.name}</h3>
                  <p className="mt-1 text-sm text-ink-soft">{plan.description}</p>
                  <p className="mt-5">
                    <span className="font-display text-3xl font-semibold">{formatEuros(plan.price_cents)}</span>
                    <span className="text-sm text-ink-soft"> / {plan.billing_interval === "day" ? "día" : "mes"}</span>
                  </p>
                  <ul className="mt-5 flex-1 space-y-2 text-sm">
                    {plan.features.map((f) => (
                      <li key={f} className="flex gap-2">
                        <span className="text-terracotta">•</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/login?modo=registro&plan=${plan.slug}`}
                    className={featured ? "btn-primary mt-6" : "btn-ghost mt-6"}
                  >
                    Empezar
                  </Link>
                </article>
              );
            })}
          </div>
        </section>

        <section id="ubicacion" className="scroll-mt-20 bg-ink text-sand">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 md:grid-cols-2">
            <div>
              <h2 className="font-display text-3xl font-semibold">Ven a conocernos</h2>
              <p className="mt-4 text-sand/80">
                Te enseñamos el espacio y te invitamos a un café. Escríbenos y reserva una visita o un día de prueba.
              </p>
            </div>
            <div className="space-y-4 text-sm">
              <p className="flex gap-3">
                <MapPin className="size-5 shrink-0 text-terracotta" />
                Centro de Torremolinos, Málaga (dirección exacta por confirmar)
              </p>
              <p className="flex gap-3">
                <CalendarCheck className="size-5 shrink-0 text-terracotta" />
                Lunes a viernes, 8:00–20:00
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-sm text-ink-soft">
          <span>© {new Date().getFullYear()} Coworking Torremolinos</span>
          <Link href="/login" className="hover:text-terracotta">
            Área de miembros
          </Link>
        </div>
      </footer>
    </>
  );
}
