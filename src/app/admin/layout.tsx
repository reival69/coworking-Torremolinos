import { AppShell } from "@/components/app-shell";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const { profile } = await requireAdmin();
  const nav = [
    { href: "/admin", label: "Clientes" },
    { href: "/admin/reservas", label: "Reservas" },
    { href: "/admin/espacios", label: "Espacios y precios" },
    { href: "/admin/facturas", label: "Facturas" },
    { href: "/admin/contactos", label: "Contactos web" },
    { href: "/app", label: "Mi área" },
  ];
  return (
    <AppShell profile={profile} nav={nav}>
      {children}
    </AppShell>
  );
}
