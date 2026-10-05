import type { Metadata } from "next";
import { CalendarCheck, MapPin, Phone } from "lucide-react";
import { LeadForm } from "@/components/lead-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { PRODUCTS, SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Contacto" };

export default async function ContactPage({ searchParams }: PageProps<"/contacto">) {
  const params = await searchParams;
  const interest = typeof params.interes === "string" ? params.interes : undefined;
  const product = PRODUCTS.find((p) => p.slug === interest);

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-ink text-sand">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-terracotta uppercase">Contacto</p>
            <h1 className="mt-4 font-display text-4xl font-semibold">
              {product ? `Información sobre ${product.name.toLowerCase()}` : "Hablemos de tu espacio"}
            </h1>
            <p className="mt-4 text-sand/70">
              Cuéntanos qué necesitas y te respondemos con disponibilidad y precios. Si lo prefieres, ven a vernos y
              te enseñamos el espacio.
            </p>
            <ul className="mt-8 space-y-4 text-sm">
              <li className="flex gap-3">
                <MapPin className="size-5 shrink-0 text-terracotta" />
                {SITE.address ?? SITE.city}
              </li>
              <li className="flex gap-3">
                <CalendarCheck className="size-5 shrink-0 text-terracotta" />
                {SITE.hours}
              </li>
              {SITE.phone && (
                <li className="flex gap-3">
                  <Phone className="size-5 shrink-0 text-terracotta" />
                  {SITE.phone}
                </li>
              )}
            </ul>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
            <LeadForm defaultInterest={interest} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
