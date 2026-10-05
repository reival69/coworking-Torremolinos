import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Coffee, Phone, Sparkles, Sun, Users, Wifi } from "lucide-react";
import { LeadForm } from "@/components/lead-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPublicPlans } from "@/lib/catalog";
import { formatEuros } from "@/lib/format";
import { EXTRA_SERVICES, FAQS, PHOTOS, PRODUCTS, SITE } from "@/lib/site";

export const revalidate = 3600;

const VALUES = [
  {
    icon: Users,
    title: "Una comunidad de verdad",
    text: "Freelancers, nómadas digitales y pequeños equipos que comparten algo más que el wifi.",
  },
  {
    icon: Sun,
    title: "A cinco minutos de la playa",
    text: "Trabaja con luz natural y haz la pausa del café frente al Mediterráneo.",
  },
  {
    icon: Wifi,
    title: "Todo incluido",
    text: "Fibra de alta velocidad, café, limpieza, impresión y suministros. Sin sorpresas.",
  },
  {
    icon: Sparkles,
    title: "Flexibilidad total",
    text: "Desde un pase de día hasta tu propia oficina, sin permanencia y cambiando cuando lo necesites.",
  },
];

const BENEFITS = [
  {
    title: "Nos ocupamos de todo para que tú solo trabajes",
    text: "Llegas, te sientas y empiezas. Del mantenimiento, la limpieza y la conexión nos encargamos nosotros.",
    points: [
      "Wifi de fibra y red cableada en cada puesto",
      "Café de especialidad, agua y office equipado",
      "Impresora, escáner y taquillas",
      "Recepción de paquetes y correo",
    ],
    photo: PHOTOS.lounge,
    alt: "Zona de descanso luminosa con sofás",
  },
  {
    title: "Rodéate de gente que suma",
    text: "Trabajar solo no tiene por qué ser trabajar aislado. Organizamos encuentros para que conozcas a otros miembros.",
    points: [
      "Desayunos y afterworks mensuales",
      "Talleres y charlas de los propios miembros",
      "Canal privado de la comunidad",
      "Descuentos en salas para miembros",
    ],
    photo: PHOTOS.community,
    alt: "Personas trabajando juntas alrededor de una mesa",
  },
  {
    title: "Trabaja donde otros vienen de vacaciones",
    text: "Torremolinos combina la calma de la costa con la conexión de Málaga: aeropuerto, Cercanías y playa a un paso.",
    points: [
      "A pocos minutos del aeropuerto de Málaga",
      "Bien comunicado en Cercanías",
      "Restaurantes y paseo marítimo a la vuelta",
      "Ideal para equipos que vienen de fuera",
    ],
    photo: PHOTOS.beach,
    alt: "Playa al atardecer",
  },
];

const DIFFERENCE = [
  "Un espacio para cada presupuesto",
  "Paga solo por lo que usas",
  "Sin permanencia ni fianzas elevadas",
  "Disponible desde mañana mismo",
  "Precios claros, todo incluido",
  "Reserva salas desde el móvil",
];

