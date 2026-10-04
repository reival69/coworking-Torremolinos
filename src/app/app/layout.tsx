import { AppShell } from "@/components/app-shell";
import { requireMember } from "@/lib/auth";

export default async function MemberLayout({ children }: LayoutProps<"/app">) {
  const { profile } = await requireMember();
  const nav = [
    { href: "/app", label: "Inicio" },
    { href: "/app/reservas", label: "Reservar" },
    { href: "/app/cuenta", label: "Mi cuenta" },
  ];
  if (profile.role === "admin") nav.push({ href: "/admin", label: "Administración" });

  return (
    <AppShell profile={profile} nav={nav}>
      {children}
    </AppShell>
  );
}
