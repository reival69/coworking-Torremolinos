import { AppShell } from "@/components/app-shell";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const { profile } = await requireAdmin();
  const nav = [
    { href: "/admin", label: "Miembros" },
    { href: "/admin/reservas", label: "Reservas" },
    { href: "/admin/facturas", label: "Facturas" },
    { href: "/app", label: "Mi área" },
  ];
  return (
    <AppShell profile={profile} nav={nav}>
      {children}
    </AppShell>
  );
}