export default async function Home() {
  const plans = await getPublicPlans();

  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <span className="absolute top-16 left-[8%] hidden size-4 rounded-full bg-terracotta md:block" />
          <span className="absolute top-40 left-[14%] hidden size-3 rounded-full bg-sea/40 md:block" />
          <span className="absolute top-24 right-[10%] hidden size-5 rounded-full bg-terracotta/70 md:block" />
          <span className="absolute top-56 right-[16%] hidden size-3 rounded-full bg-terracotta md:block" />
          <div className="mx-auto max-w-3xl px-4 pt-16 pb-12 text-center md:pt-24">
            <p className="text-xs font-semibold tracking-[0.2em] text-terracotta uppercase">
              Coworking en {SITE.city}
            </p>
            <h1 className="mt-5 font-display text-4xl leading-[1.1] font-semibold md:text-6xl">
              Espacios de trabajo que se adaptan a ti
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-ink-soft">
              Puestos flexibles, mesas fijas, oficinas privadas y salas de reuniones a un paso del mar.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/contacto" className="btn bg-ink text-white hover:bg-ink/85">
                Contáctanos <ArrowUpRight className="size-4" />
              </Link>
              {SITE.phone ? (
                <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="btn-ghost">
                  <Phone className="size-4" /> {SITE.phone}
                </a>
              ) : (
                <Link href="/contacto?interes=visita" className="btn-ghost">
                  Reserva una visita
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Valores sobre banda oscura */}
        <section className="relative">
          <div className="absolute inset-x-0 top-1/2 bottom-0 bg-ink" />
          <div className="relative mx-auto grid max-w-6xl gap-4 px-4 pb-12 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-line bg-card p-6 shadow-sm">
                <span className="grid size-11 place-items-center rounded-xl bg-sand-deep">
                  <Icon className="size-5 text-terracotta" />
                </span>
                <h2 className="mt-4 font-display text-lg leading-snug font-semibold">{title}</h2>
                <p className="mt-2 text-sm text-ink-soft">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Productos */}
        <section id="espacios" className="mx-auto max-w-6xl scroll-mt-32 px-4 py-20">
          <h2 className="max-w-2xl font-display text-3xl leading-tight font-semibold md:text-4xl">
            Soluciones para cada forma de trabajar
          </h2>
          <p className="mt-4 max-w-2xl text-ink-soft">
            Desde quien viene un día suelto hasta equipos que necesitan su propia oficina: elige el formato que
            encaja contigo y cámbialo cuando crezcas.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {PRODUCTS.map((p) => (
              <Link
                key={p.slug}
                href={`/contacto?interes=${p.slug}`}
                className="group overflow-hidden rounded-2xl border border-line bg-card transition-shadow hover:shadow-lg"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={p.photo}
                    alt={p.name}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex items-start justify-between gap-3 p-5">
                  <div>
                    <h3 className="font-display text-xl font-semibold">{p.name}</h3>
                    <p className="mt-1 text-sm text-ink-soft">{p.tagline}</p>
                    <p className="mt-3 text-sm font-semibold text-terracotta">{p.from}</p>
                  </div>
                  <ArrowUpRight className="size-6 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Otros servicios */}
        <section className="bg-sand-deep">
          <div className="mx-auto max-w-6xl px-4 py-14">
            <h2 className="font-display text-2xl font-semibold md:text-3xl">Otros servicios</h2>
            <div className="mt-6 flex flex-wrap gap-3">
              {EXTRA_SERVICES.map((s) => (
                <Link
                  key={s}
                  href="/contacto"
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-4 py-2 text-sm hover:border-terracotta"
                >
                  {s} <ArrowUpRight className="size-3.5" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Beneficios alternos */}
        <section className="mx-auto max-w-6xl space-y-20 px-4 py-20">
          <h2 className="max-w-2xl font-display text-3xl leading-tight font-semibold md:text-4xl">
            Por qué trabajar en {SITE.name}
          </h2>
          {BENEFITS.map((b, i) => (
            <div key={b.title} className="grid items-center gap-8 md:grid-cols-2 md:gap-14">
              <div className={i % 2 ? "md:order-2" : ""}>
                <h3 className="font-display text-2xl font-semibold">{b.title}</h3>
                <p className="mt-3 text-ink-soft">{b.text}</p>
                <ul className="mt-6 space-y-3">
                  {b.points.map((pt) => (
                    <li key={pt} className="flex gap-3 text-sm">
                      <CheckCircle2 className="size-5 shrink-0 text-sea" />
                      {pt}
                    </li>
                  ))}
                </ul>
                <Link href="/contacto" className="btn-ghost mt-7">
                  Habla con nosotros
                </Link>
              </div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
                <Image src={b.photo} alt={b.alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
              </div>
            </div>
          ))}
        </section>

        {/* Tarifas */}
        <section id="tarifas" className="scroll-mt-32 border-y border-line bg-card">
          <div className="mx-auto max-w-6xl px-4 py-20">
            <h2 className="font-display text-3xl font-semibold md:text-4xl">Tarifas</h2>
            <p className="mt-3 text-ink-soft">Sin permanencia. IVA no incluido.</p>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {plans.map((plan) => {
                const featured = plan.slug === "fijo";
                return (
                  <article
                    key={plan.id}
                    className={`flex flex-col rounded-2xl border bg-sand p-6 ${
                      featured ? "border-terracotta ring-2 ring-terracotta/20" : "border-line"
                    }`}
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
                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-sea" />
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
          </div>
        </section>

        {/* FAQ */}
        <section id="preguntas" className="mx-auto max-w-3xl scroll-mt-32 px-4 py-20">
          <h2 className="font-display text-3xl font-semibold md:text-4xl">Preguntas frecuentes</h2>
          <div className="mt-8 divide-y divide-line border-y border-line">
            {FAQS.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                  {f.q}
                  <span className="grid size-7 shrink-0 place-items-center rounded-full border border-line text-lg leading-none transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-ink-soft">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Diferencia + formulario */}
        <section id="contacto" className="scroll-mt-32 bg-ink text-sand">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-3xl font-semibold md:text-4xl">La diferencia de trabajar aquí</h2>
              <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                {DIFFERENCE.map((d) => (
                  <li key={d} className="flex gap-3">
                    <CheckCircle2 className="size-5 shrink-0 text-terracotta" />
                    {d}
                  </li>
                ))}
              </ul>
              <div className="mt-10 flex items-center gap-3 text-sm text-sand/70">
                <Coffee className="size-5 text-terracotta" />
                Ven a conocernos: el primer café corre de nuestra cuenta.
              </div>
            </div>
            <div>
              <h3 className="font-display text-2xl font-semibold">Descubre tu espacio</h3>
              <p className="mt-2 mb-6 text-sand/70">Déjanos tus datos y te enviamos disponibilidad y precios.</p>
              <LeadForm />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
