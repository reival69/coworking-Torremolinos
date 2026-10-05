import Link from "next/link";
import { Briefcase, Building2, CalendarClock, Mail, Phone, Presentation, Users } from "lucide-react";
import { Logo } from "@/components/logo";
import { SITE } from "@/lib/site";

const STRIP = [
  { icon: Users, label: "Puesto flexible", href: "/#espacios" },
  { icon: Briefcase, label: "Puesto fijo", href: "/#espacios" },
  { icon: Building2, label: "Oficinas privadas", href: "/#espacios" },
  { icon: CalendarClock, label: "Salas por horas", href: "/#espacios" },
  { icon: Mail, label: "Oficina virtual", href: "/#espacios" },
  { icon: Presentation, label: "Eventos", href: "/#espacios" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Logo />
        <nav className="hidden items-center gap-1 text-sm lg:flex">
          <Link href="/#espacios" className="px-3 py-2 hover:text-terracotta">
            Espacios
          </Link>
          <Link href="/#tarifas" className="px-3 py-2 hover:text-terracotta">
            Tarifas
          </Link>
          <Link href="/#preguntas" className="px-3 py-2 hover:text-terracotta">
            Preguntas
          </Link>
          <Link href="/login" className="px-3 py-2 hover:text-terracotta">
            Área de clientes
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          {SITE.phone && (
            <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="btn-ghost px-3" aria-label="Llamar">
              <Phone className="size-4" />
            </a>
          )}
          <Link href="/contacto" className="btn bg-ink text-white hover:bg-ink/85">
            Contáctanos
          </Link>
        </div>
      </div>
      <div className="border-t border-line">
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 text-xs sm:justify-between sm:text-sm">
          {STRIP.map(({ icon: Icon, label, href }) => (
            <Link
              key={label}
              href={href}
              className="flex shrink-0 flex-col items-center gap-1 px-3 py-2.5 whitespace-nowrap text-ink-soft hover:text-terracotta"
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
