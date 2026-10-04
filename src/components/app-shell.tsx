import Link from "next/link";
import { Logo } from "@/components/logo";
import type { Profile } from "@/lib/types";

type NavItem = { href: string; label: string };

export function AppShell({ profile, nav, children }: { profile: Profile; nav: NavItem[]; children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-line bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Logo />
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-ink-soft sm:inline">{profile.full_name ?? profile.email}</span>
            <form action="/auth/signout" method="post">
              <button className="btn-ghost px-4 py-1.5">Salir</button>
            </form>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 text-sm">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="border-b-2 border-transparent px-3 py-2.5 whitespace-nowrap hover:border-terracotta"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
    </>
  );
}
