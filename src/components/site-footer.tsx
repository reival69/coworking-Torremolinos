import Link from "next/link";
import { SITE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="bg-ink text-sand/80">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 text-sm sm:grid-cols-3">
        <div>
          <p className="font-display text-lg font-semibold text-sand">{SITE.name}</p>
          <p className="mt-2">{SITE.address ?? SITE.city}</p>
          <p>{SITE.hours}</p>
        </div>
        <div className="space-y-2">
          <p className="font-semibold text-sand">Espacios</p>
          <Link href="/#espacios" className="block hover:text-white">
            Puestos y oficinas
          </Link>
          <Link href="/#tarifas" className="block hover:text-white">
            Tarifas
          </Link>
          <Link href="/#preguntas" className="block hover:text-white">
            Preguntas frecuentes
          </Link>
        </div>
        <div className="space-y-2">
          <p className="font-semibold text-sand">Contacto</p>
          {SITE.phone && <p>{SITE.phone}</p>}
          {SITE.email && <p>{SITE.email}</p>}
          <Link href="/contacto" className="block hover:text-white">
            Solicitar información
          </Link>
          <Link href="/login" className="block hover:text-white">
            Área de clientes
          </Link>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-sand/50">
          © {new Date().getFullYear()} {SITE.name}. Fotos: Unsplash.
        </p>
      </div>
    </footer>
  );
}
